import { interpretarSubcomando, ajudaGeral, type Subcomando } from "./subcomandos.js";
import { principal as principalPainel } from "./principal.js";
import { principalWatch } from "../watch/principal.js";
import { interpretarFlagsInit } from "./init-flags.js";
import { executarInit } from "./init.js";
import { adicionarSkills, removerSkills } from "./selecionar.js";
import { interpretarFlagsUpdate, executarUpdate } from "../update/flags.js";
import { diagnosticar } from "../doctor/verificadores.js";
import { avaliarSelecao } from "./selecao.js";
import { executarWizard } from "./wizard.js";
import { perguntadorDeTerminal, type Perguntador } from "./perguntar.js";
import { NOMES } from "../nucleo/catalogo.js";
import { hero, sucesso, temCor } from "./visual.js";
import { versaoDoCli } from "../nucleo/lock.js";
import { instalarPlugin } from "../harness/instalar.js";
import { join } from "node:path";

/**
 * O entrypoint do binário `expx`.
 *
 * A saída é injetável para que os testes leiam o que o comando escreveu sem
 * capturar `process.stdout` global — captura global vaza entre testes que rodam
 * em paralelo e produz falha intermitente.
 */

export type Saida = {
  escrever?: (texto: string) => void;
  escreverErro?: (texto: string) => void;
};

export type Executor = (resto: readonly string[], saida: Required<Saida>) => Promise<number>;

/**
 * Há um humano capaz de responder?
 *
 * Precisa dos DOIS lados: `stdout` sozinho não basta, porque escrever no
 * terminal não prova que existe teclado do outro lado — num `expx init < /dev/null`
 * o `stdout` continua TTY e o wizard travaria esperando uma resposta que não vem.
 * É `stdin` que decide se dá para perguntar.
 */
function ehInterativo(): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

/** Injetável para o teste trocar o terminal por um roteiro de respostas. */
let criarPerguntador: () => Perguntador = () => perguntadorDeTerminal();

export function usarPerguntador(fabrica: () => Perguntador): void {
  criarPerguntador = fabrica;
}

function comoEscolherSkills(): string {
  return [
    "escolha as skills com --skills, ou rode num terminal para responder na hora:",
    "",
    `  npx expxdev init --skills ${NOMES.slice(0, 2).join(",")} --yes`,
    "",
    `disponiveis: ${NOMES.join(", ")}`,
  ].join("\n");
}

