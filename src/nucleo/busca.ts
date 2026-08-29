import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const exec = promisify(execFile);

/**
 * Traz os arquivos de uma skill para o disco, na referência alvo.
 *
 * Usa o `git` do sistema em vez da API do GitHub: assim a credencial já
 * configurada na máquina atende repositório privado sem que o CLI jamais peça
 * ou armazene token, e não há limite de requisição para esbarrar.
 *
 * Falha de rede ou repositório inacessível NUNCA lança: devolve `ok: false`
 * nomeando a skill, porque uma skill indisponível não pode abortar a
 * instalação das outras quatro.
 */

export type PedidoBusca = {
  nome: string;
  repositorio: string;
  referencia: string;
};

export type ResultadoBusca =
  | { ok: true; nome: string; caminho: string; commit: string }
  | { ok: false; nome: string; erro: string };

/** Clona só a referência pedida, com profundidade 1. Devolve a pasta temporária. */
export async function buscarSkill(p: PedidoBusca): Promise<ResultadoBusca> {
  const destino = mkdtempSync(join(tmpdir(), `expx-busca-${p.nome}-`));
  try {
    await exec("git", [
      "clone",
      "--quiet",
      "--depth",
      "1",
      "--branch",
      p.referencia,
      p.repositorio,
      destino,
    ]);
    const { stdout } = await exec("git", ["rev-parse", "HEAD"], { cwd: destino });
    return { ok: true, nome: p.nome, caminho: destino, commit: stdout.trim() };
  } catch (e: unknown) {
    rmSync(destino, { recursive: true, force: true });
    return { ok: false, nome: p.nome, erro: String(e) };
  }
}
