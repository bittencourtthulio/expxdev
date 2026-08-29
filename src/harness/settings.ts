import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { NOME_DO_MARKETPLACE, NOME_DO_PLUGIN } from "../plugin/manifestos.js";
import { fazerBackup } from "./backup.js";

/**
 * Merge do `.claude/settings.json` — o ponto mais fácil de errar.
 *
 * Regras: faz backup antes de tocar, mescla APENAS as chaves necessárias,
 * preserva todo o resto, e nunca sobrescreve o arquivo inteiro. JSON inválido
 * não é consertado: avisa e sai.
 *
 * Duas formas de `enabledPlugins` circulam: a documentação mostra um array
 * (`["p@m"]`), e o arquivo que o Claude Code realmente escreve usa um objeto
 * (`{"p@m": true}`) — medido em
 * `docs/expx-cli/base/09-validacao-marketplace-local.md`. Ler as duas e
 * escrever a segunda evita corromper o arquivo do usuário.
 *
 * ATENÇÃO: escrever estas chaves NÃO instala o plugin. Foi testado: cinco
 * sintaxes em `settings.json` de projeto e nenhuma carregou. A instalação de
 * fato é feita pelo `claude plugin install` (ver `src/harness/instalar.ts`).
 */

export type ResultadoMerge =
  | { ok: true; criado: boolean; backup?: string }
  | { ok: false; erro: string };

export type Habilitados = Record<string, boolean>;

/** Aceita array (documentado) ou objeto (real). Qualquer outra coisa vira `{}`. */
export function lerPluginsHabilitados(valor: unknown): Habilitados {
  if (Array.isArray(valor)) {
    const saida: Habilitados = {};
    for (const item of valor) if (typeof item === "string") saida[item] = true;
    return saida;
  }
  if (typeof valor === "object" && valor !== null) {
    const saida: Habilitados = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      if (typeof v === "boolean") saida[k] = v;
    }
    return saida;
  }
  return {};
}

export function caminhoDoSettings(raizProjeto: string): string {
  return join(raizProjeto, ".claude", "settings.json");
}

/**
 * Acrescenta o marketplace local e habilita o plugin, preservando o resto.
 *
 * `caminhoMarketplace` é absoluto de propósito: é o que o `claude plugin
 * marketplace add` grava, e um caminho relativo não é resolvido aqui.
 */
export function mesclarSettings(raizProjeto: string, caminhoMarketplace: string): ResultadoMerge {
  const caminho = caminhoDoSettings(raizProjeto);
  const existe = existsSync(caminho);

  let atual: Record<string, unknown> = {};
  let backup: string | undefined;

  if (existe) {
    try {
      atual = JSON.parse(readFileSync(caminho, "utf8")) as Record<string, unknown>;
    } catch (e: unknown) {
      return {
        ok: false,
        erro: `${caminho} nao e JSON valido e nao sera alterado: ${String(e)}`,
      };
    }
    if (typeof atual !== "object" || atual === null || Array.isArray(atual)) {
      return { ok: false, erro: `${caminho} nao contem um objeto JSON` };
    }
    backup = fazerBackup(caminho);
  }

  const marketplaces = {
    ...((atual["extraKnownMarketplaces"] as Record<string, unknown> | undefined) ?? {}),
    [NOME_DO_MARKETPLACE]: { source: { source: "directory", path: caminhoMarketplace } },
  };
  const habilitados: Habilitados = {
    ...lerPluginsHabilitados(atual["enabledPlugins"]),
    [`${NOME_DO_PLUGIN}@${NOME_DO_MARKETPLACE}`]: true,
  };

  const novo = { ...atual, extraKnownMarketplaces: marketplaces, enabledPlugins: habilitados };
  mkdirSync(join(caminho, ".."), { recursive: true });
  writeFileSync(caminho, `${JSON.stringify(novo, null, 2)}\n`);

  return backup === undefined ? { ok: true, criado: !existe } : { ok: true, criado: !existe, backup };
}
