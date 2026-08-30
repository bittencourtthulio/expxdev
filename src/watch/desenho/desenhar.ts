import type { Visao } from "../visao/projetar.js";
import { desenharArvore } from "./arvore.js";
import { desenharBloqueios } from "./bloqueios.js";
import { desenharCabecalho } from "./cabecalho.js";
import { criarPintor, type Pintor } from "./cor.js";
import { desenharEventos } from "./eventos.js";
import { cortar } from "./largura.js";

/**
 * O painel inteiro, como lista de linhas.
 *
 * Função PURA: recebe a visão, a largura e se há cor, e devolve texto. Não
 * toca em `process.stdout`, não lê TTY, não escreve em disco. É o que torna
 * possível testar as dez fixtures da especificação sem nenhum terminal — as
 * duas últimas (60 colunas, saída redirecionada) são justamente os parâmetros
 * `colunas` e `cor` (decisão D-11).
 */

export type OpcoesDesenho = {
  colunas: number;
  cor: boolean;
  agora: Date;
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

  if (partes.length === 0) return [];
  const papel = v.violacoesAviso > 0 ? "atencao" : "apagado";
  return [pintar(cortar(partes.join(" · "), colunas), papel)];
}

export function desenhar(v: Visao, op: OpcoesDesenho): string[] {
  const pintar = criarPintor(op.cor);
  const c = op.colunas;

  // A ordem é a prioridade da especificação: bloqueio aberto sobe para o topo,
  // acima até do cabeçalho, "porque é a informação que mais precisa de olho
  // humano e a que mais passa despercebida quando a execução é autônoma".
  const secoes = [
    desenharBloqueios(v, c, pintar, op.agora),
    desenharCabecalho(v, c, pintar),
    desenharArvore(v, c, pintar),
    desenharEventos(v, c, pintar),
    desenharRodape(v, c, pintar, op.agora),
  ].filter((s) => s.length > 0);

  // Uma linha em branco entre seções, nenhuma no fim.
  return secoes.flatMap((s, i) => (i === 0 ? s : ["", ...s]));
}
