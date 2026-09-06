import type { ExpxTool } from "../../parser/esquema/enums.js";

/**
 * O pipeline do framework como trilha visível — o que faltava na tela.
 *
 * O painel mostrava o estágio corrente como um código solto (`e3 correcao`),
 * que só diz alguma coisa a quem já decorou a máquina de estados. Mas o
 * método é uma SEQUÊNCIA: a runx vai de e1 a e5, a sprintx de f1 a f6, a
 * buildx de b1 a b6. Quem acompanha uma execução quer ver a trilha inteira,
 * com o passo atual aceso e os anteriores vencidos — é a diferença entre
 * "está em e3" e "venceu investigação e plano, está corrigindo, faltam QA e
 * relatório".
 *
 * A trilha é dado do MÉTODO, não do plano: um trabalho não declara por quais
 * estágios passou. O que se sabe é a ordem canônica de cada ferramenta e onde
 * o trabalho está agora — o resto se deduz por posição.
 */

export type PassoPipeline = {
  /** O código do estágio: `e3`, `f6`, `b2`. */
  codigo: string;
  /** O nome legível, o que a pessoa lê: "correcao", "execucao". */
  nome: string;
  /** Onde este passo está em relação ao corrente. */
  situacao: "vencido" | "atual" | "adiante";
};

/**
 * A ordem canônica dos estágios de cada ferramenta.
 *
 * Espelha `MARCA_ESTAGIO` de `situacao.ts`, mas como SEQUÊNCIA e não como
 * mapa: o mapa responde "como se chama e3", esta tabela responde "o que vem
 * antes e o que vem depois dele" — que é a pergunta da trilha.
 */
export const TRILHA: Record<ExpxTool, readonly { codigo: string; nome: string }[]> = {
  sprintx: [
    { codigo: "f1", nome: "ingestao" },
    { codigo: "f2", nome: "descoberta" },
    { codigo: "f3", nome: "plano" },
    { codigo: "f4", nome: "orquestracao" },
    { codigo: "f5", nome: "auditoria" },
    { codigo: "f6", nome: "execucao" },
  ],
  runx: [
    { codigo: "e1", nome: "investigacao" },
    { codigo: "e2", nome: "plano" },
    { codigo: "e3", nome: "correcao" },
    { codigo: "e4", nome: "qa" },
    { codigo: "e5", nome: "relatorio" },
  ],
  buildx: [
    { codigo: "b1", nome: "concepcao" },
    { codigo: "b2", nome: "stack" },
    { codigo: "b3", nome: "mapa" },
    { codigo: "b4", nome: "features" },
    { codigo: "b5", nome: "recursao" },
    { codigo: "b6", nome: "validacao" },
  ],
};

/**
 * A trilha de uma ferramenta com cada passo situado em relação ao corrente.
 *
 * Estágio desconhecido (não está na trilha) devolve a trilha inteira como
 * "adiante": é honesto — não se sabe onde o trabalho está, e fingir que está
 * no primeiro passo inventaria progresso que não existe.
 */
export function pipelineDe(ferramenta: ExpxTool, estagioAtual: string): PassoPipeline[] {
  const trilha = TRILHA[ferramenta];
  const i = trilha.findIndex((p) => p.codigo === estagioAtual);

  return trilha.map((p, j) => ({
    codigo: p.codigo,
    nome: p.nome,
    situacao: i < 0 ? "adiante" : j < i ? "vencido" : j === i ? "atual" : "adiante",
  }));
}

/**
 * "3 de 5" — a posição na trilha, para o cabeçalho do detalhe.
 *
 * `null` quando o estágio não está na trilha: sem posição conhecida, não há
 * o que contar.
 */
export function posicaoNaTrilha(
  ferramenta: ExpxTool,
  estagioAtual: string,
): { passo: number; total: number } | null {
  const trilha = TRILHA[ferramenta];
  const i = trilha.findIndex((p) => p.codigo === estagioAtual);
  if (i < 0) return null;
  return { passo: i + 1, total: trilha.length };
}
