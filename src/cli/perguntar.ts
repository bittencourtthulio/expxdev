import { createInterface, type Interface } from "node:readline";
import type { Readable, Writable } from "node:stream";

/**
 * A camada de pergunta e resposta do terminal — e só ela.
 *
 * O wizard do `init` não fala com `process.stdin` diretamente: recebe um
 * `Perguntador`. É o que torna o fluxo testável sem subprocesso e sem TTY
 * falso, do mesmo jeito que `expx.ts` já injeta a saída para não capturar
 * `process.stdout` global.
 */

export type Perguntador = {
  /** Uma linha de texto livre, já sem espaço nas pontas. */
  linha: (rotulo: string) => Promise<string>;
  escrever: (texto: string) => void;
  fechar: () => void;
};

export function perguntadorDeTerminal(
  entrada: Readable = process.stdin,
  saida: Writable = process.stdout,
): Perguntador {
  let rl: Interface | undefined;
  const obter = (): Interface => {
    rl ??= createInterface({ input: entrada, output: saida });
    return rl;
  };

  return {
    linha: async (rotulo) => {
      const resposta = await new Promise<string>((resolver) => {
        obter().question(rotulo, resolver);
      });
      return resposta.trim();
    },
    escrever: (texto) => {
      saida.write(texto);
    },
    fechar: () => {
      rl?.close();
      rl = undefined;
    },
  };
}

/**
 * Um perguntador de roteiro, para teste: consome respostas em ordem.
 *
 * Acabaram as respostas do roteiro? Devolve string vazia — que todo passo do
 * wizard trata como "aceito o padrão". Um teste que esquece uma resposta
 * termina com o padrão em vez de travar o processo esperando `stdin`.
 */
export function perguntadorDeRoteiro(respostas: readonly string[]): Perguntador & { escrito: () => string } {
  const restantes = [...respostas];
  let escrito = "";
  return {
    linha: (rotulo) => {
      escrito += rotulo;
      return Promise.resolve(restantes.shift() ?? "");
    },
    escrever: (texto) => {
      escrito += texto;
    },
    fechar: () => {},
    escrito: () => escrito,
  };
}

/**
 * Lê uma escolha múltipla por número: `1,3` ou `1 3`.
 *
 * Devolve `undefined` quando algum número está fora da faixa, para o chamador
 * repetir a pergunta em vez de instalar a coisa errada em silêncio. Resposta
 * vazia é escolha vazia — quem decide se isso vale é a regra de seleção, não
 * a leitura.
 */
export function interpretarEscolhaMultipla(resposta: string, total: number): number[] | undefined {
  if (resposta.trim() === "") return [];

  const indices: number[] = [];
  for (const parte of resposta.split(/[,\s]+/).filter((p) => p !== "")) {
    if (!/^\d+$/.test(parte)) return undefined;
    const n = Number(parte);
    if (n < 1 || n > total) return undefined;
    if (!indices.includes(n - 1)) indices.push(n - 1);
  }
  return indices;
}

/** `sim`/`s`/`y`/`yes` é sim; vazio devolve o padrão; o resto é não. */
export function interpretarSimNao(resposta: string, padrao: boolean): boolean {
  const v = resposta.trim().toLowerCase();
  if (v === "") return padrao;
  return v === "s" || v === "sim" || v === "y" || v === "yes";
}
