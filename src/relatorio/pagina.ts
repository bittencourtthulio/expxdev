import { renderizar, escapar, type ItemSumario } from "./markdown.js";

/**
 * Documento HTML de um relatório, servido em aba própria.
 *
 * É uma página autocontida: nada de CDN, nada de fetch. O usuário imprime,
 * salva em PDF ou baixa o .md sem depender do painel continuar no ar — e o
 * `@media print` é o que faz o "Salvar como PDF" do navegador sair com cara
 * de documento, não de captura de tela.
 */

export type DadosRelatorio = {
  tipo: "tecnico" | "uso";
  titulo: string;
  oc_id: string;
  tipo_ocorrencia: string;
  fechado_em: string;
  modulo_afetado: string[];
  arquivos_alterados?: string[];
  testes_adicionados?: number | null;
  corpo: string;
  /** Nome sugerido do arquivo ao baixar o .md. */
  nomeArquivo: string;
};

const ROTULO_TIPO = {
  tecnico: "Relatório técnico",
  uso: "Relatório de uso",
} as const;

const SUBTITULO = {
  tecnico: "Documento de engenharia — causa, correção e cobertura de teste.",
  uso: "Documento para o cliente — o que mudou, em linguagem de negócio.",
} as const;

function sumarioHtml(itens: ItemSumario[]): string {
  if (itens.length < 3) return "";
  return `
    <nav class="sumario" aria-label="Sumário">
      <h2>Sumário</h2>
      <ol>
        ${itens
          .map((i) => `<li class="n${String(i.nivel)}"><a href="#${i.id}">${escapar(i.texto)}</a></li>`)
          .join("\n        ")}
      </ol>
    </nav>`;
}

function metaHtml(d: DadosRelatorio): string {
  const linhas: Array<[string, string]> = [
    ["Ocorrência", d.oc_id],
    ["Tipo", d.tipo_ocorrencia],
    ["Fechado em", d.fechado_em],
    ["Módulos", d.modulo_afetado.length > 0 ? d.modulo_afetado.join(", ") : "—"],
  ];
  if (d.tipo === "tecnico") {
    if (d.arquivos_alterados !== undefined) {
      linhas.push(["Arquivos alterados", String(d.arquivos_alterados.length)]);
    }
    if (d.testes_adicionados !== undefined && d.testes_adicionados !== null) {
      linhas.push(["Testes adicionados", String(d.testes_adicionados)]);
    }
  }
  return `
    <dl class="meta">
      ${linhas.map(([k, v]) => `<div><dt>${escapar(k)}</dt><dd>${escapar(v)}</dd></div>`).join("\n      ")}
    </dl>`;
}

function arquivosHtml(d: DadosRelatorio): string {
  if (d.tipo !== "tecnico" || !d.arquivos_alterados || d.arquivos_alterados.length === 0) return "";
  return `
    <section class="anexo">
      <h2>Arquivos alterados</h2>
      <ul class="arquivos">
        ${d.arquivos_alterados.map((a) => `<li><code>${escapar(a)}</code></li>`).join("\n        ")}
      </ul>
    </section>`;
}

export function paginaRelatorio(d: DadosRelatorio): string {
  const { html, sumario } = renderizar(d.corpo);
  const rotulo = ROTULO_TIPO[d.tipo];
  const titulo = `${rotulo} — ${d.titulo}`;

  // O .md vai embutido em base64 para o botão de download funcionar offline,
  // depois que o painel já tiver sido encerrado.
  const md = Buffer.from(d.corpo, "utf8").toString("base64");

  /**
   * String literal segura dentro de <script>.
   *
   * JSON.stringify NÃO basta: ele não escapa `<`, então um valor contendo
   * `</script>` fecharia a tag e o resto viraria HTML — XSS a partir do
   * frontmatter de um arquivo. Escapamos a barra e os sinais de menor/maior.
   */
  const literal = (s: string): string =>
    JSON.stringify(s).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028|\u2029/g, "");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapar(titulo)}</title>
