import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Pasta isolada para testes que escrevem em disco.
 *
 * O CLI escreve de verdade (`.expx/`, `.claude/settings.json`), então testá-lo
 * exige um projeto real, não um mock de fs. Copiar a fixture para uma pasta
 * temporária mantém as fixtures do repositório intactas: um teste que
 * sobrescreve a origem contamina todos os outros.
 */
export type ProjetoTemporario = {
  raiz: string;
  descartar: () => void;
};

/** Cria a pasta; com `origem`, copia o conteúdo dela para dentro. */
export function projetoTemporario(origem?: string): ProjetoTemporario {
  const raiz = mkdtempSync(join(tmpdir(), "expx-projeto-"));
  if (origem !== undefined) cpSync(origem, raiz, { recursive: true });
  return {
    raiz,
    descartar: () => {
      rmSync(raiz, { recursive: true, force: true });
    },
  };
}
