import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

/**
 * Troca o `.expx/` inteiro de uma vez, ou não troca nada.
 *
 * Montar direto no destino final deixa `.expx/` pela metade se a busca de uma
 * skill falhar no meio — e um `.expx/` pela metade é pior que nenhum, porque o
 * harness carrega um plugin incompleto sem avisar. Montar ao lado e trocar por
 * `rename` mantém a instalação anterior válida até o último instante.
 *
 * O `rename` é a operação que dá a atomicidade, e ele só é atômico dentro do
 * mesmo sistema de arquivos: por isso a pasta temporária fica ao lado do
 * destino, na raiz do projeto, e não em `/tmp`.
 */
export function escreverAtomico(raizProjeto: string, montar: (pastaTemporaria: string) => void): void {
  const destino = join(raizProjeto, ".expx");
  const temporaria = join(raizProjeto, `.expx.tmp-${String(process.pid)}-${String(Date.now())}`);
  const anterior = `${temporaria}-anterior`;

  mkdirSync(temporaria, { recursive: true });
  try {
    montar(temporaria);
  } catch (e: unknown) {
    rmSync(temporaria, { recursive: true, force: true });
    throw e;
  }

  const tinhaAnterior = existsSync(destino);
  if (tinhaAnterior) renameSync(destino, anterior);
  try {
    renameSync(temporaria, destino);
  } catch (e: unknown) {
    // não conseguiu publicar o novo: devolve o antigo ao lugar
    if (tinhaAnterior) renameSync(anterior, destino);
    rmSync(temporaria, { recursive: true, force: true });
    throw e;
  }
  rmSync(anterior, { recursive: true, force: true });
}
