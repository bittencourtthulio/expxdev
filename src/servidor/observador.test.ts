import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, cpSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { observar, type Observador } from "./observador.js";

let obs: Observador | null = null;
let dir: string | null = null;

afterEach(async () => {
  await obs?.parar();
  obs = null;
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

function projetoTemporario(): string {
  const d = mkdtempSync(join(tmpdir(), "expx-obs-"));
  cpSync("fixtures/projeto-ok", d, { recursive: true });
  return d;
}

describe.sequential("observador de arquivos", () => {
  it("integração: alterar um arquivo dispara exatamente uma releitura", async () => {
    dir = projetoTemporario();
    let disparos = 0;
    obs = await observar(dir, () => disparos++, 80);

    const alvo = join(dir, "docs/exportacao-csv/ORQUESTRADOR.md");
    writeFileSync(alvo, `${String(Date.now())}\n`, { flag: "a" });

    await new Promise((r) => setTimeout(r, 500));
    expect(disparos).toBe(1);
  });

  it("funcional: três alterações seguidas viram um único disparo", async () => {
    dir = projetoTemporario();
    let disparos = 0;
    obs = await observar(dir, () => disparos++, 150);

    const alvo = join(dir, "docs/exportacao-csv/sprint-01/tasks.md");
    for (let i = 0; i < 3; i++) {
      writeFileSync(alvo, `# ${String(i)}\n`, { flag: "a" });
      await new Promise((r) => setTimeout(r, 20));
    }

    await new Promise((r) => setTimeout(r, 600));
    expect(disparos).toBe(1);
  });
});

// Este arquivo mede AUSENCIA de evento ("nao disparou"), e por isso e o mais
// sensivel a ruido de vizinho: rodando concorrente, o watcher de um teste
// capta a atividade de arquivo que outro teste gera em /tmp, e a assercao
// "disparos === 0" falha de forma intermitente. Em serie, o arquivo e estavel.
describe.sequential("observação de .expx", () => {
  /**
   * Gravar o índice do memox NÃO pode disparar releitura: quem grava é o motor
   * do memox, disparado pelo hook `Stop`, e o painel não tem nada a reler por
   * causa disso além do próprio índice — que ele relê na próxima montagem.
   * Sem isso, reindexar realimenta a recarga (decisão D-06).
   */
  it("integração: gravar em .expx não dispara, gravar em docs dispara", async () => {
    dir = projetoTemporario();
    let disparos = 0;
    obs = await observar(dir, () => disparos++, 80);

    mkdirSync(join(dir, ".expx/memoria"), { recursive: true });
    writeFileSync(join(dir, ".expx/memoria/indice.json"), '{"versao":1}');
    await new Promise((r) => setTimeout(r, 400));
    expect(disparos).toBe(0);

    writeFileSync(join(dir, "docs/exportacao-csv/ORQUESTRADOR.md"), "x\n", { flag: "a" });
    await new Promise((r) => setTimeout(r, 400));
    expect(disparos).toBe(1);
  });

  it("funcional: reescrever o índice várias vezes segue sem disparar", async () => {
    dir = projetoTemporario();
    let disparos = 0;
    obs = await observar(dir, () => disparos++, 80);

    mkdirSync(join(dir, ".expx/memoria"), { recursive: true });
    for (let i = 0; i < 3; i++) {
      writeFileSync(join(dir, ".expx/memoria/indice.json"), `{"versao":1,"n":${String(i)}}`);
    }
    await new Promise((r) => setTimeout(r, 400));
    expect(disparos).toBe(0);
  });
});
