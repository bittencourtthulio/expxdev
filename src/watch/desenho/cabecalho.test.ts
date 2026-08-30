import { describe, it, expect } from "vitest";
import { projetarVisao } from "../visao/projetar.js";
import { desenharCabecalho } from "./cabecalho.js";
import { criarPintor } from "./cor.js";
import { largura } from "./largura.js";

/**
 * T-02.05 — o cabeçalho.
 *
 * Todo o cabeçalho sai do `estado.json`, e só dele: `raio`, `orcamento_*`,
 * `branch` e `pr_estado` não existem em nenhum kind do `expx-schema`
 * (base/estado-json.md). No modo degradado essas linhas não podem ser
 * exibidas — é ausência de fonte, não escolha de implementação.
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;
const sem = criarPintor(false);

const NOVE = [
  "com-estado",
  "legado-raio-alto",
  "estado-invalido",
  "estado-versao-futura",
  "com-bloqueio",
  "concluido",
  "sem-trabalho",
  "sem-rastro",
  "varios-trabalhos",
];

describe("cabeçalho", () => {
  it("integração: desenha as nove fixtures em 80 colunas sem exceder a largura", () => {
    for (const f of NOVE) {
      const linhas = desenharCabecalho(projetarVisao(raiz(f)), 80, sem);
      for (const l of linhas) {
        expect(largura(l), `${f}: linha excede 80 -> ${l}`).toBeLessThanOrEqual(80);
      }
    }
  });

  it("funcional: em modo legado traz raio e orçamento; fora dele a linha não sai", () => {
    const legado = desenharCabecalho(projetarVisao(raiz("legado-raio-alto")), 80, sem).join("\n");
    expect(legado).toContain("alto");
    expect(legado).toContain("2/3");
    expect(legado).toContain("31/40");
    // branch e PR também vêm do estado.json
    expect(legado).toContain("fix/OC-2026-0142-calculo-frete");
    expect(legado).toContain("aberto");

    // com-estado tem raio null: nenhuma linha de legado
    const normal = desenharCabecalho(projetarVisao(raiz("com-estado")), 80, sem).join("\n");
    expect(normal).not.toContain("raio");
    expect(normal).toContain("exportacao-csv");
    expect(normal).toContain("sprintx");
  });

  it("funcional: no modo degradado a linha de legado não é emitida por falta de fonte", () => {
    const v = projetarVisao(raiz("estado-invalido"));
    expect(v.degradado).toBe(true);
    const texto = desenharCabecalho(v, 80, sem).join("\n");

    // sem estado.json não há raio, orçamento, branch nem PR — nenhum kind os declara
    expect(texto).not.toContain("raio");
    expect(texto).not.toContain("orcamento");
    expect(texto).not.toContain("branch");

    // mas o par concluídas/total continua, derivado do plano
    expect(texto).toContain("1/3");
  });

  it("funcional: sem trabalho nem estado, devolve a linha de nenhum trabalho aberto", () => {
    const linhas = desenharCabecalho(projetarVisao(raiz("sem-trabalho")), 80, sem);
    expect(linhas.length).toBeGreaterThan(0);
    expect(linhas.join("\n")).toContain("nenhum trabalho aberto");
  });

  it("funcional: em 60 colunas o título é cortado, não quebrado em duas linhas", () => {
    const largo = desenharCabecalho(projetarVisao(raiz("com-estado")), 80, sem);
    const estreito = desenharCabecalho(projetarVisao(raiz("com-estado")), 60, sem);

    for (const l of estreito) expect(largura(l)).toBeLessThanOrEqual(60);
    // cortar não pode inventar linha nova
    expect(estreito.length).toBe(largo.length);
  });
});
