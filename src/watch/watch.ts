import { existsSync } from "node:fs";
import { join } from "node:path";
import { desenhar } from "./desenho/desenhar.js";
import { desenharLista } from "./desenho/lista.js";
import { lerEstadoExpx } from "./fontes/estado.js";
import { observarFontes, type ObservadorFontes } from "./fontes/observar.js";
import { lerRastro } from "./fontes/rastro.js";
import type { Opcoes } from "./opcoes.js";
import { criarTela, type Tela } from "./terminal/tela.js";
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
  const tela: Tela = criarTela(op.escrever);

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
    const linhas = op.opcoes.todos
      ? desenharLista(visao, colunas, op.cor)
      : desenhar(visao, { colunas, cor: op.cor, agora: new Date() });
    tela.desenhar(linhas);
  }

  redesenhar();

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
      await observador.parar();
    },
    codigo: 0,
    encerrou: false,
  };
}
