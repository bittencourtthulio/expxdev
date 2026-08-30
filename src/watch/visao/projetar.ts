import { montarProjeto, type BloqueioSituado, type TrabalhoMontado } from "../../parser/projeto/montar.js";
import type { LinhaEvento } from "../../parser/esquema/evento.js";
import type { EstadoExpx } from "../fontes/estado-schema.js";
import { lerEstadoExpx } from "../fontes/estado.js";
import { lerRastro } from "../fontes/rastro.js";
import { abertos, escolherTrabalho } from "./escolher.js";

/**
 * A visão que o desenho consome — as três fontes reunidas numa estrutura só.
 *
 * O parser do painel é reaproveitado inteiro, sem refatoração: `montarProjeto`
 * é função pura de sistema de arquivos, sem acoplamento a HTTP ou websocket
 * (base/parser-de-artefatos.md, decisão D-02). O que se acrescenta aqui é o
 * que ele não sabe: o `estado.json` e o rastro.
 */

export type Visao = {
  /** O trabalho que o watch está seguindo, ou `null` se não há nenhum. */
  trabalho: TrabalhoMontado | null;
  /** Os trabalhos abertos, para `--todos` e para a tela de "nenhum trabalho". */
  abertos: TrabalhoMontado[];
  /** O `estado.json`, ou `null` quando ausente, inválido ou de versão futura. */
  estado: EstadoExpx | null;
  /**
   * Estamos sem o `estado.json`?
   *
   * NÃO é "o arquivo não existe": a decisão D-12 trata versão ≠ 1 e JSON
   * inválido do mesmo jeito. No modo degradado, `raio`, `orcamento_*`, `branch`
   * e `pr_estado` não têm fonte alguma e não podem ser exibidos — nenhum kind
   * do `expx-schema` os declara (base/estado-json.md, risco 2).
   */
  degradado: boolean;
  /** Tasks concluídas e total, do estado quando há, do plano quando não há. */
  concluidas: number;
  total: number;
  /** Só os bloqueios abertos, que são os que sobem ao topo. */
  bloqueiosAbertos: BloqueioSituado[];
  /** As últimas linhas do rastro, da mais recente para a mais antiga. */
  eventos: LinhaEvento[];
  /** Violações em modo aviso desde que o watch subiu (decisão D-07). */
  violacoesAviso: number;
  /** Instante da leitura, para o rodapé calcular "tempo desde o último evento". */
  lidoEm: Date;
};

export type OpcoesVisao = {
  /** Id pedido em `expx watch <trabalho_id>`. */
  trabalhoPedido?: string;
  /**
   * Quando o watch subiu. É a fronteira da "sessão" no rodapé: o rastro é
   * append-only e não marca sessão nenhuma (lacuna L-03, decisão D-07).
   */
  subiuEm?: Date;
  /** Quantas linhas do rastro exibir. */
  linhasRastro?: number;
};

export function projetarVisao(
  raizProjeto: string,
  op: OpcoesVisao = {},
  agora: Date = new Date(),
): Visao {
  const projeto = montarProjeto(raizProjeto, agora);
  const estado = lerEstadoExpx(raizProjeto);
  const trabalho = escolherTrabalho(projeto.trabalhos, estado, op.trabalhoPedido);

  const tasks = trabalho?.sprints.flatMap((s) => s.tasks) ?? [];

  // O par concluídas/total tem duas fontes: o estado.json traz os inteiros
  // prontos, e o plano exige contagem — `progresso` do parser é fração 0..1,
  // não o par (base/parser-de-artefatos.md, risco 4).
  const doEstado = estado !== null && trabalho !== null;
  const concluidas = doEstado
    ? estado.tasks_concluidas
    : tasks.filter((t) => t.status === "concluida").length;
  const total = doEstado ? estado.tasks_total : tasks.length;

  const eventos =
    trabalho === null ? [] : lerRastro(raizProjeto, trabalho.trabalho_id, op.linhasRastro);

  // "Modo aviso" é vocabulário de hook e só existe no rastro: `regra_violada` é
  // gravado por hook em modo aviso, `acao_bloqueada` em modo bloqueio. Não
  // confundir com as `Violacao` da conformidade, que são defeitos do método nos
  // arquivos do plano (lacuna L-03).
  const fronteira = op.subiuEm?.toISOString().replace(/\.\d{3}Z$/, "Z");
  const violacoesAviso = eventos.filter(
    (e) => e.evento === "regra_violada" && (fronteira === undefined || e.ts >= fronteira),
  ).length;

  return {
    trabalho,
    abertos: abertos(projeto.trabalhos),
    estado,
    degradado: estado === null,
    concluidas,
    total,
    bloqueiosAbertos: (trabalho?.bloqueios ?? []).filter((b) => b.aberto),
    eventos,
    violacoesAviso,
    lidoEm: agora,
  };
}
