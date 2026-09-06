import type { Visao } from "../visao/projetar.js";

/**
 * Store externo ao React para a `Visao`, assinado via `useSyncExternalStore`.
 *
 * `fontes/observar.ts` continua sendo a ÚNICA fonte de verdade sobre QUANDO
 * redesenhar: `watch.ts` chama `definir()` nos três gatilhos existentes
 * (`aoMudarPlano`, `aoMudarEstado`, `aoMudarRastro`), exatamente como hoje
 * muta a variável de closure `visao` e chama `redesenhar()`. O componente
 * Ink só assina — nenhum `useEffect` observa arquivo por conta própria, o que
 * duplicaria a decisão de quando reagir.
 */
export type StoreVisao = {
  obter: () => Visao;
  definir: (nova: Visao) => void;
  inscrever: (ouvinte: () => void) => () => void;
};

export function criarStoreVisao(inicial: Visao): StoreVisao {
  let atual = inicial;
  const ouvintes = new Set<() => void>();

  return {
    obter: () => atual,
    definir: (nova) => {
      atual = nova;
      for (const f of ouvintes) f();
    },
    inscrever: (f) => {
      ouvintes.add(f);
      return () => {
        ouvintes.delete(f);
      };
    },
  };
}
