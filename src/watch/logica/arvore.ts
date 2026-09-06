import type { StatusTask, StatusTrabalho } from "../../parser/esquema/enums.js";
import type { Papel } from "../desenho/cor.js";

/**
 * Marcadores da árvore — compartilhados pelos dois motores.
 *
 * Os dois vocabulários de status NÃO são intercambiáveis: task usa o feminino
 * (`concluida`, `bloqueada`) e trabalho/sprint/fase usam o masculino
 * (`concluido`, `bloqueado`). Uma função que aceitasse `string` casaria os
 * dois por engano (base/schema-v1-e-kinds.md, risco 4).
 */

export const MARCA_TASK: Record<StatusTask, { marca: string; papel: Papel }> = {
  concluida: { marca: "[x]", papel: "sucesso" },
  em_andamento: { marca: "[>]", papel: "atencao" },
  bloqueada: { marca: "[!]", papel: "erro" },
  pendente: { marca: "[ ]", papel: "apagado" },
};

export const MARCA_GRUPO: Record<StatusTrabalho, { marca: string; papel: Papel }> = {
  concluido: { marca: "[x]", papel: "sucesso" },
  em_andamento: { marca: "[>]", papel: "atencao" },
  bloqueado: { marca: "[!]", papel: "erro" },
  nao_iniciado: { marca: "[ ]", papel: "apagado" },
};
