import { basename, dirname } from "node:path";
import { varrerCandidatos } from "./varredura.js";
import { lerArquivoDeEstado } from "../leitura/arquivo.js";
import { descobrirEmBranches, branchAtiva } from "./git.js";
import type { Rejeicao, Aceito } from "../leitura/rejeicao.js";
import type { ExpxTool, Estagio, StatusTrabalho, TipoTrabalho, TipoOcorrencia } from "../esquema/enums.js";

/**
 * Separador entre a branch e o caminho, no `arquivo`/`pasta` virtual de um
 * trabalho descoberto via git (OC-2026-002 / T-01.05). Nunca aparece num
 * caminho de filesystem real, então não colide com a chave de `mapa` que
 * `montarSprints` usa para achar as sprints de um trabalho.
 */
export const SEPARADOR_BRANCH = "::";

/**
 * Um trabalho é qualquer pasta com um `ORQUESTRADOR.md` de frontmatter válido.
 * A regra é sobre o CONTEÚDO, não sobre o caminho: o layout `docs/<slug>/` e
 * `docs/manutencao/<id>-<slug>/` descreve onde as skills gravam, não uma
 * restrição de busca.
 *
 * Pasta sem ORQUESTRADOR **nem** `00-OCORRENCIA.md` é ignorada em silêncio
 * (decisão D-12): `docs/` tem pastas legítimas que não são trabalho.
 *
 * ## Por que o `00-OCORRENCIA.md` também abre trabalho
 *
 * O `ORQUESTRADOR.md` só nasce no E2 (`references/02-plano.md`, passo 4). Entre
 * o E1 e o E2 a ocorrência já existe em disco, já tem id, título e ferramenta —
 * e era invisível ao painel e ao watch, que anunciavam "nenhum trabalho aberto"
 * enquanto a investigação rodava. Essa é justamente a janela em que a pessoa
 * mais olha a tela, e a que mais leva tempo.
 *
 * O orquestrador continua sendo a fonte autoritativa: quando ele existe, é ele
 * que descreve o trabalho. A ocorrência só preenche a lacuna do período em que
 * ele ainda não foi escrito, com o que o próprio `00-OCORRENCIA.md` declara.
 */

export type Trabalho = {
  trabalho_id: string;
  titulo: string;
  pasta: string;
  arquivo: string;
  expx_tool: ExpxTool;
  tipo_trabalho: TipoTrabalho;
  tipo_ocorrencia: TipoOcorrencia | null;
  estagio: Estagio;
  status: StatusTrabalho;
  criado_em: string;
  atualizado_em: string;
  concluido_em: string | null;
  sprints: string[];
  caminho_critico: string[];
  linhas: Map<string, number>;
  /**
   * A branch onde este trabalho foi encontrado (OC-2026-002). `null` para um
   * trabalho do checkout ativo lido por filesystem — nome da branch quando
   * veio de `descobrirEmBranches` (git show, sem checkout).
   */
  branch: string | null;
};

export type Descoberta = {
  trabalhos: Trabalho[];
  rejeicoes: Rejeicao[];
  /** Todos os arquivos aceitos, para as etapas seguintes não relerem o disco. */
  aceitos: Aceito[];
};

/**
 * O estágio de uma ocorrência ainda sem plano, deduzido do que há na pasta.
 *
 * Só existem dois casos possíveis aqui — com `ORQUESTRADOR.md` o trabalho nem
 * chega nesta função. O `01-CAUSA-RAIZ.md` é o artefato que fecha o E1
 * (`references/01-investigacao.md`), então a presença dele é a fronteira.
 */
function estagioSemPlano(pasta: string, aceitos: readonly Aceito[]): Estagio {
  const temCausaRaiz = aceitos.some(
    (a) => a.kind === "causa_raiz" && dirname(a.arquivo) === pasta,
  );
  return temCausaRaiz ? "e2" : "e1";
}

/**
 * Constrói o trabalho a partir do `00-OCORRENCIA.md`, para o período em que o
 * `ORQUESTRADOR.md` ainda não existe.
 *
 * Os campos que só o plano conhece recebem o valor de "ainda não há": nenhuma
 * sprint declarada, nenhum caminho crítico, nada concluído. `status` é
 * `em_andamento` porque uma ocorrência registrada e sem plano é exatamente
 * isso — trabalho aberto, e é o que a tela precisa dizer.
 */
