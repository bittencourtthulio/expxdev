#!/usr/bin/env bash
# expx-lembrete.sh — o gatilho que garante que a skill seja CONSIDERADA.
#
# UserPromptSubmit: roda antes da primeira acao do modelo, e o que ele
# escreve no stdout entra no contexto daquele turno.
#
# ---------------------------------------------------------------------------
# Por que este arquivo existe
#
# Uma descricao de skill so compete depois que o modelo decide procurar uma.
# Quando ele forma hipotese tecnica direto do relato — "sei o que provavelmente
# e isso" — a etapa de escolher o processo simplesmente nao acontece, e a
# descricao, por melhor que seja, nunca e lida.
#
# Foi medido: um relato de defeito nao acionou a runx em SEIS sessoes
# seguidas, com a descricao reescrita tres vezes (910, 1020 e 287 caracteres),
# sem concorrente, sem cache velho e com a palavra "bug" literal no pedido. A
# propria sessao, ao ser questionada, respondeu: "nao e que eu li a descricao
# e julguei que nao se aplicava — eu nao a li".
#
# O que resolve nao e descricao melhor: e uma instrucao imperativa injetada
# ANTES da primeira acao. E o mecanismo que o plugin superpowers usava, e a
# razao de ele vencer as skills do metodo mesmo sem descricao superior.
#
# ---------------------------------------------------------------------------
# Regras que este arquivo respeita
#
#   1. Rapido       — so casamento de padrao em shell, sem rede, sem parser.
#   2. Falha aberta — qualquer erro sai 0 e nao injeta nada. Nunca bloqueia.
#   3. Um lembrete  — no maximo UMA skill por prompt, a de maior prioridade.
#                     Injetar tres sugestoes e o mesmo que nao injetar nenhuma.
#   4. So o que esta instalado — nao sugere skill ausente do projeto.

set -u

# Sem stdin utilizavel, nao ha o que fazer.
EVENTO="$(cat 2>/dev/null || true)"
[ -z "$EVENTO" ] && exit 0

# O prompt do usuario. Com jq quando existe; sem jq, um grep tolerante.
if command -v jq >/dev/null 2>&1; then
  PROMPT="$(printf '%s' "$EVENTO" | jq -r '.prompt // empty' 2>/dev/null)"
else
  PROMPT="$(printf '%s' "$EVENTO" \
    | grep -o '"prompt"[[:space:]]*:[[:space:]]*"[^"]*"' \
    | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')"
fi
[ -z "$PROMPT" ] && exit 0

# Prompt curto e saudacao nao disparam nada.
[ "${#PROMPT}" -lt 12 ] && exit 0

# Minusculas e SEM acento: a pessoa digita "nao acompanha", "codigo", "calculo"
# tanto quanto as formas acentuadas, e um padrao que so casa com acento perde
# metade dos relatos reais.
# O `tr`/`sed` do BSD trabalha byte a byte e corta caracteres multibyte no
# meio, produzindo lixo invalido. O Python resolve isso com uma passada de
# normalizacao Unicode; sem ele, cai para minusculas so em ASCII, que ainda
# casa a maioria dos padroes.
if command -v python3 >/dev/null 2>&1; then
  P="$(printf '%s' "$PROMPT" | python3 -c "
import sys,unicodedata
t=sys.stdin.read().lower()
print(''.join(c for c in unicodedata.normalize('NFD',t) if unicodedata.category(c)!='Mn'))
" 2>/dev/null)"
else
  P="$(printf '%s' "$PROMPT" | tr '[:upper:]' '[:lower:]')"
fi
[ -z "$P" ] && P="$(printf '%s' "$PROMPT" | tr '[:upper:]' '[:lower:]')"

RAIZ="${CLAUDE_PROJECT_DIR:-$PWD}"

# A skill esta instalada NESTE projeto?
instalada() {
  [ -f "$RAIZ/.claude/skills/$1/SKILL.md" ] && return 0
  [ -d "$RAIZ/.expx/marketplace/plugins/expx/skills/$1" ] && return 0
  return 1
}

