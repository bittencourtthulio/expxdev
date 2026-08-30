import { watch, type FSWatcher } from "chokidar";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export type Observador = {
  parar: () => Promise<void>;
};

export type OpcoesObservador = {
  /** Disparado quando `docs/` muda: releitura total do projeto. */
  aoMudar: () => void;
  /**
   * Disparado quando o índice do memox muda. Opcional: sem ele, o índice
   * volta a só ser lido na montagem, que é o comportamento antigo.
   */
  aoMudarMemoria?: () => void;
  debounceMs?: number;
};

/** Agrupa alterações próximas num único disparo. */
function debounce(fn: () => void, ms: number): { agendar: () => void; cancelar: () => void } {
  let timer: NodeJS.Timeout | null = null;
  return {
    agendar: () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        fn();
      }, ms);
    },
    cancelar: () => {
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}

/**
 * Observa a pasta e agrupa alterações próximas num único disparo.
 *
 * O debounce não é só economia: as skills gravam `tasks.md` a cada transição
 * de task, e ler o arquivo no instante da gravação produz YAML truncado —
 * uma rejeição transitória que apareceria e sumiria da tela "fora do schema".
 * Esperar o silêncio evita mostrar ao usuário um erro que não existe.
 *
 * São DOIS watchers, com destinos diferentes, e a separação é o que mantém a
 * decisão D-06 de pé enquanto corrige o caso que ela deixou de fora:
 *
 *   `docs/`           releitura TOTAL do projeto (`aoMudar`).
 *   `.expx/memoria/`  releitura SÓ do índice (`aoMudarMemoria`).
 *
 * D-06 proibiu observar `.expx` porque reindexar dispararia o watcher, que
 * recarregaria o estado, que releria `docs/` — e uma reindexação disparada por
 * mudança em `docs/` realimentaria a recarga. A trava cortava o laço, mas
 * cortava junto o caso legítimo: o índice NASCER com o painel no ar. Um painel
 * aberto antes da primeira indexação mostrava "sem índice de memória" para
 * sempre, mesmo com o índice pronto no disco.
 *
 * Separar por destino corta o laço na raiz em vez de na porta: a releitura do
 * índice não toca `docs/` e não reindexa nada, então não tem como realimentar.
 */
