import { readdirSync, statSync } from "node:fs";
import { basename, join, sep } from "node:path";

/**
 * Quais arquivos são candidatos a arquivo de estado (decisão D-11).
 *
 * Isto é o que impede a tela "fora do schema" de virar ruído: as skills
 * declaram explicitamente que os arquivos de recurso da base, o `00-LACUNAS.md`
 * e o `00-AUDITORIA.md` NÃO levam frontmatter. Um projeto real tem dezenas
 * deles. Varrer todo `.md` e reportar os sem frontmatter encheria a tela de
 * falsos — exatamente o que a definição de pronto proíbe.
 *
 * Por isso a varredura é por nome conhecido, não por extensão.
 */

const NOMES_EXATOS = new Set([
  "ORQUESTRADOR.md",
  "00-BLOQUEIOS.md",
  "BLOQUEIOS.md",
  "00-DECISOES.md",
  "00-OCORRENCIA.md",
  "01-CAUSA-RAIZ.md",
  "QA.md",
  "sprint.md",
  "fases.md",
  "tasks.md",
  "INDICE.md",
  "tecnico.md",
  "uso.md",
  // so conta dentro de base/ — ver ehCandidato
  "00-INDICE.md",
]);

const PASTAS_IGNORADAS = new Set(["node_modules", ".git", "dist", ".next", "coverage"]);

export function ehCandidato(caminho: string): boolean {
  const partes = caminho.split(/[\\/]/);
  if (partes.some((p) => PASTAS_IGNORADAS.has(p))) return false;

  const nome = basename(caminho);
  if (!NOMES_EXATOS.has(nome)) return false;

  // 00-INDICE.md só conta dentro de base/
  if (nome === "00-INDICE.md") {
    return partes[partes.length - 2] === "base";
  }
  // 00-LACUNAS.md e 00-AUDITORIA.md nunca são candidatos: sem frontmatter por contrato
  return true;
}

export function varrerCandidatos(raiz: string, profundidadeMax = 12): string[] {
  const saida: string[] = [];

  function desce(dir: string, nivel: number): void {
    if (nivel > profundidadeMax) return;
    let entradas: string[];
    try {
      entradas = readdirSync(dir);
    } catch {
      return; // pasta sumiu ou sem permissão: ignora, nunca derruba
    }
    for (const nome of entradas) {
      if (PASTAS_IGNORADAS.has(nome)) continue;
      const caminho = join(dir, nome);
      let info;
      try {
        info = statSync(caminho);
      } catch {
        continue;
      }
      if (info.isDirectory()) desce(caminho, nivel + 1);
      else if (ehCandidato(caminho)) saida.push(caminho);
    }
  }

  desce(raiz, 0);
  return saida.sort();
}

export { sep };
