#!/usr/bin/env python3
"""Grava `suite_executada` no rastro. `PostToolUse` em Bash.

So reage a comando que parece execucao de suite. O resultado (verde/vermelha)
sai do codigo de saida relatado pela ferramenta, nao de leitura da saida:
formato de saida varia por runner, codigo de saida nao.
"""

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expx_rastro as R  # noqa: E402

# Runners comuns. Casa o comando de teste do projeto, seja pelo gerenciador de
# pacotes, pelo Makefile ou pelo binario direto.
SUITE = re.compile(
    r"\b("
    r"(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?test|"
    r"(?:npx|pnpm\s+dlx|bunx)\s+(?:jest|vitest|mocha|ava|playwright|cypress)|"
    r"jest|vitest|mocha|playwright\s+test|cypress\s+run|"
    r"pytest|tox|nose2|python\s+-m\s+(?:pytest|unittest)|"
    r"go\s+test|cargo\s+test|"
    r"(?:bundle\s+exec\s+)?rspec|rake\s+test|"
    r"(?:php\s+)?(?:vendor/bin/)?phpunit|pest|"
    r"(?:\./)?(?:gradlew|mvnw)\s+(?:.*\s)?test|mvn\s+(?:.*\s)?test|"
    r"dotnet\s+test|"
    r"make\s+(?:test|check)"
    r")\b",
    re.IGNORECASE,
)


def main():
    evento = R.ler_evento()
    comando = (evento.get("tool_input") or {}).get("command") or ""
    if not SUITE.search(comando):
        sys.exit(0)

    pasta = R.pasta_ocorrencia()
    if not pasta:
        sys.exit(0)

    resposta = evento.get("tool_response")
    codigo = None
    if isinstance(resposta, dict):
        for chave in ("exit_code", "exitCode", "returncode", "code"):
            if isinstance(resposta.get(chave), int):
                codigo = resposta[chave]
                break
        if codigo is None and resposta.get("interrupted"):
            codigo = -1

    if codigo is None:
        estado, resultado = "nao_determinado", "desconhecido"
    elif codigo == 0:
        estado, resultado = "verde", "ok"
    else:
        estado, resultado = "vermelha", "falhou"

    orq = R.frontmatter(os.path.join(pasta, "ORQUESTRADOR.md"))
    R.grava(
        "suite_executada",
        trabalho=R.trabalho_id(pasta),
        fase=orq.get("estagio"),
        resultado=resultado,
        detalhe=f"suite {estado}: {comando.strip()[:160]}",
    )
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
