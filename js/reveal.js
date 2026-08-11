/* ============================================================
   SAP SAN — REVEAL SYSTEM (внутрішні сторінки)
   Головна використовує js/app.js, де ця логіка вже є.
   Без GSAP усе лишається видимим — контент ніколи не ховається
   назавжди.
   ============================================================ */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  function run() {
    if (!hasGSAP || REDUCED) {
      $$('.reveal-img img').forEach(i => { i.style.clipPath = 'none'; i.style.transform = 'none'; });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    $$('[data-reveal]').forEach(el => {
      gsap.set(el, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter() { gsap.to(el, { opacity: 1, y: 0, duration: 1.05, ease: 'power3.out' }); }
      });
    });

    /* Cinematic reveal для фотографій у сітках */
    $$('.hgal figure, .ggrid__item, .hcard__media').forEach((box, i) => {
      const img = box.querySelector('img');
      if (!img) return;
      gsap.set(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.1 });
      ScrollTrigger.create({
        trigger: box, start: 'top 93%', once: true,
        onEnter() {
          gsap.timeline({ delay: (i % 3) * 0.06 })
            .to(img, { clipPath: 'inset(0 0 0% 0)', duration: 1.25, ease: 'power4.inOut' })
            .to(img, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
        }
      });
    });

    /* Заголовок сторінки */
    const h1 = document.querySelector('.page-hero h1');
    if (h1) gsap.from(h1, { yPercent: 18, opacity: 0, duration: 1.2, ease: 'power4.out' });
    const bits = $$('.page-hero .crumbs, .page-hero .eyebrow, .page-hero .lead');
    if (bits.length) gsap.from(bits, { opacity: 0, y: 16, duration: .9, ease: 'power3.out', stagger: .1, delay: .15 });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* Чекаємо, поки pages.js вставить контент */
  /* Чекаємо і на контент, і на те, щоб pages.js вставив розмітку */
  function boot() { requestAnimationFrame(() => requestAnimationFrame(run)); }
  if (window.SAPSAN && window.SAPSAN.onReady) window.SAPSAN.onReady(boot);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
