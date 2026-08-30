/**
 * Contrato de linha de comando do `expx watch`.
 *
 * Segue o padrão de `src/cli/argumentos.ts`: interpretar devolve `ok` ou um
 * erro em texto, e nunca lança. A diferença é o argumento posicional, que o
 * painel não tem.
 */

export type Opcoes = {
  /** `expx watch <trabalho_id>` — segue um trabalho específico. */
  trabalho: string | undefined;
  /** `--todos` — lista os trabalhos abertos, um por linha, sem a árvore. */
  todos: boolean;
  /** `--arvore` — mostra a árvore completa do trabalho corrente. */
  arvore: boolean;
  ajuda: boolean;
  /** Largura fixa, para teste e para quem quer saída estável. */
  colunas: number | undefined;
};

export type Resultado = { ok: true; opcoes: Opcoes } | { ok: false; erro: string };

const AJUDA = `
expx watch — painel dos trabalhos no terminal, ao vivo (somente leitura)

  expx watch                 painel de todos os trabalhos abertos, com barra de
                             progresso, task em execucao e atividade recente
  expx watch <trabalho_id>   destaca um trabalho como o corrente, no topo
  expx watch --todos         uma linha por trabalho, sem detalhe

  --arvore                   acrescenta a arvore completa (sprints, fases, tasks)

  --colunas <n>              largura fixa, em vez da largura do terminal
  --ajuda                    mostra esta ajuda

Sai com Ctrl+C, devolvendo o terminal ao estado anterior.
O watch nunca escreve nos arquivos do projeto.
`.trim();

export function ajudaWatch(): string {
  return AJUDA;
}

export function interpretarOpcoes(argv: readonly string[]): Resultado {
  const opcoes: Opcoes = {
    trabalho: undefined,
    todos: false,
    arvore: false,
    ajuda: false,
    colunas: undefined,
  };

  const posicionais: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const bruto = argv[i] ?? "";
    const [nome, embutido] = bruto.includes("=")
      ? [bruto.slice(0, bruto.indexOf("=")), bruto.slice(bruto.indexOf("=") + 1)]
      : [bruto, undefined];

    switch (nome) {
      case "--todos":
        opcoes.todos = true;
        break;
      case "--arvore":
        opcoes.arvore = true;
        break;
      case "--colunas": {
        const v = embutido ?? argv[++i];
        const n = Number(v);
        if (v === undefined || !Number.isInteger(n) || n <= 0) {
          return { ok: false, erro: `--colunas exige um numero inteiro positivo` };
        }
        opcoes.colunas = n;
        break;
      }
      case "--ajuda":
      case "--help":
      case "-h":
        opcoes.ajuda = true;
        break;
      default:
        if (nome.startsWith("-")) {
          return { ok: false, erro: `opcao desconhecida: ${nome}` };
        }
        posicionais.push(nome);
    }
  }

  // Dois trabalhos é engano, e o último vencendo em silêncio esconderia o
  // engano até a pessoa reparar que está olhando o trabalho errado.
  if (posicionais.length > 1) {
    return { ok: false, erro: `informe um trabalho por vez: ${posicionais.join(", ")}` };
  }
  opcoes.trabalho = posicionais[0];

  if (opcoes.trabalho !== undefined && opcoes.todos) {
    return { ok: false, erro: "--todos lista todos os trabalhos: nao combine com um trabalho nomeado" };
  }

  return { ok: true, opcoes };
}
