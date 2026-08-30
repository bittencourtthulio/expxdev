import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { buscarNoCatalogo } from "../nucleo/catalogo.js";
import { lerLock } from "../nucleo/lock.js";
import { resolverAlvo } from "../nucleo/versao.js";

const exec = promisify(execFile);

/**
 * O que mudaria num `update`, antes de aplicar qualquer coisa.
 *
 * Separar a comparação da aplicação é o que permite o `--check` e o resumo
 * mostrado antes da confirmação: o usuário decide vendo o que vai acontecer, e
 * não descobrindo depois.
 */

export type ItemComparacao = {
  nome: string;
  atual: string;
  nova: string;
  emDia: boolean;
  travado: boolean;
  /** CHANGELOG quando existir; senão, títulos dos commits entre as referências. */
  mudancas: string[];
  erro?: string;
};

export type Comparacao =
  | { ok: true; itens: ItemComparacao[]; aAplicar: ItemComparacao[] }
  | { ok: false; erro: string };

export type OpcoesComparar = {
  raiz: string;
  /** Limita a comparação a estas skills; vazio compara todas as instaladas. */
  somente?: readonly string[];
  origens?: Record<string, string>;
  referencias?: Record<string, string>;
};

function origemDe(nome: string, lockRepo: string, origens?: Record<string, string>): string {
  return origens?.[nome] ?? lockRepo ?? buscarNoCatalogo(nome)?.repositorio ?? "";
}

/**
 * Os títulos dos commits entre duas referências.
 *
 * Lê do repositório remoto por clone raso do intervalo. Falha aqui nunca
 * derruba o update: sem o resumo, o usuário ainda pode decidir pela versão.
 */
async function mudancasEntre(repositorio: string, de: string, para: string): Promise<string[]> {
  try {
    const { stdout } = await exec("git", [
      "-c", "core.pager=cat",
      "log", "--format=%s", `${de}..${para}`,
    ], { cwd: repositorio });
    return stdout.split("\n").map((l) => l.trim()).filter((l) => l !== "");
  } catch {
    return [];
  }
}

export async function compararComRemoto(op: OpcoesComparar): Promise<Comparacao> {
  const l = lerLock(op.raiz);
  if (!l.ok) return { ok: false, erro: l.erro };
  if (l.incompativel) {
    return {
      ok: false,
      erro: "o .expx/ deste projeto foi criado por uma versao MAIS NOVA do CLI: atualize o expx antes de continuar",
    };
  }

  const itens: ItemComparacao[] = [];
  const alvos = Object.entries(l.lock.skills).filter(
    ([nome]) => op.somente === undefined || op.somente.length === 0 || op.somente.includes(nome),
  );

  for (const [nome, travada] of alvos) {
    const repositorio = origemDe(nome, travada.repositorio, op.origens);
    const alvo = await resolverAlvo(repositorio, op.referencias?.[nome]);
    if (!alvo.ok) {
      itens.push({
        nome,
        atual: travada.referencia,
        nova: travada.referencia,
        emDia: true,
        travado: travada.travado,
        mudancas: [],
        erro: alvo.erro ?? "repositorio inacessivel",
      });
      continue;
    }
    const emDia = alvo.referencia === travada.referencia;
    itens.push({
      nome,
      atual: travada.referencia,
      nova: alvo.referencia,
      emDia,
      travado: alvo.travado,
      mudancas: emDia ? [] : await mudancasEntre(repositorio, travada.referencia, alvo.referencia),
    });
  }

  return { ok: true, itens, aAplicar: itens.filter((i) => !i.emDia && i.erro === undefined) };
}
