import { watch, type FSWatcher } from "chokidar";

export type Observador = {
  parar: () => Promise<void>;
};

/**
 * Observa a pasta e agrupa alterações próximas num único disparo.
 *
 * O debounce não é só economia: as skills gravam `tasks.md` a cada transição
 * de task, e ler o arquivo no instante da gravação produz YAML truncado —
 * uma rejeição transitória que apareceria e sumiria da tela "fora do schema".
 * Esperar o silêncio evita mostrar ao usuário um erro que não existe.
 */
export async function observar(
  raiz: string,
  aoMudar: () => void,
  debounceMs = 300,
): Promise<Observador> {
  let timer: NodeJS.Timeout | null = null;

  const agendar = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      aoMudar();
    }, debounceMs);
  };

  const watcher: FSWatcher = watch(raiz, {
    ignoreInitial: true,
    ignored: (caminho: string) => /(^|[/\\])(node_modules|\.git|dist)([/\\]|$)/.test(caminho),
    awaitWriteFinish: { stabilityThreshold: Math.max(50, debounceMs / 3), pollInterval: 20 },
  });

  watcher.on("add", agendar).on("change", agendar).on("unlink", agendar).on("addDir", agendar).on("unlinkDir", agendar);
  // erro de observação (permissão, limite de watchers) não derruba o painel
  watcher.on("error", () => undefined);

  await new Promise<void>((ok) => watcher.on("ready", () => ok()));

  return {
    parar: async () => {
      if (timer) clearTimeout(timer);
      await watcher.close();
    },
  };
}
