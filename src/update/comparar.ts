import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  /** Presentes só quando `!travado`: o commit é quem decidiu `emDia`, não o nome da branch. */
  commitAtual?: string;
  commitNovo?: string;
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
 * `repositorio` é uma URL remota (`https://...`) na maioria das instalações
 * reais — nunca um caminho de disco —, então não dá para usá-lo como `cwd` do
 * `git log` diretamente. Por isso o clone (completo, sem `--depth`: o
 * intervalo pode abranger mais de um commit de distância da ponta) para um
 * diretório temporário, de onde o `log` roda e que é sempre descartado depois.
 *
 * Falha aqui nunca derruba o update: sem o resumo, o usuário ainda pode
 * decidir pela versão.
 */
async function mudancasEntre(repositorio: string, de: string, para: string): Promise<string[]> {
  const destino = mkdtempSync(join(tmpdir(), "expx-mudancas-"));
  try {
    await exec("git", ["clone", "--quiet", repositorio, destino]);
    const { stdout } = await exec("git", [
      "-c", "core.pager=cat",
      "log", "--format=%s", `${de}..${para}`,
    ], { cwd: destino });
    return stdout.split("\n").map((l) => l.trim()).filter((l) => l !== "");
  } catch {
    return [];
  } finally {
    rmSync(destino, { recursive: true, force: true });
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
    // Travado por tag, "em dia" é a tag ser igual. Sem tag, o nome da branch
    // (`main`) nunca muda — é o commit por trás dela que diz se há novidade.
    // Sem SHA resolvido (rede falhou na parte de commit só) ou instalado em
    // modo local (commit gravado como "<sha>-local", nunca comparável a um SHA
    // remoto — ver `copiarLocal`), cai para o nome: pior caso é herdar o
    // comportamento antigo, nunca travar o update.
    const porCommit = !alvo.travado && alvo.commit !== undefined && !travada.commit.endsWith("-local");
    const emDia = porCommit ? alvo.commit === travada.commit : alvo.referencia === travada.referencia;
    itens.push({
      nome,
      // `atual`/`nova` continuam sendo a referência INSTALÁVEL (nome de branch
      // ou tag) — é o que o `update` repassa ao `init` como `--to`. O commit
      // que decidiu o `emDia` vai em campo à parte, só para exibição.
      atual: travada.referencia,
      nova: alvo.referencia,
      emDia,
      travado: alvo.travado,
      ...(porCommit ? { commitAtual: travada.commit, commitNovo: alvo.commit } : {}),
      // "de" continua sendo a referência (tag ou, sem tag, o próprio commit
      // travado): o commit do lock pode vir de um clone raso e não ter
      // histórico suficiente para o `git log` alcançar a tag antiga a partir dele.
      mudancas: emDia
        ? []
        : await mudancasEntre(repositorio, porCommit ? travada.commit : travada.referencia, alvo.commit ?? alvo.referencia),
    });
  }

  return { ok: true, itens, aAplicar: itens.filter((i) => !i.emDia && i.erro === undefined) };
}
