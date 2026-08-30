import { describe, it, expect, afterEach } from "vitest";
import { criarServidor, ErroDePorta, type ServidorPainel } from "./http.js";
import { mkdtempSync, mkdirSync, cpSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

/**
 * A metade servidor da correção do índice que nasce tarde. O watcher dedicado
 * (ver `observador.test.ts`) avisa que o índice mudou; é aqui que o painel
 * troca `estado.memoria` sem remontar o projeto inteiro.
 */
describe("releitura só do índice", () => {
  let dir: string | null = null;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = null;
  });

  it("integração: índice que nasce depois da subida aparece sem remontar", async () => {
    dir = mkdtempSync(join(tmpdir(), "expx-mem-"));
    cpSync("fixtures/projeto-ok", dir, { recursive: true });

    // sobe SEM índice — o estado inicial é o "sem índice de memória" da tela
    servidor = await criarServidor({ raiz: dir, porta: 0 });
    expect(servidor.estado().memoria).toBeNull();

    // o memox indexa agora, com o painel já no ar
    const origem = "fixtures/projeto-memoria/.expx/memoria/indice.json";
    mkdirSync(join(dir, ".expx/memoria"), { recursive: true });
    cpSync(origem, join(dir, ".expx/memoria/indice.json"));

    const depois = servidor.recarregarMemoria();
    expect(depois.memoria).not.toBeNull();
    expect(depois.memoria?.totais.regressoes).toBe(1);

    // e o resto do projeto seguiu intacto: releitura de índice não é remontagem
    expect(depois.trabalhos).toHaveLength(2);
  });

  it("funcional: reescrever o índice sem mudar nada não difunde de novo", async () => {
    dir = mkdtempSync(join(tmpdir(), "expx-mem-"));
    cpSync("fixtures/projeto-memoria", dir, { recursive: true });

    servidor = await criarServidor({ raiz: dir, porta: 0 });
    let difusoes = 0;
    servidor.aoAtualizar(() => difusoes++);

    // o motor reescreve o arquivo inteiro a cada reconstrução, mesmo quando o
    // conteúdo é idêntico; difundir aí empurraria o estado inteiro à toa (D-28)
    servidor.recarregarMemoria();
    servidor.recarregarMemoria();
    expect(difusoes).toBe(0);
  });

  it("funcional: índice corrompido volta a null em vez de derrubar o painel", async () => {
    dir = mkdtempSync(join(tmpdir(), "expx-mem-"));
    cpSync("fixtures/projeto-memoria", dir, { recursive: true });

    servidor = await criarServidor({ raiz: dir, porta: 0 });
    expect(servidor.estado().memoria).not.toBeNull();

    // JSON truncado é o que se lê no instante da gravação (D-05: falha aberta)
    writeFileSync(join(dir, ".expx/memoria/indice.json"), '{"versao":1,"tota');
    expect(servidor.recarregarMemoria().memoria).toBeNull();
  });
});
