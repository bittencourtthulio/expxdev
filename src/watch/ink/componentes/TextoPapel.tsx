import React from "react";
import { Text, type TextProps } from "ink";
import type { Papel } from "../../desenho/cor.js";
import { COR_DO_PAPEL } from "../cores.js";

/**
 * `<Text>` do Ink, mas pintado por PAPEL semântico em vez de cor.
 *
 * Existe só para contornar `exactOptionalPropertyTypes: true` (regra do
 * projeto, `tsconfig.json`): a prop `color` do Ink não aceita
 * `color={undefined}` explícito, então o papel "neutro" precisa OMITIR a
 * prop, não passá-la como `undefined`. Isolar esse `if` aqui evita repeti-lo
 * em cada componente que pinta por papel.
 */
export function TextoPapel({
  papel,
  ...resto
}: { papel: Papel } & Omit<TextProps, "color">): React.ReactElement {
  const cor = COR_DO_PAPEL[papel];
  return cor === undefined ? <Text {...resto} /> : <Text color={cor} {...resto} />;
}
