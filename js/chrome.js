/* ============================================================
   SAP SAN — КАРКАС САЙТУ
   ------------------------------------------------------------
   Шапка, повноекранне меню, підвал, індикатор прокрутки
   й курсор. Тримається в одному місці, щоб навігація не
   розповзалася по восьми HTML-файлах.
   ============================================================ */
(function () {
  'use strict';

  const D = window.SAPSAN;
  if (!D) return;
  const S = D.data.settings;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const I = D.icon;

  /* primary — те, що видно в рядку шапки на широкому екрані.
     Повний перелік завжди є в меню під бургером.
     external — веде на сторонній сайт (меню ресторану на choiceqr),
     тому відкривається в новій вкладці й отримує іконку «зовнішнє
     посилання» замість підкреслення поточної сторінки. */
  const NAV = [
    { href: 'index.html',    label: 'Головна',   image: 'lake-aframe' },
    { href: 'houses.html',   label: 'Будиночки', image: 'terrace-glass',  primary: true },
    { href: 'pool.html',     label: 'Басейн',    image: 'pool-deck',      primary: true },
    { href: 'gallery.html',  label: 'Галерея',   image: 'cabana-lake',    primary: true },
    { href: S.menuUrl,       label: 'Меню',      image: 'bar-jigger',     primary: true, external: true },
    { href: 'rules.html',    label: 'Правила',   image: 'terrace-lakeview' },
    { href: 'contacts.html', label: 'Контакти',  image: 'lake-aframe-wide', primary: true }
  ];

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const isCurrent = href =>
    href.toLowerCase() === page ||
    (page === '' && href === 'index.html') ||
    (page === 'house.html' && href === 'houses.html');

  /* ---------- ШАПКА ---------------------------------------- */
  function headerHTML() {
    return '' +
      '<a class="header__brand" href="index.html" aria-label="SAP SAN — на головну">' +
        D.mark() +
      '</a>' +

      '<nav class="header__nav" aria-label="Основна навігація">' +
        NAV.filter(n => n.primary).map(n => n.external
          ? '<a href="' + n.href + '" target="_blank" rel="noopener" class="header__nav-ext">' +
              n.label + I('ext', 'header__nav-extico') + '</a>'
          : '<a href="' + n.href + '"' + (isCurrent(n.href) ? ' aria-current="page"' : '') + '>' +
              n.label + '</a>').join('') +
      '</nav>' +

      '<div class="header__actions">' +
        '<a class="icon-btn" href="tel:' + S.phoneHref + '" aria-label="Зателефонувати ' + S.phone + '">' +
          I('phone') + '</a>' +
        '<a class="cta" href="booking.html">' +
          '<span class="cta__label">Забронювати</span>' + I('arrow') +
        '</a>' +
        '<button class="burger" id="burger" aria-label="Відкрити меню" aria-expanded="false" aria-controls="menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>';
  }

  /* ---------- МЕНЮ -----------------------------------------
     Без фото: замість панелі з кадрами — великий контур знака
     праворуч і тонка декоративна гілка на фоні. Один екран
     заввишки без прокрутки — весь вміст стиснутий саме під це. */
  function menuHTML() {
    return '' +
      '<span class="menu__decor decor decor--willow decor--flip" aria-hidden="true"></span>' +
      '<div class="menu__inner">' +
        '<nav class="menu__nav" aria-label="Меню сайту"><ul class="menu__list">' +
          NAV.map((n, i) =>
            '<li class="menu__item' + (n.external ? ' menu__item--ext' : '') + '" data-menu="' + i + '">' +
              '<a href="' + n.href + '"' +
                (n.external ? ' target="_blank" rel="noopener"' : (isCurrent(n.href) ? ' aria-current="page"' : '')) + '>' +
                '<span class="menu__n">' + String(i + 1).padStart(2, '0') + '</span>' +
                '<span class="menu__label">' + n.label + '</span>' +
                (n.external ? '<span class="menu__ext">' + I('ext') + '</span>' : '') +
              '</a>' +
            '</li>').join('') +
        '</ul></nav>' +

        '<aside class="menu__side">' +
          '<div class="menu__mark">' + D.bird('menu__markbird') + '</div>' +

          '<div class="menu__contacts">' +
            '<a class="menu__contact" href="tel:' + S.phoneHref + '"><i>' + I('phone') + '</i><span>' + S.phone + '</span></a>' +
            '<a class="menu__contact" href="' + S.instagram + '" target="_blank" rel="noopener"><i>' + I('insta') + '</i><span>' + S.instagramLabel + '</span></a>' +
            '<a class="menu__contact" href="' + S.mapLink + '" target="_blank" rel="noopener"><i>' + I('pin') + '</i><span>' + S.address + '</span></a>' +
            '<p class="menu__contact"><i>' + I('clock') + '</i><span>' + S.hours + '</span></p>' +
          '</div>' +

          '<a class="btn btn--light" href="booking.html">Забронювати' + I('arrow', 'btn__ico') + '</a>' +
        '</aside>' +
      '</div>';
  }

  /* ---------- ПІДВАЛ --------------------------------------- */
  function footerHTML() {
    return '' +
      '<span class="decor decor--willow decor--flip decor-top-right" aria-hidden="true"></span>' +
      '<div class="wrap">' +
        '<div class="footer__top">' +
          '<a class="footer__brand" href="index.html" aria-label="SAP SAN">' +
            D.mark() +
          '</a>' +
          '<div class="footer__cols">' +
            '<div class="footer__col"><b>Розділи</b>' +
              NAV.slice(1).map(n => '<a href="' + n.href + '">' + n.label + '</a>').join('') +
            '</div>' +
            '<div class="footer__col"><b>Гостям</b>' +
              '<a href="booking.html">Заявка на будиночок</a>' +
              '<a href="booking.html?type=sunbeds">Заявка на шезлонги</a>' +
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

  /* ---------- ІНДИКАТОР ПРОКРУТКИ --------------------------
     Сокіл летить уздовж верхньої межі: його позиція — прогрес
     читання сторінки. Фірмово і водночас функціонально.    */
  function flightbar() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bar = document.createElement('div');
    bar.className = 'flightbar';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i class="flightbar__line"></i>' +
                    '<span class="flightbar__bird">' + D.bird() + '</span>';
    document.body.appendChild(bar);

    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      bar.style.setProperty('--p', p.toFixed(4));
      bar.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- КУРСОР ---------------------------------------
     Тільки для точного вказівника. Над зоною, яку можна
     тягнути, крапка розгортається в крило — жест стає
     очевидним без текстової підказки.                     */
  function cursor() {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = document.createElement('div');
    el.className = 'cursor';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="cursor__wing">' + D.wing() + '</span>';
    document.body.appendChild(el);

    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      /* Легке відставання — курсор «пливе», а не смикається */
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      el.classList.add('is-on');
      if (!raf) { x = tx; y = ty; raf = requestAnimationFrame(loop); }
      el.classList.toggle('is-drag', Boolean(e.target.closest('[data-cursor="drag"]')));
    }, { passive: true });
    window.addEventListener('pointerleave', () => el.classList.remove('is-on'));
  }

  /* ---------- МОНТУВАННЯ ------------------------------------ */
  function mount() {
    const header = $('#header');
    const menu = $('#menu');
    const footer = $('#footer');
    if (header) header.innerHTML = headerHTML();
    if (menu) menu.innerHTML = menuHTML();
    if (footer) {
      footer.innerHTML = footerHTML();
      const y = $('#year');
      if (y) y.textContent = new Date().getFullYear();
    }

    /* Розділювачі-соколи розставлені в розмітці порожніми —
       контур приходить із js/falcon.js, щоб шлях знака жив
       рівно в одному місці на весь проєкт. */
    $$('.rule-bird').forEach(el => { if (!el.children.length) el.innerHTML = D.bird(); });

    flightbar();
    cursor();
    if (!header || !menu) return;

    /* Стан шапки при прокрутці: прозора, поки перекриває сам
       героїчний кадр, матова одразу після нього — і завжди
       лишається на місці, ніколи не ховається. Раніше вона
       зникала при русі вниз і поверталася при русі вгору;
       разом з анімованим переходом кольору (.5s) це означало,
       що будь-який скріншот міг впіймати шапку «напівпрозорою» —
       ані читабельний темний текст, ані контрастний світлий,
       щось середнє на світлому фото. Поріг рахуємо від
       фактичної висоти самого героя (а не умовних 80% екрана),
       тому матовість вмикається рівно там, де закінчується
       фотографія, і відтоді вже не залежить від напрямку руху. */
    const heroEl = $('.hero, .phero');
    const solidAt = () => heroEl ? heroEl.getBoundingClientRect().height - 40 : 0;
    const onScroll = () => {
      header.classList.toggle('is-solid', window.scrollY > solidAt());
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    const burger = $('#burger', header);

    const toggle = v => {
      open = v;
      burger.classList.toggle('is-open', v);
      burger.setAttribute('aria-expanded', String(v));
      burger.setAttribute('aria-label', v ? 'Закрити меню' : 'Відкрити меню');
      menu.classList.toggle('is-open', v);
      menu.setAttribute('aria-hidden', String(!v));
      document.body.classList.toggle('is-locked', v);
      header.classList.toggle('is-menu-open', v);
      /* Фокус на контейнер, а не на перше посилання: інакше після
         кліку мишею з'являється зайва фокус-рамка. Tab працює далі. */
      if (v) menu.focus({ preventScroll: true });
    };

    burger.addEventListener('click', () => toggle(!open));
    $$('a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) { toggle(false); burger.focus(); }
    });
  }

  if (window.SAPSAN && window.SAPSAN.onReady) window.SAPSAN.onReady(mount);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
