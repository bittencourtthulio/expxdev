import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CATALOGO } from "../nucleo/catalogo.js";
import { resolverAlvo } from "../nucleo/versao.js";
import { buscarSkill } from "../nucleo/busca.js";
import { detectarLayout } from "../nucleo/layout.js";
import { verificarCaminhos } from "../nucleo/caminhos.js";
import { hashearPasta } from "../nucleo/integridade.js";
import { versaoDoCli, VERSAO_LOCK, type Lock, type SkillTravada } from "../nucleo/lock.js";
import { escreverAtomico } from "../plugin/atomico.js";
import { montarMarketplace, type SkillMontavel } from "../plugin/montagem.js";
import { materializarOpenCode } from "../harness/opencode.js";
import { mesclarSettings } from "../harness/settings.js";
import { instalarHooks } from "../harness/hooks.js";
import { ORIGEM_DO_PLUGIN } from "../plugin/manifestos.js";

/**
 * O fluxo do `init`: busca, monta, configura e trava.
 *
 * Uma skill inacessível NUNCA aborta as outras — é reportada em `falhas` e a
 * instalação segue com as que deram certo, porque perder a instalação inteira
 * por causa de um repositório fora do ar é pior que uma instalação parcial
 * declarada.
 *
 * A montagem inteira acontece dentro de `escreverAtomico`: ou o `.expx/` novo
 * aparece completo, ou o anterior permanece intocado.
 */

export type OpcoesInit = {
  raiz: string;
  skills: readonly string[];
  harness: readonly string[];
  /** Origem de cada skill. Nos testes, repositórios locais; em produção, o catálogo. */
  origens?: Record<string, string>;
  /** Referência fixa por skill, quando o usuário pediu uma específica. */
  referencias?: Record<string, string>;
};

export type Falha = { nome: string; erro: string };

export type ResultadoInit = {
  ok: boolean;
  instaladas: string[];
  falhas: Falha[];
  naoTravadas: string[];
  avisos: string[];
};

function origemDe(nome: string, origens?: Record<string, string>): string | undefined {
  return origens?.[nome] ?? CATALOGO.find((s) => s.nome === nome)?.repositorio;
}

export async function executarInit(op: OpcoesInit): Promise<ResultadoInit> {
  const instaladas: string[] = [];
  const falhas: Falha[] = [];
  const naoTravadas: string[] = [];
  const avisos: string[] = [];
  const montaveis: SkillMontavel[] = [];
  const travadas: Record<string, SkillTravada> = {};
  const temporarios: string[] = [];

  for (const nome of op.skills) {
    const repositorio = origemDe(nome, op.origens);
    if (repositorio === undefined) {
      falhas.push({ nome, erro: "skill fora do catalogo" });
      continue;
    }

    const alvo = await resolverAlvo(repositorio, op.referencias?.[nome]);
    if (!alvo.ok) {
      falhas.push({ nome, erro: alvo.erro ?? "nao foi possivel resolver a versao" });
      continue;
    }
    if (!alvo.travado) naoTravadas.push(nome);

    const busca = await buscarSkill({ nome, repositorio, referencia: alvo.referencia });
    if (!busca.ok) {
      falhas.push({ nome, erro: busca.erro });
      continue;
    }
    temporarios.push(busca.caminho);

    const layout = detectarLayout(busca.caminho, nome);
    if (!layout.ok) {
      falhas.push({ nome, erro: layout.erro });
      continue;
    }

    // A skill não pode referenciar nada fora da própria pasta: o plugin é
    // copiado para o cache e um `../` deixaria de resolver silenciosamente.
    const fora = verificarCaminhos(layout.raizSkill);
    if (fora.length > 0) {
      const lista = fora.slice(0, 3).map((a) => `${a.arquivo}:${String(a.linha)} → ${a.referencia}`);
      falhas.push({
        nome,
        erro: `a skill referencia caminho fora da propria pasta: ${lista.join("; ")}`,
      });
      continue;
    }

    montaveis.push({ nome, raizSkill: layout.raizSkill, comandos: layout.comandos, hooks: layout.hooks });
    travadas[nome] = {
      repositorio,
      referencia: alvo.referencia,
      travado: alvo.travado,
      commit: busca.commit,
      resolvido_em: new Date().toISOString().slice(0, 10),
      arquivos: hashearPasta(layout.raizSkill),
    };
    instaladas.push(nome);
  }

  if (montaveis.length > 0) {
    const lock: Lock = {
      lock_version: VERSAO_LOCK,
      cli_version: versaoDoCli(),
      harness: [...op.harness],
      skills: travadas,
    };

    escreverAtomico(op.raiz, (tmp) => {
      montarMarketplace(join(tmp, "marketplace"), montaveis, versaoDoCli());
      // `tmp` JÁ é o futuro `.expx/`, então o lock vai direto nele — passar por
      // `escreverLock`, que acrescenta `.expx/` ao caminho, gravaria fora da
      // pasta temporária e o arquivo se perderia na troca atômica.
      writeFileSync(join(tmp, "expx-lock.json"), `${JSON.stringify(lock, null, 2)}\n`);
    });

    // A cópia acontece AQUI, antes do `rmSync` dos clones lá embaixo: feita
    // depois, leria pasta já apagada (decisão D-26).
    const hooksInstalados = instalarHooks(op.raiz, montaveis);

    if (op.harness.includes("claude")) {
      const marketplace = join(op.raiz, ".expx", "marketplace");
      const r = mesclarSettings(op.raiz, marketplace, hooksInstalados);
      if (!r.ok) avisos.push(r.erro);
    }
    if (op.harness.includes("opencode")) materializarOpenCode(op.raiz, montaveis);
  }

  for (const t of temporarios) rmSync(t, { recursive: true, force: true });

  // Skill sem tag NÃO vira aviso na instalação. Hoje nenhum dos seis
  // repositórios publica tag, então o aviso disparava para todas, em toda
  // instalação — e um aviso que aparece sempre deixa de ser lido, levando
  // junto os avisos que realmente pedem atenção (settings.json em conflito,
  // skill que falhou).
  //
  // O fato continua registrado onde é procurado de propósito: `travado: false`
  // no lock, e o achado `skill-nao-travada` do `doctor`. Some o ruído da
  // instalação, não a informação.
  return { ok: instaladas.length > 0, instaladas, falhas, naoTravadas, avisos };
}

export { ORIGEM_DO_PLUGIN };
