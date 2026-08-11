/* ============================================================
   SAP SAN — SITE CHROME
   Шапка, мобільне меню та футер для всіх сторінок.
   Тримається в одному місці, щоб навігація не розповзалася
   по семи HTML-файлах.
   ============================================================ */
(function () {
  'use strict';

  const D = window.SAPSAN;
  if (!D) return;
  const S = D.data.settings;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const WING = '<svg class="mark__wing" viewBox="0 0 600 126" fill="currentColor" aria-hidden="true"><path d="M300 100C256 96 204 85 152 66C100 47 50 24 4 2C38 32 80 58 128 78C182 100 244 109 300 108Z"/><path d="M300 100C344 96 396 85 448 66C500 47 550 24 596 2C562 32 520 58 472 78C418 100 356 109 300 108Z"/><path d="M300 103C304 103 307 107 307 112L300 126L293 112C293 107 296 103 300 103Z"/></svg>';

  /* primary — те, що показуємо в рядку шапки на десктопі.
     Повний перелік завжди доступний у меню під бургером. */
  const NAV = [
    { href: 'index.html',   label: 'Головна',   image: 'houses-water-wide' },
    { href: 'houses.html',  label: 'Будиночки', image: 'house-aframe-terrace', primary: true },
    { href: 'pool.html',    label: 'Басейн',    image: 'pool-cabanas-wide',    primary: true },
    { href: 'gallery.html', label: 'Галерея',   image: 'cabana-lake',          primary: true },
    { href: 'rules.html',   label: 'Правила',   image: 'terrace-rope-view' },
    { href: 'contacts.html',label: 'Контакти',  image: 'houses-water-wide-2',  primary: true }
  ];

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const isCurrent = href => href.toLowerCase() === page ||
    (page === '' && href === 'index.html') ||
    (page === 'house.html' && href === 'houses.html');

  const ICON = {
    phone: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M5.6 2.4 3.2 2c-.6 0-1.2.5-1.2 1.1 0 5.9 5 10.9 10.9 10.9.6 0 1.1-.6 1.1-1.2l-.4-2.4-2.7-.9-1.3 1.6a9.5 9.5 0 0 1-4.7-4.7L6.5 5.1 5.6 2.4Z"/></svg>',
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5"/></svg>',
    ext:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    pin:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M8 14.5s5-4.4 5-8a5 5 0 0 0-10 0c0 3.6 5 8 5 8Z"/><circle cx="8" cy="6.5" r="1.9"/></svg>',
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.4 1.5"/></svg>'
  };

  /* ---------- HEADER -------------------------------------- */
  function headerHTML() {
    return '' +
      '<a class="header__brand mark" href="index.html" aria-label="SAP SAN — на головну">' +
        '<span class="mark__word">SAP SAN</span>' + WING +
      '</a>' +

      '<nav class="header__nav" aria-label="Основна навігація">' +
        NAV.filter(n => n.primary).map(n => '<a href="' + n.href + '"' + (isCurrent(n.href) ? ' aria-current="page"' : '') + '>' + n.label + '</a>').join('') +
      '</nav>' +

      '<div class="header__actions">' +
        '<a class="icon-btn" href="tel:' + S.phoneHref + '" aria-label="Зателефонувати ' + S.phone + '">' + ICON.phone + '</a>' +
        /* CTA: контурна пігулка над фото, суцільна золота — коли шапка ущільнилась */
        '<a class="cta-book" href="booking.html">' +
          '<span class="cta-book__label">Забронювати</span>' +
          '<span class="cta-book__icon">' + ICON.arrow + '</span>' +
        '</a>' +
        '<button class="burger" id="burger" aria-label="Відкрити меню" aria-expanded="false" aria-controls="menu">' +
          '<span></span><span></span>' +
        '</button>' +
      '</div>';
  }

  /* ---------- MENU (editorial split) ---------------------- */
  function menuHTML() {
    return '' +
      '<div class="menu__inner">' +
        '<nav class="menu__nav" aria-label="Меню сайту">' +
          '<ul class="menu__list">' +
            NAV.map((n, i) =>
              '<li class="menu__item" data-menu="' + i + '">' +
                '<a href="' + n.href + '"' + (isCurrent(n.href) ? ' aria-current="page"' : '') + '>' +
                  '<span class="menu__n">' + String(i + 1).padStart(2, '0') + '</span>' +
                  '<span class="menu__label">' + n.label + '</span>' +
                '</a>' +
              '</li>').join('') +
            '<li class="menu__item menu__item--ext">' +
              '<a href="' + S.menuUrl + '" target="_blank" rel="noopener">' +
                '<span class="menu__n">07</span>' +
                '<span class="menu__label">Меню ресторану</span>' +
                '<span class="menu__ext">' + ICON.ext + '</span>' +
              '</a>' +
            '</li>' +
          '</ul>' +
        '</nav>' +

        '<aside class="menu__side">' +
          '<figure class="menu__figure" id="menuFigure">' +
            NAV.map((n, i) =>
              '<img src="' + D.img(n.image) + '" srcset="' + D.srcset(n.image) + '" ' +
              'sizes="40vw" alt="" loading="lazy" decoding="async"' +
              (i === 0 ? ' class="is-active"' : '') + ' data-fig="' + i + '">').join('') +
          '</figure>' +

          '<div class="menu__contacts">' +
            '<a class="menu__contact" href="tel:' + S.phoneHref + '">' +
              '<i>' + ICON.phone + '</i><span>' + S.phone + '</span></a>' +
            '<a class="menu__contact" href="' + S.instagram + '" target="_blank" rel="noopener">' +
              '<i>' + ICON.insta + '</i><span>' + S.instagramLabel + '</span></a>' +
            '<a class="menu__contact" href="' + S.mapLink + '" target="_blank" rel="noopener">' +
              '<i>' + ICON.pin + '</i><span>' + S.address + '</span></a>' +
            '<p class="menu__contact menu__contact--static">' +
              '<i>' + ICON.clock + '</i><span>' + S.hours + '</span></p>' +
          '</div>' +

          '<a class="btn btn--primary menu__cta" href="booking.html">Забронювати ' + ICON.arrow + '</a>' +
        '</aside>' +
      '</div>';
  }

  /* ---------- FOOTER -------------------------------------- */
  function footerHTML() {
    return '<div class="wrap">' +
      '<div class="footer__top">' +
        '<a class="footer__brand mark" href="index.html" aria-label="SAP SAN">' +
          '<span class="mark__word">SAP SAN</span>' + WING +
          '<span class="mark__sub">Resort &amp; Retreat</span>' +
        '</a>' +
        '<div class="footer__cols">' +
          '<div class="footer__col"><b>Розділи</b>' +
            NAV.slice(1).map(n => '<a href="' + n.href + '">' + n.label + '</a>').join('') +
          '</div>' +
          '<div class="footer__col"><b>Гостям</b>' +
            '<a href="booking.html">Бронювання будиночка</a>' +
            '<a href="booking.html?type=sunbeds">Бронювання шезлонгів</a>' +
            '<a href="rules.html">Правила та FAQ</a>' +
            '<a href="' + S.menuUrl + '" target="_blank" rel="noopener">Меню ресторану</a>' +
          '</div>' +
          '<div class="footer__col"><b>Контакти</b>' +
            '<a href="tel:' + S.phoneHref + '">' + S.phone + '</a>' +
            '<a href="mailto:' + S.email + '">' + S.email + '</a>' +
            '<a href="' + S.instagram + '" target="_blank" rel="noopener">' + S.instagramLabel + '</a>' +
            '<a href="' + S.mapLink + '" target="_blank" rel="noopener">' + S.address + '</a>' +
            '<span>' + S.hours + '</span>' +
            '<span>Заїзд з ' + S.checkIn + ' · виїзд до ' + S.checkOut + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="footer__bottom">' +
        '<span>© <span id="year"></span> SAP SAN Resort &amp; Retreat</span>' +
        '<span>' + S.tagline + '</span>' +
      '</div>' +
    '</div>';
  }

  /* ---------- МОНТУВАННЯ ---------------------------------- */
  function mount() {
    const header = $('#header');
    const menu = $('#menu');
    const footer = $('#footer');
    if (header) header.innerHTML = headerHTML();
    if (menu) menu.innerHTML = menuHTML();
    if (footer) { footer.innerHTML = footerHTML(); const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); }

    if (!header || !menu) return;

    /* Стан шапки при скролі */
    let last = window.scrollY;
    let open = false;
    const solidAt = () => (document.querySelector('.hero, .page-hero') ? window.innerHeight * 0.82 : 40);
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-solid', y > solidAt());
      header.classList.toggle('is-hidden', y > last && y > 420 && !open);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Відкриття / закриття меню */
    const burger = $('#burger', header);
    const items = $$('.menu__item', menu);
    const figs = $$('[data-fig]', menu);

    const toggle = (v) => {
      open = v;
      burger.classList.toggle('is-open', v);
      burger.setAttribute('aria-expanded', String(v));
      burger.setAttribute('aria-label', v ? 'Закрити меню' : 'Відкрити меню');
      menu.classList.toggle('is-open', v);
      menu.setAttribute('aria-hidden', String(!v));
      document.body.classList.toggle('is-locked', v);
      header.classList.toggle('is-menu-open', v);
      /* Фокус на контейнер, а не на перше посилання: інакше після
         кліку мишею з'являється фокус-рамка. Tab далі працює. */
      if (v) menu.focus({ preventScroll: true });
    };

    burger.addEventListener('click', () => toggle(!open));
    $$('a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) { toggle(false); burger.focus(); }
    });

    /* Фото у меню змінюється за наведенням / фокусом пункту */
    items.forEach((item, i) => {
      const show = () => {
        if (i >= figs.length) return;
        figs.forEach((f, k) => f.classList.toggle('is-active', k === i));
      };
      item.addEventListener('mouseenter', show);
      const a = $('a', item);
      if (a) a.addEventListener('focus', show);
    });
  }

  /* Рендер стартує лише коли готові і DOM, і контент з API */
  if (window.SAPSAN && window.SAPSAN.onReady) window.SAPSAN.onReady(mount);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