casa() { printf '%s' "$P" | grep -Eq "$1"; }

# ------------------------------------------------------------------ gatilhos
#
# A ordem E a prioridade, e ela segue o fluxo do metodo: decidir se ha trabalho
# (prodx) vem antes de planejar (sprintx) e de corrigir (runx); entregar
# (mergex) vem depois. Consultas (memox, stackx) sao as mais especificas e
# ficam no topo por isso — quem pergunta "isso ja aconteceu antes?" nao quer
# que a resposta seja abrir uma ocorrencia.

SKILL=""
MOTIVO=""

# memox — pergunta sobre o passado
if casa '(ja (aconteceu|deu|teve|foi) (antes|isso)|e recorrente|voltou a (acontecer|dar)|historico (do|da|de)|quem mexeu|ja foi (decidido|tentado|descartado)|regressao)'; then
  SKILL="memox"; MOTIVO="a pergunta e sobre o passado do codigo"

# stackx — pergunta sobre convencao do projeto
elif casa '(qual o padrao|como (escrevo|faco) (o )?teste|onde (coloco|fica|ponho)|convencao|esta no padrao|padroes do projeto)'; then
  SKILL="stackx"; MOTIVO="a pergunta e sobre a convencao tecnica do repositorio"

# mergex — entrega
elif casa '(abrir? (o )?pr\b|pull request|criar? (a )?branch|commitar|versionar|subir o trabalho|mandar para revisao|pronto para (entregar|revisao)|pacote (do|de) qa)'; then
  SKILL="mergex"; MOTIVO="e trabalho de entrega e revisao"

# prodx — pedido cru, ainda por decidir
elif casa '(seria bom se|seria legal se|poderia (ter|fazer)|vale a pena|ja existe (no sistema|isso)|ideia de|gostaria de ter|queria (uma|um) (tela|relatorio|campo) nov)'; then
  SKILL="prodx"; MOTIVO="e um pedido cru, e decidir SE vira trabalho vem antes de planejar"

# runx — defeito no que ja existe
elif casa '(\bbug\b|defeito|nao funciona|parou de funcionar|nao esta funcionando|nao acompanha|nao segue o padrao|(esta|ta|vindo|vem|veio|calculando|somando|mostrando|exibindo) errad|valor errado|(errado|divergente|incorret)|nao responde|nao carrega|nao salva|nao aparece|trava|travando|quebrou|quebrado|erro ao|falha ao|deveria .* mas)'; then
  SKILL="runx"; MOTIVO="e um defeito em algo que ja existe"

# sprintx — construir algo novo
elif casa '(implementar|construir|criar (uma|um) (feature|funcionalidade|integracao)|adicionar (uma|um) (feature|funcionalidade)|integrar com|refatorar|migrar (para|de))'; then
  SKILL="sprintx"; MOTIVO="e trabalho de construcao"
fi

[ -z "$SKILL" ] && exit 0
instalada "$SKILL" || exit 0

# A instrucao. Imperativa e curta: ela existe para que a etapa de ESCOLHER o
# processo aconteca, nao para descrever a skill — isso a descricao ja faz.
TEXTO="[Expx] Este pedido casa com a skill \`$SKILL\` ($MOTIVO).

ANTES de ler codigo, formar hipotese ou editar qualquer arquivo: leia a descricao da skill \`$SKILL\` e decida explicitamente se ela se aplica. Se aplicar, use-a. Se nao aplicar, diga em uma linha por que nao.

Hipotese tecnica forte nao dispensa esta checagem — e justamente quando ela mais protege."

if command -v jq >/dev/null 2>&1; then
  jq -n --arg t "$TEXTO" \
    '{hookSpecificOutput:{hookEventName:"UserPromptSubmit",additionalContext:$t}}' 2>/dev/null || true
else
  ESC="$(printf '%s' "$TEXTO" | sed 's/\\/\\\\/g; s/"/\\"/g' | awk '{printf "%s\\n",$0}')"
  printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$ESC"
fi
exit 0
