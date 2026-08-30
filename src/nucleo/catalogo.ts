import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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

/**
 * As pastas em que uma skill pode estar, dentro da raiz de desenvolvimento.
 *
 * Os repositórios reais não seguem uma capitalização só (`RunX`, `MemoX`,
 * `SprintX`, mas `Legadox` e `ProdX`), e o macOS não diferencia maiúscula de
 * minúscula enquanto o Linux diferencia. Tentar as variações torna o override
 * previsível nos dois sistemas.
 */
function candidatasLocais(nome: string): string[] {
  const capitalizado = nome.charAt(0).toUpperCase() + nome.slice(1);
  const camelX = capitalizado.replace(/x$/, "X");
  return [...new Set([nome, capitalizado, camelX])];
}

/**
 * A raiz onde procurar clones locais das skills, quando definida.
 *
 * Serve ao desenvolvimento das próprias skills: sem isto, testar uma alteração
 * num projeto real exige commitar e publicar a cada tentativa, porque o `init`
 * só sabe clonar do GitHub.
 *
 *     EXPX_SKILLS_LOCAIS=~/Documents/Projetos npx expxdev init --skills runx --yes
 *
 * Não é um caminho de código novo na busca: `git clone` aceita caminho de
 * sistema de arquivos como origem, então a skill local percorre exatamente o
 * mesmo fluxo da remota — mesmo clone, mesmo commit registrado no lock, mesma
 * montagem. O que muda é só a origem.
 */
function raizLocal(): string | undefined {
  const v = process.env["EXPX_SKILLS_LOCAIS"];
  return v === undefined || v.trim() === "" ? undefined : v.trim();
}

export function buscarNoCatalogo(nome: string): Skill | undefined {
  const s = CATALOGO.find((x) => x.nome === nome);
  if (s === undefined) return undefined;

  const raiz = raizLocal();
  if (raiz === undefined) return s;

  // A pasta é procurada na LISTAGEM, e não com `statSync` em cada candidata:
  // no macOS, que não diferencia maiúscula de minúscula, `statSync("runx")`
  // encontra a pasta `RunX` e devolveria um caminho com a grafia errada — que
  // funciona no mac e quebra no Linux, o pior dos dois mundos.
  let entradas: string[];
  try {
    entradas = readdirSync(raiz);
  } catch {
    return s; // raiz local inexistente: segue pelo GitHub
  }

  // Pasta ausente cai de volta para o GitHub em vez de falhar: a raiz local
  // costuma ter só as skills em que se está mexendo, e uma origem inexistente
  // produziria erro de clone — que se leria como falha de rede, escondendo a
  // causa real.
  for (const c of candidatasLocais(nome)) {
    if (!entradas.includes(c)) continue;
    const caminho = join(raiz, c);
    try {
      if (statSync(caminho).isDirectory()) return { ...s, repositorio: caminho };
    } catch {
      continue;
    }
  }
  return s;
}

/** Camada é skill que sozinha não faz nada: precisa de sprintx ou runx junto. */
export function ehCamada(nome: string): boolean {
  return buscarNoCatalogo(nome)?.camada ?? false;
}
