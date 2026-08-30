#!/usr/bin/env bash
# Banco de casos dos hooks do runx. Monta uma ocorrencia de mentira em /tmp e
# roda cada hook contra ela, conferindo o codigo de saida esperado.
set -uo pipefail

H="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
OC="$W/docs/manutencao/OC-2026-0142-calculo-frete"
mkdir -p "$OC/sprint-01" "$OC/base" "$W/.git" "$W/src/frete" "$W/docs/relatorios/2026-08-29-OC-2026-0142-calculo-frete"

ok=0; falhou=0
caso() { # caso <nome> <esperado> <hook> <json>
  local nome="$1" esperado="$2" hook="$3" json="$4" saida real
  saida=$(printf '%s' "$json" | (cd "$W" && python3 "$hook") 2>&1); real=$?
  if [ "$real" -eq "$esperado" ]; then
    ok=$((ok+1)); printf '  ok   %-46s exit=%s\n' "$nome" "$real"
  else
    falhou=$((falhou+1)); printf '  FALHA %-45s esperado=%s real=%s\n     %s\n' \
      "$nome" "$esperado" "$real" "$(printf '%s' "$saida" | head -3)"
  fi
}
w() { printf '{"tool_name":"Write","tool_input":{"file_path":"%s","content":%s}}' "$W/$1" "$2"; }

escreve_causa() { cat > "$OC/01-CAUSA-RAIZ.md" <<EOF
---
expx_schema: 1
expx_tool: runx
kind: causa_raiz
trabalho_id: OC-2026-0142
modo: causa_raiz
comprovada: $1
evidencia: teste_falho
arquivos_impactados: [src/frete/calculo.ts]
atualizado_em: 2026-08-29
---
EOF
}
escreve_tasks() { cat > "$OC/sprint-01/tasks.md" <<EOF
---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: OC-2026-0142
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Teste de regressao
    fase: F-01.1
    status: em_andamento
    objetivo: Reproduzir
    arquivos:
      cria: [src/frete/calculo.test.ts]
      altera: []
    teste_regressao: $1
    teste_integracao: Chama o endpoint de cotacao
    teste_funcional: Dado 60kg retorna 120
    criterio_aceite: Falha antes e passa depois
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: Corrigir
    fase: F-01.1
    status: pendente
    objetivo: Ajustar faixa
    arquivos:
      cria: []
      altera: [src/frete/calculo.ts]
    teste_regressao: null
    teste_integracao: Tabela oficial
    teste_funcional: Dado 50.5kg retorna 110
    criterio_aceite: Faixas batem
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---
EOF
}
cat > "$OC/00-OCORRENCIA.md" <<'EOF'
---
expx_schema: 1
expx_tool: runx
kind: ocorrencia
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente
tipo_ocorrencia: bug
recebido_em: 2026-08-28
origem: ticket-4471
tem_reproducao: true
modulo_afetado: [frete]
---
EOF
cat > "$OC/ORQUESTRADOR.md" <<'EOF'
---
expx_schema: 1
expx_tool: runx
kind: orquestrador
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente
tipo_trabalho: ocorrencia
tipo_ocorrencia: bug
estagio: e3
status: em_andamento
sprints: [sprint-01]
caminho_critico: [F-01.1]
concluido_em: null
---
EOF

