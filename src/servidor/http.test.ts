import { describe, it, expect, afterEach } from "vitest";
import { criarServidor, ErroDePorta, type ServidorPainel } from "./http.js";

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

describe("porta ocupada", () => {
  it("integração: a segunda instancia na mesma porta falha com erro tipado, nao com crash", async () => {
    // O caso real: um painel ja rodando e o usuario sobe outro. Antes, o
    // `error` do servidor nao era tratado junto do listen e virava excecao
    // nao capturada — o processo morria com stack trace de Node.
    const primeiro = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const porta = primeiro.endereco().port;

    try {
      await expect(criarServidor({ raiz: "fixtures/projeto-ok", porta })).rejects.toThrow(ErroDePorta);
    } finally {
      await primeiro.fechar();
    }
  });

  it("funcional: o erro carrega a porta, para a mensagem poder cita-la", async () => {
    const primeiro = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const porta = primeiro.endereco().port;

    try {
      await criarServidor({ raiz: "fixtures/projeto-ok", porta });
      expect.unreachable("deveria ter falhado com a porta ocupada");
    } catch (e) {
      expect(e).toBeInstanceOf(ErroDePorta);
      expect((e as ErroDePorta).porta).toBe(porta);
      expect(String(e)).toContain(String(porta));
    } finally {
      await primeiro.fechar();
    }
  });

  it("funcional: liberada a porta, subir de novo volta a funcionar", async () => {
    const primeiro = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const porta = primeiro.endereco().port;
    await primeiro.fechar();

    // O listener de erro nao pode ficar pendurado impedindo o uso seguinte.
    const segundo = await criarServidor({ raiz: "fixtures/projeto-ok", porta });
    expect(segundo.endereco().port).toBe(porta);
    await segundo.fechar();
  });
});
