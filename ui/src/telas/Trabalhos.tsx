import { useState, type JSX } from "react";
import type { Estado, Trabalho } from "../tipos.js";
import { ESTAGIOS_PLANEJAMENTO, ROTULO_ESTAGIO } from "../tipos.js";
import { PageHeader, FiltroPeriodo, BotaoBaixar, Barra, Etiqueta, Vazio } from "../comuns.js";
import { Icone } from "../icones.js";
import { descrever, type Periodo } from "../periodo.js";

type Ordem = "atualizado" | "progresso" | "titulo";

/**
 * Lista de trabalhos — substituiu o quadro kanban.
 *
 * O kanban pressupõe cartões movendo-se entre colunas por decisão de pessoas.
 * Aqui o estágio é a máquina de estados do método: o trabalho avança sozinho
 * conforme a skill grava, e ninguém arrasta nada. Uma tabela ordenável diz a
 * mesma coisa com mais densidade e menos rolagem horizontal.
 */
export function Trabalhos({
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
  const [ferramenta, setFerramenta] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("atualizado");

  const termo = busca.trim().toLowerCase();

  const visiveis = estado.trabalhos
    .filter(
      (t) =>
        (ferramenta === null || t.expx_tool === ferramenta) &&
        (tipo === null || t.tipo_trabalho === tipo) &&
        (status === null || t.status === status) &&
        (termo === "" || t.titulo.toLowerCase().includes(termo) || t.trabalho_id.toLowerCase().includes(termo)),
    )
    .sort((a, b) => {
      if (ordem === "progresso") return b.progresso - a.progresso;
      if (ordem === "titulo") return a.titulo.localeCompare(b.titulo);
      return b.atualizado_em.localeCompare(a.atualizado_em);
    });

  const alterna = <T,>(atual: T | null, v: T, set: (x: T | null) => void): void => set(atual === v ? null : v);

  const csv = (): string => {
    const esc = (c: string): string => (/[",\n;]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
    return [
      ["trabalho_id", "titulo", "ferramenta", "tipo", "estagio", "status", "progresso", "atualizado_em", "pasta"],
      ...visiveis.map((t) => [
        t.trabalho_id, t.titulo, t.expx_tool, t.tipo_trabalho, t.estagio, t.status,
        `${String(Math.round(t.progresso * 100))}%`, t.atualizado_em, t.pasta,
      ]),
    ]
      .map((l) => l.map(esc).join(";"))
      .join("\n");
  };

  return (
    <>
      <PageHeader
        titulo="Trabalhos"
        sub={`${String(visiveis.length)} de ${String(estado.trabalhos.length)} · ${descrever(periodo)}`}
        acoes={visiveis.length > 0 ? <BotaoBaixar nome="expx-trabalhos.csv" conteudo={csv}>Exportar CSV</BotaoBaixar> : undefined}
      />
      <div className="conteudo">
        <FiltroPeriodo periodo={periodo} aoMudar={aoMudarPeriodo} />

        <div className="filtros">
          <input
            className="busca"
            placeholder="buscar por título ou id…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="buscar trabalho"
          />
          <label>ferramenta</label>
          {["sprintx", "runx"].map((f) => (
            <button key={f} aria-pressed={ferramenta === f} onClick={() => alterna(ferramenta, f, setFerramenta)}>
              {f}
            </button>
          ))}
          <label>tipo</label>
          {["feature", "ocorrencia"].map((f) => (
            <button key={f} aria-pressed={tipo === f} onClick={() => alterna(tipo, f, setTipo)}>
              {f}
            </button>
          ))}
          <label>status</label>
          {["nao_iniciado", "em_andamento", "bloqueado", "concluido"].map((f) => (
            <button key={f} aria-pressed={status === f} onClick={() => alterna(status, f, setStatus)}>
              {f.replace("_", " ")}
            </button>
          ))}
          <label>ordenar</label>
          {(["atualizado", "progresso", "titulo"] as Ordem[]).map((o) => (
            <button key={o} aria-pressed={ordem === o} onClick={() => setOrdem(o)}>
              {o}
            </button>
          ))}
        </div>

        {visiveis.length === 0 ? (
          <Vazio
            titulo={estado.trabalhos.length === 0 ? "Nenhum trabalho" : "Nada encontrado"}
            texto={
              estado.trabalhos.length === 0
                ? "Nenhum ORQUESTRADOR.md com frontmatter válido nesta pasta e neste período."
                : "Nenhum trabalho corresponde aos filtros."
            }
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>trabalho</th>
                <th style={{ width: 96 }}>ferramenta</th>
                <th style={{ width: 150 }}>estágio</th>
                <th style={{ width: 110 }}>status</th>
                <th style={{ width: 150 }}>progresso</th>
                <th style={{ width: 100 }}>atualizado</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((t) => (
                <LinhaTrabalho key={t.trabalho_id} t={t} aoAbrir={aoAbrir} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function LinhaTrabalho({ t, aoAbrir }: { t: Trabalho; aoAbrir: (id: string) => void }): JSX.Element {
  const abertos = t.bloqueios.filter((b) => b.aberto).length;
  const fase = ESTAGIOS_PLANEJAMENTO.has(t.estagio) ? "planejamento" : "execução";

  return (
    <tr style={{ cursor: "pointer" }} onClick={() => aoAbrir(t.trabalho_id)}>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {t.tipo_trabalho === "feature" ? <Icone.Feature tamanho={13} /> : <Icone.Ocorrencia tamanho={13} />}
          <span>{t.titulo}</span>
          {abertos > 0 ? <Etiqueta tipo="bug">{abertos} bloqueio(s)</Etiqueta> : null}
        </div>
        <code className="cam">{t.trabalho_id}</code>
      </td>
      <td><Etiqueta tipo={t.expx_tool}>{t.expx_tool}</Etiqueta></td>
      <td>
        <div>{ROTULO_ESTAGIO[t.estagio] ?? t.estagio}</div>
        <span className="dep">{fase}</span>
      </td>
      <td>{t.status.replace("_", " ")}</td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ minWidth: 32 }}>{Math.round(t.progresso * 100)}%</span>
          <div style={{ flex: 1 }}><Barra valor={t.progresso} /></div>
        </div>
      </td>
      <td className="mono">{t.atualizado_em}</td>
    </tr>
  );
}
