import { lerFrontmatter } from "./frontmatter.js";
import { esquemaDoKind } from "../esquema/kinds.js";
import { Kind, VERSAO_SUPORTADA, lerKind, lerVersao } from "../esquema/cabecalho.js";

/**
 * Rejeição x violação (decisões D-03 e D-04).
 *
 * REJEIÇÃO é falha de leitura: o arquivo não pôde ser interpretado como
 * estado válido, então ele não entra no painel — vai para a tela "fora do
 * schema" com o motivo. VIOLAÇÃO é outra coisa: o arquivo foi lido, entrou
 * no painel, e o conteúdo desobedece uma regra do método. Ver conformidade/.
 *
 * Chave obrigatória ausente é VIOLAÇÃO, não rejeição, desde que o kind seja
 * identificável — o painel existe para mostrar o defeito, não para esconder
 * o arquivo (D-04).
 */

export const MotivoRejeicao = {
  SemFrontmatter: "sem frontmatter valido",
  YamlInvalido: "YAML invalido",
  KindDesconhecido: "kind desconhecido",
  VersaoFutura: "versao de schema futura",
  VersaoAusente: "expx_schema ausente ou nao numerico",
  EstruturaInvalida: "estrutura incompativel com o kind",
} as const;

export type MotivoRejeicao = (typeof MotivoRejeicao)[keyof typeof MotivoRejeicao];

export type Rejeicao = {
  tipo: "rejeitado";
  arquivo: string;
  motivo: MotivoRejeicao;
  detalhe: string;
  linha: number | null;
};

export type Aceito = {
  tipo: "aceito";
  arquivo: string;
  kind: Kind;
  dados: Record<string, unknown>;
  corpo: string;
  linhas: Map<string, number>;
};

export type Resultado = Aceito | Rejeicao;

function rejeitar(
  arquivo: string,
  motivo: MotivoRejeicao,
  detalhe: string,
  linha: number | null = null,
): Rejeicao {
  return { tipo: "rejeitado", arquivo, motivo, detalhe, linha };
}

/**
 * Lê um arquivo candidato e devolve SEMPRE aceito ou rejeitado — nunca lança.
 * É a garantia de que nenhum arquivo do projeto observado derruba o servidor.
 */
export function classificar(arquivo: string, conteudo: string): Resultado {
  let leitura;
  try {
    leitura = lerFrontmatter(conteudo);
  } catch (e) {
    // rede de segurança: nem o parser de YAML deve conseguir derrubar o painel
    return rejeitar(arquivo, MotivoRejeicao.YamlInvalido, String(e), null);
  }

  if (!leitura.ok) {
    const motivo =
      leitura.tipo === "sem_frontmatter"
        ? MotivoRejeicao.SemFrontmatter
        : MotivoRejeicao.YamlInvalido;
    return rejeitar(arquivo, motivo, leitura.motivo, leitura.linha);
  }

  const versao = lerVersao(leitura.dados);
  if (versao === null) {
    return rejeitar(
      arquivo,
      MotivoRejeicao.VersaoAusente,
      "o arquivo nao declara expx_schema",
      leitura.linhas.get("expx_schema") ?? null,
    );
  }
  if (versao > VERSAO_SUPORTADA) {
    return rejeitar(
      arquivo,
      MotivoRejeicao.VersaoFutura,
      `arquivo gravado no schema ${versao}; este painel le ate o ${VERSAO_SUPORTADA}. Atualize o painel.`,
      leitura.linhas.get("expx_schema") ?? null,
    );
  }

  const kind = lerKind(leitura.dados);
  if (kind === null) {
    const bruto = (leitura.dados as Record<string, unknown>)?.["kind"];
    return rejeitar(
      arquivo,
      MotivoRejeicao.KindDesconhecido,
      `kind ${JSON.stringify(bruto)} nao existe no contrato`,
      leitura.linhas.get("kind") ?? null,
    );
  }

  const r = esquemaDoKind(kind).safeParse(leitura.dados);
  if (!r.success) {
    const primeiro = r.error.issues[0];
    const caminho = primeiro?.path.join(".") ?? "";
    return rejeitar(
      arquivo,
      MotivoRejeicao.EstruturaInvalida,
      `${caminho ? caminho + ": " : ""}${primeiro?.message ?? "estrutura invalida"}`,
      leitura.linhas.get(caminho) ?? leitura.linhas.get("kind") ?? null,
    );
  }

  return {
    tipo: "aceito",
    arquivo,
    kind,
    dados: r.data as Record<string, unknown>,
    corpo: leitura.corpo,
    linhas: leitura.linhas,
  };
}
