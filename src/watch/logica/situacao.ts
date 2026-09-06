import type { Papel } from "../desenho/cor.js";
import { decorrido } from "../desenho/barra.js";
import type { TrabalhoNaFrota } from "../visao/frota.js";

/**
 * Lógica pura de "em que pé está um trabalho" — compartilhada pelos dois
 * motores de renderização (o ANSI escrito à mão e o Ink).
 *
 * Extraída de `desenho/painel.ts` para não duplicar a regra de negócio: só a
 * camada visual (linhas de texto vs. árvore de componentes) difere entre os
 * dois motores, a decisão de "o que mostrar e com qual papel de cor" mora
 * aqui, uma vez só.
 */

export const MARCA_ESTAGIO: Record<string, string> = {
  f1: "ingestao",
  f2: "descoberta",
  f3: "plano",
  f4: "orquestracao",
  f5: "auditoria",
  f6: "execucao",
  e1: "investigacao",
  e2: "plano",
  e3: "correcao",
  e4: "qa",
  e5: "relatorio",
  b1: "concepcao",
  b2: "stack",
  b3: "mapa",
  b4: "features",
  b5: "recursao",
  b6: "validacao",
};

/**
 * Uma palavra dizendo em que pé está o trabalho — o que a pessoa lê primeiro.
 *
 * "bloqueado" e "parado" são coisas diferentes de propósito: bloqueado é
 * declarado no plano e exige decisão humana; parado é o rastro em silêncio, e
 * costuma ser execução travada.
 */
export function situacao(t: TrabalhoNaFrota, agora: Date): { texto: string; papel: Papel } {
  if (t.bloqueiosAbertos > 0) {
    const n = t.bloqueiosAbertos;
    return { texto: n === 1 ? "1 bloqueio" : `${String(n)} bloqueios`, papel: "erro" };
  }
  if (t.ativas.some((a) => a.bloqueada)) return { texto: "task bloqueada", papel: "erro" };
  if (t.total > 0 && t.concluidas >= t.total) return { texto: "concluido", papel: "sucesso" };

  if (t.ativas.length > 0) {
    // Duas ou mais tasks em andamento é paralelismo REAL acontecendo agora,
    // e é o que a tela precisa gritar.
    const n = t.ativas.length;
    if (n > 1) return { texto: `${String(n)} em paralelo`, papel: "destaque" };
    return { texto: "executando", papel: "atencao" };
  }

  if (t.ultimoEventoTs !== null) {
    const ms = agora.getTime() - new Date(t.ultimoEventoTs).getTime();
    // Dez minutos sem evento numa execução autônoma não é pausa, é sintoma.
    if (ms > 10 * 60_000) return { texto: `parado ha ${decorrido(ms)}`, papel: "atencao" };
  }
  return { texto: "aguardando", papel: "apagado" };
}

/** O nome legível do estágio, ou o próprio código se não mapeado. */
export function nomeEstagio(estagio: string): string {
  return MARCA_ESTAGIO[estagio] ?? estagio;
}
