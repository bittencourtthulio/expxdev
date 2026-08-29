import { useState, type JSX } from "react";
import type { Estado, EntradaHistorico } from "../tipos.js";
import { PageHeader, FiltroPeriodo, BotaoBaixar, Vazio, Etiqueta } from "../comuns.js";
import { Icone } from "../icones.js";
import { descrever, type Periodo } from "../periodo.js";

/** Abre o relatório em aba nova, como documento próprio. */
function urlRelatorio(ocId: string, tipo: "tecnico" | "uso"): string {
  return `/relatorio?oc=${encodeURIComponent(ocId)}&tipo=${tipo}`;
}

function BotoesRelatorio({ e }: { e: EntradaHistorico }): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
      <a
        className="botao"
        href={urlRelatorio(e.oc_id, "tecnico")}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={e.tecnico === null}
        style={e.tecnico === null ? { opacity: 0.4, pointerEvents: "none" } : undefined}
        title="Abrir o relatório técnico em nova aba"
      >
        <Icone.Relatorio tamanho={13} />
        <span style={{ marginLeft: 5 }}>Técnico</span>
      </a>
      <a
        className="botao"
        href={urlRelatorio(e.oc_id, "uso")}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={e.uso === null}
        style={e.uso === null ? { opacity: 0.4, pointerEvents: "none" } : undefined}
        title="Abrir o relatório de uso (texto do cliente) em nova aba"
      >
        <Icone.Cliente tamanho={13} />
        <span style={{ marginLeft: 5 }}>Uso</span>
      </a>
    </div>
  );
}

export function Historico({
  estado,
  periodo,
  aoMudarPeriodo,
}: {
  estado: Estado;
  periodo: Periodo;
  aoMudarPeriodo: (p: Periodo) => void;
}): JSX.Element {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<string | null>(null);

  const tipos = [...new Set(estado.historico.map((e) => e.tipo_ocorrencia))];
  const termo = busca.trim().toLowerCase();

  const visiveis = estado.historico.filter(
    (e) =>
      (tipo === null || e.tipo_ocorrencia === tipo) &&
      (termo === "" ||
        e.modulo_afetado.some((m) => m.toLowerCase().includes(termo)) ||
        e.titulo.toLowerCase().includes(termo) ||
        e.oc_id.toLowerCase().includes(termo)),
  );

  const csv = (): string => {
    const esc = (c: string): string => (/[",\n;]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
    return [
      ["fechado_em", "oc_id", "titulo", "tipo", "modulos", "pasta"],
      ...visiveis.map((e) => [e.fechado_em, e.oc_id, e.titulo, e.tipo_ocorrencia, e.modulo_afetado.join(" "), e.pasta]),
    ]
      .map((l) => l.map(esc).join(";"))
      .join("\n");
  };

  return (
    <>
      <PageHeader
        titulo="Histórico do sistema"
        sub={`${String(visiveis.length)} de ${String(estado.historico.length)} entrega(s) · ${descrever(periodo)}`}
        acoes={visiveis.length > 0 ? <BotaoBaixar nome="expx-entregas.csv" conteudo={csv}>Exportar CSV</BotaoBaixar> : undefined}
      />
      <div className="conteudo">
        <FiltroPeriodo periodo={periodo} aoMudar={aoMudarPeriodo} />

        <div className="filtros">
          <input
            className="busca"
            placeholder="buscar por módulo, título ou id…"
            value={busca}
            onChange={(ev) => setBusca(ev.target.value)}
            aria-label="buscar no histórico"
          />
          {tipos.map((t) => (
            <button key={t} aria-pressed={tipo === t} onClick={() => setTipo(tipo === t ? null : t)}>
              {t}
            </button>
          ))}
        </div>

        {visiveis.length === 0 ? (
          <Vazio
            titulo={estado.historico.length === 0 ? "Sem histórico" : "Nada encontrado"}
            texto={
              estado.historico.length === 0
                ? "Nenhum relatório de fechamento em docs/relatorios/ no período."
                : "Nenhuma entrada corresponde à busca."
            }
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 100 }}>fechado em</th>
                <th style={{ width: 140 }}>ocorrência</th>
                <th>o que foi feito</th>
                <th style={{ width: 110 }}>tipo</th>
                <th style={{ width: 180 }}>módulos</th>
                <th style={{ width: 190 }}>relatórios</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((e) => (
                <tr key={e.pasta}>
                  <td className="mono">{e.fechado_em}</td>
                  <td><code>{e.oc_id}</code></td>
                  <td>{e.titulo}</td>
                  <td>
                    <Etiqueta tipo={e.tipo_ocorrencia === "bug" ? "bug" : undefined}>{e.tipo_ocorrencia}</Etiqueta>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {e.modulo_afetado.length === 0 ? (
                        <span className="dep">—</span>
                      ) : (
                        e.modulo_afetado.map((m) => <Etiqueta key={m}>{m}</Etiqueta>)
                      )}
                    </div>
                  </td>
                  <td><BotoesRelatorio e={e} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
