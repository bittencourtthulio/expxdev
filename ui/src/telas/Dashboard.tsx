import { useMemo, type JSX } from "react";
import type { Estado } from "../tipos.js";
import { ESTAGIOS_PLANEJAMENTO, ROTULO_ESTAGIO } from "../tipos.js";
import { PageHeader, FiltroPeriodo, BotaoBaixar, Barra, Etiqueta, Vazio } from "../comuns.js";
import { descrever, type Periodo } from "../periodo.js";

function csv(linhas: string[][]): string {
  const escapa = (c: string): string => (/[",\n;]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
  return linhas.map((l) => l.map(escapa).join(";")).join("\n");
}

function pct(n: number): string {
  return `${String(Math.round(n * 100))}%`;
}

/** Métricas derivadas do estado já recortado pelo período. */
function calcular(e: Estado) {
  const t = e.trabalhos;
  const tasks = t.flatMap((x) => x.sprints.flatMap((s) => s.tasks));
  const concluidas = tasks.filter((x) => x.status === "concluida");
  const bloqueadas = tasks.filter((x) => x.status === "bloqueada");
  const semSuite = concluidas.filter((x) => x.suite !== "verde");
  const abertos = e.bloqueios.filter((b) => b.aberto);

  const porFerramenta = new Map<string, number>();
  const porEstagio = new Map<string, number>();
  const porTipo = new Map<string, number>();
  for (const x of t) {
    porFerramenta.set(x.expx_tool, (porFerramenta.get(x.expx_tool) ?? 0) + 1);
    porEstagio.set(x.estagio, (porEstagio.get(x.estagio) ?? 0) + 1);
    if (x.tipo_ocorrencia) porTipo.set(x.tipo_ocorrencia, (porTipo.get(x.tipo_ocorrencia) ?? 0) + 1);
  }

  const moduloHist = new Map<string, number>();
  for (const h of e.historico) {
    for (const m of h.modulo_afetado) moduloHist.set(m, (moduloHist.get(m) ?? 0) + 1);
  }

  /** Tempo médio de fechamento das ocorrências, em dias. */
  const duracoes: number[] = [];
  for (const x of t) {
    if (x.concluido_em === null || x.criado_em === "") continue;
    const a = Date.parse(`${x.criado_em}T00:00:00Z`);
    const b = Date.parse(`${x.concluido_em}T00:00:00Z`);
    if (!Number.isNaN(a) && !Number.isNaN(b)) duracoes.push(Math.max(0, (b - a) / 86_400_000));
  }
  const medio = duracoes.length > 0 ? duracoes.reduce((s, x) => s + x, 0) / duracoes.length : null;

  return {
    trabalhos: t.length,
    concluidos: t.filter((x) => x.status === "concluido").length,
    emExecucao: t.filter((x) => x.status !== "concluido" && !ESTAGIOS_PLANEJAMENTO.has(x.estagio)).length,
    emPlanejamento: t.filter((x) => x.status !== "concluido" && ESTAGIOS_PLANEJAMENTO.has(x.estagio)).length,
    tasks: tasks.length,
    concluidas: concluidas.length,
    bloqueadas: bloqueadas.length,
    semSuite: semSuite.length,
    progresso: tasks.length > 0 ? concluidas.length / tasks.length : 0,
    abertos: abertos.length,
    violacoes: e.violacoes.length,
    rejeicoes: e.rejeicoes.length,
    entregas: e.historico.length,
    medio,
    porFerramenta,
    porEstagio,
    porTipo,
    moduloHist,
  };
}

function Distribuicao({
  titulo,
  dados,
  rotulo,
}: {
  titulo: string;
  dados: Map<string, number>;
  rotulo?: (k: string) => string;
}): JSX.Element {
  const itens = [...dados].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...itens.map(([, n]) => n));
  return (
    <div className="painel-det">
      <h3 style={{ margin: "0 0 11px", fontSize: 13, fontWeight: 600 }}>{titulo}</h3>
      {itens.length === 0 ? (
        <div className="dep">nada no período</div>
      ) : (
        itens.map(([k, n]) => (
          <div key={k} style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span>{rotulo ? rotulo(k) : k}</span>
              <b style={{ fontVariantNumeric: "tabular-nums" }}>{n}</b>
            </div>
            <Barra valor={n / max} />
          </div>
        ))
      )}
    </div>
  );
}

export function Dashboard({
  estado,
  periodo,
  aoMudarPeriodo,
  aoAbrir,
}: {
  estado: Estado;
  periodo: Periodo;
  aoMudarPeriodo: (p: Periodo) => void;
  aoAbrir: (id: string) => void;
}): JSX.Element {
  const m = useMemo(() => calcular(estado), [estado]);

  // o dashboard mostra os últimos mexidos; a lista completa vive em Trabalhos
  const recentes = useMemo(
    () => [...estado.trabalhos].sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em)).slice(0, 8),
    [estado.trabalhos],
  );

  const csvTrabalhos = (): string =>
    csv([
      ["trabalho_id", "titulo", "ferramenta", "tipo", "tipo_ocorrencia", "estagio", "status", "progresso", "tasks", "concluidas", "criado_em", "atualizado_em", "concluido_em", "bloqueios_abertos"],
      ...estado.trabalhos.map((t) => {
        const tk = t.sprints.flatMap((s) => s.tasks);
        return [
          t.trabalho_id, t.titulo, t.expx_tool, t.tipo_trabalho, t.tipo_ocorrencia ?? "",
          t.estagio, t.status, pct(t.progresso), String(tk.length),
          String(tk.filter((x) => x.status === "concluida").length),
          t.criado_em, t.atualizado_em, t.concluido_em ?? "",
          String(t.bloqueios.filter((b) => b.aberto).length),
        ];
      }),
    ]);

  const csvTasks = (): string =>
    csv([
      ["trabalho_id", "sprint", "fase", "task", "titulo", "status", "suite", "paralelizavel", "depende_de", "concluida_em", "arquivo", "linha"],
      ...estado.trabalhos.flatMap((t) =>
        t.sprints.flatMap((s) =>
          s.tasks.map((k) => [
            t.trabalho_id, s.sprint_id, k.fase, k.id, k.titulo, k.status, k.suite,
            String(k.paralelizavel), k.depende_de.join(" "), k.concluida_em ?? "",
            k.arquivo, k.linha === null ? "" : String(k.linha),
          ]),
        ),
      ),
    ]);

  const csvViolacoes = (): string =>
    csv([
      ["tipo", "trabalho_id", "alvo", "detalhe", "arquivo", "linha"],
      ...estado.violacoes.map((v) => [v.tipo, v.trabalho_id, v.alvo, v.detalhe, v.arquivo, v.linha === null ? "" : String(v.linha)]),
    ]);

  const csvEntregas = (): string =>
    csv([
      ["fechado_em", "oc_id", "titulo", "tipo", "modulos"],
      ...estado.historico.map((h) => [h.fechado_em, h.oc_id, h.titulo, h.tipo_ocorrencia, h.modulo_afetado.join(" ")]),
    ]);

  return (
    <>
      <PageHeader
        titulo="Dashboard"
        sub={`Panorama do trabalho de engenharia · ${descrever(periodo)}`}
        acoes={
          <>
            <BotaoBaixar nome="expx-trabalhos.csv" conteudo={csvTrabalhos}>Trabalhos</BotaoBaixar>
            <BotaoBaixar nome="expx-tasks.csv" conteudo={csvTasks}>Tasks</BotaoBaixar>
            <BotaoBaixar nome="expx-violacoes.csv" conteudo={csvViolacoes}>Violações</BotaoBaixar>
            <BotaoBaixar nome="expx-entregas.csv" conteudo={csvEntregas}>Entregas</BotaoBaixar>
          </>
        }
      />
      <div className="conteudo">
        <FiltroPeriodo periodo={periodo} aoMudar={aoMudarPeriodo} />

        {m.trabalhos === 0 ? (
          <Vazio titulo="Nenhum trabalho no período" texto="Amplie o intervalo de datas para ver mais." />
        ) : (
          <>
            <div className="cartoes">
              <div className="cartao">
                <h3>Trabalhos</h3>
                <div className="numero">{m.trabalhos}</div>
                <div className="reparticao">
                  <span>concluídos <b>{m.concluidos}</b></span>
                  <span>execução <b>{m.emExecucao}</b></span>
                  <span>plano <b>{m.emPlanejamento}</b></span>
                </div>
              </div>
              <div className="cartao">
                <h3>Progresso de tasks</h3>
                <div className="numero">{pct(m.progresso)}</div>
                <div className="reparticao">
                  <span><b>{m.concluidas}</b> de {m.tasks}</span>
                  {m.bloqueadas > 0 ? <span>bloqueadas <b>{m.bloqueadas}</b></span> : null}
                </div>
                <div style={{ marginTop: 9 }}><Barra valor={m.progresso} /></div>
              </div>
              <div className="cartao">
                <h3>Entregas no período</h3>
                <div className="numero">{m.entregas}</div>
                <div className="reparticao">
                  <span>tempo médio <b>{m.medio === null ? "—" : `${String(Math.round(m.medio))}d`}</b></span>
                </div>
              </div>
              <div className="cartao">
                <h3>Saúde do método</h3>
                <div className="numero" style={{ color: m.violacoes > 0 ? "var(--vscode-editorWarning-foreground)" : "var(--vscode-charts-green)" }}>
                  {m.violacoes}
                </div>
                <div className="reparticao">
                  <span>violações</span>
                  {m.semSuite > 0 ? <span>sem suíte verde <b>{m.semSuite}</b></span> : null}
                </div>
              </div>
              <div className="cartao">
                <h3>Bloqueios abertos</h3>
                <div className="numero" style={{ color: m.abertos > 0 ? "var(--vscode-editorWarning-foreground)" : undefined }}>
                  {m.abertos}
                </div>
                <div className="reparticao">
                  <span>total <b>{estado.bloqueios.length}</b></span>
                </div>
              </div>
              <div className="cartao">
                <h3>Fora do schema</h3>
                <div className="numero" style={{ color: m.rejeicoes > 0 ? "var(--vscode-editorError-foreground)" : undefined }}>
                  {m.rejeicoes}
                </div>
                <div className="reparticao"><span>arquivos não lidos</span></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              <Distribuicao titulo="Por ferramenta" dados={m.porFerramenta} />
              <Distribuicao titulo="Por estágio" dados={m.porEstagio} rotulo={(k) => ROTULO_ESTAGIO[k] ?? k} />
              {m.porTipo.size > 0 ? <Distribuicao titulo="Ocorrências por tipo" dados={m.porTipo} /> : null}
              {m.moduloHist.size > 0 ? <Distribuicao titulo="Entregas por módulo" dados={m.moduloHist} /> : null}
            </div>

            <h2 className="titulo-secao" style={{ marginTop: 22 }}>
              Trabalhos recentes<span className="leve">{recentes.length} de {estado.trabalhos.length}</span>
            </h2>
            <table>
              <thead>
                <tr>
                  <th>trabalho</th>
                  <th style={{ width: 90 }}>ferramenta</th>
                  <th style={{ width: 78 }}>estágio</th>
                  <th style={{ width: 110 }}>status</th>
                  <th style={{ width: 130 }}>progresso</th>
                  <th style={{ width: 100 }}>atualizado</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((t) => (
                  <tr key={t.trabalho_id} style={{ cursor: "pointer" }} onClick={() => aoAbrir(t.trabalho_id)}>
                    <td>
                      <div>{t.titulo}</div>
                      <code className="cam">{t.trabalho_id}</code>
                    </td>
                    <td><Etiqueta tipo={t.expx_tool}>{t.expx_tool}</Etiqueta></td>
                    <td><code>{t.estagio}</code></td>
                    <td>{t.status.replace("_", " ")}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span className="mono" style={{ minWidth: 32 }}>{pct(t.progresso)}</span>
                        <div style={{ flex: 1 }}><Barra valor={t.progresso} /></div>
                      </div>
                    </td>
                    <td className="mono">{t.atualizado_em}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
