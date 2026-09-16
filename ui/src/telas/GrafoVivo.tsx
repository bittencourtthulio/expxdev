import { useMemo, useRef, useState, type JSX, type PointerEvent, type WheelEvent } from "react";
import type { Trabalho } from "../tipos.js";
import { topologiaDeTasks, type No, type Topologia } from "../../../src/grafo/topologia.js";

/**
 * O grafo de dependências, desenhado na própria tela.
 *
 * Antes isto era um `<img src="/grafo.svg">`. Trocado por SVG no DOM por dois
 * motivos. O primeiro é que a imagem tinha um estado de carregamento visível:
 * `<details>` recolhido não baixa o recurso, então ao abrir o bloco a pessoa via
 * o ícone de imagem quebrada até o download terminar — num plano grande, tempo
 * suficiente para parecer defeito. Desenhado em DOM não existe esse intervalo.
 * O segundo é que uma imagem não responde a nada: não dá para destacar a
 * dependência ao passar o mouse, clicar para chegar na task, aproximar num plano
 * de 37 tasks, nem esconder o que já foi concluído.
 *
 * O SVG do `expx grafo` continua existindo e não muda: ele é o artefato que vai
 * no PR, onde interação não existe. Os dois partem da mesma topologia.
 */

const CAIXA_L = 190;
const CAIXA_A = 52;
const ESPACO_X = 38;
const ESPACO_Y = 44;
const MARGEM = 20;

type Posicao = { x: number; y: number };

export type Filtro = "tudo" | "abertas" | "critico";

const ROTULO_FILTRO: Record<Filtro, string> = {
  tudo: "tudo",
  abertas: "só o que falta",
  critico: "só o caminho crítico",
};

/** Corta o título no que cabe na caixa; o texto inteiro fica no `<title>`. */
function encurtar(s: string, max = 24): string {
  const limpo = s.trim();
  return limpo.length <= max ? limpo : `${limpo.slice(0, max - 1)}…`;
}

function posicionar(topo: Topologia): Map<string, Posicao> {
  const pos = new Map<string, Posicao>();
  topo.niveis.forEach((nivel, i) => {
    nivel.forEach((no, j) => {
      pos.set(no.id, {
        x: MARGEM + j * (CAIXA_L + ESPACO_X),
        y: MARGEM + i * (CAIXA_A + ESPACO_Y),
      });
    });
  });
  return pos;
}

function curva(a: Posicao, b: Posicao): string {
  const x1 = a.x + CAIXA_L / 2;
  const y1 = a.y + CAIXA_A;
  const x2 = b.x + CAIXA_L / 2;
  const y2 = b.y;
  const meio = y1 + (y2 - y1) / 2;
  return `M ${x1} ${y1} C ${x1} ${meio}, ${x2} ${meio}, ${x2} ${y2}`;
}

/** A cor da borda diz o estado; o traço diz o defeito. */
function corDoNo(no: No, apagado: boolean): string {
  if (apagado) return "var(--vscode-panel-border)";
  if (no.em_ciclo) return "var(--vscode-charts-red)";
  if (no.critico) return "var(--vscode-charts-orange)";
  if (no.status === "concluida") return "var(--vscode-charts-green)";
  if (no.status === "em_andamento") return "var(--vscode-charts-blue)";
  return "var(--vscode-panel-border)";
}

