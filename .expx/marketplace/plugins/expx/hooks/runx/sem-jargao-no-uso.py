#!/usr/bin/env python3
"""Procura jargao tecnico no relatorio destinado ao cliente.

`PostToolUse` em Write|Edit sobre `docs/relatorios/**/uso.md`. Roda depois da
escrita: nao desfaz nada, mas o aviso volta ao modelo, que reescreve.

Resolve o defeito mais comum desse arquivo — quem escreveu o codigo nao
consegue enxergar o proprio jargao. Falha ABERTA.

A lista de termos e configuravel em `.expx/jargao.json`:

    {"termos": ["webhook", "cron"], "ignorar": ["boleto"]}
"""

import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "comum"))
import expx_rastro as R  # noqa: E402

NOME = "sem-jargao-no-uso"
ALVO = re.compile(r"(?:^|/)docs/relatorios/[^/]+/uso\.md$")

# Termos que so existem no vocabulario de quem programa. Deliberadamente NAO
# inclui palavras que o cliente tambem usa no sentido dele — "tabela" (de
# precos), "campo" (do formulario), "relatorio", "servidor", "log" (de acesso),
# "coluna" (da planilha). Falso positivo aqui e o que faz desinstalarem o hook,
# e junto com ele vao os que funcionavam.
TERMOS = [
    "api", "endpoint", "backend", "front-end", "frontend", "deploy", "commit",
    "branch", "merge", "pull request", "repositorio", "repositório",
    "query", "sql", "select *", "insert into", "schema", "migration",
    # so a frase inteira: "migracao de banco DE HORAS" e RH, nao banco de dados
    "migracao de banco de dados", "migração de banco de dados",
    "banco de dados", "database",
    "cache", "stacktrace", "stack trace", "exception", "nullable",
    "boolean", "array", "json", "yaml", "payload",
    "webhook", "refactor", "refatoracao", "refatoração",
    "hotfix", "regex", "parser", "runtime", "framework", "middleware",
    "controller", "repository", "unit test", "teste unitario",
    "teste unitário", "suite de testes", "docker",
    "front end", "back end",
    "codigo-fonte", "código-fonte", "codigo fonte", "código fonte",
]

# Termos deixados DE FORA de proposito, por colidirem com o portugues do
# cliente: `container` (carga), `banco` (financeiro), `fila`/`queue`
# (atendimento), `timeout` (prazo), `thread` (turno), `merge` (juntar
# cadastros), `tabela` (de precos), `campo` (do formulario), `coluna`
# (da planilha), `log` (de acesso), `servidor`, `relatorio`, `http(s)`
# (que aparece em nome de produto e em link). Falso positivo aqui e o que
# faz desinstalarem o hook.

# Caminho de arquivo (`src/x/y.ts`), trecho de codigo, stack trace.
ESTRUTURAIS = [
    (re.compile(r"`[^`\n]*`"), "trecho de codigo entre crases"),
    (re.compile(r"```"), "bloco de codigo"),
    # Exige extensao de CODIGO: `nota 4471/2026.pdf` e `MOD-33/AC-12.zip` sao
    # referencia de documento do cliente, nao caminho de arquivo.
    (re.compile(r"\b[\w.\-]+/[\w.\-/]+\."
                r"(?:ts|tsx|js|jsx|mjs|py|rb|go|rs|java|kt|cs|php|sql|sh|"
                r"ya?ml|json|xml|html|css|scss|vue|swift|c|cpp|h)\b"),
     "caminho de arquivo"),
    (re.compile(r"\b\w+\.(?:ts|tsx|js|jsx|py|rb|go|java|cs|php|sql|json|ya?ml|sh)\b"),
     "nome de arquivo de codigo"),
    # Exige `(...)` seguido de `{` ou `=>` — e nao `;`, porque
    # "o pedido (Financeiro);" e portugues normal, nao codigo.
    (re.compile(r"\b\w+\s*\([^)\n]*\)\s*(?:\{|=>)"), "assinatura de funcao"),
    (re.compile(r"^\s*at\s+\S+.*:\d+", re.MULTILINE), "stack trace"),
    (re.compile(r"\b(?:Error|Exception|Traceback|NullPointer|undefined is not)\b"),
     "mensagem de erro tecnica"),
    (re.compile(r"\b[a-z]+[A-Z]\w*\("), "nome de funcao em camelCase"),
    (re.compile(r"\b\w+_\w+\s*\("), "nome de funcao em snake_case"),
]


