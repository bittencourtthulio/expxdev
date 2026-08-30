#!/usr/bin/env python3
"""Hook de seguranca — barra segredo indo para arquivo versionado.

`PreToolUse` em Write|Edit. Nasce em BLOQUEIO: segredo commitado nao tem volta,
e o falso positivo aqui e raro. Falha FECHADA (regra 3 do contrato).
"""

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expx_rastro as R  # noqa: E402

NOME = "segredo-no-commit"

# Padroes de credencial real. Deliberadamente conservadores: cada um exige
# um prefixo especifico do provedor ou uma estrutura que nao ocorre em prosa.
PADROES = [
    (r"AKIA[0-9A-Z]{16}", "chave de acesso AWS"),
    (r"ASIA[0-9A-Z]{16}", "chave temporaria AWS"),
    (r"gh[pousr]_[A-Za-z0-9]{36,}", "token do GitHub"),
    (r"github_pat_[A-Za-z0-9_]{60,}", "token do GitHub"),
    (r"sk-ant-[A-Za-z0-9_\-]{20,}", "chave da Anthropic"),
    (r"sk-[A-Za-z0-9]{40,}", "chave da OpenAI"),
    (r"xox[baprs]-[A-Za-z0-9\-]{10,}", "token do Slack"),
    (r"AIza[0-9A-Za-z_\-]{35}", "chave do Google"),
    (r"-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----", "chave privada"),
    (r"eyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}", "JWT assinado"),
    (r"(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?)://[^\s:@/]+:[^\s:@/]{6,}@",
     "senha em URL de banco"),
]

# Marcadores de exemplo, procurados APENAS fora do proprio segredo — ver
# `so_marcador`. Antes eram procurados na linha inteira, e ai um `# todo`
# ao lado da chave real (o jeito mais comum de commitar uma sem querer) fazia
# o hook deixar passar. Pior: `TODOS`, `abcdef` e `123456789` casam DENTRO de
# um token legitimo.
PLACEHOLDER = re.compile(
    r"xxxx|placeholder|example|exemplo|dummy|fake|redacted|changeme|"
    r"troque|substitua|<[^>]{2,}>|\{\{|\$\{|"
    r"your[_\- ]|seu[_\- ]|sua[_\- ]|aqui[_\-]?vai",
    re.IGNORECASE,
)

# Banco local de desenvolvimento nao e segredo: e credencial descartavel de um
# container que so existe na maquina de quem roda. Bloquear `docker-compose.yml`
# e o caminho mais curto para desinstalarem o hook.
HOST_LOCAL = re.compile(
    r"@(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?|host\.docker\.internal|"
    r"db|database|postgres|postgresql|mysql|mariadb|mongo|mongodb|redis)"
    r"(?::\d+)?(?:[/?]|$)",
    re.IGNORECASE,
)
SENHA_TRIVIAL = re.compile(
    r"://[^\s:@/]+:(?:postgres|mysql|root|admin|password|senha|secret|test|"
    r"dev|local|example|changeme|123456|pass|pwd|guest)\d{0,4}@",
    re.IGNORECASE,
)

# Arquivos onde credencial e esperada e que nao vao para o versionador.
IGNORADOS = re.compile(r"(^|/)\.env(\.|$)|(^|/)\.git/|\.example$|\.sample$|\.lock$")


def texto_da_escrita(evento):
    e = evento.get("tool_input") or {}
    partes = [e.get("content"), e.get("new_string")]
    for edicao in e.get("edits") or []:  # MultiEdit, se o harness usar
        if isinstance(edicao, dict):
            partes.append(edicao.get("new_string"))
    return "\n".join(p for p in partes if isinstance(p, str))


def so_marcador(linha, m):
    """True se o que casou e claramente um exemplo, e nao uma credencial real.

    O marcador e procurado FORA do trecho que casou: `# todo` ao lado da chave
    real nao pode inocentar a chave, e `abcdef` dentro do proprio token muito
    menos. Um marcador colado ao valor (`AKIA...EXAMPLE`) continua valendo,
    porque ai ele faz parte do proprio placeholder.
    """
    fora = linha[:m.start()] + " " + linha[m.end():]
    if PLACEHOLDER.search(fora):
        return True
    # marcador embutido no proprio valor: `...EXAMPLE`, `...PLACEHOLDER`
    return bool(re.search(r"(?i)example|placeholder|xxxx|dummy|redacted", m.group(0)))


def banco_local(url):
    """True para credencial de banco local de desenvolvimento."""
    return bool(HOST_LOCAL.search(url) or SENHA_TRIVIAL.search(url))


def main():
    evento = R.ler_evento()
    # Segredo e segredo em qualquer lugar: se o arquivo esta fora do repo,
    # `rel` devolve None e ainda assim inspecionamos, citando o caminho como veio.
    bruto = (evento.get("tool_input") or {}).get("file_path") or ""
    caminho = R.caminho_da_ferramenta(evento) or os.path.basename(bruto)
    if IGNORADOS.search(bruto.replace(os.sep, "/")):
        sys.exit(0)

    conteudo = texto_da_escrita(evento)
    if not conteudo:
        sys.exit(0)

    achados = []
    for numero, linha in enumerate(conteudo.splitlines(), 1):
        if len(linha) > 4000:
            continue
        for padrao, rotulo in PADROES:
            m = re.search(padrao, linha)
            if not m:
                continue
            if so_marcador(linha, m):
                break  # e exemplo: nao e achado, e nao testamos outro padrao
            # O padrao de banco casa so ate o `@`; o host vem depois, entao a
            # checagem de "banco local" olha a linha a partir do inicio da URL.
            if rotulo == "senha em URL de banco" and banco_local(linha[m.start():]):
                break
            achados.append((numero, rotulo))
            break

    if not achados:
        sys.exit(0)

    pasta = R.pasta_ocorrencia()
    trabalho = R.trabalho_id(pasta)
    lista_achados = "; ".join(f"linha {n}: {r}" for n, r in achados[:5])

    R.grava(
        "acao_bloqueada", trabalho=trabalho, resultado="bloqueado",
        detalhe=f"{NOME}: {lista_achados}", arquivos=[caminho] if caminho else [],
    )
    sys.stderr.write(
        f"[runx · {NOME}] Credencial detectada em `{caminho}` ({lista_achados}).\n"
        "Segredo em arquivo versionado nao tem volta. Mova o valor para variavel "
        "de ambiente e referencie a variavel no codigo. Se for exemplo, use um "
        "marcador obvio (`<SUA_CHAVE>`, `example`) que este hook reconhece.\n"
    )
    sys.exit(2)


if __name__ == "__main__":
    try:
        main()
    except Exception as erro:  # seguranca falha FECHADA
        sys.stderr.write(
            f"[runx · {NOME}] Hook de seguranca falhou ({erro}). "
            "Bloqueando por precaucao: confira manualmente se ha credencial nesta escrita.\n"
        )
        sys.exit(2)
