/* ============================================================
   SAP SAN — CONTENT LAYER
   ------------------------------------------------------------
   Єдине джерело контенту для всього сайту.
   Пізніше замінюється на API без змін у розмітці:

     SAPSAN.load()  ->  Promise<data>

   Досить переписати тіло load() на fetch('/api/content'),
   зберігши форму об'єкта нижче.

   ПОЗНАЧКА «TODO(адмін)» = поле, яке має заповнити замовник
   через адмінпанель. Там, де даних немає, сайт показує
   нейтральний текст, а не вигадану інформацію.
   ============================================================ */

(function (global) {
  'use strict';

  /* ---------- НАЛАШТУВАННЯ ТА КОНТАКТИ --------------------
     Дані взято з офіційних матеріалів SAP SAN.            */
  const settings = {
    brand: 'SAP SAN',
    descriptor: 'Resort & Retreat',
    tagline: 'Місце, куди хочеться повертатися',

    phone: '098 093 80 99',
    phoneHref: '+380980938099',
    email: 'temorin7@gmail.com',
    instagram: 'https://www.instagram.com/sapsan_resort_/',
    instagramLabel: '@sapsan_resort_',

    address: 'Бакали, Київська область',
    addressFull: 'P24M+7W Бакали, Київська область, Україна',
    lat: 49.705605,
    lng: 30.0347499,
    mapLink: 'https://maps.app.goo.gl/jLzCdgu8ZdnuLptz7',

    /* Графік роботи комплексу */
    hours: 'Щодня 10:00 — 22:00',
    hoursTable: [
      { d: 'Понеділок — Неділя', t: '10:00 — 22:00' }
    ],

    menuUrl: 'https://sapsan-resort.choiceqr.com/',
    checkIn: '14:00',
    checkOut: '12:00',
    currency: 'грн'
  };

  /* Готові посилання на карту (без API-ключа) */
  settings.mapEmbed =
    'https://www.google.com/maps?q=' + settings.lat + ',' + settings.lng +
    '&hl=uk&z=16&output=embed';
  settings.routeLink =
    'https://www.google.com/maps/dir/?api=1&destination=' +
    settings.lat + ',' + settings.lng;

  /* ---------- ПЕРЕВАГИ ------------------------------------ */
  const advantages = [
    { icon: 'wave',  title: 'Будиночки на воді',   text: 'A-frame із панорамним склінням стоять просто над озером.' },
    { icon: 'pool',  title: 'Відкритий басейн',    text: 'Шезлонг, парасолька та роздягальня вже у вартості квитка.' },
    { icon: 'fork',  title: 'Ресторан і бар',      text: 'Смачна їжа та авторські напої за кілька кроків від шезлонга.' },
    { icon: 'fire',  title: 'Тераса з мангалом',   text: 'Власна зона відпочинку біля кожного будиночка.' },
    { icon: 'tree',  title: 'Ліс і тиша',          text: 'Ані сусідів у полі зору, ані міського шуму.' },
    { icon: 'key',   title: 'Все включено в ціну', text: 'Білизна, рушники, посуд і кухонне приладдя.' }
  ];

  /* ---------- БУДИНОЧКИ -----------------------------------
     TODO(адмін): назви та кількість — робочі. Тарифи однакові,
     бо в офіційному прайсі один тариф на будиночок.       */
  const houses = [
    {
      id: 'aframe-water',
      index: '01',
      name: 'A-frame на воді',
      kicker: 'Просто над водою',
      lead: 'Будиночок стоїть на самій воді. Вранці озеро починається одразу за склом.',
      description: 'Двоповерховий A-frame із суцільним панорамним фронтоном. Спальня на другому рівні, вітальня з диваном і повноцінна кухня внизу. Власна тераса з мангалом виходить прямо на воду.',
      guests: 4,
      beds: '1 двоспальне ліжко + розкладний диван',
      area: '',                     // TODO(адмін): площа, м²
      hero: 'houses-water-wide',
      gallery: ['house-terrace-lake', 'house-bedroom', 'house-living', 'house-bath', 'house-kitchen'],
      amenities: ['Панорамне скління', 'Тераса з мангалом', 'Кухня з посудом', 'Душ та санвузол', 'Кондиціонер', 'Сонячні панелі', 'Wi-Fi', 'Постільна білизна та рушники']
    },
    {
      id: 'aframe-terrace',
      index: '02',
      name: 'A-frame з терасою',
      kicker: 'Тераса на озеро',
      lead: 'Велика відкрита тераса, власна зона мангалу і жодних сусідів у полі зору.',
      description: 'Просторий A-frame із найбільшою терасою серед будиночків. Всередині — світла вітальня, кухня та окрема спальна зона. Ідеально для компанії, що планує вечеряти на свіжому повітрі.',
      guests: 4,
      beds: '1 двоспальне ліжко + розкладний диван',
      area: '',
      hero: 'house-aframe-terrace',
      gallery: ['house-terrace-table', 'house-kitchen', 'house-interior-lounge', 'house-bath-2', 'house-living'],
      amenities: ['Панорамне скління', 'Простора тераса', 'Повноцінна кухня', 'Душ та санвузол', 'Кондиціонер', 'Мангал', 'Wi-Fi', 'Постільна білизна та рушники']
    },
    {
      id: 'aframe-pano',
      index: '03',
      name: 'A-frame панорамний',
      kicker: 'Вид на воду з ліжка',
      lead: 'Скляний фронтон на всю висоту. Вечірнє світло заходить у будинок до останньої хвилини.',
      description: 'Найсвітліший будиночок комплексу: скло від підлоги до вершини даху. Вид на озеро відкривається одразу з ліжка. Кухня, санвузол і тераса з мангалом — як і в інших будиночках.',
      guests: 4,
      beds: '1 двоспальне ліжко + розкладний диван',
      area: '',
      hero: 'houses-water-wide-2',
      gallery: ['house-terrace-table', 'house-interior-kitchen-wide', 'house-living', 'house-bedroom', 'terrace-rope-view'],
      amenities: ['Панорамне скління', 'Тераса біля води', 'Кухня з посудом', 'Душ та санвузол', 'Кондиціонер', 'Мангал', 'Wi-Fi', 'Постільна білизна та рушники']
    }
  ];

  /* Тарифи — з офіційного прайс-листа на оренду будиночка */
  const housePricing = {
    weekday: { id: 'weekday', label: 'Будні', note: 'Понеділок — Четвер', price: 4000, unit: 'за добу' },
    weekend: { id: 'weekend', label: 'Вихідні', note: 'П’ятниця — Неділя', price: 6000, unit: 'за добу' },
    special: {
      id: 'special',
      label: 'Вікенд зі знижкою',
      note: '2 доби у вихідні',
      price: 5000,
      unit: 'за добу',
      save: 'економія 2 000 грн'
    },
    /* TODO(адмін): святкові тарифи в офіційному прайсі відсутні.
       Поки price === null сайт пише «за запитом», а не вигадану суму. */
    holiday: { id: 'holiday', label: 'Свята', note: 'Святкові та довгі вихідні', price: null, unit: 'за добу' },

    included: [
      'Повне користування будинком та прилеглою територією',
      'Облаштована зона для відпочинку — мангал, тераса',
      'Чиста постільна білизна, рушники та базові засоби гігієни',
      'Посуд та кухонне приладдя'
    ],
    rules: [
      'Час заїзду — з 14:00',
      'Час виїзду — до 12:00',
      'Для фіксації дати обов’язкова передоплата'
    ]
  };

  /* ---------- БАСЕЙН — з офіційного прайс-листа ----------- */
  const pool = {
    hero: 'pool-cabanas',
    lead: 'Відкритий басейн над озером. Шезлонг, парасолька та роздягальня вже у вартості квитка.',
    hours: 'Щодня 10:00 — 22:00',
    eveningHours: '18:00 — 22:00',

    tariffs: [
      { id: 'day-weekday', label: 'Денний тариф', note: 'Понеділок — Четвер', price: 800, meta: 'квиток на весь день', who: 'дорослі' },
      { id: 'day-weekend', label: 'Денний тариф', note: 'П’ятниця — Неділя', price: 900, meta: 'квиток на весь день', who: 'дорослі' },
      { id: 'evening',     label: 'Вечірні години', note: 'Щодня, 18:00 — 22:00', price: 700, meta: 'єдина ціна для всіх днів', who: 'дорослі' }
    ],
    /* Дитячий тариф в офіційному прайсі окремо не вказано —
       відома лише безкоштовна категорія. TODO(адмін). */
    children: [
      { label: 'Діти до 5 років', price: 0, note: 'безкоштовно' },
      { label: 'Діти від 5 років', price: null, note: 'за дорослим тарифом — уточнюйте' }
    ],

    included: ['Шезлонг', 'Парасолька', 'Роздягальня'],
    extras: [
      { label: 'Рушник', price: 100 },
      { label: 'Халат', price: 200 }
    ],

    /* Тільки те, що підтверджено офіційними матеріалами.
       TODO(адмін): доповнити повним переліком правил. */
    rules: [
      'Діти до 5 років відвідують басейн безкоштовно',
      'У вартість квитка входить користування шезлонгом, парасолькою та роздягальнею',
      'Додатково можна орендувати рушник — 100 грн, халат — 200 грн',
      'Вечірні години діють щодня з 18:00 до 22:00',
      'Шезлонги можна забронювати заздалегідь за телефоном',
      'Діти до 14 років — під наглядом дорослих'
    ],

    gallery: ['pool-cabanas-wide', 'pool-loungers-lake', 'cabana-curtains', 'pool-lounger', 'pool-umbrellas', 'pool-wide-blue']
  };

  /* ---------- НАПРЯМКИ (hover reveal navigation) ---------- */
  const experiences = [
    { id: 'houses',    label: 'Будиночки', image: 'house-aframe-terrace', href: 'houses.html',  note: 'A-frame над водою' },
    { id: 'pool',      label: 'Басейн',    image: 'pool-wide-blue',       href: 'pool.html',    note: 'Відкрита вода й шезлонги' },
    { id: 'kitchen',   label: 'Кухня',     image: 'drink-passion',        href: '#kitchen',     note: 'Ресторан і авторський бар' },
    { id: 'territory', label: 'Територія', image: 'houses-water-wide-2',  href: 'gallery.html', note: 'Озеро, ліс, тиша' },
    { id: 'rest',      label: 'Відпочинок',image: 'rattan-chair',         href: 'gallery.html', note: 'Повільні дні' }
  ];

  /* ---------- STICKY STORYTELLING ------------------------- */
  const chapters = [
    { n: '01', title: 'Будиночки', image: 'house-aframe-terrace', text: 'Три A-frame будиночки біля води. Панорамне скління, тераса, мангал — і жодних сусідів у полі зору.' },
    { n: '02', title: 'Басейн',    image: 'pool-cabanas-wide',    text: 'Відкритий басейн над озером, білі шатра й шезлонги. Вечірні години — до 22:00.' },
    { n: '03', title: 'Кухня',     image: 'drink-dark',           text: 'Ресторан SAPSAN і авторський бар. Смачна їжа та напої там, де ви й відпочиваєте.' },
    { n: '04', title: 'Природа',   image: 'houses-water-wide-2',  text: 'Вода, ліс і повітря. Причина, чому сюди повертаються ще до кінця сезону.' }
  ];

  /* ---------- ГАЛЕРЕЯ ------------------------------------- */
  const gallery = [
    { image: 'pool-cabanas-wide',     alt: 'Басейн SAP SAN із шатрами та шезлонгами над озером', tag: 'Басейн' },
    { image: 'rattan-chair',          alt: 'Плетене крісло біля басейну',                        tag: 'Відпочинок' },
    { image: 'terrace-rope-view',     alt: 'Вид з тераси на озеро',                              tag: 'Територія' },
    { image: 'drink-grapefruit',      alt: 'Авторський коктейль бару SAP SAN',                   tag: 'Бар' },
    { image: 'pool-loungers-lake',    alt: 'Шезлонги біля басейну з видом на воду',              tag: 'Басейн' },
    { image: 'house-interior-lounge', alt: 'Вітальня всередині будиночка A-frame',               tag: 'Будиночки' },
    { image: 'cabana-lake',           alt: 'Шатро біля води',                                    tag: 'Територія' },
    { image: 'bar-pour',              alt: 'Приготування напоїв у барі',                         tag: 'Бар' },
    { image: 'pool-umbrellas',        alt: 'Парасольки та лежаки біля басейну',                  tag: 'Басейн' },
    { image: 'house-kitchen',         alt: 'Кухня у будиночку',                                  tag: 'Будиночки' },
    { image: 'pool-cabana-tables',    alt: 'Зона відпочинку з видом на басейн',                  tag: 'Відпочинок' },
    { image: 'brand-tee',             alt: 'Команда SAP SAN',                                    tag: 'Територія' },
    { image: 'houses-water-wide',     alt: 'Будиночки A-frame на воді',                          tag: 'Будиночки' },
    { image: 'house-bedroom',         alt: 'Спальня у будиночку A-frame',                        tag: 'Будиночки' },
    { image: 'drink-dark',            alt: 'Авторський напій з лаймом',                          tag: 'Бар' },
    { image: 'pool-loungers-row',     alt: 'Ряд шезлонгів біля басейну',                         tag: 'Басейн' },
    { image: 'house-terrace-lake',    alt: 'Тераса будиночка з видом на озеро',                  tag: 'Будиночки' },
    { image: 'cabana-curtains',       alt: 'Білі шатра біля басейну',                            tag: 'Відпочинок' }
  ];
  const galleryTags = ['Усі', 'Будиночки', 'Басейн', 'Бар', 'Територія', 'Відпочинок'];

  /* ---------- ПРАВИЛА ТА FAQ -----------------------------
     Відповіді спираються тільки на офіційні матеріали.
     Там, де політики немає — чесне «уточнюйте», а не вигадка. */
  const faqGroups = [
    {
      title: 'Бронювання та оплата',
      items: [
        { q: 'Як забронювати будиночок?', a: 'Залиште заявку на сайті або зателефонуйте за номером ' + settings.phone + '. Ми перевіримо доступність дат і підтвердимо бронювання. Заявка на сайті не означає автоматичне підтвердження.' },
        { q: 'Чи потрібна передоплата?', a: 'Так. Для фіксації дати обов’язкова передоплата. Розмір і спосіб оплати уточнює адміністратор під час підтвердження бронювання.' },
        { q: 'Як скасувати або перенести бронювання?', a: 'Зателефонуйте за номером ' + settings.phone + ' якнайраніше. Умови скасування та повернення передоплати адміністратор повідомляє індивідуально.' }
      ]
    },
    {
      title: 'Заїзд і проживання',
      items: [
        { q: 'Коли заїзд і виїзд?', a: 'Заїзд — з 14:00, виїзд — до 12:00.' },
        { q: 'Що входить у вартість проживання?', a: 'Повне користування будинком та прилеглою територією, облаштована зона відпочинку з мангалом і терасою, чиста постільна білизна, рушники та базові засоби гігієни, посуд і кухонне приладдя.' },
        { q: 'Скільки гостей вміщує будиночок?', a: 'До 4 гостей: одне двоспальне ліжко та розкладний диван.' }
      ]
    },
    {
      title: 'Басейн',
      items: [
        { q: 'Скільки коштує відвідування басейну?', a: 'Денний квиток: Понеділок — Четвер 800 грн, П’ятниця — Неділя 900 грн. Вечірні години з 18:00 до 22:00 — 700 грн у будь-який день.' },
        { q: 'Чи входить шезлонг у вартість квитка?', a: 'Так. У вартість входить користування шезлонгом, парасолькою та роздягальнею. Додатково можна орендувати рушник — 100 грн, халат — 200 грн.' },
        { q: 'Чи можна забронювати шезлонги заздалегідь?', a: 'Так, попереднє бронювання шезлонгів можливе за телефоном ' + settings.phone + ' або через форму на сайті.' }
      ]
    },
    {
      title: 'Гості',
      items: [
        { q: 'Чи можна з дітьми?', a: 'Так. Діти до 5 років відвідують басейн безкоштовно. Будиночки розраховані на комфортне розміщення родини. Діти до 14 років мають перебувати на території басейну під наглядом дорослих.' },
        { q: 'Чи можна з тваринами?', a: 'Умови перебування з тваринами узгоджуються індивідуально. Будь ласка, повідомте про це заздалегідь під час бронювання за номером ' + settings.phone + '.' },
        { q: 'Чи є ресторан на території?', a: 'Так, на території працює ресторан SAPSAN та бар з авторськими напоями. Графік роботи — щодня з 10:00 до 22:00. Меню доступне онлайн.' }
      ]
    }
  ];

  /* Плаский список — для structured data та короткого FAQ */
  const faq = faqGroups.reduce((acc, g) => acc.concat(g.items), []);

  const data = {
    settings, advantages, houses, housePricing, pool,
    experiences, chapters, gallery, galleryTags, faqGroups, faq
  };

  /* ============================================================
     ІНТЕГРАЦІЯ З АДМІНКОЮ (Telegram-бот)
     ------------------------------------------------------------
     Якщо у js/config.js заданий apiBase — сайт тягне контент із
     GET {apiBase}/content і підміняє ним вбудований.
     Якщо API недоступне або відповідає повільно — лишається
     вбудований контент. Сайт не має падати через бекенд.
     ============================================================ */
  const CFG = global.SAPSAN_CONFIG || {};

  function fetchContent() {
    if (!CFG.apiBase) return Promise.resolve(null);

    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), CFG.timeoutMs || 4000);

    return fetch(CFG.apiBase.replace(/\/$/, '') + '/content', {
      headers: { 'Accept': 'application/json' },
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(err => {
        console.warn('[SAP SAN] контент з API недоступний, показуємо вбудований:', err.message);
        return null;
      })
      .finally(() => clearTimeout(timer));
  }

  /**
   * Зливаємо відповідь API з вбудованим контентом.
   *
   * Масиви (houses, gallery, faqGroups…) — замінюються цілком.
   * Обʼєкти (settings, pool, housePricing) — зливаються по ключах,
   * тому якщо адмінка надішле pool без tariffs, тарифи лишаться
   * вбудованими, а не зникнуть. Неповна відповідь не має ламати сайт.
   */
  function applyContent(remote) {
    if (!remote || typeof remote !== 'object') return data;

    const isPlainObject = v =>
      v && typeof v === 'object' && !Array.isArray(v);

    Object.keys(data).forEach(key => {
      const incoming = remote[key];
      if (incoming === undefined || incoming === null) return;

      if (Array.isArray(data[key])) {
        if (Array.isArray(incoming) && incoming.length) data[key] = incoming;
        return;
      }

      if (isPlainObject(data[key]) && isPlainObject(incoming)) {
        Object.keys(incoming).forEach(sub => {
          if (incoming[sub] === undefined || incoming[sub] === null) return;
          if (Array.isArray(incoming[sub]) && !incoming[sub].length) return;
          data[key][sub] = incoming[sub];
        });
        return;
      }

      data[key] = incoming;
    });
    /* Похідні посилання перераховуємо після підміни адреси */
    if (data.settings.lat && data.settings.lng) {
      data.settings.mapEmbed = 'https://www.google.com/maps?q=' +
        data.settings.lat + ',' + data.settings.lng + '&hl=uk&z=16&output=embed';
      data.settings.routeLink = 'https://www.google.com/maps/dir/?api=1&destination=' +
        data.settings.lat + ',' + data.settings.lng;
    }
    return data;
  }

  const ready = fetchContent().then(applyContent);

  global.SAPSAN = {
    data,
    config: CFG,

    /** Проміс, який резолвиться, коли контент остаточно готовий */
    ready,

    /** Запуск рендера: чекає і на DOM, і на контент */
    onReady(fn) {
      const dom = document.readyState === 'loading'
        ? new Promise(res => document.addEventListener('DOMContentLoaded', res))
        : Promise.resolve();
      return Promise.all([dom, ready]).then(() => fn(data));
    },

    load() { return ready; },

    house(id) {
      return (data.houses || []).filter(function (h) { return h.id === id; })[0] || null;
    },

    /** Ціна у форматі «4 000 грн», або «за запитом», якщо не задано */
    price(v) {
      if (v === null || v === undefined || v === '') return 'за запитом';
      if (v === 0) return 'безкоштовно';
      return Number(v).toLocaleString('uk-UA') + ' ' + settings.currency;
    },

    /* --- Responsive image helpers (спираються на js/images.js) --- */
    meta(slug) { return (global.SAPSAN_IMAGES || {})[slug] || null; },

    img(slug) {
      const m = this.meta(slug);
      if (!m) return 'images/' + slug + '.webp';
      return 'images/' + slug + '-' + m.sizes[m.sizes.length - 1] + '.webp';
    },

    srcset(slug) {
      const m = this.meta(slug);
      if (!m) return '';
      return m.sizes.map(w => 'images/' + slug + '-' + w + '.webp' + ' ' + w + 'w').join(', ');
    },

    /**
     * <img> з lazy-loading, розмірами (проти CLS) та srcset.
     * opts: {sizes, alt, className, priority}
     */
    imgTag(slug, opts) {
      const o = opts || {};
      const m = this.meta(slug);
      const attrs = [
        'src="' + this.img(slug) + '"',
        'srcset="' + this.srcset(slug) + '"',
        'sizes="' + (o.sizes || '100vw') + '"',
        'alt="' + (o.alt || '').replace(/"/g, '&quot;') + '"',
        m ? 'width="' + m.w + '" height="' + m.h + '"' : '',
        o.className ? 'class="' + o.className + '"' : '',
        o.priority ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'
      ];
      return '<img ' + attrs.filter(Boolean).join(' ') + '>';
    }
  };
})(window);
