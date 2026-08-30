/*
 * Diagramas do site, como SVG inline.
 *
 * Todos usam currentColor e as variaveis de tema do CSS em vez de hex fixo,
 * para o mesmo desenho servir aos dois temas — e por R13 das convencoes do
 * metodo, texto dentro de SVG vai sem acento.
 */

const D = {};

/* O ecossistema: repositorios -> CLI -> plugin -> harnesses. */
D.ecossistema = `
<svg viewBox="0 0 900 380" role="img" aria-label="O CLI busca as oito skills nos repositorios, empacota como plugin local e configura os dois harnesses">
  <defs>
    <marker id="sf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-faint)"/>
    </marker>
  </defs>
  <g font-family="var(--sans)" font-size="12">

    <text x="14" y="20" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">1 · OS REPOSITORIOS</text>
    <g font-family="var(--mono)" font-size="12.5">
      <rect x="14"  y="32" width="212" height="38" rx="6" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
      <text x="120" y="50" text-anchor="middle" fill="var(--ink)">sprintx</text>
      <text x="120" y="63" text-anchor="middle" font-size="9.5" fill="var(--ink-faint)" font-family="var(--sans)">features novas</text>

      <rect x="234" y="32" width="212" height="38" rx="6" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
      <text x="340" y="50" text-anchor="middle" fill="var(--ink)">runx</text>
      <text x="340" y="63" text-anchor="middle" font-size="9.5" fill="var(--ink-faint)" font-family="var(--sans)">manutencao</text>

      <rect x="454" y="32" width="212" height="38" rx="6" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
      <text x="560" y="50" text-anchor="middle" fill="var(--ink)">mergex</text>
      <text x="560" y="63" text-anchor="middle" font-size="9.5" fill="var(--ink-faint)" font-family="var(--sans)">entrega e PR</text>

      <rect x="674" y="32" width="212" height="38" rx="6" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".5"/>
      <text x="780" y="50" text-anchor="middle" fill="var(--ink)">buildx</text>
      <text x="780" y="63" text-anchor="middle" font-size="9.5" fill="var(--accent)" font-family="var(--sans)">orquestra as outras</text>

      <rect x="14"  y="78" width="212" height="38" rx="6" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".5"/>
      <text x="120" y="96" text-anchor="middle" fill="var(--ink)">legadox</text>
      <text x="120" y="109" text-anchor="middle" font-size="9.5" fill="var(--layer)" font-family="var(--sans)">camada</text>

      <rect x="234" y="78" width="212" height="38" rx="6" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".5"/>
      <text x="340" y="96" text-anchor="middle" fill="var(--ink)">stackx</text>
      <text x="340" y="109" text-anchor="middle" font-size="9.5" fill="var(--layer)" font-family="var(--sans)">camada</text>

      <rect x="454" y="78" width="212" height="38" rx="6" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".5"/>
      <text x="560" y="96" text-anchor="middle" fill="var(--ink)">memox</text>
      <text x="560" y="109" text-anchor="middle" font-size="9.5" fill="var(--layer)" font-family="var(--sans)">camada</text>

      <rect x="674" y="78" width="212" height="38" rx="6" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".5"/>
      <text x="780" y="96" text-anchor="middle" fill="var(--ink)">prodx</text>
      <text x="780" y="109" text-anchor="middle" font-size="9.5" fill="var(--layer)" font-family="var(--sans)">camada</text>
    </g>

    <path d="M450 122 L450 150" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#sf)"/>
    <text x="462" y="141" font-size="10" fill="var(--ink-faint)" font-family="var(--mono)">git clone --depth 1</text>

    <text x="14" y="174" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">2 · O CLI</text>
    <rect x="14" y="184" width="872" height="52" rx="7" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".45"/>
    <text x="30" y="206" font-family="var(--mono)" font-size="13.5" fill="var(--accent)" font-weight="600">npx expxdev init</text>
    <text x="30" y="223" font-size="11" fill="var(--ink-muted)">resolve a versao · detecta o layout · verifica caminhos · calcula o hash de cada arquivo · monta atomicamente</text>

    <path d="M450 238 L450 266" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#sf)"/>

    <text x="14" y="288" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">3 · O QUE FICA NO PROJETO</text>
    <rect x="14" y="298" width="424" height="74" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="30" y="318" font-family="var(--mono)" font-size="12" fill="var(--ink)">.expx/marketplace/plugins/expx/</text>
    <text x="30" y="336" font-size="11" fill="var(--ink-muted)">o plugin local com so as skills escolhidas</text>
    <text x="30" y="355" font-family="var(--mono)" font-size="11" fill="var(--ink-muted)">.expx/expx-lock.json  · versao, commit e hash</text>

    <rect x="452" y="298" width="205" height="74" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="554" y="323" text-anchor="middle" font-size="12" fill="var(--ink)" font-weight="600">Claude Code</text>
    <text x="554" y="341" text-anchor="middle" font-family="var(--mono)" font-size="10.5" fill="var(--ink-muted)">/expx:sprintx-sprints</text>
    <text x="554" y="358" text-anchor="middle" font-size="10" fill="var(--ink-faint)">com namespace</text>

    <rect x="671" y="298" width="215" height="74" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="778" y="323" text-anchor="middle" font-size="12" fill="var(--ink)" font-weight="600">OpenCode</text>
    <text x="778" y="341" text-anchor="middle" font-family="var(--mono)" font-size="10.5" fill="var(--ink-muted)">/sprintx-sprints</text>
    <text x="778" y="358" text-anchor="middle" font-size="10" fill="var(--ink-faint)">sem namespace</text>
  </g>
</svg>`;

