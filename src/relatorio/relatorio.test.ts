import { describe, it, expect, afterEach } from "vitest";
import { renderizar, escapar } from "./markdown.js";
import { paginaRelatorio } from "./pagina.js";
import { criarServidor, type ServidorPainel } from "../servidor/http.js";

let servidor: ServidorPainel | null = null;
afterEach(async () => {
  await servidor?.fechar();
  servidor = null;
});

describe("renderizador de markdown", () => {
  it("integração: converte os blocos que os relatórios usam", () => {
    const { html } = renderizar(
      [
        "# Título",
        "",
        "Um parágrafo com **negrito**, *itálico* e `código`.",
        "",
        "## Seção",
        "",
        "- item um",
        "- item dois",
        "",
        "| Coluna | Valor |",
        "|---|---:|",
        "| a | 1 |",
        "",
        "> uma citação",
        "",
        "```ts",
        "const x: number = 1;",
        "```",
      ].join("\n"),
    );

    expect(html).toContain("<h1 id=");
    expect(html).toContain("<strong>negrito</strong>");
    expect(html).toContain("<em>itálico</em>");
    expect(html).toContain("<code>código</code>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<table>");
    expect(html).toContain("text-align:right");
    expect(html).toContain("<blockquote>");
    expect(html).toContain('data-lang="ts"');
  });

  it("funcional: escapa HTML do arquivo em vez de emiti-lo", () => {
    const { html } = renderizar('<script>alert(1)</script>\n\nE **isto** fica.');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<strong>isto</strong>");
  });

  it("funcional: link javascript: não vira href", () => {
    const { html } = renderizar("[clique](javascript:alert(1))");
    expect(html).not.toContain("href=\"javascript:");
    expect(html).toContain("clique");
  });

  it("funcional: o sumário lista os títulos até nível 3 com id único", () => {
    const { sumario } = renderizar("# A\n\n## B\n\n## B\n\n#### D");
    expect(sumario.map((s) => s.texto)).toEqual(["A", "B", "B"]);
    expect(new Set(sumario.map((s) => s.id)).size).toBe(3);
  });

  it("funcional: escapar cobre as cinco entidades", () => {
    expect(escapar(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;");
  });
});

describe("pagina do relatorio", () => {
  const base = {
    titulo: "Calculo de frete divergente",
    oc_id: "OC-2026-0142",
    tipo_ocorrencia: "bug",
    fechado_em: "2026-08-29",
    modulo_afetado: ["frete"],
    corpo: "## Causa raiz\n\nO calculo truncava o peso.",
    nomeArquivo: "OC-2026-0142-tecnico.md",
  };

  it("integração: gera um documento completo com título, metadados e ações", () => {
    const html = paginaRelatorio({ ...base, tipo: "tecnico", arquivos_alterados: ["src/frete/calculo.ts"], testes_adicionados: 3 });
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>Relatório técnico — Calculo de frete divergente</title>");
    expect(html).toContain("Imprimir / PDF");
    expect(html).toContain("Baixar .md");
    expect(html).toContain("@media print");
    expect(html).toContain("@page");
    expect(html).toContain("Arquivos alterados");
    expect(html).toContain("src/frete/calculo.ts");
  });

  it("funcional: o relatório de uso não expõe código nem contagem de testes", () => {
    const html = paginaRelatorio({ ...base, tipo: "uso", nomeArquivo: "OC-2026-0142-uso.md" });
    expect(html).toContain("Relatório de uso");
    expect(html).not.toContain("Arquivos alterados");
    expect(html).not.toContain("Testes adicionados");
  });

  it("funcional: o .md original vai embutido para download offline", () => {
    const html = paginaRelatorio({ ...base, tipo: "tecnico" });
    const m = /var MD_B64 = "([^"]*)"/.exec(html);
    expect(m).not.toBeNull();
    expect(Buffer.from(m?.[1] ?? "", "base64").toString("utf8")).toBe(base.corpo);
  });

  it("funcional: título malicioso no frontmatter vira texto inerte", () => {
    const html = paginaRelatorio({ ...base, tipo: "tecnico", titulo: '<img src=x onerror="alert(1)">' });
    // o que não pode existir é a TAG viva; escapada, ela é só texto
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
    expect(html).toContain("onerror=&quot;");
  });

  it("funcional: script no corpo do markdown não vira tag viva", () => {
    const html = paginaRelatorio({ ...base, tipo: "tecnico", corpo: "<script>alert(1)</script>" });
    // as únicas tags <script> da página são as do próprio gerador
    expect(html.match(/<script>/g) ?? []).toHaveLength(1);
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("rotas de relatorio", () => {
  it("integração: /relatorio devolve HTML do relatório técnico", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const r = await fetch(`${servidor.url()}/relatorio?oc=OC-2026-0142&tipo=tecnico`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("text/html");
    const html = await r.text();
    expect(html).toContain("Relatório técnico");
    expect(html).toContain("Imprimir / PDF");
  });

  it("funcional: tipo=uso devolve o documento do cliente", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const html = await (await fetch(`${servidor.url()}/relatorio?oc=OC-2026-0142&tipo=uso`)).text();
    expect(html).toContain("Relatório de uso");
    // o documento do cliente não menciona código
    expect(html).not.toContain("calculo.ts");
  });

  it("funcional: /relatorio.md devolve o markdown como anexo", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const r = await fetch(`${servidor.url()}/relatorio.md?oc=OC-2026-0142&tipo=tecnico`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("text/markdown");
    expect(r.headers.get("content-disposition")).toContain("OC-2026-0142-tecnico.md");
    expect(await r.text()).toContain("Causa raiz");
  });

  it("funcional: ocorrência inexistente devolve 404 sem derrubar o servidor", async () => {
    servidor = await criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 });
    const r = await fetch(`${servidor.url()}/relatorio?oc=NAO-EXISTE&tipo=tecnico`);
    expect(r.status).toBe(404);
    // o servidor continua respondendo depois
    expect((await fetch(`${servidor.url()}/api/saude`)).status).toBe(200);
  });
});
