import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lerLock } from "../nucleo/lock.js";
import { verificarCaminhos } from "../nucleo/caminhos.js";
import { expxNoGitignore } from "../cli/projeto.js";
import { verificarModificacaoLocal, pastaDaSkill } from "../update/modificacao.js";
import { MarketplaceJson, PluginJson, ORIGEM_DO_PLUGIN, NOME_DO_PLUGIN, NOME_DO_MARKETPLACE } from "../plugin/manifestos.js";
import { lerPluginsHabilitados, caminhoDoSettings } from "../harness/settings.js";

/**
 * Diagnóstico de instalação quebrada.
 *
 * Cada achado traz a correção sugerida, porque um diagnóstico que só diz "está
 * errado" transfere o trabalho de volta para quem pediu ajuda.
 *
 * `erro` impede o funcionamento; `aviso` é situação legítima que a pessoa
 * precisa saber (modificação local, skill não travada em versão publicada).
 */

export type Severidade = "erro" | "aviso";

export type Achado = {
  id: string;
  severidade: Severidade;
  problema: string;
  correcao: string;
};

export type Diagnostico = {
  saudavel: boolean;
  achados: Achado[];
};

function lerJson(caminho: string): unknown | undefined {
  if (!existsSync(caminho)) return undefined;
  try {
    return JSON.parse(readFileSync(caminho, "utf8"));
  } catch {
    return undefined;
  }
}

export function diagnosticar(raiz: string): Diagnostico {
  const achados: Achado[] = [];
  const push = (a: Achado): void => {
    achados.push(a);
  };

  // O .gitignore é verificado ANTES de exigir o .expx/: um .gitignore que
  // ignora .expx/ é justamente a causa provável de ele não estar ali para quem
  // clonou o repositório. Sair cedo esconderia o defeito que explica o resto.
  if (expxNoGitignore(raiz)) {
    push({
      id: "gitignore-ignora-expx",
      severidade: "erro",
      problema: "o .gitignore esta ignorando .expx/, que precisa ser commitado",
      correcao: "remova a linha .expx do .gitignore: quem clona o projeto depende dela",
    });
  }

  if (!existsSync(join(raiz, ".expx"))) {
    push({
      id: "sem-expx",
      severidade: "erro",
      problema: "este projeto nao tem .expx/",
      correcao: "rode `expx init` para instalar as skills neste projeto",
    });
    return { saudavel: false, achados };
  }

  const l = lerLock(raiz);
  if (!l.ok) {
    push({
      id: "lock-ilegivel",
      severidade: "erro",
      problema: `o lock nao pode ser lido: ${l.erro}`,
      correcao: "rode `expx init` para reconstruir a instalacao",
    });
    return { saudavel: false, achados };
  }
  if (l.incompativel) {
    push({
      id: "lock-futuro",
      severidade: "erro",
      problema: "o .expx/ foi criado por uma versao MAIS NOVA deste CLI",
      correcao: "atualize o CLI (`npx expxdev@latest`) antes de operar este projeto",
    });
  }

  const raizPlugin = join(raiz, ".expx", "marketplace", ORIGEM_DO_PLUGIN);
  const pj = PluginJson.safeParse(lerJson(join(raizPlugin, ".claude-plugin", "plugin.json")));
  if (!pj.success) {
    push({
      id: "plugin-json-invalido",
      severidade: "erro",
      problema: `plugin.json ausente ou fora do formato (esperado name "${NOME_DO_PLUGIN}")`,
      correcao: "rode `expx init` para remontar o plugin",
    });
  }
  const mj = MarketplaceJson.safeParse(
    lerJson(join(raiz, ".expx", "marketplace", ".claude-plugin", "marketplace.json")),
  );
  if (!mj.success) {
    push({
      id: "marketplace-json-invalido",
      severidade: "erro",
      problema: `marketplace.json ausente ou fora do formato (esperado name "${NOME_DO_MARKETPLACE}")`,
      correcao: "rode `expx init` para remontar o marketplace",
    });
  }

  for (const [nome, travada] of Object.entries(l.lock.skills)) {
    const pasta = pastaDaSkill(raiz, nome);
    if (!existsSync(pasta)) {
      push({
        id: "skill-ausente",
        severidade: "erro",
        problema: `${nome} esta no lock mas nao esta em disco`,
        correcao: `rode \`expx init\` ou \`expx add ${nome}\` para reinstalar`,
      });
      continue;
    }

    const fora = verificarCaminhos(pasta);
    if (fora.length > 0) {
      const amostra = fora.slice(0, 3).map((a) => `${a.arquivo}:${String(a.linha)} → ${a.referencia}`);
      push({
        id: "caminho-fora",
        severidade: "erro",
        problema: `${nome} referencia caminho fora da propria pasta: ${amostra.join("; ")}`,
        correcao: "o plugin e copiado para o cache e esse caminho nao resolve la: reporte no repositorio da skill",
      });
    }

    const mod = verificarModificacaoLocal(raiz, nome);
    if (mod.temModificacao) {
      const lista = [...mod.alterados, ...mod.removidos, ...mod.novos].slice(0, 5);
      push({
        id: "modificacao-local",
        severidade: "aviso",
        problema: `${nome} foi modificada localmente: ${lista.join(", ")}`,
        correcao: "o update nao vai sobrescrever; decida manter, substituir ou salvar ao lado",
      });
    }

    if (!travada.travado) {
      push({
        id: "skill-nao-travada",
        severidade: "aviso",
        problema: `${nome} nao esta travada em versao publicada (segue a branch ${travada.referencia})`,
        correcao: "quando o repositorio publicar uma tag, rode `expx update` para travar",
      });
    }
  }

  if (l.lock.harness.includes("claude")) {
    const s = lerJson(caminhoDoSettings(raiz));
    if (s === undefined) {
      push({
        id: "settings-ausente",
        severidade: "erro",
        problema: ".claude/settings.json ausente ou invalido",
        correcao: "rode `expx init` para reescrever a configuracao do harness",
      });
    } else {
      const d = s as Record<string, unknown>;
      const habilitados = lerPluginsHabilitados(d["enabledPlugins"]);
      if (habilitados[`${NOME_DO_PLUGIN}@${NOME_DO_MARKETPLACE}`] !== true) {
        push({
          id: "plugin-nao-habilitado",
          severidade: "erro",
          problema: "o plugin expx nao esta habilitado no .claude/settings.json",
          correcao: "rode `expx init` para habilitar",
        });
      }
    }
  }

  const skillsClaude = join(raiz, ".claude", "skills");
  const skillsOpen = join(raiz, ".opencode", "skills");
  for (const nome of Object.keys(l.lock.skills)) {
    if (existsSync(join(skillsClaude, nome)) && existsSync(join(skillsOpen, nome))) {
      push({
        id: "colisao-de-nome",
        severidade: "erro",
        problema: `${nome} existe em .claude/skills e em .opencode/skills, e o OpenCode le os dois`,
        correcao: "remova a copia em .opencode/skills: o OpenCode le .claude/skills nativamente",
      });
    }
  }

  return { saudavel: achados.filter((a) => a.severidade === "erro").length === 0, achados };
}
