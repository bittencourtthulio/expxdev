const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/**
 * "há 3 min", "há 2 h", "há 4 d" — curto, porque é rodapé.
 *
 * Compartilhada pelos dois motores (extraída de `desenho/desenhar.ts`).
 */
export function desde(quando: Date, agora: Date): string {
  const ms = Math.max(0, agora.getTime() - quando.getTime());
  if (ms < MINUTO) return "há instantes";
  if (ms < HORA) return `há ${String(Math.floor(ms / MINUTO))} min`;
  if (ms < DIA) return `há ${String(Math.floor(ms / HORA))} h`;
  return `há ${String(Math.floor(ms / DIA))} d`;
}