/* O metodo de ponta a ponta. */
D.metodo = `
<svg viewBox="0 0 900 456" role="img" aria-label="O metodo de ponta a ponta: a buildx conduz a cadeia inteira quando o projeto e novo; prodx decide se ha trabalho, sprintx ou runx executam, as camadas modificam as duas, e a mergex entrega">
  <defs>
    <marker id="mf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-faint)"/>
    </marker>
  </defs>
  <g font-family="var(--sans)" font-size="12">

    <rect x="14" y="8" width="872" height="40" rx="7" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".45" stroke-dasharray="5 3"/>
    <text x="30" y="26" font-family="var(--mono)" font-size="12.5" fill="var(--accent)">buildx</text>
    <text x="30" y="40" font-size="10" fill="var(--ink-muted)">projeto novo, do zero: conduz a cadeia inteira sozinha, feature a feature, ate o sistema estar pronto</text>
    <text x="872" y="26" text-anchor="end" font-family="var(--mono)" font-size="9.5" fill="var(--accent)">B1 B2 B3 B4 B5 B6</text>
    <text x="872" y="40" text-anchor="end" font-size="9" fill="var(--ink-faint)">uma unica pergunta ao usuario</text>

    <path d="M79 52 L79 112" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 3" marker-end="url(#mf)" opacity=".65"/>
    <rect x="14" y="116" width="130" height="60" rx="7" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".55"/>
    <text x="79" y="139" text-anchor="middle" font-family="var(--mono)" font-size="13" fill="var(--ink)">prodx</text>
    <text x="79" y="155" text-anchor="middle" font-size="10" fill="var(--ink-muted)">vale a pena fazer?</text>
    <text x="79" y="168" text-anchor="middle" font-size="9" fill="var(--layer)">3 de 4 vereditos param aqui</text>

    <path d="M148 146 L188 146" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#mf)"/>
    <text x="168" y="138" text-anchor="middle" font-size="9" fill="var(--ink-faint)">fazer</text>

    <rect x="192" y="82" width="196" height="58" rx="7" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".5"/>
    <text x="290" y="103" text-anchor="middle" font-family="var(--mono)" font-size="13" fill="var(--accent)">sprintx</text>
    <text x="290" y="119" text-anchor="middle" font-size="10" fill="var(--ink-muted)">BUILD · feature nova</text>
    <text x="290" y="132" text-anchor="middle" font-family="var(--mono)" font-size="9.5" fill="var(--ink-faint)">F1 F2 F3 F4 F5 F6</text>

    <rect x="192" y="152" width="196" height="58" rx="7" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".5"/>
    <text x="290" y="173" text-anchor="middle" font-family="var(--mono)" font-size="13" fill="var(--accent)">runx</text>
    <text x="290" y="189" text-anchor="middle" font-size="10" fill="var(--ink-muted)">RUN · ocorrencia em producao</text>
    <text x="290" y="202" text-anchor="middle" font-family="var(--mono)" font-size="9.5" fill="var(--ink-faint)">E1 E2 E3 E4 E5</text>

    <path d="M392 146 L432 146" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#mf)"/>

    <rect x="436" y="116" width="150" height="60" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="511" y="139" text-anchor="middle" font-family="var(--mono)" font-size="13" fill="var(--ink)">mergex</text>
    <text x="511" y="155" text-anchor="middle" font-size="10" fill="var(--ink-muted)">branch, commit, PR</text>
    <text x="511" y="168" text-anchor="middle" font-size="9" fill="var(--ink-faint)">E0 ate E9</text>

    <path d="M590 146 L630 146" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#mf)"/>

    <rect x="634" y="108" width="252" height="76" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="760" y="130" text-anchor="middle" font-size="12" fill="var(--ink)" font-weight="600">revisor humano</text>
    <text x="760" y="148" text-anchor="middle" font-size="10" fill="var(--ink-muted)">recebe o diff ja classificado</text>
    <text x="760" y="166" text-anchor="middle" font-family="var(--mono)" font-size="9.5" fill="var(--ink-faint)">OLHO OBRIGATORIO · RAPIDA · DISPENSAVEL</text>

    <text x="14" y="248" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">AS CAMADAS MODIFICAM O RIGOR DAS DUAS BASES</text>
    <path d="M290 216 L290 262" stroke="var(--layer)" stroke-width="1.2" stroke-dasharray="3 3" marker-end="url(#mf)" opacity=".7"/>

    <rect x="14" y="262" width="284" height="66" rx="7" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".45"/>
    <text x="30" y="283" font-family="var(--mono)" font-size="12" fill="var(--layer)">stackx</text>
    <text x="30" y="299" font-size="10.5" fill="var(--ink-muted)">como este projeto escreve codigo</text>
    <text x="30" y="317" font-family="var(--mono)" font-size="10" fill="var(--ink-faint)">docs/stack/CONVENCOES.md</text>

    <rect x="308" y="262" width="284" height="66" rx="7" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".45"/>
    <text x="324" y="283" font-family="var(--mono)" font-size="12" fill="var(--layer)">legadox</text>
    <text x="324" y="299" font-size="10.5" fill="var(--ink-muted)">o quanto ter medo · raio de impacto</text>
    <text x="324" y="317" font-family="var(--mono)" font-size="10" fill="var(--ink-faint)">docs/legado/PERFIL.md</text>

    <rect x="602" y="262" width="284" height="66" rx="7" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".45"/>
    <text x="618" y="283" font-family="var(--mono)" font-size="12" fill="var(--layer)">memox</text>
    <text x="618" y="299" font-size="10.5" fill="var(--ink-muted)">o que ja se sabe sobre este arquivo</text>
    <text x="618" y="317" font-family="var(--mono)" font-size="10" fill="var(--ink-faint)">.expx/memoria/indice.json</text>

    <text x="14" y="368" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">TODAS ESCREVEM O MESMO CONTRATO · O PAINEL SO LE</text>
    <rect x="14" y="378" width="578" height="56" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="30" y="399" font-family="var(--mono)" font-size="11.5" fill="var(--ink)">expx-schema v1</text>
    <text x="30" y="416" font-size="10" fill="var(--ink-muted)">frontmatter YAML do estado — onde o trabalho esta</text>
    <text x="320" y="399" font-family="var(--mono)" font-size="11.5" fill="var(--ink)">expx-eventos v1</text>
    <text x="320" y="416" font-size="10" fill="var(--ink-muted)">rastro append-only — o que aconteceu e quando</text>

    <path d="M596 406 L634 406" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#mf)"/>
    <rect x="638" y="378" width="248" height="56" rx="7" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".45"/>
    <text x="762" y="401" text-anchor="middle" font-family="var(--mono)" font-size="12.5" fill="var(--accent)">expx panel · expx watch</text>
    <text x="762" y="419" text-anchor="middle" font-size="10" fill="var(--ink-muted)">somente leitura, 127.0.0.1</text>
  </g>
</svg>`;

