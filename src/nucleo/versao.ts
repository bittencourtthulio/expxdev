import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

/**
 * Resolução de versão alvo de uma skill.
 *
 * A regra do método: por padrão, a MAIOR tag de versão semântica do
 * repositório. Sem nenhuma tag, cai para a branch padrão e avisa
 * explicitamente que a skill não está travada em versão publicada — nunca
 * segue a branch em silêncio quando existe tag.
 *
 * Hoje NENHUMA das sete skills tem tag (`base/08-repositorios-reais.md`), então
 * o caminho de fallback é o corrente na prática, não a exceção.
 */

export type Alvo = {
  ok: boolean;
  /** Tag escolhida, ou a branch padrão quando não há tag. */
  referencia: string;
  /** `false` quando a referência é branch: a skill não está travada em versão publicada. */
  travado: boolean;
  erro?: string;
};

const BRANCH_PADRAO = "main";

/** `v1.2.3` → [1,2,3]. Pré-lançamento (`-rc.1`) é ignorado: não é versão publicada. */
function partes(tag: string): [number, number, number] | undefined {
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tag.trim());
  if (m === null) return undefined;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/**
 * A maior tag semver da lista, ou `undefined` se nenhuma for semver.
 *
 * Compara número a número — ordenação de string colocaria `v1.10.0` antes de
 * `v1.2.0`, que é o erro clássico e justamente o que o teste cobre.
 */
export function maiorTagSemver(tags: readonly string[]): string | undefined {
  let melhor: { tag: string; p: [number, number, number] } | undefined;
  for (const tag of tags) {
    const p = partes(tag);
    if (p === undefined) continue;
    if (
      melhor === undefined ||
      p[0] > melhor.p[0] ||
      (p[0] === melhor.p[0] && p[1] > melhor.p[1]) ||
      (p[0] === melhor.p[0] && p[1] === melhor.p[1] && p[2] > melhor.p[2])
    ) {
      melhor = { tag, p };
    }
  }
  return melhor?.tag;
}

/** As tags publicadas de um repositório, sem as referências desreferenciadas (`^{}`). */
export async function listarTags(repositorio: string): Promise<string[]> {
  const { stdout } = await exec("git", ["ls-remote", "--tags", repositorio]);
  return stdout
    .split("\n")
    .filter((l) => l.includes("refs/tags/") && !l.endsWith("^{}"))
    .map((l) => l.slice(l.indexOf("refs/tags/") + "refs/tags/".length).trim())
    .filter((t) => t !== "");
}

/**
 * A referência que deve ser instalada.
 *
 * Repositório inacessível NÃO lança: devolve `ok: false` com o motivo, porque o
 * método exige que uma skill inacessível não aborte a instalação das demais.
 */
export async function resolverAlvo(repositorio: string, forcar?: string): Promise<Alvo> {
  if (forcar !== undefined && forcar !== "") {
    return { ok: true, referencia: forcar, travado: !forcar.includes(BRANCH_PADRAO) };
  }
  try {
    const tags = await listarTags(repositorio);
    const maior = maiorTagSemver(tags);
    if (maior !== undefined) return { ok: true, referencia: maior, travado: true };
    return { ok: true, referencia: BRANCH_PADRAO, travado: false };
  } catch (e: unknown) {
    return { ok: false, referencia: "", travado: false, erro: String(e) };
  }
}
