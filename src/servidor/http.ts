import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { lerEstado, type EstadoPainel } from "./estado.js";
import { paginaRelatorio, type DadosRelatorio } from "../relatorio/pagina.js";

/**
 * O servidor escuta EXCLUSIVAMENTE em 127.0.0.1.
 *
 * Isso não é preferência, é decisão de segurança: o painel lê a pasta de
 * documentação de um projeto e a serve sem autenticação nenhuma. Expor isso
 * na rede local entregaria o conteúdo a qualquer um no mesmo Wi-Fi. Não há
 * flag, variável de ambiente ou opção que mude o bind.
 */
const HOST = "127.0.0.1" as const;

export type OpcoesServidor = {
  raiz: string;
  porta: number;
  diasBloqueio?: number;
  /** Pasta com o build da UI; quando ausente, só a API responde. */
  estaticos?: string;
};

export type ServidorPainel = {
  endereco: () => { address: string; port: number };
  url: () => string;
  estado: () => EstadoPainel;
  recarregar: () => EstadoPainel;
  aoAtualizar: (ouvinte: (e: EstadoPainel) => void) => void;
  http: Server;
  fechar: () => Promise<void>;
};

const TIPOS: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function json(res: ServerResponse, dados: unknown, status = 200): void {
  const corpo = JSON.stringify(dados, (_k, v) => (v instanceof Map ? undefined : v));
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(corpo);
}

export async function criarServidor(op: OpcoesServidor): Promise<ServidorPainel> {
  const diasBloqueio = op.diasBloqueio ?? 7;
  let estado = lerEstado({ raiz: op.raiz, diasBloqueio });
  const ouvintes: Array<(e: EstadoPainel) => void> = [];

  function recarregar(): EstadoPainel {
    estado = lerEstado({ raiz: op.raiz, diasBloqueio });
    for (const o of ouvintes) o(estado);
    return estado;
  }

  const http = createServer((req: IncomingMessage, res: ServerResponse) => {
    // O painel é somente leitura: nenhum método além de GET é aceito.
    if (req.method !== "GET") {
      json(res, { erro: "o painel e somente leitura" }, 405);
      return;
    }

    const url = new URL(req.url ?? "/", `http://${HOST}`);
    const caminho = url.pathname;

    // Relatório em aba própria: /relatorio?oc=<id>&tipo=tecnico|uso
    // e o .md original em /relatorio.md com os mesmos parâmetros.
    if (caminho === "/relatorio" || caminho === "/relatorio.md") {
      servirRelatorio(estado, url, caminho.endsWith(".md"), res);
      return;
    }

    switch (caminho) {
      case "/api/projeto":
        json(res, estado);
        return;
      case "/api/conformidade":
        json(res, { violacoes: estado.violacoes });
        return;
      case "/api/rejeicoes":
        json(res, { rejeicoes: estado.rejeicoes });
        return;
      case "/api/historico":
        json(res, { historico: estado.historico });
        return;
      case "/api/saude":
        json(res, { ok: true, raiz: estado.raiz, lido_em: estado.lido_em });
        return;
    }

    if (op.estaticos) {
      const servido = servirEstatico(op.estaticos, caminho, res);
      if (servido) return;
    }

    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("nao encontrado");
  });

  await new Promise<void>((ok) => http.listen(op.porta, HOST, ok));

  const endereco = (): { address: string; port: number } => {
    const e = http.address();
    if (e === null || typeof e === "string") return { address: HOST, port: op.porta };
    return { address: e.address, port: e.port };
  };

  return {
    endereco,
    url: () => `http://${HOST}:${String(endereco().port)}`,
    estado: () => estado,
    recarregar,
    aoAtualizar: (o) => ouvintes.push(o),
    http,
    fechar: () =>
      new Promise<void>((ok) => {
        http.closeAllConnections?.();
        http.close(() => ok());
      }),
  };
}

/**
 * Serve um relatório do histórico: como documento HTML pronto para impressão,
 * ou como o .md original para download.
 *
 * O conteúdo vem do estado já lido — o servidor não volta ao disco aqui, então
 * a página não pode escapar da pasta observada nem por parâmetro manipulado.
 */
function servirRelatorio(estado: EstadoPainel, url: URL, comoMd: boolean, res: ServerResponse): void {
  const oc = url.searchParams.get("oc");
  const tipo = url.searchParams.get("tipo") === "uso" ? "uso" : "tecnico";

  const entrada = estado.historico.find((h) => h.oc_id === oc);
  const rel = entrada ? (tipo === "uso" ? entrada.uso : entrada.tecnico) : null;

  if (!entrada || rel === null) {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(
      `<!doctype html><meta charset="utf-8"><title>Relatorio nao encontrado</title>` +
        `<body style="font:16px system-ui;padding:48px;color:#16181d">` +
        `<h1 style="font-size:20px">Relatório não encontrado</h1>` +
        `<p>Não há relatório <b>${tipo}</b> para a ocorrência informada.</p></body>`,
    );
    return;
  }

  const corpo = typeof rel["_corpo"] === "string" ? rel["_corpo"] : "";
  const nomeArquivo = `${entrada.oc_id}-${tipo}.md`;

  if (comoMd) {
    res.writeHead(200, {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${nomeArquivo}"`,
      "cache-control": "no-store",
    });
    res.end(corpo);
    return;
  }

  const dados: DadosRelatorio = {
    tipo,
    titulo: (rel["titulo"] as string | undefined) ?? entrada.titulo,
    oc_id: entrada.oc_id,
    tipo_ocorrencia: (rel["tipo_ocorrencia"] as string | undefined) ?? entrada.tipo_ocorrencia,
    fechado_em: (rel["fechado_em"] as string | undefined) ?? entrada.fechado_em,
    modulo_afetado: (rel["modulo_afetado"] as string[] | undefined) ?? entrada.modulo_afetado,
    corpo,
    nomeArquivo,
    ...(tipo === "tecnico"
      ? {
          arquivos_alterados: (rel["arquivos_alterados"] as string[] | undefined) ?? [],
          testes_adicionados: (rel["testes_adicionados"] as number | undefined) ?? null,
        }
      : {}),
  };

  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  res.end(paginaRelatorio(dados));
}

/** Serve o build da UI, com fallback para index.html (rotas do cliente). */
function servirEstatico(raiz: string, caminho: string, res: ServerResponse): boolean {
  const base = resolve(raiz);
  const pedido = caminho === "/" ? "/index.html" : caminho;
  // normaliza e confina: nenhum ../ escapa da pasta de estáticos
  const alvo = resolve(join(base, normalize(pedido).replace(/^(\.\.[/\\])+/, "")));
  const dentro = alvo === base || alvo.startsWith(base + sep);

  const arquivo = dentro && existsSync(alvo) ? alvo : join(base, "index.html");
  if (!existsSync(arquivo)) return false;

  res.writeHead(200, { "content-type": TIPOS[extname(arquivo)] ?? "application/octet-stream" });
  res.end(readFileSync(arquivo));
  return true;
}
