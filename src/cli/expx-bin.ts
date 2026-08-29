#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { executarExpx } from "./expx.js";

/**
 * Só roda quando executado como programa.
 *
 * Comparar `argv[1]` com `import.meta.url` diretamente NÃO funciona quando o
 * pacote está instalado: o npm cria `node_modules/.bin/expx` como symlink, a
 * igualdade falha e o CLI simplesmente não roda, sem erro nenhum. `realpath`
 * resolve os dois lados para o mesmo caminho. É o mesmo cuidado que
 * `principal.ts` já tomava.
 */
function executadoComoPrograma(): boolean {
  const argv = process.argv[1];
  if (argv === undefined) return false;
  const real = (p: string): string => {
    try {
      return realpathSync(p);
    } catch {
      return resolve(p);
    }
  };
  return real(argv) === real(fileURLToPath(import.meta.url));
}

if (executadoComoPrograma()) {
  executarExpx(process.argv.slice(2))
    .then((codigo) => {
      if (codigo !== 0) process.exit(codigo);
    })
    .catch((e: unknown) => {
      process.stderr.write(`erro no expx: ${String(e)}\n`);
      process.exit(1);
    });
}
