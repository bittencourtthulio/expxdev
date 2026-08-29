import type { JSX } from "react";
import type { Estado, Task, Trabalho } from "../tipos.js";
import { ROTULO_ESTAGIO } from "../tipos.js";
import { Barra, Etiqueta, Vazio, PageHeader } from "../comuns.js";

const ROTULO_STATUS: Record<string, string> = {
  pendente: "pendente", em_andamento: "em andamento", concluida: "concluída", bloqueada: "bloqueada",
};

function LinhaTask({ t, critico }: { t: Task; critico: boolean }): JSX.Element {
  return (
    <div className="linha-task">
      <code>{t.id}</code>
      <div>
        <div style={{ fontWeight: 520 }}>{t.titulo}</div>
        <div className="dep">
          {t.depende_de.length > 0 ? `depende de ${t.depende_de.join(", ")}` : "sem dependências"}
          {t.concluida_em ? ` · concluída em ${t.concluida_em}` : ""}
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {critico ? <Etiqueta tipo="critico">caminho crítico</Etiqueta> : null}
        {t.paralelizavel ? <Etiqueta tipo="paralela">paralelizável</Etiqueta> : null}
        <Etiqueta tipo={t.status === "concluida" ? "ok" : t.status === "bloqueada" ? "bug" : undefined}>
          {ROTULO_STATUS[t.status] ?? t.status}
        </Etiqueta>
        <Etiqueta tipo={t.suite === "verde" ? "ok" : t.suite === "vermelha" ? "bug" : undefined}>
          {t.suite.replace("_", " ")}
        </Etiqueta>
      </div>
    </div>
  );
}

export function Detalhe({
  estado,
  id,
  aoVoltar,
}: {
  estado: Estado;
  id: string;
  aoVoltar: () => void;
}): JSX.Element {
  const t: Trabalho | undefined = estado.trabalhos.find((x) => x.trabalho_id === id);
  if (!t) return <Vazio titulo="Trabalho não encontrado" texto={`Nenhum trabalho com id ${id}.`} />;

  const critico = new Set(t.caminho_critico);
  const abertos = t.bloqueios.filter((b) => b.aberto);

  return (
    <>
      <PageHeader
        trilha={[{ rotulo: "Painel", aoClicar: aoVoltar }, { rotulo: t.trabalho_id }]}
        titulo={
          <>
            {t.titulo}
            <Etiqueta tipo={t.expx_tool}>{t.expx_tool}</Etiqueta>
          </>
        }
        sub={`${ROTULO_ESTAGIO[t.estagio] ?? t.estagio} · ${t.status.replace("_", " ")} · ${String(Math.round(t.progresso * 100))}% concluído`}
      />
      <div className="conteudo">

      <div className="painel-det">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 11 }}>
          <Etiqueta>{t.tipo_trabalho}</Etiqueta>
          {t.tipo_ocorrencia ? <Etiqueta tipo={t.tipo_ocorrencia === "bug" ? "bug" : undefined}>{t.tipo_ocorrencia}</Etiqueta> : null}
          <Etiqueta>criado em {t.criado_em}</Etiqueta>
        </div>
        <Barra valor={t.progresso} />
        <div className="cam" style={{ marginTop: 9 }}>{t.pasta}</div>
        {t.caminho_critico.length > 0 ? (
          <div style={{ marginTop: 11, fontSize: 13 }}>
            <strong style={{ fontWeight: 560 }}>Caminho crítico:</strong>{" "}
            <span className="mono">{t.caminho_critico.join(" → ")}</span>
          </div>
        ) : null}
      </div>

      {abertos.length > 0 ? (
        <div className="painel-det" style={{ borderColor: "var(--alerta)" }}>
          <h3 style={{ margin: "0 0 9px", fontSize: 13, color: "var(--alerta)" }}>
            {abertos.length} bloqueio(s) aberto(s)
          </h3>
          {abertos.map((b) => (
            <div key={b.id} style={{ fontSize: 13, marginBottom: 5 }}>
              <code>{b.id}</code> {b.task ? <span className="dep">({b.task})</span> : null} — {b.descricao}
              <span className="dep"> · aberto em {b.aberto_em}</span>
            </div>
          ))}
        </div>
      ) : null}

      {t.sprints.length === 0 ? (
        <Vazio titulo="Sem sprints" texto="Este trabalho ainda não tem pastas sprint-NN no disco." />
      ) : (
        t.sprints.map((s) => (
          <div className="painel-det" key={s.sprint_id}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>{s.sprint_id} — {s.titulo}</h3>
              <span className="dep">{Math.round(s.progresso * 100)}%</span>
              <Etiqueta tipo={s.status === "concluido" ? "ok" : undefined}>{s.status.replace("_", " ")}</Etiqueta>
            </div>
            <Barra valor={s.progresso} />
            {s.criterio_saida ? <div className="dep" style={{ marginTop: 7 }}>saída: {s.criterio_saida}</div> : null}

            {s.fases.map((f) => (
              <div key={f.id} style={{ marginTop: 15 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 5 }}>
                  <code>{f.id}</code>
                  <strong style={{ fontWeight: 560, fontSize: 13 }}>{f.titulo}</strong>
                  <span className="dep">{Math.round(f.progresso * 100)}%</span>
                  {f.paralela_com.length > 0 ? (
                    <Etiqueta tipo="paralela">∥ {f.paralela_com.join(", ")}</Etiqueta>
                  ) : null}
                </div>
                <Barra valor={f.progresso} />
                <div style={{ marginTop: 7 }}>
                  {f.tasks.map((task) => (
                    <LinhaTask key={task.id} t={task} critico={critico.has(task.id) || critico.has(f.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
      </div>
    </>
  );
}
