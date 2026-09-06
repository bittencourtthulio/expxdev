import React from "react";
import { Text } from "ink";

/** A tela de "nenhum trabalho aberto" — equivalente Ink do caso vazio de `desenhar()`. */
export function SemTrabalho(): React.ReactElement {
  return <Text dimColor>nenhum trabalho aberto</Text>;
}