/* As tres camadas de garantia. */
D.camadas = `
<svg viewBox="0 0 900 250" role="img" aria-label="As tres camadas de garantia: a skill instrui, o hook barra de forma deterministica, e o agente julga em contexto proprio">
  <g font-family="var(--sans)" font-size="12">
    <text x="14" y="20" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">DA MAIS FRACA A MAIS FORTE</text>

    <rect x="14" y="34" width="282" height="150" rx="8" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="34" y="60" font-size="14.5" fill="var(--ink)" font-weight="600">1 · A skill instrui</text>
    <text x="34" y="82" font-size="11.5" fill="var(--ink-muted)">O metodo escrito: fases, contratos,</text>
    <text x="34" y="98" font-size="11.5" fill="var(--ink-muted)">regras invioláveis, templates.</text>
    <line x1="34" y1="112" x2="276" y2="112" stroke="var(--line)"/>
    <text x="34" y="132" font-size="10.5" fill="var(--ink-faint)">Quem executa: o modelo</text>
    <text x="34" y="150" font-size="10.5" fill="var(--err)">Limite: pode ser esquecida na task 14</text>
    <text x="34" y="168" font-family="var(--mono)" font-size="10" fill="var(--ink-faint)">SKILL.md</text>

    <rect x="308" y="34" width="282" height="150" rx="8" fill="var(--warn-wash)" stroke="var(--warn)" stroke-opacity=".45"/>
    <text x="328" y="60" font-size="14.5" fill="var(--ink)" font-weight="600">2 · O hook barra</text>
    <text x="328" y="82" font-size="11.5" fill="var(--ink-muted)">Script deterministico, executado</text>
    <text x="328" y="98" font-size="11.5" fill="var(--ink-muted)">pelo harness e nao pelo modelo.</text>
    <line x1="328" y1="112" x2="570" y2="112" stroke="var(--warn)" stroke-opacity=".3"/>
    <text x="328" y="132" font-size="10.5" fill="var(--ink-faint)">Quem executa: o harness</text>
    <text x="328" y="150" font-size="10.5" fill="var(--ok)">Roda sempre: nao depende de lembrar</text>
    <text x="328" y="168" font-family="var(--mono)" font-size="10" fill="var(--ink-faint)">PreToolUse · exit 2 bloqueia</text>

    <rect x="602" y="34" width="284" height="150" rx="8" fill="var(--ok-wash)" stroke="var(--ok)" stroke-opacity=".45"/>
    <text x="622" y="60" font-size="14.5" fill="var(--ink)" font-weight="600">3 · O agente julga</text>
    <text x="622" y="82" font-size="11.5" fill="var(--ink-muted)">Contexto proprio, ferramentas</text>
    <text x="622" y="98" font-size="11.5" fill="var(--ink-muted)">restritas, somente leitura.</text>
    <line x1="622" y1="112" x2="866" y2="112" stroke="var(--ok)" stroke-opacity=".3"/>
    <text x="622" y="132" font-size="10.5" fill="var(--ink-faint)">Nao ve o raciocinio de quem produziu</text>
    <text x="622" y="150" font-size="10.5" fill="var(--ok)">Nao tem como corrigir o que encontra</text>
    <text x="622" y="168" font-family="var(--mono)" font-size="10" fill="var(--ink-faint)">tools: Read, Glob, Grep</text>

    <rect x="14" y="198" width="872" height="40" rx="7" fill="var(--err-wash)" stroke="var(--err)" stroke-opacity=".35"/>
    <text x="30" y="216" font-size="11.5" fill="var(--ink)" font-weight="600">Todo hook de metodo nasce em modo aviso.</text>
    <text x="30" y="231" font-size="10.5" fill="var(--ink-muted)">Hook que da falso positivo e desinstalado, e junto com ele vao os que funcionavam. Excecao: hook de seguranca nasce em bloqueio.</text>
  </g>
</svg>`;

