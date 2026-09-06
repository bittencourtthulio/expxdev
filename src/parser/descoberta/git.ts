import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { ehCandidato } from "./varredura.js";
import { classificar } from "../leitura/rejeicao.js";
import type { Aceito, Rejeicao } from "../leitura/rejeicao.js";

/**
 * Descoberta de arquivos de estado em branches locais não ativas (OC-2026-002 / T-01.05).
 *
 * A varredura de filesystem (`varredura.ts`) só enxerga o checkout ativo. No
 * ExpxCMS cada feature vive na sua própria branch (padrão `mergex`), nunca
 * mesclada em `main` — sem isto, o painel nunca mostraria essas features.
 *
 * Lê via `git show <branch>:<caminho>`, sem checkout: nunca toca o working
 * tree do usuário. Se `raiz` não for um repositório git, ou `git` não estiver
 * disponível, devolve lista vazia — a descoberta de filesystem continua
 * funcionando normalmente (rede de segurança, como o resto do parser).
 */

export type AceitoEmBranch = Aceito & { branch: string };

function git(raiz: string, ...args: readonly string[]): string {
  return execFileSync("git", args, { cwd: raiz, encoding: "utf8" }).trim();
}

/**
 * `raiz` só pode ser tratada como repositório git quando ELA MESMA é a raiz
 * do repositório — nunca uma subpasta. Sem esta checagem, `git` sobe até
 * encontrar `.git` em um ancestral e passa a operar sobre o repositório
 * inteiro do usuário (ex.: `fixtures/projeto-ok` dentro do próprio
 * repositório Expx), lendo branches e arquivos completamente alheios ao que
 * `raiz` pediu. Comparar com `git rev-parse --show-toplevel`: só é a raiz
 * quando os dois caminhos resolvidos coincidem.
 *
 * Cacheada por `raiz`: `descobrirTrabalhos` roda a cada releitura do painel
 * (potencialmente centenas de vezes por sessão de watch), e cada chamada não
 * cacheada custa 2-3 processos `git` síncronos só para decidir "não é repo" —
 * caro o bastante para estourar timeout de teste sob carga concorrente.
 */
const CACHE_TOPO = new Map<string, string | null>();

function topoDoRepositorio(raiz: string): string | null {
  const cache = CACHE_TOPO.get(raiz);
  if (cache !== undefined) return cache;
  let topo: string | null;
  try {
    // `realpathSync` resolve symlinks (ex.: /var -> /private/var no macOS),
    // que git e o Node podem normalizar de formas diferentes — comparar os
    // caminhos crus faria um repositório real ser lido como "não é a raiz".
    topo = realpathSync(git(raiz, "rev-parse", "--show-toplevel"));
  } catch {
    topo = null;
  }
  CACHE_TOPO.set(raiz, topo);
  return topo;
}

function ehRaizDeRepositorio(raiz: string): boolean {
  const topo = topoDoRepositorio(raiz);
  if (topo === null) return false;
  try {
    return topo === realpathSync(raiz);
  } catch {
    return false;
  }
}

/** As branches locais, na ordem que o git as lista. `[]` se não for a raiz de um repo git. */
function branchesLocais(raiz: string): string[] {
  if (!ehRaizDeRepositorio(raiz)) return [];
  try {
    const saida = git(raiz, "branch", "--format=%(refname:short)");
    return saida === "" ? [] : saida.split("\n");
  } catch {
    return [];
  }
}

/** Limpa o cache de topo de repositório — só para teste, entre `mkdtempSync` reaproveitando caminhos. */
export function limparCacheGit(): void {
  CACHE_TOPO.clear();
}

/** Os arquivos candidatos de uma branch, pelo mesmo filtro de nome da varredura de filesystem. */
function candidatosNaBranch(raiz: string, branch: string): string[] {
  try {
    const saida = git(raiz, "ls-tree", "-r", "--name-only", branch);
    if (saida === "") return [];
    return saida.split("\n").filter((caminho) => ehCandidato(caminho));
  } catch {
    // branch inválida ou corrompida: não derruba a descoberta das demais.
    return [];
  }
}

/** O conteúdo de um arquivo numa branch, via git show. `null` se o arquivo não existe ali. */
function conteudoNaBranch(raiz: string, branch: string, caminho: string): string | null {
  try {
    return git(raiz, "show", `${branch}:${caminho}`);
  } catch {
    return null;
  }
}

function hashDoConteudo(conteudo: string): string {
  return createHash("sha256").update(conteudo).digest("hex");
}

/**
 * Descobre arquivos de estado em toda branch local, deduplicando quando o
 * mesmo caminho tem o mesmo conteúdo byte a byte em mais de uma branch —
 * o caso de branches encadeadas (uma nasce da outra, sem alterar a pasta).
 */
export function descobrirEmBranches(
  raiz: string,
  branchAtiva: string | null,
): { aceitos: AceitoEmBranch[]; rejeicoes: Rejeicao[] } {
  const branches = branchesLocais(raiz);
  const aceitos: AceitoEmBranch[] = [];
  const rejeicoes: Rejeicao[] = [];
  /** caminho -> hash do conteúdo já aceito, para não duplicar entre branches. */
  const vistos = new Map<string, string>();

  for (const branch of branches) {
    if (branch === branchAtiva) continue; // o checkout ativo já foi lido por filesystem
    for (const caminho of candidatosNaBranch(raiz, branch)) {
      const conteudo = conteudoNaBranch(raiz, branch, caminho);
      if (conteudo === null) continue;

      const hash = hashDoConteudo(conteudo);
      if (vistos.get(caminho) === hash) continue; // mesma pasta, mesmo conteúdo: já visto em outra branch
      vistos.set(caminho, hash);

      const r = classificar(caminho, conteudo);
      if (r.tipo === "rejeitado") {
        rejeicoes.push(r);
        continue;
      }
      aceitos.push({ ...r, branch });
    }
  }

  return { aceitos, rejeicoes };
}

/**
 * A branch atualmente em checkout, ou `null` se `raiz` não for a raiz de um
 * repositório git (ou HEAD destacado). Mesma checagem de `ehRaizDeRepositorio`
 * — nunca resolve para um repositório ancestral.
 */
export function branchAtiva(raiz: string): string | null {
  if (!ehRaizDeRepositorio(raiz)) return null;
  try {
    const nome = git(raiz, "rev-parse", "--abbrev-ref", "HEAD");
    return nome === "HEAD" ? null : nome; // "HEAD" = detached HEAD, sem branch nomeada
  } catch {
    return null;
  }
}
