import { CATALOGO } from "../nucleo/catalogo.js";
import { avaliarSelecao } from "./selecao.js";
import { detectarProjeto } from "./projeto.js";
import { HARNESS_VALIDOS, type Harness, type OpcoesInitCli } from "./init-flags.js";
import { interpretarEscolhaMultipla, interpretarSimNao, type Perguntador } from "./perguntar.js";
import { pintar, secao, temCor } from "./visual.js";

/**
 * As quatro perguntas do `init` interativo (especificação, promptcli1.md:51-68).
 *
 * O wizard não instala nada: ele só transforma "nenhuma flag" em uma seleção
 * completa e devolve. Quem escreve em disco continua sendo `executarInit`, com
 * exatamente o mesmo caminho que as flags percorrem — é o que garante que o
 * modo interativo e o modo `--skills` não divirjam em comportamento.
 *
 * Toda pergunta respeita o que já veio por flag: quem passou `--harness` não é
 * perguntado de novo. Isso permite responder metade por flag e metade na mão.
 *
 * Há dois modos de responder. O padrão é navegar e marcar com as setas; onde
 * isso não funciona — CI, pipe, `TERM=dumb` — o mesmo wizard cai para a
 * escolha por número, que não exige nada do terminal. Os dois produzem a
 * mesma seleção, e é o `Perguntador` que decide qual está disponível.
 */

export type ResultadoWizard =
  | { ok: true; opcoes: OpcoesInitCli }
  | { ok: false; erro: string };

const TENTATIVAS = 3;

/** Cancelar no menu (Esc/Ctrl+C) vira erro; aqui vira "cancelado", não travamento. */
function foiCancelado(e: unknown): boolean {
  return e instanceof Error && (e.name === "ExitPromptError" || e.name === "AbortPromptError");
}

function rotuloDaSkill(nome: string, papel: string, camada: boolean, cor: boolean): string {
  const marca = camada ? ` ${pintar("(camada)", "cinza", cor)}` : "";
  return `${pintar(nome, "branco", cor)}${marca}  ${pintar(papel, "cinza", cor)}`;
}

async function marcarSkills(p: Perguntador): Promise<string[] | undefined> {
  const cor = temCor();

  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
    let selecao: string[];

    if (p.marcar !== undefined) {
      const escolhido = await p.marcar({
        titulo: "Quais skills instalar neste projeto?",
        itens: CATALOGO.map((s) => ({
          valor: s.nome,
          rotulo: rotuloDaSkill(s.nome, s.papel, s.camada, cor),
        })),
      });
      if (escolhido === undefined) return undefined;
      selecao = escolhido;
    } else {
      const lido = await escolherPorNumero(p);
      if (lido === undefined) continue;
      selecao = lido;
    }

    if (selecao.length === 0) {
      p.escrever(`${pintar("nenhuma skill marcada: marque ao menos uma", "cinza", cor)}\n`);
      continue;
    }

    const aval = avaliarSelecao(selecao);

    // Aviso nunca impede: a combinação incomum pode ser exatamente a pedida.
    // O CLI explica a consequência e deixa a pessoa confirmar (selecao.ts).
    if (aval.precisaConfirmar) {
      for (const a of aval.avisos) p.escrever(`\n${pintar("aviso:", "negrito", cor)} ${a}\n`);
      if (!(await p.confirmar("seguir assim mesmo?", false))) {
        p.escrever("\nescolha de novo:\n");
        continue;
      }
    }
    for (const i of aval.integracoes) {
      p.escrever(`${pintar("integracao:", "azulClaro", cor)} ${i} se conecta com as skills escolhidas\n`);
    }
    return selecao;
  }
  return undefined;
}

/** O caminho sem navegação: a lista numerada e uma linha de resposta. */
async function escolherPorNumero(p: Perguntador): Promise<string[] | undefined> {
  const cor = temCor();
  p.escrever(secao("Quais skills instalar neste projeto?", cor));
  CATALOGO.forEach((s, i) => {
    p.escrever(`  ${String(i + 1)}. ${rotuloDaSkill(s.nome, s.papel, s.camada, cor)}\n`);
  });
  p.escrever(`\n${pintar("numeros separados por virgula (ex.: 1,5)", "cinza", cor)}\n`);

  const indices = interpretarEscolhaMultipla(await p.linha("skills: "), CATALOGO.length);
  if (indices === undefined) {
    p.escrever(`numero invalido: responda entre 1 e ${String(CATALOGO.length)}\n`);
    return undefined;
  }
  return indices.map((i) => CATALOGO[i]?.nome ?? "");
}

