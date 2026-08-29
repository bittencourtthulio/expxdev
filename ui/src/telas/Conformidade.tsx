import { useState, type JSX } from "react";
import type { Estado } from "../tipos.js";
import { PageHeader, FiltroPeriodo, BotaoBaixar, Vazio, Etiqueta } from "../comuns.js";
import { descrever, type Periodo } from "../periodo.js";

const ROTULO: Record<string, string> = {
  teste_ausente: "Task sem teste obrigatório",
  regressao_ausente: "Bug sem teste de regressão",
  concluida_sem_verde: "Concluída sem suíte verde",
  paralela_com_dependencia: "Paralelizável com dependência",
  sem_criterio_saida: "Sem critério de saída",
  bloqueio_antigo: "Bloqueio aberto há muito tempo",
  dependencia_inexistente: "Dependência inexistente",
  ciclo_dependencia: "Ciclo de dependências",
  estagio_incoerente: "Estágio incoerente com a ferramenta",
};

export function Conformidade({
  estado,
  periodo,
  aoMudarPeriodo,
}: {
  estado: Estado;
  periodo: Periodo;
  aoMudarPeriodo: (p: Periodo) => void;
}): JSX.Element {
  const [tipo, setTipo] = useState<string | null>(null);

  const tipos = [...new Set(estado.violacoes.map((v) => v.tipo))];
  const visiveis = tipo === null ? estado.violacoes : estado.violacoes.filter((v) => v.tipo === tipo);

  const porTipo = new Map<string, typeof estado.violacoes>();
  for (const v of visiveis) {
    const l = porTipo.get(v.tipo) ?? [];
    l.push(v);
    porTipo.set(v.tipo, l);
  }

  const csv = (): string => {
    const esc = (c: string): string => (/[",\n;]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
    return [
      ["tipo", "trabalho_id", "alvo", "detalhe", "arquivo", "linha"],
      ...visiveis.map((v) => [v.tipo, v.trabalho_id, v.alvo, v.detalhe, v.arquivo, v.linha === null ? "" : String(v.linha)]),
    ]
      .map((l) => l.map(esc).join(";"))
      .join("\n");
  };

  return (
    <>
      <PageHeader
        titulo="Conformidade com o método"
        sub={
          estado.violacoes.length === 0
            ? `Nenhuma violação em ${descrever(periodo)}.`
            : `${String(estado.violacoes.length)} violação(ões) em ${descrever(periodo)}, detectadas pelo frontmatter.`
        }
        acoes={estado.violacoes.length > 0 ? <BotaoBaixar nome="expx-violacoes.csv" conteudo={csv}>Exportar CSV</BotaoBaixar> : undefined}
      />
      <div className="conteudo">
        <FiltroPeriodo periodo={periodo} aoMudar={aoMudarPeriodo} />

        {estado.violacoes.length === 0 ? (
          <Vazio titulo="Nenhuma violação" texto="Todos os trabalhos obedecem às regras verificáveis pelo frontmatter." />
        ) : (
          <>
            <div className="filtros">
              <label>tipo</label>
              {tipos.map((t) => (
                <button key={t} aria-pressed={tipo === t} onClick={() => setTipo(tipo === t ? null : t)}>
                  {ROTULO[t] ?? t}
                </button>
              ))}
            </div>

            {[...porTipo].map(([t, lista]) => (
              <div key={t} style={{ marginBottom: 20 }}>
                <h2 className="titulo-secao" style={{ fontSize: 13 }}>
                  {ROTULO[t] ?? t}<span className="leve">{lista.length}</span>
                </h2>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 150 }}>trabalho</th>
                      <th style={{ width: 110 }}>alvo</th>
                      <th>detalhe</th>
                      <th style={{ width: 300 }}>arquivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((v, i) => (
                      <tr key={`${v.trabalho_id}-${v.alvo}-${String(i)}`}>
                        <td><code>{v.trabalho_id}</code></td>
                        <td><code>{v.alvo}</code></td>
                        <td>{v.detalhe}</td>
                        <td className="cam">
                          {v.arquivo}
                          {v.linha !== null ? <> <Etiqueta>linha {v.linha}</Etiqueta></> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
