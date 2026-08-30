import { lerEstado } from "../../../src/servidor/estado.js";
import type { Estado } from "../tipos.js";

/**
 * As fixtures da UI vêm do PARSER REAL lendo as fixtures em disco, não de um
 * objeto escrito à mão. Um duplicado escrito à mão passaria a mentir no dia
 * em que o parser mudasse; assim, um teste de tela quebra se o contrato entre
 * as camadas quebrar — que é exatamente o que queremos saber.
 */
export function estadoFixture(): Estado {
  return lerEstado(
    { raiz: "fixtures/projeto-ok", diasBloqueio: 7 },
    new Date("2026-08-29T12:00:00Z"),
  ) as unknown as Estado;
}

export function estadoRuimFixture(): Estado {
  return lerEstado(
    { raiz: "fixtures/projeto-ruim", diasBloqueio: 7 },
    new Date("2026-08-29T12:00:00Z"),
  ) as unknown as Estado;
}

/**
 * Estado de um projeto COM índice de memória. `estadoFixture()` lê
 * `projeto-ok`, que por decisão não tem índice — é ele quem prova o caso
 * "clone recém-feito, sem memória nenhuma" (decisão D-19).
 */
export function estadoMemoriaFixture(): Estado {
  return lerEstado(
    { raiz: "fixtures/projeto-memoria", diasBloqueio: 7 },
    new Date("2026-08-29T12:00:00Z"),
  ) as unknown as Estado;
}
