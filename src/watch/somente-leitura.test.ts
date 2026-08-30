import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { cpSync, mkdtempSync, rmSync, statSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { executarWatch, type SessaoWatch } from "./watch.js";

/**
 * T-03.08 — a prova de que o watch NUNCA escreve em disco.
 *
 * Decisão D-03: "somente leitura, sem exceção". Um teste transforma a promessa
 * em impossibilidade técnica.
 *
 * A prova tem duas metades, porque nenhuma delas basta sozinha:
 *
 *  1. ESTÁTICA — nenhum arquivo de `src/watch/` sequer IMPORTA uma função de
 *     escrita. É o que espionar `node:fs` tentaria provar em tempo de
 *     execução, e não dá: em ESM o namespace do módulo é congelado, então
 *     `vi.spyOn(fs, "writeFileSync")` lança `Cannot redefine property`. A
 *     verificação estática é mais forte de qualquer forma: cobre todo caminho
 *     de código, inclusive os que o teste não exercita.
 *
 *  2. DINÂMICA — rodar o loop inteiro sobre uma cópia e conferir que nenhum
 *     mtime mudou e nenhum arquivo apareceu ou sumiu.
 */

/** Tudo que escreve, nos dois módulos. */
const ESCRITORAS = [
  "writeFile",
  "writeFileSync",
  "appendFile",
  "appendFileSync",
  "createWriteStream",
  "mkdir",
  "mkdirSync",
  "rename",
  "renameSync",
  "unlink",
  "unlinkSync",
  "rm",
  "rmSync",
  "rmdir",
  "rmdirSync",
  "copyFile",
  "copyFileSync",
  "truncate",
  "truncateSync",
];

/**
 * `open`/`openSync` não escrevem por si: o que decide é o modo. Ficam fora da
 * lista acima e ganham verificação própria — todo `openSync` do watch tem de
 * abrir com `"r"`, e essa é uma garantia mais precisa do que proibir a função.
 */
const ABERTURA = /\bopenSync\s*\(\s*[^,)]+,\s*("([^"]*)"|'([^']*)')/g;

let dir: string | undefined;
let sessao: SessaoWatch | undefined;

