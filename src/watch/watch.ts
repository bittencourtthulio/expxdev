import { existsSync } from "node:fs";
import { join } from "node:path";
import { desenhar } from "./desenho/desenhar.js";
import { desenharLista } from "./desenho/lista.js";
import { lerEstadoExpx } from "./fontes/estado.js";
import { observarFontes, type ObservadorFontes } from "./fontes/observar.js";
import { lerRastro } from "./fontes/rastro.js";
import type { Opcoes } from "./opcoes.js";
import { criarTela, type LimitesTela, type Tela } from "./terminal/tela.js";
import { projetarVisao, type Visao } from "./visao/projetar.js";

/**
 * O loop do watch: lê, desenha, observa, redesenha.
 *
 * A promessa que este arquivo existe para cumprir: "a árvore completa vem dos
 * arquivos do plano, relida apenas quando eles mudam — não a cada redesenho".
 * Por isso a visão é guardada e só o gatilho de plano a reconstrói; o gatilho
 * de estado atualiza o barato e redesenha com a árvore que já estava em mãos.
 */

export type SessaoWatch = {
  parar: () => Promise<void>;
  /** Código de saída, quando o watch terminou sozinho. */
  codigo: number;
  /** O watch encerrou por conta própria (projeto sem Expx)? */
  encerrou: boolean;
};

export type OpcoesExecucao = {
  raiz: string;
  opcoes: Opcoes;
  escrever: (texto: string) => void;
  cor: boolean;
  debounceMs?: number;
  /** Intervalo do redesenho por relógio. `0` desliga (teste). */
  pulsoMs?: number;
  /** Gancho de teste: chamado toda vez que o PLANO é relido do disco. */
  aoLerPlano?: () => void;
};

/** Largura de trabalho: a do terminal, o pedido explícito, ou 80. */
function larguraDe(op: OpcoesExecucao): number {
  if (op.opcoes.colunas !== undefined) return op.opcoes.colunas;
  const cols = process.stdout.columns;
  // Abaixo de 80 continuamos desenhando: o corte é elegante por construção.
  return typeof cols === "number" && cols > 0 ? cols : 80;
}

/** Altura de trabalho: a do terminal, ou um valor generoso quando não há TTY. */
function alturaDe(): number {
  const linhas = process.stdout.rows;
  // Sem TTY (teste, redirecionamento) nada rola: a altura não limita.
  return typeof linhas === "number" && linhas > 0 ? linhas : Number.MAX_SAFE_INTEGER;
}

/**
 * De quanto em quanto tempo a tela se redesenha sozinha.
 *
 * O watch é movido a evento de arquivo, mas duas coisas na tela andam com o
 * relógio e não com o disco: o tempo decorrido das tasks em andamento e a
 * barra de atividade. Sem este pulso, uma task que roda dez minutos mostraria
 * "0s" o tempo todo — e "parado ha 40 min", que é o sintoma de execução
 * travada, nunca apareceria.
 */
const PULSO_MS = 1000;

export async function executarWatch(op: OpcoesExecucao): Promise<SessaoWatch> {
  // Sem `.expx/`, o projeto não tem o Expx instalado. Mensagem curta e saída
  // limpa, como manda a tolerância a falha — não é erro, é ausência.
  if (!existsSync(join(op.raiz, ".expx"))) {
    op.escrever(
      [
        "este projeto nao tem o Expx instalado (falta a pasta .expx/).",
        "",
        "  npx expxdev init      instala as skills neste projeto",
        "",
      ].join("\n"),
    );
    return { parar: async () => undefined, codigo: 0, encerrou: true };
  }

  const subiuEm = new Date();
  const colunas = larguraDe(op);

  // A tela recebe os limites do terminal como FUNÇÃO, não como número: quem
  // redimensiona a janela no meio da execução muda os dois, e uma tela presa
  // à largura da subida passa a desenhar linhas que não cabem — que é
  // exatamente o que embaralhava o painel.
  const limites = (): LimitesTela => ({
    colunas: op.opcoes.colunas ?? larguraDe(op),
    linhas: alturaDe(),
  });
  const tela: Tela = criarTela(op.escrever, limites);

  // A visão fica guardada de propósito: é ela que carrega a árvore, cara de
  // montar. O gatilho de estado NÃO a reconstrói.
  let visao: Visao = lerTudo();

  function lerTudo(): Visao {
    op.aoLerPlano?.();
    return projetarVisao(op.raiz, {
      ...(op.opcoes.trabalho !== undefined ? { trabalhoPedido: op.opcoes.trabalho } : {}),
      subiuEm,
    });
  }

  function redesenhar(): void {
    const c = op.opcoes.colunas ?? larguraDe(op);
    const linhas = op.opcoes.todos
      ? desenharLista(visao, c, op.cor)
      : desenhar(visao, {
          colunas: c,
          cor: op.cor,
          agora: new Date(),
          arvore: op.opcoes.arvore,
        });
    tela.desenhar(linhas);
  }

  redesenhar();

  // O pulso do relógio. `unref` para não segurar o processo sozinho: quem
  // mantém o watch vivo é o observador de arquivos, e um timer que segura o
  // event loop faria o processo não morrer depois do `parar()`.
  const pulso = op.pulsoMs ?? PULSO_MS;
  const relogio = pulso > 0 ? setInterval(redesenhar, pulso) : null;
  relogio?.unref();

  // Redimensionar a janela muda a largura E a altura: sem redesenhar aqui, a
  // tela fica com as linhas da largura antiga até o próximo evento de arquivo.
  const aoRedimensionar = (): void => {
    redesenhar();
  };
  process.stdout.on("resize", aoRedimensionar);

  const observador: ObservadorFontes = await observarFontes(
    op.raiz,
    {
      // O plano mudou: reconstrói tudo. É a releitura cara, e ela só acontece
      // aqui.
      aoMudarPlano: () => {
        visao = lerTudo();
        redesenhar();
      },
      // Só o estado.json mudou: atualiza o barato e redesenha com a árvore
      // que já estava em mãos.
      aoMudarEstado: () => {
        const estado = lerEstadoExpx(op.raiz);
        visao = { ...visao, estado, degradado: estado === null };
        redesenhar();
      },
      // Só o rastro cresceu: relê os eventos, que é leitura de cauda, e
      // preserva a árvore. É o caminho mais percorrido durante uma execução
      // autônoma — cada hook grava uma linha.
      aoMudarRastro: () => {
        if (visao.trabalho === null) return;
        const eventos = lerRastro(op.raiz, visao.trabalho.trabalho_id);
        const fronteira = subiuEm.toISOString().replace(/\.\d{3}Z$/, "Z");
        visao = {
          ...visao,
          eventos,
          violacoesAviso: eventos.filter((e) => e.evento === "regra_violada" && e.ts >= fronteira)
            .length,
        };
        redesenhar();
      },
    },
    op.debounceMs ?? 150,
  );

  return {
    parar: async () => {
      if (relogio !== null) clearInterval(relogio);
      process.stdout.off("resize", aoRedimensionar);
      await observador.parar();
    },
    codigo: 0,
    encerrou: false,
  };
}
