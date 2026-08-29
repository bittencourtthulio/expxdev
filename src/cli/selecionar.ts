import { lerLock } from "../nucleo/lock.js";
import { executarInit, type ResultadoInit } from "./init.js";

/**
 * `add` e `remove`: mudam a seleção e remontam tudo a partir dela.
 *
 * Remontar do zero, em vez de mexer no plugin já montado, mantém uma única
 * rotina responsável pela árvore instalada — o que evita a classe de bug em que
 * uma remoção deixa arquivo órfão que ninguém mais sabe de onde veio.
 */

export type OpcoesSelecionar = {
  raiz: string;
  skills: readonly string[];
  origens?: Record<string, string>;
};

export type ResultadoSelecionar =
  | { ok: true; selecao: string[]; init: ResultadoInit }
  | { ok: false; erro: string };

function estadoAtual(raiz: string): { skills: string[]; harness: string[] } | undefined {
  const l = lerLock(raiz);
  if (!l.ok) return undefined;
  return { skills: Object.keys(l.lock.skills), harness: l.lock.harness };
}

async function remontar(
  op: OpcoesSelecionar,
  selecao: string[],
  harness: string[],
): Promise<ResultadoSelecionar> {
  const init = await executarInit({
    raiz: op.raiz,
    skills: selecao,
    harness,
    ...(op.origens !== undefined ? { origens: op.origens } : {}),
  });
  return { ok: true, selecao, init };
}

export async function adicionarSkills(op: OpcoesSelecionar): Promise<ResultadoSelecionar> {
  const atual = estadoAtual(op.raiz);
  if (atual === undefined) return { ok: false, erro: "nao ha instalacao valida neste projeto: rode expx init" };

  const selecao = [...atual.skills];
  for (const s of op.skills) if (!selecao.includes(s)) selecao.push(s);
  return remontar(op, selecao, atual.harness);
}

export async function removerSkills(op: OpcoesSelecionar): Promise<ResultadoSelecionar> {
  const atual = estadoAtual(op.raiz);
  if (atual === undefined) return { ok: false, erro: "nao ha instalacao valida neste projeto: rode expx init" };

  for (const s of op.skills) {
    if (!atual.skills.includes(s)) return { ok: false, erro: `${s} nao esta instalada neste projeto` };
  }
  const selecao = atual.skills.filter((s) => !op.skills.includes(s));
  if (selecao.length === 0) {
    return {
      ok: false,
      erro: "remover a ultima skill deixaria a instalacao vazia: use um novo expx init para reconfigurar",
    };
  }
  return remontar(op, selecao, atual.harness);
}