afterEach(async () => {
  if (sessao !== undefined) await sessao.parar();
  sessao = undefined;
  if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

function projetoTemporario(fixture: string): string {
  const d = mkdtempSync(join(tmpdir(), "expx-ro-"));
  cpSync(`fixtures/watch/${fixture}`, d, { recursive: true });
  return d;
}

/** Caminho relativo -> mtime, de tudo que existe sob a raiz. */
function retrato(raiz: string): Map<string, number> {
  const mapa = new Map<string, number>();
  const desce = (p: string): void => {
    for (const nome of readdirSync(p)) {
      const caminho = join(p, nome);
      const info = statSync(caminho);
      if (info.isDirectory()) desce(caminho);
      else mapa.set(relative(raiz, caminho), info.mtimeMs);
    }
  };
  desce(raiz);
  return mapa;
}

/** Os arquivos de produção do watch — os testes podem escrever à vontade. */
function fontesDoWatch(): string[] {
  const saida: string[] = [];
  const desce = (p: string): void => {
    for (const nome of readdirSync(p)) {
      const caminho = join(p, nome);
      if (statSync(caminho).isDirectory()) desce(caminho);
      else if (nome.endsWith(".ts") && !nome.endsWith(".test.ts")) saida.push(caminho);
    }
  };
  desce("src/watch");
  return saida.sort();
}

describe("somente leitura", () => {
  it("integração: nenhum arquivo de produção do watch importa função de escrita", () => {
    const fontes = fontesDoWatch();
    expect(fontes.length).toBeGreaterThan(10); // a rede está sobre o código todo

    const infratores: string[] = [];
    for (const arquivo of fontes) {
      const codigo = readFileSync(arquivo, "utf8");

      // o que o arquivo importa de node:fs e node:fs/promises
      for (const m of codigo.matchAll(/import\s*\{([^}]+)\}\s*from\s*"node:fs(?:\/promises)?"/g)) {
        const nomes = (m[1] ?? "").split(",").map((n) => n.trim().split(/\s+as\s+/)[0]?.trim());
        for (const nome of nomes) {
          if (nome !== undefined && ESCRITORAS.includes(nome)) {
            infratores.push(`${arquivo}: importa ${nome}`);
          }
        }
      }

      // e uso por namespace, do tipo `fs.writeFileSync(...)`
      for (const escritora of ESCRITORAS) {
        if (new RegExp(`\\bfsp?\\.${escritora}\\s*\\(`).test(codigo)) {
          infratores.push(`${arquivo}: chama fs.${escritora}`);
        }
      }

      // `openSync` só é aceito com modo de leitura
      for (const m of codigo.matchAll(ABERTURA)) {
        const modo = m[2] ?? m[3] ?? "";
        if (modo !== "r") {
          infratores.push(`${arquivo}: openSync com modo ${JSON.stringify(modo)}`);
        }
      }
    }

    expect(infratores, `o watch importa escrita:\n${infratores.join("\n")}`).toEqual([]);
  });

  it("funcional: nenhum mtime muda depois de um ciclo completo do loop", async () => {
    dir = projetoTemporario("com-estado");

    sessao = await executarWatch({
      raiz: dir,
      opcoes: { trabalho: undefined, todos: false, ajuda: false, colunas: 80 },
      escrever: () => undefined,
      cor: false,
      debounceMs: 40,
    });

    // O ciclo completo: mudança no plano e mudança no rastro, feitas pelo
    // TESTE. O retrato é tirado depois delas, para medir só o watch.
    const tasks = join(dir, "docs", "exportacao-csv", "sprint-01", "tasks.md");
    writeFileSync(
      tasks,
      readFileSync(tasks, "utf8").replace("status: em_andamento", "status: concluida"),
    );
    await new Promise((r) => setTimeout(r, 300));

    const antes = retrato(dir);
    await new Promise((r) => setTimeout(r, 400));
    const depois = retrato(dir);

    expect([...depois.keys()].sort()).toEqual([...antes.keys()].sort());
    for (const [caminho, mtime] of antes) {
      expect(depois.get(caminho), `${caminho} teve o mtime alterado`).toBe(mtime);
    }
  });

  it("funcional: o watch não cria nem apaga arquivo, nem em projeto sem .expx", async () => {
    dir = projetoTemporario("sem-trabalho");
    const antes = retrato(dir);

    const r = await executarWatch({
      raiz: dir,
      opcoes: { trabalho: undefined, todos: false, ajuda: false, colunas: 80 },
      escrever: () => undefined,
      cor: false,
    });
    expect(r.encerrou).toBe(true);
    sessao = undefined;

    expect([...retrato(dir).keys()].sort()).toEqual([...antes.keys()].sort());
  });

  it("funcional: rodar o binário de verdade não deixa rastro no projeto", () => {
    dir = projetoTemporario("com-bloqueio");
    cpSync("fixtures/watch/com-estado/.expx", join(dir, ".expx"), { recursive: true });
    const antes = retrato(dir);

    // o binário compilado, num processo separado: é o que o usuário roda
    try {
      execFileSync(
        process.execPath,
        [join(process.cwd(), "dist/cli/expx-bin.js"), "watch", "--colunas", "80"],
        { cwd: dir, timeout: 2500, stdio: "ignore" },
      );
    } catch {
      // o timeout mata o processo: é o esperado, ele fica observando
    }

    const depois = retrato(dir);
    expect([...depois.keys()].sort()).toEqual([...antes.keys()].sort());
    for (const [caminho, mtime] of antes) {
      expect(depois.get(caminho), `${caminho} mudou`).toBe(mtime);
    }
  });
});
