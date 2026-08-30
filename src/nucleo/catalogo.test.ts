import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CATALOGO, buscarNoCatalogo, ehCamada, NOMES } from "./catalogo.js";

describe("catálogo das skills", () => {
  it("integração: tem as oito skills do catalogo e nenhuma URL repetida", () => {
    expect(CATALOGO).toHaveLength(8);
    const urls = CATALOGO.map((s) => s.repositorio);
    expect(new Set(urls).size).toBe(8);
    expect(NOMES).toEqual([
      "sprintx",
      "runx",
      "legadox",
      "stackx",
      "mergex",
      "memox",
      "prodx",
      "buildx",
    ]);
  });

  it("funcional: memox aponta para o repositório do MemoX e é camada", () => {
    // o memox não tem fluxo próprio: só produz o índice que as outras consultam
    expect(buscarNoCatalogo("memox")?.repositorio).toBe("https://github.com/bittencourtthulio/MemoX");
    expect(ehCamada("memox")).toBe(true);
  });

  it("funcional: dado o nome legadox, devolve a URL do repositório correspondente", () => {
    const s = buscarNoCatalogo("legadox");
    expect(s?.repositorio).toBe("https://github.com/bittencourtthulio/legadox");
    expect(buscarNoCatalogo("inexistente")).toBeUndefined();
  });

  it("funcional: prodx aponta para o repositório do prodx e é camada", () => {
    // o prodx roda ANTES do plano: ele decide se existe trabalho, não como fazê-lo
    expect(buscarNoCatalogo("prodx")?.repositorio).toBe("https://github.com/bittencourtthulio/prodx");
    expect(ehCamada("prodx")).toBe(true);
  });

  it("funcional: legadox e stackx são camadas; sprintx e runx não são", () => {
    expect(ehCamada("legadox")).toBe(true);
    expect(ehCamada("stackx")).toBe(true);
    expect(ehCamada("sprintx")).toBe(false);
    expect(ehCamada("runx")).toBe(false);
  });

  it("funcional: buildx aponta para o repositório do buildx e não é camada", () => {
    // a buildx ORQUESTRA sprintx e mergex feature a feature — não modifica o
    // comportamento delas, que é o que define uma camada. Sem elas ela não roda,
    // e é a própria skill que avisa: o `init` não modela dependência entre skills.
    expect(buscarNoCatalogo("buildx")?.repositorio).toBe(
      "https://github.com/bittencourtthulio/buildx",
    );
    expect(ehCamada("buildx")).toBe(false);
  });
});

/**
 * Desenvolvimento das skills: apontar o `init` para o clone LOCAL.
 *
 * Sem isto, testar uma alteração de skill num projeto real exigia commitar e
 * publicar a cada tentativa, porque o `init` só sabia clonar do GitHub. O
 * `git clone` aceita caminho de sistema de arquivos como origem, então o
 * override não precisa de nenhum caminho de código novo na busca.
 */
describe("origem local das skills", () => {
  const salvo = process.env["EXPX_SKILLS_LOCAIS"];
  const criados: string[] = [];
  afterEach(() => {
    if (salvo === undefined) delete process.env["EXPX_SKILLS_LOCAIS"];
    else process.env["EXPX_SKILLS_LOCAIS"] = salvo;
    for (const d of criados.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  /** Raiz de mentira, para o teste não depender das pastas desta máquina. */
  function raizCom(pasta: string): string {
    const raiz = mkdtempSync(join(tmpdir(), "expx-locais-"));
    criados.push(raiz);
    mkdirSync(join(raiz, pasta), { recursive: true });
    return raiz;
  }

  it("funcional: sem a variável, o catálogo aponta para o GitHub", () => {
    delete process.env["EXPX_SKILLS_LOCAIS"];
    expect(buscarNoCatalogo("runx")?.repositorio).toBe("https://github.com/bittencourtthulio/runx");
  });

  it("funcional: com a variável, a skill existente na pasta vem do disco", () => {
    const raiz = raizCom("runx");
    process.env["EXPX_SKILLS_LOCAIS"] = raiz;
    expect(buscarNoCatalogo("runx")?.repositorio).toBe(join(raiz, "runx"));
  });

  it("funcional: acha a pasta pela capitalização real do repositório", () => {
    // os repositórios reais são `RunX`, `MemoX`, `Legadox` — não `runx`
    const raiz = raizCom("RunX");
    process.env["EXPX_SKILLS_LOCAIS"] = raiz;
    expect(buscarNoCatalogo("runx")?.repositorio).toBe(join(raiz, "RunX"));
  });

  it("funcional: skill sem pasta local continua vindo do GitHub", () => {
    const raiz = raizCom("runx");
    process.env["EXPX_SKILLS_LOCAIS"] = raiz;
    // mexendo só na runx: a sprintx não está na raiz local
    expect(buscarNoCatalogo("sprintx")?.repositorio).toBe(
      "https://github.com/bittencourtthulio/sprintx",
    );
  });

  it("funcional: variável vazia é tratada como ausente", () => {
    process.env["EXPX_SKILLS_LOCAIS"] = "   ";
    expect(buscarNoCatalogo("runx")?.repositorio).toBe("https://github.com/bittencourtthulio/runx");
  });
});
