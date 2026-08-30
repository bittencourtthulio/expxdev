import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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

/**
 * O núcleo compartilhado (`nucleo/hooks/`), distribuído por CÓPIA.
 *
 * Cópia, e não dependência, porque cada projeto precisa rodar sozinho: nenhum
 * repositório de skill tem `package.json`, então não há como depender do
 * `expxdev` por npm. A fonte é uma só; o que chega ao projeto é um arquivo.
 *
 * Resolvido a partir do `dist/` em execução — daí o `../..`.
 */
function raizDoNucleo(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..", "nucleo");
}

/** Monta só o plugin, em `destino`. */
export function montarPlugin(
  destino: string,
  skills: readonly SkillMontavel[],
  versao: string,
): void {
  mkdirSync(join(destino, ".claude-plugin"), { recursive: true });
  mkdirSync(join(destino, "skills"), { recursive: true });
  mkdirSync(join(destino, "commands"), { recursive: true });

  // O núcleo viaja com o plugin. Ausente (checkout parcial, empacotamento sem
  // a pasta), a montagem segue: as skills têm a própria cópia em disco e o
  // projeto continua funcionando — falha aberta, como todo hook.
  const nucleo = raizDoNucleo();
  if (existsSync(nucleo)) {
    cpSync(nucleo, join(destino, "nucleo"), { recursive: true });
  }

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
