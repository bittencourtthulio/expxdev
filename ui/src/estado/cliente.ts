import { useEffect, useRef, useState } from "react";
import type { Estado } from "../tipos.js";

export type Conexao = "conectando" | "conectada" | "caida";

export type EstadoPainel = {
  estado: Estado | null;
  conexao: Conexao;
  erro: string | null;
};

export function urlWebsocket(): string {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/ws`;
}

/**
 * Carrega o projeto pela API e substitui o estado inteiro a cada mensagem do
 * websocket (decisão D-28). A conexão caída fica VISÍVEL: uma tela congelada
 * mostrando dado velho é pior que um erro à mostra (decisão D-29).
 */
export function usarEstado(): EstadoPainel {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [conexao, setConexao] = useState<Conexao>("conectando");
  const [erro, setErro] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let vivo = true;

    fetch("/api/projeto")
      .then((r) => r.json() as Promise<Estado>)
      .then((e) => {
        if (vivo) setEstado(e);
      })
      .catch((e: unknown) => {
        if (vivo) setErro(String(e));
      });

    function conectar(): void {
      const s = new WebSocket(urlWebsocket());
      ws.current = s;
      s.onopen = () => setConexao("conectada");
      s.onmessage = (ev) => {
        try {
          const m = JSON.parse(String(ev.data)) as { tipo: string; estado: Estado };
          if (m.tipo === "estado") setEstado(m.estado);
        } catch {
          /* mensagem malformada não derruba a tela */
        }
      };
      s.onclose = () => {
        if (!vivo) return;
        setConexao("caida");
        setTimeout(conectar, 1500);
      };
      s.onerror = () => s.close();
    }
    conectar();

    return () => {
      vivo = false;
      ws.current?.close();
    };
  }, []);

  return { estado, conexao, erro };
}
