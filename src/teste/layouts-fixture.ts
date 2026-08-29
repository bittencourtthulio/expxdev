import { criarRepoSkill } from "./repo-fixture.js";

/**
 * O trio de repositórios que a suíte usa para exercitar layout e versão.
 *
 * Os repositórios reais têm dois layouts distintos e nenhuma tag (ver
 * `base/08-repositorios-reais.md`). O trio cobre os dois layouts e o caso sem
 * tag, que hoje é o de TODAS as skills reais.
 */
export type Trio = {
  /** Layout do sprintx/stackx/mergex: `.claude/skills/<nome>/`. */
  embutido: string;
  /** Layout do runx/legadox: `skill/` na raiz. */
  plano: string;
  /** Repositório sem nenhuma tag — o caso real de hoje. */
  semTag: string;
};

export function criarTrioDeLayouts(): Trio {
  return {
    embutido: criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0", "v1.2.0"], layout: "embutido" }),
    plano: criarRepoSkill({ nome: "runx", tags: ["v0.9.0"], layout: "plano" }),
    semTag: criarRepoSkill({ nome: "stackx", tags: [], layout: "embutido" }),
  };
}