echo "== segredo-no-commit (seguranca: nasce em BLOQUEIO) =="
caso "chave AWS barrada"        2 "$H/comum/segredo-no-commit.py" "$(w src/frete/calculo.ts '"const k = \"AKIAQY7RZ3LKMNBVCXZQ\""')"
caso "token github barrado"     2 "$H/comum/segredo-no-commit.py" "$(w src/a.ts '"ghp_A1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvWxYz"')"
caso "placeholder da AWS passa" 0 "$H/comum/segredo-no-commit.py" "$(w src/a.ts '"AKIAIOSFODNN7EXAMPLE"')"
caso "chave privada barrada"    2 "$H/comum/segredo-no-commit.py" "$(w src/a.pem '"-----BEGIN RSA PRIVATE KEY-----\nMIIE"')"
caso "senha em url de banco"    2 "$H/comum/segredo-no-commit.py" "$(w src/db.ts '"postgres://admin:s3nh4Sup3r@10.0.0.1/prod"')"
caso "placeholder passa"        0 "$H/comum/segredo-no-commit.py" "$(w src/a.ts '"const k = \"<SUA_CHAVE_AQUI>\""')"
caso "codigo normal passa"      0 "$H/comum/segredo-no-commit.py" "$(w src/frete/calculo.ts '"export function frete(p){ return p*2 }"')"
caso ".env ignorado"            0 "$H/comum/segredo-no-commit.py" "$(w .env '"AWS=AKIAIOSFODNN7EXAMPLE"')"

echo "== causa-antes-do-plano =="
rm -f "$OC/01-CAUSA-RAIZ.md"
caso "sem causa raiz avisa"     0 "$H/runx/causa-antes-do-plano.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md '"x"')"
escreve_causa false
caso "causa nao comprovada"     0 "$H/runx/causa-antes-do-plano.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md '"x"')"
escreve_causa true
caso "causa comprovada passa"   0 "$H/runx/causa-antes-do-plano.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md '"x"')"
caso "fora de sprint passa"     0 "$H/runx/causa-antes-do-plano.py" "$(w src/frete/calculo.ts '"x"')"

echo "== causa-antes-do-plano em modo bloqueio =="
mkdir -p "$W/.expx"; echo '{"hooks":{"causa-antes-do-plano":"bloqueio"}}' > "$W/.expx/hooks.json"
escreve_causa false
caso "bloqueio barra mesmo"     2 "$H/runx/causa-antes-do-plano.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md '"x"')"
rm -f "$W/.expx/hooks.json"
escreve_causa true

echo "== regressao-antes-do-fix =="
escreve_tasks "null"
caso "producao sem regressao"   0 "$H/runx/regressao-antes-do-fix.py" "$(w src/frete/calculo.ts '"fix"')"
caso "teste sempre passa"       0 "$H/runx/regressao-antes-do-fix.py" "$(w src/frete/calculo.test.ts '"teste"')"
caso "markdown passa"           0 "$H/runx/regressao-antes-do-fix.py" "$(w README.md '"doc"')"
escreve_tasks "Pedido de 60kg cobra 120 e hoje cobra 90"
caso "com regressao passa"      0 "$H/runx/regressao-antes-do-fix.py" "$(w src/frete/calculo.ts '"fix"')"
echo '{"hooks":{"regressao-antes-do-fix":"bloqueio"}}' > "$W/.expx/hooks.json" 2>/dev/null || mkdir -p "$W/.expx" && echo '{"hooks":{"regressao-antes-do-fix":"bloqueio"}}' > "$W/.expx/hooks.json"
escreve_tasks "null"
caso "bloqueio barra producao"  2 "$H/runx/regressao-antes-do-fix.py" "$(w src/frete/calculo.ts '"fix"')"
rm -f "$W/.expx/hooks.json"; escreve_tasks "Pedido de 60kg cobra 120"

