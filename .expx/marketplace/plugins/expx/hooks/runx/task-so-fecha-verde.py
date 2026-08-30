#!/usr/bin/env python3
"""Barra `status: concluida` sem suite verde e sem os dois testes preenchidos.

`PreToolUse` em Write|Edit sobre `tasks.md`. Le a escrita PROPOSTA — nao o
arquivo em disco — porque o que interessa e o que esta prestes a ser gravado.

Regras 4 e 9 do SKILL.md: nao existe "concluido com ressalva".
Nasce em AVISO. Falha ABERTA.
"""

import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "comum"))
import expx_rastro as R  # noqa: E402

NOME = "task-so-fecha-verde"
ALVO = re.compile(r"(?:^|/)docs/manutencao/([^/]+)/sprint-[^/]+/tasks\.md$")


def conteudo_proposto(evento, caminho_abs):
    """O texto que o arquivo tera depois desta ferramenta.

    Write traz o arquivo inteiro. Edit traz so o trecho, entao aplicamos a
    substituicao sobre o disco para ver o resultado.
    """
    entrada = evento.get("tool_input") or {}
    if isinstance(entrada.get("content"), str):
        return entrada["content"]

    velho, novo = entrada.get("old_string"), entrada.get("new_string")
    if not isinstance(novo, str):
        return None
    try:
        with open(caminho_abs, "r", encoding="utf-8") as fh:
            atual = fh.read()
    except (OSError, UnicodeDecodeError):
        return novo
    if isinstance(velho, str) and velho in atual:
        if entrada.get("replace_all"):
            return atual.replace(velho, novo)
        return atual.replace(velho, novo, 1)
    # `old_string` nao bate com o disco: nao da para reconstruir com honestidade.
    # Devolver o arquivo atual + o trecho novo faria o bloco YAML ser lido do
    # disco velho e a checagem passar por engano. Melhor conferir so o trecho.
    return novo


def bloco_yaml(texto):
    linhas = texto.splitlines()
    if not linhas or linhas[0].strip() != "---":
        return []
    corpo = []
    for linha in linhas[1:]:
        if linha.strip() == "---":
            return corpo
        corpo.append(linha)
    return []


def vazio(valor):
    """True quando o campo nao tem conteudo util.

    Chave escrita sem valor (`teste_integracao:`) chega como None pelo parser,
    e conta como vazia — igual a `null`.
    """
    s = R.texto(valor)
    return not (s and s.strip() and s.strip().lower() != "null")


def main():
    evento = R.ler_evento()
    caminho = R.caminho_da_ferramenta(evento)
    if not caminho:
        sys.exit(0)

    m = ALVO.search(caminho.replace(os.sep, "/"))
    if not m:
        sys.exit(0)

    raiz = R.raiz_repo()
    texto = conteudo_proposto(evento, os.path.join(raiz, caminho))
    if not texto:
        sys.exit(0)

    fm = R._parse(bloco_yaml(texto))
    tasks = [t for t in R.lista(fm.get("tasks")) if isinstance(t, dict)]
    if not tasks:
        sys.exit(0)

    problemas = []
    for t in tasks:
        if t.get("status") != "concluida":
            continue
        tid = t.get("id") or "?"
        faltas = []
        if t.get("suite") != "verde":
            faltas.append(f"`suite: {t.get('suite')}` (esperado `verde`)")
        if vazio(t.get("teste_integracao")):
            faltas.append("`teste_integracao` vazio")
        if vazio(t.get("teste_funcional")):
            faltas.append("`teste_funcional` vazio")
        if faltas:
            problemas.append(f"{tid}: " + ", ".join(faltas))

    if not problemas:
        sys.exit(0)

    R.barra_ou_avisa(
        NOME,
        "Task marcada `concluida` sem cumprir a definicao de pronto — "
        + "; ".join(problemas) + ".\n"
        "Toda task tem teste de integracao e teste funcional (regra 4), e a "
        "suite inteira roda antes de concluir (regra 9). Nao existe "
        "\"concluido com ressalva\": ou vira `bloqueada` com registro em "
        "BLOQUEIOS.md, ou fica `em_andamento` ate ficar verde.",
        trabalho=R.trabalho_id(os.path.join(raiz, "docs", "manutencao", m.group(1))),
        fase="e3", task=problemas[0].split(":")[0], arquivos=[caminho], raiz=raiz,
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
