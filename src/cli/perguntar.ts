import { createInterface, type Interface } from "node:readline";
import type { Readable, Writable } from "node:stream";
import { checkbox, confirm } from "@inquirer/prompts";
import { pintar, temCor } from "./visual.js";

/**
 * A camada de pergunta e resposta do terminal — e só ela.
 *
 * O wizard do `init` não fala com `process.stdin`: recebe um `Perguntador`.
 * É o que torna o fluxo testável sem subprocesso e sem TTY falso, do mesmo
 * jeito que `expx.ts` já injeta a saída para não capturar `process.stdout`
 * global.
 *
 * `marcar` é opcional de propósito. Ele existe quando o terminal navega, e
 * some quando não navega — e é essa ausência que faz o wizard cair sozinho
 * para a escolha por número, sem precisar perguntar duas vezes "dá para
 * navegar aqui?".
 */

export type Item = {
  valor: string;
  rotulo: string;
  marcado?: boolean;
};

export type Marcacao = {
  titulo: string;
  itens: readonly Item[];
};

export type Perguntador = {
  /** Uma linha de texto livre, já sem espaço nas pontas. */
  linha: (rotulo: string) => Promise<string>;
  /** Sim ou não. */
  confirmar: (rotulo: string, padrao: boolean) => Promise<boolean>;
  /** Navegar e marcar. Ausente quando o terminal não suporta. `undefined` = cancelou. */
  marcar?: (m: Marcacao) => Promise<string[] | undefined>;
  escrever: (texto: string) => void;
  fechar: () => void;
};

/**
 * Dá para desenhar um menu navegável aqui?
 *
 * Exige os dois lados do terminal: sem `stdin` não há setas para ler, e sem
 * `stdout` não há onde redesenhar a lista a cada tecla. `TERM=dumb` anuncia
 * explicitamente um terminal sem controle de cursor.
 */
export function podeNavegar(
  entrada: Readable & { isTTY?: boolean } = process.stdin,
  saida: Writable & { isTTY?: boolean } = process.stdout,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env["TERM"] === "dumb") return false;
  if (env["EXPX_SEM_NAVEGACAO"] === "1") return false;
  return entrada.isTTY === true && saida.isTTY === true;
}

function cancelou(e: unknown): boolean {
  return e instanceof Error && (e.name === "ExitPromptError" || e.name === "AbortPromptError");
}

export function perguntadorDeTerminal(
  entrada: Readable & { isTTY?: boolean } = process.stdin,
  saida: Writable & { isTTY?: boolean } = process.stdout,
): Perguntador {
  let rl: Interface | undefined;
  const obter = (): Interface => {
    rl ??= createInterface({ input: entrada, output: saida });
    return rl;
  };

  // O readline próprio e o inquirer não podem estar abertos ao mesmo tempo:
  // os dois leem o mesmo `stdin` e disputariam cada tecla. Fechar o nosso
  // antes de entregar o terminal ao inquirer evita a disputa.
  const semReadline = async <T>(acao: () => Promise<T>): Promise<T> => {
    rl?.close();
    rl = undefined;
    return acao();
  };

  const navegavel = podeNavegar(entrada, saida);

  const base: Perguntador = {
    linha: async (rotulo) => {
      const resposta = await new Promise<string>((resolver) => {
        obter().question(rotulo, resolver);
      });
      return resposta.trim();
    },

    confirmar: async (rotulo, padrao) => {
      if (!navegavel) {
        const r = await base.linha(`${rotulo} ${padrao ? "[S/n]" : "[s/N]"} `);
        return interpretarSimNao(r, padrao);
      }
      return semReadline(() =>
        confirm({
          message: rotulo,
          default: padrao,
          theme: {
            // O inquirer responde "Yes"/"No" e sugere "(y/N)". Traduzir as
            // palavras-chave muda as duas coisas de uma vez: a dica vira
            // "(s/n)" e o "s" que a pessoa digita passa a ser reconhecido —
            // o parser compara a tecla com a inicial destas palavras.
            keywords: { yes: "sim", no: "nao" },
            prefix: pintar("?", "azulClaro", temCor()),
          },
        }),
      );
    },

    escrever: (texto) => {
      saida.write(texto);
    },

    fechar: () => {
      rl?.close();
      rl = undefined;
    },
  };

  if (!navegavel) return base;

  return {
    ...base,
    marcar: async (m) =>
      semReadline(async () => {
        try {
          return await checkbox({
            message: m.titulo,
            choices: m.itens.map((i) => ({
              name: i.rotulo,
              value: i.valor,
              checked: i.marcado ?? false,
            })),
            theme: {
              icon: {
                checked: pintar("◉", "azulClaro", temCor()),
                unchecked: pintar("◯", "cinza", temCor()),
                cursor: pintar("❯", "azulClaro", temCor()),
              },
              style: {
                // A dica de teclas em portugues: o padrao do inquirer é em
                // ingles, e o resto do CLI inteiro fala portugues.
                keysHelpTip: () =>
                  pintar("setas navegam · espaco marca · enter confirma", "cinza", temCor()),
              },
            },
            // O menu inteiro cabe na tela: a lista tem seis itens e rolar
            // esconderia justamente a comparação entre elas.
            pageSize: Math.max(m.itens.length, 6),
          });
        } catch (e) {
          if (cancelou(e)) return undefined;
          throw e;
        }
      }),
  };
}

/**
 * Um perguntador de roteiro, para teste: consome respostas em ordem.
 *
 * Acabaram as respostas? Devolve string vazia — que todo passo trata como
 * "aceito o padrão". Um teste que esquece uma resposta termina com o padrão
 * em vez de travar o processo esperando `stdin`.
 *
 * Por padrão NÃO navega, porque o roteiro testa o caminho por número. Passe
 * `marcacoes` para testar o caminho navegável: cada entrada é o que a pessoa
 * teria marcado naquele menu.
 */
export function perguntadorDeRoteiro(
  respostas: readonly string[],
  marcacoes?: readonly (readonly string[] | undefined)[],
): Perguntador & { escrito: () => string } {
  const restantes = [...respostas];
  const marcadas = marcacoes === undefined ? undefined : [...marcacoes];
  let escrito = "";

  const p: Perguntador & { escrito: () => string } = {
    linha: (rotulo) => {
      escrito += rotulo;
      return Promise.resolve(restantes.shift() ?? "");
    },
    confirmar: (rotulo, padrao) => {
      escrito += rotulo;
      const r = restantes.shift();
      return Promise.resolve(r === undefined || r === "" ? padrao : interpretarSimNao(r, padrao));
    },
    escrever: (texto) => {
      escrito += texto;
    },
    fechar: () => {},
    escrito: () => escrito,
  };

  if (marcadas !== undefined) {
    p.marcar = (m) => {
      escrito += m.titulo;
      for (const i of m.itens) escrito += `\n${i.rotulo}`;
      const proxima = marcadas.shift();
      return Promise.resolve(proxima === undefined ? [] : [...proxima]);
    };
  }
  return p;
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
