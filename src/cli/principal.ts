#!/usr/bin/env node
import { existsSync, realpathSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { interpretar, textoDeAjuda } from "./argumentos.js";
import { iniciarPainel } from "../servidor/painel.js";

/** Abre o navegador no sistema em que estamos, sem dependência externa. */
function abrirNavegador(url: string): void {
  const cmd =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  try {
    spawn(cmd, [url], { detached: true, stdio: "ignore", shell: process.platform === "win32" }).unref();
  } catch {
    // falhar ao abrir o navegador nunca derruba o painel
  }
}

/** A pasta do build da UI, quando existe no pacote publicado. */
function pastaEstaticos(): string | undefined {
  const aqui = dirname(fileURLToPath(import.meta.url));
  for (const candidato of [join(aqui, "../../ui/dist"), join(aqui, "../ui")]) {
    if (existsSync(join(candidato, "index.html"))) return candidato;
  }
  return undefined;
}

export async function principal(argv: readonly string[]): Promise<number> {
  const r = interpretar(argv);
  if (!r.ok) {
    process.stderr.write(`${r.erro}\n\n${textoDeAjuda()}\n`);
    return 1;
  }
  if (r.opcoes.ajuda) {
    process.stdout.write(`${textoDeAjuda()}\n`);
    return 0;
  }

  const raiz = resolve(r.opcoes.dir);
  if (!existsSync(raiz)) {
    process.stderr.write(`a pasta ${r.opcoes.dir} nao existe\n`);
    return 1;
  }

  const estaticos = pastaEstaticos();
  const painel = await iniciarPainel({
    raiz,
    porta: r.opcoes.porta,
    diasBloqueio: r.opcoes.diasBloqueio,
    ...(estaticos !== undefined ? { estaticos } : {}),
  });

  const e = painel.estado();
  const url = painel.url();
  process.stdout.write(
    [
      "",
      `  expx-painel  ${url}`,
      `  observando   ${raiz}`,
      `  ${String(e.trabalhos.length)} trabalho(s) · ${String(e.violacoes.length)} violacao(oes) · ${String(e.rejeicoes.length)} fora do schema`,
      "",
      "  somente leitura — o painel nunca escreve nos arquivos do projeto",
      "  Ctrl+C para encerrar",
      "",
    ].join("\n"),
  );

  if (r.opcoes.abrir) {
    process.stdout.write("  abrindo o navegador...\n\n");
    abrirNavegador(url);
  }

  const encerrar = (): void => {
    void painel.parar().then(() => process.exit(0));
  };
  process.on("SIGINT", encerrar);
  process.on("SIGTERM", encerrar);

  return 0;
}

/**
 * Este módulo foi executado como programa, e não importado?
 *
 * Comparar `argv[1]` com `import.meta.url` direto NÃO funciona quando o pacote
 * está instalado: o npm cria `node_modules/.bin/expx-painel` como symlink, então
 * `argv[1]` é o link e `import.meta.url` é o arquivo real — a igualdade falha e
 * o CLI não roda, sem erro nenhum. `realpath` resolve os dois para o mesmo
 * caminho e faz a detecção valer nos dois casos.
 */
function executadoComoPrograma(): boolean {
  const argv = process.argv[1];
  if (argv === undefined) return false;
  const real = (p: string): string => {
    try {
      return realpathSync(p);
    } catch {
      return resolve(p);
    }
  };
  return real(argv) === real(fileURLToPath(import.meta.url));
}

const executadoDireto = executadoComoPrograma();

if (executadoDireto) {
  principal(process.argv.slice(2))
    .then((codigo) => {
      if (codigo !== 0) process.exit(codigo);
    })
    .catch((e: unknown) => {
      process.stderr.write(`erro ao subir o painel: ${String(e)}\n`);
      process.exit(1);
    });
}
