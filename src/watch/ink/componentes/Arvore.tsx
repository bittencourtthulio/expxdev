import React from "react";
import { Box } from "ink";
import type { TrabalhoMontado } from "../../../parser/projeto/montar.js";
import { MARCA_GRUPO, MARCA_TASK } from "../../logica/arvore.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * A árvore completa: sprints, fases e tasks, indentadas.
 *
 * Equivalente Ink de `desenharArvore()` em `desenho/arvore.ts`. Aparece sob
 * `--arvore` ou o toggle de teclado por trabalho (Sprint C).
 */
export function Arvore({
  trabalho,
  emFoco,
}: {
  trabalho: TrabalhoMontado;
  /** O id da task em foco (`estado.task`), que ganha destaque e `<`. */
  emFoco: string | null;
}): React.ReactElement {
  return (
    <Box flexDirection="column">
      {trabalho.sprints.map((sprint) => {
        const s = MARCA_GRUPO[sprint.status];
        const nasFases = new Set(sprint.fases.flatMap((f) => f.tasks.map((t) => t.id)));

        return (
          <Box flexDirection="column" key={sprint.sprint_id}>
            <TextoPapel papel={s.papel}>
              {s.marca} {sprint.sprint_id} · {sprint.titulo}
            </TextoPapel>

            {sprint.fases.map((fase) => {
              const f = MARCA_GRUPO[fase.status];
              const par = fase.paralela_com.length > 0 ? ` || ${fase.paralela_com.join(",")}` : "";

              return (
                <Box flexDirection="column" key={fase.id}>
                  <TextoPapel papel={f.papel}>
                    {"  "}
                    {f.marca} {fase.id} · {fase.titulo}
                    {par}
                  </TextoPapel>

                  {fase.tasks.map((task) => {
                    const t = MARCA_TASK[task.status];
                    const dep = task.depende_de.length > 0 ? ` ← ${task.depende_de.join(",")}` : "";
                    const paralela = task.paralelizavel ? " ||" : "";
                    const foco = task.id === emFoco ? " <" : "";

                    return (
                      <TextoPapel
                        papel={task.id === emFoco ? "destaque" : t.papel}
                        key={task.id}
                      >
                        {"    "}
                        {t.marca} {task.id} {task.titulo}
                        {paralela}
                        {dep}
                        {foco}
                      </TextoPapel>
                    );
                  })}
                </Box>
              );
            })}

            {sprint.tasks
              .filter((task) => !nasFases.has(task.id))
              .map((task) => {
                const t = MARCA_TASK[task.status];
                return (
                  <TextoPapel papel={t.papel} key={task.id}>
                    {"    "}
                    {t.marca} {task.id} {task.titulo} (fora de fase)
                  </TextoPapel>
                );
              })}
          </Box>
        );
      })}
    </Box>
  );
}
