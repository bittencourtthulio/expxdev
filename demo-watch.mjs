/**
 * Simula uma execução runx ao vivo, para exercitar o painel do `expx watch`.
 *
 * Escreve no rastro (`docs/eventos/OC-2026-DEMO.jsonl`), no `.expx/estado.json`
 * e no plano (`tasks.md`) exatamente como os hooks e a skill escreveriam
 * durante uma execução de verdade — que é o que faz o painel se mexer sozinho.
 *
 * Toca SÓ os artefatos da ocorrência OC-2026-DEMO. Não altera código, não
 * commita e não cria branch: existe para testar a tela, não para corrigir nada.
 *
 *   node demo-watch.mjs        roda o roteiro inteiro (~2 min)
 *   node demo-watch.mjs zerar  volta a ocorrência ao estado inicial
 */

import { appendFileSync, readFileSync, writeFileSync } from "node:fs";

const RASTRO = "docs/eventos/OC-2026-DEMO.jsonl";
const ESTADO = ".expx/estado.json";
const TASKS = "docs/OC-2026-DEMO/sprint-01/tasks.md";
const BLOQUEIOS = "docs/OC-2026-DEMO/00-BLOQUEIOS.md";

const agora = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const esperar = (s) => new Promise((r) => setTimeout(r, s * 1000));

/** Uma linha no rastro — o mesmo formato que os hooks do método gravam. */
function evento(nome, task, resultado, detalhe, arquivos = [], origem = "skill") {
  appendFileSync(
    RASTRO,
    JSON.stringify({
      ts: agora(),
      expx_eventos: 1,
      trabalho_id: "OC-2026-DEMO",
      ferramenta: "runx",
      origem,
      evento: nome,
      fase: estadoAtual.fase,
      task,
      agente: "principal",
      resultado,
      detalhe,
      arquivos,
    }) + "\n",
  );
}

let estadoAtual = JSON.parse(readFileSync(ESTADO, "utf8"));

/** O `estado.json`, reescrito como a skill reescreve a cada passo. */
function estado(campos) {
  estadoAtual = { ...estadoAtual, ...campos, atualizado_em: agora() };
  writeFileSync(ESTADO, JSON.stringify(estadoAtual, null, 2) + "\n");
}

/** Troca o status de uma task no plano — é o que move a barra de progresso. */
function task(id, novoStatus, suite) {
  let t = readFileSync(TASKS, "utf8");
  const bloco = new RegExp(`(  - id: ${id}\\n(?:    .*\\n|      .*\\n)*)`, "m");
  const m = bloco.exec(t);
  if (m === null) throw new Error(`task ${id} nao encontrada`);
  let b = m[1].replace(/    status: \w+/, `    status: ${novoStatus}`);
  if (suite !== undefined) b = b.replace(/    suite: \w+/, `    suite: ${suite}`);
  if (novoStatus === "concluida") {
    b = b.replace(/    concluida_em: null/, `    concluida_em: ${agora().slice(0, 10)}`);
  }
  writeFileSync(TASKS, t.replace(m[1], b));
}

/** Abre um bloqueio — o caso que rompe o layout e sobe ao topo da tela. */
function bloquear(descricao) {
  writeFileSync(
    BLOQUEIOS,
    `---
expx_schema: 1
expx_tool: runx
kind: bloqueios
trabalho_id: OC-2026-DEMO
atualizado_em: ${agora().slice(0, 10)}
bloqueios:
  - id: B-01
    descricao: ${descricao}
    task: T-01.03
    aberto_em: ${agora().slice(0, 10)}
    fechado_em: null
    responsavel: humano
---

# Bloqueios
`,
  );
}

function desbloquear() {
  writeFileSync(
    BLOQUEIOS,
    `---
expx_schema: 1
expx_tool: runx
kind: bloqueios
trabalho_id: OC-2026-DEMO
atualizado_em: ${agora().slice(0, 10)}
bloqueios: []
---

# Bloqueios

Nenhum bloqueio registrado.
`,
  );
}