async function marcarHarness(p: Perguntador): Promise<Harness[] | undefined> {
  const cor = temCor();
  const descricao: Record<Harness, string> = {
    claude: "Claude Code",
    opencode: "OpenCode",
  };

  if (p.marcar !== undefined) {
    for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
      const escolhido = await p.marcar({
        titulo: "Qual harness configurar?",
        itens: HARNESS_VALIDOS.map((h) => ({
          valor: h,
          rotulo: `${pintar(h, "branco", cor)}  ${pintar(descricao[h], "cinza", cor)}`,
          marcado: h === "claude",
        })),
      });
      if (escolhido === undefined) return undefined;
      if (escolhido.length > 0) return escolhido as Harness[];
      p.escrever(`${pintar("marque ao menos um harness", "cinza", cor)}\n`);
    }
    return undefined;
  }

  p.escrever(secao("Qual harness configurar?", cor));
  HARNESS_VALIDOS.forEach((h, i) => {
    p.escrever(`  ${String(i + 1)}. ${h} — ${descricao[h]}\n`);
  });
  p.escrever(`\n${pintar("os dois: 1,2. vazio usa claude.", "cinza", cor)}\n`);

  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
    const resposta = await p.linha("harness [1]: ");
    if (resposta.trim() === "") return ["claude"];

    const indices = interpretarEscolhaMultipla(resposta, HARNESS_VALIDOS.length);
    if (indices === undefined || indices.length === 0) {
      p.escrever("responda 1, 2 ou 1,2\n");
      continue;
    }
    return indices.map((i) => HARNESS_VALIDOS[i] ?? "claude");
  }
  return undefined;
}

/**
 * Reconfiguração nunca apaga sem confirmar (promptcli1.md:51-53).
 *
 * O `.expx/` existente é remontado do zero pelo `init`, então seguir sem
 * perguntar destruiria a seleção anterior em silêncio.
 */
async function confirmarReconfiguracao(p: Perguntador, raiz: string): Promise<boolean> {
  if (!detectarProjeto(raiz).existe) return true;

  const cor = temCor();
  p.escrever(`\n${pintar("este projeto ja tem um .expx/ instalado", "negrito", cor)}\n`);
  p.escrever(`${pintar("seguir remonta a instalacao a partir da nova selecao", "cinza", cor)}\n`);
  return p.confirmar("reconfigurar?", false);
}

export async function executarWizard(
  p: Perguntador,
  parciais: OpcoesInitCli,
  raiz: string,
): Promise<ResultadoWizard> {
  const cor = temCor();
  try {
    if (!(await confirmarReconfiguracao(p, raiz))) {
      return { ok: false, erro: "reconfiguracao cancelada: nada foi alterado" };
    }

    const skills = parciais.skills.length > 0 ? parciais.skills : await marcarSkills(p);
    if (skills === undefined) return { ok: false, erro: "cancelado: nada foi alterado" };

    const harness = parciais.harness.length > 0 ? parciais.harness : await marcarHarness(p);
    if (harness === undefined) return { ok: false, erro: "cancelado: nada foi alterado" };

    const painel = parciais.painel
      ? true
      : await p.confirmar("instalar o painel como devDependency?", false);

    p.escrever(secao("Resumo", cor));
    p.escrever(`  skills   ${pintar(skills.join(", "), "branco", cor)}\n`);
    p.escrever(`  harness  ${pintar(harness.join(", "), "branco", cor)}\n`);
    if (painel) p.escrever(`  painel   ${pintar("sim", "branco", cor)}\n`);
    p.escrever("\n");

    if (!(await p.confirmar("confirmar?", true))) {
      return { ok: false, erro: "cancelado: nada foi alterado" };
    }

    return {
      ok: true,
      opcoes: { skills: [...skills], harness: [...harness], painel, sim: true, simular: parciais.simular },
    };
  } catch (e) {
    if (foiCancelado(e)) return { ok: false, erro: "cancelado: nada foi alterado" };
    throw e;
  }
}

export { interpretarSimNao };
