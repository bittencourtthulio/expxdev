import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * Detecção de modificação local.
 *
 * Quem ajustou uma skill à mão não pode perder o trabalho por rodar um comando
 * de rotina. Por isso o lock guarda o hash de CADA arquivo, e não um hash único
 * da árvore: só assim o `update` consegue LISTAR quais arquivos mudaram, que é
 * o que a decisão exige para oferecer manter, substituir ou salvar ao lado.
 */

export type Hashes = Record<string, string>;

export type Divergencia = {
  limpo: boolean;
  alterados: string[];
  removidos: string[];
  novos: string[];
};

const IGNORADAS = new Set([".git", "node_modules"]);

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
        else saida.push(p);
      } catch {
        // entrada sumiu entre o readdir e o stat: ignora
      }
    }
  }
  return saida.sort();
}

/** Caminho relativo com separador normalizado, para o lock não depender do SO. */
function chave(raiz: string, arquivo: string): string {
  return relative(raiz, arquivo).split(sep).join("/");
}

export function hashDoArquivo(caminho: string): string {
  return createHash("sha256").update(readFileSync(caminho)).digest("hex");
}

/** O hash de cada arquivo da pasta, indexado pelo caminho relativo. */
export function hashearPasta(raiz: string): Hashes {
  const saida: Hashes = {};
  for (const a of arquivosDe(raiz)) saida[chave(raiz, a)] = hashDoArquivo(a);
  return saida;
}

/** Compara o disco com os hashes do lock. `limpo: true` = nada mudou. */
export function compararComHashes(raiz: string, esperados: Hashes): Divergencia {
  const atuais = hashearPasta(raiz);
  const alterados: string[] = [];
  const removidos: string[] = [];
  const novos: string[] = [];

  for (const [rel, hash] of Object.entries(esperados)) {
    const atual = atuais[rel];
    if (atual === undefined) removidos.push(rel);
    else if (atual !== hash) alterados.push(rel);
  }
  for (const rel of Object.keys(atuais)) {
    if (esperados[rel] === undefined) novos.push(rel);
  }

  const norm = (l: string[]): string[] => l.map((x) => x.split("/").join(sep)).sort();
  return {
    limpo: alterados.length === 0 && removidos.length === 0 && novos.length === 0,
    alterados: norm(alterados),
    removidos: norm(removidos),
    novos: norm(novos),
  };
}
