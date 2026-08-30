import type { Visao } from "../visao/projetar.js";
import type { Pintor } from "./cor.js";
import { cortar } from "./largura.js";

/**
 * O cabeçalho: que trabalho é, em que pé está.
 *
 * A linha de legado (raio e orçamento) e a de repositório (branch e PR) só
 * existem quando o `estado.json` pôde ser lido: nenhum kind do `expx-schema`
 * declara esses campos, então no modo degradado não há de onde tirá-los
 * (base/estado-json.md, risco 2).
 */
export function desenharCabecalho(v: Visao, colunas: number, pintar: Pintor): string[] {
  if (v.trabalho === null) {
    return [pintar(cortar("nenhum trabalho aberto", colunas), "apagado")];
  }

  const t = v.trabalho;
  const linhas: string[] = [];

  // Linha 1: identificação. O título do plano é o completo; o `titulo_curto`
  // do estado.json já vem cortado em 30 e serviria à barra de status, não aqui.
  //
  // Regra que vale para o arquivo inteiro: CORTA primeiro, PINTA depois. Os
  // escapes ANSI não ocupam coluna, então medir texto já pintado dá largura
  // errada — e foi o primeiro jeito que este arquivo teve.
  const marca = t.status === "bloqueado" ? "erro" : "destaque";
  const identificacao = cortar(`${t.trabalho_id} · ${t.expx_tool} · ${t.titulo}`, colunas);
  linhas.push(pintar(identificacao, marca));

  // Linha 2: progresso. O par vem do estado quando há, do plano quando não.
  const fase = v.estado?.fase ?? t.estagio;
  const progresso = `${String(v.concluidas)}/${String(v.total)} tasks`;
  const task = v.estado?.task != null ? ` · agora ${v.estado.task}` : "";
  linhas.push(cortar(`  ${fase} · ${progresso}${task}`, colunas));

  // Linha 3: modo legado. Só com estado legível E raio preenchido.
  if (v.estado?.raio != null) {
    const partes = [`raio ${v.estado.raio}`];
    if (v.estado.orcamento_arquivos !== null) {
      partes.push(`arquivos ${v.estado.orcamento_arquivos}`);
    }
    if (v.estado.orcamento_linhas !== null) {
      partes.push(`linhas ${v.estado.orcamento_linhas}`);
    }
    const papel = v.estado.raio === "alto" ? "erro" : "atencao";
    linhas.push(`  ${pintar(cortar(partes.join(" · "), colunas - 2), papel)}`);
  }

  // Linha 4: repositório. Idem — sem estado, sem branch e sem PR.
  if (v.estado?.branch != null) {
    const pr = v.estado.pr_estado !== null ? ` · pr ${v.estado.pr_estado}` : "";
    linhas.push(`  ${pintar(cortar(`${v.estado.branch}${pr}`, colunas - 2), "apagado")}`);
  }

  return linhas;
}
