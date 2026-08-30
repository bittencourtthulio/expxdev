import { CATALOGO } from "../nucleo/catalogo.js";
import { avaliarSelecao } from "./selecao.js";
import { detectarProjeto } from "./projeto.js";
import { HARNESS_VALIDOS, type Harness, type OpcoesInitCli } from "./init-flags.js";
import { interpretarEscolhaMultipla, interpretarSimNao, type Perguntador } from "./perguntar.js";

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
 */

export type ResultadoWizard =
  | { ok: true; opcoes: OpcoesInitCli }
  | { ok: false; erro: string };

const TENTATIVAS = 3;

function listarSkills(p: Perguntador): void {
  p.escrever("\nQuais skills instalar neste projeto?\n\n");
  CATALOGO.forEach((s, i) => {
    const marca = s.camada ? " (camada)" : "";
    p.escrever(`  ${String(i + 1)}. ${s.nome}${marca} — ${s.papel}\n`);
  });
  p.escrever("\nResponda com os numeros separados por virgula (ex.: 1,5).\n");
}

async function escolherSkills(p: Perguntador): Promise<string[] | undefined> {
  listarSkills(p);

  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
    const resposta = await p.linha("skills: ");
    const indices = interpretarEscolhaMultipla(resposta, CATALOGO.length);

    if (indices === undefined) {
      p.escrever(`numero invalido: responda entre 1 e ${String(CATALOGO.length)}\n`);
      continue;
    }
    if (indices.length === 0) {
      p.escrever("nenhuma skill escolhida: escolha ao menos uma\n");
      continue;
    }

    const selecao = indices.map((i) => CATALOGO[i]?.nome ?? "");
    const aval = avaliarSelecao(selecao);

    // Aviso nunca impede: a combinação incomum pode ser exatamente a pedida.
    // O CLI explica a consequência e deixa a pessoa confirmar (selecao.ts).
    if (aval.precisaConfirmar) {
      for (const a of aval.avisos) p.escrever(`\naviso: ${a}\n`);
      const segue = interpretarSimNao(await p.linha("seguir assim mesmo? [s/N] "), false);
      if (!segue) {
        p.escrever("\nescolha de novo:\n");
        continue;
      }
    }
    for (const i of aval.integracoes) {
      p.escrever(`integracao disponivel: ${i} se conecta com as skills escolhidas\n`);
    }
    return selecao;
  }
  return undefined;
}

async function escolherHarness(p: Perguntador): Promise<Harness[] | undefined> {
  p.escrever("\nQual harness configurar?\n\n");
  p.escrever("  1. claude — Claude Code\n");
  p.escrever("  2. opencode — OpenCode\n");
  p.escrever("\nOs dois: 1,2. Vazio usa claude.\n");

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

  p.escrever("\nEste projeto ja tem um .expx/ instalado.\n");
  p.escrever("Seguir remonta a instalacao a partir da nova selecao, substituindo a atual.\n");
  return interpretarSimNao(await p.linha("reconfigurar? [s/N] "), false);
}

export async function executarWizard(
  p: Perguntador,
  parciais: OpcoesInitCli,
  raiz: string,
): Promise<ResultadoWizard> {
  if (!(await confirmarReconfiguracao(p, raiz))) {
    return { ok: false, erro: "reconfiguracao cancelada: nada foi alterado" };
  }

  const skills = parciais.skills.length > 0 ? parciais.skills : await escolherSkills(p);
  if (skills === undefined) return { ok: false, erro: "selecao de skills invalida apos varias tentativas" };

  const harness = parciais.harness.length > 0 ? parciais.harness : await escolherHarness(p);
  if (harness === undefined) return { ok: false, erro: "harness invalido apos varias tentativas" };

  const painel = parciais.painel
    ? true
    : interpretarSimNao(await p.linha("\nInstalar o painel como devDependency? [s/N] "), false);

  p.escrever(`\nvai instalar: ${skills.join(", ")}\n`);
  p.escrever(`harness: ${harness.join(", ")}\n`);
  if (painel) p.escrever("painel: sim\n");

  if (!interpretarSimNao(await p.linha("\nconfirmar? [S/n] "), true)) {
    return { ok: false, erro: "cancelado: nada foi alterado" };
  }

  return { ok: true, opcoes: { skills: [...skills], harness: [...harness], painel, sim: true, simular: parciais.simular } };
}
