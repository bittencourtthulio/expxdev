import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { lerEstado } from "../servidor/estado.js";
import { montarTopologia, type Topologia } from "./topologia.js";
import { renderizarSvg } from "./svg.js";

/**
 * Costura a leitura do projeto, a topologia e o SVG, e grava o artefato ao lado
 * do plano que ele descreve.
 *
 * O grafo mora em `docs/<trabalho_id>/GRAFO.svg` — junto do `ORQUESTRADOR.md`,
 * não numa pasta de build. A razão é a mesma que faz o método gravar tudo em
 * `docs/`: o artefato viaja no PR, e o revisor o abre sem subir nada.
 */

export const NOME_ARQUIVO = "GRAFO.svg";

export type GrafoGerado = {
  trabalho_id: string;
  /** Caminho relativo à raiz do projeto (regra R10 — nunca absoluto). */
  arquivo: string;
  tasks: number;
  niveis: number;
  caminho_critico: number;
  dependencias_quebradas: string[];
  em_ciclo: number;
};

/**
 * Pastas cujo conteúdo é material de teste, não trabalho do projeto.
 *
 * O parser as lê de propósito — o painel serve fixtures nos próprios testes —
 * mas o `grafo` ESCREVE, e gravar um SVG dentro de `fixtures/` sujaria o diff
 * com artefato de plano inventado. Quem quiser o grafo de uma fixture pede pelo
 * id; o que este filtro corta é só a varredura sem argumento.
 */
const PASTAS_DE_TESTE = new Set(["fixtures", "__fixtures__", "testes", "test", "tests"]);

function ehMaterialDeTeste(pasta: string, raiz: string): boolean {
  return relative(raiz, pasta)
    .split(sep)
    .some((p) => PASTAS_DE_TESTE.has(p));
}

export type OpcoesGerar = {
  raiz: string;
  /** Sem filtro, gera para todo trabalho que tenha ao menos uma task. */
  trabalho?: string;
  /** Calcula e devolve sem tocar o disco — o que o `--conferir` usa. */
  simular?: boolean;
  hoje?: Date;
};

export type ResultadoGerar = {
  gerados: GrafoGerado[];
  /** Trabalhos ignorados por não terem task nenhuma, com o motivo. */
  ignorados: { trabalho_id: string; motivo: string }[];
};

function resumir(topo: Topologia, arquivo: string): GrafoGerado {
  return {
    trabalho_id: topo.trabalho_id,
    arquivo,
    tasks: topo.nos.length,
    niveis: topo.niveis.length,
    caminho_critico: topo.caminho_critico.length,
    dependencias_quebradas: topo.dependencias_quebradas,
    em_ciclo: topo.nos.filter((n) => n.em_ciclo).length,
  };
}

export function gerarGrafos(op: OpcoesGerar): ResultadoGerar {
  const agora = op.hoje ?? new Date();
  const estado = lerEstado({ raiz: op.raiz, diasBloqueio: 7 }, agora);

  const gerados: GrafoGerado[] = [];
  const ignorados: { trabalho_id: string; motivo: string }[] = [];

  for (const trabalho of estado.trabalhos) {
    if (op.trabalho !== undefined && trabalho.trabalho_id !== op.trabalho) continue;

    // Material de teste só entra quando pedido pelo id, nunca na varredura.
    if (op.trabalho === undefined && ehMaterialDeTeste(trabalho.pasta, op.raiz)) continue;

    // Um trabalho descoberto em branch tem `pasta` virtual (`branch::caminho`);
    // gravar nele escreveria fora do checkout. Grafo só para o que está em disco.
    if (trabalho.branch !== null) {
      ignorados.push({
        trabalho_id: trabalho.trabalho_id,
        motivo: `descoberto na branch ${trabalho.branch}, fora do checkout ativo`,
      });
      continue;
    }

    const topo = montarTopologia(trabalho);
    if (topo.nos.length === 0) {
      ignorados.push({ trabalho_id: trabalho.trabalho_id, motivo: "nenhuma task no plano" });
      continue;
    }

    // `trabalho.pasta` é absoluta (a varredura parte da raiz). O artefato
    // grava no caminho absoluto, mas o que se reporta é o relativo — regra R10:
    // nenhum caminho absoluto em valor nenhum, porque vaza o nome de usuário.
    const destino = join(trabalho.pasta, NOME_ARQUIVO);
    const relativo = relative(op.raiz, destino);
    if (op.simular !== true) {
      mkdirSync(dirname(destino), { recursive: true });
      writeFileSync(
        destino,
        renderizarSvg(topo, { gerado_em: agora.toISOString().slice(0, 10) }),
        "utf8",
      );
    }

    gerados.push(resumir(topo, relativo));
  }

  return { gerados, ignorados };
}
