#!/usr/bin/env bash
# Falso positivo e o que faz desinstalarem um hook — e junto com ele vao os que
# funcionavam. Este banco fixa os casos que ja deram errado uma vez, para que
# nao voltem em silencio.
set -uo pipefail

H="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ok=0; falhou=0

conf() { # conf <esperado(0|2)> <descricao> <comando...>
  local esp="$1" desc="$2"; shift 2
  "$@" >/dev/null 2>&1; local c=$?
  if [ "$c" -eq "$esp" ]; then ok=$((ok+1)); printf '  ok    %s\n' "$desc"
  else falhou=$((falhou+1)); printf '  FALHA %s (esperado %s, veio %s)\n' "$desc" "$esp" "$c"; fi
}

echo "== YAML: o parser nao pode desligar a regra em silencio =="
python3 - "$H" <<'PY'
import sys, os
sys.path.insert(0, os.path.join(sys.argv[1], "comum"))
import expx_rastro as R

falhas = 0
def checa(nome, cond):
    global falhas
    print(f"  {'ok   ' if cond else 'FALHA'} {nome}")
    if not cond: falhas += 1

import tempfile
def fm(txt):
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as fh:
        fh.write(txt); caminho = fh.name
    try: return R.frontmatter(caminho)
    finally: os.unlink(caminho)

# comentario inline nao pode virar parte do valor
d = fm("---\ncomprovada: true  # comprovado pelo teste que falha\n---\n")
checa("comentario inline: comprovada continua True", d.get("comprovada") is True)

d = fm('---\ntitulo: "Erro no frete"  # ticket 4471\n---\n')
checa("aspas + comentario: titulo limpo", d.get("titulo") == "Erro no frete")

# lista canonica: "-" na mesma coluna da chave
d = fm("---\ntasks:\n- id: T-01.01\n  status: concluida\n  suite: vermelha\n---\n")
ts = R.lista(d.get("tasks"))
checa("lista canonica: task encontrada", len(ts) == 1 and ts[0].get("id") == "T-01.01")
checa("lista canonica: suite lida", ts and ts[0].get("suite") == "vermelha")
checa("lista canonica: nada vaza para a raiz", "status" not in d)

# chave sem valor e o mesmo que null
d = fm("---\ntasks:\n  - id: T-01.01\n    teste_regressao:\n---\n")
ts = R.lista(d.get("tasks"))
checa("chave vazia vale null", ts and R.texto(ts[0].get("teste_regressao")) is None)

# valor com dois pontos
d = fm("---\ntitulo: Ocorre as 14:30 no checkout\n---\n")
checa("valor com dois pontos preservado", d.get("titulo") == "Ocorre as 14:30 no checkout")

# tab em vez de espaco
d = fm("---\ntasks:\n\t- id: T-01.01\n\t  suite: verde\n---\n")
checa("tab indenta igual a espaco", len(R.lista(d.get("tasks"))) == 1)

sys.exit(1 if falhas else 0)
PY
[ $? -eq 0 ] && ok=$((ok+7)) || falhou=$((falhou+1))

echo
echo "== segredo: exemplo passa, credencial real barra =="
seg() { printf '{"tool_name":"Write","tool_input":{"file_path":"/tmp/p/src/a.ts","content":%s}}' "$1" | python3 "$H/comum/segredo-no-commit.py"; }
conf 0 "placeholder oficial da AWS passa"          seg '"AKIAIOSFODNN7EXAMPLE"'
conf 0 "marcador explicito passa"                  seg '"chave = \"<SUA_CHAVE_AQUI>\""'
conf 0 "banco local do docker-compose passa"       seg '"postgres://postgres:postgres@localhost:5432/app_dev"'
conf 0 "banco do CI passa"                         seg '"postgres://ci:cipassword@postgres:5432/ci"'
conf 0 "mysql local passa"                         seg '"mysql://root:rootpwd@127.0.0.1:3306/test"'
conf 2 "chave AWS real barra"                      seg '"const k = \"AKIAQY7RZ3LKMNBVCXZQ\""'
conf 2 "chave real com # todo ao lado AINDA barra" seg '"K=\"AKIAQY7RZ3LKMNBVCXZQ\"  # todo: mover pra env"'
conf 2 "chave real com TODOS (pt) ainda barra"     seg '"k=\"AKIAQY7RZ3LKMNBVCXZQ\" # TODOS os ambientes"'
conf 2 "token com abcdef dentro ainda barra"       seg '"ghp_A1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvabcdef"'
conf 2 "banco de producao barra"                   seg '"postgres://admin:Xk9mQ2vL8pR@db.producao.com/prod"'

echo
echo "== regressao-antes-do-fix: o que e teste e o que e producao =="
python3 - "$H" <<'PY'
import sys, os, importlib.util
spec = importlib.util.spec_from_file_location(
    "h", os.path.join(sys.argv[1], "runx", "regressao-antes-do-fix.py"))
m = importlib.util.module_from_spec(spec); sys.modules["h"] = m
try: spec.loader.exec_module(m)
except SystemExit: pass

producao = ["src/features/checkout/service.ts", "src/latest.ts", "src/util/Latest.cs",
            "lib/greatest.py", "src/protest.go", "app/models/contest.rb",
            "src/Contest.php", "packages/spec/index.ts", "src/frete/calculo.ts"]
