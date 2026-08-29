import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { montarPluginJson, montarMarketplaceJson, ORIGEM_DO_PLUGIN } from "./manifestos.js";

/**
 * Monta a árvore do plugin local com as skills selecionadas.
 *
 * A estrutura respeita a regra da documentação de que apenas `plugin.json` fica
 * dentro de `.claude-plugin/`; `skills/` e `commands/` ficam na raiz do plugin.
 */

export type SkillMontavel = {
  nome: string;
  /** Pasta que contém o `SKILL.md`, já normalizada pelo detector de layout. */
  raizSkill: string;
  /** Arquivos de comando da skill, no repositório de origem. */
  comandos: readonly string[];
};

/** Monta só o plugin, em `destino`. */
export function montarPlugin(
  destino: string,
  skills: readonly SkillMontavel[],
  versao: string,
): void {
  mkdirSync(join(destino, ".claude-plugin"), { recursive: true });
  mkdirSync(join(destino, "skills"), { recursive: true });
  mkdirSync(join(destino, "commands"), { recursive: true });

  writeFileSync(
    join(destino, ".claude-plugin", "plugin.json"),
    `${JSON.stringify(montarPluginJson(versao), null, 2)}\n`,
  );

  for (const s of skills) {
    // O nome da pasta tem que continuar igual ao `name` do frontmatter: o
    // OpenCode exige isso para descobrir a skill.
    cpSync(s.raizSkill, join(destino, "skills", s.nome), { recursive: true });
    for (const c of s.comandos) {
      cpSync(c, join(destino, "commands", basename(c)));
    }
  }
}

/**
 * Monta marketplace e plugin, com o plugin DENTRO do marketplace.
 *
 * A hierarquia não é estética: um `source` relativo que sobe de diretório é
 * rejeitado na instalação (ver `manifestos.ts`).
 */
export function montarMarketplace(
  raizMarketplace: string,
  skills: readonly SkillMontavel[],
  versao: string,
): void {
  mkdirSync(join(raizMarketplace, ".claude-plugin"), { recursive: true });
  writeFileSync(
    join(raizMarketplace, ".claude-plugin", "marketplace.json"),
    `${JSON.stringify(montarMarketplaceJson(), null, 2)}\n`,
  );
  montarPlugin(join(raizMarketplace, ORIGEM_DO_PLUGIN), skills, versao);
}
