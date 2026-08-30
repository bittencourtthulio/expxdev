#!/usr/bin/env python3
"""Escopo travado — avisa quando a escrita sai do que a investigacao autorizou.

`PreToolUse` em Write|Edit. Compara o arquivo sendo editado com
`arquivos_impactados` do `01-CAUSA-RAIZ.md` e com o campo `arquivos` da task
aberta. Fora dos dois → aviso.

Regra 8 do SKILL.md. Sem isso, a regra depende de o modelo resistir a tentacao
quinze tasks adiante. Nasce em AVISO. Falha ABERTA.
"""

import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "comum"))
import expx_rastro as R  # noqa: E402

NOME = "escopo-da-ocorrencia"

# Os artefatos do proprio metodo estao sempre autorizados: e neles que a skill
# registra o andamento. Cobrar escopo deles travaria o proprio runx.
LIVRE = re.compile(r"(^|/)docs/(manutencao|relatorios|eventos)/|(^|/)\.expx/", re.IGNORECASE)

# Arquivo de teste tambem passa livre. O metodo MANDA escrever teste no E3, e o
# plano nem sempre lista o arquivo de teste que sera criado — cobrar escopo dele
# seria avisar justamente quem esta obedecendo a regra 5. O escopo que importa
# proteger e o do codigo de producao.
TESTE = re.compile(
    r"(^|/)(tests?|specs|__tests__|__test__|testing|e2e|cypress|"
    r"playwright|androidTest|integration-tests?|test-utils?)(/|$)"
    r"|(^|/)test_[^/]*$"
    r"|(^|/)conftest\.py$"
    r"|(^|/)[^/]*_(test|tests|spec)\.[^/.]+$"
    r"|(^|/)[^/]*[.\-](test|tests|spec|story|stories|fixture|fixtures)\.[^/.]+$"
    r"|(^|/)[A-Za-z0-9_]*(Test|Tests|Spec|Specs|IT|ITCase|TestCase|Should)\.[^/.]+$"
    r"|(^|/)[^/]*[Tt]est[Hh]elpers?\.[^/.]+$"
)


def normaliza(caminho):
    """Caminho relativo, sem crase e sem `./` na frente.

    `lstrip("./")` seria um erro classico: ele remove um CONJUNTO de
    caracteres, e comeria o ponto de `.expx/hooks.json` e de `.github/`.
    """
    if not isinstance(caminho, str):
        return None
    c = caminho.strip().strip("`").replace(os.sep, "/")
    while c.startswith("./"):
        c = c[2:]
    return c or None


def autorizados(pasta):
    """(conjunto de caminhos, ids das tasks abertas).

    Uniao de `arquivos_impactados` da causa raiz com `arquivos.cria`/`.altera`
    das tasks nao concluidas — a mesma lista que o E4 usa no Passo 3.
    """
    permitidos, abertas = set(), []

    for c in R.lista(R.frontmatter(os.path.join(pasta, "01-CAUSA-RAIZ.md")).get("arquivos_impactados")):
        n = normaliza(c)
        if n:
            permitidos.add(n)

    try:
        sprints = sorted(
            d for d in os.listdir(pasta)
            if d.startswith("sprint-") and os.path.isdir(os.path.join(pasta, d))
        )
    except OSError:
        sprints = []

    for sprint in sprints:
        for t in R.lista(R.frontmatter(os.path.join(pasta, sprint, "tasks.md")).get("tasks")):
            if not isinstance(t, dict):
                continue
            if t.get("status") in ("pendente", "em_andamento"):
                abertas.append(R.texto(t.get("id")))
            arq = R.mapa(t.get("arquivos"))
            for chave in ("cria", "altera"):
                for c in R.lista(arq.get(chave)):
                    n = normaliza(c)
                    if n:
                        permitidos.add(n)
            # `arquivos` como lista simples, se o plano tiver sido escrito assim
            for c in R.lista(t.get("arquivos")):
                n = normaliza(c) if isinstance(c, str) else None
                if n:
                    permitidos.add(n)

    return permitidos, abertas


def main():
    evento = R.ler_evento()
    caminho = R.caminho_da_ferramenta(evento)
    if not caminho:
        sys.exit(0)

    alvo = normaliza(caminho)
    if not alvo or LIVRE.search(alvo) or TESTE.search(alvo):
        sys.exit(0)

    pasta = R.pasta_ocorrencia()
    if not pasta:
        sys.exit(0)

    permitidos, abertas = autorizados(pasta)
    if not permitidos:
        sys.exit(0)  # sem escopo declarado ainda, nao ha o que comparar

    # Comparacao por sufixo de CAMINHO, nunca por nome de arquivo solto: um
    # plano que declara `utils.ts` nao pode autorizar todo `*/utils.ts` do
    # repositorio. Exigimos que o trecho comum tenha pasta, ou seja igual.
    def combina(p):
        if alvo == p:
            return True
        if "/" not in p:
            return False  # nome solto so vale por igualdade
        return alvo.endswith("/" + p) or p.endswith("/" + alvo)

    if any(combina(p) for p in permitidos):
        sys.exit(0)

    raiz = R.raiz_repo()
    R.barra_ou_avisa(
        NOME,
        f"`{alvo}` nao esta no escopo declarado desta ocorrencia — nem em "
        "`arquivos_impactados` do 01-CAUSA-RAIZ.md, nem no campo `arquivos` "
        "das tasks.\n"
        "Escopo travado (regra 8): nada de refactor de brinde, nada de \"ja que "
        "estou aqui\". Se a mudanca e mesmo necessaria para a causa, acrescente "
        "o arquivo ao 01-CAUSA-RAIZ.md e a task que o justifica. Se e melhoria "
        "avulsa, ela vira sugestao de nova ocorrencia no relatorio tecnico e "
        "nao e implementada agora.",
        trabalho=R.trabalho_id(pasta), fase="e3",
        task=abertas[0] if abertas else None, arquivos=[alvo], raiz=raiz,
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
