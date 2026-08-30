import { montarProjeto, type BloqueioSituado, type TrabalhoMontado } from "../../parser/projeto/montar.js";
import type { LinhaEvento } from "../../parser/esquema/evento.js";
import type { EstadoExpx } from "../fontes/estado-schema.js";
import { lerEstadoExpx } from "../fontes/estado.js";
import { lerRastro } from "../fontes/rastro.js";
import { abertos, escolherTrabalho } from "./escolher.js";
import { montarNaFrota, type TrabalhoNaFrota } from "./frota.js";

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
  /**
   * Os trabalhos abertos com o que o painel mostra de cada um: progresso,
   * estágio, tasks ativas e último evento.
   *
   * O trabalho corrente vem primeiro; os demais seguem por atividade mais
   * recente, que é a ordem em que a pessoa quer varrer a tela.
   */
  frota: TrabalhoNaFrota[];
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

/**
 * Quantas linhas do rastro a estimativa de progresso enxerga.
 *
 * Bem mais que as dez da tela: a estimativa procura marcos (`task_iniciada`,
 * `arquivo_alterado`, suíte verde) que uma execução ruidosa empurra para longe
 * do fim do arquivo. Continua sendo leitura de cauda, não varredura.
 */
const FUNDO_DA_ESTIMATIVA = 200;

/** Por quantos dias um trabalho concluído continua visível na frota. */
const DIAS_NA_FROTA = 2;

/** O trabalho fechou nos últimos dias? `atualizado_em` é `AAAA-MM-DD`. */
function recemFechado(atualizadoEm: string, agora: Date): boolean {
  const q = Date.parse(`${atualizadoEm}T00:00:00Z`);
  if (Number.isNaN(q)) return false;
  const hoje = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
  return (hoje - q) / 86_400_000 <= DIAS_NA_FROTA;
}

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

  // A frota lê o rastro de CADA trabalho, não só o do corrente: é o que permite
  // dizer "e3 rodando, e2 parado há 40 min" numa tela só. É leitura de cauda
  // (as últimas linhas de cada arquivo), não varredura — o custo cresce com o
  // número de trabalhos abertos, que é unidade, não milhar.
  //
  // Entram os abertos MAIS os concluídos recentemente: um trabalho que fecha some da
  // tela no meio de uma sessão de acompanhamento, e quem estava olhando fica
  // sem saber se acabou ou se quebrou. Ele fica, marcado como concluído.
  const emFrota = [
    ...abertos(projeto.trabalhos),
    ...projeto.trabalhos.filter(
      (t) => t.status === "concluido" && recemFechado(t.atualizado_em, agora),
    ),
  ];
  // O trabalho corrente entra mesmo se estiver concluído: quem abriu o watch
  // para conferir o fechamento não pode encontrar a tela vazia (D-19).
  const listaFrota =
    trabalho !== null && !emFrota.some((t) => t.trabalho_id === trabalho.trabalho_id)
      ? [trabalho, ...emFrota]
      : emFrota;

  const frota = listaFrota
    .map((t) =>
      montarNaFrota(
        t,
        // A frota lê MAIS FUNDO que a lista de atividade de propósito: o
        // `task_iniciada` de uma task que roda há uma hora fica soterrado por
        // dezenas de `suite_executada`, e com a janela curta o tempo decorrido
        // — que é justamente o sinal de execução travada — não apareceria.
        lerRastro(raizProjeto, t.trabalho_id, FUNDO_DA_ESTIMATIVA),
        estado,
        t.trabalho_id === trabalho?.trabalho_id,
      ),
    )
    .sort((a, b) => {
      // o corrente primeiro: é o que a pessoa veio ver
      if (a.corrente !== b.corrente) return a.corrente ? -1 : 1;
      // depois, quem se mexeu mais recentemente
      const ta = a.ultimoEventoTs ?? "";
      const tb = b.ultimoEventoTs ?? "";
      if (ta !== tb) return ta > tb ? -1 : 1;
      return a.trabalho.trabalho_id < b.trabalho.trabalho_id ? -1 : 1;
    });

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
    frota,
    lidoEm: agora,
  };
}
