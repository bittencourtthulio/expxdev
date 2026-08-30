import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, writeFileSync, renameSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { observarFontes, type ObservadorFontes } from "./observar.js";

/**
 * T-03.02 — observar as duas raízes.
 *
 * O observador do painel ignora `.expx` por decisão própria (D-06 dele, contra
 * realimentação do índice do memox) e observa `docs/`, da qual `.expx/` nem é
 * descendente. O watch precisa das duas, com gatilhos SEPARADOS: releitura do
 * plano só quando o plano muda.
 */

let dir: string | undefined;
let obs: ObservadorFontes | undefined;

afterEach(async () => {
  if (obs !== undefined) await obs.parar();
  obs = undefined;
  if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

function projeto(): string {
  const d = mkdtempSync(join(tmpdir(), "expx-obs-"));
  mkdirSync(join(d, "docs", "trabalho", "sprint-01"), { recursive: true });
  mkdirSync(join(d, ".expx"), { recursive: true });
  writeFileSync(join(d, "docs", "trabalho", "sprint-01", "tasks.md"), "inicial\n");
  writeFileSync(join(d, ".expx", "estado.json"), '{"expx_estado":1}');
  return d;
}

const espera = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

describe("observador das duas raízes", () => {
  it("integração: plano e estado disparam gatilhos separados", async () => {
    dir = projeto();
    let plano = 0;
    let estado = 0;
    obs = await observarFontes(dir, { aoMudarPlano: () => plano++, aoMudarEstado: () => estado++, aoMudarRastro: () => undefined }, 40);

    // mudança no plano: só o gatilho de plano
    writeFileSync(join(dir, "docs", "trabalho", "sprint-01", "tasks.md"), "mudou\n");
    await espera(300);
    expect(plano).toBe(1);
    expect(estado).toBe(0);

    // mudança no estado, por rename — que é como o contrato manda gravar
    // (escrita atômica, regra 3): gera unlink+add, não change. Um observador
    // escrito só para "change" perderia TODA atualização do estado.json.
    const tmp = join(dir, ".expx", "estado.json.tmp");
    writeFileSync(tmp, '{"expx_estado":1,"n":2}');
    renameSync(tmp, join(dir, ".expx", "estado.json"));
    await espera(300);
    expect(estado).toBe(1);
    expect(plano).toBe(1); // o plano NÃO foi relido
  });

  it("funcional: três alterações seguidas viram um disparo só", async () => {
    dir = projeto();
    let plano = 0;
    obs = await observarFontes(dir, { aoMudarPlano: () => plano++, aoMudarEstado: () => undefined, aoMudarRastro: () => undefined }, 60);

    const arq = join(dir, "docs", "trabalho", "sprint-01", "tasks.md");
    for (let i = 0; i < 3; i++) writeFileSync(arq, `v${String(i)}\n`);
    await espera(400);

    expect(plano).toBe(1);
  });

  it("funcional: parar resolve e nenhum disparo chega depois", async () => {
    dir = projeto();
    let plano = 0;
    const o = await observarFontes(dir, { aoMudarPlano: () => plano++, aoMudarEstado: () => undefined, aoMudarRastro: () => undefined }, 40);
    await o.parar();

    writeFileSync(join(dir, "docs", "trabalho", "sprint-01", "tasks.md"), "depois\n");
    await espera(300);
    expect(plano).toBe(0);
  });

  it("funcional: subir o observador não dispara gatilho nenhum", async () => {
    // Regressão: com `awaitWriteFinish` ligado, a varredura inicial entregava
    // `add` de cada arquivo existente DEPOIS do `ready`, e o `ignoreInitial`
    // não os pegava. O watch redesenhava e relia o plano inteiro ao subir,
    // sem ninguém ter tocado em nada.
    dir = projeto();
    let plano = 0;
    let estado = 0;
    obs = await observarFontes(
      dir,
      { aoMudarPlano: () => plano++, aoMudarEstado: () => estado++, aoMudarRastro: () => undefined },
      40,
    );

    await espera(400);
    expect(plano, "plano disparou sozinho na subida").toBe(0);
    expect(estado, "estado disparou sozinho na subida").toBe(0);
  });
});
