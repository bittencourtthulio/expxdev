import React from "react";
import { render, type Instance } from "ink";
import type { StoreVisao } from "./estadoExterno.js";
import { App } from "./App.js";

/**
 * Monta o painel Ink de verdade, em `process.stdout`.
 *
 * Só é chamado quando há TTY real (decidido em `watch.ts`/`principal.ts`) —
 * o Ink exige um `WriteStream` de verdade, não a função `escrever` injetável
 * que o resto do watch usa para não capturar `process.stdout` global (o que
 * causaria flakiness em teste paralelo). É por isso que este caminho nunca é
 * exercitado pelos testes de integração do watch: eles rodam sem TTY, e caem
 * no motor antigo. Os componentes Ink em si são testados via
 * `ink-testing-library`, que fornece seu próprio stream fake.
 */
export function renderInkApp(
  store: StoreVisao,
  op: { colunas?: number; arvore?: boolean; pulsoMs?: number },
): Instance {
  return render(<App store={store} {...op} />, {
    stdout: process.stdout,
    exitOnCtrlC: false,
  });
}
