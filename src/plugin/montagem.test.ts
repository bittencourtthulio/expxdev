import { describe, it, expect, afterEach } from "vitest";
import { existsSync, rmSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { detectarLayout } from "../nucleo/layout.js";
import { montarPlugin, type SkillMontavel } from "./montagem.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

function montavel(nome: string, layout: "embutido" | "plano" = "embutido"): SkillMontavel {
  const repo = criarRepoSkill({ nome, tags: [], layout });
  repos.push(repo);
  const l = detectarLayout(repo, nome);
  if (!l.ok) throw new Error(l.erro);
  return { nome, raizSkill: l.raizSkill, comandos: l.comandos };
}

describe("nucleo compartilhado", () => {
  // A Camada 2 do núcleo só existe se ela CHEGA ao projeto. Sem este teste, a
  // pasta pode sair da montagem sem ninguém perceber, e cada skill volta a
  // manter a própria cópia do rastro — que é o problema que ele resolve.
  it("integração: o núcleo viaja junto com o plugin montado", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    montarPlugin(destino, [montavel("sprintx")], "1.0.0");

    const rastro = join(destino, "nucleo", "hooks", "expx-rastro.sh");
    expect(existsSync(rastro)).toBe(true);

    const fonte = readFileSync(rastro, "utf8");
    // A ferramenta é parâmetro, nunca literal: é o que impedia compartilhar.
    expect(fonte).toContain("EXPX_FERRAMENTA");
    expect(fonte).toContain("expx_rastro_grava");
    expect(fonte).toContain("expx_modo");
  });
});

describe("montagem do plugin", () => {
  it("integração: monta com duas de três skills e a terceira não aparece", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    montarPlugin(destino, [montavel("sprintx"), montavel("runx", "plano")], "0.1.0");

    expect(existsSync(join(destino, "skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(destino, "skills/runx/SKILL.md"))).toBe(true);
    expect(existsSync(join(destino, "skills/mergex"))).toBe(false);
  });

  it("funcional: dado sprintx selecionado, a skill e o comando dele existem no plugin", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    montarPlugin(destino, [montavel("sprintx")], "0.1.0");

    expect(existsSync(join(destino, "skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(destino, "commands/sprintx.md"))).toBe(true);
    expect(existsSync(join(destino, ".claude-plugin/plugin.json"))).toBe(true);

    const pj = JSON.parse(readFileSync(join(destino, ".claude-plugin/plugin.json"), "utf8")) as {
      name: string;
    };
    expect(pj.name).toBe("expx");
  });

  it("funcional: a subárvore references/ da skill é copiada junto", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    montarPlugin(destino, [montavel("sprintx")], "0.1.0");
    expect(existsSync(join(destino, "skills/sprintx/references/01.md"))).toBe(true);
  });
});

/**
 * O rastro só existe se algo o chamar.
 *
 * Medido em produção: o plugin instalado num projeto real tinha `commands`,
 * `skills` e `nucleo` — e nenhum hook. Como todo caminho de erro do rastro é
 * falha aberta (regra 3 do contrato), nada avisava: `docs/eventos/` ficava
 * vazio para sempre, e o painel e o watch não tinham o que mostrar.
 *
 * O contrato do Claude Code é `hooks/hooks.json` na raiz do plugin, detectado
 * automaticamente quando o plugin está habilitado.
 */
describe("hooks do plugin", () => {
  it("integração: os hooks da skill viajam para o plugin, com o hooks.json", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    const repo = criarRepoSkill({ nome: "runx", tags: [], layout: "embutido" });
    repos.push(repo);
    // o layout real: hooks em PASTA, mais o hooks.json que os declara
    mkdirSync(join(repo, ".claude/hooks/runx"), { recursive: true });
    mkdirSync(join(repo, ".claude/hooks/comum"), { recursive: true });
    writeFileSync(join(repo, ".claude/hooks/runx/escopo.py"), "# hook\n");
    writeFileSync(join(repo, ".claude/hooks/comum/rastro.py"), "# rastro\n");
    writeFileSync(
      join(repo, ".claude/hooks/hooks.json"),
      JSON.stringify({
        hooks: {
          PostToolUse: [
            {
              matcher: "Write|Edit",
              hooks: [
                {
                  type: "command",
                  command: 'python3 "${CLAUDE_PLUGIN_ROOT}/hooks/comum/rastro.py"',
                },
              ],
            },
          ],
        },
      }),
    );

    const l = detectarLayout(repo, "runx");
    if (!l.ok) throw new Error(l.erro);
    montarPlugin(destino, [{ nome: "runx", raizSkill: l.raizSkill, comandos: l.comandos, hooks: l.hooks, arvoreHooks: l.arvoreHooks }], "1.0.0");

    // os scripts chegaram, preservando a estrutura que o comando referencia
    expect(existsSync(join(destino, "hooks", "comum", "rastro.py"))).toBe(true);
    expect(existsSync(join(destino, "hooks", "runx", "escopo.py"))).toBe(true);

    // e o hooks.json que faz o Claude Code dispará-los
    const manifesto = join(destino, "hooks", "hooks.json");
    expect(existsSync(manifesto)).toBe(true);
    const decl = JSON.parse(readFileSync(manifesto, "utf8")) as {
      hooks: Record<string, unknown[]>;
    };
    expect(decl.hooks["PostToolUse"]).toBeDefined();
    // o caminho tem que resolver de dentro do plugin instalado
    expect(JSON.stringify(decl)).toContain("${CLAUDE_PLUGIN_ROOT}/hooks/");
  });
});