/* Anatomia do init. */
D.init = `
<svg viewBox="0 0 900 300" role="img" aria-label="Anatomia do expx init: o marketplace local, o plugin com so as skills escolhidas, e o lock que trava versao e hash de cada arquivo">
  <g font-family="var(--sans)" font-size="12">
    <text x="14" y="20" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">A ARVORE QUE O INIT MONTA, ATOMICAMENTE</text>

    <rect x="14" y="32" width="430" height="250" rx="8" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <g font-family="var(--mono)" font-size="12">
      <text x="32" y="56" fill="var(--accent)" font-weight="600">.expx/</text>
      <text x="48" y="78" fill="var(--ink)">expx-lock.json</text>
      <text x="200" y="78" font-size="10" fill="var(--ink-faint)" font-family="var(--sans)">versao · commit · hash por arquivo</text>
      <text x="48" y="100" fill="var(--ink)">marketplace/</text>
      <text x="64" y="122" fill="var(--ink-muted)">.claude-plugin/marketplace.json</text>
      <text x="64" y="144" fill="var(--ink-muted)">plugins/expx/</text>
      <text x="80" y="166" fill="var(--ink-muted)">.claude-plugin/plugin.json</text>
      <text x="80" y="188" fill="var(--ink)">skills/&lt;nome&gt;/</text>
      <text x="270" y="188" font-size="10" fill="var(--ink-faint)" font-family="var(--sans)">so as escolhidas</text>
      <text x="80" y="210" fill="var(--ink)">commands/&lt;arquivo&gt;.md</text>
      <text x="80" y="232" fill="var(--ink-muted)">nucleo/</text>
      <text x="48" y="258" fill="var(--ink-muted)">memoria/indice.json</text>
      <text x="250" y="258" font-size="10" fill="var(--ink-faint)" font-family="var(--sans)">gitignorado</text>
    </g>

    <rect x="458" y="32" width="428" height="118" rx="8" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".4"/>
    <text x="476" y="54" font-size="12.5" fill="var(--ink)" font-weight="600">.claude/ — Claude Code</text>
    <g font-family="var(--mono)" font-size="11">
      <text x="476" y="76" fill="var(--ink-muted)">settings.json</text>
      <text x="600" y="76" font-size="9.5" fill="var(--ink-faint)" font-family="var(--sans)">mesclado, com backup datado</text>
      <text x="476" y="96" fill="var(--ink-muted)">hooks/&lt;nome&gt;.sh</text>
      <text x="600" y="96" font-size="9.5" fill="var(--ink-faint)" font-family="var(--sans)">chmod 0755</text>
      <text x="476" y="116" fill="var(--ink-muted)">skills/&lt;nome&gt;/</text>
      <text x="600" y="116" font-size="9.5" fill="var(--ink-faint)" font-family="var(--sans)">so quando ha hook</text>
      <text x="476" y="138" fill="var(--ink-faint)" font-size="10">o motor do hook fica ao lado dele</text>
    </g>

    <rect x="458" y="164" width="428" height="118" rx="8" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="476" y="186" font-size="12.5" fill="var(--ink)" font-weight="600">.opencode/ — OpenCode</text>
    <g font-family="var(--mono)" font-size="11">
      <text x="476" y="208" fill="var(--ink-muted)">commands/&lt;arquivo&gt;.md</text>
      <text x="640" y="208" font-size="9.5" fill="var(--ink-faint)" font-family="var(--sans)">sem namespace</text>
      <text x="476" y="228" fill="var(--ink-muted)">.claude/skills/&lt;nome&gt;/</text>
      <text x="640" y="228" font-size="9.5" fill="var(--ink-faint)" font-family="var(--sans)">sempre, todas</text>
    </g>
    <text x="476" y="252" font-size="10" fill="var(--ink-faint)">As skills vao so para .claude/skills/, que o OpenCode le nativamente:</text>
    <text x="476" y="268" font-size="10" fill="var(--ink-faint)">duplicar criaria colisao de nome resolvida em silencio.</text>
  </g>
</svg>`;

