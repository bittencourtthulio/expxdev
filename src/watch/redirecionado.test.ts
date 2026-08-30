import { describe, it, expect, afterEach } from "vitest";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { principalWatch } from "./principal.js";

/**
 * A fixture 10 da especificação: "saída redirecionada para arquivo".
 *
 * Não é um diretório, é um MODO: `stdout.isTTY` falso. Regressão registrada:
 * a primeira versão vazava um escape — o de restaurar o cursor — porque o
 * restaurador olhava a cor em vez do TTY, e `NO_COLOR` num terminal real
 * ainda precisa de controle de cursor.
 */

let dir: string | undefined;

afterEach(() => {
  if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("saída redirecionada", () => {
  it("integração: sem TTY, nenhum escape ANSI chega à saída", async () => {
    dir = mkdtempSync(join(tmpdir(), "expx-redir-"));
    cpSync("fixtures/watch/com-bloqueio", dir, { recursive: true });
    cpSync("fixtures/watch/com-estado/.expx", join(dir, ".expx"), { recursive: true });

    const escrito: string[] = [];
    const codigo = await principalWatch(
      ["--colunas", "80"],
      { escrever: (t) => escrito.push(t), escreverErro: (t) => escrito.push(t) },
      dir,
    );
    expect(codigo).toBe(0);

    const texto = escrito.join("");
    expect(texto.length).toBeGreaterThan(0);
    // Nenhum escape: nem cor, nem cursor, nem posicionamento.
    expect(texto.includes("\u001b"), `escape vazou: ${JSON.stringify(texto.slice(0, 200))}`).toBe(
      false,
    );

    // e o conteúdo esperado está lá
    expect(texto).toContain("1 bloqueio aberto");
    expect(texto).toContain("T-01.02");
  });

  it("funcional: projeto sem .expx sai limpo, com código zero e sem escape", async () => {
    dir = mkdtempSync(join(tmpdir(), "expx-semexpx-"));
    cpSync("fixtures/watch/sem-trabalho", dir, { recursive: true });

    const escrito: string[] = [];
    const codigo = await principalWatch(
      [],
      { escrever: (t) => escrito.push(t), escreverErro: (t) => escrito.push(t) },
      dir,
    );

    expect(codigo).toBe(0);
    const texto = escrito.join("");
    expect(texto).toContain("Expx");
    expect(texto.includes("\u001b")).toBe(false);
  });
});