const passo = (n, texto) => console.log(`[${n}] ${texto}`);

async function roteiro() {
  console.log("simulando execucao runx em OC-2026-DEMO — olhe o painel do watch\n");

  passo(1, "a suite fica verde: a correcao da T-01.02 pegou");
  evento("suite_executada", "T-01.02", "verde", "suite verde, 42 testes", [], "hook");
  await esperar(6);

  passo(2, "T-01.02 concluida — a barra anda e o balanco muda");
  task("T-01.02", "concluida", "verde");
  evento("task_concluida", "T-01.02", "ok", "faixa acima de 50kg corrigida");
  estado({ tasks_concluidas: 2, task: "T-01.03" });
  await esperar(8);

  passo(3, "um hook reclama: violacao em modo aviso na barra de status");
  evento(
    "regra_violada",
    "T-01.03",
    "aviso",
    "escopo-da-task: arquivo fora do escopo",
    ["src/outro.ts"],
    "hook",
  );
  await esperar(6);

  passo(4, "bloqueio aberto — a faixa vermelha rompe o layout no topo");
  bloquear("Falta a tabela oficial de faixas para conferir o valor de 51kg");
  task("T-01.03", "bloqueada");
  evento("task_bloqueada", "T-01.03", "bloqueado", "sem a tabela oficial nao da para conferir");
  estado({ bloqueios: 1 });
  await esperar(12);

  passo(5, "bloqueio resolvido: a faixa some e a task volta a rodar");
  desbloquear();
  task("T-01.03", "em_andamento");
  evento("task_iniciada", "T-01.03", "ok", "tabela oficial recebida, retomando");
  estado({ bloqueios: 0 });
  await esperar(8);

  passo(6, "T-01.03 fecha verde");
  evento("suite_executada", "T-01.03", "verde", "suite verde, 44 testes", [], "hook");
  task("T-01.03", "concluida", "verde");
  evento("task_concluida", "T-01.03", "ok", "regressao da faixa vizinha coberta");
  estado({ tasks_concluidas: 3, task: "T-01.04" });
  await esperar(8);

  passo(7, "duas tasks em paralelo — o cabecalho conta o paralelismo");
  task("T-01.04", "em_andamento");
  task("T-01.05", "em_andamento");
  evento("task_iniciada", "T-01.04", "ok", "atualizando a tabela de faixas");
  evento("task_iniciada", "T-01.05", "ok", "conferindo o relatorio mensal");
  await esperar(12);

  passo(8, "as duas fecham: o trabalho chega a 5/5");
  task("T-01.04", "concluida", "verde");
  task("T-01.05", "concluida", "verde");
  evento("task_concluida", "T-01.04", "ok", "documentacao coerente com o codigo");
  evento("task_concluida", "T-01.05", "ok", "relatorio usando o calculo corrigido");
  estado({ tasks_concluidas: 5, task: null });
  await esperar(8);

  passo(9, "a runx avanca no pipeline: e3 correcao -> e4 qa");
  estado({ fase: "e4" });
  evento("veredito_emitido", null, "aprovado", "fix aprovado, seguindo para QA");
  await esperar(8);

  passo(10, "e4 qa -> e5 relatorio: a esteira acende o ultimo passo");
  estado({ fase: "e5" });
  evento("veredito_emitido", null, "aprovado", "QA aprovou a correcao");

  console.log("\nfim do roteiro. `node demo-watch.mjs zerar` volta ao inicio.");
}

async function zerar() {
  const { execSync } = await import("node:child_process");
  execSync("git checkout -- docs/OC-2026-DEMO 2>/dev/null || true");
  console.log("para zerar de vez, apague e recrie a ocorrencia (ela nao esta versionada).");
}

if (process.argv[2] === "zerar") await zerar();
else await roteiro();
