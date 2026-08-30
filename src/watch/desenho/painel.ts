import type { Visao } from "../visao/projetar.js";
import type { TaskAtiva, TrabalhoNaFrota } from "../visao/frota.js";
import { agrupar, type GrupoAtividade } from "../visao/atividade.js";
import { barra, barraIndeterminada, decorrido, papelDaBarra, percentual } from "./barra.js";
import type { EstadoExpx } from "../fontes/estado-schema.js";
import type { Papel, Pintor } from "./cor.js";
import { cortar, largura, preencher } from "./largura.js";

/**
 * O painel: a frota de trabalhos, cada um com sua barra e sua task corrente.
 *
 * O desenho antigo era uma árvore inteira despejada mais um dump do rastro:
 * tudo com o mesmo peso visual, e a informação que importa — quem está andando,
 * quanto falta, o que roda em paralelo — enterrada no meio. Aqui cada trabalho
 * ocupa um bloco curto e fixo, e a tela toda cabe de relance.
 *
 * Como todo este diretório: função PURA. Recebe a visão, a largura e se há cor,
 * devolve linhas. Nada de `process.stdout`.
 */

/** Colunas da barra de progresso de um trabalho. */
const BARRA_TRABALHO = 16;
/** Colunas da barra de uma task ativa. */
const BARRA_TASK = 10;
/** Colunas reservadas ao detalhe de um evento, na coluna da direita. */
const COL_DETALHE = 26;

/** Larguras mínimas para os enfeites: abaixo disso, só texto. */
const CABE_BARRA = 52;

const MARCA_ESTAGIO: Record<string, string> = {
  f1: "ingestao",
  f2: "descoberta",
  f3: "plano",
  f4: "orquestracao",
  f5: "auditoria",
  f6: "execucao",
  e1: "investigacao",
  e2: "plano",
  e3: "correcao",
  e4: "qa",
  e5: "relatorio",
  b1: "concepcao",
  b2: "stack",
  b3: "mapa",
  b4: "features",
  b5: "recursao",
  b6: "validacao",
};

/**
 * Uma palavra dizendo em que pé está o trabalho — o que a pessoa lê primeiro.
 *
 * "bloqueado" e "parado" são coisas diferentes de propósito: bloqueado é
 * declarado no plano e exige decisão humana; parado é o rastro em silêncio, e
 * costuma ser execução travada.
 */
function situacao(t: TrabalhoNaFrota, agora: Date): { texto: string; papel: Papel } {
  if (t.bloqueiosAbertos > 0) {
    const n = t.bloqueiosAbertos;
    return { texto: n === 1 ? "1 bloqueio" : `${String(n)} bloqueios`, papel: "erro" };
  }
  if (t.ativas.some((a) => a.bloqueada)) return { texto: "task bloqueada", papel: "erro" };
  if (t.total > 0 && t.concluidas >= t.total) return { texto: "concluido", papel: "sucesso" };

  if (t.ativas.length > 0) {
    // Duas ou mais tasks em andamento é paralelismo REAL acontecendo agora,
    // e é o que a tela precisa gritar.
    const n = t.ativas.length;
    if (n > 1) return { texto: `${String(n)} em paralelo`, papel: "destaque" };
    return { texto: "executando", papel: "atencao" };
  }

  if (t.ultimoEventoTs !== null) {
    const ms = agora.getTime() - new Date(t.ultimoEventoTs).getTime();
    // Dez minutos sem evento numa execução autônoma não é pausa, é sintoma.
    if (ms > 10 * 60_000) return { texto: `parado ha ${decorrido(ms)}`, papel: "atencao" };
  }
  return { texto: "aguardando", papel: "apagado" };
}

/** A linha-título de um trabalho: id, ferramenta e situação. */
function linhaTitulo(t: TrabalhoNaFrota, colunas: number, pintar: Pintor, agora: Date): string {
  const s = situacao(t, agora);
  const marca = t.corrente ? "▸ " : "  ";
  const cabeca = `${marca}${t.trabalho.trabalho_id} · ${t.trabalho.expx_tool}`;

  const estagio = MARCA_ESTAGIO[t.estagio] ?? t.estagio;
  const cauda = `${t.estagio} ${estagio} · ${s.texto}`;

  // O título alinha à esquerda e a situação à direita: a coluna da direita
  // vira uma faixa que se lê de cima a baixo sem precisar ler o resto.
  const sobra = colunas - largura(cabeca) - largura(cauda) - 2;
  if (sobra < 1) {
    return pintar(cortar(`${cabeca} · ${s.texto}`, colunas), t.corrente ? "destaque" : "neutro");
  }

  return (
    pintar(cabeca, t.corrente ? "destaque" : "neutro") +
    " ".repeat(sobra + 2) +
    pintar(cauda, s.papel)
  );
}

