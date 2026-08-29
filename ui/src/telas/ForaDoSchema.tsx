import { useState, type JSX } from "react";
import type { Estado } from "../tipos.js";
import { PageHeader, BotaoBaixar, Vazio, Etiqueta } from "../comuns.js";

/**
 * "Sem frontmatter válido" tem dois significados muito diferentes: arquivo
 * defeituoso e arquivo escrito antes do contrato existir. Separá-los evita que
 * uma migração pendente afogue os erros de verdade.
 */
const PRE_CONTRATO = "sem frontmatter valido";

export function ForaDoSchema({ estado }: { estado: Estado }): JSX.Element {
  const [aba, setAba] = useState<"erros" | "antigos">("erros");

  const antigos = estado.rejeicoes.filter((r) => r.motivo === PRE_CONTRATO);
  const erros = estado.rejeicoes.filter((r) => r.motivo !== PRE_CONTRATO);
  const lista = aba === "erros" ? erros : antigos;

  const csv = (): string => {
    const esc = (c: string): string => (/[",\n;]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
    return [
      ["motivo", "detalhe", "arquivo", "linha"],
      ...estado.rejeicoes.map((r) => [r.motivo, r.detalhe, r.arquivo, r.linha === null ? "" : String(r.linha)]),
    ]
      .map((l) => l.map(esc).join(";"))
      .join("\n");
  };

  return (
    <>
      <PageHeader
        titulo="Fora do schema"
        sub="Arquivos que não puderam ser lidos como estado válido. Eles não entram no painel — e nunca derrubam o servidor."
        acoes={estado.rejeicoes.length > 0 ? <BotaoBaixar nome="expx-fora-do-schema.csv" conteudo={csv}>Exportar CSV</BotaoBaixar> : undefined}
        abas={
          <>
            <button role="tab" aria-selected={aba === "erros"} onClick={() => setAba("erros")}>
              Erros de leitura {erros.length > 0 ? `(${String(erros.length)})` : ""}
            </button>
            <button role="tab" aria-selected={aba === "antigos"} onClick={() => setAba("antigos")}>
              Anteriores ao schema {antigos.length > 0 ? `(${String(antigos.length)})` : ""}
            </button>
          </>
        }
      />
      <div className="conteudo">
        {aba === "antigos" && antigos.length > 0 ? (
          <div className="notificacao" style={{ borderColor: "var(--vscode-editorInfo-foreground)", color: "var(--vscode-editorInfo-foreground)" }}>
            <span className="ponto" />
            Estes arquivos não têm bloco de frontmatter: foram gravados antes do contrato expx-schema v1.
            As skills acrescentam o frontmatter na próxima vez que gravarem cada um — não é preciso migrar à mão.
          </div>
        ) : null}

        {lista.length === 0 ? (
          <Vazio
            titulo={aba === "erros" ? "Nenhum erro de leitura" : "Nenhum arquivo anterior ao schema"}
            texto={
              aba === "erros"
                ? "Todo arquivo com frontmatter pôde ser lido pelo contrato expx-schema v1."
                : "Todos os arquivos de estado já têm o frontmatter do contrato."
            }
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 210 }}>motivo</th>
                <th>detalhe</th>
                <th style={{ width: 330 }}>arquivo</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r, i) => (
                <tr key={`${r.arquivo}-${String(i)}`}>
                  <td><Etiqueta tipo={aba === "erros" ? "bug" : undefined}>{r.motivo}</Etiqueta></td>
                  <td>{r.detalhe}</td>
                  <td className="cam">
                    {r.arquivo}
                    {r.linha !== null ? <> <Etiqueta>linha {r.linha}</Etiqueta></> : null}
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
