import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws";
import { iniciarPainel, type Painel } from "./painel.js";

let painel: Painel | null = null;
let dir: string | null = null;

afterEach(async () => {
  await painel?.parar();
  painel = null;
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

describe("difusao por websocket", () => {
  it("integração: cliente conectado recebe estado novo após alteração", async () => {
    dir = mkdtempSync(join(tmpdir(), "expx-ws-"));
    cpSync("fixtures/projeto-ok", dir, { recursive: true });
    painel = await iniciarPainel({ raiz: dir, porta: 0, debounceMs: 80 });

    const ws = new WebSocket(painel.urlWebsocket());
    const mensagens: Array<{ tipo: string; estado?: { trabalhos: unknown[] } }> = [];
    // o listener entra ANTES do open: a mensagem inicial chega junto da conexão
    ws.on("message", (d) => mensagens.push(JSON.parse(String(d))));
    await new Promise<void>((ok) => ws.on("open", () => ok()));

    // a primeira mensagem é o estado inicial, enviado na conexão
    await new Promise((r) => setTimeout(r, 200));
    expect(mensagens[0]?.tipo).toBe("estado");

    writeFileSync(join(dir, "docs/exportacao-csv/ORQUESTRADOR.md"), "\n", { flag: "a" });
    await new Promise((r) => setTimeout(r, 900));

    expect(mensagens.length).toBeGreaterThanOrEqual(2);
    ws.close();
  });

  it("funcional: a mensagem traz o projeto inteiro, não um delta", async () => {
    dir = mkdtempSync(join(tmpdir(), "expx-ws2-"));
    cpSync("fixtures/projeto-ok", dir, { recursive: true });
    painel = await iniciarPainel({ raiz: dir, porta: 0, debounceMs: 80 });

    const ws = new WebSocket(painel.urlWebsocket());
    const recebida = await new Promise<{ tipo: string; estado: { trabalhos: unknown[]; violacoes: unknown[] } }>(
      (ok) => {
        ws.on("message", (d) => ok(JSON.parse(String(d))));
      },
    );

    expect(recebida.tipo).toBe("estado");
    expect(recebida.estado.trabalhos).toHaveLength(2);
    expect(recebida.estado.violacoes).toEqual([]);
    ws.close();
  });
});
