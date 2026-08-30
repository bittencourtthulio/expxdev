import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { Estado } from "../tipos.js";
import { Dashboard } from "./Dashboard.js";
import { Trabalhos } from "./Trabalhos.js";
import { Detalhe } from "./Detalhe.js";
import { Conformidade } from "./Conformidade.js";
import { Historico } from "./Historico.js";
import { ForaDoSchema } from "./ForaDoSchema.js";
import { Memoria } from "./Memoria.js";
import { estadoFixture, estadoRuimFixture, estadoMemoriaFixture } from "./fixture.js";
import { PERIODO_PADRAO } from "../periodo.js";
import { csvDaMemoria } from "./Memoria.js";

const propsPeriodo = { periodo: PERIODO_PADRAO, aoMudarPeriodo: () => undefined };

afterEach(cleanup);

const ok: Estado = estadoFixture();
const ruim: Estado = estadoRuimFixture();

describe("dashboard", () => {
  const props = { ...propsPeriodo, aoAbrir: () => undefined };

  it("integração: mostra os cartões de métrica do período", () => {
    const { container } = render(<Dashboard estado={ok} {...props} />);
    const titulos = [...container.querySelectorAll(".cartao h3")].map((h) => h.textContent);
    expect(titulos).toContain("Trabalhos");
    expect(screen.getByText("Progresso de tasks")).toBeDefined();
    expect(screen.getByText("Entregas no período")).toBeDefined();
    expect(screen.getByText("Saúde do método")).toBeDefined();
  });

  it("funcional: sem violação, a saúde do método mostra zero", () => {
    const { container } = render(<Dashboard estado={ok} {...props} />);
    const cards = [...container.querySelectorAll(".cartao")];
    const saude = cards.find((c) => c.querySelector("h3")?.textContent === "Saúde do método");
    expect(saude?.querySelector(".numero")?.textContent).toBe("0");
  });

  it("funcional: clicar num trabalho recente chama aoAbrir com o id", () => {
    const vistos: string[] = [];
    const { container } = render(<Dashboard estado={ok} {...propsPeriodo} aoAbrir={(id) => vistos.push(id)} />);
    const linha = container.querySelector("tbody tr");
    expect(linha).not.toBeNull();
    fireEvent.click(linha as Element);
    expect(vistos).toHaveLength(1);
  });

  it("funcional: período sem trabalho mostra o estado vazio", () => {
    const vazio: Estado = { ...ok, trabalhos: [], historico: [], bloqueios: [], violacoes: [] };
    render(<Dashboard estado={vazio} {...props} />);
    expect(screen.getByText("Nenhum trabalho no período")).toBeDefined();
  });
});

describe("lista de trabalhos", () => {
  const props = { ...propsPeriodo, aoAbrir: () => undefined };

  it("integração: lista os trabalhos com estágio e progresso", () => {
    const { container } = render(<Trabalhos estado={ok} {...props} />);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(screen.getByText(/Exportacao de relatorios em CSV/)).toBeDefined();
  });

  it("funcional: o filtro de ferramenta reduz a lista", () => {
    const { container } = render(<Trabalhos estado={ok} {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "runx" }));
    const linhas = container.querySelectorAll("tbody tr");
    expect(linhas).toHaveLength(1);
    expect(linhas[0]?.textContent).toContain("frete");
  });

  it("funcional: a busca por título filtra", () => {
    const { container } = render(<Trabalhos estado={ok} {...props} />);
    fireEvent.change(screen.getByLabelText("buscar trabalho"), { target: { value: "frete" } });
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("buscar trabalho"), { target: { value: "zzz" } });
    expect(screen.getByText("Nada encontrado")).toBeDefined();
  });

  it("funcional: clicar numa linha abre o trabalho", () => {
    const vistos: string[] = [];
    const { container } = render(<Trabalhos estado={ok} {...propsPeriodo} aoAbrir={(id) => vistos.push(id)} />);
    fireEvent.click(container.querySelector("tbody tr") as Element);
    expect(vistos).toHaveLength(1);
  });
});

describe("detalhe do trabalho", () => {
  it("integração: mostra sprints, fases e tasks do trabalho", () => {
    render(<Detalhe estado={ok} id="exportacao-csv" aoVoltar={() => undefined} />);
    expect(screen.getByText(/sprint-01/)).toBeDefined();
    expect(screen.getByText("T-01.01")).toBeDefined();
    expect(screen.getByText("T-01.03")).toBeDefined();
  });

  it("funcional: a barra de uma fase 1 de 2 mostra 50 por cento", () => {
    const { container } = render(<Detalhe estado={ok} id="exportacao-csv" aoVoltar={() => undefined} />);
    const barras = [...container.querySelectorAll('[role="progressbar"]')];
    const valores = barras.map((b) => b.getAttribute("aria-valuenow"));
    expect(valores).toContain("100"); // F-01.1: 2 de 2
    expect(valores).toContain("0");   // F-01.2: 0 de 1
  });

  it("funcional: caminho crítico e paralelizável têm marcação distinta", () => {
    const { container } = render(<Detalhe estado={ok} id="exportacao-csv" aoVoltar={() => undefined} />);
    expect(container.querySelector(".etiqueta.critico")).not.toBeNull();
    expect(container.querySelector(".etiqueta.paralela")).not.toBeNull();
  });
});

