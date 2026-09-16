import type { TrabalhoMontado } from "../parser/projeto/montar.js";
import type { StatusTask } from "../parser/esquema/enums.js";

/**
 * A topologia é a camada pura do grafo: recebe as tasks do trabalho e devolve
 * nós, arestas e níveis. Não sabe desenhar, não sabe de SVG, não toca disco.
 *
 * A separação existe porque o mesmo cálculo alimenta três consumos — o SVG do
 * `expx grafo`, a rota do painel e o grafo interativo da tela — e porque
 * topologia é o que se testa sem renderizar.
 *
 * O contrato de entrada é `TaskDoGrafo`, não o tipo do parser: a tela do painel
 * recebe as tasks já serializadas em JSON pela API, que têm os mesmos campos mas
 * não são o mesmo tipo. Amarrar a topologia ao tipo do parser obrigaria a
 * duplicar este arquivo no lado da UI — e duas cópias de um algoritmo de grafo
 * divergem na primeira correção que só uma delas receber.
 */

/** O mínimo que a topologia precisa saber de uma task para montar o grafo. */
export type TaskDoGrafo = {
  id: string;
  titulo: string;
  fase: string;
  status: StatusTask;
  depende_de: string[];
  paralelizavel: boolean;
};

export type No = {
  id: string;
  titulo: string;
  status: StatusTask;
  fase: string;
  /** Ausente quando a topologia é montada a partir de tasks soltas. */
  sprint_id?: string;
  paralelizavel: boolean;
  /** Profundidade na ordem de dependência: 0 é o que não espera ninguém. */
  nivel: number;
  /** true quando a task está no caminho crítico calculado. */
  critico: boolean;
  /** true quando a task participa de um ciclo — desenhada em alerta. */
  em_ciclo: boolean;
  /**
   * `paralelizavel: true` com dependência aberta. É a violação
   * `paralela_com_dependencia` do painel, marcada no próprio nó para o grafo
   * mostrar onde ela está em vez de só contá-la numa tabela.
   */
  paralela_suspeita: boolean;
};

export type Aresta = {
  de: string;
  para: string;
  /** true quando os dois extremos estão no caminho crítico, em sequência. */
  critica: boolean;
  /** Dependência declarada que aponta para um id inexistente. */
  quebrada: boolean;
};

export type Topologia = {
  trabalho_id: string;
  titulo: string;
  nos: No[];
  arestas: Aresta[];
  /** Os ids do caminho crítico, em ordem. */
  caminho_critico: string[];
  /** Nós agrupados por nível, na ordem em que devem ser desenhados. */
  niveis: No[][];
  /** Ids citados em `depende_de` que não existem no trabalho. */
  dependencias_quebradas: string[];
};

/** Todas as tasks do trabalho, achatadas — mesma leitura que a conformidade faz. */
function tasksDe(t: TrabalhoMontado): (TaskDoGrafo & { sprint_id: string })[] {
  return t.sprints.flatMap((s) => s.tasks);
}

/**
 * Detecta os nós em ciclo com busca em profundidade e marcação de cor, no mesmo
 * algoritmo da regra `ciclo_dependencia` do painel.
 *
 * O grafo precisa saber disso antes de calcular nível: um ciclo não tem ordem
 * topológica, e sem essa marcação o cálculo de nível entraria em laço.
 */
function detectarCiclos(porId: Map<string, TaskDoGrafo>): Set<string> {
  const cor = new Map<string, 0 | 1 | 2>();
  const emCiclo = new Set<string>();

  function visita(id: string, pilha: string[]): void {
    cor.set(id, 1);
    for (const dep of porId.get(id)?.depende_de ?? []) {
      if (!porId.has(dep)) continue;
      if (cor.get(dep) === 1) {
        for (const x of [...pilha.slice(pilha.indexOf(dep)), dep]) emCiclo.add(x);
        continue;
      }
      if ((cor.get(dep) ?? 0) === 0) visita(dep, [...pilha, dep]);
    }
    cor.set(id, 2);
  }

  for (const id of porId.keys()) {
    if ((cor.get(id) ?? 0) === 0) visita(id, [id]);
  }
  return emCiclo;
}

/**
 * Nível = profundidade na ordem de dependência. Uma task fica no nível seguinte
 * ao mais alto de suas dependências, então tudo que está no mesmo nível pode
 * rodar em paralelo de verdade.
 *
 * Aresta que entra num nó em ciclo é ignorada no cálculo: sem isso a recursão
 * não termina. O ciclo continua desenhado — só não define profundidade, porque
 * num ciclo não existe "antes".
 */
function calcularNiveis(porId: Map<string, TaskDoGrafo>, emCiclo: Set<string>): Map<string, number> {
  const nivel = new Map<string, number>();

  function resolver(id: string, visitando: Set<string>): number {
    const pronto = nivel.get(id);
    if (pronto !== undefined) return pronto;
    // Guarda contra ciclo remanescente: sem ela uma aresta não detectada
    // reentraria aqui para sempre.
    if (visitando.has(id)) return 0;

    visitando.add(id);
    let maior = -1;
    for (const dep of porId.get(id)?.depende_de ?? []) {
      if (!porId.has(dep)) continue;
      if (emCiclo.has(dep) && emCiclo.has(id)) continue;
      maior = Math.max(maior, resolver(dep, visitando));
    }
    visitando.delete(id);

    const n = maior + 1;
    nivel.set(id, n);
    return n;
  }

  for (const id of porId.keys()) resolver(id, new Set());
  return nivel;
}

