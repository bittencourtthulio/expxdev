import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "ink-testing-library";
import { projetarVisao } from "../visao/projetar.js";
import { criarStoreVisao } from "./estadoExterno.js";
import { App } from "./App.js";

/**
 * Paridade com as fixtures de `desenho/desenhar.test.ts` — `lastFrame()`
 * devolve a mesma saída textual final que o Ink escreveria no terminal, sem
 * TTY real (mesma filosofia de fixture pura que o motor ANSI já usa).
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;
const AGORA = new Date("2026-08-30T12:00:00Z");

// O `useEffect` que registra `useInput` só roda DEPOIS do commit inicial do
// Ink: um tick logo após `render()` evita a corrida de escrever no stdin
// fake antes do listener existir.
const proximoTick = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe("App (Ink)", () => {
  it("sem trabalho: mostra a mensagem de frota vazia", () => {
    const v = projetarVisao(raiz("sem-trabalho"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} />);

    expect(lastFrame()).toContain("nenhum trabalho aberto");
  });

  it("vários trabalhos: cada um ganha seu próprio card, com barra e id", () => {
    const v = projetarVisao(raiz("varios-trabalhos"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);

    const saida = lastFrame() ?? "";
    for (const id of ["em-andamento", "bloqueado", "nao-iniciado"]) {
      expect(saida.includes(id), id).toBe(true);
    }
    expect(saida.includes("█") || saida.includes("░")).toBe(true);
  });

  it("com estado: o trabalho corrente ganha destaque `▸` e a régua soma a frota", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);

    expect(lastFrame() ?? "").toContain("▸");
  });

  it("com bloqueio: a seção de bloqueios aparece, com o id do bloqueio", () => {
    const v = projetarVisao(raiz("com-bloqueio"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);

    const saida = lastFrame() ?? "";
    expect(saida).toContain("B-01");
    expect(saida).toContain("bloqueio");
  });

  it("`arvore`: a árvore completa aparece só quando a prop está ligada", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);

    const semArvore = render(<App store={store} pulsoMs={0} colunas={100} />);
    const comArvore = render(<App store={store} pulsoMs={0} colunas={100} arvore />);

    expect(semArvore.lastFrame() ?? "").not.toContain("sprint-01");
    expect(comArvore.lastFrame() ?? "").toContain("sprint-01");
  });

  it("legado com raio alto: o contexto do trabalho corrente aparece com o raio", () => {
    const v = projetarVisao(raiz("legado-raio-alto"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);

    expect(lastFrame() ?? "").toContain("raio alto");
  });

  it("estado inválido: cai em modo degradado, sem quebrar", () => {
    const v = projetarVisao(raiz("estado-invalido"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);

    expect(lastFrame()).toBeDefined();
  });

  it("concluído: aparece na frota mesmo já fechado (D-19)", () => {
    const v = projetarVisao(raiz("concluido"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);

    expect(lastFrame() ?? "").toContain("concluido");
  });

  it("navegação: seta para baixo troca o trabalho mostrado no detalhe", async () => {
    const v = projetarVisao(raiz("varios-trabalhos"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { stdin, lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);
    await proximoTick();

    // A seleção agora é a barra `▌` na lista da frota, não uma borda ao redor
    // de um card: o layout de duas colunas trocou o card por uma linha, e o
    // efeito visível da navegação passou a ser QUAL trabalho o detalhe mostra.
    const antes = lastFrame() ?? "";
    expect(antes).toContain("▌");
    expect(antes).toContain("Executando agora"); // o corrente nasce selecionado

    // seta para baixo: ESC [ B
    stdin.write("[B");
    await proximoTick();

    const depois = lastFrame() ?? "";
    expect(depois).not.toBe(antes);
    // O detalhe trocou de trabalho — é o que a navegação existe para fazer.
    expect(depois).not.toContain("Executando agora");
  });

  it("interatividade: Enter expande a árvore do trabalho selecionado", async () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { stdin, lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);
    await proximoTick();

    expect(lastFrame() ?? "").not.toContain("sprint-01");

    stdin.write("\r");
    await proximoTick();

    expect(lastFrame() ?? "").toContain("sprint-01");

    // Enter de novo colapsa.
    stdin.write("\r");
    await proximoTick();
    expect(lastFrame() ?? "").not.toContain("sprint-01");
  });

  it("funcional: o pipeline do framework aparece com o passo atual aceso", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);
    const saida = lastFrame() ?? "";

    // A esteira: os cinco passos vencidos com `✓` e o corrente com `◆`, mais
    // o nome do estágio corrente e a posição na trilha. Era a informação que
    // faltava — antes só saía o código `f6` solto.
    expect(saida).toContain("◆");
    expect(saida).toContain("execucao");
    // O cabeçalho da seção diz a ferramenta e a posição na trilha: "SPRINTX 6/6".
    expect(saida).toContain("SPRINTX");
    expect(saida).toContain("6/6");
  });

  it("funcional: o balanço diz o que foi concluído e o que está em aberto", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);
    const saida = lastFrame() ?? "";

    // A fixture tem uma task de cada status: a barra `1/3` sozinha não
    // distinguiria isso de duas pendentes e nenhuma rodando.
    expect(saida).toContain("1 concluidas");
    expect(saida).toContain("1 em andamento");
    expect(saida).toContain("1 em aberto");
  });

  it("funcional: a proxima task em aberto aparece sem abrir a arvore", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);

    // Responde "e agora?" sem custar a árvore inteira.
    expect(lastFrame() ?? "").toContain("T-01.03");
  });

  it("funcional: a barra de status mostra os atalhos, que revelam a navegacao", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);
    const saida = lastFrame() ?? "";

    // Sem isto, ninguém descobre que a tela é navegável.
    expect(saida).toContain("trabalho");
    expect(saida).toContain("plano");
    expect(saida).toContain("sair");
  });

  it("integracao: em janela estreita a lista da frota sai e o detalhe fica", () => {
    const v = projetarVisao(raiz("varios-trabalhos"), {}, AGORA);
    const store = criarStoreVisao(v);
    // Abaixo do limiar de duas colunas: espremer o detalhe quebraria cada
    // linha em três e desmontaria o alinhamento.
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={70} />);
    const saida = lastFrame() ?? "";

    expect(saida).not.toContain("FROTA");
    expect(saida).toContain("Executando agora"); // o detalhe continua inteiro
  });

  it("integracao: em faixa lateral estreita, nenhuma palavra quebra no meio", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    // 64 colunas é a faixa de um terminal ao lado do editor — o caso que
    // produzia "31/6" numa linha e "8" na outra, "traba"/"lho", "34m22"/"s".
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={64} />);
    const linhas = (lastFrame() ?? "").split("\n");

    // Nenhuma linha passa da largura: se passasse, o Ink quebraria.
    for (const l of linhas) {
      // eslint-disable-next-line no-control-regex
      const limpa = l.replace(/\u001B\[[0-9;]*m/g, "");
      expect([...limpa].length, limpa).toBeLessThanOrEqual(64);
    }

    const saida = linhas.join("\n");
    // As palavras que quebravam continuam inteiras.
    expect(saida).toContain("trabalho");
    expect(saida).not.toMatch(/traba\s*\n\s*lho/);
  });

  it("funcional: em faixa estreita o balanco usa a forma curta, sem sumir", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={48} />);
    const saida = lastFrame() ?? "";

    // A informação sobrevive à compressão: some o rótulo, não o número.
    expect(saida).toMatch(/✓\s?1/);
    expect(saida).toMatch(/○\s?1/);
  });

  it("funcional: cada evento da atividade ocupa uma linha so", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={64} />);
    const linhas = (lastFrame() ?? "").split("\n");

    // A hora fica em coluna fixa à direita: uma linha por evento significa
    // tantas horas quantas linhas com hora, nunca uma hora órfã numa linha
    // sem rótulo (que era o sintoma da quebra).
    const comHora = linhas.filter((l) => /\d\d:\d\d/.test(l));
    expect(comHora.length).toBeGreaterThan(0);
    for (const l of comHora) {
      // eslint-disable-next-line no-control-regex
      const limpa = l.replace(/\u001B\[[0-9;]*m/g, "").trim();
      // Toda linha com hora começa com um sinal de evento — nenhuma é sobra.
      expect(limpa, limpa).toMatch(/^[·!✓▸]/);
    }
  });

  it("funcional: os cabecalhos de secao dao hierarquia a tela", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);
    const saida = lastFrame() ?? "";

    // Cada bloco anuncia o que é, e o filete separa sem gastar linha em branco.
    for (const titulo of ["PROGRESSO", "EM EXECUCAO", "ATIVIDADE"]) {
      expect(saida, titulo).toContain(titulo);
    }
    expect(saida).toContain("─");
  });

  it("integracao: o painel nunca atinge a altura do terminal (nao duplica ao redimensionar)", () => {
    // O Ink troca o redesenho no lugar por `clearTerminal` assim que o quadro
    // tem altura >= `stdout.rows` (`ink/build/ink.js`). Num painel que pulsa
    // a cada segundo isso EMPILHA cópias enquanto a pessoa redimensiona — o
    // defeito observado. A garantia é o painel sempre pedir menos que a
    // janela; `logica/altura.ts` é quem a mantém.
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);

    for (const rows of [14, 16, 20, 24, 30, 40]) {
      const store = criarStoreVisao(v);
      const { lastFrame, unmount } = render(
        <App store={store} pulsoMs={0} colunas={64} linhas={rows} />,
      );
      const alturaQuadro = (lastFrame() ?? "").split("\n").length;
      expect(alturaQuadro, `${String(rows)} linhas de terminal`).toBeLessThan(rows);
      unmount();
    }
  });

  it("interatividade: `q` sai sem lançar", async () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    const store = criarStoreVisao(v);
    const { stdin } = render(<App store={store} pulsoMs={0} colunas={100} />);
    await proximoTick();

    expect(() => {
      stdin.write("q");
    }).not.toThrow();
    await proximoTick();
  });

  it("responde a `store.definir`: redesenha quando a visão muda", async () => {
    const v1 = projetarVisao(raiz("sem-trabalho"), {}, AGORA);
    const v2 = projetarVisao(raiz("varios-trabalhos"), {}, AGORA);
    const store = criarStoreVisao(v1);
    const { lastFrame } = render(<App store={store} pulsoMs={0} colunas={100} />);

    expect(lastFrame()).toContain("nenhum trabalho aberto");
    store.definir(v2);
    // O reconciler do Ink comita de forma assíncrona: um tick basta, porque
    // não há mais nada concorrendo pelo microtask queue neste teste.
    await proximoTick();
    expect(lastFrame() ?? "").toContain("em-andamento");
  });
});
