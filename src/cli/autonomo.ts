import { existsSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";

/**
 * O que `panel` e `watch` precisam garantir sozinhos para funcionar logo
 * depois de um `init`, sem passo manual nenhum.
 *
 * A regra de ouro do painel continua valendo: ele nunca escreve nos arquivos
 * do projeto. Criar a pasta vazia que ele observa não fere isso — nenhum
 * conteúdo é inventado, e sem a pasta o comando simplesmente não subia.
 */

export type ResultadoPasta = { criada: boolean };

/** Cria a pasta observada quando ela ainda não existe. */
export function garantirPasta(caminho: string): ResultadoPasta {
  if (existsSync(caminho)) return { criada: false };
  mkdirSync(caminho, { recursive: true });
  return { criada: true };
}

/** Quantas portas tentar acima da pedida antes de desistir. */
const TENTATIVAS = 20;

function livre(porta: number): Promise<boolean> {
  return new Promise((ok) => {
    const s = createServer();
    s.once("error", () => ok(false));
    s.listen(porta, "127.0.0.1", () => {
      s.close(() => ok(true));
    });
  });
}

/**
 * Devolve a primeira porta livre a partir da pedida.
 *
 * Porta 0 é o "escolha você" do próprio SO: devolvemos como veio, sem sondar,
 * porque sondar o 0 daria uma porta efêmera que estaria livre agora e não na
 * hora do listen de verdade.
 */
export async function escolherPorta(pedida: number): Promise<number> {
  if (pedida === 0) return 0;
  for (let p = pedida; p < pedida + TENTATIVAS && p <= 65535; p++) {
    if (await livre(p)) return p;
  }
  return pedida;
}