function daOcorrencia(a: Aceito, aceitos: readonly Aceito[]): Trabalho {
  const d = a.dados as Record<string, unknown>;
  const pasta = dirname(a.arquivo);
  const recebido = (d["recebido_em"] as string | undefined) ?? "";
  return {
    trabalho_id: String(d["trabalho_id"] ?? ""),
    titulo: String(d["titulo"] ?? ""),
    pasta,
    arquivo: a.arquivo,
    expx_tool: (d["expx_tool"] as ExpxTool | undefined) ?? "runx",
    tipo_trabalho: "ocorrencia",
    tipo_ocorrencia: (d["tipo_ocorrencia"] as TipoOcorrencia | undefined) ?? null,
    estagio: estagioSemPlano(pasta, aceitos),
    status: "em_andamento",
    criado_em: recebido,
    atualizado_em: (d["atualizado_em"] as string | undefined) ?? recebido,
    concluido_em: null,
    sprints: [],
    caminho_critico: [],
    linhas: a.linhas,
    branch: null,
  };
}

export function descobrirTrabalhos(raiz: string): Descoberta {
  const trabalhos: Trabalho[] = [];
  const rejeicoes: Rejeicao[] = [];
  const aceitos: Aceito[] = [];
  /** As ocorrências vistas, para completar as pastas que não têm plano. */
  const ocorrencias: Aceito[] = [];

  for (const caminho of varrerCandidatos(raiz)) {
    const r = lerArquivoDeEstado(caminho);
    if (r.tipo === "rejeitado") {
      rejeicoes.push(r);
      continue;
    }
    aceitos.push(r);

    if (r.kind === "ocorrencia" && basename(caminho) === "00-OCORRENCIA.md") {
      ocorrencias.push(r);
      continue;
    }

    if (r.kind !== "orquestrador" || basename(caminho) !== "ORQUESTRADOR.md") continue;

    const d = r.dados as unknown as Omit<Trabalho, "pasta" | "arquivo" | "linhas" | "branch">;
    trabalhos.push({
      ...d,
      pasta: dirname(caminho),
      arquivo: caminho,
      linhas: r.linhas,
      branch: null,
    });
  }

  // Trabalhos que só existem em branches locais não ativas (OC-2026-002 /
  // T-01.05): mesma varredura, só que via `git show`, sem tocar o checkout.
  //
  // Cada `arquivo` vindo de branch é reescrito com o prefixo `<branch>::`
  // (SEPARADOR_BRANCH) — nunca colide com um caminho real de filesystem — para
  // que `porPasta`/`montarSprints` (que agrupam por `dirname(a.arquivo)`)
  // continuem funcionando sem precisar saber que a origem foi git, e para que
  // dois arquivos do mesmo caminho relativo em branches diferentes não colidam
  // entre si na mesma chave de pasta.
  const ativa = branchAtiva(raiz);
  const { aceitos: aceitosBranch, rejeicoes: rejeicoesBranch } = descobrirEmBranches(raiz, ativa);
  rejeicoes.push(...rejeicoesBranch);

  const virtualizados = aceitosBranch.map((r) => ({
    ...r,
    arquivo: `${r.branch}${SEPARADOR_BRANCH}${r.arquivo}`,
  }));
  aceitos.push(...virtualizados);

  const pastasDeFilesystem = new Set(trabalhos.map((t) => t.pasta));
  for (let i = 0; i < aceitosBranch.length; i += 1) {
    const original = aceitosBranch[i];
    const virtual = virtualizados[i];
    if (!original || !virtual) continue;
    if (original.kind !== "orquestrador" || basename(original.arquivo) !== "ORQUESTRADOR.md") continue;

    const pastaVirtual = dirname(virtual.arquivo);
    // Uma pasta já vista no filesystem (branch ativa) vence: essa é a fonte
    // autoritativa do que está de fato em execução agora.
    if (pastasDeFilesystem.has(pastaVirtual)) continue;

    const d = virtual.dados as unknown as Omit<Trabalho, "pasta" | "arquivo" | "linhas" | "branch">;
    trabalhos.push({
      ...d,
      pasta: pastaVirtual,
      arquivo: virtual.arquivo,
      linhas: virtual.linhas,
      branch: original.branch,
    });
    pastasDeFilesystem.add(pastaVirtual);
  }

  // O orquestrador é a fonte autoritativa: a ocorrência só entra quando a
  // pasta dela ainda não tem plano. Comparar por PASTA, e não por
  // `trabalho_id`, porque o id da ocorrência pode divergir do plano por erro
  // de digitação — e nesse caso duplicar a linha na tela esconderia o defeito
  // em vez de mostrá-lo.
  const comPlano = new Set(trabalhos.map((t) => t.pasta));
  for (const o of ocorrencias) {
    if (comPlano.has(dirname(o.arquivo))) continue;
    trabalhos.push(daOcorrencia(o, aceitos));
  }

  trabalhos.sort((a, b) => a.trabalho_id.localeCompare(b.trabalho_id));
  return { trabalhos, rejeicoes, aceitos };
}
