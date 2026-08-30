import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { App } from "./App.js";
import { estadoMemoriaFixture } from "./telas/fixture.js";

/**
 * O `App` monta o shell inteiro, e `usarEstado` busca o projeto por `fetch` e
 * abre um `WebSocket`. Em jsdom nenhum dos dois existe, então os dois são
 * dublados — e a asserção é ASSÍNCRONA: até o fetch resolver, a tela mostra
 * "carregando…" e nenhum botão de seção existe ainda.
 */

class WebSocketFalso {
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close(): void {
    /* nada a fechar */
  }
}

function montarComEstado(estado: unknown): void {
  vi.stubGlobal("fetch", () => Promise.resolve({ json: () => Promise.resolve(estado) }));
  vi.stubGlobal("WebSocket", WebSocketFalso);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("navegação do painel", () => {
  it("integração: a seção Memória aparece depois que o estado chega", async () => {
    montarComEstado(estadoMemoriaFixture());
    render(<App />);
    // antes do fetch resolver não há botão de seção nenhum
    await waitFor(() => expect(screen.getByLabelText("Memória")).toBeDefined());
  });

  it("funcional: o contador da activitybar mostra o número de regressões", async () => {
    const estado = estadoMemoriaFixture();
    expect(estado.memoria?.regressoes).toHaveLength(1);

    montarComEstado(estado);
    render(<App />);
    const botao = await screen.findByLabelText("Memória");
    expect(botao.querySelector(".contagem")?.textContent).toBe("1");
  });

  it("funcional: sem memória, a seção não mostra contador", async () => {
    montarComEstado({ ...estadoMemoriaFixture(), memoria: null });
    render(<App />);
    const botao = await screen.findByLabelText("Memória");
    expect(botao.querySelector(".contagem")).toBeNull();
  });
});
