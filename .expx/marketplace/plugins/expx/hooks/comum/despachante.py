#!/usr/bin/env python3
"""Roda varios hooks do runx em UM processo.

Cada `python3` custa ~30 ms de partida. Cinco hooks no `PreToolUse` seriam
~150 ms so de interpretador, contra um orcamento de 200 ms para a chamada
inteira — e o trabalho de verdade nao chega a 2 ms. Entao o registro em
`settings.json` aponta para este despachante, que importa os hooks como modulo
e os roda em sequencia, lendo o stdin uma vez so.

    python3 despachante.py runx/causa-antes-do-plano runx/escopo-da-ocorrencia

Semantica preservada: o primeiro hook que pedir bloqueio (exit 2) encerra o
despachante com 2 e a mensagem dele no stderr; se nenhum pedir, sai 0.

Este arquivo NAO importa nada do runx no topo: se a biblioteca comum estiver
quebrada ou ausente, ele sai 0 em silencio em vez de despejar um traceback a
cada escrita de arquivo — que e o mesmo que ser desinstalado.
"""

import io
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def roda(nome, evento_bruto):
    """Roda um hook. Devolve (codigo, stderr). Nunca levanta excecao."""
    import contextlib
    import importlib.util

    caminho = os.path.join(RAIZ, nome + ".py")
    if not os.path.isfile(caminho):
        return 0, ""

    erro = io.StringIO()
    codigo = 0
    try:
        spec = importlib.util.spec_from_file_location(
            "runx_hook_" + nome.replace("/", "_").replace("-", "_"), caminho
        )
        modulo = importlib.util.module_from_spec(spec)
        # Cada hook le o proprio stdin; entregamos o mesmo texto a todos.
        with contextlib.redirect_stderr(erro):
            sys.stdin = io.StringIO(evento_bruto)
            try:
                # Importado como modulo, o `if __name__ == "__main__"` do hook
                # nao dispara: chamamos `main()` na mao. `SystemExit` e o jeito
                # normal de o hook responder, e precisa ser tratado AQUI, dentro
                # do redirect, senao o codigo se perde.
                spec.loader.exec_module(modulo)
                if hasattr(modulo, "main"):
                    modulo.main()
            except SystemExit as saida:
                codigo = saida.code if isinstance(saida.code, int) else 0
            except Exception:
                # Hook de metodo falha ABERTA. O de seguranca tem o proprio
                # tratamento fail-closed dentro do `main()` dele.
                codigo = 0
    except Exception:
        return 0, ""
    return codigo, erro.getvalue()


def main():
    alvos = sys.argv[1:]
    if not alvos:
        return 0

    try:
        bruto = sys.stdin.read()
    except OSError:
        return 0

    real = sys.stdin
    try:
        for nome in alvos:
            codigo, texto = roda(nome, bruto)
            if codigo == 2:  # primeiro que barra encerra
                sys.stderr.write(texto)
                return 2
            if texto.strip():  # aviso: mostra e segue
                sys.stderr.write(texto)
    finally:
        sys.stdin = real
    return 0


if __name__ == "__main__":
    try:
        _codigo = main()
    except SystemExit as _saida:  # um hook que escapou do `roda`
        _codigo = _saida.code if isinstance(_saida.code, int) else 0
    except Exception:
        _codigo = 0  # falha aberta: erro interno nunca atrapalha o trabalho
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(_codigo if isinstance(_codigo, int) else 0)
