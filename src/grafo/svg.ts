import type { No, Topologia } from "./topologia.js";

/**
 * Renderiza a topologia como um SVG auto-contido — um arquivo, sem script, sem
 * fonte externa, sem imagem embutida.
 *
 * Auto-contido é requisito, não preferência: o artefato vai no PR e precisa
 * abrir no GitHub, que remove script e bloqueia recurso externo em SVG. O tema
 * acompanha o do leitor por `prefers-color-scheme`, dentro do próprio `<style>`.
 */

/** Medidas do desenho, em px de viewBox. */
const CAIXA_L = 200;
const CAIXA_A = 54;
const ESPACO_X = 40;
const ESPACO_Y = 44;
const MARGEM = 28;
const TOPO = 82;

type Posicao = { x: number; y: number };

/** Escapa o que vai para dentro de um nó de texto ou de um valor de atributo. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Corta o título no limite que cabe na caixa. Mede por caractere porque SVG
 * estático não tem como medir texto: `textLength` deformaria a fonte, e
 * `foreignObject` não renderiza no GitHub.
 */
function encurtar(s: string, max = 26): string {
  const limpo = s.trim();
  return limpo.length <= max ? limpo : `${limpo.slice(0, max - 1)}…`;
}

/**
 * Posiciona cada nó: uma coluna por nível de dependência, uma linha por task
 * dentro do nível. Nível vira eixo Y (de cima para baixo), o que faz o desenho
 * crescer na direção em que se lê um plano.
 */
function posicionar(topo: Topologia): Map<string, Posicao> {
  const pos = new Map<string, Posicao>();
  topo.niveis.forEach((nivel, i) => {
    nivel.forEach((no, j) => {
      pos.set(no.id, {
        x: MARGEM + j * (CAIXA_L + ESPACO_X),
        y: TOPO + i * (CAIXA_A + ESPACO_Y),
      });
    });
  });
  return pos;
}

/** A classe CSS do nó decide a cor — a folha de estilo resolve o tema. */
function classeDoNo(no: No): string {
  const partes = ["no", `st-${no.status}`];
  if (no.em_ciclo) partes.push("ciclo");
  else if (no.critico) partes.push("critico");
  if (no.paralela_suspeita) partes.push("suspeita");
  return partes.join(" ");
}

/**
 * Curva de Bézier entre duas caixas: sai pela base da origem, entra pelo topo do
 * destino. Curva em vez de reta porque com muitas arestas cruzando níveis a
 * reta vira um feixe ilegível.
 */
function curva(a: Posicao, b: Posicao): string {
  const x1 = a.x + CAIXA_L / 2;
  const y1 = a.y + CAIXA_A;
  const x2 = b.x + CAIXA_L / 2;
  const y2 = b.y;
  const meio = y1 + (y2 - y1) / 2;
  return `M ${x1} ${y1} C ${x1} ${meio}, ${x2} ${meio}, ${x2} ${y2}`;
}

const ESTILO = `
  :root {
    --fundo: #ffffff; --texto: #1a1d21; --fraco: #6b7280; --borda: #d4d8dd;
    --caixa: #f7f8fa; --critico: #b45309; --ciclo: #b91c1c; --ok: #15803d;
    --andamento: #1d4ed8; --aresta: #9aa1a9;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fundo: #0f1115; --texto: #e6e8ea; --fraco: #9aa1a9; --borda: #2b3038;
      --caixa: #171a20; --critico: #f59e0b; --ciclo: #f87171; --ok: #4ade80;
      --andamento: #60a5fa; --aresta: #4b5259;
    }
  }
  .fundo { fill: var(--fundo); }
  .tit { fill: var(--texto); font: 600 15px ui-sans-serif, -apple-system, Segoe UI, sans-serif; }
  .sub { fill: var(--fraco); font: 400 11px ui-sans-serif, -apple-system, Segoe UI, sans-serif; }
  .no rect { fill: var(--caixa); stroke: var(--borda); stroke-width: 1.5; }
  .no .id { fill: var(--texto); font: 600 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
  .no .lbl { fill: var(--fraco); font: 400 11px ui-sans-serif, -apple-system, Segoe UI, sans-serif; }
  .st-concluida rect { stroke: var(--ok); }
  .st-em_andamento rect { stroke: var(--andamento); }
  .critico rect { stroke: var(--critico); stroke-width: 2.5; }
  .ciclo rect { stroke: var(--ciclo); stroke-width: 2.5; stroke-dasharray: 5 3; }
  .suspeita rect { stroke-dasharray: 2 2; }
  .aresta { fill: none; stroke: var(--aresta); stroke-width: 1.5; }
  .aresta.crit { stroke: var(--critico); stroke-width: 2.5; }
  .aresta.quebrada { stroke: var(--ciclo); stroke-dasharray: 4 3; }
  .leg { fill: var(--fraco); font: 400 11px ui-sans-serif, -apple-system, Segoe UI, sans-serif; }
`;

