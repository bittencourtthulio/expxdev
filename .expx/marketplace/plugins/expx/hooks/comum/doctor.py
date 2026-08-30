#!/usr/bin/env python3
"""`doctor` — mostra em que modo cada hook esta e o que o rastro acumulou.

    python3 doctor.py

E a tela que decide promocao: a coluna de violacoes diz quais hooks ja rodaram
tempo suficiente em aviso, sem falso positivo, para virar bloqueio.
"""

import collections
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expx_rastro as R  # noqa: E402

# nome → (tipo, modo de nascimento, o que faz)
HOOKS = [
    ("segredo-no-commit", "seguranca", "bloqueio", "credencial indo para arquivo versionado"),
    ("causa-antes-do-plano", "metodo", "aviso", "plano sem causa raiz comprovada"),
    ("regressao-antes-do-fix", "metodo", "aviso", "codigo de producao antes do teste de regressao"),
    ("task-so-fecha-verde", "metodo", "aviso", "task concluida sem suite verde e sem os dois testes"),
    ("escopo-da-ocorrencia", "metodo", "aviso", "escrita fora do escopo declarado"),
    ("sem-jargao-no-uso", "metodo", "aviso", "jargao tecnico no relatorio do cliente"),
]


def violacoes(raiz):
    """Conta, por hook, o que o rastro acumulou de `regra_violada`/`acao_bloqueada`."""
    contagem = collections.Counter()
    for caminho in glob.glob(os.path.join(raiz, "docs", "eventos", "*.jsonl")):
        try:
            with open(caminho, "r", encoding="utf-8") as fh:
                for linha in fh:
                    if not linha.strip():
                        continue
                    try:
                        e = json.loads(linha)
                    except json.JSONDecodeError:
                        continue
                    if e.get("evento") in ("regra_violada", "acao_bloqueada"):
                        detalhe = e.get("detalhe") or ""
                        nome = detalhe.split(":", 1)[0].strip()
                        if nome:
                            contagem[nome] += 1
        except (OSError, UnicodeDecodeError):
            continue
    return contagem


def main():
    raiz = R.raiz_repo()
    conf = os.path.join(raiz, ".expx", "hooks.json")
    conta = violacoes(raiz)

    print(f"runx · doctor    repositorio: {os.path.basename(raiz)}")
    print(f"configuracao:    {'.expx/hooks.json' if os.path.isfile(conf) else '.expx/hooks.json (ausente — valem os padroes)'}")
    print()
    print(f"  {'hook':<24} {'tipo':<10} {'modo':<10} {'violacoes':>9}  o que barra")
    print(f"  {'-'*24} {'-'*10} {'-'*10} {'-'*9}  {'-'*46}")

    promoviveis = []
    for nome, tipo, _nascimento, desc in HOOKS:
        modo = R.modo(nome, raiz)  # ja cai no modo de nascimento sozinho
        n = conta.get(nome, 0)
        print(f"  {nome:<24} {tipo:<10} {modo:<10} {n:>9}  {desc}")
        if modo == "aviso":
            promoviveis.append((nome, n))

    print()
    pasta = R.pasta_ocorrencia(raiz)
    if pasta:
        print(f"ocorrencia em andamento: {R.trabalho_id(pasta)}  ({R.rel(pasta, raiz)})")
        orq = R.frontmatter(os.path.join(pasta, "ORQUESTRADOR.md"))
        if orq:
            print(f"  estagio {orq.get('estagio')}  ·  status {orq.get('status')}")
    else:
        print("nenhuma ocorrencia em andamento em docs/manutencao/")

    print()
    if promoviveis:
        limpos = [n for n, c in promoviveis if c == 0]
        ruidosos = [(n, c) for n, c in promoviveis if c > 0]
        print("Em aviso, candidatos a bloqueio:")
        if limpos:
            print("  sem nenhuma violacao registrada — "
                  "promova o que ja rodou semanas assim: " + ", ".join(limpos))
        for nome, c in sorted(ruidosos, key=lambda x: -x[1]):
            print(f"  {nome}: {c} violacao(oes) — leia-as antes de promover. "
                  "Violacao legitima pede promocao; falso positivo pede ajuste do hook.")
        print()

    print("Para mudar o modo, edite .expx/hooks.json:")
    print('  {"hooks": {"causa-antes-do-plano": "bloqueio"}}')
    print("Modos: aviso (registra e deixa passar) · bloqueio (barra) · desligado")
    print()
    print("Hook que da falso positivo e desinstalado, e junto com ele vao os que")
    print("funcionavam. Por isso todo hook de metodo nasce em aviso: promova so")
    print("com evidencia de uso real.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
