import type { Visao } from "../visao/projetar.js";
import { desenharArvore } from "./arvore.js";
import { barra, decorrido, papelDaBarra, percentual } from "./barra.js";
import { desenharBloqueios } from "./bloqueios.js";
import { criarPintor, type Pintor } from "./cor.js";
import { cortar, largura, preencher } from "./largura.js";
import { blocoTrabalho, desenharAtividade } from "./painel.js";

/**
 * O painel inteiro, como lista de linhas.
 *
 * Função PURA: recebe a visão, a largura e se há cor, e devolve texto. Não
 * toca em `process.stdout`, não lê TTY, não escreve em disco. É o que torna
 * possível testar as fixtures da especificação sem nenhum terminal — as duas
 * últimas (60 colunas, saída redirecionada) são justamente os parâmetros
 * `colunas` e `cor` (decisão D-11).
 *
 * A ordem da tela é a ordem da urgência:
 *   1. bloqueios abertos, que exigem decisão humana;
 *   2. a régua do projeto, uma linha só;
 *   3. a frota: cada trabalho com sua barra e suas tasks correndo;
 *   4. a atividade recente, agrupada;
 *   5. o rodapé de saúde da execução.
 */

export type OpcoesDesenho = {
  colunas: number;
  cor: boolean;
  agora: Date;
  /** `--arvore`: mostra a árvore completa do trabalho corrente. */
  arvore?: boolean;
};

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/** "há 3 min", "há 2 h", "há 4 d" — curto, porque é rodapé. */
function desde(quando: Date, agora: Date): string {
  const ms = Math.max(0, agora.getTime() - quando.getTime());
  if (ms < MINUTO) return "há instantes";
  if (ms < HORA) return `há ${String(Math.floor(ms / MINUTO))} min`;
  if (ms < DIA) return `há ${String(Math.floor(ms / HORA))} h`;
  return `há ${String(Math.floor(ms / DIA))} d`;
}

/**
 * A régua do projeto: uma linha dizendo onde o conjunto todo está.
 *
 * Somar as tasks de todos os trabalhos abertos é a única pergunta que a tela
 * antiga não respondia de jeito nenhum — "quanto falta no geral" exigia somar
 * de cabeça as linhas de progresso de cada ocorrência.
 */
function desenharRegua(v: Visao, colunas: number, pintar: Pintor): string[] {
  if (v.frota.length === 0) return [];

  const feitas = v.frota.reduce((s, t) => s + t.concluidas, 0);
  const total = v.frota.reduce((s, t) => s + t.total, 0);
  const emCurso = v.frota.filter((t) => t.ativas.length > 0).length;
  const paralelas = v.frota.reduce((s, t) => s + t.ativas.length, 0);

  const n = v.frota.length;
  const quantos = n === 1 ? "1 trabalho" : `${String(n)} trabalhos`;
  const detalhe =
    paralelas > 1
      ? `${quantos} · ${String(emCurso)} em curso · ${String(paralelas)} tasks em paralelo`
      : `${quantos} · ${String(emCurso)} em curso`;

  const b = barra(feitas, total, 20);
  const contagem = `${String(feitas)}/${String(total)} tasks`;
  const pct = percentual(feitas, total);

  const linhas: string[] = [];

  if (colunas < 52) {
    linhas.push(pintar(cortar(`${contagem} · ${pct}`, colunas), papelDaBarra(feitas, total)));
    linhas.push(pintar(cortar(detalhe, colunas), "apagado"));
    return linhas;
  }

  const esq = `  ${b} ${preencher(contagem, 12)} ${pct}`;
  const sobra = colunas - largura(esq) - largura(detalhe) - 2;

  linhas.push(
    "  " +
      pintar(b, papelDaBarra(feitas, total)) +
      " " +
      pintar(preencher(contagem, 12), "neutro") +
      " " +
      pintar(pct, "apagado") +
      (sobra >= 1 ? " ".repeat(sobra + 2) + pintar(detalhe, "apagado") : ""),
  );

  return linhas;
}

/** O rodapé: saúde da execução em uma linha. */
function desenharRodape(v: Visao, colunas: number, pintar: Pintor, agora: Date): string[] {
  const partes: string[] = [];

  // Tempo desde o último evento: "se passar muito, a execução travou".
  const ultimo = v.eventos[0];
  if (ultimo !== undefined) {
    partes.push(`ultimo evento ${desde(new Date(ultimo.ts), agora)}`);
  }

  // Violações em modo aviso acumuladas na sessão (D-07).
  if (v.violacoesAviso > 0) {
    const n = v.violacoesAviso;
    partes.push(n === 1 ? "1 violacao em aviso" : `${String(n)} violacoes em aviso`);
  }

  if (v.degradado) partes.push("sem estado.json: lendo o plano");

  if (partes.length === 0) return [];
  const papel = v.violacoesAviso > 0 ? "atencao" : "apagado";
  return [pintar(cortar(partes.join(" · "), colunas), papel)];
}

/** O tempo desde que o watch subiu, para quem deixa a tela aberta. */
export function desenhar(v: Visao, op: OpcoesDesenho): string[] {
  const pintar = criarPintor(op.cor);
  const c = op.colunas;

  if (v.frota.length === 0) {
    return [pintar(cortar("nenhum trabalho aberto", c), "apagado")];
  }

  // A ordem é a prioridade da especificação: bloqueio aberto sobe para o topo,
  // "porque é a informação que mais precisa de olho humano e a que mais passa
  // despercebida quando a execução é autônoma".
  const secoes: string[][] = [
    desenharBloqueios(v, c, pintar, op.agora),
    desenharRegua(v, c, pintar),
  ];

  // Cada trabalho é um bloco. O corrente vem primeiro (a frota já vem ordenada).
  for (const t of v.frota) secoes.push(blocoTrabalho(t, c, pintar, op.agora, v.estado));

  // `--arvore`: a árvore completa do trabalho corrente, para quem quer o detalhe.
  if (op.arvore === true) secoes.push(desenharArvore(v, c, pintar));

  secoes.push(desenharAtividade(v, c, pintar));
  secoes.push(desenharRodape(v, c, pintar, op.agora));

  const cheias = secoes.filter((s) => s.length > 0);

  // Uma linha em branco entre seções, nenhuma no fim.
  return cheias.flatMap((s, i) => (i === 0 ? s : ["", ...s]));
}

/** Reexportado para quem desenha o cabeçalho fora do painel. */
export { decorrido };
