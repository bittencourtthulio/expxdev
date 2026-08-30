import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { lerLock } from "../nucleo/lock.js";
import { validarRastro } from "../parser/esquema/evento.js";
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

  verificarHooks(raiz, push);
  verificarRastro(raiz, push);

  return { saudavel: achados.filter((a) => a.severidade === "erro").length === 0, achados };
}

/**
 * O rastro de eventos obedece ao contrato `expx-eventos`?
 *
 * Aviso, nunca erro: rastro malformado não impede o método de funcionar, e um
 * `doctor` que reprova a instalação por causa de linha antiga em disco é um
 * doctor que as pessoas param de rodar. As quatro skills que escrevem o rastro
 * têm implementações independentes — é justamente onde a divergência aparece.
 */
function verificarRastro(raiz: string, push: (a: Achado) => void): void {
  const dir = join(raiz, "docs", "eventos");
  if (!existsSync(dir)) return;

  let arquivos: string[];
  try {
    arquivos = readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
  } catch {
    return;
  }

  for (const nome of arquivos) {
    let conteudo: string;
    try {
      conteudo = readFileSync(join(dir, nome), "utf8");
    } catch {
      continue;
    }
    const r = validarRastro(conteudo);

    if (r.defeitos.length > 0) {
      const primeiro = r.defeitos[0];
      const resto = r.defeitos.length - 1;
      push({
        id: "rastro-fora-do-contrato",
        severidade: "aviso",
        problema:
          `docs/eventos/${nome}: ${r.defeitos.length} de ${r.linhas} linhas fora do ` +
          `contrato expx-eventos (L${primeiro?.linha}: ${primeiro?.motivo}` +
          `${resto > 0 ? `, e mais ${resto}` : ""})`,
        correcao:
          "o rastro e append-only e nao se edita a mao: corrija quem grava (o hook da skill) " +
          "e deixe as linhas antigas onde estao",
      });
    }

    if (r.desconhecidas.length > 0) {
      push({
        id: "rastro-chave-nao-declarada",
        severidade: "aviso",
        problema: `docs/eventos/${nome}: chaves fora do contrato: ${r.desconhecidas.join(", ")}`,
        correcao:
          "chave extra e permitida, mas precisa ser declarada em CONTRATO-expx-eventos.md " +
          "e vir depois das doze obrigatorias",
      });
    }
  }
}

/**
 * Hook instalado sem o motor ao lado.
 *
 * Todo caminho de erro dos hooks do memox termina em `exit 0`, de propósito:
 * falha aberta nunca trava o prompt de quem está trabalhando. O preço é que
 * uma instalação quebrada fica indistinguível de um projeto sem artefatos —
 * silêncio dos dois lados. Este verificador é o único lugar onde a diferença
 * aparece (decisão D-17).
 *
 * O caminho conferido é exatamente o que o hook resolve por conta própria:
 * `DIR_HOOK/../skills/<skill>/assets/`.
 */
function verificarHooks(raiz: string, push: (a: Achado) => void): void {
  const dirHooks = join(raiz, ".claude", "hooks");
  if (!existsSync(dirHooks)) return;

  let arquivos: string[];
  try {
    arquivos = readdirSync(dirHooks);
  } catch {
    return;
  }

  // uma entrada por skill dona de hook, para não repetir o achado por arquivo
  const skills = new Set(
    arquivos
      .filter((a) => a.endsWith(".sh"))
      .map((a) => a.split("-")[0] ?? "")
      .filter((n) => n !== ""),
  );

  for (const skill of skills) {
    const motor = join(raiz, ".claude", "skills", skill, "assets");
    if (existsSync(motor)) continue;
    push({
      id: `${skill}-sem-motor`,
      severidade: "erro",
      problema:
        `o hook de ${skill} esta em .claude/hooks mas o motor nao esta em ` +
        `.claude/skills/${skill}/assets: o hook sai 0 em silencio e nao faz nada`,
      correcao: `rode \`expx init\` incluindo ${skill}: o hook e a skill precisam ser instalados juntos`,
    });
  }
}