/* =====================================================================
   AIRFRAME — FUNZIONAMENTO DELLA PAGINA
   Legge i contenuti da content.js e li inserisce nella pagina.
   Normalmente non serve modificare questo file.
   ===================================================================== */

(function () {
  "use strict";

  var C = window.AIRFRAME || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, C);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16l14-8z"/></svg>';
  var CORNERS = '<span class="corner corner--tl"></span><span class="corner corner--tr"></span>' +
                '<span class="corner corner--bl"></span><span class="corner corner--br"></span>';

  /* ---------- Testi semplici ---------- */
  $$("[data-text]").forEach(function (node) {
    var value = get(node.getAttribute("data-text"));
    if (value) node.textContent = value;
    else node.hidden = true;
  });

  /* Titolo d'apertura: ogni parola entra dal basso, in sequenza */
  var heroTitle = $("#hero-title");
  if (heroTitle && C.hero && C.hero.title) {
    heroTitle.setAttribute("aria-label", C.hero.title);
    heroTitle.innerHTML = "";
    C.hero.title.split(/\s+/).forEach(function (word, i, arr) {
      var outer = el("span", { class: "w", "aria-hidden": "true" });
      var inner = el("span", { text: word });
      outer.style.setProperty("--i", i);
      outer.appendChild(inner);
      heroTitle.appendChild(outer);
      if (i < arr.length - 1) heroTitle.appendChild(document.createTextNode(" "));
    });
  }

  /* ---------- Logo ---------- */
  function renderLogo(target, height) {
    if (!target) return;
    var logo = C.logo || {};
    if (logo.image) {
      target.appendChild(el("img", { src: logo.image, alt: logo.text || "AIRFRAME", height: height }));
    } else {
      target.textContent = logo.text || "AIRFRAME";
    }
  }
  renderLogo($("[data-logo]"), 22);
  renderLogo($("[data-hero-logo]"), 32);
  if (C.logo && C.logo.text) document.title = document.title.replace("AIRFRAME", C.logo.text);

  /* ---------- Video d'apertura ---------- */
  var hero = C.hero || {};
  var video = $("[data-hero-video]");
  var toggle = $("[data-hero-toggle]");
  var userPaused = reduceMotion;

  function markReady() { document.body.classList.add("is-ready"); }

  if (video) {
    var small = window.matchMedia("(max-width: 700px)").matches;
    var src = (small && hero.videoMobile) ? hero.videoMobile : hero.video;
    if (hero.poster) video.poster = hero.poster;

    if (src) {
      video.src = src;
      video.muted = true;
      if (!reduceMotion) {
        var p = video.play();
        if (p && p.catch) p.catch(function () { setPaused(true); });
      }
    } else if (toggle) {
      toggle.hidden = true;
    }
    video.addEventListener("loadeddata", markReady, { once: true });
  }
  // Se il video tarda, l'apertura parte comunque mostrando il poster
  setTimeout(markReady, reduceMotion ? 0 : 900);

  function setPaused(paused) {
    if (!toggle) return;
    toggle.classList.toggle("is-paused", paused);
    toggle.setAttribute("aria-label", paused ? "Riproduci il video" : "Metti in pausa il video");
  }
  setPaused(userPaused);

  if (toggle && video) {
    toggle.addEventListener("click", function () {
      if (video.paused) { video.play(); userPaused = false; setPaused(false); }
      else { video.pause(); userPaused = true; setPaused(true); }
    });
  }

  /* Quando l'apertura non è visibile il video si ferma (risparmia batteria) */
  var heroSection = $(".hero");
  var topbar = $("[data-topbar]");
  if ("IntersectionObserver" in window && heroSection) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      if (video && video.src && !userPaused && !playerOpen) {
        if (e.isIntersecting) video.play().catch(function () {});
        else video.pause();
      }
    }, { threshold: 0.05 }).observe(heroSection);

    // Barra in alto: diventa scura dopo l'apertura
    var sentinel = el("div", { "aria-hidden": "true" });
    sentinel.style.cssText = "position:absolute;top:70vh;height:1px;width:1px;";
    heroSection.appendChild(sentinel);
    new IntersectionObserver(function (entries) {
      topbar.classList.toggle("is-solid", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Chi siamo ---------- */
  var about = C.about || {};
  var photo = $("[data-about-photo]");
  if (photo) {
    if (about.photo) { photo.src = about.photo; photo.alt = about.photoAlt || ""; }
    else photo.closest("figure").hidden = true;
  }
  var aboutBody = $("[data-about-body]");
  (about.paragraphs || []).forEach(function (txt) {
    aboutBody.appendChild(el("p", { text: txt }));
  });

  /* ---------- I nostri lavori ---------- */
  var works = (C.works && C.works.items) || [];
  var grid = $("[data-works]");

  works.forEach(function (work, index) {
    var btn = el("button", {
      class: "work", type: "button",
      "aria-label": "Guarda il video: " + work.title + (work.place ? ", " + work.place : "")
    });
    var cover = el("div", { class: "work__cover reveal" });
    if (work.cover) {
      cover.appendChild(el("img", {
        src: work.cover, alt: "", width: 1600, height: 900,
        loading: index === 0 ? "eager" : "lazy", decoding: "async"
      }));
    }
    cover.appendChild(el("div", { class: "work__frame", html: CORNERS, "aria-hidden": "true" }));
    cover.appendChild(el("span", { class: "work__play", html: ICON_PLAY, "aria-hidden": "true" }));

    var meta = el("div", { class: "work__meta" }, [
      el("h3", { class: "work__title", text: work.title }),
      work.place ? el("p", { class: "work__place", text: work.place }) : null
    ]);

    btn.appendChild(cover);
    btn.appendChild(meta);
    btn.addEventListener("click", function () { openPlayer(work); });
    grid.appendChild(el("li", {}, [btn]));
  });
  if (!works.length) $("#lavori").hidden = true;

  /* ---------- Player video ---------- */
  var player = $("[data-player]");
  var stage = $("[data-player-stage]");
  var playerTitle = $("[data-player-title]");
  var playerOpen = false;

  function embedUrl(url) {
    var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
    if (m) return "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0&playsinline=1";
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
    if (m) return "https://player.vimeo.com/video/" + m[1] + "?autoplay=1&dnt=1" + (m[2] ? "&h=" + m[2] : "");
    return null;
  }

  function openPlayer(work) {
    if (!work.video) return;
    stage.innerHTML = "";
    playerTitle.textContent = work.title + (work.place ? " — " + work.place : "");

    var embed = embedUrl(work.video);
    if (embed) {
      stage.appendChild(el("iframe", {
        src: embed, title: work.title,
        allow: "autoplay; fullscreen; picture-in-picture; encrypted-media",
        allowfullscreen: ""
      }));
    } else {
      var v = el("video", { src: work.video, controls: "", playsinline: "", preload: "auto" });
      if (work.cover) v.poster = work.cover;
      stage.appendChild(v);
      v.play().catch(function () {});
    }

    playerOpen = true;
    if (video && !video.paused) video.pause();
    document.body.classList.add("is-locked");
    if (player.showModal) player.showModal(); else player.setAttribute("open", "");
  }

  function closePlayer() {
    if (player.close) player.close(); else player.removeAttribute("open");
  }

  player.addEventListener("close", function () {
    stage.innerHTML = "";               // ferma la riproduzione
    playerOpen = false;
    document.body.classList.remove("is-locked");
    if (video && video.src && !userPaused) video.play().catch(function () {});
  });
  $("[data-player-close]").addEventListener("click", closePlayer);
  // Clic fuori dal video = chiudi
  player.addEventListener("click", function (e) {
    if (e.target === player || e.target === stage) closePlayer();
  });

  /* ---------- Comparsa immagini ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }

  /* ---------- Contatti diretti e social ---------- */
  var contact = C.contact || {};
  var direct = $("[data-direct]");
  if (contact.email) {
    direct.appendChild(el("li", {}, [el("a", { href: "mailto:" + contact.email, text: contact.email })]));
  }
  if (contact.phone) {
    direct.appendChild(el("li", {}, [el("a", { href: "tel:" + contact.phone.replace(/[^\d+]/g, ""), text: contact.phone })]));
  }

  var social = $("[data-social]");
  (C.social || []).filter(function (s) { return s.url; }).forEach(function (s) {
    social.appendChild(el("li", {}, [
      el("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", text: s.name })
    ]));
  });
  if (!social.children.length) social.hidden = true;

  /* ---------- Modulo contatti ---------- */
  var form = $("[data-form]");
  var status = $("[data-status]");
  var submit = $("[data-submit]");
  var settings = C.form || {};

  var rules = {
    name: function (v) { return v.trim() ? "" : "Inserisci il tuo nome."; },
    email: function (v) {
      if (!v.trim()) return "Inserisci la tua email.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Controlla l'email: sembra incompleta.";
    },
    message: function (v) {
      return v.trim().length >= 10 ? "" : "Scrivi qualche parola in più sul progetto.";
    }
  };

  function check(field) {
    var msg = rules[field.name](field.value);
    var err = $("#" + field.id + "-err");
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) field.setAttribute("aria-describedby", field.id + "-err");
    else field.removeAttribute("aria-describedby");
    err.textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var f = form.elements[name];
    f.addEventListener("blur", function () { if (f.value) check(f); });
    f.addEventListener("input", function () { if (f.getAttribute("aria-invalid") === "true") check(f); });
  });

  function setStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle("is-error", !!isError);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("");

    var fields = Object.keys(rules).map(function (n) { return form.elements[n]; });
    var valid = fields.map(check).every(Boolean);
    if (!valid) {
      fields.filter(function (f) { return f.getAttribute("aria-invalid") === "true"; })[0].focus();
      return;
    }

    var data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim()
    };

    // Bot: finge l'invio senza spedire nulla
    if (form.elements.botcheck.checked) { form.reset(); setStatus("Messaggio inviato. Grazie!"); return; }

    // Nessun servizio configurato: apre la posta del visitatore
    if (!settings.accessKey) {
      var body = data.message + "\n\n— " + data.name + " (" + data.email + ")";
      window.location.href = "mailto:" + (contact.email || "") +
        "?subject=" + encodeURIComponent(settings.subject || "Richiesta dal sito") +
        "&body=" + encodeURIComponent(body);
      setStatus("Si sta aprendo il programma di posta con il messaggio già compilato.");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Invio in corso…";

    fetch(settings.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: settings.accessKey,
        subject: settings.subject,
        from_name: (C.logo && C.logo.text) || "AIRFRAME",
        replyto: data.email,
        name: data.name,
        email: data.email,
        message: data.message,
        botcheck: false
      })
    })
      .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
      .then(function (res) {
        if (!res.success) throw new Error(res.message || "invio non riuscito");
        form.reset();
        fields.forEach(function (f) { f.removeAttribute("aria-invalid"); });
        setStatus("Messaggio inviato. Vi risponderemo al più presto.");
      })
      .catch(function () {
        setStatus("Il messaggio non è partito. Riprova tra poco" +
          (contact.email ? " oppure scrivi a " + contact.email : "") + ".", true);
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = "Invia messaggio";
      });
  });

  /* ---------- Anno nel piè di pagina ---------- */
  var year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
