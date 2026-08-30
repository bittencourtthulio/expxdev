#!/usr/bin/env python3
"""Grava uma linha no rastro pela linha de comando.

Os hooks gravam sozinhos. Este script e para o que hook nao ve: as transicoes de
fase da propria skill e os vereditos dos agentes — que rodam sem ferramenta de
escrita, e portanto tem o veredito registrado por quem os chamou.

    python3 rastro.py --evento veredito_emitido --agente qa \\
        --resultado reprovado --detalhe "2 achados alta" --fase e4

Sem `--trabalho`, descobre a ocorrencia em andamento sozinho.
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expx_rastro as R  # noqa: E402

# Vocabulario fechado pelo contrato. Evento fora daqui quebra o parser do painel.
EVENTOS = {
    "fase_iniciada", "fase_concluida",
    "task_iniciada", "task_concluida", "task_bloqueada",
    "suite_executada", "arquivo_alterado",
    "regra_violada", "acao_bloqueada",
    "agente_iniciado", "agente_concluido",
    "veredito_emitido",
    "commit_criado", "pr_aberto",
}
AGENTES = {"principal", "auditor-plano", "revisor-testes", "qa", "investigador", "cartografo"}


def main():
    p = argparse.ArgumentParser(description="grava uma linha no rastro expx-eventos")
    p.add_argument("--evento", required=True, choices=sorted(EVENTOS))
    p.add_argument("--agente", default="principal", choices=sorted(AGENTES))
    p.add_argument("--trabalho", default=None, help="trabalho_id; descoberto se omitido")
    p.add_argument("--fase", default=None, help="e1..e5")
    p.add_argument("--task", default=None, help="T-NN.MM")
    p.add_argument("--resultado", default="ok")
    p.add_argument("--detalhe", default=None)
    p.add_argument("--arquivos", nargs="*", default=None)
    args = p.parse_args()

    raiz = R.raiz_repo()
    trabalho = args.trabalho
    if not trabalho:
        pasta = R.pasta_ocorrencia(raiz)
        if not pasta:
            sys.stderr.write("rastro: nenhuma ocorrencia em andamento; use --trabalho\n")
            return 0  # nunca trava o trabalho
        trabalho = R.trabalho_id(pasta)

    R.grava(
        args.evento, trabalho=trabalho, fase=args.fase, task=args.task,
        agente=args.agente, resultado=args.resultado, detalhe=args.detalhe,
        arquivos=[R.rel(a, raiz) or a for a in (args.arquivos or [])], raiz=raiz,
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as erro:
        sys.stderr.write(f"rastro: {erro}\n")
        sys.exit(0)  # o rastro nunca derruba o trabalho
