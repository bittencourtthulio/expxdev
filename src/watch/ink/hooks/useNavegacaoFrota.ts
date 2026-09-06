import { useEffect, useState } from "react";
import { useInput } from "ink";

/**
 * Navegação mínima da Sprint C: `↑`/`↓` (ou `j`/`k`) troca o trabalho
 * selecionado; `Enter`/`→`/`←` alterna a árvore expandida do selecionado.
 *
 * Escopo deliberadamente pequeno — sem busca, sem seleção de task, sem
 * ações que alterem o plano (o watch continua somente leitura). A seleção
 * é só um ÍNDICE na frota, não dado do domínio: se a frota encolhe (um
 * trabalho fecha e sai da lista), o índice é recortado para o novo tamanho.
 */
export function useNavegacaoFrota(tamanhoFrota: number): {
  selecionado: number | null;
  expandido: boolean;
} {
  const [selecionado, setSelecionado] = useState<number | null>(tamanhoFrota > 0 ? 0 : null);
  const [expandido, setExpandido] = useState(false);

  // A frota mudou de tamanho (trabalho fechou/abriu): mantém a seleção
  // válida sem resetar para o topo à toa a cada redesenho.
  useEffect(() => {
    setSelecionado((atual) => {
      if (tamanhoFrota === 0) return null;
      if (atual === null) return 0;
      return Math.min(atual, tamanhoFrota - 1);
    });
  }, [tamanhoFrota]);

  useInput((input, key) => {
    if (tamanhoFrota === 0) return;

    if (key.upArrow || input === "k") {
      setSelecionado((atual) => ((atual ?? 0) - 1 + tamanhoFrota) % tamanhoFrota);
      setExpandido(false);
    } else if (key.downArrow || input === "j") {
      setSelecionado((atual) => ((atual ?? 0) + 1) % tamanhoFrota);
      setExpandido(false);
    } else if (key.return || key.rightArrow || key.leftArrow) {
      setExpandido((atual) => !atual);
    }
  });

  return { selecionado, expandido };
}
