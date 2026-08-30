/**
 * As sete skills do ecossistema Expx.
 *
 * Fonte única do que o CLI sabe instalar. `papel` é o texto mostrado na seleção
 * do `init`; `camada` marca as skills que, sozinhas, não fazem nada — elas
 * modificam o comportamento da sprintx/runx em vez de agir por conta própria
 * (ver `docs/expx-cli/base/08-repositorios-reais.md`).
 */

export type Skill = {
  nome: string;
  repositorio: string;
  papel: string;
  camada: boolean;
};

export const CATALOGO: readonly Skill[] = [
  {
    nome: "sprintx",
    repositorio: "https://github.com/bittencourtthulio/sprintx",
    papel: "planeja e executa features novas",
    camada: false,
  },
  {
    nome: "runx",
    repositorio: "https://github.com/bittencourtthulio/runx",
    papel: "ocorrencias de manutencao do dia a dia",
    camada: false,
  },
  {
    nome: "legadox",
    repositorio: "https://github.com/bittencourtthulio/legadox",
    papel: "camada para projetos legados",
    camada: true,
  },
  {
    nome: "stackx",
    repositorio: "https://github.com/bittencourtthulio/stackx",
    papel: "descobre o dialeto tecnico do repositorio",
    camada: true,
  },
  {
    nome: "mergex",
    repositorio: "https://github.com/bittencourtthulio/mergex",
    papel: "versionamento, entrega e revisao de pull requests",
    camada: false,
  },
  {
    nome: "memox",
    repositorio: "https://github.com/bittencourtthulio/MemoX",
    papel: "memoria do projeto, indexa os artefatos ja fechados",
    camada: true,
  },
  {
    nome: "prodx",
    repositorio: "https://github.com/bittencourtthulio/prodx",
    papel: "camada de produto, decide se o pedido vira trabalho",
    camada: true,
  },
] as const;

/** Os nomes na ordem em que a seleção do `init` os apresenta. */
export const NOMES: readonly string[] = CATALOGO.map((s) => s.nome);

export function buscarNoCatalogo(nome: string): Skill | undefined {
  return CATALOGO.find((s) => s.nome === nome);
}

/** Camada é skill que sozinha não faz nada: precisa de sprintx ou runx junto. */
export function ehCamada(nome: string): boolean {
  return buscarNoCatalogo(nome)?.camada ?? false;
}
