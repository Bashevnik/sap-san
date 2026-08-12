/* ============================================================
   SAP SAN — APP
   preloader · header · reveals · experiences · chapters
   collage · faq · pool tariffs
   ============================================================ */
(function () {
  'use strict';

  const D = window.SAPSAN;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* Шапка, меню та футер живуть у js/chrome.js,
     карта й внутрішні сторінки — у js/pages.js. */

  /* ---------- 1. PRELOADER -------------------------------
     Крило «розкривається», смуга заповнюється, далі маска
     піднімається вгору і відкриває hero.                   */
  function preloader(done) {
    const el = $('#preloader');
    if (!el) return done();
    const fill = $('#preloaderFill');
    const wing = $('.mark__wing', el);
    const word = $('.mark__word', el);
    const sub = $('.mark__sub', el);

    if (REDUCED || !hasGSAP) {
      el.style.display = 'none';
      document.body.classList.remove('is-locked');
      return done();
    }

    document.body.classList.add('is-locked');
    const tl = gsap.timeline({
      onComplete() {
        el.style.display = 'none';
        document.body.classList.remove('is-locked');
        done();
      }
    });

    tl.set(el, { autoAlpha: 1 })
      .from(word, { yPercent: 40, opacity: 0, duration: 1, ease: 'power3.out' })
      /* крило розгортається від центру назовні */
      .fromTo(wing,
        { opacity: 0, scaleX: 0.15, transformOrigin: '50% 100%' },
        { opacity: 0.95, scaleX: 1, duration: 1.3, ease: 'power3.out' }, '-=0.65')
      .from(sub, { opacity: 0, duration: 0.7, ease: 'none' }, '-=0.9')
      .to(fill, { scaleX: 1, duration: 1.15, ease: 'power2.inOut' }, '-=1.1')
      .to('.preloader__inner', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.15')
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.05, ease: 'power4.inOut' }, '-=0.2');
  }

  /* ---------- 3. ТЕКСТ ПО РЯДКАХ -------------------------
     Розбиває заголовок на візуальні рядки й ховає їх під
     маску. Після анімації розмітка відновлюється, тому
     ресайз нічого не ламає.                                */
  function splitLines(el) {
    const original = el.innerHTML;
    const words = original.split(/(\s+)/);
    el.innerHTML = words
      .map(w => (/^\s+$/.test(w) ? w : '<span class="w" style="display:inline-block">' + w + '</span>'))
      .join('');

    const spans = $$('.w', el);
    if (!spans.length) { el.innerHTML = original; return null; }

    const lines = [];
    let top = null, cur = null;
    spans.forEach(s => {
      const t = Math.round(s.offsetTop);
      if (top === null || Math.abs(t - top) > 4) { top = t; cur = []; lines.push(cur); }
      cur.push(s);
    });

    /* Перезбираємо: кожен рядок — маска з внутрішнім span */
    const frag = document.createDocumentFragment();
    lines.forEach(line => {
      const wrap = document.createElement('span');
      wrap.className = 'split-line';
      const inner = document.createElement('span');
      line.forEach((s, i) => {
        if (i) inner.appendChild(document.createTextNode(' '));
        inner.appendChild(document.createTextNode(s.textContent));
      });
      wrap.appendChild(inner);
      frag.appendChild(wrap);
    });
    el.innerHTML = '';
    el.appendChild(frag);
    return { el, original, inners: $$('.split-line > span', el) };
  }

  /* ---------- 4. REVEAL SYSTEM ---------------------------- */
  function reveals() {
    if (!hasGSAP || REDUCED) {
      $$('.reveal-img > img').forEach(i => { i.style.clipPath = 'none'; i.style.transform = 'none'; });
      return;
    }

    /* 4a. Заголовки по рядках */
    $$('[data-split]').forEach(el => {
      const split = splitLines(el);
      if (!split) return;
      gsap.set(split.inners, { yPercent: 108 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter() {
          gsap.to(split.inners, {
            yPercent: 0, duration: 1.25, ease: 'power4.out', stagger: 0.085,
            onComplete() { split.el.innerHTML = split.original; }
          });
        }
      });
    });

    /* 4b. Блоки тексту */
    $$('[data-reveal]').forEach(el => {
      gsap.set(el, { opacity: 0, y: 26 });
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter() { gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }); }
      });
    });

    /* 4c. Cinematic image reveal — маска + масштаб */
    $$('.reveal-img').forEach(box => {
      const img = $('img', box);
      if (!img) return;
      gsap.set(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.08 });
      ScrollTrigger.create({
        trigger: box, start: 'top 86%', once: true,
        onEnter() {
          gsap.timeline()
            .to(img, { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'power4.inOut' })
            .to(img, { scale: 1, duration: 1.9, ease: 'power3.out' }, 0);
        }
      });
    });

    /* 4d. Паралакс великого фото басейну */
    const poolMedia = $('#poolMedia img');
    if (poolMedia) {
      gsap.fromTo(poolMedia, { yPercent: -7 }, {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: '#pool', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    /* 4e. Hero — вступ після прелоадера */
    const heroLines = $$('#heroTitle .ln > span');
    gsap.set(heroLines, { yPercent: 110 });
    gsap.set('[data-hero-el]', { opacity: 0, y: 20 });
  }

  function heroIn() {
    if (!hasGSAP || REDUCED) {
      gsap.set && gsap.set('#heroTitle .ln > span, [data-hero-el]', { clearProps: 'all' });
      return;
    }
    gsap.timeline()
      .to('#heroTitle .ln > span', { yPercent: 0, duration: 1.5, ease: 'power4.out', stagger: 0.12 })
      .to('[data-hero-el]', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12 }, '-=1.05');
  }

  /* ---------- 5. EXPERIENCE SELECTOR ---------------------- */
  function experiences() {
    const list = $('#expList');
    if (!list || !D) return;
    const items = D.data.experiences || [];

    list.innerHTML = items.map((it, i) => `
      <li class="exp__item" data-exp="${i}">
        <a class="exp__link" href="${it.href}">
          <span class="exp__n">${String(i + 1).padStart(2, '0')}</span>
          <span class="exp__label">${it.label}</span>
          <span class="exp__note">${it.note}</span>
        </a>
        <div class="exp__mobile">${D.imgTag(it.image, { alt: it.label + ' — SAP SAN', sizes: '100vw' })}</div>
      </li>`).join('');

    const cursor = $('#expCursor');
    const cursorImg = cursor ? $('img', cursor) : null;

    /* Режим визначаємо в момент події, а не один раз при завантаженні:
       гібридні ноутбуки, ресайз і поворот екрана інакше ламають логіку. */
    const isTouchMode = () =>
      window.matchMedia('(hover: none)').matches || window.innerWidth <= 780;

    /* Тап-fallback: перший тап розкриває фото, другий веде за посиланням */
    $$('.exp__item', list).forEach(item => {
      const link = $('.exp__link', item);
      const box = $('.exp__mobile', item);
      link.addEventListener('click', e => {
        if (!isTouchMode()) return;
        if (item.classList.contains('is-open')) return;
        e.preventDefault();
        $$('.exp__item', list).forEach(o => {
          o.classList.remove('is-open');
          $('.exp__mobile', o).style.height = '0px';
        });
        item.classList.add('is-open');
        box.style.height = box.scrollHeight + 'px';
      });
    });

    /* Desktop: фото слідує за курсором, розкриваючись маскою */
    if (!cursor || !hasGSAP || REDUCED) return;
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.7, ease: 'power3' });
    let active = -1;

    $$('.exp__item', list).forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        if (isTouchMode()) return;
        active = i;
        cursorImg.src = D.img(items[i].image);
        cursorImg.alt = '';
        cursor.classList.add('exp__cursor--on');
      });
    });
    const hide = () => { active = -1; cursor.classList.remove('exp__cursor--on'); };
    list.addEventListener('mouseleave', hide);
    /* Страховка: курсор пішов зі сторінки або користувач гортає далі */
    document.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', () => { if (active >= 0) hide(); }, { passive: true });
    window.addEventListener('mousemove', e => {
      if (active < 0) return;
      const r = cursor.getBoundingClientRect();
      xTo(e.clientX - r.width / 2);
      yTo(e.clientY - r.height / 2);
    }, { passive: true });
  }

  /* ---------- 6. STICKY STORYTELLING ---------------------- */
  function chapters() {
    const steps = $('#chaptersSteps');
    const frame = $('#chaptersFrame');
    if (!steps || !frame || !D) return;
    const data = D.data.chapters || [];

    steps.innerHTML = data.map((c, i) => `
      <article class="chapters__step${i === 0 ? ' is-active' : ''}" data-step="${i}">
        <p class="num">${c.n}</p>
        <h3 class="display d2">${c.title}</h3>
        <p>${c.text}</p>
      </article>`).join('');

    const imgs = data.map((c, i) => {
      const el = document.createElement('img');
      el.src = D.img(c.image);
      el.srcset = D.srcset(c.image);
      el.sizes = '(max-width: 900px) 100vw, 45vw';
      el.alt = c.title + ' — SAP SAN';
      el.loading = i === 0 ? 'eager' : 'lazy';
      el.decoding = 'async';
      if (i === 0) el.classList.add('is-active');
      frame.insertBefore(el, frame.firstChild);
      return el;
    });

    const count = $('#chaptersCount');
    const bar = $('#chaptersProgress');
    const stepEls = $$('.chapters__step', steps);

    const setActive = (i) => {
      imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
      stepEls.forEach((s, k) => s.classList.toggle('is-active', k === i));
      if (count) count.textContent = data[i].n;
      if (bar) bar.style.width = ((i + 1) / data.length * 100) + '%';
    };
    setActive(0);

    if (!hasGSAP || REDUCED) { stepEls.forEach(s => s.classList.add('is-active')); return; }
    stepEls.forEach((s, i) => {
      ScrollTrigger.create({
        trigger: s, start: 'top 55%', end: 'bottom 55%',
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i)
      });
    });
  }

  /* ---------- 7. ГАЛЕРЕЯ НА ГОЛОВНІЙ ----------------------
     Масонрі в колонках: кадри стають один під одного щільно,
     без дір і рваного низу, які були у попередньому колажі.
     Паралакс тут не застосовуємо — він ламає розкладку колонок. */
  function collage() {
    const box = $('#collage');
    if (!box || !D) return;
    box.innerHTML = (D.data.gallery || []).slice(0, 9).map(g => `
      <figure class="gmasonry__item">
        ${D.imgTag(g.image, { alt: g.alt, sizes: '(max-width: 900px) 50vw, 32vw' })}
        <figcaption class="gmasonry__cap">${g.tag || ''}</figcaption>
      </figure>`).join('');

    if (!hasGSAP || REDUCED) return;
    $$('.gmasonry__item', box).forEach((item, i) => {
      const img = $('img', item);
      gsap.set(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.06 });
      ScrollTrigger.create({
        trigger: item, start: 'top 94%', once: true,
        onEnter() {
          gsap.timeline({ delay: (i % 3) * 0.06 })
            .to(img, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.inOut' })
            .to(img, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
        }
      });
    });
  }

  /* ---------- 8. FAQ + JSON-LD ---------------------------- */
  function faq() {
    const list = $('#faqList');
    if (!list || !D) return;
    const items = D.data.faq || [];

    list.innerHTML = items.map((f, i) => `
      <div class="faq__item">
        <h3 style="margin:0">
          <button class="faq__q" aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}">
            <span>${f.q}</span><span class="faq__sign" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="faq__a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}"><p>${f.a}</p></div>
      </div>`).join('');

    $$('.faq__item', list).forEach(item => {
      const btn = $('.faq__q', item);
      const panel = $('.faq__a', item);
      btn.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        /* акордеон — по одному відкритому */
        $$('.faq__item', list).forEach(o => {
          o.classList.remove('is-open');
          $('.faq__q', o).setAttribute('aria-expanded', 'false');
          $('.faq__a', o).style.height = '0px';
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.height = panel.scrollHeight + 'px';
        }
      });
    });

    /* Structured data для пошуку */
    const node = $('#faq-schema');
    if (node) {
      node.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: items.map(f => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      });
    }
  }

  /* ---------- 9. ТАРИФИ БАСЕЙНУ --------------------------- */
  function poolTariffs() {
    const box = $('#poolTariffs');
    if (!box || !D) return;
    box.innerHTML = (D.data.pool && D.data.pool.tariffs || []).map(t => `
      <div class="poolsplit__row">
        <dt><b>${t.label}</b><span>${t.note} · ${t.meta}</span></dt>
        <dd>${t.price.toLocaleString('uk-UA')}<small>грн</small></dd>
      </div>`).join('');
  }

  /* ---------- 10. ЯКІРНА НАВІГАЦІЯ ------------------------ */
  function anchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  /* ---------- BOOT ---------------------------------------- */
  function boot() {
    experiences();
    chapters();
    collage();
    faq();
    poolTariffs();
    anchors();
    reveals();
    preloader(() => {
      heroIn();
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
    });

    if (hasGSAP && window.ScrollTrigger) {
      /* Cormorant вантажиться асинхронно: після підміни шрифту
         висоти заголовків змінюються, тому позиції тригерів
         обов’язково треба перерахувати. Те саме — після load. */
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  /* Рендер стартує лише коли готові і DOM, і контент з API */
  if (window.SAPSAN && window.SAPSAN.onReady) window.SAPSAN.onReady(boot);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
