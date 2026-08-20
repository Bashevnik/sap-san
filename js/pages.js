/* ============================================================
   SAP SAN — ВНУТРІШНІ СТОРІНКИ
   ------------------------------------------------------------
   Кожна секція малюється з SAPSAN.data, тому підміна контенту
   на API не потребує правок у розмітці. Файл підключається на
   всіх внутрішніх сторінках; зайві рендери просто не знаходять
   своїх вузлів і мовчки виходять.
   ============================================================ */
(function () {
  'use strict';

  const D = window.SAPSAN;
  if (!D) return;
  const S = D.data.settings;
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const P = D.price.bind(D);
  const I = D.icon;
  const ARROW = I('arrow', 'btn__ico');

  /**
   * Хелпер: рендерить або локальний слаг через D.picture(),
   * або повний URL (фото з бота) через простий <img>.
   */
  function renderPhoto(src, sizes, alt) {
    if (!src) return '';
    if (/^https?:\/\//i.test(src)) {
      return '<img src="' + src + '" alt="' + (alt || 'SAP SAN') + '" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:center">';
    }
    return D.picture(src, { sizes: sizes || '(max-width: 780px) 94vw, 74vw', alt: alt });
  }

  /* ---------- ГАЛЕРЕЯ-СЛАЙДЕР (будиночок, басейн) ------------
     Трек на translateX + Pointer Events для свайпу — той самий
     жест працює і мишею, і пальцем, без окремих touch/mouse
     обробників. На кожній сторінці не більше одного інстанту,
     тому просто замикання на переданому корені, без реєстру. */
  function navHTML() {
    return '' +
      '<button class="hgallery__nav hgallery__nav--prev" type="button" aria-label="Попереднє фото">' +
        '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12H3M9.6 5.4 3 12l6.6 6.6"/></svg>' +
      '</button>' +
      '<button class="hgallery__nav hgallery__nav--next" type="button" aria-label="Наступне фото">' +
        '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h18M14.4 5.4 21 12l-6.6 6.6"/></svg>' +
      '</button>';
  }

  function initGallerySlider(root) {
    const track = $('.hgallery__track', root);
    const slides = $$('.hgallery__slide', root);
    const prev = $('.hgallery__nav--prev', root);
    const next = $('.hgallery__nav--next', root);
    const cur = $('[data-hg-cur]', root);
    const n = slides.length;
    let i = 0;

    function go(idx) {
      i = (idx + n) % n;
      track.style.transform = 'translateX(-' + (i * 100) + '%)';
      if (cur) cur.textContent = String(i + 1);
    }

    prev.addEventListener('click', () => go(i - 1));
    next.addEventListener('click', () => go(i + 1));

    /* Поріг свайпу — третина ширини блока: коротший ривок
       повертає на місце, довший доводить до сусіднього кадру. */
    let startX = 0, dx = 0, dragging = false, width = root.clientWidth;

    root.addEventListener('pointerdown', e => {
      dragging = true; dx = 0; width = root.clientWidth; startX = e.clientX;
      track.classList.add('is-dragging');
    });
    root.addEventListener('pointermove', e => {
      if (!dragging) return;
      dx = e.clientX - startX;
      track.style.transform = 'translateX(calc(-' + (i * 100) + '% + ' + dx + 'px))';
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      const threshold = width * .18;
      if (dx <= -threshold) go(i + 1);
      else if (dx >= threshold) go(i - 1);
      else go(i);
    };
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);
    root.addEventListener('pointerleave', release);

    window.addEventListener('resize', () => go(i));
  }

  /* ---------- СПИСОК БУДИНОЧКІВ ---------------------------- */
  function housesList() {
    const box = $('#housesList');
    if (!box) return;
    const pr = D.data.housePricing;

    box.innerHTML = (D.data.houses || []).map((h, i) => `
      <article class="hrow" data-reveal>
        <a class="hrow__media" href="house.html?id=${h.id}" aria-label="${h.name} — детальніше">
          <div class="figure reveal-img" style="position:relative">
            ${renderPhoto(h.hero, '(max-width: 980px) 94vw, 56vw', h.name + ' — SAP SAN')}
            <span class="hrow__n">${h.index}</span>
          </div>
        </a>
        <div class="hrow__body">
          <p class="label">${h.kicker}</p>
          <h2 class="display d2">${h.name}</h2>
          <p class="body">${h.lead}</p>
          <div class="hrow__facts">
            <div><b>Гостей</b><span>до ${h.guests}</span></div>
            <div><b>Спальні місця</b><span>${h.beds}</span></div>
            <div><b>Заїзд · виїзд</b><span>з ${S.checkIn} · до ${S.checkOut}</span></div>
          </div>
          <div class="hrow__price">
            <div><b>${P(pr.weekday.price)}</b><span>${pr.weekday.note}</span></div>
            <div><b>${P(pr.weekend.price)}</b><span>${pr.weekend.note}</span></div>
          </div>
          <div class="btns">
            <a class="btn" href="booking.html?type=house&house=${h.id}">Залишити заявку ${ARROW}</a>
            <a class="btn btn--ghost" href="house.html?id=${h.id}">Детальніше</a>
          </div>
        </div>
      </article>`).join('');
  }

  /* ---------- ДЕТАЛЬ БУДИНОЧКА ----------------------------- */
  function houseDetail() {
    const root = $('#houseDetail');
    if (!root) return;
    const id = new URLSearchParams(location.search).get('id');
    const h = D.house(id) || D.data.houses[0];
    const pr = D.data.housePricing;

    const hero = $('#houseHero');
    if (hero) {
      hero.innerHTML = renderPhoto(h.hero, '100vw', h.name + ' — SAP SAN');
    }
    const t = $('#houseTitle');  if (t) t.textContent = h.name;
    const k = $('#houseKicker'); if (k) k.textContent = h.kicker;
    const l = $('#houseLead');   if (l) l.textContent = h.lead;
    const c = $('#houseCrumb');  if (c) c.textContent = h.name;

    document.title = h.name + ' — SAP SAN Resort & Retreat';
    const md = $('meta[name="description"]');
    if (md) md.setAttribute('content', h.lead);

    // Ціни: per-house або fallback на housePricing
    const wd = h.priceWeekday || pr.weekday.price;
    const we = h.priceWeekend || pr.weekend.price;
    const ho = h.priceHoliday || pr.holiday.price;

    root.innerHTML = `
      <div class="hdetail__main">
        <p class="hdetail__desc" data-reveal>${h.description}</p>

        <dl class="specs" data-reveal>
          <div><dt>Гостей</dt><dd>до ${h.guests}</dd></div>
          <div><dt>Спальні місця</dt><dd>${h.beds}</dd></div>
          <div><dt>Заїзд</dt><dd>з ${S.checkIn}</dd></div>
          <div><dt>Виїзд</dt><dd>до ${S.checkOut}</dd></div>
        </dl>

        <div data-reveal>
          <p class="label" style="margin-bottom:1.1rem">Зручності</p>
          <ul class="amen">${(h.amenities || []).map(a => `<li>${a}</li>`).join('')}</ul>
        </div>

        <div data-reveal>
          <p class="label" style="margin-bottom:1.1rem">У вартість входить</p>
          <ul class="tri-list">${(pr.included || []).map(i => `<li>${i}</li>`).join('')}</ul>
        </div>

        <div data-reveal>
          <p class="label" style="margin-bottom:1.1rem">Заїзд і виїзд</p>
          <ul class="tri-list">${(pr.rules || []).map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
      </div>

      <aside class="aside" data-reveal>
        <p class="label">Вартість за добу</p>
        <dl>
          <div class="aside__rate"><dt><b>${pr.weekday.label}</b><span>${pr.weekday.note}</span></dt><dd>${P(wd)}</dd></div>
          <div class="aside__rate"><dt><b>${pr.weekend.label}</b><span>${pr.weekend.note}</span></dt><dd>${P(we)}</dd></div>
          <div class="aside__rate"><dt><b>${pr.special.label}</b><span>${pr.special.note} · ${pr.special.save}</span></dt><dd>${P(we ? we - 1000 : null)}</dd></div>
          <div class="aside__rate"><dt><b>${pr.holiday.label}</b><span>${pr.holiday.note}</span></dt><dd>${P(ho)}</dd></div>
        </dl>
        <a class="btn" href="booking.html?type=house&house=${h.id}">Залишити заявку ${ARROW}</a>
        <a class="btn btn--ghost" href="tel:${S.phoneHref}">${S.phone}</a>
        <p class="aside__note">Заявка на сайті не означає автоматичне підтвердження бронювання. Для фіксації дати потрібна передоплата.</p>
      </aside>`;

    // Галерея будиночка — слайдер, підтримка URL з бота
    const gal = $('#houseShots');
    if (gal) {
      const gallery = h.gallery || [];
      if (gallery.length) {
        const multi = gallery.length > 1;
        gal.className = 'hgallery';
        gal.setAttribute('data-reveal', '');
        gal.innerHTML =
          '<div class="hgallery__track">' +
            gallery.map(g => '<div class="hgallery__slide"><div class="figure">' +
              renderPhoto(g, '(max-width: 780px) 94vw, 74vw', h.name) + '</div></div>').join('') +
          '</div>' +
          (multi ? navHTML() + '<div class="hgallery__count"><span data-hg-cur>1</span>/<span>' + gallery.length + '</span></div>' : '');
        if (multi) initGallerySlider(gal);
      } else {
        gal.style.display = 'none';
        const section = gal.closest('section');
        if (section) section.style.display = 'none';
      }
    }

    const other = $('#otherHouses');
    if (other) {
      other.innerHTML = D.data.houses.filter(x => x.id !== h.id).map(x => `
        <a href="house.html?id=${x.id}" data-reveal>
          <div class="figure reveal-img">${renderPhoto(x.hero, '(max-width: 780px) 94vw, 44vw', x.name)}</div>
          <b>${x.name}</b>
        </a>`).join('');
    }

    /* Структуровані дані конкретного будиночка */
    const node = $('#house-schema');
    if (node) {
      node.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Accommodation',
        name: h.name,
        description: h.description,
        occupancy: { '@type': 'QuantitativeValue', maxValue: h.guests },
        amenityFeature: (h.amenities || []).map(a => ({
          '@type': 'LocationFeatureSpecification', name: a, value: true
        })),
      });
    }
  }

  /* ---------- БАСЕЙН --------------------------------------- */
  function poolPage() {
    const p = D.data.pool || {};

    const rates = $('#poolRates');
    if (rates) {
      rates.innerHTML =
        (p.tariffs || []).map(t => `
          <div class="rates__row">
            <dt><b>${t.label}</b><span>${t.note} · ${t.meta}</span></dt>
            <dd>${P(t.price)}</dd>
          </div>`).join('') +
        (p.children || []).map(c => {
          const priceText = c.price === null ? 'уточнюйте' : P(c.price);
          const note = (c.note && c.note.toLowerCase() !== priceText.toLowerCase()) ? c.note : '';
          return `
          <div class="rates__row">
            <dt><b>${c.label}</b>${note ? '<span>' + note + '</span>' : ''}</dt>
            <dd>${priceText}</dd>
          </div>`;
        }).join('') +
        (p.extras || []).map(e => `
          <div class="rates__row">
            <dt><b>${e.label}</b><span>додаткова оренда</span></dt>
            <dd>${P(e.price)}</dd>
          </div>`).join('');
    }

    const incl = $('#poolIncluded');
    if (incl) incl.innerHTML = (p.included || []).map(i => `<span class="chip">${I('shield')}${i}</span>`).join('');

    const rl = $('#poolRules');
    if (rl) rl.innerHTML = (p.rules || []).map(r => `<li>${r}</li>`).join('');

    const pg = $('#poolShots');
    if (pg) {
      const shots = p.gallery || [];
      if (shots.length) {
        const multi = shots.length > 1;
        pg.className = 'hgallery';
        pg.setAttribute('data-reveal', '');
        pg.innerHTML =
          '<div class="hgallery__track">' +
            shots.map(g => '<div class="hgallery__slide"><div class="figure">' +
              renderPhoto(g, '(max-width: 780px) 94vw, 74vw', 'Басейн SAP SAN') + '</div></div>').join('') +
          '</div>' +
          (multi ? navHTML() + '<div class="hgallery__count"><span data-hg-cur>1</span>/<span>' + shots.length + '</span></div>' : '');
        if (multi) initGallerySlider(pg);
      } else {
        pg.style.display = 'none';
        const section = pg.closest('section');
        if (section) section.style.display = 'none';
      }
    }
  }

  /* ---------- ГАЛЕРЕЯ -------------------------------------- */
  function galleryPage() {
    const grid = $('#ggrid');
    if (!grid) return;
    const items = D.data.gallery || [];

    const filter = $('#gfilter');
    if (filter) {
      filter.innerHTML = (D.data.galleryTags || []).map((t, i) =>
        `<button type="button" data-tag="${t}" aria-pressed="${i === 0}">${t}</button>`).join('');
    }

    grid.innerHTML = items.map((g, i) => `
      <figure class="ggrid__item" data-tag="${g.tag}">
        <div class="figure reveal-img">
          ${renderPhoto(g.image, '(max-width: 520px) 92vw, (max-width: 900px) 46vw, 31vw')}
        </div>
        <figcaption class="ggrid__cap">${g.tag}</figcaption>
        <button type="button" data-i="${i}" aria-label="Відкрити на весь екран"></button>
      </figure>`).join('');

    if (filter) {
      filter.addEventListener('click', e => {
        const b = e.target.closest('[data-tag]');
        if (!b) return;
        const tag = b.dataset.tag;
        $$('button', filter).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        $$('.ggrid__item', grid).forEach(it => {
          it.classList.toggle('is-hidden', tag !== 'Усі' && it.dataset.tag !== tag);
        });
      });
    }

    /* ---- Лайтбокс ---- */
    const lb = $('#lightbox');
    if (!lb) return;
    const lbImg = $('img', lb);
    const lbCap = $('.lightbox__cap', lb);
    let cur = 0, lastFocus = null;
    const visible = () => $$('.ggrid__item:not(.is-hidden) button[data-i]', grid).map(b => +b.dataset.i);

    const show = i => {
      const g = items[i];
      if (!g) return;
      cur = i;
      const src = /^https?:\/\//i.test(g.image) ? g.image : D.img(g.image);
      lbImg.src = src;
      if (!/^https?:\/\//i.test(g.image)) {
        lbImg.srcset = D.srcset(g.image);
        lbImg.sizes = '94vw';
      } else {
        lbImg.srcset = '';
      }
      lbImg.alt = 'SAP SAN';
      lbCap.textContent = g.tag || 'SAP SAN';
    };
    const open = i => {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      $('.lightbox__close', lb).focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (lastFocus) lastFocus.focus();
    };
    const move = d => {
      const v = visible();
      if (!v.length) return;
      const at = v.indexOf(cur);
      show(v[(at + d + v.length) % v.length]);
    };

    grid.addEventListener('click', e => {
      const b = e.target.closest('button[data-i]');
      if (b) open(+b.dataset.i);
    });
    $('.lightbox__close', lb).addEventListener('click', close);
    $('.lightbox__nav--prev', lb).addEventListener('click', () => move(-1));
    $('.lightbox__nav--next', lb).addEventListener('click', () => move(1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    });
  }

  /* ---------- ПРАВИЛА ТА FAQ ------------------------------- */
  function rulesPage() {
    const box = $('#faqGroups');
    if (!box) return;

    box.innerHTML = (D.data.faqGroups || []).map((g, gi) => `
      <section class="faq__group" id="g-${gi}" data-reveal>
        <h2 class="display d3" style="margin-bottom:1.2rem">${g.title}</h2>
        <div class="acc">
          ${g.items.map((f, i) => `
            <div class="acc__item">
              <h3>
                <button class="acc__q" aria-expanded="false" aria-controls="fa-${gi}-${i}" id="fq-${gi}-${i}">
                  <span>${f.q}</span><span class="acc__sign" aria-hidden="true"></span>
                </button>
              </h3>
              <div class="acc__a" id="fa-${gi}-${i}" role="region" aria-labelledby="fq-${gi}-${i}"><p>${f.a}</p></div>
            </div>`).join('')}
        </div>
      </section>`).join('');

    $$('.acc', box).forEach(list => D.bindAccordion(list));

    const nav = $('#rulesNav');
    if (nav) {
      nav.innerHTML = (D.data.faqGroups || [])
        .map((g, gi) => `<a href="#g-${gi}">${g.title}</a>`).join('');
    }

    const pr = $('#poolRulesList');
    if (pr) pr.innerHTML = (D.data.pool.rules || []).map(r => `<li>${r}</li>`).join('');
    const hr = $('#houseRulesList');
    if (hr) {
      hr.innerHTML = (D.data.housePricing.rules || [])
        .concat(D.data.housePricing.included || [])
        .map(r => `<li>${r}</li>`).join('');
    }
  }

  /* ---------- КОНТАКТИ ------------------------------------- */
  function contactsPage() {
    const frame = $('#cmap');
    if (frame && !frame.dataset.done) {
      frame.dataset.done = '1';
      /* Точка на вбудованій карті — координати без прив'язки до
         справжнього запису SAP SAN у Google Maps: клік по ній
         відкриває лише «координати», без назви й телефону, а
         не картку закладу. Замість намагатися це виправити
         всередині чужого iframe (недоступно — інший домен),
         кладемо поверх маленьку прозору «гарячу зону» рівно там,
         де завжди опиняється мітка (карта центрована по запиту),
         яка веде на справжній, перевірений запис — mapLink. Там
         усі дані вже без обрізання, бо це повна сторінка Google
         Maps, а не тісне вікно попапа. */
      frame.innerHTML =
        '<iframe title="Розташування SAP SAN на карті" loading="lazy" ' +
          'referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="' + S.mapEmbed + '"></iframe>' +
        '<a class="cmap__pin" href="' + S.mapLink + '" target="_blank" rel="noopener" ' +
          'aria-label="Відкрити SAP SAN у Google Maps"></a>';
    }
    const route = $('#routeBtn');
    if (route) route.href = S.routeLink;

    const list = $('#contactList');
    if (list && !list.children.length) {
      list.innerHTML = `
        <div class="crow"><dt>${I('phone')}Телефон</dt>
          <dd><a class="link-u" href="tel:${S.phoneHref}">${S.phone}</a><small>${S.hours}</small></dd></div>
        <div class="crow"><dt>${I('insta')}Instagram</dt>
          <dd><a class="link-u" href="${S.instagram}" target="_blank" rel="noopener">${S.instagramLabel}</a></dd></div>
        <div class="crow"><dt>${I('mail')}Email</dt>
          <dd><a class="link-u" href="mailto:${S.email}">${S.email}</a></dd></div>
        <div class="crow"><dt>${I('pin')}Адреса</dt>
          <dd><a class="link-u" href="${S.mapLink}" target="_blank" rel="noopener">${S.address}</a>
              <small>${S.addressFull}</small></dd></div>
        <div class="crow"><dt>${I('clock')}Заїзд · виїзд</dt>
          <dd><span>з ${S.checkIn} · до ${S.checkOut}</span></dd></div>`;
    }

    const hours = $('#hoursList');
    if (hours) {
      hours.innerHTML = (S.hoursTable || []).map(r =>
        `<div><span>${r.d}</span><span>${r.t}</span></div>`).join('');
    }

    const menuLink = $('#menuLink');
    if (menuLink) menuLink.href = S.menuUrl;
  }

  /* ---------- БІЧНА КАРТКА НА БРОНЮВАННІ ------------------- */
  function bookingSide() {
    const box = $('#bookingSide');
    if (!box) return;
    const pr = D.data.housePricing;
    const p = D.data.pool;
    box.innerHTML = `
      <div class="bside__card">
        <p class="label">Будиночок · за добу</p>
        <dl class="rates">
          <div class="rates__row"><dt><b>${pr.weekday.label}</b><span>${pr.weekday.note}</span></dt><dd>${P(pr.weekday.price)}</dd></div>
          <div class="rates__row"><dt><b>${pr.weekend.label}</b><span>${pr.weekend.note}</span></dt><dd>${P(pr.weekend.price)}</dd></div>
          <div class="rates__row"><dt><b>${pr.holiday.label}</b><span>${pr.holiday.note}</span></dt><dd>${P(pr.holiday.price)}</dd></div>
        </dl>
      </div>
      <div class="bside__card">
        <p class="label">Басейн · квиток</p>
        <dl class="rates">
          ${(p.tariffs || []).map(t => `
            <div class="rates__row"><dt><b>${t.label}</b><span>${t.note}</span></dt><dd>${P(t.price)}</dd></div>`).join('')}
        </dl>
      </div>
      <div class="bside__card">
        <p class="label">Зв'язок</p>
        <b>${S.phone}</b>
        <p class="small mute">${S.hours}</p>
        <div class="btns">
          <a class="btn btn--ghost btn--sm" href="tel:${S.phoneHref}">Подзвонити</a>
          <a class="btn btn--ghost btn--sm" href="${S.instagram}" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>`;
  }

  function boot() {
    housesList();
    houseDetail();
    poolPage();
    galleryPage();
    rulesPage();
    contactsPage();
    bookingSide();
  }

  if (D.onReady) D.onReady(boot);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
