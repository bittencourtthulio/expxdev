#!/usr/bin/env python3
"""Portao do E1 — nao deixa nascer plano sem causa raiz comprovada.

`PreToolUse` em Write|Edit dentro de `sprint-*/`. Barra quando
`01-CAUSA-RAIZ.md` nao existe, ou quando tem `comprovada: false` em ocorrencia
do tipo `bug`.

Regras 1 e 2 do SKILL.md deixando de depender da maquina de estados em prosa.
Nasce em AVISO. Falha ABERTA.
"""

import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "comum"))
import expx_rastro as R  # noqa: E402

NOME = "causa-antes-do-plano"

# `docs/manutencao/<OC-ID>-<slug>/sprint-NN/...`
ALVO = re.compile(r"(?:^|/)docs/manutencao/([^/]+)/sprint-[^/]+/")


def main():
    evento = R.ler_evento()
    caminho = R.caminho_da_ferramenta(evento)
    if not caminho:
        sys.exit(0)

    m = ALVO.search(caminho.replace(os.sep, "/"))
    if not m:
        sys.exit(0)

    raiz = R.raiz_repo()
    pasta = os.path.join(raiz, "docs", "manutencao", m.group(1))
    causa = os.path.join(pasta, "01-CAUSA-RAIZ.md")
    trabalho = R.trabalho_id(pasta)

    if not os.path.isfile(causa):
        R.barra_ou_avisa(
            NOME,
            "Plano sendo escrito sem investigacao: "
            f"`docs/manutencao/{m.group(1)}/01-CAUSA-RAIZ.md` nao existe.\n"
            "Nao se planeja o que nao se mapeou (regra 1). Execute o E1 "
            "(`references/01-investigacao.md`) e so entao escreva o plano.",
            trabalho=trabalho, fase="e2", arquivos=[caminho], raiz=raiz,
        )

    fm = R.frontmatter(causa)
    if fm.get("modo") == "causa_raiz" and fm.get("comprovada") is not True:
        R.barra_ou_avisa(
            NOME,
            "Plano sendo escrito com a causa raiz ainda nao comprovada "
            f"(`comprovada: {fm.get('comprovada')}` em 01-CAUSA-RAIZ.md).\n"
            "Bug nao avanca do E1 sem causa comprovada (regra 2). Prove a causa "
            "— teste que falha, log literal ou o trecho com o mecanismo — ou "
            "encerre com `STATUS: NAO COMPROVADO` dizendo o que falta. "
            "Nao invente causa plausivel para desbloquear o fluxo.",
            trabalho=trabalho, fase="e2", arquivos=[caminho], raiz=raiz,
        )

    # Passou: silencioso (regra 2). O rastro do que foi escrito fica por conta
    # do `arquivo_alterado`, ja gravado no PostToolUse — o vocabulario de
    # `evento` e fechado pelo contrato e nao tem termo para "permitiu".
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