export type OpcoesSvg = {
  /** Escrito no rodapé para dar procedência ao artefato. */
  gerado_em?: string;
};

export function renderizarSvg(topo: Topologia, op: OpcoesSvg = {}): string {
  const pos = posicionar(topo);

  const colunas = topo.niveis.reduce((m, n) => Math.max(m, n.length), 0);
  const largura = Math.max(
    560,
    MARGEM * 2 + colunas * CAIXA_L + Math.max(0, colunas - 1) * ESPACO_X,
  );
  const altura =
    TOPO +
    Math.max(1, topo.niveis.length) * CAIXA_A +
    Math.max(0, topo.niveis.length - 1) * ESPACO_Y +
    MARGEM +
    34;

  const partes: string[] = [];
  partes.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}" role="img" aria-label="Grafo de dependências de ${esc(topo.titulo)}">`,
  );
  partes.push(`<title>${esc(topo.titulo)} — grafo de dependências</title>`);
  partes.push(`<style>${ESTILO}</style>`);
  partes.push(
    `<defs><marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--aresta)"/></marker>` +
      `<marker id="seta-crit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--critico)"/></marker></defs>`,
  );
  partes.push(`<rect class="fundo" width="${largura}" height="${altura}"/>`);

  // Cabeçalho
  partes.push(`<text class="tit" x="${MARGEM}" y="34">${esc(topo.titulo)}</text>`);
  const resumo = [
    `${topo.nos.length} tasks`,
    `${topo.niveis.length} níveis`,
    `caminho crítico: ${topo.caminho_critico.length}`,
  ];
  if (topo.dependencias_quebradas.length > 0) {
    resumo.push(`${topo.dependencias_quebradas.length} dependência(s) quebrada(s)`);
  }
  partes.push(`<text class="sub" x="${MARGEM}" y="54">${esc(resumo.join("  ·  "))}</text>`);

  // Arestas primeiro, para ficarem sob as caixas.
  for (const a of topo.arestas) {
    const de = pos.get(a.de);
    const para = pos.get(a.para);
    if (!de || !para) continue;
    const classe = `aresta${a.critica ? " crit" : ""}${a.quebrada ? " quebrada" : ""}`;
    const marcador = a.critica ? "seta-crit" : "seta";
    partes.push(
      `<path class="${classe}" d="${curva(de, para)}" marker-end="url(#${marcador})"/>`,
    );
  }

  // Nós
  for (const no of topo.nos) {
    const p = pos.get(no.id);
    if (!p) continue;
    const marcas: string[] = [];
    if (no.critico) marcas.push("crítico");
    if (no.em_ciclo) marcas.push("ciclo");
    if (no.paralela_suspeita) marcas.push("paralela?");
    const rodape = [no.fase, ...marcas].join(" · ");

    partes.push(`<g class="${classeDoNo(no)}">`);
    partes.push(
      `<rect x="${p.x}" y="${p.y}" width="${CAIXA_L}" height="${CAIXA_A}" rx="8"/>`,
    );
    partes.push(
      `<text class="id" x="${p.x + 12}" y="${p.y + 20}">${esc(no.id)}</text>`,
    );
    partes.push(
      `<text class="lbl" x="${p.x + 12}" y="${p.y + 35}">${esc(encurtar(no.titulo))}</text>`,
    );
    partes.push(
      `<text class="lbl" x="${p.x + 12}" y="${p.y + 48}">${esc(rodape)}</text>`,
    );
    partes.push(`</g>`);
  }

  const rodape = op.gerado_em
    ? `expx — grafo do plano · gerado em ${op.gerado_em}`
    : `expx — grafo do plano`;
  partes.push(`<text class="leg" x="${MARGEM}" y="${altura - 14}">${esc(rodape)}</text>`);
  partes.push(`</svg>`);

  return `${partes.join("\n")}\n`;
}
