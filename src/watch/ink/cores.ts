import type { Papel } from "../desenho/cor.js";

/**
 * Mapeia os papéis de cor do painel (por significado, não por cor — ver
 * `desenho/cor.ts`) para a prop `color` do `<Text>` do Ink.
 *
 * Mesma paleta do motor ANSI antigo, escolhida por papel semântico: trocar a
 * cor de "erro" não exige caçar "red" espalhado pelos componentes.
 */
export const COR_DO_PAPEL: Record<Papel, string | undefined> = {
  sucesso: "green",
  atencao: "yellow",
  erro: "red",
  destaque: "cyanBright",
  apagado: "gray",
  neutro: undefined,
};
