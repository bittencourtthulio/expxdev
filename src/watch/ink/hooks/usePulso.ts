import { useEffect, useState } from "react";

/**
 * O pulso do relógio, como hook local — equivalente ao `setInterval` de 1s
 * em `watch.ts`, mas escopado ao componente que precisa dele (tempo
 * decorrido de uma task, barra indeterminada), não ao processo inteiro.
 *
 * `ms <= 0` desliga o pulso (mesmo contrato de `pulsoMs: 0` em `watch.ts`,
 * usado em teste para saída determinística).
 */
export function usePulso(ms: number): Date {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    if (ms <= 0) return;
    const id = setInterval(() => {
      setAgora(new Date());
    }, ms);
    return () => {
      clearInterval(id);
    };
  }, [ms]);

  return agora;
}
