#!/usr/bin/env python3
"""Nao deixa tocar codigo de producao antes do teste de regressao existir.

`PreToolUse` em Write|Edit. Se a ocorrencia e `bug` e a primeira task da
primeira fase ainda nao tem `teste_regressao` preenchido, avisa antes de deixar
escrever em arquivo de implementacao.

Regra 5 do SKILL.md — a mais importante do runx — virando mecanica.
Nasce em AVISO. Falha ABERTA.
"""

import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "comum"))
import expx_rastro as R  # noqa: E402

NOME = "regressao-antes-do-fix"

# Arquivo de teste: o hook nao se mete — escrever teste e exatamente o que ele
# pede. Os limites sao ancorados de proposito: `src/features/` e `src/latest.ts`
# NAO sao teste, e tratar como tal desligaria a regra em silencio num projeto
# inteiro. Na duvida entre calar e avisar num arquivo de teste, o custo e so um
# aviso a mais; o inverso desliga a regra principal do runx.
TESTE = re.compile(
    # pastas de teste, como segmento inteiro do caminho
    # `features/` e `spec/` ficaram DE FORA: `src/features/` e layout de
    # producao em React/Vue/Nx, e `packages/spec/` costuma ser o pacote de
    # contrato. Cobrir os dois desligaria a regra no projeto inteiro.
    r"(^|/)(tests?|specs|__tests__|__test__|testing|e2e|cypress|"
    r"playwright|androidTest|integration-tests?|test-utils?)(/|$)"
    # sufixos e prefixos convencionais
    r"|(^|/)test_[^/]*$"
    r"|(^|/)conftest\.py$"
    r"|(^|/)[^/]*_(test|tests|spec)\.[^/.]+$"
    r"|(^|/)[^/]*[.\-](test|tests|spec|story|stories|fixture|fixtures)\.[^/.]+$"
    # Java, C#, Kotlin, Scala, Go, PHP: sufixo colado ao nome, em CamelCase
    r"|(^|/)[A-Za-z0-9_]*(Test|Tests|Spec|Specs|IT|ITCase|TestCase|Should)\.[^/.]+$"
    # helpers de teste
    r"|(^|/)[^/]*[Tt]est[Hh]elpers?\.[^/.]+$",
)

# Documentacao e config nao sao "codigo de producao" para efeito desta regra.
NAO_IMPLEMENTACAO = re.compile(
    r"\.(md|mdx|txt|rst|adoc|json|ya?ml|toml|ini|cfg|lock|csv|svg|png|jpe?g|gif|ico|webp)$"
    r"|(^|/)docs/|(^|/)\.expx/|(^|/)\.claude/|(^|/)\.opencode/|(^|/)\.github/",
    re.IGNORECASE,
)


def primeira_task(pasta):
    """A primeira task da primeira sprint, na ordem em que o plano a declara."""
    try:
        sprints = sorted(
            d for d in os.listdir(pasta)
            if d.startswith("sprint-") and os.path.isdir(os.path.join(pasta, d))
        )
    except OSError:
        return None
    for sprint in sprints:
        tasks = R.lista(R.frontmatter(os.path.join(pasta, sprint, "tasks.md")).get("tasks"))
        tasks = [t for t in tasks if isinstance(t, dict)]
        if tasks:
            return tasks[0]
    return None


def main():
    evento = R.ler_evento()
    caminho = R.caminho_da_ferramenta(evento)
    if not caminho:
        sys.exit(0)

    normal = caminho.replace(os.sep, "/")
    if TESTE.search(normal) or NAO_IMPLEMENTACAO.search(normal):
        sys.exit(0)

    pasta = R.pasta_ocorrencia()
    if not pasta:
        sys.exit(0)

    raiz = R.raiz_repo()
    fm_causa = R.frontmatter(os.path.join(pasta, "01-CAUSA-RAIZ.md"))
    fm_oc = R.frontmatter(os.path.join(pasta, "00-OCORRENCIA.md"))

    # A regra so vale para bug. Nos demais tipos nao ha defeito a reproduzir.
    ehbug = (
        fm_oc.get("tipo_ocorrencia") == "bug"
        or R.frontmatter(os.path.join(pasta, "ORQUESTRADOR.md")).get("tipo_ocorrencia") == "bug"
        or fm_causa.get("modo") == "causa_raiz"
    )
    if not ehbug:
        sys.exit(0)

    task = primeira_task(pasta)
    if task is None:
        sys.exit(0)  # sem plano ainda; quem cobra isso e o causa-antes-do-plano

    regressao = R.texto(task.get("teste_regressao"))
    if regressao and regressao.strip().lower() != "null":
        sys.exit(0)

    R.barra_ou_avisa(
        NOME,
        f"Escrita em codigo de producao (`{caminho}`) com a primeira task "
        f"(`{R.texto(task.get('id')) or '?'}`) ainda sem `teste_regressao` preenchido.\n"
        "Em bug, o teste que reproduz o problema vem antes do fix e tem que "
        "falhar antes (regra 5). Escreva o teste, veja o vermelho e so entao "
        "implemente o minimo para ele passar.",
        trabalho=R.trabalho_id(pasta), fase="e3", task=R.texto(task.get("id")),
        arquivos=[caminho], raiz=raiz,
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
