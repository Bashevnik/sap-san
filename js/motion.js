/* ============================================================
   SAP SAN — МОВА РУХУ
   ------------------------------------------------------------
   GSAP + ScrollTrigger — усе, що прив'язане до контенту.
   lax.js — повільний дрейф декору (гілки, вода) незалежно
   від тіймлайнів: у нього дешевший цикл і йому не потрібні
   тригери на кожен елемент.

   Пластика одна на весь сайт:
     · довгий вихід power4.out, без пружин і відскоків;
     · фото відкривається горизонтальною шторою зліва направо —
       тим самим напрямом, що й політ сокола в знаку;
     · заголовки виїжджають рядками з-під маски;
     · дрібні елементи не анімуються поодинці, а йдуть
       каскадом від свого заголовка.

   Класи-гачки:
     [data-split]   — заголовок по рядках
     [data-reveal]  — блок тексту (можна [data-reveal="0.1"] — затримка)
     .reveal-img    — кадр зі шторою
     .par           — глибина: зсув усередині власної рамки
     [data-lax]     — дрейф декору
   ============================================================ */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* bfcache: коли браузер відновлює сторінку «назад/вперед» із
     кеша, весь наш JS НЕ перезапускається — DOM лишається таким,
     яким його заморозили перед вивантаженням. Якщо гість пішов
     з цієї сторінки саме через клік по посиланню (coverAndGo()
     встиг замкнути body.is-locked і показати заставу перед самим
     переходом), відновлена з bfcache версія назавжди залишиться
     «накритою» — жодна інша подія це не поправить. pageshow з
     persisted:true — єдиний надійний сигнал для миттєвого скиду. */
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    const el = document.getElementById('preloader');
    if (el) {
      if (typeof window.gsap !== 'undefined') gsap.set(el, { autoAlpha: 0 });
      else el.style.setProperty('display', 'none');
    }
    document.body.classList.remove('is-locked');
  });

  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  /* На iOS/Android адресний рядок ховається й з'являється під
     час скролу, змінюючи window.innerHeight на льоту — pin
     (застосований у секції «Один день») тоді сіпається й іноді
     «відпускає» скрол посеред кроку. normalizeScroll — офіційний
     фікс GSAP саме під цю мобільну поведінку. */
  if (hasGSAP && window.ScrollTrigger && !REDUCED) ScrollTrigger.normalizeScroll(true);

  /* ---------- 1. ЗАГОЛОВОК ПО РЯДКАХ ------------------------
     Ділимо на слова, вимірюємо, збираємо назад у маски рядків.
     Після анімації повертаємо оригінальну розмітку — тому
     ресайз, переклад і виділення тексту нічого не ламають.  */
  function splitLines(el) {
    const original = el.innerHTML;
    el.innerHTML = original.split(/(\s+)/)
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

  /* ---------- 2. ПРЕЛОАДЕР ----------------------------------
     Слово встає, крило розкривається від центру назовні,
     смуга добігає — і маска йде вгору, відкриваючи герой.

     Важливо: вступ стартує одразу на DOMContentLoaded і НЕ
     чекає на контент з API. Маска піднімається лише коли
     готові обидва — і анімація, і дані. Через це повільний
     бекенд не перетворює заставку на порожнє очікування, а
     швидкий не «зриває» знак на пів-русі.

     Три сценарії, за типом навігації (Navigation Timing API +
     document.referrer), а не за sessionStorage-прапорцем —
     так коректно розрізняються вкладки, назад/вперед і reload:
       intro — повна церемонія: прямий/зовнішній заход, reload;
       mini  — лише швидкий reveal: перехід по посиланню всередині
               сайту (сам «cover» вже відіграв на попередній
               сторінці, у coverAndGo(), перед навігацією);
       skip  — назад/вперед браузера: без анімації, застава
               прибирається миттєво.
     Заставку не видаляємо з DOM після відтворення, а ховаємо —
     той самий вузол іще знадобиться як «накривало» для cover-
     фази, коли гість клікне наступне посилання на цій сторінці. */
  function navKind() {
    if (REDUCED) return 'skip';
    const entries = window.performance && performance.getEntriesByType && performance.getEntriesByType('navigation');
    const type = (entries && entries[0] && entries[0].type) ||
      (performance.navigation && ['navigate', 'reload', 'back_forward'][performance.navigation.type]) ||
      'navigate';
    if (type === 'back_forward') return 'skip';
    if (type === 'reload') return 'intro';
    let sameOrigin = false;
    if (document.referrer) {
      try { sameOrigin = new URL(document.referrer).origin === location.origin; } catch (_) {}
    }
    return sameOrigin ? 'mini' : 'intro';
  }

  function buildMark(withWord) {
    const mark = $('#preloaderMark');
    if (!mark || !window.SAPSAN || !window.SAPSAN.bird) return;
    mark.outerHTML =
      '<span class="preloader__mark">' +
        '<span class="preloader__bird">' + window.SAPSAN.bird() + '</span>' +
        (withWord ?
          '<span class="preloader__word">SAP SAN</span>' +
          '<span class="preloader__sub">Resort &amp; Retreat</span>' : '') +
      '</span>';
  }

  function preloader() {
    const el = $('#preloader');
    const ready = (window.SAPSAN && window.SAPSAN.ready) || Promise.resolve();
    if (!el) return ready;

    const kind = navKind();

    if (kind === 'skip' || !hasGSAP) {
      el.remove();
      document.body.classList.remove('is-locked');
      return ready;
    }

    buildMark(kind === 'intro');

    /* Ховаємо (не видаляємо) — clipPath теж скидаємо тут-таки,
       одним .set(), щоб не було проміжного кадру з видимим,
       але вже розкритим накривалом. */
    const finish = () => {
      gsap.set(el, { autoAlpha: 0, clipPath: 'inset(0 0 0 0)' });
      document.body.classList.remove('is-locked');
    };

    document.body.classList.add('is-locked');

    return new Promise(resolve => {
      if (kind === 'mini') {
        /* «Cover» вже відбувся на попередній сторінці (клік по
           посиланню) — тут лише «reveal»: застава швидко тане. */
        ready.then(() => {
          gsap.timeline({ onComplete() { finish(); resolve(); } })
            .to(el, { autoAlpha: 0, duration: .5, ease: 'power2.out' });
        });
        return;
      }

      const intro = gsap.timeline({
        onComplete() {
          /* Дочекатися контенту — і тільки тоді відкривати */
          ready.then(() => {
            gsap.timeline({ onComplete() { finish(); resolve(); } })
              .to($('.preloader__inner', el), { opacity: 0, duration: .45, ease: 'power2.in' })
              .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.05, ease: 'power4.inOut' }, '-=.15');
          });
        }
      });

      intro.set(el, { autoAlpha: 1 })
        .fromTo($('.preloader__bird', el),
          { opacity: 0, scaleX: 0.16, transformOrigin: '50% 50%' },
          { opacity: .95, scaleX: 1, duration: 1.5, ease: 'power3.out' })
        .from($('.preloader__word', el), { y: 14, opacity: 0, duration: .9, ease: 'power2.out' }, '-=.55')
        .from($('.preloader__sub', el), { opacity: 0, duration: .8, ease: 'none' }, '-=.5')
        .to($('#preloaderFill'), { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, '-=1.1');
    });
  }

  /* ---------- 2b. ПЕРЕХІД МІЖ СТОРІНКАМИ («cover») ----------
     Клік по внутрішньому посиланню: перехоплюємо, швидко
     показуємо заставу (сокіл долітає до повного розміру), і за
     ~420мс — уже після того, як cover встиг відіграти, —
     переходимо насправді. На новій сторінці navKind() побачить
     свій-таки referrer і зіграє лише «mini»-reveal.

     Не чіпаємо: якорі (#...), зовнішні посилання, посилання з
     target, модифіковані кліки (Ctrl/Cmd/Shift/середня кнопка) —
     все це має лишитись звичайною навігацією браузера. */
  function coverAndGo(url) {
    const el = $('#preloader');
    if (!el || !hasGSAP) { location.href = url; return; }

    buildMark(false);
    const bird = $('.preloader__bird', el);
    gsap.killTweensOf(el);
    if (bird) gsap.killTweensOf(bird);

    document.body.classList.add('is-locked');
    gsap.set(el, { clipPath: 'inset(0 0 0 0)' });
    gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .18, ease: 'power2.out' });
    if (bird) {
      gsap.fromTo(bird,
        { opacity: 0, scaleX: 0.55, transformOrigin: '50% 50%' },
        { opacity: .95, scaleX: 1, duration: .34, ease: 'sine.out' });
    }

    setTimeout(() => { location.href = url; }, 420);
  }

  function linkTransitions() {
    if (REDUCED || !hasGSAP) return;
    document.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]');
      if (!a || a.hasAttribute('download')) return;
      if (a.target && a.target !== '_self') return;
      const href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      let url;
      try { url = new URL(href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      if (url.href.split('#')[0] === location.href.split('#')[0]) return;
      e.preventDefault();
      coverAndGo(url.href);
    });
  }

  /* ---------- 3. ГЕРОЙ ---------------------------------------
     Внутрішні сторінки героя не мають, тому кожну ціль беремо
     через $$ і пропускаємо порожні: інакше GSAP сипле
     «target not found» у консоль на половині сайту.        */
  const heroTargets = () => ({
    lines: $$('#heroTitle .ln > span'),
    bits:  $$('[data-hero]'),
    media: $$('.hero__media img')
  });

  function heroPrep() {
    if (!hasGSAP || REDUCED) return;
    const t = heroTargets();
    if (t.lines.length) gsap.set(t.lines, { yPercent: 112 });
    if (t.bits.length)  gsap.set(t.bits, { opacity: 0, y: 22 });
    if (t.media.length) gsap.set(t.media, { scale: 1.1 });
  }

  function heroIn() {
    const t = heroTargets();
    if (!hasGSAP || REDUCED) {
      const all = t.lines.concat(t.bits, t.media);
      if (hasGSAP && all.length) gsap.set(all, { clearProps: 'all' });
      return;
    }
    const tl = gsap.timeline();
    if (t.media.length) tl.to(t.media, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0);
    if (t.lines.length) tl.to(t.lines, { yPercent: 0, duration: 1.5, ease: 'power4.out', stagger: .12 }, .15);
    if (t.bits.length)  tl.to(t.bits, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .11 }, .6);
  }

  /* ---------- 4. ПОЯВА ПРИ ПРОКРУТЦІ -------------------------
     Розбито на дві фази навмисно. revealsPrep() ховає блоки
     (opacity:0) ОДРАЗУ, ще до заставки — інакше застава встигає
     зникнути раніше, ніж JS взагалі поставить початковий стан,
     і гість на мить бачить неанімований «стрибок» контенту.
     revealsGo() — уже сам показ — чекає, поки застава дограє
     (викликається з intro(), не з boot()): тоді контент вище
     згортки помітно проявляється в момент, коли сокіл іде
     геть, а не встигає «доанімуватись» позаду заставки, поки
     та ще на екрані. */
  const splitCache = new Map();

  function revealsPrep() {
    if (!hasGSAP || REDUCED) return;
    $$('[data-split]').forEach(el => {
      const split = splitLines(el);
      if (!split) return;
      splitCache.set(el, split);
      gsap.set(split.inners, { yPercent: 110 });
    });
    $$('[data-reveal]').forEach(el => gsap.set(el, { opacity: 0, y: 26 }));
  }

  function reveals() {
    if (!hasGSAP || REDUCED) {
      $$('.reveal-img').forEach(b => b.style.setProperty('--p', 1));
      return;
    }

    /* 4a. Заголовки */
    $$('[data-split]').forEach(el => {
      const split = splitCache.get(el);
      if (!split) return;
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter() {
          gsap.to(split.inners, {
            yPercent: 0, duration: 1.25, ease: 'power4.out', stagger: .085,
            onComplete() { split.el.innerHTML = split.original; }
          });
        }
      });
    });

    /* 4b. Блоки тексту */
    $$('[data-reveal]').forEach(el => {
      const delay = parseFloat(el.dataset.reveal) || 0;
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter() { gsap.to(el, { opacity: 1, y: 0, duration: 1.1, delay, ease: 'power3.out' }); }
      });
    });

    /* 4c. Штора кадру — головний фірмовий прийом.
           Анімуємо змінну --p, а не clip-path напряму: так
           у CSS лишається одне джерело геометрії, і кадр
           одночасно з'їжджає з масштабу без другого твіна. */
    $$('.reveal-img').forEach(box => {
      const o = { p: 0 };
      ScrollTrigger.create({
        trigger: box, start: 'top 88%', once: true,
        onEnter() {
          gsap.to(o, {
            p: 1, duration: 1.5, ease: 'power4.out',
            onUpdate() { box.style.setProperty('--p', o.p.toFixed(3)); }
          });
        }
      });
    });

    /* 4d. Глибина: кадр повільно йде всередині своєї рамки.
           Рамка не рухається, тому сусідні блоки не «пливуть». */
    $$('.par').forEach(el => {
      const amt = parseFloat(el.dataset.par) || 8;
      gsap.fromTo(el, { yPercent: -amt }, {
        yPercent: amt, ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.par-box') || el.parentElement,
          start: 'top bottom', end: 'bottom top', scrub: true
        }
      });
    });

    /* 4e. Горизонтальний дрейф — для широких стрічок */
    $$('[data-drift]').forEach(el => {
      const amt = parseFloat(el.dataset.drift) || 6;
      gsap.fromTo(el, { xPercent: -amt }, {
        xPercent: amt, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- 5. ДРЕЙФ ДЕКОРУ (lax.js) ----------------------
     Гілки й вода живуть повільніше за контент — це і створює
     глибину сцени. Окремий рушій, бо тут не потрібні ані
     тригери, ані завершення: просто нескінченний зсув.    */
  function drift() {
    if (typeof window.lax === 'undefined' || REDUCED) return;
    const els = $$('[data-lax]');
    if (!els.length) return;

    lax.init();
    lax.addDriver('scrollY', () => window.scrollY);

    lax.addElements('[data-lax="slow"]', {
      scrollY: { translateY: [['elInY', 'elOutY'], [-30, 46]] }
    });
    lax.addElements('[data-lax="drop"]', {
      scrollY: {
        translateY: [['elInY', 'elOutY'], [-70, 90]],
        rotate: [['elInY', 'elOutY'], [-1.6, 1.6]]
      }
    });
    lax.addElements('[data-lax="sway"]', {
      scrollY: {
        translateX: [['elInY', 'elOutY'], [-24, 24]],
        translateY: [['elInY', 'elOutY'], [-14, 22]]
      }
    });
  }

  /* ---------- 6. ЯКОРІ --------------------------------------- */
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

  /* ---------- СТАРТ ------------------------------------------
     Дві фази. Заставка стартує щойно є DOM — вона не залежить
     ані від контенту, ані від секцій. Решта чекає на дані,
     інакше тригери стануть на порожні вузли.

     Сам показ блоків (reveals) навмисно чекає на ОБИДВІ речі —
     і заставку, і контент — а не тільки на контент, як було
     раніше. Інакше блоки над згорткою встигали доанімуватись
     ДО того, як сокіл іде геть, і гість бачив їх уже готовими
     в момент, коли застава щойно зникла — «стрибок» замість
     видимої появи. */
  let preloaderDone = false, contentPrepped = false;
  function maybeReveal() {
    if (!preloaderDone || !contentPrepped) return;
    reveals();
    if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function intro() {
    heroPrep();
    linkTransitions();
    preloader().then(() => {
      heroIn();
      preloaderDone = true;
      maybeReveal();
    });
  }

  function boot() {
    revealsPrep();
    drift();
    anchors();
    contentPrepped = true;
    maybeReveal();

    if (hasGSAP && window.ScrollTrigger) {
      /* Cormorant вантажиться асинхронно: після підміни шрифту
         висоти заголовків змінюються, тому позиції тригерів
         обов'язково перераховуємо. Те саме — після load. */
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', intro);
  else intro();

  /* Секції малюють home.js / pages.js на тому ж onReady, але
     раніше за нас (порядок підключення), тож на момент виклику
     розмітка вже на місці. requestAnimationFrame додає один
     кадр запасу на верстку. */
  if (window.SAPSAN && window.SAPSAN.onReady) window.SAPSAN.onReady(() => requestAnimationFrame(boot));
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
