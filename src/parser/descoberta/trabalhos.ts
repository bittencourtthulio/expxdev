import { basename, dirname } from "node:path";
import { varrerCandidatos } from "./varredura.js";
import { lerArquivoDeEstado } from "../leitura/arquivo.js";
import type { Rejeicao, Aceito } from "../leitura/rejeicao.js";
import type { ExpxTool, Estagio, StatusTrabalho, TipoTrabalho, TipoOcorrencia } from "../esquema/enums.js";

/**
 * Um trabalho é qualquer pasta com um `ORQUESTRADOR.md` de frontmatter válido.
 * A regra é sobre o CONTEÚDO, não sobre o caminho: o layout `docs/<slug>/` e
 * `docs/manutencao/<id>-<slug>/` descreve onde as skills gravam, não uma
 * restrição de busca.
 *
 * Pasta sem ORQUESTRADOR é ignorada em silêncio (decisão D-12): `docs/` tem
 * pastas legítimas que não são trabalho.
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
};

export type Descoberta = {
  trabalhos: Trabalho[];
  rejeicoes: Rejeicao[];
  /** Todos os arquivos aceitos, para as etapas seguintes não relerem o disco. */
  aceitos: Aceito[];
};

export function descobrirTrabalhos(raiz: string): Descoberta {
  const trabalhos: Trabalho[] = [];
  const rejeicoes: Rejeicao[] = [];
  const aceitos: Aceito[] = [];

  for (const caminho of varrerCandidatos(raiz)) {
    const r = lerArquivoDeEstado(caminho);
    if (r.tipo === "rejeitado") {
      rejeicoes.push(r);
      continue;
    }
    aceitos.push(r);

    if (r.kind !== "orquestrador" || basename(caminho) !== "ORQUESTRADOR.md") continue;

    const d = r.dados as unknown as Omit<Trabalho, "pasta" | "arquivo" | "linhas">;
    trabalhos.push({
      ...d,
      pasta: dirname(caminho),
      arquivo: caminho,
      linhas: r.linhas,
    });
  }

  trabalhos.sort((a, b) => a.trabalho_id.localeCompare(b.trabalho_id));
  return { trabalhos, rejeicoes, aceitos };
}
