import { describe, it, expect, afterEach } from "vitest";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projetarVisao } from "../visao/projetar.js";
import { desenharLista } from "./lista.js";
import { largura } from "./largura.js";
import { executarWatch, type SessaoWatch } from "../watch.js";

/**
 * T-03.09 — `--todos` e o caso "nenhum trabalho aberto".
 *
 * Decisão D-16: aberto é todo status diferente de `concluido`. Decisão D-19:
 * sem trabalho aberto, mostra os trabalhos e SEGUE observando — não encerra.
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;

let dir: string | undefined;
let sessao: SessaoWatch | undefined;

afterEach(async () => {
  if (sessao !== undefined) await sessao.parar();
  sessao = undefined;
  if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("lista de trabalhos", () => {
  it("integração: sobre sem-trabalho o loop continua ativo em vez de encerrar", async () => {
    dir = mkdtempSync(join(tmpdir(), "expx-lista-"));
    cpSync(raiz("sem-trabalho"), dir, { recursive: true });
    cpSync(raiz("com-estado/.expx"), join(dir, ".expx"), { recursive: true });

    const escrito: string[] = [];
    sessao = await executarWatch({
      raiz: dir,
      opcoes: { trabalho: undefined, todos: true, ajuda: false, colunas: 80 },
      escrever: (t) => escrito.push(t),
      cor: false,
      debounceMs: 40,
    });

    // D-19: não encerra — fica aguardando um trabalho novo
    expect(sessao.encerrou).toBe(false);
    expect(escrito.join("")).toContain("nenhum trabalho aberto");
  });

  it("funcional: --todos traz nao_iniciado, bloqueado e em_andamento, e omite o concluido", () => {
    const v = projetarVisao(raiz("varios-trabalhos"));
    const linhas = desenharLista(v, 80, false);
    const texto = linhas.join("\n");

    expect(texto).toContain("nao-iniciado");
    expect(texto).toContain("bloqueado");
    expect(texto).toContain("em-andamento");
    // o concluído fica de fora (D-16)
    expect(linhas.filter((l) => /\bconcluido\b/.test(l)).length).toBe(0);

    // um trabalho por linha, sem árvore: nenhuma task aparece
    expect(texto).not.toContain("T-01.");
    expect(texto).not.toContain("sprint-01");
  });

  it("funcional: a lista respeita a largura e não quebra linha", () => {
    const v = projetarVisao(raiz("varios-trabalhos"));
    for (const colunas of [80, 60]) {
      for (const l of desenharLista(v, colunas, false)) {
        expect(largura(l)).toBeLessThanOrEqual(colunas);
      }
    }
    // mesma quantidade de linhas nas duas larguras
    expect(desenharLista(v, 60, false).length).toBe(desenharLista(v, 80, false).length);
  });

  it("funcional: a lista marca bloqueio aberto no trabalho", () => {
    const v = projetarVisao(raiz("com-bloqueio"));
    const texto = desenharLista(v, 80, false).join("\n");
    expect(texto).toContain("bloq");
  });
});
