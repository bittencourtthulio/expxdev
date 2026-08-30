import { chmodSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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

/**
 * As skills que trazem hook. Sem nenhuma, nada é criado — nem a pasta.
 *
 * A árvore de hooks conta tanto quanto o arquivo solto. Quando a detecção
 * passou a usar `arvoreHooks`, o `hooks` virou `[]` para TODAS as skills reais
 * — elas guardam os hooks em subpasta — e esta função deixou de devolver
 * qualquer coisa. O efeito não foi "nada é instalado": foi pior, porque a
 * cópia da skill em `.claude/skills/` de instalações anteriores ficou órfã,
 * com a descrição velha, competindo para sempre com a do plugin.
 */
export function comHooks(skills: readonly SkillMontavel[]): SkillMontavel[] {
  return skills.filter((s) => (s.hooks?.length ?? 0) > 0 || s.arvoreHooks !== undefined);
}

/**
 * Copia hooks e skills para `.claude/`. Devolve os hooks instalados, na ordem,
 * para quem for registrá-los no `settings.json`.
 */
/**
 * O lembrete de skill, do núcleo.
 *
 * Ele NÃO pertence a nenhuma skill: é do método. Uma descrição de skill só
 * compete depois que o modelo decide procurar uma, e quando ele forma hipótese
 * técnica direto do relato essa decisão não acontece — a descrição, por melhor
 * que seja, nunca é lida. Medido em seis sessões seguidas com três descrições
 * diferentes. O `UserPromptSubmit` é o único ponto que roda antes disso.
 */
function instalarLembrete(dirHooks: string): HookInstalado | null {
  const origem = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "nucleo",
    "hooks",
    "expx-lembrete.sh",
  );
  if (!existsSync(origem)) return null; // núcleo ausente: falha aberta

  const destino = join(dirHooks, "expx-lembrete.sh");
  cpSync(origem, destino);
  chmodSync(destino, 0o755);
  return { skill: "expx", relativo: ".claude/hooks/expx-lembrete.sh" };
}

export function instalarHooks(raizProjeto: string, skills: readonly SkillMontavel[]): HookInstalado[] {
  const alvos = comHooks(skills);
  if (alvos.length === 0) return [];

  const dirHooks = join(raizProjeto, ".claude", "hooks");
  const dirSkills = join(raizProjeto, ".claude", "skills");
  mkdirSync(dirHooks, { recursive: true });
  mkdirSync(dirSkills, { recursive: true });

  const instalados: HookInstalado[] = [];
  const lembrete = instalarLembrete(dirHooks);
  if (lembrete !== null) instalados.push(lembrete);
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
