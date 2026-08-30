import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { executarExpx, usarPerguntador } from "./expx.js";
import { perguntadorDeRoteiro, perguntadorDeTerminal } from "./perguntar.js";

/**
 * O bug que este arquivo tranca: `npx expxdev init` sem flag nenhuma saía com
 * "nenhuma skill selecionada" porque nada nunca perguntava. O wizard existia
 * na especificação e nas flags ("o equivalente não interativo de cada
 * pergunta"), mas não no código.
 */

const tty = { entrada: process.stdin.isTTY, saida: process.stdout.isTTY };
const cwdOriginal = process.cwd();
afterEach(() => {
  process.chdir(cwdOriginal);
  process.stdin.isTTY = tty.entrada;
  process.stdout.isTTY = tty.saida;
  usarPerguntador(() => perguntadorDeTerminal());
});

function capturar(): { saida: () => string; erro: () => string; alvo: Parameters<typeof executarExpx>[1] } {
  let saida = "";
  let erro = "";
  return {
    saida: () => saida,
    erro: () => erro,
    alvo: {
      escrever: (t) => {
        saida += t;
      },
      escreverErro: (t) => {
        erro += t;
      },
    },
  };
}

describe("init sem flags", () => {
  it("integração: num terminal, `init` puro pergunta em vez de sair com erro", async () => {
    process.stdin.isTTY = true;
    process.stdout.isTTY = true;
    // Num diretório limpo: rodando dentro do próprio repo, o `init` encontra o
    // .expx/ de verdade e pergunta "reconfigurar?" antes de chegar às skills.
    process.chdir(mkdtempSync(join(tmpdir(), "expx-init-")));
    // Recusa a confirmação final: o teste comprova que PERGUNTOU, sem tocar
    // na rede nem no disco para instalar de verdade.
    const q = perguntadorDeRoteiro(["1", "", "n", "n"]);
    usarPerguntador(() => q);
    const c = capturar();

    const codigo = await executarExpx(["init"], c.alvo);

    expect(q.escrito()).toContain("Quais skills instalar");
    expect(c.erro()).not.toContain("nenhuma skill selecionada");
    expect(codigo).toBe(1);
    expect(c.erro()).toContain("cancelado");
  });

  it("funcional: sem terminal, o erro ensina como escolher as skills", async () => {
    process.stdin.isTTY = false;
    process.stdout.isTTY = false;
    const c = capturar();

    const codigo = await executarExpx(["init"], c.alvo);

    expect(codigo).toBe(1);
    expect(c.erro()).toContain("--skills");
    expect(c.erro()).toContain("sprintx");
  });

  it("funcional: stdout TTY com stdin redirecionado não tenta perguntar", async () => {
    // `expx init < /dev/null` num terminal: há tela, não há teclado. Perguntar
    // aqui travaria o processo esperando resposta que nunca chega.
    process.stdin.isTTY = false;
    process.stdout.isTTY = true;
    usarPerguntador(() => {
      throw new Error("nao deveria perguntar sem stdin");
    });
    const c = capturar();

    const codigo = await executarExpx(["init"], c.alvo);

    expect(codigo).toBe(1);
    expect(c.erro()).toContain("--skills");
  });

  it("funcional: com --skills, o wizard não entra no caminho", async () => {
    process.stdin.isTTY = false;
    process.stdout.isTTY = false;
    usarPerguntador(() => {
      throw new Error("nao deveria perguntar com --skills");
    });
    const c = capturar();

    const codigo = await executarExpx(["init", "--skills", "sprintx"], c.alvo);

    // Sem --yes e sem terminal: mostra o que faria e sai sem escrever.
    expect(codigo).toBe(0);
    expect(c.saida()).toContain("instalaria: sprintx");
  });

  it("funcional: skill inexistente continua sendo erro, mesmo com terminal", async () => {
    process.stdin.isTTY = true;
    process.stdout.isTTY = true;
    const c = capturar();

    const codigo = await executarExpx(["init", "--skills", "inexistente"], c.alvo);

    expect(codigo).toBe(1);
    expect(c.erro()).toContain("inexistente");
  });
});
