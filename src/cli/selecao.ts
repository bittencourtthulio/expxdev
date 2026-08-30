import { buscarNoCatalogo, ehCamada } from "../nucleo/catalogo.js";

/**
 * As regras da seleção de skills, aplicadas na hora — avisando sem impedir.
 *
 * O método é deliberado aqui: uma combinação incomum pode ser exatamente o que
 * a pessoa quer. O CLI explica a consequência e pede confirmação; não decide
 * pela pessoa nem recusa a instalação.
 *
 * Nome fora do catálogo é outra coisa: aí não há o que instalar, e o erro é
 * definitivo.
 */

export type Avaliacao = {
  permitido: boolean;
  precisaConfirmar: boolean;
  avisos: string[];
  erros: string[];
  /** Skills cuja integração com as demais selecionadas está disponível. */
  integracoes: string[];
};

const BASES = ["sprintx", "runx"];

export function avaliarSelecao(selecao: readonly string[]): Avaliacao {
  const avisos: string[] = [];
  const erros: string[] = [];
  const integracoes: string[] = [];

  for (const nome of selecao) {
    if (buscarNoCatalogo(nome) === undefined) erros.push(`skill desconhecida: ${nome}`);
  }
  if (selecao.length === 0) erros.push("nenhuma skill selecionada");

  const temBase = selecao.some((s) => BASES.includes(s));
  const camadas = selecao.filter((s) => ehCamada(s));

  if (camadas.length > 0 && !temBase) {
    avisos.push(
      `${camadas.join(" e ")} ${camadas.length > 1 ? "sao camadas" : "e camada"}: sozinha${camadas.length > 1 ? "s" : ""} nao faz${camadas.length > 1 ? "em" : ""} nada. Instale sprintx ou runx junto.`,
    );
  }
  if (selecao.includes("mergex") && temBase) integracoes.push("mergex");
  // o prodx entrega o BRIEFING.md que a sprintx lê na F1 e a runx vira 00-OCORRENCIA.md
  if (selecao.includes("prodx") && temBase) integracoes.push("prodx");

  return {
    permitido: erros.length === 0,
    precisaConfirmar: avisos.length > 0,
    avisos,
    erros,
    integracoes,
  };
}
