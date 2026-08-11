/* ============================================================
   SAP SAN — INNER PAGES RENDERER
   Кожна секція малюється з SAPSAN.data, тому підміна на API
   не потребує правок у розмітці.
   ============================================================ */
(function () {
  'use strict';

  const D = window.SAPSAN;
  if (!D) return;
  const S = D.data.settings;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const P = D.price.bind(D);

  const ARROW = '<svg class="btn__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';

  const ADV_ICONS = {
    wave: '<path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>',
    pool: '<path d="M3 20c2 0 2-1.5 4-1.5S9 20 11 20s2-1.5 4-1.5S17 20 19 20M8 17V5a2 2 0 0 1 4 0M16 17V5a2 2 0 0 1 4 0M8 9h4M8 13h4"/>',
    fork: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 3c-1.5 1.5-2 3-2 5s.5 3 2 3v10"/>',
    fire: '<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s.5 2 2 2c0-3 2-6 2-8Z"/>',
    tree: '<path d="M12 3 6 12h3l-4 6h14l-4-6h3L12 3ZM12 18v3"/>',
    key:  '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15 12v2"/>'
  };

  /* ---------- ПЕРЕВАГИ ------------------------------------ */
  function advantages() {
    const box = $('#advantages');
    if (!box) return;
    box.innerHTML = D.data.advantages.map(a => `
      <article class="adv__item" data-reveal>
        <svg class="adv__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          ${ADV_ICONS[a.icon] || ADV_ICONS.tree}
        </svg>
        <h3>${a.title}</h3>
        <p>${a.text}</p>
      </article>`).join('');
  }

  /* ---------- СПИСОК БУДИНОЧКІВ --------------------------- */
  function housesList() {
    const box = $('#housesList');
    if (!box) return;
    const pr = D.data.housePricing;
    box.innerHTML = D.data.houses.map(h => `
      <article class="hcard" data-reveal>
        <a class="hcard__media" href="house.html?id=${h.id}" aria-label="${h.name} — детальніше">
          ${D.imgTag(h.hero, { alt: h.name + ' — SAP SAN', sizes: '(max-width: 860px) 100vw, 50vw' })}
          <span class="hcard__n">${h.index}</span>
        </a>
        <div class="hcard__body">
          <p class="eyebrow">${h.kicker}</p>
          <h2>${h.name}</h2>
          <p class="lead">${h.lead}</p>
          <p class="hcard__facts">
            <span class="chip">до ${h.guests} гостей</span>
            <span class="chip">${h.beds}</span>
          </p>
          <div class="hcard__price">
            <div><b>${P(pr.weekday.price)}</b><span>${pr.weekday.note}</span></div>
            <div><b>${P(pr.weekend.price)}</b><span>${pr.weekend.note}</span></div>
            <div><b>${P(pr.holiday.price)}</b><span>${pr.holiday.label}</span></div>
          </div>
          <div class="hcard__actions">
            <a class="btn btn--primary" href="booking.html?type=house&house=${h.id}">Залишити заявку ${ARROW}</a>
            <a class="btn btn--ghost" href="house.html?id=${h.id}">Детальніше</a>
          </div>
        </div>
      </article>`).join('');
  }

  /* ---------- ДЕТАЛЬ БУДИНОЧКА ---------------------------- */
  function houseDetail() {
    const root = $('#houseDetail');
    if (!root) return;
    const id = new URLSearchParams(location.search).get('id');
    const h = D.house(id) || D.data.houses[0];
    const pr = D.data.housePricing;

    /* Hero */
    const hero = $('#houseHero');
    if (hero) {
      hero.innerHTML = D.imgTag(h.hero, { alt: h.name + ' — SAP SAN', sizes: '100vw', priority: true });
    }
    const t = $('#houseTitle'); if (t) t.textContent = h.name;
    const k = $('#houseKicker'); if (k) k.textContent = h.kicker;
    const l = $('#houseLead'); if (l) l.textContent = h.lead;
    document.title = h.name + ' — SAP SAN Resort & Retreat';
    const md = $('meta[name="description"]');
    if (md) md.setAttribute('content', h.lead);

    root.innerHTML = `
      <div class="hdetail__main">
        <p class="hdetail__desc">${h.description}</p>

        <dl class="hdetail__specs">
          <div><dt>Гостей</dt><dd>до ${h.guests}</dd></div>
          <div><dt>Спальні місця</dt><dd>${h.beds}</dd></div>
          <div><dt>Заїзд</dt><dd>з ${S.checkIn}</dd></div>
          <div><dt>Виїзд</dt><dd>до ${S.checkOut}</dd></div>
        </dl>

        <div>
          <p class="eyebrow" style="margin-bottom:1rem">Зручності</p>
          <ul class="hdetail__amen">${h.amenities.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>

        <div>
          <p class="eyebrow" style="margin-bottom:1rem">У вартість входить</p>
          <ul class="rules-list">${pr.included.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>

        <div>
          <p class="eyebrow" style="margin-bottom:1rem">Правила заїзду та виїзду</p>
          <ul class="rules-list">${pr.rules.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
      </div>

      <aside class="hdetail__aside">
        <p class="eyebrow">Вартість за добу</p>
        <dl style="display:grid">
          <div class="hdetail__rate"><dt><b>${pr.weekday.label}</b><span>${pr.weekday.note}</span></dt><dd>${P(pr.weekday.price)}</dd></div>
          <div class="hdetail__rate"><dt><b>${pr.weekend.label}</b><span>${pr.weekend.note}</span></dt><dd>${P(pr.weekend.price)}</dd></div>
          <div class="hdetail__rate"><dt><b>${pr.special.label}</b><span>${pr.special.note} · ${pr.special.save}</span></dt><dd>${P(pr.special.price)}</dd></div>
          <div class="hdetail__rate"><dt><b>${pr.holiday.label}</b><span>${pr.holiday.note}</span></dt><dd>${P(pr.holiday.price)}</dd></div>
        </dl>
        <a class="btn btn--primary" href="booking.html?type=house&house=${h.id}">Залишити заявку ${ARROW}</a>
        <a class="btn btn--ghost" href="tel:${S.phoneHref}">${S.phone}</a>
        <p class="hdetail__note">Заявка на сайті не означає автоматичне підтвердження бронювання. Для фіксації дати потрібна передоплата.</p>
      </aside>`;

    /* Галерея будиночка */
    const gal = $('#houseGallery');
    if (gal) {
      gal.innerHTML = h.gallery.slice(0, 5).map(g => `
        <figure>${D.imgTag(g, { alt: h.name + ' — SAP SAN', sizes: '(max-width: 700px) 50vw, 33vw' })}</figure>`).join('');
    }

    /* Інші будиночки */
    const other = $('#otherHouses');
    if (other) {
      other.innerHTML = D.data.houses.filter(x => x.id !== h.id).map(x => `
        <a class="hcard__media" href="house.html?id=${x.id}" style="aspect-ratio:4/3;display:block" aria-label="${x.name}">
          ${D.imgTag(x.hero, { alt: x.name, sizes: '(max-width: 780px) 100vw, 45vw' })}
          <span class="hcard__n">${x.name}</span>
        </a>`).join('');
    }
  }

  /* ---------- БАСЕЙН -------------------------------------- */
  function poolPage() {
    const rates = $('#poolRates');
    if (rates) {
      const p = D.data.pool;
      rates.innerHTML =
        p.tariffs.map(t => `
          <div class="rates__row">
            <dt><b>${t.label}</b><span>${t.note} · ${t.meta}</span></dt>
            <dd>${P(t.price)}</dd>
          </div>`).join('') +
        p.children.map(c => `
          <div class="rates__row">
            <dt><b>${c.label}</b><span>${c.note}</span></dt>
            <dd>${c.price === null ? '<small style="margin:0">уточнюйте</small>' : P(c.price)}</dd>
          </div>`).join('') +
        p.extras.map(e => `
          <div class="rates__row">
            <dt><b>${e.label}</b><span>додаткова оренда</span></dt>
            <dd>${P(e.price)}</dd>
          </div>`).join('');
    }

    const incl = $('#poolIncluded');
    if (incl) incl.innerHTML = D.data.pool.included.map(i => `<span class="chip">${i}</span>`).join('');

    const rl = $('#poolRules');
    if (rl) rl.innerHTML = D.data.pool.rules.map(r => `<li>${r}</li>`).join('');

    const pg = $('#poolGallery');
    if (pg) {
      pg.innerHTML = D.data.pool.gallery.map(g => `
        <figure>${D.imgTag(g, { alt: 'Басейн SAP SAN', sizes: '(max-width: 700px) 50vw, 33vw' })}</figure>`).join('');
    }
  }

  /* ---------- ГАЛЕРЕЯ ------------------------------------- */
  function galleryPage() {
    const grid = $('#ggrid');
    if (!grid) return;
    const items = D.data.gallery;

    const filter = $('#gfilter');
    if (filter) {
      filter.innerHTML = D.data.galleryTags.map((t, i) =>
        `<button type="button" data-tag="${t}" aria-pressed="${i === 0}">${t}</button>`).join('');
    }

    grid.innerHTML = items.map((g, i) => `
      <figure class="ggrid__item" data-tag="${g.tag}">
        ${D.imgTag(g.image, { alt: g.alt, sizes: '(max-width: 780px) 50vw, 33vw' })}
        <figcaption class="ggrid__cap">${g.tag}</figcaption>
        <button type="button" data-i="${i}" aria-label="Відкрити: ${g.alt}"></button>
      </figure>`).join('');

    /* Фільтр */
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

    /* Лайтбокс */
    const lb = $('#lightbox');
    if (!lb) return;
    const lbImg = $('img', lb);
    const lbCap = $('.lightbox__cap', lb);
    let cur = 0;
    const visible = () => $$('.ggrid__item:not(.is-hidden) button', grid).map(b => +b.dataset.i);

    const show = (i) => {
      const g = items[i];
      if (!g) return;
      cur = i;
      lbImg.src = D.img(g.image);
      lbImg.srcset = D.srcset(g.image);
      lbImg.sizes = '92vw';
      lbImg.alt = g.alt;
      lbCap.textContent = g.alt;
    };
    const open = (i) => { show(i); lb.classList.add('is-open'); document.body.classList.add('is-locked'); $('.lightbox__close', lb).focus(); };
    const close = () => { lb.classList.remove('is-open'); document.body.classList.remove('is-locked'); };
    const move = (d) => {
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

  /* ---------- ПРАВИЛА ТА FAQ ------------------------------ */
  function rulesPage() {
    const box = $('#faqGroups');
    if (!box) return;

    box.innerHTML = D.data.faqGroups.map((g, gi) => `
      <section class="faq__group" data-reveal>
        <h2 class="display d3" style="margin-bottom:1.2rem">${g.title}</h2>
        <div class="faq__list">
          ${g.items.map((f, i) => `
            <div class="faq__item">
              <h3 style="margin:0">
                <button class="faq__q" aria-expanded="false" aria-controls="fa-${gi}-${i}" id="fq-${gi}-${i}">
                  <span>${f.q}</span><span class="faq__sign" aria-hidden="true"></span>
                </button>
              </h3>
              <div class="faq__a" id="fa-${gi}-${i}" role="region" aria-labelledby="fq-${gi}-${i}"><p>${f.a}</p></div>
            </div>`).join('')}
        </div>
      </section>`).join('');

    bindAccordion(box);

    const pr = $('#poolRulesList');
    if (pr) pr.innerHTML = D.data.pool.rules.map(r => `<li>${r}</li>`).join('');
    const hr = $('#houseRulesList');
    if (hr) hr.innerHTML = D.data.housePricing.rules.concat(D.data.housePricing.included).map(r => `<li>${r}</li>`).join('');
  }

  /* Акордеон — по одному відкритому в межах групи */
  function bindAccordion(scope) {
    $$('.faq__list', scope).forEach(list => {
      $$('.faq__item', list).forEach(item => {
        const btn = $('.faq__q', item);
        const panel = $('.faq__a', item);
        btn.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          $$('.faq__item', list).forEach(o => {
            o.classList.remove('is-open');
            $('.faq__q', o).setAttribute('aria-expanded', 'false');
            $('.faq__a', o).style.height = '0px';
          });
          if (!isOpen) {
            item.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            panel.style.height = panel.scrollHeight + 'px';
          }
        });
      });
    });
  }

  /* ---------- КАРТА + КОНТАКТИ ---------------------------- */
  function mapBlock() {
    const frame = $('#mapFrame');
    if (frame) {
      frame.innerHTML = '<iframe title="Розташування SAP SAN на карті" loading="lazy" ' +
        'referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="' + S.mapEmbed + '"></iframe>';
    }
    const info = $('#mapInfo');
    if (info) {
      info.innerHTML = `
        <div class="contact-line"><b>Адреса</b>
          <a href="${S.mapLink}" target="_blank" rel="noopener">${S.addressFull}</a></div>
        <div class="contact-line"><b>Телефон</b>
          <a href="tel:${S.phoneHref}">${S.phone}</a></div>
        <div class="contact-line"><b>Email</b>
          <a href="mailto:${S.email}">${S.email}</a></div>
        <div class="contact-line"><b>Instagram</b>
          <a href="${S.instagram}" target="_blank" rel="noopener">${S.instagramLabel}</a></div>
        <div class="contact-line"><b>Графік роботи</b><span>${S.hours}</span></div>
        <div class="contact-line"><b>Заїзд · виїзд</b><span>з ${S.checkIn} · до ${S.checkOut}</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:.8rem;margin-top:.5rem">
          <a class="btn btn--primary" href="${S.routeLink}" target="_blank" rel="noopener">Прокласти маршрут ${ARROW}</a>
          <a class="btn btn--ghost" href="booking.html">Забронювати</a>
        </div>`;
    }
  }

  /* ---------- BOOT ---------------------------------------- */
  function boot() {
    advantages();
    housesList();
    houseDetail();
    poolPage();
    galleryPage();
    rulesPage();
    mapBlock();
    /* FAQ-акордеон на головній рендериться в app.js */
  }

  /* Рендер стартує лише коли готові і DOM, і контент з API */
  if (window.SAPSAN && window.SAPSAN.onReady) window.SAPSAN.onReady(boot);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
