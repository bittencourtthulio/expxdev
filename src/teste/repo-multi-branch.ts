import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Repositório git local para o teste de descoberta multi-branch (OC-2026-002 / T-01.04).
 *
 * Segue o mesmo padrão de `repo-fixture.ts`: um repositório real em
 * `mkdtempSync`, não um mock — exercita o mesmo `git` que a implementação usa.
 *
 * Layout produzido:
 * - `main` (checkout ativo ao final): só o commit inicial, nenhuma feature.
 * - `feature/x`: uma feature isolada, `docs/feature-x/ORQUESTRADOR.md` + `sprint-01/tasks.md`.
 * - `feature/y` e `feature/y-continuacao`: a mesma feature-y, a segunda branch
 *   nasce da primeira sem alterar a pasta docs/feature-y — reproduz o padrão de
 *   branches encadeadas do ExpxCMS (campo branch_base em docs/entregas/ENTREGA.md).
 */

function git(cwd: string, ...args: readonly string[]): void {
  execFileSync("git", [...args], {
    cwd,
    stdio: "ignore",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "expx",
      GIT_AUTHOR_EMAIL: "expx@example.invalid",
      GIT_COMMITTER_NAME: "expx",
      GIT_COMMITTER_EMAIL: "expx@example.invalid",
    },
  });
}

function orquestrador(id: string, titulo: string): string {
  return `---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: ${id}
titulo: ${titulo}
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-08-20
atualizado_em: 2026-08-28
concluido_em: 2026-08-28
sprints: [sprint-01]
caminho_critico: [T-01.01]
---

# Orquestrador — ${id}

Fixture de teste (OC-2026-002 / T-01.04).
`;
}

function tasksMd(id: string): string {
  return `---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: ${id}
sprint_id: sprint-01
atualizado_em: 2026-08-28
tasks:
  - id: T-01.01
    titulo: Unica task
    fase: F-01.1
    status: concluida
    objetivo: Fixture de teste
    arquivos:
      cria: []
      altera: []
    teste_integracao: Fixture nao roda codigo real
    teste_funcional: Fixture nao roda codigo real
    criterio_aceite: Fixture nao roda codigo real
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-28
    suite: verde
---

# Tasks — Sprint 01
`;
}

/** Cria o repositório multi-branch e devolve o caminho, com o checkout final em `main`. */
export function criarRepoMultiBranch(): string {
  const raiz = mkdtempSync(join(tmpdir(), "expx-repo-multi-branch-"));

  writeFileSync(join(raiz, "README.md"), "Fixture de repositorio multi-branch (OC-2026-002).\n");
  git(raiz, "init", "-q", "-b", "main");
  git(raiz, "add", "-A");
  git(raiz, "commit", "-q", "-m", "chore: init");

  // feature/x — so existe nessa branch, nunca mesclada em main.
  git(raiz, "checkout", "-q", "-b", "feature/x");
  mkdirSync(join(raiz, "docs", "feature-x", "sprint-01"), { recursive: true });
  writeFileSync(join(raiz, "docs", "feature-x", "ORQUESTRADOR.md"), orquestrador("feature-x", "Feature isolada em branch"));
  writeFileSync(join(raiz, "docs", "feature-x", "sprint-01", "tasks.md"), tasksMd("feature-x"));
  git(raiz, "add", "-A");
  git(raiz, "commit", "-q", "-m", "feat: feature-x");

  // feature/y — de volta a main, outra branch isolada.
  git(raiz, "checkout", "-q", "main");
  git(raiz, "checkout", "-q", "-b", "feature/y");
  mkdirSync(join(raiz, "docs", "feature-y", "sprint-01"), { recursive: true });
  writeFileSync(join(raiz, "docs", "feature-y", "ORQUESTRADOR.md"), orquestrador("feature-y", "Feature encadeada"));
  writeFileSync(join(raiz, "docs", "feature-y", "sprint-01", "tasks.md"), tasksMd("feature-y"));
  git(raiz, "add", "-A");
  git(raiz, "commit", "-q", "-m", "feat: feature-y");

  // feature/y-continuacao — nasce de feature/y, feature-y permanece intacta.
  git(raiz, "checkout", "-q", "-b", "feature/y-continuacao");
  appendFileSync(join(raiz, "README.md"), "continuacao\n");
  git(raiz, "add", "-A");
  git(raiz, "commit", "-q", "-m", "chore: continuacao, feature-y intacta");

  // Checkout final em main — o caso que o parser precisa atravessar.
  git(raiz, "checkout", "-q", "main");

  return raiz;
}
