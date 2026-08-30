import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * A raiz do projeto: o diretório mais próximo que contém `.git`.
 *
 * O painel resolve isso com `--dir ./docs` e não precisa de mais nada. O watch
 * precisa de `docs/` E `.expx/` ao mesmo tempo, e `.expx/` não é descendente
 * de `docs/` — as duas só fazem sentido a partir da raiz do repositório
 * (decisão D-17).
 *
 * Sem `.git` em nenhum ancestral, devolvemos o diretório recebido: um projeto
 * ainda não versionado continua tendo `docs/` e `.expx/` no lugar certo.
 */
export function descobrirRaiz(partida: string = process.cwd()): string {
  let atual = resolve(partida);

  for (;;) {
    if (existsSync(join(atual, ".git"))) return atual;
    const pai = dirname(atual);
    if (pai === atual) return resolve(partida); // chegou na raiz do sistema
    atual = pai;
  }
}
