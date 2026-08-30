import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Recusa skill que referencie arquivo fora da própria raiz.
 *
 * Isto não é precaução teórica: foi medido. Ao instalar, o Claude Code COPIA o
 * plugin para `~/.claude/plugins/cache/<marketplace>/<plugin>/<versao>/`, e só
 * a pasta do plugin vai junto — qualquer `../` sai da árvore copiada e aponta
 * para o vazio. O experimento está em
 * `docs/expx-cli/base/09-validacao-marketplace-local.md`.
 *
 * Hoje as seis skills reais estão limpas; a verificação existe para pegar a
 * regressão futura antes que ela chegue no usuário.
 */

export type Achado = {
  /** Caminho do arquivo, relativo à raiz da skill. */
  arquivo: string;
  /** A referência infratora, como aparece no texto. */
  referencia: string;
  linha: number;
};

const EXTENSOES = new Set([".md", ".json", ".yaml", ".yml", ".txt"]);
const IGNORADAS = new Set([".git", "node_modules"]);

/** `../algo`, com ou sem `./` na frente. */
const PADRAO = /(?:^|[\s`'"(\[])((?:\.\/)?(?:\.\.\/)+[\w./-]+)/g;

function arquivosDe(raiz: string): string[] {
  const saida: string[] = [];
  const fila = [raiz];
  while (fila.length > 0) {
    const dir = fila.shift();
    if (dir === undefined) break;
    let entradas: string[];
    try {
      entradas = readdirSync(dir);
    } catch {
      continue;
    }
    for (const e of entradas) {
      if (IGNORADAS.has(e)) continue;
      const p = join(dir, e);
      try {
        if (statSync(p).isDirectory()) fila.push(p);
        else if ([...EXTENSOES].some((x) => e.endsWith(x))) saida.push(p);
      } catch {
        // entrada sumiu entre o readdir e o stat: ignora
      }
    }
  }
  return saida;
}

/** Lista as referências que saem da raiz da skill. Lista vazia = skill sadia. */
export function verificarCaminhos(raizSkill: string): Achado[] {
  const achados: Achado[] = [];
  for (const arquivo of arquivosDe(raizSkill)) {
    let texto: string;
    try {
      texto = readFileSync(arquivo, "utf8");
    } catch {
      continue;
    }
    texto.split("\n").forEach((linha, i) => {
      for (const m of linha.matchAll(PADRAO)) {
        const ref = m[1];
        if (ref === undefined) continue;
        achados.push({
          arquivo: relative(raizSkill, arquivo),
          referencia: ref,
          linha: i + 1,
        });
      }
    });
  }
  return achados;
}
