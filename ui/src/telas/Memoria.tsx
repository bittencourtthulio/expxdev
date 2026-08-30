import type { JSX } from "react";
import type { Estado, Memoria as MemoriaDados } from "../tipos.js";
import { PageHeader, BotaoBaixar, Vazio, Etiqueta } from "../comuns.js";

/**
 * A memória do projeto: o que já se sabe sobre estes arquivos.
 *
 * Esta tela NÃO respeita o filtro global de período (decisão D-08), e isso é
 * deliberado: o valor do sinal é justamente o antigo. Um arquivo que regrediu
 * há dois anos continua sendo um arquivo que regride, e recortá-lo por data
 * esconderia exatamente o aviso que importa.
 *
 * Nada é recalculado aqui: ordenação e contagem vêm prontas do servidor
 * (decisão D-09).
 */

/** Escape no mesmo dialeto das outras telas: separador `;`, aspas dobradas. */
function esc(c: string): string {
  return /[",\n;]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c;
}

export function csvDaMemoria(m: MemoriaDados | null): string {
  const linhas = [
    ["arquivo", "trabalhos", "regressoes", "reprovacoes_qa", "ultimo_trabalho_em", "faixa_atencao"],
    ...(m?.arquivos_de_risco ?? []).map((a) => [
      a.arquivo,
      String(a.trabalhos),
      String(a.regressoes),
      String(a.reprovacoes_qa),
      a.ultimo_trabalho_em ?? "",
      a.faixa_atencao ?? "",
    ]),
  ];
  return linhas.map((l) => l.map(esc).join(";")).join("\n");
}

export function Memoria({ estado }: { estado: Estado }): JSX.Element {
  const m = estado.memoria;

  if (m === null) {
    return (
      <>
        <PageHeader
          titulo="Memória do projeto"
          sub="Nenhum índice de memória encontrado neste projeto."
        />
        <div className="conteudo">
          <Vazio
            titulo="Sem índice de memória"
            texto={
              "O índice é local e não vai para o repositório, então um clone recém-feito não tem nenhum. " +
              "Gere o seu com: python3 .claude/skills/memox/assets/memox.py indexar"
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Memória do projeto"
        sub={
          `Índice de ${m.gerado_em}: ${String(m.totais.trabalhos)} trabalho(s), ` +
          `${String(m.totais.regressoes)} regressão(ões), ${String(m.totais.arquivos)} arquivo(s).`
        }
        acoes={
          <BotaoBaixar nome="expx-memoria.csv" conteudo={() => csvDaMemoria(m)}>
            Exportar CSV
          </BotaoBaixar>
        }
      />
      <div className="conteudo">
        <h2 className="titulo-secao" style={{ fontSize: 13 }}>
          Arquivos de risco<span className="leve">{m.arquivos_de_risco.length}</span>
        </h2>
        {m.arquivos_de_risco.length === 0 ? (
          <Vazio titulo="Nenhum arquivo com sinal" texto="Nenhum arquivo do índice acumulou sinal de risco." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>arquivo</th>
                <th style={{ width: 90 }}>trabalhos</th>
                <th style={{ width: 100 }}>regressões</th>
                <th style={{ width: 110 }}>reprovado em QA</th>
                <th style={{ width: 120 }}>último trabalho</th>
                <th style={{ width: 200 }}>sinais</th>
              </tr>
            </thead>
            <tbody>
              {m.arquivos_de_risco.map((a) => (
                <tr key={a.arquivo}>
                  <td className="cam">{a.arquivo}</td>
                  <td>{a.trabalhos}</td>
                  <td style={a.regressoes > 0 ? { color: "var(--vscode-editorError-foreground)" } : undefined}>
                    {a.regressoes}
                  </td>
                  <td style={a.reprovacoes_qa > 0 ? { color: "var(--vscode-editorWarning-foreground)" } : undefined}>
                    {a.reprovacoes_qa}
                  </td>
                  <td>{a.ultimo_trabalho_em ?? "—"}</td>
                  <td>
                    {a.faixa_atencao !== null ? <Etiqueta>atenção {a.faixa_atencao}</Etiqueta> : null}
                    {a.zona_de_risco !== null ? <Etiqueta tipo="alerta">zona de risco</Etiqueta> : null}
                    {a.divida !== null ? <Etiqueta>dívida {a.risco_divida ?? ""}</Etiqueta> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 className="titulo-secao" style={{ fontSize: 13, marginTop: 20 }}>
          Regressões<span className="leve">{m.regressoes.length}</span>
        </h2>
        {m.regressoes.length === 0 ? (
          <Vazio titulo="Nenhuma regressão" texto="Nenhum trabalho foi vinculado a uma alteração anterior com evidência." />
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 250 }}>arquivo(s)</th>
                <th style={{ width: 160 }}>trabalho anterior</th>
                <th style={{ width: 160 }}>trabalho posterior</th>
                <th>evidência</th>
              </tr>
            </thead>
            <tbody>
              {m.regressoes.map((r, i) => (
                <tr key={`${r.trabalho_anterior}-${r.trabalho_posterior}-${String(i)}`}>
                  <td className="cam">{r.arquivos.join(", ")}</td>
                  <td>
                    <code>{r.trabalho_anterior}</code> <span className="leve">{r.data_anterior ?? ""}</span>
                  </td>
                  <td>
                    <code>{r.trabalho_posterior}</code> <span className="leve">{r.data_posterior ?? ""}</span>
                  </td>
                  <td>
                    {r.evidencia}
                    {r.origem_causa !== null ? <div className="cam">ver: {r.origem_causa}</div> : null}
                    {r.origem_alteracao !== null ? <div className="cam">ver: {r.origem_alteracao}</div> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 className="titulo-secao" style={{ fontSize: 13, marginTop: 20 }}>
          Coincidências de arquivo<span className="leve">{m.coincidencias.length}</span>
        </h2>
        <p style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)", marginTop: 0 }}>
          Trabalhos que tocaram o mesmo arquivo sem que se possa afirmar que um causou o outro. Ficam
          listados com o motivo: coincidência não vira regressão por parecer plausível.
        </p>
        {m.coincidencias.length === 0 ? (
          <Vazio titulo="Nenhuma coincidência" texto="Nenhum vínculo entre trabalhos foi descartado por falta de evidência." />
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 250 }}>arquivo(s)</th>
                <th style={{ width: 220 }}>trabalhos</th>
                <th>por que não é regressão</th>
              </tr>
            </thead>
            <tbody>
              {m.coincidencias.map((c, i) => (
                <tr key={`${c.trabalhos.join("-")}-${String(i)}`}>
                  <td className="cam">{c.arquivos.join(", ")}</td>
                  <td>{c.trabalhos.map((t) => <code key={t}>{t} </code>)}</td>
                  <td>{c.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 className="titulo-secao" style={{ fontSize: 13, marginTop: 20 }}>
          Artefatos contaminados<span className="leve">{m.contaminados.length}</span>
        </h2>
        {m.contaminados.length === 0 ? (
          <Vazio titulo="Nenhum segredo detectado" texto="Nenhum artefato do projeto teve segredo detectado pelo memox." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>artefato</th>
                <th style={{ width: 260 }}>o que foi detectado</th>
              </tr>
            </thead>
            <tbody>
              {m.contaminados.map((c) => (
                <tr key={c.artefato}>
                  <td className="cam">{c.artefato}</td>
                  <td>
                    {c.tipos.map((t) => (
                      <Etiqueta key={t} tipo="alerta">{t}</Etiqueta>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
