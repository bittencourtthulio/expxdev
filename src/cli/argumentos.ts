/** Contrato de linha de comando do `expx-painel`. */

export const PADROES = {
  porta: 4000,
  dir: "./docs",
  diasBloqueio: 7,
} as const;

export type Opcoes = {
  porta: number;
  dir: string;
  abrir: boolean;
  diasBloqueio: number;
  ajuda: boolean;
};

export type Resultado =
  | { ok: true; opcoes: Opcoes }
  | { ok: false; erro: string };

const AJUDA = `
expx-painel — painel de operacao do metodo Expx (somente leitura)

  npx expx-painel [opcoes]

  --porta <n>           porta do servidor local (padrao ${String(PADROES.porta)})
  --dir <caminho>       pasta de documentacao a observar (padrao ${PADROES.dir})
  --no-open             nao abrir o navegador automaticamente
  --dias-bloqueio <n>   dias a partir dos quais um bloqueio e antigo (padrao ${String(PADROES.diasBloqueio)})
  --ajuda               mostra esta ajuda

O servidor escuta apenas em 127.0.0.1 e nunca escreve nos arquivos do projeto.
`.trim();

export function textoDeAjuda(): string {
  return AJUDA;
}

function inteiro(valor: string | undefined, campo: string): number | string {
  if (valor === undefined) return `${campo} exige um valor`;
  const n = Number(valor);
  if (!Number.isInteger(n)) return `${campo} exige um numero inteiro, recebeu ${JSON.stringify(valor)}`;
  return n;
}

export function interpretar(argv: readonly string[]): Resultado {
  const opcoes: Opcoes = {
    porta: PADROES.porta,
    dir: PADROES.dir,
    abrir: true,
    diasBloqueio: PADROES.diasBloqueio,
    ajuda: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const bruto = argv[i] ?? "";
    const [nome, embutido] = bruto.includes("=")
      ? [bruto.slice(0, bruto.indexOf("=")), bruto.slice(bruto.indexOf("=") + 1)]
      : [bruto, undefined];
    const proximo = (): string | undefined => embutido ?? argv[++i];

    switch (nome) {
      case "--porta": {
        const n = inteiro(proximo(), "--porta");
        if (typeof n === "string") return { ok: false, erro: n };
        if (n < 0 || n > 65535) return { ok: false, erro: `--porta fora da faixa valida: ${String(n)}` };
        opcoes.porta = n;
        break;
      }
      case "--dir": {
        const v = proximo();
        if (v === undefined || v === "") return { ok: false, erro: "--dir exige um caminho" };
        opcoes.dir = v;
        break;
      }
      case "--dias-bloqueio": {
        const n = inteiro(proximo(), "--dias-bloqueio");
        if (typeof n === "string") return { ok: false, erro: n };
        if (n < 0) return { ok: false, erro: "--dias-bloqueio nao pode ser negativo" };
        opcoes.diasBloqueio = n;
        break;
      }
      case "--no-open":
        opcoes.abrir = false;
        break;
      case "--ajuda":
      case "--help":
      case "-h":
        opcoes.ajuda = true;
        break;
      default:
        return { ok: false, erro: `opcao desconhecida: ${nome}` };
    }
  }

  return { ok: true, opcoes };
}
