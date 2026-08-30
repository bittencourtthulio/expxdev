import type { TrabalhoMontado } from "../../parser/projeto/montar.js";
import type { EstadoExpx } from "../fontes/estado-schema.js";

/**
 * Qual trabalho o watch segue.
 *
 * O `estado.json` responde isso direto, no campo `trabalho`. O problema é o
 * modo degradado: nenhum campo do plano marca um trabalho como "o atual"
 * (lacuna L-01). A decisão D-05 fixou a derivação, e ela mora aqui.
 *
 * A ordem de precedência é deliberada:
 *
 *  1. o id que a pessoa pediu na linha de comando — se ela nomeou, é esse;
 *  2. o `trabalho` do `estado.json`, quando ele existe e é válido;
 *  3. a derivação do plano: `em_andamento`, desempatado por `atualizado_em`.
 */

/** Trabalho aberto é todo status diferente de `concluido` (decisão D-16). */
export function abertos(trabalhos: readonly TrabalhoMontado[]): TrabalhoMontado[] {
  return trabalhos.filter((t) => t.status !== "concluido");
}

/** O mais recentemente atualizado. Empate de data mantém a ordem recebida. */
function maisRecente(lista: readonly TrabalhoMontado[]): TrabalhoMontado | null {
  let melhor: TrabalhoMontado | null = null;
  for (const t of lista) {
    // `atualizado_em` é AAAA-MM-DD (R4): comparação lexicográfica é cronológica
    if (melhor === null || t.atualizado_em > melhor.atualizado_em) melhor = t;
  }
  return melhor;
}

export function escolherTrabalho(
  trabalhos: readonly TrabalhoMontado[],
  estado: EstadoExpx | null,
  pedido?: string,
): TrabalhoMontado | null {
  const por = (id: string): TrabalhoMontado | null =>
    trabalhos.find((t) => t.trabalho_id === id) ?? null;

  // 1. `expx watch <trabalho_id>`: a pessoa mandou, acabou a discussão.
  if (pedido !== undefined && pedido !== "") return por(pedido);

  // 2. O estado.json, quando pôde ser lido.
  if (estado?.trabalho != null) {
    const doEstado = por(estado.trabalho);
    // O estado pode apontar um trabalho que não está no disco observado
    // (pasta apagada, outro repositório). Nesse caso a derivação assume.
    if (doEstado !== null) return doEstado;
  }

  // 3. Derivação do plano (D-05): entre os em andamento, o mais recente.
  const emAndamento = trabalhos.filter((t) => t.status === "em_andamento");
  if (emAndamento.length > 0) return maisRecente(emAndamento);

  // Nenhum em andamento: o mais recente entre os abertos ainda é melhor
  // resposta que nada — um trabalho bloqueado é exatamente o que a pessoa
  // precisa ver.
  const aberto = maisRecente(abertos(trabalhos));
  if (aberto !== null) return aberto;

  // Nada aberto, mas existe trabalho concluído? Mostramos o mais recente.
  // "Nenhum trabalho aberto" (D-19) é sobre a LISTA de acompanhamento; abrir o
  // watch num projeto cujo único trabalho acabou de fechar e ver a tela vazia
  // seria esconder justamente o que a pessoa quer conferir.
  return maisRecente(trabalhos);
}
