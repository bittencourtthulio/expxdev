import type { Papel } from "./cor.js";

/**
 * Barras de progresso e tempo decorrido — o vocabulário visual do painel.
 *
 * Duas barras, porque o método mede duas coisas diferentes e misturá-las
 * mentiria:
 *
 *  - `barra()` é progresso REAL: contagem de tasks concluídas sobre o total.
 *    Trabalho, sprint e fase têm isso.
 *  - `barraIndeterminada()` é atividade, não progresso: a task em andamento
 *    não tem percentual verdadeiro no método (o status é pendente, em
 *    andamento, concluída ou bloqueada — nunca "43%"). A estimativa que
 *    acompanha essa barra vem do rastro e é rotulada como estimativa em
 *    `estimativa.ts`; a barra em si só pulsa, para dizer "isto está vivo".
 *
 * Blocos de oitavo (▏▎▍▌▋▊▉█) dão resolução de 1/8 de coluna sem emoji, que a
 * especificação proíbe. São largura simples em qualquer terminal moderno.
 */

const CHEIO = "█";
const VAZIO = "░";
/** Frações de coluna, de 1/8 a 7/8. */
const OITAVOS = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"] as const;

/**
 * Uma barra de `largura` colunas representando `feitas` de `total`.
 *
 * Duas regras que evitam mentira visual, e que vieram de olhar a tela:
 *  - só está cheia quando `feitas === total`: arredondar 9/10 para cheio faz
 *    a pessoa achar que acabou;
 *  - qualquer progresso maior que zero acende ao menos um oitavo, para não
 *    parecer parado quando já começou.
 */
export function barra(feitas: number, total: number, largura: number): string {
  if (largura <= 0) return "";
  if (total <= 0) return VAZIO.repeat(largura);

  const fracao = Math.max(0, Math.min(1, feitas / total));

  if (fracao >= 1) return CHEIO.repeat(largura);

  // Já começou: acende ao menos um oitavo. Ainda NÃO acabou: sobra ao menos
  // uma CÉLULA vazia — não um oitavo, uma célula. Um `▉` na última posição é
  // lido como barra cheia a um metro de distância, e a pessoa que lê "acabou"
  // para de olhar faltando uma task.
  const maximo = (largura - 1) * 8;
  const oitavos = Math.min(maximo, fracao > 0 ? Math.max(1, Math.floor(fracao * largura * 8)) : 0);

  const cheias = Math.floor(oitavos / 8);
  const resto = oitavos % 8;
  const parcial = OITAVOS[resto] ?? "";

  const usadas = cheias + (parcial === "" ? 0 : 1);
  return CHEIO.repeat(cheias) + parcial + VAZIO.repeat(Math.max(0, largura - usadas));
}

/**
 * A barra de atividade: uma onda que anda com o tempo.
 *
 * Não representa quanto falta — representa que algo está acontecendo agora.
 * A fase depende do relógio, então o redesenho a move sozinho, sem estado.
 */
export function barraIndeterminada(largura: number, agora: Date): string {
  if (largura <= 0) return "";

  // Um passo por 400 ms: rápido o bastante para ler como movimento, lento o
  // bastante para não virar ruído numa tela que a pessoa olha por minutos.
  const passo = Math.floor(agora.getTime() / 400);
  const cabeca = passo % (largura + 4);

  let saida = "";
  for (let i = 0; i < largura; i++) {
    const d = cabeca - i;
    saida += d >= 0 && d < 3 ? CHEIO : VAZIO;
  }
  return saida;
}

/** O papel de cor de uma barra, pelo que a proporção significa. */
export function papelDaBarra(feitas: number, total: number): Papel {
  if (total > 0 && feitas >= total) return "sucesso";
  if (feitas > 0) return "atencao";
  return "apagado";
}

/** "45%" — inteiro, porque casa decimal em barra de terminal é ruído. */
export function percentual(feitas: number, total: number): string {
  if (total <= 0) return "0%";
  return `${String(Math.floor((Math.max(0, Math.min(feitas, total)) / total) * 100))}%`;
}

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/**
 * Tempo decorrido, curto: "12s", "2m18s", "1h04", "3d".
 *
 * Segundos aparecem até a hora porque é a escala em que a pessoa percebe que
 * a execução travou. Acima disso viram ruído e somem.
 */
export function decorrido(ms: number): string {
  const t = Math.max(0, ms);
  if (t < MINUTO) return `${String(Math.floor(t / SEGUNDO))}s`;
  if (t < HORA) {
    const m = Math.floor(t / MINUTO);
    const s = Math.floor((t % MINUTO) / SEGUNDO);
    return `${String(m)}m${String(s).padStart(2, "0")}s`;
  }
  if (t < DIA) {
    const h = Math.floor(t / HORA);
    const m = Math.floor((t % HORA) / MINUTO);
    return `${String(h)}h${String(m).padStart(2, "0")}`;
  }
  return `${String(Math.floor(t / DIA))}d`;
}