export async function observar(
  raiz: string,
  aoMudar: (() => void) | OpcoesObservador,
  debounceMs = 300,
): Promise<Observador> {
  const op: OpcoesObservador =
    typeof aoMudar === "function" ? { aoMudar, debounceMs } : aoMudar;
  const ms = op.debounceMs ?? debounceMs;

  const comum = {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: Math.max(50, ms / 3), pollInterval: 20 },
  };

  /**
   * A pasta do índice é criada ANTES de qualquer watcher subir, e a ordem é o
   * que evita instabilidade: criada depois, a escrita cai no meio da varredura
   * inicial dos dois watchers, e o principal chega a emitir `change` de arquivo
   * que ninguém tocou. Antes, a árvore já está parada quando a observação
   * começa.
   *
   * Criar não é efeito colateral gratuito, é o que faz o watcher funcionar:
   * medido, o chokidar apontado para um caminho inexistente nunca passa a vê-lo
   * quando ele nasce — fica cego para sempre. E o caminho inexistente é
   * exatamente o caso que este watcher cobre, o painel que sobe num projeto
   * nunca indexado. Uma pasta vazia é inócua: o motor do memox faz `mkdir -p`
   * do mesmo caminho quando indexa.
   *
   * Falha aberta (D-05): sem permissão de escrita, o painel sobe sem o watcher
   * do índice em vez de não subir — a montagem ainda lê o índice.
   */
  const pastaMemoria = join(raiz, ".expx", "memoria");
  if (op.aoMudarMemoria) {
    try {
      mkdirSync(pastaMemoria, { recursive: true });
    } catch {
      // segue sem observar o índice
    }
  }

  const docs = debounce(op.aoMudar, ms);

  /**
   * `ignoreInitial` sozinho NÃO basta quando há `awaitWriteFinish`.
   *
   * Medido neste repositório: com os dois ligados, a varredura inicial ainda
   * entrega `change` de arquivo que ninguém tocou DEPOIS do evento `ready` — o
   * `awaitWriteFinish` segura esses eventos além do ponto em que o
   * `ignoreInitial` os descartaria. Em teste, com a árvore recém-copiada, isso
   * fazia `docs/relatorios/INDICE.md` "mudar" sozinho; em uso real é o mesmo
   * mecanismo, só que disparado por checkout ou sincronização de pasta.
   *
   * O watch de terminal já resolvia assim (`watch/fontes/observar.ts`); o
   * painel não tinha o portão, e por isso recarregava à toa logo depois de
   * subir.
   *
   * Só ligamos os gatilhos depois que a poeira da subida assenta.
   */
  let armado = false;

  // `.expx` continua FORA do watcher principal: quem cuida dele é o watcher
  // dedicado abaixo, e deixar os dois verem a mesma escrita traria de volta
  // exatamente a realimentação que D-06 evitou.
  const watcher: FSWatcher = watch(raiz, {
    ...comum,
    ignored: (caminho: string) => /(^|[/\\])(node_modules|\.git|dist|\.expx)([/\\]|$)/.test(caminho),
  });

  const eventos = ["add", "change", "unlink", "addDir", "unlinkDir"] as const;
  for (const e of eventos) watcher.on(e, () => { if (armado) docs.agendar(); });
  // erro de observação (permissão, limite de watchers) não derruba o painel
  watcher.on("error", () => undefined);

  /**
   * Ancorar na PASTA do índice, e não na raiz, é medido. Um segundo watcher
   * ancorado na raiz faz o `awaitWriteFinish` de ambos varrer os mesmos
   * arquivos, e o watcher principal passa a receber `change` espúrio de arquivo
   * que ninguém tocou — quebrando as garantias de silêncio que `observação de
   * .expx` cobre.
   *
   * A pasta, e não o arquivo: o motor grava de forma atômica (temporário +
   * rename), o que substitui o inode, e um watcher preso ao arquivo pararia de
   * ver mudança depois da primeira gravação.
   */
  const memoria = op.aoMudarMemoria;
  let wMemoria: FSWatcher | null = null;
  let mem: { agendar: () => void; cancelar: () => void } | null = null;

  if (memoria && existsSync(pastaMemoria)) {
    mem = debounce(memoria, ms);
    wMemoria = watch(pastaMemoria, {
      ...comum,
      depth: 0,
      /**
       * Sondagem, não evento do sistema de arquivos.
       *
       * Medido: apontado para uma pasta recém-criada, o watcher por evento
       * perde a primeira gravação em boa parte das execuções — e a primeira
       * gravação é justamente o caso que este watcher existe para pegar, o
       * índice nascendo com o painel no ar. Com sondagem, as dez execuções de
       * medição viram o arquivo nascer e ser reescrito, sem exceção.
       *
       * O custo é um `stat` por intervalo em UM arquivo pequeno, que o memox
       * reescreve poucas vezes por dia. É barato, e o watcher de `docs/` — que
       * vê a árvore inteira — segue por evento.
       *
       * O intervalo acompanha o debounce: sondar mais devagar que a janela de
       * agrupamento faria a detecção, e não o debounce, mandar no atraso.
       */
      usePolling: true,
      interval: Math.max(50, Math.floor(ms / 2)),
    });
    for (const e of eventos) wMemoria.on(e, () => { if (armado) mem?.agendar(); });
    wMemoria.on("error", () => undefined);
  }

  await Promise.all([
    new Promise<void>((ok) => watcher.on("ready", () => ok())),
    wMemoria ? new Promise<void>((ok) => wMemoria.on("ready", () => ok())) : Promise.resolve(),
  ]);

  // A janela de silêncio: um pouco mais que o `stabilityThreshold`, que é o
  // que atrasa os eventos da varredura inicial.
  await new Promise<void>((ok) =>
    setTimeout(ok, comum.awaitWriteFinish.stabilityThreshold + 60),
  );
  // O que tiver sido agendado durante a subida é descartado: não é mudança.
  docs.cancelar();
  mem?.cancelar();
  armado = true;

  return {
    parar: async () => {
      armado = false;
      docs.cancelar();
      mem?.cancelar();
      await Promise.all([watcher.close(), wMemoria?.close() ?? Promise.resolve()]);
    },
  };
}
