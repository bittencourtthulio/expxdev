import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

/**
 * Normaliza os layouts de repositório de skill.
 *
 * Os seis repositórios reais têm DOIS layouts distintos
 * (`base/08-repositorios-reais.md`):
 *
 *   embutido — `.claude/skills/<nome>/` + `.claude/commands/`  (sprintx, stackx, mergex, memox)
 *   plano    — `skill/` + `commands/`                          (runx, legadox)
 *
 * Por isso a detecção NÃO assume caminho fixo: procura o `SKILL.md` e toma o
 * diretório que o contém como raiz da skill. Um layout novo passa a funcionar
 * sem alterar esta camada, desde que o `SKILL.md` exista em algum lugar.
 */

export type Layout =
  | { ok: true; nome: string; raizSkill: string; comandos: string[]; hooks: string[] }
  | { ok: false; erro: string };

const IGNORADAS = new Set([".git", "node_modules", ".github", "dist"]);
const CANDIDATAS_COMANDOS = [join(".claude", "commands"), "commands", join(".opencode", "commands"), join(".opencode", "command")];
/** Hooks são mecanismo do Claude Code; o OpenCode não tem equivalente mapeado. */
const CANDIDATAS_HOOKS = [join(".claude", "hooks"), "hooks"];

/** Procura o SKILL.md mais raso, ignorando pastas de infraestrutura. */
function acharSkillMd(raiz: string, profundidadeMax = 5): string | undefined {
  const fila: Array<{ dir: string; nivel: number }> = [{ dir: raiz, nivel: 0 }];
  while (fila.length > 0) {
    const atual = fila.shift();
    if (atual === undefined) break;
    if (atual.nivel > profundidadeMax) continue;
    let entradas: string[];
    try {
      entradas = readdirSync(atual.dir);
    } catch {
      continue;
    }
    if (entradas.includes("SKILL.md")) return join(atual.dir, "SKILL.md");
    for (const e of entradas) {
      if (IGNORADAS.has(e)) continue;
      const p = join(atual.dir, e);
      try {
        if (statSync(p).isDirectory()) fila.push({ dir: p, nivel: atual.nivel + 1 });
      } catch {
        // entrada sumiu entre o readdir e o stat: ignora
      }
    }
  }
  return undefined;
}

/** O `name:` do frontmatter, que no OpenCode precisa bater com o nome da pasta. */
function nomeDoFrontmatter(skillMd: string): string | undefined {
  const bruto = readFileSync(skillMd, "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(bruto);
  if (m === null) return undefined;
  const linha = /^name:\s*(.+)$/m.exec(m[1] ?? "");
  return linha?.[1]?.trim().replace(/^["']|["']$/g, "");
}

/** Os arquivos de comando da skill, no primeiro diretório candidato que existir. */
function acharComandos(raiz: string, nome: string): string[] {
  for (const c of CANDIDATAS_COMANDOS) {
    const dir = join(raiz, c);
    if (!existsSync(dir)) continue;
    const arquivos = readdirSync(dir)
      .filter((a) => a.endsWith(".md"))
      .filter((a) => a === `${nome}.md` || a.startsWith(`${nome}-`))
      .map((a) => join(dir, a));
    if (arquivos.length > 0) return arquivos;
  }
  return [];
}

/**
 * Os hooks da skill. Mesmo PREFIXO usado para os comandos (`<nome>` ou
 * `<nome>-*`), mas sem o filtro de extensão: hooks são `.sh`, não `.md`.
 */
function acharHooks(raiz: string, nome: string): string[] {
  for (const c of CANDIDATAS_HOOKS) {
    const dir = join(raiz, c);
    if (!existsSync(dir)) continue;
    const arquivos = readdirSync(dir)
      .filter((a) => a === nome || a.startsWith(`${nome}-`) || a.startsWith(`${nome}.`))
      .map((a) => join(dir, a))
      // Repositório real tem PASTA de hook (a sprintx tem `.claude/hooks/sprintx/`),
      // e não só arquivo solto. Só arquivo é hook copiável; pasta é organização
      // interna da skill e já viaja junto na cópia da própria skill.
      .filter((a) => {
        try {
          return statSync(a).isFile();
        } catch {
          return false;
        }
      });
    if (arquivos.length > 0) return arquivos;
  }
  return [];
}

export function detectarLayout(raizRepo: string, nomeEsperado: string): Layout {
  const skillMd = acharSkillMd(raizRepo);
  if (skillMd === undefined) return { ok: false, erro: `SKILL.md nao encontrado em ${raizRepo}` };

  const raizSkill = join(skillMd, "..");
  const nome = nomeDoFrontmatter(skillMd) ?? basename(raizSkill);
  if (nome !== nomeEsperado) {
    return { ok: false, erro: `nome da skill e "${nome}", esperado "${nomeEsperado}"` };
  }
  return {
    ok: true,
    nome,
    raizSkill,
    comandos: acharComandos(raizRepo, nome),
    hooks: acharHooks(raizRepo, nome),
  };
}
