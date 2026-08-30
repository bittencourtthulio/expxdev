import { describe, it, expect, afterEach } from "vitest";
import { cpSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { executarWatch, type SessaoWatch } from "./watch.js";

/**
 * T-03.06 — o loop: ler, desenhar, observar, redesenhar.
 *
 * O que este teste protege acima de tudo: "a árvore completa vem dos arquivos
 * do plano, relida apenas quando eles mudam — não a cada redesenho". Com um
 * observador de gatilho único, uma linha nova no rastro releria o plano
 * inteiro, e a promessa se perderia em silêncio.
 */

let dir: string | undefined;
let sessao: SessaoWatch | undefined;

afterEach(async () => {
  if (sessao !== undefined) await sessao.parar();
  sessao = undefined;
  if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

/** Copia uma fixture para pasta temporária: nunca escrevemos na origem. */
function copiar(fixture: string): string {
  const d = mkdtempSync(join(tmpdir(), "expx-watch-"));
  cpSync(`fixtures/watch/${fixture}`, d, { recursive: true });
  return d;
}

const espera = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function saidaFalsa(): { linhas: string[][]; escrever: (t: string) => void } {
  const linhas: string[][] = [];
  return { linhas, escrever: (t) => linhas.push([t]) };
}

describe("loop do watch", () => {
  it("integração: mudar o plano redesenha; mudar só o rastro não relê o plano", async () => {
    dir = copiar("com-estado");
    const f = saidaFalsa();
    let leiturasDoPlano = 0;

    sessao = await executarWatch({
      raiz: dir,
      opcoes: { trabalho: undefined, todos: false, ajuda: false, colunas: 80 },
      escrever: f.escrever,
      cor: false,
      debounceMs: 40,
      aoLerPlano: () => leiturasDoPlano++,
    });

    const noInicio = leiturasDoPlano;
    expect(noInicio).toBe(1); // a leitura de partida

    // 1. mudou o PLANO: relê
    const tasks = join(dir, "docs", "exportacao-csv", "sprint-01", "tasks.md");
    writeFileSync(tasks, readFileSync(tasks, "utf8").replace("status: em_andamento", "status: concluida"));
    await espera(400);
    expect(leiturasDoPlano, "mudança no plano deveria reler").toBe(noInicio + 1);

    // 2. mudou só o RASTRO: NÃO relê o plano
    const depoisDoPlano = leiturasDoPlano;
    const rastro = join(dir, "docs", "eventos", "exportacao-csv.jsonl");
    writeFileSync(
      rastro,
      readFileSync(rastro, "utf8") +
        '{"ts":"2026-08-29T15:00:00Z","expx_eventos":1,"trabalho_id":"exportacao-csv","ferramenta":"sprintx","origem":"hook","evento":"suite_executada","fase":"f6","task":"T-01.02","agente":"principal","resultado":"ok","detalhe":"nova","arquivos":[]}\n',
    );
    await espera(400);
    expect(leiturasDoPlano, "mudança só no rastro NÃO deveria reler o plano").toBe(depoisDoPlano);
  });

  it("funcional: id posicional seleciona o trabalho nomeado", async () => {
    dir = copiar("varios-trabalhos");
    const f = saidaFalsa();

    sessao = await executarWatch({
      raiz: dir,
      opcoes: { trabalho: "bloqueado", todos: false, ajuda: false, colunas: 80 },
      escrever: f.escrever,
      cor: false,
      debounceMs: 40,
    });

    const texto = f.linhas.flat().join("");
    expect(texto).toContain("bloqueado");
    expect(texto).not.toContain("em-andamento");
  });

  it("funcional: projeto sem .expx escreve mensagem clara e devolve código zero", async () => {
    dir = copiar("sem-trabalho"); // não tem .expx/
    const f = saidaFalsa();

    const r = await executarWatch({
      raiz: dir,
      opcoes: { trabalho: undefined, todos: false, ajuda: false, colunas: 80 },
      escrever: f.escrever,
      cor: false,
      debounceMs: 40,
    });

    expect(r.codigo).toBe(0);
    expect(r.encerrou).toBe(true);
    expect(f.linhas.flat().join("")).toContain("Expx");
    sessao = undefined; // já encerrou sozinho
  });

  it("funcional: estado.json corrompido continua funcionando pela leitura do plano", async () => {
    dir = copiar("estado-invalido");
    const f = saidaFalsa();

    sessao = await executarWatch({
      raiz: dir,
      opcoes: { trabalho: undefined, todos: false, ajuda: false, colunas: 80 },
      escrever: f.escrever,
      cor: false,
      debounceMs: 40,
    });

    const texto = f.linhas.flat().join("");
    // a árvore veio do plano, apesar do estado.json quebrado
    expect(texto).toContain("exportacao-csv");
    expect(texto).toContain("T-01.01");
  });
});
