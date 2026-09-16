import type { Task, Trabalho } from "../tipos.js";

/**
 * O grafo merece a tela por conta própria?
 *
 * O bloco do grafo é recolhido por padrão — o plano é a informação principal da
 * tela, e quem não tem a pergunta "o que trava o quê" não deveria rolar por
 * cima do desenho. Mas recolhido por padrão torna invisível justamente o caso em
 * que o grafo é a resposta: quando o plano tem um defeito estrutural.
 *
 * Esta é a regra que decide. Ela devolve o MOTIVO, não um booleano: o cabeçalho
 * mostra ao lado do título o que fez o bloco abrir, senão a pessoa encontra o
 * grafo aberto sem saber o que procurar nele.
 *
 * Roda sobre as tasks que a tela já tem, sem pedir nada ao servidor: o mesmo
 * dado que alimenta o SVG.
 */

export type MotivoAlerta = "ciclo" | "dependencia_quebrada" | "paralela_suspeita";

const ROTULO: Record<MotivoAlerta, string> = {
  ciclo: "ciclo de dependências",
  dependencia_quebrada: "dependência inexistente",
  paralela_suspeita: "paralelismo declarado com dependência aberta",
};

export function rotuloDoMotivo(m: MotivoAlerta): string {
  return ROTULO[m];
}

/** Todas as tasks do trabalho, achatadas — a mesma leitura que a topologia faz. */
function tasksDe(t: Trabalho): Task[] {
  return t.sprints.flatMap((s) => s.tasks);
}

/**
 * Ciclo por busca em profundidade com marcação de cor — o mesmo algoritmo da
 * regra `ciclo_dependencia` e da topologia do SVG.
 */
function temCiclo(porId: Map<string, Task>): boolean {
  const cor = new Map<string, 0 | 1 | 2>();
  let achou = false;

  function visita(id: string): void {
    cor.set(id, 1);
    for (const dep of porId.get(id)?.depende_de ?? []) {
      if (!porId.has(dep)) continue;
      if (cor.get(dep) === 1) {
        achou = true;
        continue;
      }
      if ((cor.get(dep) ?? 0) === 0) visita(dep);
    }
    cor.set(id, 2);
  }

  for (const id of porId.keys()) {
    if ((cor.get(id) ?? 0) === 0) visita(id);
  }
  return achou;
}

/**
 * Os motivos encontrados, em ordem de gravidade: ciclo trava o plano inteiro,
 * dependência quebrada aponta para um id que não existe, e paralelismo suspeito
 * é uma promessa do plano que a estrutura não sustenta.
 */
export function motivosDoAlerta(trabalho: Trabalho): MotivoAlerta[] {
  const tasks = tasksDe(trabalho);
  if (tasks.length === 0) return [];

  const porId = new Map(tasks.map((t) => [t.id, t]));
  const motivos: MotivoAlerta[] = [];

  if (temCiclo(porId)) motivos.push("ciclo");

  if (tasks.some((t) => t.depende_de.some((d) => !porId.has(d)))) {
    motivos.push("dependencia_quebrada");
  }

  const paralelaSuspeita = tasks.some(
    (t) =>
      t.paralelizavel &&
      t.depende_de.some((d) => {
        const alvo = porId.get(d);
        return alvo !== undefined && alvo.status !== "concluida";
      }),
  );
  if (paralelaSuspeita) motivos.push("paralela_suspeita");

  return motivos;
}