/* Lock e update. */
D.lock = `
<svg viewBox="0 0 900 210" role="img" aria-label="Instalacao travada por lock e atualizacao explicita que nunca sobrescreve trabalho local">
  <defs>
    <marker id="lf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-faint)"/>
    </marker>
  </defs>
  <g font-family="var(--sans)" font-size="12">
    <rect x="14" y="26" width="196" height="72" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="112" y="50" text-anchor="middle" font-family="var(--mono)" font-size="12.5" fill="var(--ink)">expx update</text>
    <text x="112" y="68" text-anchor="middle" font-size="10.5" fill="var(--ink-muted)">resolve a maior tag</text>
    <text x="112" y="84" text-anchor="middle" font-size="10.5" fill="var(--ink-muted)">de cada skill instalada</text>

    <path d="M214 62 L252 62" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#lf)"/>

    <rect x="256" y="26" width="196" height="72" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="354" y="50" text-anchor="middle" font-size="12" fill="var(--ink)" font-weight="600">compara com o lock</text>
    <text x="354" y="70" text-anchor="middle" font-size="10.5" fill="var(--ink-muted)">hash sha256 por arquivo</text>
    <text x="354" y="86" text-anchor="middle" font-size="10" fill="var(--ink-faint)">sem consultar a rede</text>

    <path d="M456 62 L494 62" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#lf)"/>

    <rect x="498" y="10" width="196" height="50" rx="7" fill="var(--ok-wash)" stroke="var(--ok)" stroke-opacity=".45"/>
    <text x="596" y="30" text-anchor="middle" font-size="11.5" fill="var(--ok)" font-weight="600">em dia</text>
    <text x="596" y="47" text-anchor="middle" font-size="10.5" fill="var(--ink-muted)">reportada, nao tocada</text>

    <rect x="498" y="66" width="196" height="50" rx="7" fill="var(--err-wash)" stroke="var(--err)" stroke-opacity=".45"/>
    <text x="596" y="86" text-anchor="middle" font-size="11.5" fill="var(--err)" font-weight="600">modificacao local</text>
    <text x="596" y="103" text-anchor="middle" font-size="10.5" fill="var(--ink-muted)">bloqueada, nunca sobrescrita</text>

    <rect x="498" y="122" width="196" height="50" rx="7" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".45"/>
    <text x="596" y="142" text-anchor="middle" font-size="11.5" fill="var(--accent)" font-weight="600">tem versao nova</text>
    <text x="596" y="159" text-anchor="middle" font-size="10.5" fill="var(--ink-muted)">mostra o diff e pergunta</text>

    <path d="M698 147 L736 147" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#lf)"/>
    <rect x="740" y="122" width="146" height="50" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="813" y="142" text-anchor="middle" font-size="11" fill="var(--ink)" font-weight="600">remonta do zero</text>
    <text x="813" y="159" text-anchor="middle" font-size="10" fill="var(--ink-faint)">sem deixar orfao</text>

    <rect x="14" y="140" width="440" height="52" rx="7" fill="var(--warn-wash)" stroke="var(--warn)" stroke-opacity=".4"/>
    <text x="32" y="160" font-size="11.5" fill="var(--ink)" font-weight="600">Rollback e pelo versionador</text>
    <text x="32" y="178" font-family="var(--mono)" font-size="11" fill="var(--ink-muted)">git checkout -- .expx</text>
  </g>
</svg>`;

