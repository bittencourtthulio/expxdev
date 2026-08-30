import type { StatusTask, StatusTrabalho } from "../../parser/esquema/enums.js";
import type { Visao } from "../visao/projetar.js";
import type { Papel, Pintor } from "./cor.js";
import { cortar } from "./largura.js";

/**
 * A árvore: sprints, fases e tasks, indentadas.
 *
 * Os dois vocabulários de status NÃO são intercambiáveis: task usa o feminino
 * (`concluida`, `bloqueada`) e trabalho/sprint/fase usam o masculino
 * (`concluido`, `bloqueado`). Uma função de marcador que aceitasse `string`
 * casaria os dois por engano ou deixaria um sem cor — por isso são duas
 * (base/schema-v1-e-kinds.md, risco 4).
 *
 * Marcadores são caractere simples, sem emoji, como manda a especificação.
 */

const MARCA_TASK: Record<StatusTask, { marca: string; papel: Papel }> = {
  concluida: { marca: "[x]", papel: "sucesso" },
  em_andamento: { marca: "[>]", papel: "atencao" },
  bloqueada: { marca: "[!]", papel: "erro" },
  pendente: { marca: "[ ]", papel: "apagado" },
};

const MARCA_GRUPO: Record<StatusTrabalho, { marca: string; papel: Papel }> = {
  concluido: { marca: "[x]", papel: "sucesso" },
  em_andamento: { marca: "[>]", papel: "atencao" },
  bloqueado: { marca: "[!]", papel: "erro" },
  nao_iniciado: { marca: "[ ]", papel: "apagado" },
};

export function desenharArvore(v: Visao, colunas: number, pintar: Pintor): string[] {
  if (v.trabalho === null) return [];

  const linhas: string[] = [];
  // A task em andamento é o que a pessoa quer achar de relance na tela.
  const emFoco = v.estado?.task ?? null;

  for (const sprint of v.trabalho.sprints) {
    const s = MARCA_GRUPO[sprint.status];
    linhas.push(
      pintar(cortar(`${s.marca} ${sprint.sprint_id} · ${sprint.titulo}`, colunas), s.papel),
    );

    for (const fase of sprint.fases) {
      const f = MARCA_GRUPO[fase.status];
      // fase paralela mostra com quem roda junto — o plano declarou, a
      // execução nunca decide isso sozinha
      const par = fase.paralela_com.length > 0 ? ` || ${fase.paralela_com.join(",")}` : "";
      linhas.push(
        pintar(cortar(`  ${f.marca} ${fase.id} · ${fase.titulo}${par}`, colunas), f.papel),
      );

      for (const task of fase.tasks) {
        const t = MARCA_TASK[task.status];
        const dep = task.depende_de.length > 0 ? ` ← ${task.depende_de.join(",")}` : "";
        const paralela = task.paralelizavel ? " ||" : "";
        const foco = task.id === emFoco ? " <" : "";
        const texto = `    ${t.marca} ${task.id} ${task.titulo}${paralela}${dep}${foco}`;
        linhas.push(pintar(cortar(texto, colunas), task.id === emFoco ? "destaque" : t.papel));
      }
    }

    // Tasks que o arquivo de fases não referencia continuam existindo: o
    // vínculo autoritativo é o campo `fase` da task, e uma task apontando
    // para fase inexistente sumiria da tela sem isto.
    const nasFases = new Set(sprint.fases.flatMap((f) => f.tasks.map((t) => t.id)));
    for (const task of sprint.tasks) {
      if (nasFases.has(task.id)) continue;
      const t = MARCA_TASK[task.status];
      linhas.push(
        pintar(cortar(`    ${t.marca} ${task.id} ${task.titulo} (fora de fase)`, colunas), t.papel),
      );
    }
  }

  return linhas;
}