const EXECUTORES: Partial<Record<Subcomando, Executor>> = {
  panel: async (resto) => principalPainel(resto),

  watch: async (resto, saida) => principalWatch(resto, saida),

  init: async (resto, saida) => {
    const f = interpretarFlagsInit(resto);
    if (!f.ok) {
      saida.escreverErro(`${f.erro}\n`);
      return 1;
    }

    let opcoes = f.opcoes;

    // Faltou o que instalar e há alguém para responder? Pergunta, em vez de
    // sair com "nenhuma skill selecionada" — que era o beco sem saída do
    // `npx expxdev init` puro.
    if (opcoes.skills.length === 0 && ehInterativo()) {
      saida.escrever(hero(versaoDoCli()));
      const p = criarPerguntador();
      try {
        const w = await executarWizard(p, opcoes, process.cwd());
        if (!w.ok) {
          saida.escreverErro(`${w.erro}\n`);
          return 1;
        }
        opcoes = w.opcoes;
      } finally {
        p.fechar();
      }
    }

    const aval = avaliarSelecao(opcoes.skills);
    if (!aval.permitido) {
      saida.escreverErro(`${aval.erros.join("\n")}\n`);
      // Sem terminal para perguntar, a saída precisa dizer como resolver:
      // o erro sozinho não ensina a próxima ação.
      if (!ehInterativo()) saida.escreverErro(`\n${comoEscolherSkills()}\n`);
      return 1;
    }
    for (const a of aval.avisos) saida.escrever(`aviso: ${a}\n`);

    if (!opcoes.sim && !ehInterativo()) {
      saida.escrever(`instalaria: ${opcoes.skills.join(", ")}\nuse --yes para aplicar sem perguntar\n`);
      return 0;
    }

    const harness = opcoes.harness.length > 0 ? opcoes.harness : ["claude"];
    const r = await executarInit({ raiz: process.cwd(), skills: opcoes.skills, harness });
    for (const a of r.avisos) saida.escrever(`aviso: ${a}\n`);
    for (const x of r.falhas) saida.escreverErro(`falhou ${x.nome}: ${x.erro}\n`);
    if (!r.ok) return 1;

    const fecho = [`instaladas: ${r.instaladas.join(", ")}`];
    if (harness.includes("claude")) {
      const inst = await instalarPlugin(join(process.cwd(), ".expx", "marketplace"));
      if (inst.instrucao !== undefined) {
        saida.escrever(sucesso(fecho, temCor()));
        saida.escrever(`\n${inst.instrucao}\n`);
        return 0;
      }
      if (inst.erro !== undefined) {
        saida.escrever(sucesso(fecho, temCor()));
        saida.escreverErro(`nao foi possivel registrar o plugin: ${inst.erro}\n`);
        return 0;
      }
      fecho.push("plugin registrado: os comandos /expx: estao disponiveis");
    }
    saida.escrever(sucesso(fecho, temCor()));
    return 0;
  },

  add: async (resto, saida) => {
    const r = await adicionarSkills({ raiz: process.cwd(), skills: resto });
    if (!r.ok) {
      saida.escreverErro(`${r.erro}\n`);
      return 1;
    }
    saida.escrever(`selecao agora: ${r.selecao.join(", ")}\n`);
    return 0;
  },

  remove: async (resto, saida) => {
    const r = await removerSkills({ raiz: process.cwd(), skills: resto });
    if (!r.ok) {
      saida.escreverErro(`${r.erro}\n`);
      return 1;
    }
    saida.escrever(`selecao agora: ${r.selecao.join(", ")}\n`);
    return 0;
  },

  update: async (resto, saida) => {
    const f = interpretarFlagsUpdate(resto);
    if (!f.ok) {
      saida.escreverErro(`${f.erro}\n`);
      return 1;
    }
    const r = await executarUpdate({
      raiz: process.cwd(),
      skills: f.opcoes.skills,
      check: f.opcoes.check,
      latest: f.opcoes.latest,
      sim: f.opcoes.sim,
      interativo: process.stdout.isTTY === true,
      ...(f.opcoes.to !== undefined ? { to: f.opcoes.to } : {}),
    });
    for (const m of r.mensagens) saida.escrever(`${m}\n`);
    for (const b of r.bloqueadas) saida.escrever(`bloqueada ${b.nome}: ${b.motivo}\n`);
    if (r.emDia.length > 0) saida.escrever(`em dia: ${r.emDia.join(", ")}\n`);
    return r.ok ? 0 : 1;
  },

  doctor: async (_resto, saida) => {
    const d = diagnosticar(process.cwd());
    if (d.achados.length === 0) {
      saida.escrever("nenhum problema encontrado\n");
      return 0;
    }
    for (const a of d.achados) {
      saida.escrever(`[${a.severidade}] ${a.problema}\n  correcao: ${a.correcao}\n`);
    }
    return d.saudavel ? 0 : 1;
  },
};

export async function executarExpx(argv: readonly string[], saida: Saida = {}): Promise<number> {
  const escrever = saida.escrever ?? ((t: string) => process.stdout.write(t));
  const escreverErro = saida.escreverErro ?? ((t: string) => process.stderr.write(t));

  const r = interpretarSubcomando(argv);
  if (!r.ok) {
    escreverErro(`${r.erro}\n\n${ajudaGeral()}\n`);
    return 1;
  }
  if (r.ajuda) {
    escrever(`${ajudaGeral()}\n`);
    return 0;
  }

  const executor = EXECUTORES[r.subcomando];
  if (executor === undefined) {
    escreverErro(`o subcomando ${r.subcomando} ainda nao esta disponivel nesta versao\n`);
    return 1;
  }
  return executor(r.resto, { escrever, escreverErro });
}
