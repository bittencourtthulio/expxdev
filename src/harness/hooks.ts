import { chmodSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { SkillMontavel } from "../plugin/montagem.js";

/**
 * Materializa hooks de skill em `.claude/hooks/`, com a skill ao lado em
 * `.claude/skills/`.
 *
 * Os dois andam juntos por imposição do próprio hook: o do memox resolve o
 * motor como `DIR_HOOK/../skills/<nome>/assets/...`. Copiar o hook sem copiar a
 * skill produz um hook que sai `0` em silêncio — e como TODO caminho de erro
 * dele sai `0`, a instalação quebrada fica indistinguível de um projeto sem
 * artefatos. É por isso que a cópia da skill aqui é incondicional, e não
 * depende de o harness incluir `opencode` (decisões D-14 e D-15).
 *
 * Hooks são mecanismo do Claude Code. No OpenCode isso é lacuna declarada, não
 * paridade garantida.
 */

export type HookInstalado = {
  skill: string;
  /** Caminho do hook relativo à raiz do projeto, como vai para o settings.json. */
  relativo: string;
};

/** As skills que trazem hook. Sem nenhuma, nada é criado — nem a pasta. */
export function comHooks(skills: readonly SkillMontavel[]): SkillMontavel[] {
  return skills.filter((s) => (s.hooks?.length ?? 0) > 0);
}

/**
 * Copia hooks e skills para `.claude/`. Devolve os hooks instalados, na ordem,
 * para quem for registrá-los no `settings.json`.
 */
export function instalarHooks(raizProjeto: string, skills: readonly SkillMontavel[]): HookInstalado[] {
  const alvos = comHooks(skills);
  if (alvos.length === 0) return [];

  const dirHooks = join(raizProjeto, ".claude", "hooks");
  const dirSkills = join(raizProjeto, ".claude", "skills");
  mkdirSync(dirHooks, { recursive: true });
  mkdirSync(dirSkills, { recursive: true });

  const instalados: HookInstalado[] = [];
  for (const s of alvos) {
    // a skill vai junto: é o que o hook procura ao lado de si mesmo
    cpSync(s.raizSkill, join(dirSkills, s.nome), { recursive: true });

    for (const origem of s.hooks ?? []) {
      if (!existsSync(origem)) continue;
      const nome = basename(origem);
      const destino = join(dirHooks, nome);
      cpSync(origem, destino);
      // o bit de execução não é detalhe: sem ele o hook não roda, e não avisa
      chmodSync(destino, 0o755);
      instalados.push({ skill: s.nome, relativo: `.claude/hooks/${nome}` });
    }
  }
  return instalados;
}
