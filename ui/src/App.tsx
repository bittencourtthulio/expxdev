import { useMemo, useState, type JSX } from "react";
import { usarEstado } from "./estado/cliente.js";
import { Icone } from "./icones.js";
import { Dashboard } from "./telas/Dashboard.js";
import { Trabalhos } from "./telas/Trabalhos.js";
import { PERIODO_PADRAO, recortar, descrever, type Periodo } from "./periodo.js";
import { Detalhe } from "./telas/Detalhe.js";
import { Conformidade } from "./telas/Conformidade.js";
import { Historico } from "./telas/Historico.js";
import { ForaDoSchema } from "./telas/ForaDoSchema.js";

type Secao = "dashboard" | "trabalhos" | "conformidade" | "historico" | "schema";

const SECOES: Array<{ id: Secao; rotulo: string; Ic: (p: { tamanho?: number }) => JSX.Element }> = [
  { id: "dashboard", rotulo: "Dashboard", Ic: Icone.Painel },
  { id: "trabalhos", rotulo: "Trabalhos", Ic: Icone.Feature },
  { id: "conformidade", rotulo: "Conformidade", Ic: Icone.Conformidade },
  { id: "historico", rotulo: "Histórico", Ic: Icone.Historico },
  { id: "schema", rotulo: "Fora do schema", Ic: Icone.Alerta },
];

export function App(): JSX.Element {
  const { estado, conexao, erro } = usarEstado();
  const [secao, setSecao] = useState<Secao>("dashboard");
  const [aberto, setAberto] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_PADRAO);

  const recortado = useMemo(() => (estado ? recortar(estado, periodo) : null), [estado, periodo]);

  if (erro !== null) {
    return (
      <div className="conteudo">
        <div className="notificacao"><span className="ponto" />não foi possível carregar o projeto: {erro}</div>
      </div>
    );
  }
  if (estado === null || recortado === null) {
    return <div className="conteudo" style={{ color: "var(--vscode-descriptionForeground)" }}>carregando…</div>;
  }

  const contagens: Partial<Record<Secao, number>> = {
    conformidade: recortado.violacoes.length,
    schema: estado.rejeicoes.length,
  };
  return (
    <div className="shell">
      <div className="titlebar">
        <span className="caminho">
          <strong>expx-painel</strong>
          <span>—</span>
          <span className="mono">{estado.raiz}</span>
        </span>
      </div>

      <nav className="activitybar" aria-label="seções">
        {SECOES.map(({ id, rotulo, Ic }) => (
          <button
            key={id}
            aria-current={secao === id ? "page" : undefined}
            aria-label={rotulo}
            title={rotulo}
            onClick={() => {
              setSecao(id);
              setAberto(null);
            }}
          >
            <Ic tamanho={22} />
            {contagens[id] !== undefined && (contagens[id] ?? 0) > 0 ? (
              <span className="contagem">{contagens[id]}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <main className="editor">
        {conexao === "caida" ? (
          <div className="conteudo" style={{ paddingBottom: 0 }}>
            <div className="notificacao">
              <span className="ponto" />
              conexão perdida — a tela pode estar desatualizada. Tentando reconectar…
            </div>
          </div>
        ) : null}

        {secao === "dashboard" ? (
          <Dashboard
            estado={recortado}
            periodo={periodo}
            aoMudarPeriodo={setPeriodo}
            aoAbrir={(id) => {
              setSecao("trabalhos");
              setAberto(id);
            }}
          />
        ) : null}

        {secao === "trabalhos" ? (
          aberto !== null ? (
            <Detalhe estado={estado} id={aberto} aoVoltar={() => setAberto(null)} />
          ) : (
            <Trabalhos estado={recortado} periodo={periodo} aoMudarPeriodo={setPeriodo} aoAbrir={setAberto} />
          )
        ) : null}
        {secao === "conformidade" ? (
          <Conformidade estado={recortado} periodo={periodo} aoMudarPeriodo={setPeriodo} />
        ) : null}
        {secao === "historico" ? (
          <Historico estado={recortado} periodo={periodo} aoMudarPeriodo={setPeriodo} />
        ) : null}
        {secao === "schema" ? <ForaDoSchema estado={estado} /> : null}
      </main>

      <footer className="statusbar">
        <span className={`grupo ${conexao === "conectada" ? "vivo" : "morto"}`}>
          <span className="ponto" />
          {conexao === "conectada" ? "ao vivo" : conexao === "conectando" ? "conectando" : "desconectado"}
        </span>
        <span className="grupo">{recortado.trabalhos.length} trabalho(s)</span>
        <span className="grupo" style={recortado.violacoes.length > 0 ? { color: "var(--vscode-editorWarning-foreground)" } : undefined}>
          {recortado.violacoes.length} violação(ões)
        </span>
        <span className="grupo" style={estado.rejeicoes.length > 0 ? { color: "var(--vscode-editorError-foreground)" } : undefined}>
          {estado.rejeicoes.length} fora do schema
        </span>
        <span className="direita">
          <span className="grupo">{descrever(periodo)}</span>
          <span className="grupo">somente leitura</span>
        </span>
      </footer>
    </div>
  );
}
