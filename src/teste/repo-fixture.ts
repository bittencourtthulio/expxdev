import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Repositórios git locais no lugar da rede.
 *
 * A suíte precisa exercitar resolução de versão e busca de skill sem tocar o
 * GitHub: sem rede a suíte não roda em CI offline, e com rede ela depende do
 * estado de um repositório que ninguém controla. Um repositório local de
 * verdade — não um mock — exercita o mesmo `git` que a implementação usa.
 */

/** Os dois layouts reais dos repositórios de skill (ver base/08-repositorios-reais.md). */
export type Layout = "embutido" | "plano";

export type OpcoesRepo = {
  nome: string;
  tags: readonly string[];
  layout?: Layout;
  /** Conteúdo extra do SKILL.md, para fixtures que precisam de um corpo específico. */
  corpo?: string;
};

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

/**
 * Onde o SKILL.md e os comandos ficam em cada layout. `embutido` é o do
 * sprintx/stackx/mergex; `plano` é o do runx/legadox.
 */
export function caminhosDoLayout(nome: string, layout: Layout): { skill: string; comandos: string } {
  return layout === "embutido"
    ? { skill: join(".claude", "skills", nome), comandos: join(".claude", "commands") }
    : { skill: "skill", comandos: "commands" };
}

/** Cria um repositório git local com a skill e as tags pedidas. Devolve o caminho. */
export function criarRepoSkill(op: OpcoesRepo): string {
  const layout: Layout = op.layout ?? "embutido";
  const raiz = mkdtempSync(join(tmpdir(), `expx-repo-${op.nome}-`));
  const { skill, comandos } = caminhosDoLayout(op.nome, layout);

  mkdirSync(join(raiz, skill, "references"), { recursive: true });
  mkdirSync(join(raiz, comandos), { recursive: true });

  writeFileSync(
    join(raiz, skill, "SKILL.md"),
    op.corpo ??
      `---\nname: ${op.nome}\ndescription: Skill de fixture ${op.nome} para a suite do expx-cli\n---\n\n# ${op.nome}\n\nDetalhe em \`references/01.md\`.\n`,
  );
  writeFileSync(join(raiz, skill, "references", "01.md"), `# referencia de ${op.nome}\n`);
  writeFileSync(
    join(raiz, comandos, `${op.nome}.md`),
    `---\ndescription: comando ${op.nome}\n---\n\nInvoque a skill \`${op.nome}\`.\n`,
  );

  git(raiz, "init", "-q", "-b", "main");
  git(raiz, "add", "-A");
  git(raiz, "commit", "-q", "-m", `${op.nome}: commit inicial`);

  for (const tag of op.tags) {
    writeFileSync(join(raiz, skill, "references", "01.md"), `# referencia de ${op.nome} em ${tag}\n`);
    git(raiz, "add", "-A");
    git(raiz, "commit", "-q", "-m", `${op.nome}: ${tag}`);
    git(raiz, "tag", tag);
  }

  return raiz;
}