/* Fluxo do dado no painel. */
D.painel = `
<svg viewBox="0 0 900 230" role="img" aria-label="Como o painel le o projeto: varredura por nome exato, validacao contra o schema, conformidade e difusao do estado inteiro por websocket">
  <defs>
    <marker id="pf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-faint)"/>
    </marker>
  </defs>
  <g font-family="var(--sans)" font-size="12">
    <rect x="14" y="40" width="150" height="78" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="89" y="62" text-anchor="middle" font-family="var(--mono)" font-size="11.5" fill="var(--ink)">docs/</text>
    <text x="89" y="80" text-anchor="middle" font-size="10" fill="var(--ink-muted)">varredura por</text>
    <text x="89" y="94" text-anchor="middle" font-size="10" fill="var(--ink-muted)">nome exato</text>
    <text x="89" y="110" text-anchor="middle" font-size="9.5" fill="var(--ink-faint)">14 nomes do contrato</text>

    <path d="M168 79 L204 79" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#pf)"/>

    <rect x="208" y="40" width="150" height="78" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="283" y="62" text-anchor="middle" font-size="11.5" fill="var(--ink)" font-weight="600">frontmatter</text>
    <text x="283" y="80" text-anchor="middle" font-size="10" fill="var(--ink-muted)">13 kinds, zod</text>
    <text x="283" y="96" text-anchor="middle" font-size="10" fill="var(--ink-muted)">com numero de linha</text>
    <text x="283" y="112" text-anchor="middle" font-size="9.5" fill="var(--err)">nao valida = rejeicao</text>

    <path d="M362 79 L398 79" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#pf)"/>

    <rect x="402" y="40" width="150" height="78" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="477" y="62" text-anchor="middle" font-size="11.5" fill="var(--ink)" font-weight="600">projeto montado</text>
    <text x="477" y="80" text-anchor="middle" font-size="10" fill="var(--ink-muted)">trabalhos, sprints,</text>
    <text x="477" y="94" text-anchor="middle" font-size="10" fill="var(--ink-muted)">fases, tasks</text>
    <text x="477" y="110" text-anchor="middle" font-size="9.5" fill="var(--ink-faint)">releitura total</text>

    <path d="M556 79 L592 79" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#pf)"/>

    <rect x="596" y="40" width="150" height="78" rx="7" fill="var(--warn-wash)" stroke="var(--warn)" stroke-opacity=".45"/>
    <text x="671" y="62" text-anchor="middle" font-size="11.5" fill="var(--ink)" font-weight="600">conformidade</text>
    <text x="671" y="80" text-anchor="middle" font-size="10" fill="var(--ink-muted)">10 regras cruzando</text>
    <text x="671" y="94" text-anchor="middle" font-size="10" fill="var(--ink-muted)">referencias</text>
    <text x="671" y="110" text-anchor="middle" font-size="9.5" fill="var(--warn)">violacao do metodo</text>

    <path d="M750 79 L786 79" stroke="var(--ink-faint)" stroke-width="1.2" marker-end="url(#pf)"/>

    <rect x="790" y="40" width="96" height="78" rx="7" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".45"/>
    <text x="838" y="66" text-anchor="middle" font-size="11.5" fill="var(--accent)" font-weight="600">tela</text>
    <text x="838" y="84" text-anchor="middle" font-size="9.5" fill="var(--ink-muted)">websocket</text>
    <text x="838" y="99" text-anchor="middle" font-size="9.5" fill="var(--ink-muted)">estado inteiro</text>

    <rect x="14" y="142" width="430" height="66" rx="7" fill="var(--err-wash)" stroke="var(--err)" stroke-opacity=".35"/>
    <text x="32" y="163" font-size="11.5" fill="var(--ink)" font-weight="600">Rejeicao — o painel nao conseguiu ler</text>
    <text x="32" y="181" font-size="10.5" fill="var(--ink-muted)">Sem frontmatter, YAML invalido, kind desconhecido, versao futura.</text>
    <text x="32" y="197" font-size="10.5" fill="var(--ink-muted)">Achado sobre o arquivo. Ele fica fora do painel ate ser corrigido.</text>

    <rect x="456" y="142" width="430" height="66" rx="7" fill="var(--warn-wash)" stroke="var(--warn)" stroke-opacity=".35"/>
    <text x="474" y="163" font-size="11.5" fill="var(--ink)" font-weight="600">Violacao — o painel leu, e o conteudo desobedece</text>
    <text x="474" y="181" font-size="10.5" fill="var(--ink-muted)">Task sem teste, concluida sem suite verde, ciclo de dependencia.</text>
    <text x="474" y="197" font-size="10.5" fill="var(--ink-muted)">Achado sobre o trabalho. Ele continua na tela, com o defeito a vista.</text>
  </g>
</svg>`;