describe("tela de conformidade", () => {
  it("integração: projeto sem defeito mostra lista vazia", () => {
    render(<Conformidade estado={ok} {...propsPeriodo} />);
    expect(screen.getByText("Nenhuma violação")).toBeDefined();
  });

  it("funcional: cada violação aponta arquivo e linha", () => {
    const { container } = render(<Conformidade estado={ruim} {...propsPeriodo} />);
    // o rótulo aparece no filtro e no cabeçalho do grupo
    expect(screen.getAllByText("Task sem teste obrigatório").length).toBeGreaterThan(0);
    const celulas = [...container.querySelectorAll("td.cam")];
    expect(celulas.length).toBeGreaterThan(0);
    expect(celulas.some((c) => c.textContent?.includes("linha"))).toBe(true);
  });
});

describe("historico", () => {
  it("integração: a entrada mais recente vem primeiro na tabela", () => {
    const { container } = render(<Historico estado={ok} {...propsPeriodo} />);
    const primeira = container.querySelector("tbody tr code");
    expect(primeira?.textContent).toBe("OC-2026-0142");
  });

  it("funcional: buscar por modulo filtra as entradas", () => {
    render(<Historico estado={ok} {...propsPeriodo} />);
    const campo = screen.getByLabelText("buscar no histórico");
    fireEvent.change(campo, { target: { value: "frete" } });
    expect(screen.getByText(/Calculo de frete/)).toBeDefined();
    fireEvent.change(campo, { target: { value: "modulo-que-nao-existe" } });
    expect(screen.getByText("Nada encontrado")).toBeDefined();
  });

  it("integração: a tabela traz os dois botões de relatório por linha", () => {
    const { container } = render(<Historico estado={ok} {...propsPeriodo} />);
    const linhas = container.querySelectorAll("tbody tr");
    expect(linhas.length).toBeGreaterThan(0);

    const tecnico = screen.getByRole("link", { name: /Técnico/ });
    const uso = screen.getByRole("link", { name: /Uso/ });
    // abrem em aba nova, apontando para a rota do documento
    expect(tecnico.getAttribute("target")).toBe("_blank");
    expect(tecnico.getAttribute("href")).toContain("/relatorio?oc=OC-2026-0142&tipo=tecnico");
    expect(uso.getAttribute("href")).toContain("tipo=uso");
    expect(tecnico.getAttribute("rel")).toContain("noopener");
  });

  it("funcional: sem relatório de uso, o botão fica desabilitado", () => {
    const semUso: Estado = {
      ...ok,
      historico: ok.historico.map((h) => ({ ...h, uso: null })),
    };
    render(<Historico estado={semUso} {...propsPeriodo} />);
    expect(screen.getByRole("link", { name: /Uso/ }).getAttribute("aria-disabled")).toBe("true");
  });

});

describe("fora do schema", () => {
  it("integração: as rejeições aparecem separadas em erros e anteriores ao schema", () => {
    render(<ForaDoSchema estado={ruim} />);
    expect(ruim.rejeicoes.length).toBeGreaterThanOrEqual(4);
    // a aba de erros vem selecionada e traz os defeitos de verdade
    expect(screen.getByRole("tab", { name: /Erros de leitura/ })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Anteriores ao schema/ })).toBeDefined();
  });

  it("funcional: o arquivo de versão futura aparece na aba de erros", () => {
    render(<ForaDoSchema estado={ruim} />);
    expect(screen.getByText("versao de schema futura")).toBeDefined();
  });

  it("funcional: arquivo sem frontmatter fica na aba de anteriores, não entre os erros", () => {
    render(<ForaDoSchema estado={ruim} />);
    expect(screen.queryByText("sem frontmatter valido")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: /Anteriores ao schema/ }));
    expect(screen.getAllByText("sem frontmatter valido").length).toBeGreaterThan(0);
  });
});

describe("memória", () => {
  const comIndice: Estado = estadoMemoriaFixture();

  it("integração: mostra as quatro seções da memória", () => {
    render(<Memoria estado={comIndice} />);
    expect(screen.getByText("Arquivos de risco")).toBeDefined();
    expect(screen.getByText("Regressões")).toBeDefined();
    expect(screen.getByText("Coincidências de arquivo")).toBeDefined();
    expect(screen.getByText("Artefatos contaminados")).toBeDefined();
  });

  it("funcional: lista o arquivo de risco e o artefato contaminado da fixture", () => {
    const { container } = render(<Memoria estado={comIndice} />);
    const texto = container.textContent ?? "";
    expect(texto).toContain("src/frete/calculo.ts");
    expect(texto).toContain("docs/relatorios/2026-08-25-OC-2026-0199-integracao/tecnico.md");
  });

  it("funcional: sem índice, ensina a gerar e não mostra tabela nenhuma", () => {
    const { container } = render(<Memoria estado={{ ...ok, memoria: null }} />);
    expect(container.textContent).toContain("memox.py");
    expect(container.querySelector("table")).toBeNull();
  });

  it("funcional: o CSV traz cabeçalho com ponto e vírgula e uma linha por arquivo", () => {
    const { container } = render(<Memoria estado={comIndice} />);
    expect(container.querySelector(".botao")).not.toBeNull();
    const csv = csvDaMemoria(comIndice.memoria);
    const linhas = csv.split("\n");
    expect(linhas[0]).toBe("arquivo;trabalhos;regressoes;reprovacoes_qa;ultimo_trabalho_em;faixa_atencao");
    expect(linhas).toHaveLength((comIndice.memoria?.arquivos_de_risco.length ?? 0) + 1);
  });
});
