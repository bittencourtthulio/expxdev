/**
 * Devolver o terminal ao estado anterior — sempre, por qualquer caminho.
 *
 * "Nunca deixa o terminal quebrado" é definição de pronto do usuário. O
 * precedente do painel (`src/cli/principal.ts`) cobre `SIGINT` e `SIGTERM`,
 * o que basta para um servidor HTTP; aqui escondemos o cursor, e uma exceção
 * não capturada deixaria o terminal sem cursor até o próximo `reset`. Daí os
 * quatro caminhos (decisão D-21).
 */

const ESC = "";
const MOSTRAR_CURSOR = `${ESC}[?25h`;
const ESCONDER_CURSOR = `${ESC}[?25l`;

/** Os quatro caminhos pelos quais o watch pode terminar. */
export const CAMINHOS_DE_SAIDA = [
  "SIGINT",
  "SIGTERM",
  "uncaughtException",
  "exit",
] as const;

export type CaminhoDeSaida = (typeof CAMINHOS_DE_SAIDA)[number];

export type Ambiente = {
  escrever: (texto: string) => void;
  sair: (codigo: number) => void;
};

export type Restaurador = {
  registrar: () => void;
  desregistrar: () => void;
  esconderCursor: () => void;
  /** Executa a restauração. Idempotente. */
  disparar: (caminho: CaminhoDeSaida) => void;
};

export function criarRestaurador(amb: Ambiente): Restaurador {
  let restaurado = false;
  const ouvintes = new Map<CaminhoDeSaida, () => void>();

  function restaurar(): void {
    if (restaurado) return; // idempotente: dois sinais não restauram duas vezes
    restaurado = true;
    amb.escrever(MOSTRAR_CURSOR + "\n");
  }

  function disparar(caminho: CaminhoDeSaida): void {
    restaurar();
    // `exit` já está saindo, e em `uncaughtException` quem decide é o Node.
    // Só os dois sinais precisam encerrar o processo por conta própria.
    if (caminho === "SIGINT" || caminho === "SIGTERM") amb.sair(0);
  }

  return {
    registrar() {
      for (const caminho of CAMINHOS_DE_SAIDA) {
        const ouvinte = (): void => {
          disparar(caminho);
        };
        ouvintes.set(caminho, ouvinte);
        process.on(caminho, ouvinte);
      }
    },

    desregistrar() {
      for (const [caminho, ouvinte] of ouvintes) {
        process.off(caminho, ouvinte);
      }
      ouvintes.clear();
    },

    esconderCursor() {
      amb.escrever(ESCONDER_CURSOR);
    },

    disparar,
  };
}
