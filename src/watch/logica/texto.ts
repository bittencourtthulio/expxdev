/**
 * Corte de texto para caber na coluna — o que separa uma tela de um amontoado.
 *
 * O painel usava `<Box flexGrow={1}/>` como espaçador para empurrar valores
 * à direita. Funciona com espaço sobrando; sem espaço, o Ink QUEBRA a palavra
 * no meio e continua na linha seguinte. Numa faixa lateral de terminal isso
 * produzia "31/6" numa linha e "8" na outra, "34m22" e "s", "traba" e "lho" —
 * a informação some no atropelo.
 *
 * A regra que este módulo aplica: em coluna estreita, texto longo é CORTADO
 * com reticência, nunca quebrado. Um título cortado continua legível ("Corrigir
 * a faixa acima…"); um título quebrado no meio de uma palavra não.
 */

/** A reticência de um caractere — gasta uma coluna, não três. */
const RETICENCIA = "…";

/**
 * Corta `texto` para caber em `colunas`, com reticência quando sobra.
 *
 * `colunas <= 0` devolve vazio: pedir para caber em zero é o caso de tela
 * espremida além do útil, e devolver o texto inteiro faria o layout vazar.
 */
export function cortar(texto: string, colunas: number): string {
  if (colunas <= 0) return "";
  const t = [...texto];
  if (t.length <= colunas) return texto;
  if (colunas === 1) return RETICENCIA;
  return t.slice(0, colunas - 1).join("").trimEnd() + RETICENCIA;
}

/**
 * Preenche `texto` até `colunas` com espaços à direita, cortando se passar.
 *
 * É o que permite alinhar uma coluna sem espaçador flexível: o texto ocupa
 * exatamente a largura reservada, e o que vem depois começa sempre na mesma
 * posição — inclusive quando o texto é curto demais ou longo demais.
 */
export function preencher(texto: string, colunas: number): string {
  if (colunas <= 0) return "";
  const cortado = cortar(texto, colunas);
  return cortado + " ".repeat(Math.max(0, colunas - [...cortado].length));
}

/**
 * Monta uma linha de "rótulo à esquerda, valor à direita" numa largura fixa.
 *
 * Substitui o par `<Text>` + `<Box flexGrow={1}/>` + `<Text>`, que era a
 * fonte das quebras. Aqui a conta é explícita: o valor tem prioridade (é o
 * dado), o rótulo cede espaço, e se nem o valor couber, ele é cortado — mas
 * ninguém quebra linha.
 */
export function esquerdaDireita(esquerda: string, direita: string, colunas: number): string {
  if (colunas <= 0) return "";

  const d = [...direita];
  // O valor da direita não é cortado enquanto couber na metade: é o dado que
  // a pessoa procura, e "45%" cortado para "4…" não informa nada.
  const espacoDireita = Math.min(d.length, Math.max(0, colunas - 2));
  const direitaFinal = cortar(direita, espacoDireita);
  const larguraDireita = [...direitaFinal].length;

  // Ao menos um espaço separando os dois lados.
  const espacoEsquerda = Math.max(0, colunas - larguraDireita - 1);
  const esquerdaFinal = cortar(esquerda, espacoEsquerda);
  const larguraEsquerda = [...esquerdaFinal].length;

  const meio = Math.max(1, colunas - larguraEsquerda - larguraDireita);
  return esquerdaFinal + " ".repeat(meio) + direitaFinal;
}
