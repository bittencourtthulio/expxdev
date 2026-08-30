#!/usr/bin/env python3
"""Grava `arquivo_alterado` no rastro. `PostToolUse` em Write|Edit.

Nao julga nada e nunca barra: so registra o que foi tocado, com a task aberta
no momento. E o que da ao painel o "quem fez o que" por task.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expx_rastro as R  # noqa: E402


def task_aberta(pasta):
    """(id, fase) da primeira task `em_andamento`; (None, None) se nao houver."""
    if not pasta:
        return None, None
    try:
        sprints = sorted(
            d for d in os.listdir(pasta)
            if d.startswith("sprint-") and os.path.isdir(os.path.join(pasta, d))
        )
    except OSError:
        return None, None

    for sprint in sprints:
        fm = R.frontmatter(os.path.join(pasta, sprint, "tasks.md"))
        for t in R.lista(fm.get("tasks")):
            if isinstance(t, dict) and t.get("status") == "em_andamento":
                return t.get("id"), t.get("fase")
    return None, None


def main():
    evento = R.ler_evento()
    caminho = R.caminho_da_ferramenta(evento)
    if not caminho:
        sys.exit(0)

    pasta = R.pasta_ocorrencia()
    if not pasta:
        sys.exit(0)  # fora de uma ocorrencia runx nao ha rastro a escrever

    orq = R.frontmatter(os.path.join(pasta, "ORQUESTRADOR.md"))
    task, fase = task_aberta(pasta)

    R.grava(
        "arquivo_alterado",
        trabalho=R.trabalho_id(pasta),
        fase=orq.get("estagio"),
        task=task,
        detalhe=f"{evento.get('tool_name') or 'escrita'} em {caminho}"
                + (f" (fase {fase})" if fase else ""),
        arquivos=[caminho],
    )
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
