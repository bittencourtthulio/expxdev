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
  /**
   * Chaves que o esquema aceita mas que NÃO estavam no arquivo (R6).
   *
   * O parse normaliza — `.optional()` some, `.default([])` inventa `[]` — e
   * depois dele não dá mais para distinguir "veio null" de "nem veio". Quem
   * quiser cobrar a R6 precisa desta lista, colhida enquanto o dado cru ainda
   * existe. Caminho no formato do `linhas`: `tasks.0.criterio_aceite`.
   */
  omitidas: string[];
};

export type Resultado = Aceito | Rejeicao;

/**
 * Chaves que a R6 exige presentes mesmo quando o valor é `null`.
 *
 * São exatamente as que o esquema afrouxa com `.optional()` ou `.default([])`
 * — o afrouxamento existe para o arquivo ser ACEITO (D-04), e esta lista existe
 * para o defeito ainda assim aparecer. Campo que o esquema já exige não entra
 * aqui: a ausência dele nem chega a este ponto.
 */
const EXIGIDAS_POR_KIND: Partial<Record<Kind, readonly string[]>> = {
  // `tasks` e `fases` não entram aqui: nesses dois kinds os campos cobrados
  // vivem DENTRO de cada item da lista, e são cobrados por EXIGIDAS_EM_ITEM.
  // Cobrá-los também na raiz acusa toda task correta do mundo.
  orquestrador: ["sprints", "caminho_critico"],
  sprint: ["criterio_saida", "fases", "riscos"],
  bloqueios: ["bloqueios"],
  decisoes: ["decisoes"],
};

/** As chaves de item que a R6 cobra dentro de cada elemento de uma lista. */
const EXIGIDAS_EM_ITEM: Partial<Record<Kind, readonly string[]>> = {
  tasks: ["teste_integracao", "teste_funcional", "criterio_aceite", "depende_de"],
  fases: ["criterio_saida", "paralela_com", "tasks"],
};

/** A lista que carrega os itens de cada kind, quando há uma. */
const LISTA_DO_KIND: Partial<Record<Kind, string>> = {
  tasks: "tasks",
  fases: "fases",
};

function colherOmitidas(kind: Kind, cru: unknown): string[] {
  if (typeof cru !== "object" || cru === null) return [];
  const raiz = cru as Record<string, unknown>;
  const fora: string[] = [];

  for (const chave of EXIGIDAS_POR_KIND[kind] ?? []) {
    // `in` distingue ausência de `null` — que é justamente o ponto da R6.
    if (!(chave in raiz)) fora.push(chave);
  }

  const nomeLista = LISTA_DO_KIND[kind];
  const exigidasItem = EXIGIDAS_EM_ITEM[kind];
  if (nomeLista && exigidasItem) {
    const itens = raiz[nomeLista];
    if (Array.isArray(itens)) {
      itens.forEach((item, i) => {
        if (typeof item !== "object" || item === null) return;
        const m = item as Record<string, unknown>;
        for (const chave of exigidasItem) {
          if (!(chave in m)) fora.push(`${nomeLista}.${i}.${chave}`);
        }
      });
    }
  }

  return fora;
}

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
    omitidas: colherOmitidas(kind, leitura.dados),
    corpo: leitura.corpo,
    linhas: leitura.linhas,
  };
}