def config(raiz):
    try:
        with open(os.path.join(raiz, ".expx", "jargao.json"), "r", encoding="utf-8") as fh:
            c = json.load(fh)
        return (
            [str(t).lower() for t in c.get("termos", []) if t],
            {str(t).lower() for t in c.get("ignorar", []) if t},
        )
    except (OSError, json.JSONDecodeError, AttributeError, TypeError):
        return [], set()


def sem_frontmatter(texto):
    """Remove o bloco YAML: `kind`, `trabalho_id` e afins nao sao jargao ao cliente."""
    linhas = texto.splitlines()
    if linhas and linhas[0].strip() == "---":
        for i, linha in enumerate(linhas[1:], 1):
            if linha.strip() == "---":
                return "\n".join(linhas[i + 1:])
    return texto


def main():
    evento = R.ler_evento()
    caminho = R.caminho_da_ferramenta(evento)
    if not caminho or not ALVO.search(caminho.replace(os.sep, "/")):
        sys.exit(0)

    raiz = R.raiz_repo()
    try:
        with open(os.path.join(raiz, caminho), "r", encoding="utf-8") as fh:
            texto = fh.read()
    except (OSError, UnicodeDecodeError):
        sys.exit(0)

    corpo = sem_frontmatter(texto)
    if not corpo.strip():
        sys.exit(0)

    extras, ignorar = config(raiz)
    achados = []

    for padrao, rotulo in ESTRUTURAIS:
        m = padrao.search(corpo)
        if m:
            achados.append(f"{rotulo} (\"{m.group(0).strip()[:40]}\")")

    baixo = corpo.lower()
    termos = [t for t in TERMOS + extras if t not in ignorar]
    encontrados = [t for t in termos if re.search(r"(?<![\w-])" + re.escape(t), baixo)]
    if encontrados:
        achados.append("termo tecnico: " + ", ".join(sorted(set(encontrados))[:8]))

    if not achados:
        sys.exit(0)

    modo = R.modo(NOME, raiz)
    if modo == "desligado":
        sys.exit(0)

    pasta = R.pasta_ocorrencia()
    mensagem = (
        f"O relatorio de uso (`{caminho}`) tem jargao tecnico — "
        + "; ".join(achados[:4]) + ".\n"
        "Este arquivo e o que o cliente le: nada de caminho de arquivo, nome de "
        "funcao, nome de tabela, stack trace ou termo tecnico. Reescreva no "
        "vocabulario de quem abriu o chamado — o que estava errado, o que passou "
        "a acontecer, e o que a pessoa precisa fazer. O detalhe tecnico ja tem "
        "lugar proprio: `tecnico.md`.\n"
        "Termo que e mesmo do negocio do cliente entra em `ignorar` de "
        "`.expx/jargao.json`."
    )

    R.grava(
        "regra_violada",
        trabalho=R.trabalho_id(pasta) if pasta else None,
        fase="e5", resultado="aviso",
        detalhe=f"{NOME}: " + "; ".join(achados[:4]),
        arquivos=[caminho], raiz=raiz,
    )

    # PostToolUse nao desfaz escrita: o arquivo ja esta gravado. Exit 2 aqui
    # nao bloqueia nada — so faz o aviso voltar ao modelo, que reescreve. Por
    # isso o evento e sempre `regra_violada`, nunca `acao_bloqueada`.
    #
    # O modo continua valendo: em `aviso` o hook registra e nao interrompe o
    # fluxo; so em `bloqueio` ele devolve o texto ao modelo para reescrita.
    sys.stderr.write(f"[runx · {NOME}] {mensagem}\n")
    sys.exit(2 if modo == "bloqueio" else 0)


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
