import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  /**
   * Arquivos de hook da skill, no repositório de origem. Opcional de propósito:
   * `montagem.test.ts` e `opencode.test.ts` constroem este objeto por literal, e
   * o `tsconfig` exclui `**\/*.test.ts` — um campo obrigatório não seria
   * acusado pelo typecheck e quebraria só em runtime.
   */
  hooks?: readonly string[];
  /**
   * A pasta `.claude/hooks/` do repositório da skill, inteira. Ver
   * `montarHooks`: é ela que carrega os hooks de verdade.
   */
  arvoreHooks?: string;
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

/** O `hooks.json` de um plugin, no formato que o Claude Code carrega. */
type ManifestoHooks = { hooks: Record<string, unknown[]> };

/**
 * Leva os hooks das skills para dentro do plugin e consolida o `hooks.json`.
 *
 * ## Por que isto existe
 *
 * O plugin montado tinha `skills/`, `commands/` e `nucleo/` — e nenhum hook.
 * Como todo caminho de erro do rastro é falha aberta (regra 3 do contrato
 * `expx-eventos`), nada avisava: `docs/eventos/` nunca era escrito, e o painel
 * e o `expx watch` ficavam sem a seção de eventos e sem o rodapé de atividade.
 * O sintoma que chega à pessoa é uma tela parada.
 *
 * ## Como o Claude Code carrega isto
 *
 * `hooks/hooks.json` na raiz do plugin, detectado automaticamente quando o
 * plugin está habilitado — não precisa ser declarado no `plugin.json`. Os
 * comandos usam `${CLAUDE_PLUGIN_ROOT}`, que resolve para a pasta do plugin
 * instalado, e é por isso que a ÁRVORE toda precisa viajar: o despachante
 * chama `comum/rastro`, `runx/escopo-da-ocorrencia` e afins por caminho
 * relativo, e um arquivo solto não resolveria nenhum deles.
 *
 * ## Conflito entre skills
 *
 * Cada skill traz o seu `hooks.json` e todas caem na mesma pasta. Os arquivos
 * são copiados sob o namespace que a própria skill já usa (`comum/`, `runx/`,
 * `sprintx/`), então a colisão real seria duas skills com o mesmo caminho —
 * que é o `comum/` compartilhado, e nesse caso são o mesmo arquivo por
 * construção. Os eventos são concatenados: dois `PostToolUse` de skills
 * diferentes viram duas entradas, e o Claude Code roda as duas.
 */
function montarHooks(destino: string, skills: readonly SkillMontavel[]): void {
  const comArvore = skills.filter((s) => s.arvoreHooks !== undefined && existsSync(s.arvoreHooks));
  if (comArvore.length === 0) return;

  const dirHooks = join(destino, "hooks");
  mkdirSync(dirHooks, { recursive: true });

  const consolidado: ManifestoHooks = { hooks: {} };

  for (const s of comArvore) {
    // O `hooks.json` de cada skill é consolidado, não copiado: dois arquivos
    // com o mesmo nome se sobrescreveriam e a última skill venceria em
    // silêncio, desligando os hooks de todas as outras.
    cpSync(s.arvoreHooks as string, dirHooks, {
      recursive: true,
      filter: (origem) => basename(origem) !== "hooks.json",
    });

    const manifesto = join(s.arvoreHooks as string, "hooks.json");
    if (!existsSync(manifesto)) continue;
    let lido: ManifestoHooks;
    try {
      lido = JSON.parse(readFileSync(manifesto, "utf8")) as ManifestoHooks;
    } catch {
      continue; // hooks.json quebrado não derruba a instalação inteira
    }
    for (const [evento, grupos] of Object.entries(lido.hooks ?? {})) {
      if (!Array.isArray(grupos)) continue;
      consolidado.hooks[evento] = [...(consolidado.hooks[evento] ?? []), ...grupos];
    }
  }

  if (Object.keys(consolidado.hooks).length > 0) {
    writeFileSync(join(dirHooks, "hooks.json"), `${JSON.stringify(consolidado, null, 2)}\n`);
  }
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

  // Sem isto o plugin sobe sem hook nenhum e o rastro nunca é escrito.
  montarHooks(destino, skills);
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