/** A linha de progresso: barra, contagem, percentual e título do trabalho. */
function linhaProgresso(t: TrabalhoNaFrota, colunas: number, pintar: Pintor): string {
  const contagem = `${String(t.concluidas)}/${String(t.total)}`;
  const pct = percentual(t.concluidas, t.total).padStart(4);

  if (colunas < CABE_BARRA) {
    return pintar(cortar(`    ${contagem} ${pct} · ${t.trabalho.titulo}`, colunas), "apagado");
  }

  const b = barra(t.concluidas, t.total, BARRA_TRABALHO);
  const prefixo = `    ${b} ${preencher(contagem, 6)} ${pct}  `;
  const resto = colunas - largura(prefixo);

  return (
    "    " +
    pintar(b, papelDaBarra(t.concluidas, t.total)) +
    " " +
    pintar(preencher(contagem, 6), "neutro") +
    " " +
    pintar(pct, "apagado") +
    "  " +
    pintar(cortar(t.trabalho.titulo, Math.max(0, resto)), "apagado")
  );
}

/**
 * A linha de uma task ativa: barra, estimativa, tempo e paralelismo.
 *
 * O percentual aqui é ESTIMADO — o método não mede progresso dentro de uma
 * task — e por isso vem com `~`. A barra de quem não tem sinal nenhum no rastro
 * é indeterminada: pulsa dizendo "vivo", sem afirmar quanto falta.
 */
function linhaTask(
  a: TaskAtiva,
  colunas: number,
  pintar: Pintor,
  agora: Date,
): string {
  const marca = a.bloqueada ? "[!]" : "[>]";
  const papel: Papel = a.bloqueada ? "erro" : "destaque";

  // Paralelismo: a fase declarou rodar junto com outras, ou a task pode rodar
  // junto com as irmãs. O plano declara; a execução nunca decide isso sozinha.
  const par = a.paralelaCom.length > 0 ? ` ‖ ${a.paralelaCom.join(",")}` : a.paralelizavel ? " ‖" : "";
  const dep = a.dependeDe.length > 0 ? ` ← ${a.dependeDe.join(",")}` : "";

  const tempo =
    a.progresso.iniciadaEm !== null
      ? decorrido(agora.getTime() - a.progresso.iniciadaEm.getTime())
      : "";

  const cabeca = `      ${marca} ${a.id} ${a.titulo}${par}${dep}`;

  if (colunas < CABE_BARRA) return pintar(cortar(cabeca, colunas), papel);

  // Sem sinal no rastro não há o que estimar: a barra pulsa em vez de mentir.
  const temSinal = a.progresso.sinais > 0 || a.progresso.fracao > 0.1;
  const b = temSinal
    ? barra(Math.round(a.progresso.fracao * 100), 100, BARRA_TASK)
    : barraIndeterminada(BARRA_TASK, agora);
  const est = temSinal ? `~${String(Math.round(a.progresso.fracao * 100))}%`.padStart(5) : "     ";
  const cauda = `${b} ${est} ${preencher(tempo, 6)}`;

  const sobra = colunas - largura(cabeca) - largura(cauda) - 2;
  if (sobra < 1) {
    return pintar(cortar(cabeca, colunas - largura(cauda) - 1), papel) + " " + pintar(cauda, "apagado");
  }

  return (
    pintar(cabeca, papel) +
    " ".repeat(sobra + 2) +
    pintar(b, a.bloqueada ? "erro" : "atencao") +
    " " +
    pintar(est, "apagado") +
    " " +
    pintar(preencher(tempo, 6), "apagado")
  );
}

/**
 * A linha de contexto do trabalho corrente: branch, raio do legado e orçamento.
 *
 * Só o corrente tem: esses campos vêm do `estado.json`, que descreve UM
 * trabalho, e repeti-los nos outros mostraria o dado de um no lugar do outro.
 * Ausentes no modo degradado, porque nenhum kind do plano os declara
 * (base/estado-json.md, risco 2).
 */
function linhaContexto(
  t: TrabalhoNaFrota,
  estado: EstadoExpx | null,
  colunas: number,
  pintar: Pintor,
): string[] {
  if (!t.corrente || estado === null) return [];

  const partes: string[] = [];
  if (estado.branch !== null) partes.push(estado.branch);
  if (estado.pr_estado !== null) partes.push(`pr ${estado.pr_estado}`);
  if (estado.raio !== null) partes.push(`raio ${estado.raio}`);
  if (estado.orcamento_arquivos !== null) partes.push(`arq ${estado.orcamento_arquivos}`);
  if (estado.orcamento_linhas !== null) partes.push(`lin ${estado.orcamento_linhas}`);

  if (partes.length === 0) return [];

  // Raio alto é a única parte que grita: é o aviso de que a mudança pode
  // quebrar coisa distante, e é o que o modo legado existe para sinalizar.
  const papel: Papel = estado.raio === "alto" ? "erro" : "apagado";
  return [pintar(cortar(`    ${partes.join(" · ")}`, colunas), papel)];
}