<style>
  :root {
    --tinta: #16181d;
    --tinta-suave: #5a6169;
    --tinta-tenue: #878d96;
    --papel: #ffffff;
    --fundo: #f4f5f7;
    --linha: #e2e5e9;
    --linha-forte: #cbd1d8;
    --marca: ${d.tipo === "tecnico" ? "#2f5d8a" : "#2f6f4e"};
    --marca-fraca: ${d.tipo === "tecnico" ? "#eaf1f8" : "#e9f2ec"};
    --serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--fundo);
    color: var(--tinta);
    font-family: var(--sans);
    font-size: 16px;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }

  /* ---- barra de ações ---- */
  .acoes {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: rgba(255,255,255,.85);
    backdrop-filter: saturate(180%) blur(12px);
    border-bottom: 1px solid var(--linha);
  }
  .acoes .id {
    font-family: var(--mono); font-size: 12px; color: var(--tinta-tenue);
    margin-right: auto;
  }
  .acoes button {
    display: inline-flex; align-items: center; gap: 6px;
    font: inherit; font-size: 13px; font-weight: 500;
    padding: 7px 14px; border-radius: 6px; cursor: pointer;
    border: 1px solid var(--linha-forte); background: #fff; color: var(--tinta);
  }
  .acoes button:hover { border-color: var(--marca); color: var(--marca); }
  .acoes button.principal {
    background: var(--marca); border-color: var(--marca); color: #fff;
  }
  .acoes button.principal:hover { filter: brightness(1.08); color: #fff; }
  .acoes svg { width: 15px; height: 15px; }

  /* ---- folha ---- */
  .folha {
    max-width: 820px; margin: 26px auto 60px;
    background: var(--papel); border: 1px solid var(--linha);
    border-radius: 4px; box-shadow: 0 1px 3px rgba(22,24,29,.06), 0 12px 32px rgba(22,24,29,.05);
    padding: 60px 68px 72px;
  }

  /* ---- capa ---- */
  .capa { border-bottom: 2px solid var(--tinta); padding-bottom: 26px; margin-bottom: 30px; }
  .selo {
    display: inline-block; font-size: 11px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase;
    color: var(--marca); background: var(--marca-fraca);
    padding: 4px 10px; border-radius: 3px; margin-bottom: 16px;
  }
  .capa h1 {
    font-family: var(--serif); font-weight: 600;
    font-size: 34px; line-height: 1.18; letter-spacing: -.015em;
    margin: 0 0 10px;
  }
  .capa .subtitulo { font-size: 15px; color: var(--tinta-suave); margin: 0; }

  /* ---- metadados ---- */
  dl.meta {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 18px 26px; margin: 0 0 34px; padding: 20px 24px;
    background: var(--fundo); border-radius: 6px;
  }
  dl.meta div { min-width: 0; }
  dl.meta dt {
    font-size: 10.5px; font-weight: 700; letter-spacing: .09em;
    text-transform: uppercase; color: var(--tinta-tenue); margin-bottom: 4px;
  }
  dl.meta dd { margin: 0; font-size: 14.5px; font-weight: 500; word-break: break-word; }

  /* ---- sumário ---- */
  .sumario {
    margin: 0 0 34px; padding: 20px 24px;
    border: 1px solid var(--linha); border-radius: 6px;
  }
  .sumario h2 {
    font-size: 11px; font-weight: 700; letter-spacing: .09em;
    text-transform: uppercase; color: var(--tinta-tenue);
    margin: 0 0 12px; padding: 0; border: none;
  }
  .sumario ol { list-style: none; margin: 0; padding: 0; counter-reset: s; }
  .sumario li { margin: 5px 0; font-size: 14px; }
  .sumario li.n2 { padding-left: 18px; font-size: 13.5px; }
  .sumario li.n3 { padding-left: 36px; font-size: 13px; color: var(--tinta-suave); }
  .sumario a { color: var(--tinta); text-decoration: none; }
  .sumario a:hover { color: var(--marca); text-decoration: underline; }

  /* ---- corpo ---- */
  .corpo { font-size: 16px; }
  .corpo h1, .corpo h2, .corpo h3, .corpo h4 {
    font-family: var(--serif); font-weight: 600; letter-spacing: -.01em;
    scroll-margin-top: 70px;
  }
  .corpo h1 { font-size: 27px; margin: 40px 0 14px; }
  .corpo h2 {
    font-size: 21px; margin: 36px 0 13px;
    padding-bottom: 7px; border-bottom: 1px solid var(--linha);
  }
  .corpo h3 { font-size: 17.5px; margin: 28px 0 10px; }
  .corpo h4 { font-size: 15.5px; margin: 22px 0 8px; }
  .corpo p { margin: 0 0 15px; }
  .corpo ul, .corpo ol { margin: 0 0 15px; padding-left: 24px; }
  .corpo li { margin: 5px 0; }
  .corpo a { color: var(--marca); }
  .corpo strong { font-weight: 650; }

  .corpo code {
    font-family: var(--mono); font-size: .875em;
    background: var(--fundo); border: 1px solid var(--linha);
    padding: 1px 5px; border-radius: 4px;
  }
  .corpo pre.bloco {
    background: #1f2228; color: #e6e9ee;
    padding: 16px 18px; border-radius: 6px; overflow-x: auto;
    font-family: var(--mono); font-size: 13px; line-height: 1.6;
    margin: 0 0 18px;
  }
  .corpo pre.bloco code { background: none; border: none; padding: 0; color: inherit; font-size: inherit; }

  .corpo blockquote {
    margin: 0 0 18px; padding: 12px 18px;
    border-left: 3px solid var(--marca); background: var(--marca-fraca);
    border-radius: 0 4px 4px 0; color: var(--tinta-suave);
  }
  .corpo blockquote p:last-child { margin-bottom: 0; }
  .corpo hr { border: none; border-top: 1px solid var(--linha); margin: 30px 0; }

  .rolagem { overflow-x: auto; margin: 0 0 18px; }
  .corpo table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
  .corpo th {
    text-align: left; font-size: 11px; font-weight: 700;
    letter-spacing: .06em; text-transform: uppercase; color: var(--tinta-tenue);
    padding: 9px 12px; border-bottom: 2px solid var(--linha-forte);
  }
  .corpo td { padding: 9px 12px; border-bottom: 1px solid var(--linha); vertical-align: top; }
  .corpo tbody tr:last-child td { border-bottom: none; }

  /* ---- anexo ---- */
  .anexo { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--linha); }
  .anexo h2 {
    font-family: var(--serif); font-size: 19px; font-weight: 600; margin: 0 0 12px;
  }
  ul.arquivos { list-style: none; margin: 0; padding: 0; }
  ul.arquivos li { margin: 5px 0; }
  ul.arquivos code { font-size: 13px; }

  /* ---- rodapé ---- */
  .rodape {
    margin-top: 44px; padding-top: 18px; border-top: 1px solid var(--linha);
    font-size: 12px; color: var(--tinta-tenue);
    display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }

  /* ---- impressão / PDF ---- */
  @page { size: A4; margin: 18mm 16mm; }

  @media print {
    body { background: #fff; font-size: 11.5pt; line-height: 1.5; }
    .acoes { display: none !important; }
    .folha {
      max-width: none; margin: 0; padding: 0;
      border: none; box-shadow: none; border-radius: 0;
    }
    .capa { break-after: avoid; }
    .capa h1 { font-size: 24pt; }
    dl.meta { background: #f7f8f9; break-inside: avoid; }
    .sumario { break-inside: avoid; break-after: page; }
    .corpo h1, .corpo h2, .corpo h3 { break-after: avoid; }
    .corpo pre.bloco, .corpo blockquote, .corpo table, .anexo { break-inside: avoid; }
    .corpo pre.bloco { background: #f4f5f7; color: #16181d; border: 1px solid var(--linha); }
    .corpo a { color: inherit; text-decoration: underline; }
    .rodape { break-inside: avoid; }
    tr, li { break-inside: avoid; }
  }

  @media (max-width: 720px) {
    .folha { padding: 32px 22px 44px; margin: 12px; }
    .capa h1 { font-size: 26px; }
  }
</style>
</head>
<body>

<div class="acoes" role="toolbar" aria-label="Ações do relatório">
  <span class="id">${escapar(d.oc_id)}</span>
  <button class="principal" onclick="window.print()" title="Imprimir ou salvar como PDF">
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4.5 6V2.5h7V6M4.5 12H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1.5"/>
      <rect x="4.5" y="10" width="7" height="3.5"/>
    </svg>
    Imprimir / PDF
  </button>
  <button onclick="baixarMd()" title="Baixar o arquivo Markdown original">
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8 2.5v7.5M5.2 7.4 8 10.2l2.8-2.8M2.8 12.4v1.1h10.4v-1.1"/>
    </svg>
    Baixar .md
  </button>
</div>

<article class="folha">
  <header class="capa">
    <span class="selo">${escapar(rotulo)}</span>
    <h1>${escapar(d.titulo)}</h1>
    <p class="subtitulo">${SUBTITULO[d.tipo]}</p>
  </header>

  ${metaHtml(d)}
  ${sumarioHtml(sumario)}

  <div class="corpo">
${html}
  </div>

  ${arquivosHtml(d)}

  <footer class="rodape">
    <span>${escapar(d.oc_id)} · ${escapar(rotulo)}</span>
    <span>Gerado pelo expx-painel a partir de ${escapar(d.nomeArquivo)}</span>
  </footer>
</article>

<script>
  var MD_B64 = "${md}";
  var NOME = ${literal(d.nomeArquivo)};
  function baixarMd() {
    try {
      var bin = atob(MD_B64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      var url = URL.createObjectURL(new Blob([bytes], { type: "text/markdown;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = url; a.download = NOME; a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) {
      alert("Não foi possível baixar o arquivo neste navegador.");
    }
  }
  document.title = ${literal(titulo)};
</script>
</body>
</html>`;
}
