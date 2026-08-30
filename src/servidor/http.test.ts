import { describe, it, expect, afterEach } from "vitest";
import { criarServidor, type ServidorPainel } from "./http.js";

let servidor: ServidorPainel | null = null;
afterEach(async () => {
  await servidor?.fechar();
  servidor = null;
});

describe("servidor HTTP em loopback", () => {
  it("integração: o endereço de escuta é 127.0.0.1", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const end = servidor.endereco();
    expect(end.address).toBe("127.0.0.1");
    expect(end.port).toBeGreaterThan(0);
  });

  it("funcional: rota inexistente devolve 404", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const r = await fetch(`${servidor.url()}/rota/que/nao/existe`);
    expect(r.status).toBe(404);
  });
});

describe("rotas de leitura", () => {
  it("integração: GET /api/projeto devolve 200 com JSON", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const r = await fetch(`${servidor.url()}/api/projeto`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("application/json");
  });

  it("funcional: o projeto servido traz os dois trabalhos da fixture", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const r = await fetch(`${servidor.url()}/api/projeto`);
    const corpo = (await r.json()) as { trabalhos: unknown[]; violacoes: unknown[] };
    expect(corpo.trabalhos).toHaveLength(2);
    expect(corpo.violacoes).toEqual([]);
  });

  it("funcional: as quatro rotas de leitura respondem 200", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ruim", porta: 0 });
    for (const rota of ["/api/projeto", "/api/conformidade", "/api/rejeicoes", "/api/historico"]) {
      const r = await fetch(`${servidor.url()}${rota}`);
      expect(r.status, rota).toBe(200);
    }
  });
});

describe("rota de memória", () => {
  it("integração: GET responde 200 com JSON e POST responde 405", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-memoria", porta: 0 });
    const r = await fetch(`${servidor.url()}/api/memoria`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("application/json");

    // o painel é somente leitura: nenhum método além de GET passa
    const post = await fetch(`${servidor.url()}/api/memoria`, { method: "POST" });
    expect(post.status).toBe(405);
  });

  it("funcional: a fixture com índice traz uma regressão; sem índice traz null", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-memoria", porta: 0 });
    const corpo = (await (await fetch(`${servidor.url()}/api/memoria`)).json()) as {
      memoria: { totais: { regressoes: number } } | null;
    };
    expect(corpo.memoria?.totais.regressoes).toBe(1);

    // e o estado inteiro carrega a mesma chave (decisão D-03)
    const projeto = (await (await fetch(`${servidor.url()}/api/projeto`)).json()) as {
      memoria: unknown;
    };
    expect(projeto.memoria).not.toBeNull();

    await servidor.fechar();
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const semIndice = (await (await fetch(`${servidor.url()}/api/memoria`)).json()) as {
      memoria: unknown;
    };
    expect(semIndice.memoria).toBeNull();
  });
});
