import type { IndiceCru } from "./ler.js";
import type {
  ArquivoDeRisco,
  Coincidencia,
  Contaminado,
  Entrada,
  Memoria,
  Modulo,
  Regressao,
} from "./tipos.js";

/**
 * Reduz o índice cru à projeção que o painel serve.
 *
 * Duas chaves do índice NÃO entram (decisão D-04):
 *
 *   `por_termo`  índice invertido para a busca textual do motor. O painel
 *                difunde o estado inteiro a cada mudança de arquivo (D-28),
 *                então carregá-lo multiplicaria cada difusão sem ganho.
 *   `trabalhos`  o registro completo de cada trabalho, que o painel já monta
 *                por conta própria varrendo `docs/relatorios/`.
 *
 * Toda derivação — ordenar, contar, classificar — acontece AQUI e não na tela:
 * `ui/src/tipos.ts` declara que a UI não recalcula nada (D-09).
 */

function texto(v: unknown): string | null {
  return typeof v === "string" && v !== "" ? v : null;
}

function numero(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function entradasDe(lista: unknown): Entrada[] {
  if (!Array.isArray(lista)) return [];
  return lista.map((e) => {
    const o = (e ?? {}) as Record<string, unknown>;
    return {
      trabalho_id: texto(o["trabalho_id"]) ?? "",
      titulo: texto(o["titulo"]),
      data: texto(o["data"]),
      tipo: texto(o["tipo"]),
      ferramenta: texto(o["ferramenta"]),
      causa: texto(o["causa"]),
      papel: texto(o["papel"]) ?? "",
      artefato: texto(o["artefato"]) ?? "",
    };
  });
}

function regressoesDe(lista: unknown): Regressao[] {
  if (!Array.isArray(lista)) return [];
  return lista.map((r) => {
    const o = (r ?? {}) as Record<string, unknown>;
    return {
      arquivos: Array.isArray(o["arquivos"]) ? (o["arquivos"] as string[]) : [],
      trabalho_anterior: texto(o["trabalho_anterior"]) ?? "",
      data_anterior: texto(o["data_anterior"]),
      trabalho_posterior: texto(o["trabalho_posterior"]) ?? "",
      data_posterior: texto(o["data_posterior"]),
      evidencia: texto(o["evidencia"]) ?? "",
      origem_causa: texto(o["origem_causa"]),
      origem_alteracao: texto(o["origem_alteracao"]),
    };
  });
}

/**
 * Ordena por RISCO, não por movimento (decisão D-10).
 *
 * A ordem é: regressões, depois reprovações de QA, depois número de trabalhos.
 * Ordenar só por contagem de trabalhos colocaria o arquivo central no topo —
 * ele é tocado por dezenas de trabalhos sem nunca ter falhado, e enterraria
 * embaixo dele o arquivo que já quebrou duas vezes.
 */
function compararRisco(a: ArquivoDeRisco, b: ArquivoDeRisco): number {
  if (a.regressoes !== b.regressoes) return b.regressoes - a.regressoes;
  if (a.reprovacoes_qa !== b.reprovacoes_qa) return b.reprovacoes_qa - a.reprovacoes_qa;
  if (a.trabalhos !== b.trabalhos) return b.trabalhos - a.trabalhos;
  return a.arquivo.localeCompare(b.arquivo);
}

export function projetar(indice: IndiceCru): Memoria {
  const sinaisArquivo = (indice.sinais?.arquivo ?? {}) as Record<string, Record<string, unknown>>;
  const sinaisModulo = (indice.sinais?.modulo ?? {}) as Record<string, Record<string, unknown>>;
  const porArquivo = indice.por_arquivo ?? {};

  const arquivos_de_risco: ArquivoDeRisco[] = Object.entries(sinaisArquivo).map(([arquivo, s]) => {
    const zona = s["zona_de_risco"] as Record<string, unknown> | null | undefined;
    const divida = s["divida"] as Record<string, unknown> | null | undefined;
    return {
      arquivo,
      trabalhos: numero(s["trabalhos"]),
      ultimo_trabalho_em: texto(s["ultimo_trabalho_em"]),
      reprovacoes_qa: numero(s["reprovacoes_qa"]),
      regressoes: Array.isArray(s["regressoes"]) ? s["regressoes"].length : 0,
      zona_de_risco: zona ? texto(zona["motivo"]) : null,
      divida: divida ? texto(divida["descricao"]) : null,
      risco_divida: divida ? texto(divida["risco"]) : null,
      faixa_atencao: texto(s["faixa_atencao_frequente"]),
      entradas: entradasDe(porArquivo[arquivo]),
    };
  });
  arquivos_de_risco.sort(compararRisco);

  const modulos: Modulo[] = Object.entries(sinaisModulo).map(([modulo, s]) => ({
    modulo,
    trabalhos: numero(s["trabalhos"]),
    ultimo_trabalho_em: texto(s["ultimo_trabalho_em"]),
    reprovacoes_qa: numero(s["reprovacoes_qa"]),
    regressoes: Array.isArray(s["regressoes"]) ? s["regressoes"].length : 0,
    arquivos: Array.isArray(s["arquivos"]) ? (s["arquivos"] as string[]) : [],
  }));
  modulos.sort((a, b) => b.regressoes - a.regressoes || a.modulo.localeCompare(b.modulo));

  const coincidencias: Coincidencia[] = Array.isArray(indice.coincidencias_arquivo)
    ? indice.coincidencias_arquivo.map((c) => {
        const o = (c ?? {}) as Record<string, unknown>;
        return {
          arquivos: Array.isArray(o["arquivos"]) ? (o["arquivos"] as string[]) : [],
          trabalhos: Array.isArray(o["trabalhos"]) ? (o["trabalhos"] as string[]) : [],
          motivo: texto(o["motivo"]) ?? "",
        };
      })
    : [];

  const contaminados: Contaminado[] = Object.entries(indice.artefatos_contaminados ?? {}).map(
    ([artefato, tipos]) => ({ artefato, tipos: Array.isArray(tipos) ? tipos : [] }),
  );

  const t = indice.totais ?? {};
  return {
    gerado_em: texto(indice.gerado_em) ?? "",
    versao: indice.versao,
    totais: {
      trabalhos: numero(t["trabalhos"]),
      arquivos: numero(t["arquivos"]),
      modulos: numero(t["modulos"]),
      regressoes: numero(t["regressoes"]),
      coincidencias: numero(t["coincidencias"]),
      artefatos_contaminados: numero(t["artefatos_contaminados"]),
    },
    arquivos_de_risco,
    regressoes: regressoesDe(indice.regressoes),
    coincidencias,
    contaminados,
    modulos,
  };
}
