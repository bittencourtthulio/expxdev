import { cpSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { SkillMontavel } from "../plugin/montagem.js";

/**
 * Materializa as skills e comandos onde o OpenCode os encontra.
 *
 * O namespace de plugin é do Claude Code; no OpenCode ele não existe. Por isso
 * os comandos vão sem prefixo.
 *
 * As skills vão SOMENTE para `.claude/skills/`, que o OpenCode lê nativamente.
 * Copiar também para `.opencode/skills/` criaria duas cópias do mesmo `name`
 * nas pastas que o OpenCode varre, e a duplicata é resolvida por
 * last-writer-wins com apenas um aviso no log — ou seja, silenciosamente. O
 * `doctor` detecta essa colisão caso ela apareça por outro caminho.
 *
 * `commands/` no plural é a forma documentada. Os repositórios reais divergem
 * entre `.opencode/command/` e `.opencode/commands/`; normalizar aqui evita
 * projetos inconsistentes.
 */
export function materializarOpenCode(raizProjeto: string, skills: readonly SkillMontavel[]): void {
  const dirSkills = join(raizProjeto, ".claude", "skills");
  const dirComandos = join(raizProjeto, ".opencode", "commands");
  mkdirSync(dirSkills, { recursive: true });
  mkdirSync(dirComandos, { recursive: true });

  for (const s of skills) {
    // O nome da pasta precisa continuar igual ao `name` do frontmatter: o
    // OpenCode exige que os dois batam para descobrir a skill.
    cpSync(s.raizSkill, join(dirSkills, s.nome), { recursive: true });
    for (const c of s.comandos) cpSync(c, join(dirComandos, basename(c)));
  }
}
