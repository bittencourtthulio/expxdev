import { watch, type FSWatcher } from "chokidar";
import { join } from "node:path";

/**
 * Observa as DUAS fontes do watch, com gatilhos separados.
 *
 * Por que não reusar `observar()` do painel, já que ele existe e usa o mesmo
 * chokidar: ele ignora `.expx/` (decisão D-06 dele, para o índice do memox não
 * realimentar a recarga) e recebe uma raiz só, avisando com um callback cego
 * que não diz o que mudou. O watch precisa do contrário nas três coisas.
 * Mexer no observador do painel arriscaria a decisão dele — decisão D-06 desta
 * feature manda ter o nosso (base/observador-de-arquivos.md, riscos 1 e 3).
 *
 * O gatilho separado não é preciosismo: a especificação exige que a árvore
 * completa seja "relida apenas quando os arquivos do plano mudam — não a cada
 * redesenho". Com um callback cego, uma linha nova no rastro releria o plano.
 */

export type ObservadorFontes = {
  parar: () => Promise<void>;
};

export type Gatilhos = {
  /** Um arquivo do plano mudou: relê a árvore (caro). */
  aoMudarPlano: () => void;
  /** `.expx/estado.json` mudou: relê só o estado (barato). */
  aoMudarEstado: () => void;
  /** O rastro mudou: relê só os eventos (barato). */
  aoMudarRastro: () => void;
};

/**
 * O debounce é menor que o do painel (150 ms contra 300 ms, decisão D-08):
 * uma tela sob observação humana contínua tolera menos latência que uma aba de
 * navegador ao lado. Continua alto o bastante para não pegar `tasks.md` no
 * meio da gravação, que é o motivo original do debounce do painel.
 */
export async function observarFontes(
  raizProjeto: string,
  gatilhos: Gatilhos,
  debounceMs = 150,
): Promise<ObservadorFontes> {
  const timers = new Map<string, NodeJS.Timeout>();

  const agendar = (chave: string, fn: () => void): void => {
    const anterior = timers.get(chave);
    if (anterior !== undefined) clearTimeout(anterior);
    timers.set(
      chave,
      setTimeout(() => {
        timers.delete(chave);
        fn();
      }, debounceMs),
    );
  };

  const comum = {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: Math.max(40, Math.floor(debounceMs / 3)),
      pollInterval: 20,
    },
  };

  const wDocs: FSWatcher = watch(join(raizProjeto, "docs"), {
    ...comum,
    ignored: (caminho: string) =>
      /(^|[/\\])(node_modules|\.git|dist)([/\\]|$)/.test(caminho),
  });

  // Observamos a PASTA `.expx`, não o arquivo: a escrita atômica que o
  // contrato exige (temporário + rename) substitui o inode, e um watcher
  // preso ao arquivo antigo pararia de ver mudança depois da primeira.
  const wEstado: FSWatcher = watch(join(raizProjeto, ".expx"), {
    ...comum,
    depth: 0, // só o topo: o índice do memox vive em .expx/memoria/
  });

  /**
   * `ignoreInitial` sozinho NÃO basta quando há `awaitWriteFinish`.
   *
   * Medido: com os dois ligados, a varredura inicial ainda entrega `add` de
   * cada arquivo existente DEPOIS do evento `ready` — o `awaitWriteFinish`
   * segura esses eventos além do ponto em que o `ignoreInitial` os
   * descartaria. O resultado era o watch redesenhar, e reler o plano inteiro,
   * assim que subia, sem ninguém ter tocado em nada.
   *
   * Só ligamos os gatilhos depois que a poeira da subida assenta.
   */
  let armado = false;

  /**
   * O rastro mora DENTRO de `docs/` (`docs/eventos/<id>.jsonl`), então quem
   * observa `docs/` recebe as duas coisas no mesmo watcher. Separar por
   * caminho é o que faz valer a promessa da especificação: uma linha nova no
   * rastro não pode custar a releitura do plano inteiro.
   */
  const ehRastro = (caminho: string): boolean =>
    /[/\\]docs[/\\]eventos[/\\]/.test(caminho) && caminho.endsWith(".jsonl");

  const eventos = ["add", "change", "unlink", "addDir", "unlinkDir"] as const;
  for (const e of eventos) {
    wDocs.on(e, (caminho: string) => {
      if (!armado) return;
      if (ehRastro(caminho)) agendar("rastro", gatilhos.aoMudarRastro);
      else agendar("plano", gatilhos.aoMudarPlano);
    });
    wEstado.on(e, (caminho: string) => {
      // só o estado.json interessa aqui
      if (armado && caminho.endsWith("estado.json")) {
        agendar("estado", gatilhos.aoMudarEstado);
      }
    });
  }

  // Erro de observação (permissão, limite de watchers do SO) não derruba o
  // watch: ele continua mostrando o que já leu.
  wDocs.on("error", () => undefined);
  wEstado.on("error", () => undefined);

  await Promise.all([
    new Promise<void>((ok) => wDocs.on("ready", () => ok())),
    new Promise<void>((ok) => wEstado.on("ready", () => ok())),
  ]);

  // A janela de silêncio: um pouco mais que o `stabilityThreshold`, que é o
  // que atrasa os eventos da varredura inicial.
  const assentar = comum.awaitWriteFinish.stabilityThreshold + 60;
  await new Promise<void>((ok) => setTimeout(ok, assentar));
  // O que tiver sido agendado durante a subida é descartado: não é mudança.
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  armado = true;

  return {
    parar: async () => {
      armado = false;
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
      await Promise.all([wDocs.close(), wEstado.close()]);
    },
  };
}
