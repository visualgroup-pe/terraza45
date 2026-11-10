/* ==========================================================
   Terraza 45 – Show Bar del Despecho
   JavaScript principal (vanilla, sin dependencias)
   ----------------------------------------------------------
   Índice:
     1. Utilidades
     2. Configuración del negocio (textos y enlaces)
     3. Cabecera y menú responsive
     4. Hero: fotos en bucle + parallax + "hoy abrimos"
     5. Animaciones al hacer scroll y contadores
     6. Enlaces de WhatsApp con mensaje prellenado
     7. Carta digital (data/carta.json)
     8. Galería + lightbox (data/galeria.json)
     9. Opiniones (data/opiniones.json)
    10. Formulario de reservas → WhatsApp (o Formspree)
    11. Medición (eventos para Google Analytics 4)
   ========================================================== */
(function () {
  'use strict';

  var CFG = window.T45_CONFIG || {};
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  /* ---------- 1. Utilidades ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // Escapa texto para insertarlo en HTML de forma segura
  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Carga un JSON de /data (rutas relativas: funciona en GitHub Pages bajo /nombre-repo/)
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return r.json();
    });
  }

  // Mensaje cuando no se puede leer un JSON (normalmente por abrir el archivo con doble clic)
  function errorCarga(el, que) {
    el.innerHTML = '<p class="loading">No se pudo cargar ' + que + '. ' +
      (location.protocol === 'file:' ? 'Abre el sitio con un servidor local (ver README).' : 'Intenta recargar la página.') + '</p>';
  }

  // Fecha y hora actuales en Lima (independiente de la zona horaria del visitante)
  function ahoraLima() {
    try {
      var p = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short'
      }).formatToParts(new Date());
      var o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
      return { iso: o.year + '-' + o.month + '-' + o.day, dia: dow, min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { iso: d.toISOString().slice(0, 10), dia: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function horaAMPM(hhmm) {
    var h = parseInt(hhmm.split(':')[0], 10), m = hhmm.split(':')[1] || '00';
    var suf = h >= 12 ? 'p.m.' : 'a.m.';
    return ((h % 12) || 12) + ':' + m + ' ' + suf;
  }

  function waURL(texto) {
    return 'https://wa.me/' + (CFG.whatsappNumero || '51952573180') + '?text=' + encodeURIComponent(texto);
  }

  /* ---------- 2. Configuración del negocio ---------- */
  function applyConfig() {
    var map = {
      telefono: CFG.telefono,
      direccion: CFG.direccion,
      horarioTexto: CFG.horario && CFG.horario.texto,
      horarioCorto: CFG.horario && CFG.horario.corto
    };
    $$('[data-config]').forEach(function (el) {
      var v = map[el.getAttribute('data-config')];
      if (v) el.textContent = v;
    });
    if (CFG.telefonoLink) {
      $$('[data-config-href="tel"]').forEach(function (a) { a.href = 'tel:' + CFG.telefonoLink; });
    }
    if (CFG.whatsappLink) {
      $$('[data-wa-link]').forEach(function (a) { a.href = CFG.whatsappLink; });
    }
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- 3. Cabecera y menú responsive ---------- */
  function initHeader() {
    var header = $('#header'), burger = $('#burger'), nav = $('#nav');
    if (!header) return;

    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function setMenu(open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('menu-open', open);
    }
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    // Cierra el menú al elegir una opción o con la tecla Escape
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
    });

    // Resalta en el menú la sección visible
    var links = $$('.nav__link');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) io.observe(s); });
    }
  }

  /* ---------- 4. Hero ---------- */
  function initHero() {
    // Fotos de fondo que se alternan cada 5 s
    var slides = $$('.hero__slide');
    if (slides.length > 1) {
      var i = 0;
      setInterval(function () {
        if (document.hidden) return;
        slides[i].classList.remove('is-active');
        i = (i + 1) % slides.length;
        slides[i].classList.add('is-active');
      }, 5000);
    }

    // Parallax suave del fondo
    var bg = $('[data-parallax]'), hero = $('.hero');
    if (bg && hero && !REDUCED) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < hero.offsetHeight) {
            bg.style.transform = 'translate3d(0,' + (y * 0.3) + 'px,0)';
            hero.style.setProperty('--fade', Math.max(0, 1 - y / (hero.offsetHeight * 0.8)).toFixed(3));
          }
          ticking = false;
        });
      }, { passive: true });
    }

    // Aviso "Hoy abrimos" según el horario de config.js (hora de Lima)
    var hoyEl = $('[data-hoy]');
    var h = CFG.horario;
    if (hoyEl && h && h.dias && h.dias.length) {
      var now = ahoraLima();
      var ap = h.apertura || '18:00';
      var apMin = parseInt(ap.split(':')[0], 10) * 60 + parseInt(ap.split(':')[1] || 0, 10);
      var txt;
      if (h.dias.indexOf(now.dia) > -1) {
        txt = now.min < apMin ? 'Hoy abrimos a las ' + horaAMPM(ap) : '¡Hoy hay show! Estamos abiertos';
      } else {
        for (var k = 1; k <= 7; k++) {
          var d = (now.dia + k) % 7;
          if (h.dias.indexOf(d) > -1) { txt = 'Próxima noche: ' + DIAS[d] + ' ' + horaAMPM(ap); break; }
        }
      }
      if (txt) { hoyEl.textContent = txt; hoyEl.hidden = false; }
    }
  }

  /* ---------- 5. Animaciones al hacer scroll ---------- */
  var revealObserver = null;
  function initReveal() {
    if (!('IntersectionObserver' in window) || REDUCED) {
      document.documentElement.classList.add('no-reveal');
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    observeReveal(document);
  }
  // Se llama también al insertar contenido nuevo (carta, galería, opiniones)
  function observeReveal(ctx) {
    if (!revealObserver) return;
    $$('[data-reveal]:not(.is-visible)', ctx).forEach(function (el) { revealObserver.observe(el); });
  }

  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length || REDUCED || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, end = parseFloat(el.getAttribute('data-count'));
        var dec = parseInt(el.getAttribute('data-decimals') || '0', 10), t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
          el.textContent = (end * e).toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. WhatsApp con mensaje prellenado ---------- */
  function initWaMsg() {
    $$('[data-wa-msg]').forEach(function (a) {
      a.href = waURL(a.getAttribute('data-wa-msg'));
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- 7. Carta digital ---------- */
  function initCarta() {
    var tabs = $('#carta-tabs'), grid = $('#carta-grid'), nota = $('#carta-nota');
    if (!tabs || !grid) return;

    getJSON('data/carta.json').then(function (data) {
      var cats = data.categorias || [];
      var moneda = data.moneda || 'S/';
      if (nota && data.nota) nota.textContent = data.nota;

      tabs.innerHTML = cats.map(function (c, i) {
        return '<button class="tab' + (i === 0 ? ' is-active' : '') + '" role="tab" type="button" id="tab-' + esc(c.id) +
          '" aria-selected="' + (i === 0) + '" aria-controls="carta-grid" tabindex="' + (i === 0 ? 0 : -1) +
          '" data-cat="' + i + '">' + esc(c.nombre) + '<span class="tab__count">' + (c.items || []).length + '</span></button>';
      }).join('');

      function render(idx) {
        var c = cats[idx];
        grid.setAttribute('aria-labelledby', 'tab-' + c.id);
        grid.innerHTML = (c.items || []).map(function (it, n) {
          var precio = typeof it.precio === 'number' ? moneda + ' ' + it.precio.toFixed(it.precio % 1 ? 2 : 0) : esc(it.precio);
          return '<article class="plato" data-reveal style="--d:' + (n * 0.05) + 's">' +
            '<div class="plato__img"><img src="assets/img/' + esc(it.foto) + '" alt="' + esc(it.nombre) + ' – ' + esc(c.nombre) + ' en Terraza 45" ' +
            'width="800" height="600" loading="lazy" decoding="async">' +
            (it.etiqueta ? '<span class="plato__tag">' + esc(it.etiqueta) + '</span>' : '') + '</div>' +
            '<div class="plato__body"><div class="plato__top"><h3>' + esc(it.nombre) + '</h3>' +
            '<span class="plato__precio">' + precio + '</span></div>' +
            '<p>' + esc(it.descripcion) + '</p></div></article>';
        }).join('');
        // Si una foto no existe, muestra el placeholder de su categoría
        $$('img', grid).forEach(function (img) {
          img.addEventListener('error', function () {
            img.onerror = null;
            img.src = 'assets/img/carta/placeholders/' + (c.id === 'cervezas' ? 'cerveza' : c.id === 'piqueos' ? 'piqueo' : c.id === 'comida' ? 'comida' : 'bebida') + '.svg';
          }, { once: true });
        });
        observeReveal(grid);
      }

      function select(btn, focus) {
        $$('.tab', tabs).forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
          b.tabIndex = on ? 0 : -1;
        });
        if (focus) btn.focus();
        render(parseInt(btn.getAttribute('data-cat'), 10));
        track('carta_categoria', { categoria: btn.textContent });
      }

      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('.tab');
        if (b) select(b);
      });
      // Navegación con flechas del teclado entre pestañas
      tabs.addEventListener('keydown', function (e) {
        var all = $$('.tab', tabs), cur = all.indexOf(document.activeElement);
        if (cur < 0) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          select(all[(cur + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length], true);
        }
      });

      if (cats.length) render(0);
    }).catch(function () { errorCarga(grid, 'la carta'); });
  }

  /* ---------- 8. Galería + lightbox ---------- */
  function initGaleria() {
    var grid = $('#galeria-grid'), lb = $('#lightbox');
    if (!grid || !lb) return;
    var fotos = [], actual = 0, ultimoFoco = null;
    var img = $('.lightbox__img', lb), cap = $('.lightbox__caption', lb);
    var BASE = 'assets/img/galeria/';

    getJSON('data/galeria.json').then(function (data) {
      fotos = data.fotos || [];
      grid.innerHTML = fotos.map(function (f, i) {
        return '<button class="gitem" type="button" data-i="' + i + '" data-reveal style="--d:' + ((i % 4) * 0.06) + 's" aria-label="Ampliar foto: ' + esc(f.alt) + '">' +
          '<img src="' + BASE + 'thumbs/' + esc(f.archivo) + '" alt="' + esc(f.alt) + '" width="' + (f.ancho || 560) + '" height="' + (f.alto || 700) + '" loading="lazy" decoding="async"></button>';
      }).join('');
      observeReveal(grid);
    }).catch(function () { errorCarga(grid, 'la galería'); });

    function show(i) {
      actual = (i + fotos.length) % fotos.length;
      var f = fotos[actual];
      img.classList.remove('is-loaded');
      img.onload = function () { img.classList.add('is-loaded'); };
      img.src = BASE + f.archivo;
      img.alt = f.alt;
      cap.textContent = f.alt + '  ·  ' + (actual + 1) + ' / ' + fotos.length;
      // Precarga la siguiente foto
      var next = new Image();
      next.src = BASE + fotos[(actual + 1) % fotos.length].archivo;
    }
    function open(i) {
      ultimoFoco = document.activeElement;
      lb.hidden = false;
      document.body.classList.add('lb-open');
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      show(i);
      $('.lightbox__close', lb).focus();
      track('galeria_abrir', { foto: fotos[i] && fotos[i].archivo });
    }
    function close() {
      lb.classList.remove('is-open');
      document.body.classList.remove('lb-open');
      setTimeout(function () { lb.hidden = true; }, 250);
      if (ultimoFoco) ultimoFoco.focus();
    }

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.gitem');
      if (b) open(parseInt(b.getAttribute('data-i'), 10));
    });
    $('.lightbox__close', lb).addEventListener('click', close);
    $('.lightbox__nav--prev', lb).addEventListener('click', function () { show(actual - 1); });
    $('.lightbox__nav--next', lb).addEventListener('click', function () { show(actual + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__figure')) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(actual + 1);
      if (e.key === 'ArrowLeft') show(actual - 1);
      // Mantiene el foco dentro del lightbox
      if (e.key === 'Tab') {
        var f = $$('button', lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Deslizar con el dedo en celulares
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(actual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- 9. Opiniones ---------- */
  function initOpiniones() {
    var cont = $('#testimonios');
    if (!cont) return;
    getJSON('data/opiniones.json').then(function (data) {
      var g = data.resumen && data.resumen.google, fb = data.resumen && data.resumen.facebook;
      if (g) {
        $('#rating-google').textContent = g.calificacion.toFixed(1);
        $('#rating-google-total').textContent = g.total;
        $('.rating__stars span').style.setProperty('--p', (g.calificacion / 5 * 100) + '%');
        if (g.url) $('#rating-google-link').href = g.url;
      }
      if (fb) $('#rating-fb').textContent = fb.calificacion + '/5';

      cont.innerHTML = (data.testimonios || []).map(function (t, i) {
        var n = Math.max(0, Math.min(5, Math.round(t.estrellas || 5)));
        return '<figure class="testimonio" data-reveal style="--d:' + (i * 0.1) + 's">' +
          '<div class="testimonio__stars" aria-label="' + n + ' de 5 estrellas">' + '★★★★★'.slice(0, n) + '<span>' + '★★★★★'.slice(n) + '</span></div>' +
          '<blockquote>“' + esc(t.texto) + '”</blockquote>' +
          '<figcaption><span class="testimonio__avatar" aria-hidden="true">' + esc((t.nombre || '?').charAt(0)) + '</span>' +
          '<span><strong>' + esc(t.nombre) + '</strong><small>' + esc(t.contexto || '') + (t.fuente ? ' · vía ' + esc(t.fuente) : '') + '</small></span></figcaption>' +
          '</figure>';
      }).join('');
      observeReveal(cont);
    }).catch(function () { errorCarga(cont, 'las opiniones'); });
  }

  /* ---------- 10. Formulario de reservas ----------
     Modo 'whatsapp' (por defecto): arma el mensaje y abre https://wa.me/
     con el texto codificado. No hay backend.

     Para pasarlo a FORMSPREE (recibir las reservas por correo):
       1. Crea un formulario en https://formspree.io y copia su endpoint
          (ej. https://formspree.io/f/abcdwxyz).
       2. En index.html agrega al <form id="form-reserva"> los atributos
          action="https://formspree.io/f/abcdwxyz" method="POST".
       3. En js/config.js cambia  reservaModo: 'formspree'.
     El código de abajo ya envía el formulario por fetch y muestra el
     mensaje de confirmación en ese caso.
  -------------------------------------------------- */
  function initReservas() {
    var form = $('#form-reserva'), hint = $('#form-hint');
    if (!form) return;
    var fecha = form.elements.fecha;
    var hoy = ahoraLima().iso;
    fecha.min = hoy;

    function setHint(msg, tipo) {
      hint.textContent = msg || '';
      hint.className = 'form__hint' + (tipo ? ' is-' + tipo : '');
    }

    // Avisa si la fecha elegida es un día en que el local no abre
    fecha.addEventListener('change', function () {
      if (!fecha.value || !CFG.horario || !CFG.horario.dias) return setHint('');
      var d = new Date(fecha.value + 'T12:00:00').getDay();
      if (CFG.horario.dias.indexOf(d) === -1) {
        setHint('Ojo: los ' + DIAS[d] + ' normalmente no abrimos (' + CFG.horario.texto.toLowerCase() + '). Igual puedes consultarnos.', 'warn');
      } else setHint('');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      $$('.field', form).forEach(function (el) { el.classList.remove('is-error'); });

      var errores = [];
      if (!f.nombre.value.trim()) errores.push(f.nombre);
      if (!f.fecha.value || f.fecha.value < hoy) errores.push(f.fecha);
      var pers = parseInt(f.personas.value, 10);
      if (!pers || pers < 1) errores.push(f.personas);
      if (errores.length) {
        errores.forEach(function (el) { el.closest('.field').classList.add('is-error'); });
        errores[0].focus();
        return setHint('Completa los campos marcados para continuar.', 'error');
      }

      var fechaTxt = new Date(f.fecha.value + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

      if (CFG.reservaModo === 'formspree' && form.action && /formspree/.test(form.action)) {
        setHint('Enviando…');
        fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (r) {
            if (!r.ok) throw new Error();
            form.reset();
            setHint('¡Listo! Recibimos tu solicitud y te contactaremos para confirmar.', 'ok');
            track('reserva_enviada', { modo: 'formspree' });
          })
          .catch(function () { setHint('No se pudo enviar. Escríbenos por WhatsApp, por favor.', 'error'); });
        return;
      }

      var lineas = [
        '¡Hola Terraza 45! 💃 Quiero reservar una mesa:',
        '',
        '• Nombre: ' + f.nombre.value.trim(),
        f.celular.value.trim() ? '• Celular: ' + f.celular.value.trim() : null,
        '• Fecha: ' + fechaTxt,
        f.hora.value ? '• Hora de llegada: ' + horaAMPM(f.hora.value) : null,
        '• Personas: ' + pers,
        '• Motivo: ' + f.motivo.value,
        f.comentarios.value.trim() ? '• Comentarios: ' + f.comentarios.value.trim() : null
      ].filter(function (l) { return l !== null; });

      var url = waURL(lineas.join('\n'));
      track('reserva_enviada', { modo: 'whatsapp', personas: pers, motivo: f.motivo.value });
      // (con 'noopener' window.open devuelve null, por eso se anula opener manualmente)
      var win = window.open(url, '_blank');
      if (win) win.opener = null; else window.location.href = url;
      setHint('Abrimos WhatsApp con tu mensaje. Solo pulsa “Enviar”. 💬', 'ok');
    });
  }

  /* ---------- 11. Medición (GA4) ---------- */
  function track(evento, params) {
    if (typeof window.gtag === 'function') window.gtag('event', evento, params || {});
  }
  function initTracking() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-track]');
      if (el) track('click_whatsapp', { ubicacion: el.getAttribute('data-track') });
    });
  }

  /* ---------- Arranque ---------- */
  applyConfig();
  initHeader();
  initHero();
  initReveal();
  initCounters();
  initWaMsg();
  initCarta();
  initGaleria();
  initOpiniones();
  initReservas();
  initTracking();
  document.documentElement.classList.add('js-ready');
})();
