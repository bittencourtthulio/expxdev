import { WebSocketServer, type WebSocket } from "ws";
import { criarServidor, type ServidorPainel } from "./http.js";
import { observar, type Observador } from "./observador.js";
import type { EstadoPainel } from "./estado.js";

export type OpcoesPainel = {
  raiz: string;
  porta: number;
  diasBloqueio?: number;
  debounceMs?: number;
  estaticos?: string;
};

export type Painel = {
  url: () => string;
  urlWebsocket: () => string;
  porta: () => number;
  estado: () => EstadoPainel;
  parar: () => Promise<void>;
};

/**
 * Junta servidor, observador e websocket.
 *
 * O websocket envia o ESTADO INTEIRO a cada atualização (decisão D-28), não
 * um delta. O estado de um projeto documental é pequeno, e mandar tudo
 * elimina a classe de bug em que servidor e tela discordam depois de uma
 * mensagem perdida.
 */
export async function iniciarPainel(op: OpcoesPainel): Promise<Painel> {
  const servidor: ServidorPainel = await criarServidor({
    raiz: op.raiz,
    porta: op.porta,
    ...(op.diasBloqueio !== undefined ? { diasBloqueio: op.diasBloqueio } : {}),
    ...(op.estaticos !== undefined ? { estaticos: op.estaticos } : {}),
  });

  const wss = new WebSocketServer({ server: servidor.http, path: "/ws" });

  function difundir(estado: EstadoPainel): void {
    const corpo = JSON.stringify({ tipo: "estado", estado });
    for (const cliente of wss.clients) {
      if (cliente.readyState === 1) cliente.send(corpo);
    }
  }

  // todo cliente recebe o estado atual assim que conecta
  wss.on("connection", (cliente: WebSocket) => {
    cliente.send(JSON.stringify({ tipo: "estado", estado: servidor.estado() }));
  });

  servidor.aoAtualizar(difundir);

  const observador: Observador = await observar(op.raiz, {
    aoMudar: () => {
      servidor.recarregar();
    },
    // O índice do memox tem caminho próprio: nasce e é reescrito fora de
    // `docs/`, e releitura total ali seria varrer o projeto inteiro por um
    // dado que não veio de `docs/`. Ver `observador.ts` para o porquê da
    // separação em dois watchers.
    aoMudarMemoria: () => {
      servidor.recarregarMemoria();
    },
    debounceMs: op.debounceMs ?? 300,
  });

  return {
    url: () => servidor.url(),
    urlWebsocket: () => `${servidor.url().replace("http://", "ws://")}/ws`,
    porta: () => servidor.endereco().port,
    estado: () => servidor.estado(),
    parar: async () => {
      await observador.parar();
      for (const c of wss.clients) c.terminate();
      await new Promise<void>((ok) => wss.close(() => ok()));
      await servidor.fechar();
    },
  };
}
