import { lerLock } from "../nucleo/lock.js";
import { executarInit } from "../cli/init.js";
import { compararComRemoto, type ItemComparacao } from "./comparar.js";
import { verificarModificacaoLocal } from "./modificacao.js";

/**
 * O `update`: descobre, mostra, confirma e aplica — nessa ordem.
 *
 * Rollback ficou por conta do versionador, e não por cópia da versão anterior
 * dentro de `.expx/`. Como `.expx/` é commitado, `git checkout` devolve a
 * versão antiga; em troca dessa simplificação, o CLI é OBRIGADO a dizer isso em
 * toda execução que aplica alguma coisa, para que ninguém descubra a ausência
 * do comando de desfazer no pior momento.
 */

export const AVISO_ROLLBACK =
  "para desfazer esta atualizacao, reverta o .expx/ pelo versionador (ex.: git checkout -- .expx)";

export type OpcoesUpdateCli = {
  skills: string[];
  check: boolean;
  to?: string;
  latest: boolean;
  sim: boolean;
};

export type ResultadoFlagsUpdate =
  | { ok: true; opcoes: OpcoesUpdateCli }
  | { ok: false; erro: string };

export function interpretarFlagsUpdate(argv: readonly string[]): ResultadoFlagsUpdate {
  const opcoes: OpcoesUpdateCli = { skills: [], check: false, latest: false, sim: false };

  for (let i = 0; i < argv.length; i++) {
    const bruto = argv[i] ?? "";
    const igual = bruto.indexOf("=");
    const nome = igual === -1 ? bruto : bruto.slice(0, igual);
    const embutido = igual === -1 ? undefined : bruto.slice(igual + 1);
    const proximo = (): string | undefined => embutido ?? argv[++i];

    switch (nome) {
      case "--check":
        opcoes.check = true;
        break;
      case "--latest":
        opcoes.latest = true;
        break;
      case "--yes":
      case "--sim":
        opcoes.sim = true;
        break;
      case "--to": {
        const v = proximo();
        if (v === undefined || v === "") return { ok: false, erro: "--to exige uma tag ou commit" };
        opcoes.to = v;
        break;
      }
      default:
        if (nome.startsWith("-")) return { ok: false, erro: `opcao desconhecida em update: ${nome}` };
        opcoes.skills.push(nome);
    }
  }

  if (opcoes.to !== undefined && opcoes.skills.length !== 1) {
    return { ok: false, erro: "--to exige exatamente uma skill nomeada" };
  }
  return { ok: true, opcoes };
}

export type OpcoesUpdate = {
  raiz: string;
  skills?: readonly string[];
  check?: boolean;
  to?: string;
  latest?: boolean;
  sim?: boolean;
  interativo?: boolean;
  origens?: Record<string, string>;
};

export type ResultadoUpdate = {
  ok: boolean;
  aplicou: boolean;
  atualizadas: string[];
  emDia: string[];
  bloqueadas: Array<{ nome: string; motivo: string }>;
  mensagens: string[];
};

export async function executarUpdate(op: OpcoesUpdate): Promise<ResultadoUpdate> {
  const mensagens: string[] = [];
  const bloqueadas: Array<{ nome: string; motivo: string }> = [];

  const l = lerLock(op.raiz);
  if (!l.ok) {
    return { ok: false, aplicou: false, atualizadas: [], emDia: [], bloqueadas: [], mensagens: [l.erro] };
  }

  const referencias = op.to !== undefined && op.skills?.[0] !== undefined ? { [op.skills[0]]: op.to } : undefined;
  const comparacao = await compararComRemoto({
    raiz: op.raiz,
    ...(op.skills !== undefined ? { somente: op.skills } : {}),
    ...(op.origens !== undefined ? { origens: op.origens } : {}),
    ...(referencias !== undefined ? { referencias } : {}),
  });
  if (!comparacao.ok) {
    return { ok: false, aplicou: false, atualizadas: [], emDia: [], bloqueadas: [], mensagens: [comparacao.erro] };
  }

  const emDia = comparacao.itens.filter((i) => i.emDia).map((i) => i.nome);
  const candidatas: ItemComparacao[] = [];

  for (const item of comparacao.aAplicar) {
    // Trabalho manual nunca é sobrescrito por um comando de rotina.
    const mod = verificarModificacaoLocal(op.raiz, item.nome);
    if (mod.temModificacao) {
      bloqueadas.push({
        nome: item.nome,
        motivo: `modificacao local em: ${[...mod.alterados, ...mod.removidos].join(", ")}`,
      });
      continue;
    }
    candidatas.push(item);
  }

  for (const i of comparacao.itens) {
    if (i.erro !== undefined) bloqueadas.push({ nome: i.nome, motivo: i.erro });
  }
  for (const i of candidatas) {
    mensagens.push(`${i.nome}: ${i.atual} → ${i.nova}${i.mudancas.length > 0 ? ` (${String(i.mudancas.length)} mudanca(s))` : ""}`);
  }

  const podeAplicar = (op.sim ?? false) || (op.interativo ?? false);
  if (op.check === true || candidatas.length === 0 || !podeAplicar) {
    if (op.check !== true && candidatas.length > 0 && !podeAplicar) {
      mensagens.push("sem confirmacao disponivel: nada foi aplicado (use --yes para aplicar sem perguntar)");
    }
    return { ok: true, aplicou: false, atualizadas: [], emDia, bloqueadas, mensagens };
  }

  // Remonta do zero com as versões novas, mantendo a seleção e o harness.
  const selecao = Object.keys(l.lock.skills);
  const alvos: Record<string, string> = {};
  for (const c of candidatas) alvos[c.nome] = c.nova;
  for (const [nome, travada] of Object.entries(l.lock.skills)) {
    if (alvos[nome] === undefined) alvos[nome] = travada.referencia;
  }

  const init = await executarInit({
    raiz: op.raiz,
    skills: selecao,
    harness: l.lock.harness,
    referencias: alvos,
    ...(op.origens !== undefined ? { origens: op.origens } : {}),
  });

  mensagens.push(AVISO_ROLLBACK);
  return {
    ok: init.ok,
    aplicou: true,
    atualizadas: candidatas.map((c) => c.nome),
    emDia,
    bloqueadas,
    mensagens,
  };
}
