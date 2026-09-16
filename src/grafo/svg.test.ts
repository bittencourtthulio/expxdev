import { describe, expect, it } from "vitest";
import { renderizarSvg } from "./svg.js";
import type { Topologia } from "./topologia.js";

function topologia(p: Partial<Topologia> = {}): Topologia {
  const nos = p.nos ?? [
    {
      id: "T-01",
      titulo: "Primeira task",
      status: "concluida" as const,
      fase: "F-01.1",
      sprint_id: "sprint-01",
      paralelizavel: false,
      nivel: 0,
      critico: true,
      em_ciclo: false,
      paralela_suspeita: false,
    },
    {
      id: "T-02",
      titulo: "Segunda task",
      status: "pendente" as const,
      fase: "F-01.1",
      sprint_id: "sprint-01",
      paralelizavel: false,
      nivel: 1,
      critico: true,
      em_ciclo: false,
      paralela_suspeita: false,
    },
  ];
  return {
    trabalho_id: "x",
    titulo: "Trabalho de teste",
    nos,
    arestas: p.arestas ?? [{ de: "T-01", para: "T-02", critica: true, quebrada: false }],
    caminho_critico: p.caminho_critico ?? ["T-01", "T-02"],
    niveis: p.niveis ?? [[nos[0]!], [nos[1]!]],
    dependencias_quebradas: p.dependencias_quebradas ?? [],
    ...p,
  } as Topologia;
}

describe("renderizarSvg", () => {
  it("gera um SVG válido com viewBox e os nós desenhados", () => {
    const svg = renderizarSvg(topologia());

    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
    expect(svg).toContain("viewBox=");
    expect(svg).toContain("T-01");
    expect(svg).toContain("T-02");
  });

  it("é auto-contido: sem script e sem recurso externo", () => {
    const svg = renderizarSvg(
      topologia({ dependencias_quebradas: ["T-99"] }),
    );

    expect(svg).not.toContain("<script");
    expect(svg).not.toContain("<image");
    expect(svg).not.toContain("@import");
    // A única URL tolerada é a do namespace SVG, que é obrigatória no elemento
    // raiz; qualquer outra seria recurso externo, bloqueado ao abrir no GitHub.
    const urls = svg.match(/https?:\/\/[^"' ]+/g) ?? [];
    expect(urls).toEqual(["http://www.w3.org/2000/svg"]);
  });

  it("escapa caractere de marcação vindo do título da task", () => {
    const svg = renderizarSvg(
      topologia({
        nos: [
          {
            id: "T-01",
            titulo: '<script>alert("x")</script>',
            status: "pendente",
            fase: "F-01.1",
            sprint_id: "sprint-01",
            paralelizavel: false,
            nivel: 0,
            critico: false,
            em_ciclo: false,
            paralela_suspeita: false,
          },
        ],
        arestas: [],
        caminho_critico: [],
        niveis: [
          [
            {
              id: "T-01",
              titulo: '<script>alert("x")</script>',
              status: "pendente",
              fase: "F-01.1",
              sprint_id: "sprint-01",
              paralelizavel: false,
              nivel: 0,
              critico: false,
              em_ciclo: false,
              paralela_suspeita: false,
            },
          ],
        ],
      }),
    );

    expect(svg).not.toContain("<script>alert");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("traz o tema escuro na própria folha de estilo", () => {
    const svg = renderizarSvg(topologia());

    expect(svg).toContain("prefers-color-scheme: dark");
  });

  it("anuncia dependência quebrada no resumo do cabeçalho", () => {
    const svg = renderizarSvg(topologia({ dependencias_quebradas: ["T-99"] }));

    expect(svg).toContain("dependência(s) quebrada(s)");
  });

  it("marca a aresta crítica com classe própria", () => {
    const svg = renderizarSvg(topologia());

    expect(svg).toContain('class="aresta crit"');
  });

  it("produz saída idêntica em duas execuções (estável para diff no PR)", () => {
    expect(renderizarSvg(topologia())).toBe(renderizarSvg(topologia()));
  });

  it("renderiza um plano sem task sem quebrar", () => {
    const svg = renderizarSvg(
      topologia({ nos: [], arestas: [], caminho_critico: [], niveis: [] }),
    );

    expect(svg).toContain("<svg");
    expect(svg).toContain("0 tasks");
  });
});