/** Um bloco de trabalho: título, progresso e as tasks que rodam agora. */
export function blocoTrabalho(
  t: TrabalhoNaFrota,
  colunas: number,
  pintar: Pintor,
  agora: Date,
  estado: EstadoExpx | null = null,
): string[] {
  const linhas = [
    linhaTitulo(t, colunas, pintar, agora),
    linhaProgresso(t, colunas, pintar),
    ...linhaContexto(t, estado, colunas, pintar),
  ];

  // Só as tasks ATIVAS entram: a árvore inteira é o que fazia a tela virar
  // um despejo. Quem quer a árvore completa pede `--arvore`.
  for (const a of t.ativas) linhas.push(linhaTask(a, colunas, pintar, agora));

  return linhas;
}

/** Rótulo curto e legível de um evento — sem o vocabulário de máquina. */
const ROTULO_EVENTO: Record<string, string> = {
  fase_iniciada: "fase iniciada",
  fase_concluida: "fase concluida",
  task_iniciada: "task iniciada",
  task_concluida: "task concluida",
  task_bloqueada: "task bloqueada",
  suite_executada: "suite",
  arquivo_alterado: "arquivos",
  regra_violada: "regra violada",
  acao_bloqueada: "acao bloqueada",
  agente_iniciado: "agente iniciado",
  agente_concluido: "agente concluido",
  veredito_emitido: "veredito",
  commit_criado: "commit",
  pr_aberto: "pr aberto",
};

/** O sinal de um grupo: o que a pessoa lê antes de ler a linha. */
function sinalDe(g: GrupoAtividade): { marca: string; papel: Papel } {
  if (g.houveFalha) return { marca: "!", papel: "erro" };
  if (g.evento === "task_concluida" || g.evento === "fase_concluida") {
    return { marca: "✓", papel: "sucesso" };
  }
  if (g.evento === "suite_executada") return { marca: "✓", papel: "sucesso" };
  return { marca: "·", papel: "apagado" };
}

/**
 * A atividade: eventos agrupados, não o rastro cru.
 *
 * Antes eram dez linhas do arquivo `.jsonl` como estavam no disco — sete delas
 * a mesma `suite_executada` com o mesmo comando gigante. Agrupar por (evento,
 * alvo) devolve a informação e libera as linhas para o que de fato aconteceu.
 */
export function desenharAtividade(v: Visao, colunas: number, pintar: Pintor): string[] {
  const grupos = agrupar(v.eventos, 6);
  if (grupos.length === 0) return [];

  const linhas = [pintar(cortar("atividade", colunas), "apagado")];

  for (const g of grupos) {
    const s = sinalDe(g);
    const rotulo = ROTULO_EVENTO[g.evento] ?? g.evento;
    // "×12" diz que repetiu; "×12, 8 sem resultado" diz que repetiu APANHANDO,
    // que é o sintoma de execução em laço — e era o que a tela antiga escondia
    // atrás de doze linhas idênticas.
    const vezes = g.vezes > 1 ? ` ×${String(g.vezes)}` : "";
    const insucesso = g.falhas > 0 && !g.houveFalha ? ` (${String(g.falhas)} sem exito)` : "";
    const alvo = g.alvo !== "" ? ` ${g.alvo}` : "";

    const cabeca = `  ${s.marca} ${rotulo}${vezes}${alvo}${insucesso}`;
    const hora = g.ts.slice(11, 16);

    // O detalhe é cortado ANTES de medir: cortar depois de calcular a sobra
    // desalinha a coluna da direita justamente nas linhas mais longas, que é
    // quando o alinhamento mais ajuda a varrer a tela.
    const detalhe = cortar(g.detalhe !== "" ? g.detalhe : g.resultado, COL_DETALHE);
    const cauda = `${preencher(detalhe, COL_DETALHE)}  ${hora}`;
    const sobra = colunas - largura(cabeca) - largura(cauda) - 2;

    if (sobra < 1) {
      linhas.push(pintar(cortar(`${cabeca} · ${detalhe} ${hora}`, colunas), s.papel));
      continue;
    }
    linhas.push(
      pintar(cortar(cabeca, colunas), s.papel) +
        " ".repeat(sobra + 2) +
        pintar(preencher(detalhe, COL_DETALHE), g.houveFalha ? "erro" : "apagado") +
        "  " +
        pintar(hora, "apagado"),
    );
  }

  return linhas;
}
