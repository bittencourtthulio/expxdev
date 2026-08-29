#!/usr/bin/env python3
"""Atualiza status de task em tasks.md: frontmatter e prosa juntos, sem regex fragil."""
import sys, re, subprocess

def data_hoje():
    return subprocess.run(["date","+%Y-%m-%d"],capture_output=True,text=True).stdout.strip()

def set_status(arquivo, tid, novo, suite=None, nota=None):
    s = open(arquivo, encoding="utf-8").read()
    p = s.split("---\n", 2)
    fm, corpo = p[1], p[2]
    hoje = data_hoje()

    # --- frontmatter: opera linha a linha dentro do bloco da task ---
    linhas = fm.split("\n")
    ini = next(i for i, l in enumerate(linhas) if l.strip() == f"- id: {tid}")
    fim = len(linhas)
    for i in range(ini + 1, len(linhas)):
        if linhas[i].startswith("  - id: "):
            fim = i; break
    for i in range(ini, fim):
        st = linhas[i].strip()
        if st.startswith("status:"):
            linhas[i] = "    status: " + novo
        elif st.startswith("concluida_em:"):
            linhas[i] = "    concluida_em: " + (hoje if novo == "concluida" else "null")
        elif st.startswith("suite:") and suite:
            linhas[i] = "    suite: " + suite
    fm = "\n".join(linhas)
    fm = re.sub(r"^atualizado_em: .*$", "atualizado_em: " + hoje, fm, flags=re.M)

    # --- prosa: o bloco ```yaml que comeca com id: TID ---
    linhas = corpo.split("\n")
    ini = next(i for i, l in enumerate(linhas) if l.strip() == f"id: {tid}")
    for i in range(ini, len(linhas)):
        if linhas[i].startswith("status:"):
            linhas[i] = "status: " + novo + (f"  # {hoje} · {nota}" if nota else "")
            break
        if linhas[i].strip() == "```":
            break
    corpo = "\n".join(linhas)

    open(arquivo, "w", encoding="utf-8").write("---\n" + fm + "---\n" + corpo)
    return hoje

if __name__ == "__main__":
    arq, tid, novo = sys.argv[1], sys.argv[2], sys.argv[3]
    suite = sys.argv[4] if len(sys.argv) > 4 else None
    nota  = sys.argv[5] if len(sys.argv) > 5 else None
    print(f"{tid} -> {novo}", set_status(arq, tid, novo, suite, nota))
