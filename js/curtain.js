/* ============================================================
   SAP SAN — IMAGE CURTAIN SLIDER
   ------------------------------------------------------------
   Не карусель. Кожна панель — рухоме «вікно» у фотографію,
   що лишається нерухомою в координатах сцени. Тому при drag
   зображення не їдуть, а перетікають одне крізь одне:
   маска центрального кадру звужується, сусідній розкривається,
   прихована частина наступного фото поступово проявляється.

   drag напряму керує progress ∈ [-1, 1].
   release < 50 % — повернення, > 50 % — доводимо до кінця.
   ============================================================ */
(function () {
  'use strict';

  const D = window.SAPSAN;
  if (!D) return;

  /* Слайдер будується на даних з API, тому чекаємо на них */
  D.onReady(function () { build(); });

  function build() {
  const stage = document.getElementById('curtainStage');
  if (!stage) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const houses = D.data.houses || [];
  const N = houses.length;
  if (!N) return;

  /* ---------- 1. ПАНЕЛІ ---------------------------------- */
  const panels = houses.map((h, i) => {
    const el = document.createElement('div');
    el.className = 'curtain__panel';
    const m = D.meta(h.hero) || { w: 1170, h: 780, ar: 1.5 };
    /* 125vw, а не ширина вікна-панелі: фото тут живе в координатах
       СЦЕНИ і завжди розтягнуте на всю її ширину (див. render()),
       а бічні кадри зверху ще й масштабуються до 1.24. Якщо
       оголосити sizes за видимою частиною кадру, браузер візьме
       файл удвічі вужчий за реальний і панель буде мильною. */
    const sizes = '125vw';
    el.innerHTML =
      /* <picture> лише заради AVIF: позиціонує слайдер усе одно
         сам <img>, який лишається єдиним елементом усередині.
         draggable="false" — інакше натискання ПРЯМО на фото запускає
         нативний HTML5 drag-and-drop браузера, який перехоплює жест
         і глушить наступні pointermove: свайп «зависав», щойно палець
         торкався самого зображення, а не порожньої частини сцени. */
      '<picture>' +
        '<source type="image/avif" srcset="' + D.srcset(h.hero, null, 'avif') + '" sizes="' + sizes + '">' +
        '<source type="image/webp" srcset="' + D.srcset(h.hero, null, 'webp') + '" sizes="' + sizes + '">' +
        '<img src="' + D.img(h.hero) + '" ' +
        'alt="' + h.name + ' — SAP SAN" draggable="false" ' +
        /* Усі три кадри видно одночасно — lazy тут дав би сірі плями */
        (i === 0 ? 'fetchpriority="high"' : 'fetchpriority="low"') + ' decoding="async">' +
      '</picture>';
    stage.appendChild(el);
    return { el, img: el.querySelector('img'), ar: m.ar || (m.w / m.h) };
  });

  /* ---------- 2. ГЕОМЕТРІЯ СЛОТІВ ------------------------
     x / w / h — частки сцени; o — прозорість;
     s — масштаб фото всередині вікна (боковий кадр «стиснутий»
     і розкривається до 1 у центрі); v — затемнення.        */
  function keyframes() {
    const narrow = stage.clientWidth < 760;
    return narrow
      ? [
          { p: -1.5, x: -0.62, w: 0.26, h: 0.76, o: 0, s: 1.24, v: 0.34 },
          { p: -1.0, x: -0.16, w: 0.24, h: 0.86, o: 1, s: 1.18, v: 0.22 },
          { p:  0.0, x:  0.14, w: 0.72, h: 1.00, o: 1, s: 1.00, v: 0.00 },
          { p:  1.0, x:  0.92, w: 0.24, h: 0.86, o: 1, s: 1.18, v: 0.22 },
          { p:  1.5, x:  1.36, w: 0.26, h: 0.76, o: 0, s: 1.24, v: 0.34 }
        ]
      : [
          { p: -1.5, x: -0.42, w: 0.22, h: 0.74, o: 0, s: 1.24, v: 0.34 },
          { p: -1.0, x: -0.05, w: 0.26, h: 0.84, o: 1, s: 1.16, v: 0.22 },
          { p:  0.0, x:  0.27, w: 0.46, h: 1.00, o: 1, s: 1.00, v: 0.00 },
          { p:  1.0, x:  0.79, w: 0.26, h: 0.84, o: 1, s: 1.16, v: 0.22 },
          { p:  1.5, x:  1.16, w: 0.22, h: 0.74, o: 0, s: 1.24, v: 0.34 }
        ];
  }
  let KF = keyframes();

  function slotAt(p) {
    if (p <= KF[0].p) return KF[0];
    if (p >= KF[KF.length - 1].p) return KF[KF.length - 1];
    for (let i = 0; i < KF.length - 1; i++) {
      const a = KF[i], b = KF[i + 1];
      if (p >= a.p && p <= b.p) {
        const t = (p - a.p) / (b.p - a.p);
        return {
          x: a.x + (b.x - a.x) * t,
          w: a.w + (b.w - a.w) * t,
          h: a.h + (b.h - a.h) * t,
          o: a.o + (b.o - a.o) * t,
          s: a.s + (b.s - a.s) * t,
          v: a.v + (b.v - a.v) * t
        };
      }
    }
    return KF[2];
  }

  /* Найкоротша позиція по колу: p ∈ (-N/2, N/2] */
  function wrapPos(v) {
    const half = N / 2;
    let p = ((v + half) % N + N) % N - half;
    return p;
  }

  /* ---------- 3. РЕНДЕР ---------------------------------- */
  let index = 0;
  let progress = 0;
  let SW = 0, SH = 0;

  function measure() {
    SW = stage.clientWidth;
    SH = stage.clientHeight;
    KF = keyframes();
  }

  function render() {
    if (!SW || !SH) measure();
    for (let i = 0; i < N; i++) {
      const p = wrapPos(i - index - progress);
      const s = slotAt(p);
      const px = s.x * SW, pw = s.w * SW;
      const ph = s.h * SH, pt = (SH - ph) / 2;

      const el = panels[i].el;
      el.style.left = px + 'px';
      el.style.width = pw + 'px';
      el.style.top = pt + 'px';
      el.style.height = ph + 'px';
      el.style.opacity = s.o;
      el.style.setProperty('--veil', s.v);
      el.style.visibility = s.o < 0.01 ? 'hidden' : 'visible';

      /* Фото живе в координатах СЦЕНИ, а не панелі —
         саме це дає ефект куліси.
         DRIFT частково підтягує кадр до свого вікна, щоб бічні
         панелі показували композицію, а не темний край фото.
         0 — чиста куліса, 1 — звичайна карусель. */
      const ar = panels[i].ar;
      const imgH = SH;
      const imgW = Math.max(SW, imgH * ar);
      const DRIFT = 0.72;
      const t = Math.min(1, Math.abs(p)) * DRIFT;
      const winCenter = px + pw / 2;
      const imgLeft = (SW - imgW) / 2 + t * (winCenter - SW / 2);

      const img = panels[i].img;
      img.style.width = imgW + 'px';
      img.style.height = imgH + 'px';
      img.style.left = (imgLeft - px) + 'px';
      img.style.top = (0 - pt) + 'px';
      /* масштабуємо навколо центру видимого вікна */
      img.style.transformOrigin = ((px + pw / 2) - imgLeft) + 'px ' + (pt + ph / 2) + 'px';
      img.style.transform = 'scale(' + s.s + ')';
    }
  }

  /* ---------- 4. ІНФОРМАЦІЙНА ПАНЕЛЬ --------------------- */
  const elIndex = document.getElementById('curtainIndex');
  const elName = document.getElementById('curtainName');
  const elLead = document.getElementById('curtainLead');
  const elFacts = document.getElementById('curtainFacts');
  const dotsBox = document.getElementById('curtainDots');

  if (dotsBox) {
    dotsBox.innerHTML = houses.map((h, i) =>
      '<button class="curtain__dot" data-dot="' + i + '" aria-label="Показати ' + h.name + '"><i></i></button>'
    ).join('');
    dotsBox.addEventListener('click', e => {
      const b = e.target.closest('[data-dot]');
      if (b) goTo(Number(b.dataset.dot));
    });
  }

  function paintInfo() {
    const h = houses[index];
    if (elIndex) elIndex.textContent = h.index;
    if (elName) elName.textContent = h.name;
    if (elLead) elLead.textContent = h.lead;
    if (elFacts) {
      elFacts.innerHTML =
        '<span><b>' + h.guests + '</b> гостей</span>' +
        '<span>' + h.beds + '</span>' +
        '<span>' + h.amenities.slice(0, 2).join(' · ') + '</span>';
    }
    if (dotsBox) {
      Array.from(dotsBox.children).forEach((d, i) => {
        d.firstElementChild.style.transform = 'scaleX(' + (i === index ? 1 : 0) + ')';
      });
    }
    /* Кнопки ведуть саме на той будиночок, що зараз у центрі */
    const book = document.getElementById('curtainBook');
    if (book) book.href = 'booking.html?type=house&house=' + h.id;
    const more = document.getElementById('curtainMore');
    if (more) more.href = 'house.html?id=' + h.id;
    const fade = [elName, elLead, elFacts, elIndex].filter(Boolean);
    if (hasGSAP && !REDUCED) {
      gsap.fromTo(fade, { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04, overwrite: true });
    }
  }

  /* ---------- 5. ПЕРЕХОДИ -------------------------------- */
  let animating = false;
  let settleTween = null;

  function commit(dir) {
    index = ((index + dir) % N + N) % N;
    progress = 0;
    render();
    paintInfo();
  }

  function settle(target, dir) {
    if (!hasGSAP || REDUCED) { progress = 0; if (dir) commit(dir); else render(); return; }
    animating = true;
    const o = { v: progress };
    settleTween = gsap.to(o, {
      v: target, duration: 0.8, ease: 'power3.out',
      onUpdate() { progress = o.v; render(); },
      onComplete() { animating = false; settleTween = null; if (dir) commit(dir); else { progress = 0; render(); } }
    });
  }

  /* Перехопити доводку живим жестом.
     Раніше pointerdown під час анімації просто ігнорувався — через це
     перший клік «зʼїдався» і доводилось клікати двічі. Тепер дотик
     миттєво вбиває твін і продовжує з поточної позиції. */
  function interruptSettle() {
    if (!animating) return;
    if (settleTween) { settleTween.kill(); settleTween = null; }
    animating = false;
    /* progress лишається там, де його застав жест — без стрибка */
  }

  /* Для стрілок/крапок клік під час анімації не ігноруємо, а миттєво
     доводимо поточний перехід до кінця (progress(1) тригерить commit),
     після чого стартуємо наступний — клік ніколи не «зникає». */
  function finishSettleNow() {
    if (!animating) return;
    if (settleTween) settleTween.progress(1);
    animating = false; settleTween = null;
  }

  function step(dir) {
    finishSettleNow();
    settle(dir, dir);
  }

  function goTo(i) {
    finishSettleNow();
    if (i === index) return;
    const d = wrapPos(i - index);
    step(d > 0 ? 1 : -1);
  }

  /* ---------- 6. DRAG / SWIPE ---------------------------- */
  let dragging = false, lockedAxis = null;
  let startX = 0, startY = 0, startProgress = 0, pid = null;

  /* Друга лінія захисту: навіть якщо draggable/-webkit-user-drag
     десь не спрацювали (старі Android WebView), явно глушимо
     нативний drag-старт на будь-якому елементі всередині сцени. */
  stage.addEventListener('dragstart', e => e.preventDefault());

  stage.addEventListener('pointerdown', e => {
    if (e.button === 1 || e.button === 2) return;
    /* Якщо попередній жест не отримав pointerup/cancel (рідкісний збій
       браузера), не даємо йому "заблокувати" наступний дотик —
       завжди починаємо новий трек з чистого стану. */
    if (dragging) { stage.classList.remove('is-dragging'); }
    interruptSettle();              /* жест завжди має пріоритет над анімацією */
    dragging = true; lockedAxis = null;
    startX = e.clientX; startY = e.clientY;
    startProgress = progress; pid = e.pointerId;
    stage.classList.add('is-dragging');
    /* Захоплюємо вказівник одразу, а не після визначення осі: інакше
       перший mousedown прямо на <img> іноді встигав запустити нативний
       "привид" перетягування/виділення ДО того, як лочилась вісь, і
       жест "з'їдався" — доводилось хапати вдруге. Для тач-дотиків
       капчур одразу не заважає вертикальному pan (за це відповідає
       touch-action на stage), тож звужувати захоплення до lockedAxis==='x'
       більше не потрібно. */
    try { stage.setPointerCapture(pid); } catch (_) {}
  });

  stage.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== pid) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    /* Визначаємо намір: горизонталь — слайдер, вертикаль — скрол */
    if (!lockedAxis) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (lockedAxis !== 'x') return;
    e.preventDefault();

    /* drag керує прогресом напряму */
    const travel = SW * 0.45;
    progress = Math.max(-1, Math.min(1, startProgress - dx / travel));
    render();
  }, { passive: false });

  function endDrag(e) {
    if (!dragging || (e && pid !== null && e.pointerId !== pid)) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    try { if (pid !== null) stage.releasePointerCapture(pid); } catch (_) {}
    pid = null;
    if (lockedAxis !== 'x') { lockedAxis = null; return; }
    lockedAxis = null;

    /* < 50 % — назад, > 50 % — доводимо */
    if (Math.abs(progress) > 0.5) settle(progress > 0 ? 1 : -1, progress > 0 ? 1 : -1);
    else if (progress !== 0) settle(0, 0);
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);

  /* Клік по бічній панелі — перехід у той бік */
  stage.addEventListener('click', e => {
    if (Math.abs(progress) > 0.01) return;
    const r = stage.getBoundingClientRect();
    const rel = (e.clientX - r.left) / r.width;
    const c = KF[2];
    if (rel < c.x) step(-1);
    else if (rel > c.x + c.w) step(1);
  });

  /* ---------- 7. КЛАВІАТУРА ТА КНОПКИ -------------------- */
  const prev = document.getElementById('curtainPrev');
  const next = document.getElementById('curtainNext');
  if (prev) prev.addEventListener('click', () => step(-1));
  if (next) next.addEventListener('click', () => step(1));

  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  /* ---------- 8. RESIZE ---------------------------------- */
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { measure(); render(); }, 120);
  });

  /* ---------- 9. СТАРТ ----------------------------------- */
  function init() {
    measure();
    render();
    paintInfo();
  }
    init();
    if (document.readyState !== 'complete') window.addEventListener('load', init);
  }
})();