/* Raio de impacto do legadox. */
D.raio = `
<svg viewBox="0 0 900 240" role="img" aria-label="As tres faixas de raio de impacto do legadox e o que cada uma aciona">
  <g font-family="var(--sans)" font-size="12">
    <text x="14" y="20" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">OITO SINAIS COLETADOS POR EVIDENCIA · SINAL QUE NAO PUDER SER COLETADO CONTA COMO PIOR CASO</text>

    <rect x="14" y="34" width="282" height="190" rx="8" fill="var(--ok-wash)" stroke="var(--ok)" stroke-opacity=".45"/>
    <text x="34" y="58" font-size="15" fill="var(--ok)" font-weight="600">BAIXO</text>
    <text x="34" y="78" font-size="10.5" fill="var(--ink-muted)">ate 3 chamadores E sem zona de risco</text>
    <text x="34" y="93" font-size="10.5" fill="var(--ink-muted)">E sem migracao E com cobertura</text>
    <line x1="34" y1="106" x2="276" y2="106" stroke="var(--ok)" stroke-opacity=".3"/>
    <text x="34" y="126" font-family="var(--mono)" font-size="12" fill="var(--ink)">5 arquivos / 150 linhas</text>
    <text x="34" y="142" font-size="10" fill="var(--ink-faint)">orcamento por task</text>
    <text x="34" y="168" font-size="10.5" fill="var(--ink-muted)">Raio registrado · codigo vivo provado</text>
    <text x="34" y="184" font-size="10.5" fill="var(--ink-muted)">Proibicao de colateral</text>
    <text x="34" y="208" font-size="10.5" fill="var(--ok)">Nenhum hook de metodo roda aqui</text>

    <rect x="308" y="34" width="282" height="190" rx="8" fill="var(--warn-wash)" stroke="var(--warn)" stroke-opacity=".45"/>
    <text x="328" y="58" font-size="15" fill="var(--warn)" font-weight="600">MEDIO</text>
    <text x="328" y="78" font-size="10.5" fill="var(--ink-muted)">4 a 15 chamadores OU sem cobertura</text>
    <text x="328" y="93" font-size="10.5" fill="var(--ink-muted)">OU consumo por job ou relatorio</text>
    <line x1="328" y1="106" x2="570" y2="106" stroke="var(--warn)" stroke-opacity=".3"/>
    <text x="328" y="126" font-family="var(--mono)" font-size="12" fill="var(--ink)">3 arquivos / 80 linhas</text>
    <text x="328" y="142" font-size="10" fill="var(--ink-faint)">orcamento por task</text>
    <text x="328" y="168" font-size="10.5" fill="var(--ink-muted)">+ caracterizacao antes de alterar</text>
    <text x="328" y="184" font-size="10.5" fill="var(--ink-muted)">+ ponto de costura · plano de reversao</text>
    <text x="328" y="208" font-size="10.5" fill="var(--ink-muted)">+ roteiro de teste manual</text>

    <rect x="602" y="34" width="284" height="190" rx="8" fill="var(--err-wash)" stroke="var(--err)" stroke-opacity=".45"/>
    <text x="622" y="58" font-size="15" fill="var(--err)" font-weight="600">ALTO</text>
    <text x="622" y="78" font-size="10.5" fill="var(--ink-muted)">+15 chamadores OU zona de risco</text>
    <text x="622" y="93" font-size="10.5" fill="var(--ink-muted)">OU migracao OU dado historico</text>
    <line x1="622" y1="106" x2="866" y2="106" stroke="var(--err)" stroke-opacity=".3"/>
    <text x="622" y="126" font-family="var(--mono)" font-size="12" fill="var(--ink)">2 arquivos / 40 linhas</text>
    <text x="622" y="142" font-size="10" fill="var(--ink-faint)">orcamento por task</text>
    <text x="622" y="168" font-size="10.5" fill="var(--ink-muted)">+ comparacao com dado real</text>
    <text x="622" y="184" font-size="10.5" fill="var(--ink-muted)">+ chave de desligamento</text>
    <text x="622" y="208" font-size="10.5" fill="var(--err)">+ aprovacao humana registrada</text>
  </g>
</svg>`;