echo "== task-so-fecha-verde =="
T="docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md"
mk() { python3 - "$1" "$2" "$3" <<'PY'
import json,sys
st,su,ti=sys.argv[1],sys.argv[2],sys.argv[3]
c=f"""---
kind: tasks
trabalho_id: OC-2026-0142
tasks:
  - id: T-01.01
    status: {st}
    teste_integracao: {ti}
    teste_funcional: Dado 60kg retorna 120
    suite: {su}
---
"""
print(json.dumps({"tool_name":"Write","tool_input":{"file_path":sys.argv[4] if len(sys.argv)>4 else "","content":c}}))
PY
}
J=$(mk concluida verde "Chama endpoint" ); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "concluida verde passa"    0 "$H/runx/task-so-fecha-verde.py" "$J"
J=$(mk concluida vermelha "Chama endpoint"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "concluida vermelha avisa" 0 "$H/runx/task-so-fecha-verde.py" "$J"
J=$(mk concluida verde "null"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "sem teste_integracao"     0 "$H/runx/task-so-fecha-verde.py" "$J"
J=$(mk em_andamento nao_executada "Chama endpoint"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "em_andamento passa"       0 "$H/runx/task-so-fecha-verde.py" "$J"
mkdir -p "$W/.expx"; echo '{"hooks":{"task-so-fecha-verde":"bloqueio"}}' > "$W/.expx/hooks.json"
J=$(mk concluida vermelha "Chama endpoint"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "bloqueio barra vermelha"  2 "$H/runx/task-so-fecha-verde.py" "$J"
rm -f "$W/.expx/hooks.json"

echo "== escopo-da-ocorrencia =="
escreve_tasks "Pedido de 60kg cobra 120"
caso "arquivo no escopo passa"  0 "$H/runx/escopo-da-ocorrencia.py" "$(w src/frete/calculo.ts '"x"')"
caso "teste no escopo passa"    0 "$H/runx/escopo-da-ocorrencia.py" "$(w src/frete/calculo.test.ts '"x"')"
caso "fora do escopo avisa"     0 "$H/runx/escopo-da-ocorrencia.py" "$(w src/pedido/outro.ts '"refactor de brinde"')"
caso "docs/manutencao livre"    0 "$H/runx/escopo-da-ocorrencia.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/QA.md '"x"')"
mkdir -p "$W/.expx"; echo '{"hooks":{"escopo-da-ocorrencia":"bloqueio"}}' > "$W/.expx/hooks.json"
caso "bloqueio barra fora"      2 "$H/runx/escopo-da-ocorrencia.py" "$(w src/pedido/outro.ts '"x"')"
rm -f "$W/.expx/hooks.json"

echo "== sem-jargao-no-uso (PostToolUse) =="
U="docs/relatorios/2026-08-29-OC-2026-0142-calculo-frete/uso.md"
p() { printf '{"tool_name":"Write","tool_input":{"file_path":"%s"}}' "$W/$U"; }
cat > "$W/$U" <<'EOF'
---
kind: relatorio_uso
trabalho_id: OC-2026-0142
---
# O que mudou
O valor do frete para encomendas acima de 50 quilos estava sendo cobrado a menos.
Agora o valor cobrado confere com a tabela combinada. Nao e preciso fazer nada.
EOF
caso "uso limpo passa"          0 "$H/runx/sem-jargao-no-uso.py" "$(p)"
cat > "$W/$U" <<'EOF'
---
kind: relatorio_uso
---
# O que mudou
Corrigimos a funcao calcularFrete() em src/frete/calculo.ts, que fazia um SELECT
na tabela de faixas com arredondamento errado.
EOF
# Em modo aviso o hook registra e NAO interrompe (exit 0); so em bloqueio ele
# devolve o texto ao modelo para reescrita (exit 2).
caso "uso com jargao: aviso nao trava" 0 "$H/runx/sem-jargao-no-uso.py" "$(p)"
mkdir -p "$W/.expx"; echo '{"hooks":{"sem-jargao-no-uso":"bloqueio"}}' > "$W/.expx/hooks.json"
caso "uso com jargao: bloqueio devolve" 2 "$H/runx/sem-jargao-no-uso.py" "$(p)"
rm -f "$W/.expx/hooks.json"
mkdir -p "$W/.expx"; echo '{"hooks":{"sem-jargao-no-uso":"desligado"}}' > "$W/.expx/hooks.json"
caso "desligado passa"          0 "$H/runx/sem-jargao-no-uso.py" "$(p)"
rm -f "$W/.expx/hooks.json"

echo "== rastro =="
caso "rastro-arquivo grava"     0 "$H/comum/rastro-arquivo.py" "$(w src/frete/calculo.ts '"x"')"
caso "rastro-suite verde"       0 "$H/comum/rastro-suite.py" '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"exit_code":0}}'
caso "rastro-suite vermelha"    0 "$H/comum/rastro-suite.py" '{"tool_name":"Bash","tool_input":{"command":"npx vitest run"},"tool_response":{"exit_code":1}}'
caso "comando comum ignorado"   0 "$H/comum/rastro-suite.py" '{"tool_name":"Bash","tool_input":{"command":"ls -la"},"tool_response":{"exit_code":0}}'

echo "== robustez: entrada invalida nunca trava =="
for hk in comum/rastro-arquivo comum/rastro-suite runx/causa-antes-do-plano \
          runx/regressao-antes-do-fix runx/task-so-fecha-verde \
          runx/escopo-da-ocorrencia runx/sem-jargao-no-uso; do
  caso "$(basename $hk) stdin vazio"  0 "$H/$hk.py" ''
  caso "$(basename $hk) json quebrado" 0 "$H/$hk.py" '{nao e json'
done

echo "== despachante: um processo, mesma semantica =="
DESP="$H/comum/despachante.py"
PRE5="comum/segredo-no-commit runx/causa-antes-do-plano runx/regressao-antes-do-fix runx/task-so-fecha-verde runx/escopo-da-ocorrencia"
dcaso(){ local esp="$1" desc="$2" ev="$3" c
  printf '%s' "$ev" | (cd "$W" && python3 "$DESP" $PRE5) >/dev/null 2>&1; c=$?
  if [ "$c" -eq "$esp" ]; then ok=$((ok+1)); printf '  ok   %-46s exit=%s\n' "$desc" "$c"
  else falhou=$((falhou+1)); printf '  FALHA %-45s esperado=%s real=%s\n' "$desc" "$esp" "$c"; fi; }
escreve_causa true; escreve_tasks "Pedido de 60kg cobra 120"
dcaso 0 "escrita no escopo passa"      "$(w src/frete/calculo.ts '"x"')"
dcaso 2 "segredo barra pelo despachante" "$(w src/frete/calculo.ts '"ghp_A1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvWxYz"')"
dcaso 0 "fora do escopo so avisa"      "$(w src/pedido/outro.ts '"x"')"
mkdir -p "$W/.expx"; echo '{"hooks":{"escopo-da-ocorrencia":"bloqueio"}}' > "$W/.expx/hooks.json"
dcaso 2 "modo bloqueio propaga"        "$(w src/pedido/outro.ts '"x"')"
rm -f "$W/.expx/hooks.json"
dcaso 0 "stdin vazio"                  ''
dcaso 0 "json quebrado"                '{quebrado'

echo
echo "== rastro gravado =="
if [ -f "$W/docs/eventos/OC-2026-0142.jsonl" ]; then
  python3 - "$W/docs/eventos/OC-2026-0142.jsonl" <<'PY'
import json,sys,collections
linhas=[json.loads(l) for l in open(sys.argv[1]) if l.strip()]
print(f"  {len(linhas)} eventos:", dict(collections.Counter(e["evento"] for e in linhas)))
# O contrato exige que as 12 chaves ESTEJAM na linha, nao que sejam as unicas:
# chaves extras declaradas (`hook` na mergex e na legadox, `faixa` na legadox)
# sao legitimas. Um `set(e)!=chaves` reprovaria toda linha dessas duas skills.
chaves={"ts","expx_eventos","trabalho_id","ferramenta","origem","evento","fase","task","agente","resultado","detalhe","arquivos"}
extras_ok={"hook","faixa"}
ruins=[e for e in linhas if not chaves <= set(e)]
desconhecidas=sorted({k for e in linhas for k in set(e)-chaves-extras_ok})
print("  todas as linhas com as 12 chaves do contrato:", not ruins)
if desconhecidas:
    print("  AVISO chaves fora do contrato:", ", ".join(desconhecidas))
print("  exemplo:", json.dumps(linhas[0], ensure_ascii=False)[:150])
PY
else
  echo "  NENHUM evento gravado — o rastro nao funcionou"; falhou=$((falhou+1))
fi

echo
echo "  $ok ok, $falhou falhas"
[ "$falhou" -eq 0 ]
