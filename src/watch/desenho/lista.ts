import type { Visao } from "../visao/projetar.js";
import { criarPintor } from "./cor.js";
import { cortar } from "./largura.js";

/**
 * `expx watch --todos`: os trabalhos abertos, um por linha, sem a árvore.
 *
 * "Útil para quem tem várias ocorrências em paralelo." Aberto é todo status
 * diferente de `concluido` (decisão D-16): `bloqueado` e `nao_iniciado` são
 * exatamente o que a pessoa precisa ver numa lista de acompanhamento.
 */
export function desenharLista(v: Visao, colunas: number, cor: boolean): string[] {
  const pintar = criarPintor(cor);

  if (v.abertos.length === 0) {
    return [pintar(cortar("nenhum trabalho aberto", colunas), "apagado")];
  }

  const linhas = [pintar(cortar(`${String(v.abertos.length)} trabalhos abertos`, colunas), "apagado")];

  for (const t of v.abertos) {
    const tasks = t.sprints.flatMap((s) => s.tasks);
    const feitas = tasks.filter((x) => x.status === "concluida").length;
    const progresso = tasks.length > 0 ? ` · ${String(feitas)}/${String(tasks.length)}` : "";
    const bloqueios = t.bloqueios.filter((b) => b.aberto).length;
    const marcaBloqueio = bloqueios > 0 ? ` · ${String(bloqueios)} bloq` : "";

    const papel = t.status === "bloqueado" ? "erro" : t.status === "em_andamento" ? "atencao" : "apagado";
    const texto = `  ${t.trabalho_id} · ${t.expx_tool} · ${t.status}${progresso}${marcaBloqueio} · ${t.titulo}`;
    linhas.push(pintar(cortar(texto, colunas), papel));
  }

  return linhas;
}
