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

/**
 * O Claude Code roda o plugin de um CACHE, não da pasta do projeto.
 *
 * A cópia vive em `~/.claude/plugins/cache/<marketplace>/<plugin>/<versao>/`, e
 * é dela que saem as skills, os comandos e os hooks da sessão. Montar um
 * `.expx/` novo no projeto não mexe nesse cache.
 *
 * Medido: depois de um `expx init` que montou a 0.5.1, o cache seguia na 0.1.1
 * — com um conjunto de skills antigo, SEM a runx e sem hooks. O efeito para
 * quem usa é a skill simplesmente nunca ser acionada, sem nenhum erro: o
 * modelo não vê a descrição que faria o gatilho disparar, então parte para o
 * trabalho manual.
 *
 * `plugin install` num plugin já instalado não recopia, e `marketplace update`
 * sozinho também não. Desinstalar antes é o que força a cópia nova.
 *
 * O `uninstall` roda em modo tolerante: na primeira instalação não há nada
 * para remover, e o erro dele é esperado — ver `instalarPlugin`.
 */
export function comandosDeInstalacao(caminhoMarketplace: string): ComandoExterno[] {
  return [
    { bin: "claude", args: ["plugin", "marketplace", "add", caminhoMarketplace] },
    { bin: "claude", args: ["plugin", "marketplace", "update", "expx-local"] },
    { bin: "claude", args: ["plugin", "uninstall", "expx@expx-local"] },
    { bin: "claude", args: ["plugin", "install", "expx@expx-local"] },
  ];
}

/**
 * Comandos cuja falha não interrompe a sequência.
 *
 * `marketplace add` falha quando o marketplace já é conhecido, e `uninstall`
 * falha quando não há o que desinstalar. Os dois são o caminho normal de uma
 * reinstalação e de uma primeira instalação, respectivamente — tratá-los como
 * erro faria o `init` parar justamente nos dois casos mais comuns.
 */
function tolerante(args: readonly string[]): boolean {
  const s = args.join(" ");
  return s.startsWith("plugin uninstall") || s.startsWith("plugin marketplace add");
}

/** O que dizer quando o binário `claude` não está disponível. */
export function instrucaoManual(caminhoMarketplace: string): string {
  return [
    "O binario `claude` nao foi encontrado no PATH.",
    "O .expx/ foi montado e esta pronto; falta apenas registrar o plugin:",
    "",
    `  claude plugin marketplace add ${caminhoMarketplace}`,
    "  claude plugin marketplace update expx-local",
    "  claude plugin uninstall expx@expx-local",
    "  claude plugin install expx@expx-local",
    "",
    "Rode os comandos acima e o namespace /expx: ficara disponivel.",
    "Os dois do meio nao sao opcionais: o Claude Code roda o plugin de um",
    "cache proprio, e sem eles a sessao continua carregando a versao antiga.",
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
      // Marketplace já conhecido, ou nada a desinstalar: é o caminho normal,
      // não um defeito. Seguir é o que torna o `init` repetível.
      if (tolerante(c.args)) continue;
      return { ok: false, executados, erro: msg };
    }
  }
  return { ok: true, executados };
}
