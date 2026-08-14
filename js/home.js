/* ============================================================
   SAP SAN — ГОЛОВНА СТОРІНКА
   ------------------------------------------------------------
   Малює секції, які залежать від контенту: що тут є, напрямки,
   один день, кухня, галерея, тарифи басейну, FAQ.

   Статична композиція живе в index.html, звідси приходять лише
   списки — так розмітку видно очима, а не тільки в шаблонних
   рядках JS.
   ============================================================ */
(function () {
  'use strict';

  const D = window.SAPSAN;
  if (!D) return;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const I = D.icon;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------- 1. ЩО ТУТ Є ---------------------------------
     Не сітка однакових карток, а нумерований перелік із
     тонкими лініями: читається як зміст книги, а не як
     блок «наші переваги» з шаблону.                       */
  function advantages() {
    const box = $('#advantages');
    if (!box) return;
    box.innerHTML = (D.data.advantages || []).map((a, i) => `
      <article class="adv__item" data-reveal="${(i % 2) * 0.08}">
        <span class="adv__n">${String(i + 1).padStart(2, '0')}</span>
        <span class="adv__ico">${I(a.icon)}</span>
        <h3 class="adv__title d4 display">${a.title}</h3>
        <p class="adv__text">${a.text}</p>
      </article>`).join('');
  }

  /* ---------- 2. НАПРЯМКИ ---------------------------------
     Кадр стоїть у власній колонці й ніколи не лягає поверх
     тексту. Перемикання — крос-фейд зі зсувом: кадр наче
     заходить у рамку збоку, як і решта руху на сайті.     */
  function experiences() {
    const list = $('#expList');
    if (!list) return;
    const items = D.data.experiences || [];

    list.innerHTML = items.map((it, i) => `
      <li class="exp__item" data-exp="${i}">
        <a class="exp__link" href="${it.href}">
          <span class="exp__n">${String(i + 1).padStart(2, '0')}</span>
          <span class="exp__label display">${it.label}</span>
          <span class="exp__note">${it.note}</span>
          <span class="exp__go">${I('arrow')}</span>
        </a>
        <div class="exp__mobile">${D.picture(it.image, {
      sizes: '(max-width: 900px) 92vw, 1px', kind: 's',
      alt: it.label + ' — SAP SAN'
    })}</div>
      </li>`).join('');

    const preview = $('#expPreview');
    if (preview) {
      preview.innerHTML = items.map((it, i) => `
        <div class="exp__frame${i === 0 ? ' is-active' : ''}" data-frame="${i}">
          ${D.picture(it.image, {
        sizes: '(max-width: 900px) 1px, 40vw', kind: 'p',
        alt: it.label + ' — SAP SAN'
      })}
        </div>`).join('');
    }
    const frames = preview ? $$('.exp__frame', preview) : [];
    let current = 0;
    const show = i => { current = i; frames.forEach((f, k) => f.classList.toggle('is-active', k === i)); };

    /* Режим визначаємо в момент події, а не один раз при
       завантаженні: гібридні ноутбуки й поворот екрана
       інакше ламають логіку. */
    const isTouch = () =>
      window.matchMedia('(hover: none)').matches || window.innerWidth <= 900;

    /* Наведення на конкретний пункт — швидкий спосіб побачити
       його кадр, але не єдиний: щоб побачити решту фото, не
       обов'язково водити мишею по черзі над кожним рядком —
       поки курсор осторонь, кадри самі гортаються по колу. */
    let cycleTimer = null;
    const stopCycle = () => { if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; } };
    const startCycle = () => {
      if (isTouch() || REDUCED || !frames.length || frames.length < 2) return;
      stopCycle();
      cycleTimer = setInterval(() => show((current + 1) % frames.length), 2600);
    };
    startCycle();

    $$('.exp__item', list).forEach((item, i) => {
      const link = $('.exp__link', item);
      const box = $('.exp__mobile', item);

      const activate = () => {
        if (isTouch()) return;
        stopCycle();
        show(i);
        $$('.exp__item', list).forEach((o, k) => o.classList.toggle('is-dim', k !== i));
      };
      item.addEventListener('mouseenter', activate);
      link.addEventListener('focus', activate);
      list.addEventListener('mouseleave', () => {
        $$('.exp__item', list).forEach(o => o.classList.remove('is-dim'));
        startCycle();
      });

      /* Тап-fallback: перший тап розкриває кадр під пунктом,
         другий веде за посиланням. */
      link.addEventListener('click', e => {
        if (!isTouch()) return;
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
  }

  /* ---------- 3. ОДИН ДЕНЬ ---------------------------------
     Без фотографій і без sticky-скролу: sticky на мобільному
     вимикається (position: static в CSS), тому бейдж-іконка
     просто пролітала повз разом із текстом — гість пролистував,
     не встигнувши помітити, що вона взагалі змінюється.

     Натомість — той самий принцип, що й у блоці «Напрямки»
     вище: іконка стоїть по центру нерухомо, підписи в ряд під
     нею перемикають її наведенням (тап на мобільному). Перший
     крок активний за замовчуванням.                            */
  function chapters() {
    const badges = $('#chapterBadges');
    const hubtext = $('#chapterHubtext');
    const tabs = $('#chapterTabs');
    if (!badges || !tabs) return;
    const data = D.data.chapters || [];

    /* icon: 'falcon' — окремий випадок: це справжній контур знака
       (SAPSAN.bird), а не піктограма з набору icons{}. */
    badges.innerHTML = data.map((c, i) => `
      <span class="story__badge${i === 0 ? ' is-active' : ''}" data-badge="${i}">
        ${c.icon === 'falcon' ? D.bird('story__badgebird') : D.icon(c.icon, 'story__badgeico')}
      </span>`).join('');

    hubtext.innerHTML = data.map((c, i) => `
      <div class="story__hubstep${i === 0 ? ' is-active' : ''}" data-hubstep="${i}">
        <p class="story__meta"><span class="num">${c.n}</span><span>${c.time}</span></p>
        <h3 class="display d3">${c.title}</h3>
        <p class="story__tag ">${c.tag || ''}</p>
        <p class="story__text story__tag_p">${c.text}</p>
      </div>`).join('');

    tabs.innerHTML = data.map((c, i) => `
      <button class="story__tab${i === 0 ? ' is-active' : ''}" data-tab="${i}"
              role="tab" aria-selected="${i === 0}">
        <span class="story__tabn">${c.n}</span>
        <span class="story__tabl">${c.title}</span>
      </button>`).join('');

    const badgeEls = $$('.story__badge', badges);
    const hubstepEls = $$('.story__hubstep', hubtext);
    const tabEls = $$('.story__tab', tabs);
    const ring = $('#chapterRing');

    /* Кроки лежать один на одному (position:absolute), тому
       контейнер сам не знає своєї висоти — вона розрахована
       наперед (CSS min-height), а тексти в різних кроків не
       однакової довжини. Рахуємо найвищий крок і фіксуємо
       висоту контейнера в px, інакше довший текст наїжджає
       на підписи знизу. */
    const fitHeight = () => {
      const h = Math.max(0, ...hubstepEls.map(s => s.offsetHeight));
      if (h) hubtext.style.minHeight = h + 'px';
    };
    fitHeight();
    window.addEventListener('resize', fitHeight);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeight);

    const setActive = i => {
      badgeEls.forEach((s, k) => s.classList.toggle('is-active', k === i));
      hubstepEls.forEach((s, k) => s.classList.toggle('is-active', k === i));
      tabEls.forEach((s, k) => {
        s.classList.toggle('is-active', k === i);
        s.setAttribute('aria-selected', String(k === i));
      });
      if (ring) ring.style.setProperty('--p', Math.round(((i + 1) / data.length) * 360) + 'deg');
    };

    const isTouch = () => window.matchMedia('(hover: none)').matches;
    let active = 0;

    /* Пінимо не всю секцію (з заголовком і паддінгами), а лише
       обгортку хаба й перемикачів, розтягнуту на весь екран
       (.story__pin), щоб іконка стояла точно по центру, а не
       притиснутою до верху під шапкою. Пінити можна, лише коли
       сам вміст (коло + текст + підписи) влазить під висоту
       екрана: на короткому вікні — той самий cycle-фолбек, що
       й без ScrollTrigger. */
    const STORY_PIN_ENABLED = true;
    const pinTarget = $('#storyPin');
    const headerEl = $('.header');
    const hub = $('#chapterHub');

    /* Базовий padding-top (--header-h) лише звільняє місце під
       шапку. Точний відступ, що ставить ЦЕНТР кола рівно на
       середину вільної висоти, рахуємо тут: тексту й підписів
       під колом завжди більше, ніж нічого над ним, тож звичайне
       flex-центрування всієї групи тягне коло вище за центр. */
    const centerRing = () => {
      if (!headerEl) return;
      const headerH = headerEl.offsetHeight;
      document.documentElement.style.setProperty('--header-h', headerH + 'px');
      if (!pinTarget || !ring) return;
      pinTarget.style.paddingTop = headerH + 'px';
      const availH = window.innerHeight - headerH;
      const pinRect = pinTarget.getBoundingClientRect();
      const ringRect = ring.getBoundingClientRect();
      const currentPad = headerH;
      const ringOffset = (ringRect.top - pinRect.top) + ringRect.height / 2;
      const wantShift = (headerH + availH / 2) - ringOffset;
      /* Підписи-перемикачі мають лишатися видимими цілком —
         центрування кола не може виштовхнути їх за нижній край
         екрана. Тому зсув униз обмежений тим, скільки вільного
         місця лишається під підписами при базовому відступі. */
      const tabsBottom = tabs ? tabs.getBoundingClientRect().bottom - pinRect.top : ringOffset;
      const maxShift = Math.max(0, (headerH + availH) - tabsBottom);
      const shift = Math.max(0, Math.min(wantShift, maxShift));
      pinTarget.style.paddingTop = (currentPad + shift) + 'px';
    };
    centerRing();
    window.addEventListener('resize', centerRing);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(centerRing);

    const contentH = (hub ? hub.offsetHeight : 0) + (tabs ? tabs.offsetHeight : 0) + 96;
    const fitsViewport = contentH <= window.innerHeight * .94;
    const canPin = STORY_PIN_ENABLED && hasGSAP && window.ScrollTrigger && pinTarget && !REDUCED && data.length > 1 && fitsViewport;

    if (canPin) {
      /* Блок «прилипає» на час прокрутки одного екрана на крок:
         гість гортає — крок за кроком бачить усі стани, і тільки
         після останнього сторінка їде далі. На відміну від
         старого sticky (CSS), ScrollTrigger керує самим скролом,
         тому працює однаково на десктопі й на тач — це і було
         проблемою першої версії блоку. */
      let st;
      const build = () => {
        if (st) st.kill();
        st = ScrollTrigger.create({
          trigger: pinTarget, start: 'top top',
          end: () => '+=' + (data.length - 1) * Math.max(window.innerHeight * .8, 480),
          pin: true, anticipatePin: 1, scrub: .35,
          snap: { snapTo: 1 / (data.length - 1), duration: .35, ease: 'power1.inOut' },
          onUpdate(self) {
            const i = Math.min(data.length - 1, Math.round(self.progress * (data.length - 1)));
            if (i !== active) { active = i; setActive(i); }
          }
        });
      };
      build();
      window.addEventListener('resize', () => ScrollTrigger.refresh());
    } else if (STORY_PIN_ENABLED) {
      /* Без ScrollTrigger (reduced-motion, старий браузер) —
         той самий принцип, що й у «Напрямках»: кроки самі
         гортаються по колу, поки гість не навів курсор. */
      let cycleTimer = null;
      const stopCycle = () => { if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; } };
      const startCycle = () => {
        if (isTouch() || REDUCED || data.length < 2) return;
        stopCycle();
        cycleTimer = setInterval(() => { active = (active + 1) % data.length; setActive(active); }, 3200);
      };
      startCycle();
      tabs.addEventListener('mouseleave', startCycle);
      tabEls.forEach(tab => tab.addEventListener('mouseenter', stopCycle));
    }
    /* STORY_PIN_ENABLED=false: без автопрокрутки й без пінінгу —
       статичний перший крок, перемикання лише наведенням/тапом/
       кліком по підписах нижче. */

    tabEls.forEach((tab, i) => {
      const activate = () => { active = i; setActive(i); };
      tab.addEventListener('mouseenter', () => { if (!isTouch()) activate(); });
      tab.addEventListener('focus', activate);
      tab.addEventListener('click', activate);
    });
  }

  /* ---------- 4. КУХНЯ І БАР -------------------------------
     Смуга з чотирьох кадрів різної висоти й вертикального
     зсуву. Рівний ряд однакових плиток тут читався б як
     стокова галерея.                                       */
  function kitchen() {
    const strip = $('#kitchenStrip');
    if (!strip) return;
    const k = D.data.kitchen || {};
    strip.innerHTML = (k.frames || []).map((f, i) => `
      <figure class="kit__cell kit__cell--${i + 1}" data-reveal="${i * 0.06}">
        <div class="figure reveal-img">${D.picture(f.image, {
      sizes: '(max-width: 760px) 44vw, 22vw', kind: 'p'
    })}</div>
        <figcaption class="figcap">${f.cap}</figcaption>
      </figure>`).join('');
  }

  /* ---------- 5. ГАЛЕРЕЯ НА ГОЛОВНІЙ -----------------------
     Колонкова масонрі: кадри стають щільно один під одного,
     без дір і рваного низу.                               */
  function collage() {
    const box = $('#collage');
    if (!box) return;
    const items = (D.data.gallery || []).slice(0, 9);
    box.innerHTML = items.map((g, i) => `
      <figure class="mason__item">
        <a class="figure reveal-img" href="gallery.html" aria-label="${D.alt(g.image)} — відкрити галерею">
          ${D.picture(g.image, {
      sizes: '(max-width: 720px) 46vw, 30vw',
      kind: i % 3 === 1 ? 'p' : null
    })}
        </a>
        <figcaption class="mason__tag">${g.tag || ''}</figcaption>
      </figure>`).join('');
  }

  /* ---------- 6. ТАРИФИ БАСЕЙНУ ---------------------------- */
  function poolRates() {
    const box = $('#poolRates');
    if (!box) return;
    const p = D.data.pool || {};
    box.innerHTML = (p.tariffs || []).map(t => `
      <div class="rate">
        <dt><b>${t.label}</b><span>${t.note}</span></dt>
        <dd class="num tnum">${Number(t.price).toLocaleString('uk-UA')}<small>грн</small></dd>
      </div>`).join('');
  }

  /* ---------- 7. FAQ + структуровані дані ------------------ */
  function faq() {
    const list = $('#faqList');
    if (!list) return;
    /* На головній — по одному найважливішому питанню з кожної
       групи. Повний перелік живе на сторінці правил. */
    const items = (D.data.faqGroups || []).map(g => g.items[0]).filter(Boolean);

    list.innerHTML = items.map((f, i) => `
      <div class="acc__item">
        <h3>
          <button class="acc__q" aria-expanded="false" aria-controls="a-${i}" id="q-${i}">
            <span>${f.q}</span>
            <span class="acc__sign" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="acc__a" id="a-${i}" role="region" aria-labelledby="q-${i}"><p>${f.a}</p></div>
      </div>`).join('');

    D.bindAccordion(list);

    /* Для пошуку віддаємо ПОВНИЙ перелік, а не скорочений */
    const node = $('#faq-schema');
    if (node) {
      node.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: (D.data.faq || []).map(f => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      });
    }
  }

  /* ---------- 8. КАРТА ------------------------------------- */
  function map() {
    const frame = $('#mapFrame');
    const S = D.data.settings;
    if (frame && !frame.dataset.done) {
      frame.dataset.done = '1';
      frame.innerHTML = '<iframe title="Розташування SAP SAN на карті" loading="lazy" ' +
        'referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="' + S.mapEmbed + '"></iframe>';
    }
    const route = $('#routeBtn');
    if (route) route.href = S.routeLink;

    const list = $('#contactList');
    if (list) {
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
  }

  function boot() {
    advantages();
    experiences();
    chapters();
    kitchen();
    collage();
    poolRates();
    faq();
    map();
  }


  if (window.SAPSAN.onReady) window.SAPSAN.onReady(boot);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
