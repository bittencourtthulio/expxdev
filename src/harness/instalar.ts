import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

/**
 * A instalação de fato do plugin no Claude Code.
 *
 * Declarar o marketplace em `.claude/settings.json` NÃO instala nada: cinco
 * sintaxes foram testadas em execução e nenhuma carregou o plugin (o
 * experimento está em `docs/expx-cli/base/09-validacao-marketplace-local.md`).
 * Quem instala é o próprio `claude`, por estes dois comandos.
 *
 * Consequência para quem clona o repositório: como o `marketplace add` grava um
 * caminho ABSOLUTO no settings do usuário, esse passo não viaja no commit —
 * cada pessoa roda o `expx init` na própria máquina.
 */

export type ComandoExterno = { bin: string; args: string[] };

export function comandosDeInstalacao(caminhoMarketplace: string): ComandoExterno[] {
  return [
    { bin: "claude", args: ["plugin", "marketplace", "add", caminhoMarketplace] },
    { bin: "claude", args: ["plugin", "install", "expx@expx-local"] },
  ];
}

/** O que dizer quando o binário `claude` não está disponível. */
export function instrucaoManual(caminhoMarketplace: string): string {
  return [
    "O binario `claude` nao foi encontrado no PATH.",
    "O .expx/ foi montado e esta pronto; falta apenas registrar o plugin:",
    "",
    `  claude plugin marketplace add ${caminhoMarketplace}`,
    "  claude plugin install expx@expx-local",
    "",
    "Rode os dois comandos acima e o namespace /expx: ficara disponivel.",
  ].join("\n");
}

export type ResultadoInstalacao = {
  ok: boolean;
  executados: string[];
  /** Quando o binário falta, o texto que o usuário precisa ver. */
  instrucao?: string;
  erro?: string;
};

/**
 * Roda os dois comandos. Binário ausente NÃO é falha fatal: o `.expx/` já está
 * montado e a instalação pode ser concluída à mão.
 */
export async function instalarPlugin(caminhoMarketplace: string): Promise<ResultadoInstalacao> {
  const executados: string[] = [];
  for (const c of comandosDeInstalacao(caminhoMarketplace)) {
    try {
      await exec(c.bin, c.args);
      executados.push(`${c.bin} ${c.args.join(" ")}`);
    } catch (e: unknown) {
      const msg = String(e);
      if (msg.includes("ENOENT")) {
        return { ok: false, executados, instrucao: instrucaoManual(caminhoMarketplace) };
      }
      return { ok: false, executados, erro: msg };
    }
  }
  return { ok: true, executados };
}
