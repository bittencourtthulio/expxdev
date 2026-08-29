import { parseDocument, isMap, isSeq, type Node } from "yaml";

/**
 * Leitura do bloco de frontmatter com posição de linha.
 *
 * Por que não gray-matter aqui: ele devolve o YAML já desserializado, sem
 * posições, e a tela de conformidade precisa apontar arquivo E linha. Além
 * disso, gray-matter mantém um cache global indexado pelo conteúdo — na
 * segunda leitura da mesma string com YAML inválido ele deixa de lançar e
 * devolve `data: {}` em silêncio (ver 00-BLOQUEIOS.md, B-01). Usar o `yaml`
 * direto elimina os dois problemas de uma vez.
 */

export type FalhaLeitura =
  | { ok: false; tipo: "sem_frontmatter"; motivo: string; linha: number | null }
  | { ok: false; tipo: "yaml_invalido"; motivo: string; linha: number | null };

export type SucessoLeitura = {
  ok: true;
  dados: unknown;
  /** A prosa abaixo do frontmatter — o painel a exibe nos relatórios. */
  corpo: string;
  /** Caminho do campo → linha 1-based. Itens de lista viram `tasks.0`, `tasks.1`… */
  linhas: Map<string, number>;
};

export type ResultadoLeitura = SucessoLeitura | FalhaLeitura;

const DELIM = /^---\r?\n/;

/** Separa o bloco YAML do corpo, exigindo que ele seja a primeira coisa do arquivo (regra 1). */
function extrairBloco(conteudo: string): { yaml: string; corpo: string; offset: number } | null {
  // BOM é removido antes de qualquer coisa; preâmbulo, não (decisão D-25).
  const texto = conteudo.replace(/^﻿/, "");
  if (!DELIM.test(texto)) return null;
  const inicio = texto.indexOf("\n") + 1;
  const fim = texto.indexOf("\n---", inicio);
  if (fim === -1) return null;
  const depois = texto.indexOf("\n", fim + 1);
  return {
    yaml: texto.slice(inicio, fim),
    corpo: depois === -1 ? "" : texto.slice(depois + 1).replace(/^\s*\n/, ""),
    offset: 1,
  };
}

/** Linha 1-based de um offset de caractere dentro do bloco. */
function linhaDe(yaml: string, offset: number, base: number): number {
  let linha = base + 1;
  for (let i = 0; i < offset && i < yaml.length; i++) {
    if (yaml[i] === "\n") linha++;
  }
  return linha;
}

function mapearLinhas(no: Node | null, yaml: string, base: number, prefixo: string, destino: Map<string, number>): void {
  if (no === null || no === undefined) return;
  if (isMap(no)) {
    for (const par of no.items) {
      const chave = String((par.key as { value?: unknown })?.value ?? "");
      const caminho = prefixo ? `${prefixo}.${chave}` : chave;
      const range = (par.key as { range?: [number, number, number] })?.range;
      if (range) destino.set(caminho, linhaDe(yaml, range[0], base));
      mapearLinhas(par.value as Node | null, yaml, base, caminho, destino);
    }
    return;
  }
  if (isSeq(no)) {
    no.items.forEach((item, i) => {
      const caminho = `${prefixo}.${i}`;
      const range = (item as { range?: [number, number, number] })?.range;
      if (range) destino.set(caminho, linhaDe(yaml, range[0], base));
      mapearLinhas(item as Node | null, yaml, base, caminho, destino);
    });
  }
}

export function lerFrontmatter(conteudo: string): ResultadoLeitura {
  const bloco = extrairBloco(conteudo);
  if (bloco === null) {
    return {
      ok: false,
      tipo: "sem_frontmatter",
      motivo: "o bloco YAML precisa ser a primeira coisa do arquivo, entre linhas ---",
      linha: null,
    };
  }

  const doc = parseDocument(bloco.yaml, { keepSourceTokens: true });
  if (doc.errors.length > 0) {
    const erro = doc.errors[0];
    return {
      ok: false,
      tipo: "yaml_invalido",
      motivo: erro?.message ?? "YAML invalido",
      linha: erro?.linePos?.[0]?.line != null ? erro.linePos[0].line + bloco.offset : null,
    };
  }

  const linhas = new Map<string, number>();
  mapearLinhas(doc.contents as Node | null, bloco.yaml, bloco.offset, "", linhas);

  return { ok: true, dados: doc.toJS(), corpo: bloco.corpo, linhas };
}
