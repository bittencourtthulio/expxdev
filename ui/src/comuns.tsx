import { useState, type JSX } from "react";
import { Icone } from "./icones.js";
import { ROTULO_PRESET, resolver, descrever, type Periodo, type Preset } from "./periodo.js";

export function Barra({ valor }: { valor: number }): JSX.Element {
  const pct = Math.round(valor * 100);
  return (
    <div
      className={`barra${pct === 100 ? " completa" : ""}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i style={{ width: `${String(pct)}%` }} />
    </div>
  );
}

export function Etiqueta({ tipo, children }: { tipo?: string; children: React.ReactNode }): JSX.Element {
  return <span className={`etiqueta${tipo ? ` ${tipo}` : ""}`}>{children}</span>;
}

export function Vazio({ titulo, texto }: { titulo: string; texto: string }): JSX.Element {
  return (
    <div className="vazio">
      <strong>{titulo}</strong>
      {texto}
    </div>
  );
}

/** Cabeçalho de página: trilha, título, subtítulo, ações e abas. */
export function PageHeader({
  trilha,
  titulo,
  sub,
  acoes,
  abas,
}: {
  trilha?: Array<{ rotulo: string; aoClicar?: () => void }>;
  titulo: React.ReactNode;
  sub?: React.ReactNode;
  acoes?: React.ReactNode;
  abas?: React.ReactNode;
}): JSX.Element {
  return (
    <header className="pageheader">
      {trilha && trilha.length > 0 ? (
        <div className="trilha">
          {trilha.map((p, i) => (
            <span key={`${p.rotulo}-${String(i)}`} style={{ display: "contents" }}>
              {i > 0 ? <span aria-hidden="true">›</span> : null}
              {p.aoClicar ? <button onClick={p.aoClicar}>{p.rotulo}</button> : <span>{p.rotulo}</span>}
            </span>
          ))}
        </div>
      ) : null}
      <h1>{titulo}</h1>
      {sub ? <div className="sub">{sub}</div> : null}
      {acoes ? <div className="acoes">{acoes}</div> : null}
      {abas ? <div className="abas" role="tablist">{abas}</div> : null}
    </header>
  );
}

const PRESETS: Preset[] = ["tudo", "7d", "30d", "90d", "mes", "ano"];

/** Filtro de data: presets rápidos + intervalo personalizado. */
export function FiltroPeriodo({
  periodo,
  aoMudar,
  hoje = new Date(),
}: {
  periodo: Periodo;
  aoMudar: (p: Periodo) => void;
  hoje?: Date;
}): JSX.Element {
  const [abertoCustom, setAbertoCustom] = useState(periodo.preset === "custom");

  return (
    <div className="filtros" data-teste="filtro-periodo">
      <label>período</label>
      {PRESETS.map((p) => (
        <button
          key={p}
          aria-pressed={periodo.preset === p}
          onClick={() => {
            setAbertoCustom(false);
            aoMudar(resolver(p, hoje));
          }}
        >
          {ROTULO_PRESET[p]}
        </button>
      ))}
      <button
        aria-pressed={periodo.preset === "custom"}
        onClick={() => {
          setAbertoCustom((v) => !v);
          if (periodo.preset !== "custom") {
            aoMudar({ preset: "custom", de: periodo.de, ate: periodo.ate });
          }
        }}
      >
        {ROTULO_PRESET.custom}
      </button>

      {abertoCustom ? (
        <>
          <input
            type="date"
            className="busca"
            style={{ minWidth: 150 }}
            aria-label="data inicial"
            value={periodo.de ?? ""}
            onChange={(e) => aoMudar({ preset: "custom", de: e.target.value || null, ate: periodo.ate })}
          />
          <span style={{ color: "var(--vscode-descriptionForeground)" }}>até</span>
          <input
            type="date"
            className="busca"
            style={{ minWidth: 150 }}
            aria-label="data final"
            value={periodo.ate ?? ""}
            onChange={(e) => aoMudar({ preset: "custom", de: periodo.de, ate: e.target.value || null })}
          />
        </>
      ) : null}

      <span style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)", marginLeft: 4 }}>
        {descrever(periodo)}
      </span>
    </div>
  );
}

/** Botão que baixa um conteúdo como arquivo. */
export function BotaoBaixar({
  nome,
  conteudo,
  tipo = "text/csv;charset=utf-8",
  children,
}: {
  nome: string;
  conteudo: () => string;
  tipo?: string;
  children: React.ReactNode;
}): JSX.Element {
  function baixar(): void {
    try {
      const url = URL.createObjectURL(new Blob([conteudo()], { type: tipo }));
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      /* ambiente sem suporte a download: o botão simplesmente não faz nada */
    }
  }
  return (
    <button className="botao" onClick={baixar}>
      <Icone.Baixar tamanho={13} />
      <span style={{ marginLeft: 5 }}>{children}</span>
    </button>
  );
}
