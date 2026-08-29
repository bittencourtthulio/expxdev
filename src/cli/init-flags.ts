/**
 * Flags do `init` — o equivalente não interativo de cada pergunta.
 *
 * Sem isto o `init` só existiria com um humano na frente do terminal, e o CLI
 * ficaria inutilizável em script, CI ou container. A regra que acompanha:
 * sem interatividade e sem `--yes`, o comando mostra o que faria e sai sem
 * aplicar — nunca assume a resposta que não recebeu.
 */

export const HARNESS_VALIDOS = ["claude", "opencode"] as const;
export type Harness = (typeof HARNESS_VALIDOS)[number];

export type OpcoesInitCli = {
  skills: string[];
  harness: Harness[];
  painel: boolean;
  sim: boolean;
  /** Mostra o que faria e sai sem escrever. */
  simular: boolean;
};

export type ResultadoFlags =
  | { ok: true; opcoes: OpcoesInitCli }
  | { ok: false; erro: string };

function ehHarness(v: string): v is Harness {
  return (HARNESS_VALIDOS as readonly string[]).includes(v);
}

/** `a,b` e a repetição da flag acumulam na mesma lista, sem duplicar. */
function acumular(destino: string[], valor: string): void {
  for (const parte of valor.split(",").map((p) => p.trim())) {
    if (parte !== "" && !destino.includes(parte)) destino.push(parte);
  }
}

export function interpretarFlagsInit(argv: readonly string[]): ResultadoFlags {
  const opcoes: OpcoesInitCli = {
    skills: [],
    harness: [],
    painel: false,
    sim: false,
    simular: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const bruto = argv[i] ?? "";
    const igual = bruto.indexOf("=");
    const nome = igual === -1 ? bruto : bruto.slice(0, igual);
    const embutido = igual === -1 ? undefined : bruto.slice(igual + 1);
    const proximo = (): string | undefined => embutido ?? argv[++i];

    switch (nome) {
      case "--skills": {
        const v = proximo();
        if (v === undefined || v === "") return { ok: false, erro: "--skills exige uma lista de skills" };
        acumular(opcoes.skills, v);
        break;
      }
      case "--harness": {
        const v = proximo();
        if (v === undefined || v === "") return { ok: false, erro: "--harness exige claude, opencode ou os dois" };
        const lidos: string[] = [];
        acumular(lidos, v);
        for (const h of lidos) {
          if (!ehHarness(h)) return { ok: false, erro: `harness desconhecido: ${h}` };
          if (!opcoes.harness.includes(h)) opcoes.harness.push(h);
        }
        break;
      }
      case "--painel":
        opcoes.painel = true;
        break;
      case "--yes":
      case "--sim":
        opcoes.sim = true;
        break;
      case "--check":
      case "--simular":
        opcoes.simular = true;
        break;
      default:
        return { ok: false, erro: `opcao desconhecida em init: ${nome}` };
    }
  }

  return { ok: true, opcoes };
}

/**
 * Pode aplicar mudança sem perguntar?
 *
 * Só com `--yes` explícito ou com um terminal de verdade para responder. Em
 * pipe/CI sem `--yes`, a resposta é não — e o chamador mostra o plano em vez
 * de executá-lo.
 */
export function podeAplicarSemPerguntar(op: OpcoesInitCli, interativo: boolean): boolean {
  return op.sim || interativo;
}