export function GrafoVivo({
  trabalho,
  aoEscolherTask,
}: {
  trabalho: Trabalho;
  /** Chamado ao clicar num nó — a tela rola até a task no plano abaixo. */
  aoEscolherTask?: (id: string) => void;
}): JSX.Element | null {
  const [filtro, setFiltro] = useState<Filtro>("tudo");
  const [focado, setFocado] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Posicao>({ x: 0, y: 0 });
  const arraste = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const tasks = useMemo(() => trabalho.sprints.flatMap((s) => s.tasks), [trabalho]);

  // A topologia é recalculada quando as tasks mudam — e elas mudam sozinhas,
  // porque o websocket substitui o estado inteiro a cada gravação da skill.
  // É o que torna o grafo vivo sem nenhum código de atualização próprio.
  const topo = useMemo(
    () => topologiaDeTasks(trabalho.trabalho_id, trabalho.titulo, tasks),
    [trabalho.trabalho_id, trabalho.titulo, tasks],
  );

  const pos = useMemo(() => posicionar(topo), [topo]);

  /**
   * O filtro APAGA em vez de remover: tirar nós do desenho mudaria a posição de
   * todo o resto, e a pessoa perderia o mapa mental que acabou de formar. O que
   * não interessa fica visível e fraco, no mesmo lugar.
   */
  const visivel = useMemo(() => {
    const s = new Set<string>();
    for (const n of topo.nos) {
      if (filtro === "tudo") s.add(n.id);
      else if (filtro === "abertas" && n.status !== "concluida") s.add(n.id);
      else if (filtro === "critico" && n.critico) s.add(n.id);
    }
    return s;
  }, [topo, filtro]);

  /**
   * Um filtro que não deixa nada aceso apaga o desenho inteiro e não diz por
   * quê — o caso comum é "só o que falta" num trabalho já concluído. Aqui isso
   * vira um aviso, e o grafo volta a ficar legível.
   */
  const filtroVazio = filtro !== "tudo" && visivel.size === 0;

  /** Ao focar um nó, só ele e seus vizinhos diretos permanecem acesos. */
  const vizinhos = useMemo(() => {
    if (focado === null) return null;
    const s = new Set<string>([focado]);
    for (const a of topo.arestas) {
      if (a.para === focado) s.add(a.de);
      if (a.de === focado) s.add(a.para);
    }
    return s;
  }, [focado, topo]);

  if (topo.nos.length === 0) return null;

  const colunas = topo.niveis.reduce((m, n) => Math.max(m, n.length), 0);
  const largura = MARGEM * 2 + colunas * CAIXA_L + Math.max(0, colunas - 1) * ESPACO_X;
  const altura =
    MARGEM * 2 + topo.niveis.length * CAIXA_A + Math.max(0, topo.niveis.length - 1) * ESPACO_Y;

  function apagadoDe(id: string): boolean {
    if (vizinhos !== null) return !vizinhos.has(id);
    // Filtro que não casa com nada não apaga nada: melhor o grafo inteiro com
    // o aviso ao lado do que uma tela cinza sem explicação.
    if (filtroVazio) return false;
    return !visivel.has(id);
  }

  function aoRolar(e: WheelEvent<SVGSVGElement>): void {
    // Sem `preventDefault`: o listener do React é passivo, e chamá-lo só
    // renderiza um aviso no console. Ctrl/⌘ separa zoom de rolagem da página.
    if (!e.ctrlKey && !e.metaKey) return;
    setZoom((z) => Math.min(3, Math.max(0.3, z - e.deltaY * 0.002)));
  }

  function aoPressionar(e: PointerEvent<SVGSVGElement>): void {
    arraste.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function aoMover(e: PointerEvent<SVGSVGElement>): void {
    const a = arraste.current;
    if (a === null) return;
    setPan({ x: a.px + (e.clientX - a.x), y: a.py + (e.clientY - a.y) });
  }

  function aoSoltar(e: PointerEvent<SVGSVGElement>): void {
    arraste.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 9,
        }}
      >
        {(Object.keys(ROTULO_FILTRO) as Filtro[]).map((f) => (
          <button
            key={f}
            className="botao"
            onClick={() => setFiltro(f)}
            aria-pressed={filtro === f}
            style={filtro === f ? { borderColor: "var(--vscode-button-background)" } : undefined}
          >
            {ROTULO_FILTRO[f]}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button className="botao" onClick={() => setZoom((z) => Math.min(3, z + 0.2))} aria-label="Aproximar">
          +
        </button>
        <button className="botao" onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))} aria-label="Afastar">
          −
        </button>
        <button
          className="botao"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        >
          reenquadrar
        </button>
      </div>

      <div
        style={{
          border: "1px solid var(--vscode-panel-border)",
          borderRadius: 4,
          overflow: "hidden",
          background: "var(--vscode-editor-background)",
          cursor: arraste.current ? "grabbing" : "grab",
        }}
      >
        <svg
          viewBox={`0 0 ${largura} ${altura}`}
          width="100%"
          height={Math.min(altura, 520)}
          onWheel={aoRolar}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerLeave={aoSoltar}
          role="img"
          aria-label={`Grafo de dependências de ${topo.nos.length} tasks`}
          style={{ display: "block", touchAction: "none" }}
        >
          <defs>
            <marker
              id="gv-seta"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vscode-panel-border)" />
            </marker>
            <marker
              id="gv-seta-crit"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vscode-charts-orange)" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {topo.arestas.map((a, i) => {
              const de = pos.get(a.de);
              const para = pos.get(a.para);
              if (!de || !para) return null;
              const apagada = apagadoDe(a.de) || apagadoDe(a.para);
              return (
                <path
                  key={`${a.de}->${a.para}-${i}`}
                  d={curva(de, para)}
                  fill="none"
                  stroke={
                    a.quebrada
                      ? "var(--vscode-charts-red)"
                      : a.critica
                        ? "var(--vscode-charts-orange)"
                        : "var(--vscode-panel-border)"
                  }
                  strokeWidth={a.critica ? 2.5 : 1.5}
                  strokeDasharray={a.quebrada ? "4 3" : undefined}
                  opacity={apagada ? 0.15 : 1}
                  markerEnd={`url(#${a.critica ? "gv-seta-crit" : "gv-seta"})`}
                />
              );
            })}

            {topo.nos.map((no) => {
              const p = pos.get(no.id);
              if (!p) return null;
              const apagado = apagadoDe(no.id);
              const marcas = [
                no.critico ? "crítico" : null,
                no.em_ciclo ? "ciclo" : null,
                no.paralela_suspeita ? "paralela?" : null,
              ].filter((x): x is string => x !== null);

              return (
                <g
                  key={no.id}
                  opacity={apagado ? 0.2 : 1}
                  onMouseEnter={() => setFocado(no.id)}
                  onMouseLeave={() => setFocado(null)}
                  onClick={() => aoEscolherTask?.(no.id)}
                  style={{ cursor: aoEscolherTask ? "pointer" : "default" }}
                >
                  <title>
                    {no.id} — {no.titulo}
                    {marcas.length > 0 ? ` (${marcas.join(", ")})` : ""}
                  </title>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={CAIXA_L}
                    height={CAIXA_A}
                    rx={6}
                    fill="var(--vscode-input-background)"
                    stroke={corDoNo(no, apagado)}
                    strokeWidth={no.critico || no.em_ciclo ? 2.5 : 1.5}
                    strokeDasharray={
                      no.em_ciclo ? "5 3" : no.paralela_suspeita ? "2 2" : undefined
                    }
                  />
                  <text
                    x={p.x + 11}
                    y={p.y + 19}
                    fill="var(--vscode-editor-foreground)"
                    style={{ font: "600 11px var(--mono)" }}
                  >
                    {no.id}
                  </text>
                  <text
                    x={p.x + 11}
                    y={p.y + 33}
                    fill="var(--vscode-descriptionForeground, #9a9a9a)"
                    style={{ font: "400 10px var(--fonte)" }}
                  >
                    {encurtar(no.titulo)}
                  </text>
                  <text
                    x={p.x + 11}
                    y={p.y + 45}
                    fill="var(--vscode-descriptionForeground, #9a9a9a)"
                    style={{ font: "400 10px var(--fonte)" }}
                  >
                    {[no.fase, ...marcas].join(" · ")}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="dep" style={{ marginTop: 7, fontSize: 12 }}>
        {filtroVazio ? (
          <span style={{ color: "var(--vscode-charts-yellow)" }}>
            nenhuma task em “{ROTULO_FILTRO[filtro]}” — mostrando tudo ·{" "}
          </span>
        ) : null}
        {topo.nos.length} tasks · {topo.niveis.length} níveis · caminho crítico{" "}
        {topo.caminho_critico.length}
        {topo.dependencias_quebradas.length > 0 ? (
          <span style={{ color: "var(--vscode-charts-red)" }}>
            {" "}
            · dependência inexistente: {topo.dependencias_quebradas.join(", ")}
          </span>
        ) : null}
        <span> · passe o mouse para isolar · ⌘/Ctrl + rolagem para aproximar · arraste para mover</span>
      </div>
    </div>
  );
}
