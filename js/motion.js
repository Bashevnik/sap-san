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

     Тільки на першому вході на сайт за сесію — не на кожному
     переході між сторінками, і не на reload. sessionStorage-
     прапорець: показали один раз — далі на будь-якій сторінці
     застава миттєво прибирається без анімації, сайт відкритий
     одразу. */
  const INTRO_SEEN_KEY = 'sapsan:introSeen';
  const introSeen = () => { try { return sessionStorage.getItem(INTRO_SEEN_KEY) === '1'; } catch (_) { return false; } };
  const markIntroSeen = () => { try { sessionStorage.setItem(INTRO_SEEN_KEY, '1'); } catch (_) {} };

  function preloader() {
    const el = $('#preloader');
    const ready = (window.SAPSAN && window.SAPSAN.ready) || Promise.resolve();
    if (!el) return ready;

    if (introSeen()) {
      el.remove();
      document.body.classList.remove('is-locked');
      return ready;
    }

    /* Не набірний mark() (той — компактний логотип у шапці), а
       окрема композиція: сокіл — головний, великий, по центру;
       слово й дескриптор — окремим блоком нижче, з повітрям
       між ними. */
    const mark = $('#preloaderMark');
    if (mark && window.SAPSAN && window.SAPSAN.bird) {
      mark.outerHTML =
        '<span class="preloader__mark">' +
          '<span class="preloader__bird">' + window.SAPSAN.bird() + '</span>' +
          '<span class="preloader__word">SAP SAN</span>' +
          '<span class="preloader__sub">Resort &amp; Retreat</span>' +
        '</span>';
    }

    const finish = () => {
      el.remove();
      document.body.classList.remove('is-locked');
      markIntroSeen();
    };

    if (REDUCED || !hasGSAP) { finish(); return ready; }

    document.body.classList.add('is-locked');

    return new Promise(resolve => {
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
