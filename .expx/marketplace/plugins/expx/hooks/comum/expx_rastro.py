#!/usr/bin/env python3
"""Biblioteca comum dos hooks expx — rastro de eventos, modo e descoberta da ocorrencia.

Contrato: docs/contrato/CONTRATO-expx-eventos.md v1.

Nao tem estado proprio (regra 6): toda decisao sai de arquivo que ja existe —
`tasks.md`, `01-CAUSA-RAIZ.md`, `.expx/hooks.json`. Nao faz rede (regra 4).

Sem dependencia externa: so biblioteca padrao. O parser de YAML aqui e
deliberadamente parcial — le o subconjunto que o expx-schema v1 produz e nada
mais. Um parser completo seria dependencia, e dependencia num hook e latencia
mais um jeito novo de quebrar.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone

MAX_RASTRO_BYTES = 5 * 1024 * 1024  # rotaciona acima de 5 MB (contrato)

# ---------------------------------------------------------------- ancoragem


def raiz_repo(inicio=None):
    """Sobe ate achar `.git/`. Sem `.git` em nenhum ancestral, devolve o inicio.

    Mesma regra do SKILL.md para ancorar `docs/manutencao/` e `docs/relatorios/`.
    Resolve symlink: em macOS `/tmp` e `/var` apontam para `/private/...`, e a
    ferramenta pode mandar o caminho por um lado enquanto o cwd vem pelo outro.
    """
    base = os.path.realpath(inicio or os.getcwd())
    atual = base
    while True:
        if os.path.isdir(os.path.join(atual, ".git")):
            return atual
        pai = os.path.dirname(atual)
        if pai == atual:
            return base
        atual = pai


def rel(caminho, raiz=None):
    """Caminho relativo a raiz do repo, ou None se estiver fora dela.

    Regra transversal do SKILL.md: nenhum artefato carrega caminho absoluto.
    Arquivo fora do repositorio devolve None — os hooks entao o ignoram, em vez
    de raciocinar sobre um `../../..` que nao diz nada ao painel.
    """
    if not caminho:
        return None
    raiz = raiz or raiz_repo()
    try:
        relativo = os.path.relpath(os.path.realpath(caminho), os.path.realpath(raiz))
    except (ValueError, OSError):  # unidades diferentes no Windows
        return None
    if relativo == os.pardir or relativo.startswith(os.pardir + os.sep):
        return None
    return relativo


# ------------------------------------------------------------------ entrada


def ler_evento():
    """Le o evento JSON do stdin. Devolve {} se vier vazio ou invalido."""
    try:
        bruto = sys.stdin.read()
        return json.loads(bruto) if bruto.strip() else {}
    except (json.JSONDecodeError, OSError):
        return {}


def caminho_da_ferramenta(evento):
    """O `file_path` de Write/Edit, relativo a raiz. None quando nao houver."""
    entrada = evento.get("tool_input") or {}
    return rel(entrada.get("file_path"))


# --------------------------------------------------------- yaml (parcial)


def frontmatter(caminho):
    """Le o bloco YAML de um arquivo do expx-schema. {} se nao houver.

    Cobre o que o schema v1 usa: escalares, listas inline `[a, b]`, listas de
    blocos com `-`, e mapas aninhados de um nivel. Nao cobre YAML geral.
    """
    try:
        with open(caminho, "r", encoding="utf-8") as fh:
            if fh.readline().strip() != "---":
                return {}
            linhas = []
            for linha in fh:
                if linha.strip() == "---":
                    break
                linhas.append(linha.rstrip("\n"))
    except (OSError, UnicodeDecodeError):
        return {}
    return _parse(linhas)


def _sem_comentario(bruto):
    """Remove comentario `# ...` fora de aspas.

    `comprovada: true  # comprovado pelo teste` tem que virar True, e nao a
    string inteira — anotar justamente esse campo e o que todo mundo faz.
    """
    aspas = None
    for i, ch in enumerate(bruto):
        if aspas:
            if ch == aspas:
                aspas = None
        elif ch in "\"'":
            aspas = ch
        elif ch == "#" and (i == 0 or bruto[i - 1] in " \t"):
            return bruto[:i]
    return bruto


def _valor(bruto):
    bruto = _sem_comentario(bruto).strip()
    if not bruto:
        return None
    if bruto.startswith("[") and bruto.endswith("]"):
        corpo = bruto[1:-1].strip()
        return [_valor(x) for x in corpo.split(",")] if corpo else []
    # Aspas fecham o valor mesmo com sobra depois (ex.: comentario ja removido
    # deixou espaco), entao procuramos o fechamento em vez de exigir que seja
    # o ultimo caractere.
    if bruto[0] in "\"'":
        fim = bruto.find(bruto[0], 1)
        if fim > 0:
            return bruto[1:fim]
    baixo = bruto.lower()
    if baixo in ("null", "~", ""):
        return None
    if baixo == "true":
        return True
    if baixo == "false":
        return False
    if re.fullmatch(r"-?\d+", bruto):
        return int(bruto)
    return bruto


class _Ambiguo(dict):
    """Container que vira lista no primeiro `- ` e permanece dict caso contrario.

    O schema v1 tem tanto `tasks:` (lista de blocos) quanto `arquivos:` (mapa),
    e as duas chaves abrem sem valor na mesma linha. So a primeira linha filha
    revela qual e qual, entao o container serve aos dois casos.
    """

    def append(self, item):
        self.setdefault("__lista__", []).append(item)

    def como_lista(self):
        return self.get("__lista__", [])


def _parse(linhas):
    """Parser de indentacao para o subconjunto do expx-schema v1.

    Pilha de (indentacao_minima_dos_filhos, container). Um container so recebe
    linhas cuja indentacao seja >= a sua marca; abaixo disso, desempilha.
    """
    raiz = {}
    pilha = [(0, raiz)]

    for linha in linhas:
        linha = linha.replace("\t", "    ")  # tab indenta tanto quanto espaco
        if not linha.strip() or linha.lstrip().startswith("#"):
            continue
        ident = len(linha) - len(linha.lstrip(" "))
        conteudo = linha.strip()

        if conteudo.startswith("- ") or conteudo == "-":
            # O item pertence ao container aberto pela chave logo acima. YAML
            # canonico permite o "-" na MESMA coluna da chave (`tasks:` na
            # coluna 0 e `- id:` tambem na 0), entao aqui a comparacao e `<`
            # contra a indentacao da chave, e nao contra a marca dos filhos.
            while len(pilha) > 1 and ident < pilha[-1][0] - 1:
                pilha.pop()
            alvo = pilha[-1][1]
            if not isinstance(alvo, (list, _Ambiguo)):
                continue

            item = conteudo[2:].strip() if conteudo != "-" else ""
            if ":" in item and not item.startswith(("[", "{", '"', "'")):
                bloco = {}
                alvo.append(bloco)
                # As chaves seguintes do bloco alinham com a primeira chave,
                # que comeca 2 colunas depois do "-".
                pilha.append((ident + 2, bloco))
                chave, _, resto = item.partition(":")
                _atribui(bloco, chave.strip(), resto, ident + 2, pilha)
            elif item:
                alvo.append(_valor(item))
            continue

        if ":" not in conteudo:
            continue

        while len(pilha) > 1 and ident < pilha[-1][0]:
            pilha.pop()
        alvo = pilha[-1][1]
        if not isinstance(alvo, dict):
            continue

        chave, _, resto = conteudo.partition(":")
        _atribui(alvo, chave.strip(), resto, ident, pilha)

    return _enxuga(raiz) or {}


def _atribui(destino, chave, resto, ident, pilha):
    """Grava a chave. Valor vazio abre um bloco filho (lista ou mapa)."""
    resto = resto.strip()
    if resto == "":
        filho = _Ambiguo()
        destino[chave] = filho
        # Filhos do bloco vem indentados alem da chave; um "-" pode vir na
        # mesma coluna da chave, por isso a marca e ident + 1.
        pilha.append((ident + 1, filho))
    else:
        destino[chave] = _valor(resto)


def lista(valor):
    """Normaliza para lista: _Ambiguo, list, escalar ou None."""
    if valor is None:
        return []
    if isinstance(valor, _Ambiguo):
        return valor.como_lista()
    if isinstance(valor, list):
        return valor
    return [valor]


def mapa(valor):
    """Normaliza para dict, descartando a marca de lista."""
    if isinstance(valor, _Ambiguo):
        return {k: v for k, v in valor.items() if k != "__lista__"}
    return valor if isinstance(valor, dict) else {}


def texto(valor):
    """O valor como string, ou None.

    Uma chave escrita sem valor (`teste_regressao:`) abre um container vazio;
    para quem le, isso e a mesma coisa que `null`. Sem isso, um container
    vazado como "valor preenchido" desliga a checagem que dependia dele.
    """
    if isinstance(valor, str):
        return valor if valor.strip() else None
    if valor is None or isinstance(valor, (dict, list)):
        return None
    return str(valor)


def _enxuga(no):
    """Troca por None todo container que ficou vazio.

    Roda uma vez, ao fim do parse: `id:` sem valor vira `None`, e nao `{}`.
    """
    if isinstance(no, _Ambiguo):
        itens = no.como_lista()
        if itens:
            return [_enxuga(i) for i in itens]
        resto = {k: _enxuga(v) for k, v in no.items() if k != "__lista__"}
        return resto or None
    if isinstance(no, dict):
        return {k: _enxuga(v) for k, v in no.items()}
    if isinstance(no, list):
        return [_enxuga(i) for i in no]
    return no


# ------------------------------------------------------- ocorrencia em foco


def pasta_ocorrencia(raiz=None):
    """A pasta da ocorrencia em andamento, ou None.

    Escolhe pelo ORQUESTRADOR.md mais recentemente modificado cujo `estagio`
    nao esteja fechado. Sem estado proprio: le so o que a skill ja grava.
    """
    raiz = raiz or raiz_repo()
    base = os.path.join(raiz, "docs", "manutencao")
    if not os.path.isdir(base):
        return None

    abertas, fechadas = [], []
    try:
        entradas = sorted(os.listdir(base))
    except OSError:
        return None

    for nome in entradas:
        pasta = os.path.join(base, nome)
        if not os.path.isdir(pasta):
            continue
        marca = os.path.join(pasta, "ORQUESTRADOR.md")
        # antes do E2 nao ha ORQUESTRADOR; a pasta ainda conta pelo 00-OCORRENCIA
        ref = marca if os.path.isfile(marca) else os.path.join(pasta, "00-OCORRENCIA.md")
        if not os.path.isfile(ref):
            continue
        try:
            quando = os.path.getmtime(ref)
        except OSError:
            continue

        # Ocorrencia encerrada nao volta a ser "a atual" so porque um `git
        # pull` mexeu no mtime do arquivo. Sem isso, o escopo cobrado passa a
        # ser o da ocorrencia errada, e todo o resto desanda junto.
        fm = frontmatter(marca) if os.path.isfile(marca) else {}
        encerrada = fm.get("status") == "concluido" or fm.get("concluido_em") not in (None, "")
        (fechadas if encerrada else abertas).append((quando, pasta))

    for grupo in (abertas, fechadas):  # aberta ganha de fechada, sempre
        if grupo:
            grupo.sort(reverse=True)
            return grupo[0][1]
    return None


def trabalho_id(pasta):
    """O `trabalho_id` do frontmatter da ocorrencia; cai para o nome da pasta."""
    if not pasta:
        return None
    for arquivo in ("ORQUESTRADOR.md", "00-OCORRENCIA.md", "01-CAUSA-RAIZ.md"):
        fm = frontmatter(os.path.join(pasta, arquivo))
        if fm.get("trabalho_id"):
            return str(fm["trabalho_id"])
    return os.path.basename(pasta)


# -------------------------------------------------------------------- modo


# Hooks de seguranca nascem em bloqueio: segredo commitado nao tem volta, e o
# falso positivo ali e raro. So sao rebaixados se o usuario disser isso
# explicitamente em `.expx/hooks.json`.
SEGURANCA = {"segredo-no-commit"}


def modo(nome_hook, raiz=None):
    """`aviso`, `bloqueio` ou `desligado`, lido de `.expx/hooks.json`.

    Default: hook de seguranca nasce em bloqueio; hook de metodo, em aviso.
    Hook nao citado no arquivo mantem o modo de nascimento — arquivo presente
    nao rebaixa quem ele nao menciona.
    """
    nascimento = "bloqueio" if nome_hook in SEGURANCA else "aviso"
    raiz = raiz or raiz_repo()
    try:
        with open(os.path.join(raiz, ".expx", "hooks.json"), "r", encoding="utf-8") as fh:
            conf = json.load(fh)
        valor = (conf.get("hooks") or {}).get(nome_hook)
        if isinstance(valor, dict):
            valor = valor.get("modo")
        if valor in ("aviso", "bloqueio", "desligado"):
            return valor
    except (OSError, json.JSONDecodeError, AttributeError):
        pass
    return nascimento


# ------------------------------------------------------------------ rastro


def _rotaciona(caminho):
    try:
        if os.path.getsize(caminho) < MAX_RASTRO_BYTES:
            return
    except OSError:
        return
    n = 1
    while os.path.exists(f"{caminho[:-6]}.{n}.jsonl"):
        n += 1
    try:
        os.rename(caminho, f"{caminho[:-6]}.{n}.jsonl")
    except OSError:
        pass


def grava(evento, *, trabalho, fase=None, task=None, agente="principal",
          resultado="ok", detalhe=None, arquivos=None, raiz=None):
    """Acrescenta uma linha ao rastro. Nunca levanta excecao.

    Regra 7 do contrato: sempre grava, inclusive quando o hook permite.
    """
    try:
        raiz = raiz or raiz_repo()
        if not trabalho:
            return
        pasta = os.path.join(raiz, "docs", "eventos")
        os.makedirs(pasta, exist_ok=True)
        caminho = os.path.join(pasta, f"{trabalho}.jsonl")
        _rotaciona(caminho)

        linha = {
            "ts": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "expx_eventos": 1,
            "trabalho_id": trabalho,
            "ferramenta": "runx",
            "origem": "hook",
            "evento": evento,
            "fase": fase,
            "task": task,
            "agente": agente,
            "resultado": resultado,
            "detalhe": detalhe,
            "arquivos": arquivos if arquivos is not None else [],
        }
        with open(caminho, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(linha, ensure_ascii=False) + "\n")
    except Exception:  # rastro nunca derruba o trabalho (regra 3)
        pass


# ------------------------------------------------------------------- saida


def permite(evento_rastro=None, **kw):
    """Sai com 0. Silencioso quando passa (regra 2)."""
    if evento_rastro:
        grava(evento_rastro, **kw)
    sys.exit(0)


def barra_ou_avisa(nome_hook, mensagem, *, trabalho, fase=None, task=None,
                   arquivos=None, raiz=None):
    """Aplica o modo do hook.

    `bloqueio` → exit 2 com a mensagem no stderr, que volta ao modelo.
    `aviso`    → registra `regra_violada` e sai com 0, sem atrapalhar.
    """
    m = modo(nome_hook, raiz)
    if m == "desligado":
        sys.exit(0)

    bloqueando = m == "bloqueio"
    grava(
        "acao_bloqueada" if bloqueando else "regra_violada",
        trabalho=trabalho, fase=fase, task=task,
        resultado="bloqueado" if bloqueando else "aviso",
        detalhe=f"{nome_hook}: {mensagem.splitlines()[0]}",
        arquivos=arquivos, raiz=raiz,
    )

    if bloqueando:
        sys.stderr.write(f"[runx · {nome_hook}] {mensagem}\n")
        sys.exit(2)

    sys.stderr.write(
        f"[runx · {nome_hook}] AVISO (nao bloqueia): {mensagem}\n"
        f"Registrado no rastro. Para tornar isso um bloqueio, ponha "
        f'"{nome_hook}": "bloqueio" em .expx/hooks.json.\n'
    )
    sys.exit(0)
