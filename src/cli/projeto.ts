import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { caminhoDoLock } from "../nucleo/lock.js";

/**
 * O que o CLI precisa saber sobre o projeto antes de tocar em qualquer coisa.
 *
 * `existe` distingue instalação nova de reconfiguração — e reconfiguração nunca
 * apaga nada sem confirmação explícita.
 */

export type Projeto = {
  raiz: string;
  versionado: boolean;
  existe: boolean;
  lock: string;
};

export function detectarProjeto(raiz: string): Projeto {
  const lock = caminhoDoLock(raiz);
  return {
    raiz,
    versionado: existsSync(join(raiz, ".git")),
    existe: existsSync(join(raiz, ".expx")),
    lock,
  };
}

/**
 * O `.expx/` é commitado: as skills viajam com o repositório, e é isso que
 * permite a quem clona trabalhar sem rede. Um `.gitignore` que o ignore quebra
 * a premissa inteira em silêncio, então o CLI verifica.
 */
export function expxNoGitignore(raiz: string): boolean {
  const caminho = join(raiz, ".gitignore");
  if (!existsSync(caminho)) return false;
  return readFileSync(caminho, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"))
    .some((l) => l === ".expx" || l === ".expx/" || l === "/.expx" || l === "/.expx/");
}
