/* =========================================================================
   HRG SEGUROS — Landing de Registro · interacciones y animaciones
   ========================================================================= */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------- NAVBAR ESTADO */
  const nav = $('#nav');
  const bar = $('#progress');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    if (bar) {
      const h = document.documentElement;
      const denom = h.scrollHeight - h.clientHeight;
      bar.style.width = (denom > 0 ? (h.scrollTop / denom) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------- MENÚ MÓVIL */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  if (burger && menu) {
    const toggle = (force) => {
      const open = force ?? !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle());
    $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ----------------------------------------------------- SMOOTH ANCHORS */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ----------------------------------------------------- SCROLL REVEAL */
  const reveals = $$('.reveal');
  if (reduce) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    // Fallback robusto por bounding-rect (IO no es fiable en algunos iframes).
    const revealInView = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (let i = reveals.length - 1; i >= 0; i--) {
        const el = reveals[i];
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          el.classList.add('in');
          reveals.splice(i, 1);
        }
      }
      if (!reveals.length) {
        window.removeEventListener('scroll', revealInView);
        window.removeEventListener('resize', revealInView);
      }
    };
    window.addEventListener('scroll', revealInView, { passive: true });
    window.addEventListener('resize', revealInView, { passive: true });
    // primer pase tras layout/fuentes
    requestAnimationFrame(revealInView);
    setTimeout(revealInView, 120);
    setTimeout(revealInView, 500);
  }

  /* ----------------------------------------------------- MARQUEE / TESTIMONIALES DUP */
  const track = $('#marquee');
  if (track) track.innerHTML += track.innerHTML; // duplica para loop sin costuras
  $$('[data-loop-row]').forEach(row => { row.innerHTML += row.innerHTML; });

  /* ----------------------------------------------------- CONTADORES */
  const counters = $$('[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!reduce) {
      const seen = new WeakSet();
      const runCounters = () => {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        counters.forEach(el => {
          if (seen.has(el)) return;
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.85 && r.bottom > 0) { seen.add(el); animate(el); }
        });
      };
      window.addEventListener('scroll', runCounters, { passive: true });
      requestAnimationFrame(runCounters);
      setTimeout(runCounters, 200);
    } else {
      counters.forEach(el => el.textContent = el.dataset.count + (el.dataset.suffix || ''));
    }
  }

  /* ----------------------------------------------------- CURSOR CUSTOM */
  const dot = $('#cursorDot'), ring = $('#cursorRing');
  if (dot && ring && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    const hot = '[data-cursor], a, button, input, select, label';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hot)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hot)) ring.classList.remove('hover');
    });
  }

  /* ----------------------------------------------------- HERO PARALLAX SUTIL */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    const orbs = $$('.orb');
    document.addEventListener('mousemove', e => {
      const dx = (e.clientX / innerWidth - .5);
      const dy = (e.clientY / innerHeight - .5);
      orbs.forEach((o, i) => {
        const f = (i + 1) * 8;
        o.style.marginLeft = (dx * f) + 'px';
        o.style.marginTop = (dy * f) + 'px';
      });
    });
  }


  /* ----------------------------------------------------- SPOTLIGHT CARDS */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.spotlight').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ----------------------------------------------------- FORMULARIO */
  const forms = $$('.lead-form');
  if (forms.length) {
    const validators = {
      correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    };
    const fieldOf = (input) => input.closest('.field');

    const check = (input) => {
      const wrap = fieldOf(input);
      let ok = input.checkValidity();
      if (ok && validators[input.name]) ok = validators[input.name](input.value);
      if (wrap) wrap.classList.toggle('invalid', !ok && input.required);
      return ok || !input.required;
    };

    forms.forEach(form => {
      const consentWrap = form.querySelector('.consent');

      form.querySelectorAll('input,select').forEach(inp => {
        inp.addEventListener('blur', () => { if (inp.type !== 'checkbox') check(inp); });
        inp.addEventListener('input', () => {
          const w = fieldOf(inp);
          if (w && w.classList.contains('invalid')) check(inp);
          if (inp.type === 'checkbox' && consentWrap) consentWrap.classList.toggle('invalid', !inp.checked);
        });
        inp.addEventListener('change', () => {
          if (inp.type === 'checkbox' && consentWrap) consentWrap.classList.toggle('invalid', !inp.checked);
        });
      });

      form.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;
        form.querySelectorAll('input[required],select[required]').forEach(inp => {
          if (inp.type === 'checkbox') return;
          if (!check(inp)) valid = false;
        });
        const consent = form.querySelector('input[name="consent"]');
        if (consent && !consent.checked) {
          if (consentWrap) consentWrap.classList.add('invalid');
          valid = false;
        } else if (consentWrap) {
          consentWrap.classList.remove('invalid');
        }

        if (!valid) {
          const first = form.querySelector('.invalid');
          if (first) {
            const y = first.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
          }
          return;
        }

        const btn = form.querySelector('button[type=submit]');
        btn.textContent = 'Confirmando…';
        btn.disabled = true;
        btn.style.opacity = '.8';
        setTimeout(() => { window.location.href = 'gracias.html'; }, 700);
      });
    });
  }

  /* ----------------------------------------------------- CONFETTI (gracias) */
  const confetti = $('#confetti');
  if (confetti && !reduce) {
    const colors = ['#00a0e0', '#a0d050', '#8a8be0', '#39bff0', '#ffffff'];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (2.6 + Math.random() * 2.4) + 's';
      c.style.animationDelay = (Math.random() * 1.2) + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      c.style.opacity = (0.6 + Math.random() * 0.4).toString();
      confetti.appendChild(c);
    }
  }
})();
