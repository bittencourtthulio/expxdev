import type { Visao } from "../visao/projetar.js";
import { tempoAberto } from "../logica/bloqueios.js";
import type { Pintor } from "./cor.js";
import { cortar } from "./largura.js";

/**
 * A seção de bloqueios — a que sobe para o topo.
 *
 * A lógica de "há quanto tempo" mora em `logica/bloqueios.ts`, compartilhada
 * com o motor Ink. Aqui só resta montar as linhas de texto.
 */

export { tempoAberto };

export function desenharBloqueios(
  v: Visao,
  colunas: number,
  pintar: Pintor,
  agora: Date,
): string[] {
  if (v.bloqueiosAbertos.length === 0) return [];

  const n = v.bloqueiosAbertos.length;
  const titulo = n === 1 ? "1 bloqueio aberto" : `${String(n)} bloqueios abertos`;
  const linhas = [pintar(cortar(titulo, colunas), "erro")];

  for (const b of v.bloqueiosAbertos) {
    const alvo = b.task ?? "sem task";
    const quando = tempoAberto(b.aberto_em, agora);
    // corta primeiro, pinta depois: escape ANSI não ocupa coluna
    const texto = cortar(`  ${b.id} · ${alvo} · ${quando} · ${b.descricao}`, colunas);
    linhas.push(pintar(texto, "erro"));
  }

  return linhas;
}