testes = ["src/frete/calculo.test.ts", "tests/test_frete.py", "test_calculo.py",
          "src/frete/calculo_test.go", "spec/models/frete_spec.rb", "__tests__/frete.ts",
          "src/frete/CalculoTest.java", "src/frete/CalculoIT.java",
          "src/frete/CalculoSpec.scala", "src/frete/CalculoTestCase.php",
          "src/Frete/CalculoShould.cs", "conftest.py",
          "src/androidTest/java/F.java", "cypress/e2e/frete.cy.ts",
          "src/frete/testHelpers.ts", "test-utils/render.tsx"]
f = 0
for p in producao:
    if m.TESTE.search(p): print(f"  FALHA producao tratada como teste: {p}"); f += 1
for p in testes:
    if not m.TESTE.search(p): print(f"  FALHA teste tratado como producao: {p}"); f += 1
if not f:
    print(f"  ok    {len(producao)} caminhos de producao e {len(testes)} de teste classificados certo")
sys.exit(1 if f else 0)
PY
[ $? -eq 0 ] && ok=$((ok+1)) || falhou=$((falhou+1))

echo
echo "== sem-jargao-no-uso: prosa de cliente nao pode disparar =="
W=$(mktemp -d); trap 'rm -rf "$W"' EXIT
mkdir -p "$W/.git" "$W/docs/relatorios/r" "$W/.expx"
echo '{"hooks":{"sem-jargao-no-uso":"bloqueio"}}' > "$W/.expx/hooks.json"
U="$W/docs/relatorios/r/uso.md"
jarg() { printf -- '---\nkind: relatorio_uso\n---\n%s\n' "$1" > "$U"
  printf '{"tool_name":"Write","tool_input":{"file_path":"%s"}}' "$U" \
    | (cd "$W" && python3 "$H/runx/sem-jargao-no-uso.py"); }
conf 0 "parentese + ponto e virgula passa"   jarg "Foi corrigida a tela de Pedidos (Financeiro); o valor confere."
conf 0 "valor por extenso passa"             jarg "O valor ficou 120,00 (cento e vinte reais); confira no portal."
conf 0 "nota fiscal 4471/2026.pdf passa"     jarg "Confira a nota fiscal 4471/2026.pdf no portal."
conf 0 "codigo de produto MOD-33/AC-12 passa" jarg "Referencia do produto: MOD-33/AC-12.zip foi corrigida."
conf 0 "fila de atendimento passa"           jarg "A fila de atendimento da recepcao estava travando."
conf 0 "container de carga passa"            jarg "O container de carga do pedido 4471 foi despachado."
conf 0 "banco de horas passa"                jarg "Ficou pendente a migracao de banco de horas dos funcionarios."
conf 0 "tabela de precos passa"              jarg "A tabela de precos acima de 50 quilos cobrava a menos."
conf 0 "coluna e campo passam"               jarg "O relatorio traz a coluna de desconto no campo certo."
conf 2 "caminho de arquivo avisa"            jarg "Corrigimos a funcao calcularFrete() em src/frete/calculo.ts."
conf 2 "SQL avisa"                           jarg "O erro vinha de um SELECT com schema errado."
conf 2 "deploy e pull request avisam"        jarg "Fizemos o deploy do hotfix no backend via pull request."

echo
echo "== escopo: nome solto nao autoriza o repositorio inteiro =="
OC="$W/docs/manutencao/OC-1-x"; mkdir -p "$OC/sprint-01" "$W/src/frete" "$W/vendor/lib"
printf -- '---\nkind: causa_raiz\ntrabalho_id: OC-1\nmodo: analise_impacto\ncomprovada: null\narquivos_impactados: [src/frete/calculo.ts]\n---\n' > "$OC/01-CAUSA-RAIZ.md"
printf -- '---\nkind: ocorrencia\ntrabalho_id: OC-1\ntipo_ocorrencia: melhoria-ui\n---\n' > "$OC/00-OCORRENCIA.md"
printf -- '---\nkind: tasks\ntrabalho_id: OC-1\ntasks:\n  - id: T-01.01\n    status: pendente\n    arquivos:\n      cria: []\n      altera: [utils.ts]\n---\n' > "$OC/sprint-01/tasks.md"
echo '{"hooks":{"escopo-da-ocorrencia":"bloqueio"}}' > "$W/.expx/hooks.json"
esc() { printf '{"tool_name":"Write","tool_input":{"file_path":"%s/%s","content":"x"}}' "$W" "$1" \
  | (cd "$W" && python3 "$H/runx/escopo-da-ocorrencia.py"); }
conf 0 "arquivo declarado passa"                    esc src/frete/calculo.ts
conf 0 "nome solto vale para ele mesmo"             esc utils.ts
conf 2 "nome solto NAO autoriza vendor/lib/utils.ts" esc vendor/lib/utils.ts
conf 2 "arquivo nao declarado barra"                esc src/outro/x.ts
echo '{}' > "$W/.expx/hooks.json"
# O metodo MANDA escrever teste no E3; cobrar escopo do arquivo de teste seria
# avisar justamente quem esta obedecendo a regra 5.
conf 0 "arquivo de teste nunca e cobrado por escopo" esc tests/frete_test.py
conf 0 "teste .test.ts tambem passa livre"           esc src/frete/calculo.test.ts
conf 0 ".expx/hooks.json nunca e cobrado por escopo" esc .expx/hooks.json
conf 0 ".github/workflows nao e cobrado"             esc .github/workflows/ci.yml

echo
echo "  $ok ok, $falhou falhas"
[ "$falhou" -eq 0 ]
