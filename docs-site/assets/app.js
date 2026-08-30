/*
 * Comportamento da documentacao: navegacao por secao, busca, tema,
 * indice da secao e copia de bloco de codigo.
 *
 * Sem dependencia externa. O site inteiro e uma pagina so — cada secao e
 * mostrada por vez, o que mantem o Ctrl+F do navegador util dentro do assunto
 * em vez de espalhar acerto por doze capitulos.
 */

(function () {
  "use strict";

  /* ---------- diagramas ---------- */

  document.querySelectorAll("[data-diagrama]").forEach(function (alvo) {
    var svg = window.DIAGRAMAS && window.DIAGRAMAS[alvo.dataset.diagrama];
    if (svg) alvo.innerHTML = svg;
  });

  /* ---------- tema ---------- */

  var raiz = document.documentElement;
  var btnTema = document.getElementById("tema");
  var iconeTema = document.getElementById("icone-tema");

  var SOL = '<circle cx="8" cy="8" r="3.1"/><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1"/>';
  var LUA = '<path d="M13.5 9.6A6 6 0 0 1 6.4 2.5a6 6 0 1 0 7.1 7.1z"/>';

  /* matchMedia falta em alguns ambientes de renderizacao; sem ele o padrao e claro. */
  var consultaEscuro = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  function temaEscuro() {
    var marcado = raiz.getAttribute("data-theme");
    if (marcado) return marcado === "dark";
    return consultaEscuro ? consultaEscuro.matches : false;
  }

  function pintarIcone() {
    iconeTema.innerHTML = temaEscuro() ? SOL : LUA;
  }

  try {
    var salvo = localStorage.getItem("expx-tema");
    if (salvo === "dark" || salvo === "light") raiz.setAttribute("data-theme", salvo);
  } catch (e) { /* navegador com armazenamento bloqueado: segue no tema do sistema */ }

  pintarIcone();

  btnTema.addEventListener("click", function () {
    var novo = temaEscuro() ? "light" : "dark";
    raiz.setAttribute("data-theme", novo);
    try { localStorage.setItem("expx-tema", novo); } catch (e) { /* idem */ }
    pintarIcone();
  });

  if (consultaEscuro && consultaEscuro.addEventListener) {
    consultaEscuro.addEventListener("change", pintarIcone);
  }

  /* ---------- navegacao por secao ---------- */

  var secoes = Array.prototype.slice.call(document.querySelectorAll(".secao"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var lateral = document.getElementById("lateral");
  var indice = document.getElementById("indice");

  function idDaSecaoDe(elemento) {
    var s = elemento.closest(".secao");
    return s ? s.id : null;
  }

  function montarIndice(secao) {
    var titulos = secao.querySelectorAll("h2[id]");
    if (titulos.length < 2) { indice.innerHTML = ""; return; }

    var html = '<p class="indice__titulo">Nesta página</p>';
    titulos.forEach(function (h) {
      html += '<a href="#' + h.id + '">' + h.textContent + "</a>";
    });
    indice.innerHTML = html;

    indice.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        var alvo = document.getElementById(a.getAttribute("href").slice(1));
        if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function mostrar(id, ancora) {
    var secao = document.getElementById(id);
    if (!secao || !secao.classList.contains("secao")) return false;

    secoes.forEach(function (s) { s.classList.toggle("visivel", s === secao); });
    links.forEach(function (l) { l.classList.toggle("ativo", l.dataset.secao === id); });

    montarIndice(secao);
    lateral.classList.remove("aberta");
    document.getElementById("menu").setAttribute("aria-expanded", "false");

    var alvo = ancora && document.getElementById(ancora);
    if (alvo) {
      alvo.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo(0, 0);
    }

    var titulo = secao.querySelector("h1");
    document.title = titulo
      ? titulo.textContent + " · Documentação do método Expx"
      : "Documentação do método Expx";

    return true;
  }

  /* Um id pode ser o de uma secao ou o de um titulo dentro dela. */
  function irPara(id) {
    if (mostrar(id)) return;

    var alvo = document.getElementById(id);
    if (!alvo) { mostrar("visao-geral"); return; }

    var secao = idDaSecaoDe(alvo);
    if (secao) mostrar(secao, id);
  }

  function doHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    irPara(id || "visao-geral");
  }

  window.addEventListener("hashchange", doHash);
  doHash();

  /* Links internos trocam de secao sem recarregar. */
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest('a[href^="#"]');
    if (!a || a.closest(".indice")) return;
    var id = decodeURIComponent(a.getAttribute("href").slice(1));
    if (!id) return;
    ev.preventDefault();
    if (location.hash === "#" + id) irPara(id);
    else location.hash = id;
  });

  document.getElementById("menu").addEventListener("click", function () {
    var aberta = lateral.classList.toggle("aberta");
    this.setAttribute("aria-expanded", String(aberta));
  });

  /* ---------- busca ---------- */

  /*
   * O indice e montado do proprio DOM na carga: cada titulo vira uma entrada,
   * e o texto do bloco ate o titulo seguinte vira o corpo pesquisavel. Assim a
   * busca nunca fica defasada em relacao ao conteudo.
   */
  var entradas = [];

  secoes.forEach(function (secao) {
    var nomeSecao = secao.querySelector("h1") ? secao.querySelector("h1").textContent : secao.id;

    entradas.push({
      titulo: nomeSecao,
      secao: nomeSecao,
      id: secao.id,
      corpo: (secao.querySelector(".lede") || {}).textContent || "",
    });

    secao.querySelectorAll("h2[id], h3[id]").forEach(function (h) {
      var corpo = "";
      var no = h.nextElementSibling;
      while (no && !/^H[123]$/.test(no.tagName)) {
        corpo += " " + no.textContent;
        no = no.nextElementSibling;
      }
      entradas.push({
        titulo: h.textContent,
        secao: nomeSecao,
        id: h.id,
        corpo: corpo,
      });
    });
  });

  function normalizar(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  entradas.forEach(function (e) {
    e.buscaTitulo = normalizar(e.titulo);
    e.buscaCorpo = normalizar(e.corpo);
    e.buscaSecao = normalizar(e.secao);
  });

  var campo = document.getElementById("busca");
  var caixa = document.getElementById("resultados");
  var marcado = -1;

  function pontuar(entrada, termo) {
    if (entrada.buscaTitulo === termo) return 100;
    if (entrada.buscaTitulo.startsWith(termo)) return 70;
    if (entrada.buscaTitulo.includes(termo)) return 50;
    if (entrada.buscaSecao.includes(termo)) return 22;
    if (entrada.buscaCorpo.includes(termo)) return 12;
    return 0;
  }

  function escapar(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function realcar(texto, termo) {
    var i = normalizar(texto).indexOf(termo);
    if (i < 0) return escapar(texto);
    return escapar(texto.slice(0, i)) +
      "<mark>" + escapar(texto.slice(i, i + termo.length)) + "</mark>" +
      escapar(texto.slice(i + termo.length));
  }

  function fechar() {
    caixa.hidden = true;
    campo.setAttribute("aria-expanded", "false");
    marcado = -1;
  }

  function buscar() {
    var termo = normalizar(campo.value.trim());
    if (termo.length < 2) { fechar(); return; }

    var achados = entradas
      .map(function (e) { return { e: e, p: pontuar(e, termo) }; })
      .filter(function (r) { return r.p > 0; })
      .sort(function (a, b) { return b.p - a.p; })
      .slice(0, 9);

    if (achados.length === 0) {
      caixa.innerHTML = '<p class="resultados__vazio">Nada encontrado para “' + escapar(campo.value.trim()) + '”.</p>';
    } else {
      caixa.innerHTML = achados.map(function (r) {
        return '<a class="resultado" role="option" href="#' + r.e.id + '">' +
          realcar(r.e.titulo, termo) +
          '<span class="resultado__secao">' + escapar(r.e.secao) + "</span></a>";
      }).join("");
    }

    caixa.hidden = false;
    campo.setAttribute("aria-expanded", "true");
    marcado = -1;
  }

  campo.addEventListener("input", buscar);
  campo.addEventListener("focus", function () { if (campo.value.trim().length >= 2) buscar(); });

  campo.addEventListener("keydown", function (ev) {
    var itens = caixa.querySelectorAll(".resultado");

    if (ev.key === "Escape") { fechar(); campo.blur(); return; }
    if (!itens.length) return;

    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      marcado += ev.key === "ArrowDown" ? 1 : -1;
      if (marcado < 0) marcado = itens.length - 1;
      if (marcado >= itens.length) marcado = 0;
      itens.forEach(function (n, i) { n.classList.toggle("ativo", i === marcado); });
      itens[marcado].scrollIntoView({ block: "nearest" });
      return;
    }

    if (ev.key === "Enter") {
      ev.preventDefault();
      var escolhido = itens[marcado >= 0 ? marcado : 0];
      if (escolhido) {
        location.hash = escolhido.getAttribute("href").slice(1);
        fechar();
        campo.blur();
      }
    }
  });

  caixa.addEventListener("click", function () { fechar(); campo.blur(); });

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".busca")) fechar();
  });

  /* "/" foca a busca, como na maioria dos sites de documentacao. */
  document.addEventListener("keydown", function (ev) {
    var editando = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (ev.key === "/" && !editando) {
      ev.preventDefault();
      campo.focus();
      campo.select();
    }
  });

  /* ---------- copiar codigo ---------- */

  document.querySelectorAll("[data-copiar]").forEach(function (bloco) {
    var botao = bloco.querySelector(".codigo__copiar");
    var codigo = bloco.querySelector("code");
    if (!botao || !codigo) return;

    botao.addEventListener("click", function () {
      var texto = codigo.innerText;

      function feito() {
        botao.textContent = "Copiado";
        botao.classList.add("feito");
        setTimeout(function () {
          botao.textContent = "Copiar";
          botao.classList.remove("feito");
        }, 1600);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(feito, function () { botao.textContent = "Falhou"; });
        return;
      }

      /* file:// e http sem TLS nao tem clipboard: cai para o caminho antigo. */
      var area = document.createElement("textarea");
      area.value = texto;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); feito(); }
      catch (e) { botao.textContent = "Falhou"; }
      document.body.removeChild(area);
    });
  });

  /* ---------- indice da secao acompanha a rolagem ---------- */

  if (!window.IntersectionObserver) return;

  var observador = new IntersectionObserver(function (entradasObs) {
    entradasObs.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      var link = indice.querySelector('a[href="#' + entrada.target.id + '"]');
      if (!link) return;
      indice.querySelectorAll("a").forEach(function (a) { a.classList.remove("ativo"); });
      link.classList.add("ativo");
    });
  }, { rootMargin: "-70px 0px -75% 0px" });

  document.querySelectorAll("h2[id]").forEach(function (h) { observador.observe(h); });
})();