/**
 * O caminho crítico é a cadeia de dependências mais longa do trabalho — a
 * sequência que nenhum paralelismo encurta, e portanto o que de fato determina
 * a duração do plano.
 *
 * Calculado, não lido do ORQUESTRADOR: o campo `caminho_critico` do frontmatter
 * é o que a skill declarou, e o grafo existe justamente para conferir a
 * declaração contra a estrutura real das tasks.
 */
function calcularCaminhoCritico(
  porId: Map<string, TaskDoGrafo>,
  nivel: Map<string, number>,
  emCiclo: Set<string>,
): string[] {
  let fim: string | null = null;
  let maiorNivel = -1;

  // Desempate por id mantém a saída estável entre execuções — um SVG que muda
  // sozinho a cada render produz diff de ruído no PR.
  for (const id of [...porId.keys()].sort()) {
    if (emCiclo.has(id)) continue;
    const n = nivel.get(id) ?? 0;
    if (n > maiorNivel) {
      maiorNivel = n;
      fim = id;
    }
  }
  if (fim === null) return [];

  const caminho: string[] = [];
  let atual: string | null = fim;
  const vistos = new Set<string>();

  while (atual !== null && !vistos.has(atual)) {
    vistos.add(atual);
    caminho.unshift(atual);

    let anterior: string | null = null;
    let melhor = -1;
    for (const dep of [...(porId.get(atual)?.depende_de ?? [])].sort()) {
      if (!porId.has(dep) || emCiclo.has(dep)) continue;
      const n = nivel.get(dep) ?? 0;
      if (n > melhor) {
        melhor = n;
        anterior = dep;
      }
    }
    atual = anterior;
  }

  return caminho;
}

/** Uma dependência está aberta quando a task de que se depende não foi concluída. */
function temDependenciaAberta(task: TaskDoGrafo, porId: Map<string, TaskDoGrafo>): boolean {
  return task.depende_de.some((d) => {
    const alvo = porId.get(d);
    return alvo !== undefined && alvo.status !== "concluida";
  });
}

export function montarTopologia(trabalho: TrabalhoMontado): Topologia {
  return topologiaDeTasks(trabalho.trabalho_id, trabalho.titulo, tasksDe(trabalho));
}

/**
 * O núcleo: monta a topologia a partir das tasks, sem depender do tipo do
 * parser. É o que a tela do painel chama com as tasks vindas da API.
 */
export function topologiaDeTasks(
  trabalhoId: string,
  titulo: string,
  tasks: readonly (TaskDoGrafo & { sprint_id?: string })[],
): Topologia {
  const porId = new Map(tasks.map((t) => [t.id, t]));

  const emCiclo = detectarCiclos(porId);
  const nivel = calcularNiveis(porId, emCiclo);
  const caminhoCritico = calcularCaminhoCritico(porId, nivel, emCiclo);
  const noCritico = new Set(caminhoCritico);

  const nos: No[] = tasks.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    status: t.status,
    fase: t.fase,
    ...(t.sprint_id === undefined ? {} : { sprint_id: t.sprint_id }),
    paralelizavel: t.paralelizavel,
    nivel: nivel.get(t.id) ?? 0,
    critico: noCritico.has(t.id),
    em_ciclo: emCiclo.has(t.id),
    paralela_suspeita: t.paralelizavel && temDependenciaAberta(t, porId),
  }));

  const quebradas = new Set<string>();
  const arestas: Aresta[] = [];
  for (const t of tasks) {
    for (const dep of t.depende_de) {
      const existe = porId.has(dep);
      if (!existe) quebradas.add(dep);
      arestas.push({
        de: dep,
        para: t.id,
        // Crítica só quando os dois extremos são vizinhos no caminho crítico.
        critica:
          existe &&
          noCritico.has(dep) &&
          noCritico.has(t.id) &&
          caminhoCritico.indexOf(dep) === caminhoCritico.indexOf(t.id) - 1,
        quebrada: !existe,
      });
    }
  }

  const maior = nos.reduce((m, n) => Math.max(m, n.nivel), -1);
  const niveis: No[][] = [];

  // Dentro do nível, a ordem aproxima cada nó de suas dependências: a coluna
  // pretendida é a média das colunas de quem ele espera, no nível de cima.
  //
  // Ordenar só por id produzia aresta atravessando o desenho inteiro quando o
  // dependente cai numa coluna distante — o caminho crítico virava uma diagonal
  // ilegível justo no que mais importa ler. Empate desempata por id, o que
  // mantém a saída estável entre execuções.
  const coluna = new Map<string, number>();
  for (let i = 0; i <= maior; i++) {
    const doNivel = nos.filter((n) => n.nivel === i);

    const peso = (n: No): number => {
      const pais = n.id === undefined ? [] : (porId.get(n.id)?.depende_de ?? []);
      const colunas = pais
        .map((p) => coluna.get(p))
        .filter((c): c is number => c !== undefined);
      // Sem dependência posicionada, vai para o fim e se ordena por id.
      return colunas.length === 0
        ? Number.MAX_SAFE_INTEGER
        : colunas.reduce((s, c) => s + c, 0) / colunas.length;
    };

    const ordenado = doNivel.sort((a, b) => {
      const d = peso(a) - peso(b);
      return d !== 0 ? d : a.id.localeCompare(b.id);
    });

    ordenado.forEach((n, j) => coluna.set(n.id, j));
    niveis.push(ordenado);
  }

  return {
    trabalho_id: trabalhoId,
    titulo,
    nos,
    arestas,
    caminho_critico: caminhoCritico,
    niveis,
    dependencias_quebradas: [...quebradas].sort(),
  };
}