/* Arquitetura em camadas do codigo. */
D.arquitetura = `
<svg viewBox="0 0 900 300" role="img" aria-label="A arquitetura do CLI em camadas isoladas, uma pasta por responsabilidade, sem regra de negocio na linha de comando">
  <g font-family="var(--sans)" font-size="12">
    <text x="14" y="20" font-size="10.5" fill="var(--ink-faint)" letter-spacing="1.1">NENHUMA REGRA DE NEGOCIO VIVE NO CODIGO DE LINHA DE COMANDO</text>

    <rect x="14" y="32" width="872" height="52" rx="7" fill="var(--accent-wash)" stroke="var(--accent)" stroke-opacity=".4"/>
    <text x="32" y="54" font-family="var(--mono)" font-size="12.5" fill="var(--accent)" font-weight="600">src/cli/</text>
    <text x="140" y="54" font-size="11" fill="var(--ink-muted)">roteamento de subcomando, flags, selecao interativa, wizard, saida visual</text>
    <text x="32" y="72" font-size="10" fill="var(--ink-faint)">so orquestra: nao decide nada sobre skills, versoes ou schema</text>

    <rect x="14" y="96" width="212" height="88" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="32" y="118" font-family="var(--mono)" font-size="12" fill="var(--ink)">src/nucleo/</text>
    <text x="32" y="136" font-size="10.5" fill="var(--ink-muted)">catalogo das 7 skills</text>
    <text x="32" y="151" font-size="10.5" fill="var(--ink-muted)">resolucao de versao, busca</text>
    <text x="32" y="166" font-size="10.5" fill="var(--ink-muted)">layout, lock, integridade</text>

    <rect x="234" y="96" width="212" height="88" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="252" y="118" font-family="var(--mono)" font-size="12" fill="var(--ink)">src/plugin/</text>
    <text x="252" y="136" font-size="10.5" fill="var(--ink-muted)">montagem do plugin</text>
    <text x="252" y="151" font-size="10.5" fill="var(--ink-muted)">manifestos validados</text>
    <text x="252" y="166" font-size="10.5" fill="var(--ink-muted)">escrita atomica por rename</text>

    <rect x="454" y="96" width="212" height="88" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="472" y="118" font-family="var(--mono)" font-size="12" fill="var(--ink)">src/harness/</text>
    <text x="472" y="136" font-size="10.5" fill="var(--ink-muted)">Claude Code e OpenCode</text>
    <text x="472" y="151" font-size="10.5" fill="var(--ink-muted)">merge de settings, backup</text>
    <text x="472" y="166" font-size="10.5" fill="var(--ink-muted)">hooks com bit de execucao</text>

    <rect x="674" y="96" width="212" height="88" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="692" y="118" font-family="var(--mono)" font-size="12" fill="var(--ink)">src/doctor/ · src/update/</text>
    <text x="692" y="136" font-size="10.5" fill="var(--ink-muted)">os verificadores e o efeito</text>
    <text x="692" y="151" font-size="10.5" fill="var(--ink-muted)">comparacao com o lock</text>
    <text x="692" y="166" font-size="10.5" fill="var(--ink-muted)">deteccao de modificacao local</text>

    <rect x="14" y="196" width="432" height="88" rx="7" fill="var(--layer-wash)" stroke="var(--layer)" stroke-opacity=".4"/>
    <text x="32" y="218" font-family="var(--mono)" font-size="12" fill="var(--layer)">src/parser/</text>
    <text x="32" y="236" font-size="10.5" fill="var(--ink-muted)">leitura do expx-schema: frontmatter com numero de linha, 13 kinds,</text>
    <text x="32" y="251" font-size="10.5" fill="var(--ink-muted)">enums, descoberta por nome exato, 10 regras de conformidade</text>
    <text x="32" y="269" font-size="10.5" fill="var(--ink-muted)">e a leitura do indice da memox, com falha aberta</text>

    <rect x="454" y="196" width="432" height="88" rx="7" fill="var(--surface-alt)" stroke="var(--line-strong)"/>
    <text x="472" y="218" font-family="var(--mono)" font-size="12" fill="var(--ink)">src/servidor/ · src/watch/ · ui/</text>
    <text x="472" y="236" font-size="10.5" fill="var(--ink-muted)">o painel: HTTP em 127.0.0.1, websocket, observador de arquivos</text>
    <text x="472" y="251" font-size="10.5" fill="var(--ink-muted)">o watch: tres gatilhos, desenho puro, redesenho incremental</text>
    <text x="472" y="269" font-size="10.5" fill="var(--ok)">os dois sao somente leitura, e nao dependem do init</text>
  </g>
</svg>`;

window.DIAGRAMAS = D;
