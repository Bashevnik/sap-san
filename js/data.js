/* ============================================================
   SAP SAN — ШАР КОНТЕНТУ
   ------------------------------------------------------------
   Єдине джерело тексту й прив'язок до фото для всього сайту.
   Розмітка нічого не «знає» про контент: сторінки малюються
   звідси, тому підміна на API не потребує правок у HTML.
   Слаги фото відповідають маніфесту js/images.js, який пише
   tools/build-images.js із new-images/.
   ПОЗНАЧКА «TODO(адмін)» = поле, яке має заповнити замовник.
   Там, де офіційних даних немає, сайт пише «за запитом» або
   «уточнюйте», а не вигадану інформацію.
   ============================================================ */

(function (global) {
  'use strict';

  /* ---------- НАЛАШТУВАННЯ ТА КОНТАКТИ -------------------- */
  const settings = {
    brand: 'SAP SAN',
    descriptor: 'Resort & Retreat',
    tagline: 'Місце, куди хочеться повертатися',
    promise: 'Природа, комфорт та сервіс для вас',

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

    hours: 'Щодня 10:00 — 22:00',
    hoursTable: [{ d: 'Понеділок — Неділя', t: '10:00 — 22:00' }],

    menuUrl: 'https://sapsan-resort.choiceqr.com/',
    checkIn: '14:00',
    checkOut: '12:00',
    currency: 'грн'
  };

  settings.mapEmbed =
    'https://www.google.com/maps?q=' + settings.lat + ',' + settings.lng + '&hl=uk&z=16&output=embed';
  settings.routeLink =
    'https://www.google.com/maps/dir/?api=1&destination=' + settings.lat + ',' + settings.lng;

  /* ---------- ПЕРЕВАГИ ------------------------------------ */
  const advantages = [
    { icon: 'aframe', title: 'Будинок стоїть на воді',
      text: 'A-frame на понтоні посеред озера. Вранці вода починається одразу за склом — без сусідів у полі зору.' },
    { icon: 'pool', title: 'Відкритий басейн над озером',
      text: 'Шезлонг, парасолька та роздягальня вже у вартості квитка. Вечірні години — до 22:00.' },
    { icon: 'glass', title: 'Ресторан і авторський бар',
      text: 'Кухня SAPSAN працює просто на території. Бармен зробить щось окреме за кілька кроків від шезлонга.' },
    { icon: 'fire', title: 'Своя тераса з мангалом',
      text: 'Власна зона біля кожного будиночка. Вечеря на свіжому повітрі — без черги й без бронювання столика.' },
    { icon: 'pine', title: 'Ліс, вода і тиша',
      text: 'Береги озера в вербах і соснах. Найгучніше тут — вітер і плюскіт біля понтона.' },
    { icon: 'sun', title: 'Автономність',
      text: 'Сонячні панелі на даху, кондиціонер, Wi-Fi, повна кухня з посудом. Усе всередині — привозити нічого.' }
  ];

  /* ---------- БУДИНОЧКИ ----------------------------------- */
  const houses = [
    {
      id: 'aframe-water',
      index: '01',
      name: 'A-frame на воді',
      kicker: 'Понтон посеред озера',
      lead: 'Будиночок стоїть просто на воді. Замість двору — озеро з трьох боків.',
      description: 'Двоповерховий A-frame на власному понтоні. Панорамний фронтон дивиться на відкриту воду, спальня — на другому рівні, вітальня з кухнею — внизу. Тераса з мангалом виходить прямо до води, поруч — трап на берег.',
      guests: 4,
      beds: '1 двоспальне ліжко + розкладний диван',
      area: '',
      hero: 'lake-aframe-wide',
      gallery: ['terrace-solar', 'interior-lounge', 'interior-bed', 'interior-bath-2', 'terrace-lakeview'],
      amenities: ['Панорамне скління', 'Тераса з мангалом', 'Кухня з посудом', 'Душ та санвузол',
                  'Кондиціонер', 'Сонячні панелі', 'Wi-Fi', 'Постільна білизна та рушники']
    },
    {
      id: 'aframe-terrace',
      index: '02',
      name: 'A-frame з терасою',
      kicker: 'Найбільша тераса',
      lead: 'Велика відкрита тераса, власний мангал і жодних сусідів у полі зору.',
      description: 'Просторий A-frame із найбільшою терасою серед будиночків. Всередині — світла вітальня під схилами даху, повноцінна кухня та окрема спальна зона. Варіант для компанії, яка планує вечеряти надворі.',
      guests: 4,
      beds: '1 двоспальне ліжко + розкладний диван',
      area: '',
      hero: 'terrace-glass',
      gallery: ['terrace-evening', 'interior-kitchen', 'interior-sofa', 'interior-bath', 'terrace-lakeview'],
      amenities: ['Панорамне скління', 'Простора тераса', 'Повноцінна кухня', 'Душ та санвузол',
                  'Кондиціонер', 'Мангал', 'Wi-Fi', 'Постільна білизна та рушники']
    },
    {
      id: 'aframe-pano',
      index: '03',
      name: 'A-frame панорамний',
      kicker: 'Вода з ліжка',
      lead: 'Скляний фронтон на всю висоту. Вечірнє світло тримається в будинку до останньої хвилини.',
      description: 'Найсвітліший будиночок комплексу: скло від підлоги до вершини даху. Озеро видно одразу з ліжка. Кухня, санвузол і тераса з мангалом — як і в інших будиночках.',
      guests: 4,
      beds: '1 двоспальне ліжко + розкладний диван',
      area: '',
      hero: 'terrace-solar',
      gallery: ['terrace-lakeview', 'interior-lounge', 'interior-kitchen', 'interior-bed', 'terrace-evening'],
      amenities: ['Панорамне скління', 'Тераса біля води', 'Кухня з посудом', 'Душ та санвузол',
                  'Кондиціонер', 'Мангал', 'Wi-Fi', 'Постільна білизна та рушники']
    }
  ];

  const housePricing = {
    weekday: { id: 'weekday', label: 'Будні', note: 'Понеділок — Четвер', price: 4000, unit: 'за добу' },
    weekend: { id: 'weekend', label: 'Вихідні', note: 'П’ятниця — Неділя', price: 6000, unit: 'за добу' },
    special: { id: 'special', label: 'Вікенд зі знижкою', note: '2 доби у вихідні',
               price: 5000, unit: 'за добу', save: 'економія 2 000 грн' },
    holiday: { id: 'holiday', label: 'Свята', note: 'Святкові та довгі вихідні', price: null, unit: 'за добу' },
    included: [
      'Повне користування будинком та прилеглою територією',
      'Облаштована зона відпочинку — мангал, тераса',
      'Чиста постільна білизна, рушники та базові засоби гігієни',
      'Посуд та кухонне приладдя'
    ],
    rules: [
      'Час заїзду — з 14:00',
      'Час виїзду — до 12:00',
      'Для фіксації дати обов’язкова передоплата'
    ]
  };

  /* ---------- БАСЕЙН -------------------------------------- */
  const pool = {
    hero: 'pool-deck',
    lead: 'Відкритий басейн над озером. Шезлонг, парасолька та роздягальня вже у вартості квитка.',
    hours: 'Щодня 10:00 — 22:00',
    eveningHours: '18:00 — 22:00',
    tariffs: [
      { id: 'day-weekday', label: 'Денний тариф', note: 'Понеділок — Четвер', price: 800, meta: 'квиток на весь день', who: 'дорослі' },
      { id: 'day-weekend', label: 'Денний тариф', note: 'П’ятниця — Неділя', price: 900, meta: 'квиток на весь день', who: 'дорослі' },
      { id: 'evening', label: 'Вечірні години', note: 'Щодня, 18:00 — 22:00', price: 700, meta: 'єдина ціна для всіх днів', who: 'дорослі' }
    ],
    children: [
      { label: 'Діти до 5 років', price: 0, note: 'безкоштовно' },
      { label: 'Діти від 5 років', price: null, note: 'за дорослим тарифом — уточнюйте' }
    ],
    included: ['Шезлонг', 'Парасолька', 'Роздягальня'],
    extras: [
      { label: 'Рушник', price: 100 },
      { label: 'Халат', price: 200 }
    ],
    rules: [
      'Діти до 5 років відвідують басейн безкоштовно',
      'У вартість квитка входить користування шезлонгом, парасолькою та роздягальнею',
      'Додатково можна орендувати рушник — 100 грн, халат — 200 грн',
      'Вечірні години діють щодня з 18:00 до 22:00',
      'Шезлонги можна забронювати заздалегідь за телефоном або через форму на сайті',
      'Діти до 14 років — під наглядом дорослих'
    ],
    gallery: ['pool-cabanas', 'pool-still', 'cabana-white', 'loungers-black', 'rattan-chair', 'pool-lake']
  };

  /* ---------- НАПРЯМКИ ------------------------------------ */
  const experiences = [
    { id: 'houses',    label: 'Будиночки',   image: 'lake-aframe',   href: 'houses.html',       note: 'A-frame на воді' },
    { id: 'pool',      label: 'Басейн',      image: 'pool-forest',   href: 'pool.html',         note: 'Відкрита вода й шезлонги' },
    { id: 'sunbeds',   label: 'Шезлонги',    image: 'cabana-white',  href: 'pool.html#sunbeds', note: 'Шатра з білими шторами' },
    { id: 'kitchen',   label: 'Кухня і бар', image: 'mood-bar',      href: '#kitchen',          note: 'Ресторан і авторські напої' },
    { id: 'territory', label: 'Територія',   image: 'mood-forest',   href: 'gallery.html',      note: 'Озеро, верби, тиша' }
  ];

  /* ---------- ОДИН ДЕНЬ ----------------------------------- */
  const chapters = [
    { n: '01', title: 'Ранок', icon: 'wind', time: '08:00',
      tag: 'Тиша й туман',
      text: 'Двері тераси — просто у воду. Кава на понтоні, туман ще не зійшов, на тому березі нікого.' },
    { n: '02', title: 'День', icon: 'wave', time: '12:00',
      tag: 'Вода й нічого зайвого',
      text: 'Басейн над озером, шезлонг у тіні, штори шатра ловлять вітер. Усе за двадцять кроків.' },
    { n: '03', title: 'Вечір', icon: 'fire', time: '19:00',
      tag: 'Мангал і бар до 22:00',
      text: 'Кухня SAPSAN і авторський бар працюють до вечора. Коктейль забирають на шезлонг або на терасу.' },
    { n: '04', title: 'Ніч', icon: 'falcon', time: '22:00',
      tag: 'Сапсан завмирає над водою',
      text: 'Скло у відблисках, вода стихає, дім тримається над озером. Приїздять на добу — лишаються на вихідні.' }
  ];

  /* ---------- ГАЛЕРЕЯ ------------------------------------- */
  const gallery = [
    { image: 'pool-deck',        tag: 'Басейн' },
    { image: 'cabana-lake',      tag: 'Територія' },
    { image: 'drink-passion',    tag: 'Бар' },
    { image: 'terrace-lakeview', tag: 'Будиночки' },
    { image: 'pool-still',       tag: 'Басейн' },
    { image: 'rattan-chair',     tag: 'Відпочинок' },
    { image: 'bar-jigger',       tag: 'Бар' },
    { image: 'lake-aframe-wide', tag: 'Територія' },
    { image: 'cabana-white',     tag: 'Відпочинок' },
    { image: 'interior-lounge',  tag: 'Будиночки' },
    { image: 'pool-sky',         tag: 'Басейн' },
    { image: 'drink-grapefruit', tag: 'Бар' },
    { image: 'terrace-glass',    tag: 'Будиночки' },
    { image: 'loungers-black',   tag: 'Басейн' },
    { image: 'shade-lake',       tag: 'Територія' },
    { image: 'interior-kitchen', tag: 'Будиночки' },
    { image: 'cabana-pool',      tag: 'Відпочинок' },
    { image: 'bar-pour',         tag: 'Бар' },
    { image: 'terrace-solar',    tag: 'Територія' },
    { image: 'pool-lake',        tag: 'Басейн' },
    { image: 'drink-dark',       tag: 'Бар' },
    { image: 'terrace-evening',  tag: 'Будиночки' },
    { image: 'loungers-white',   tag: 'Басейн' },
    { image: 'interior-bath-2',  tag: 'Будиночки' },
    { image: 'brand-uniform',    tag: 'Відпочинок' },
    { image: 'pool-forest',      tag: 'Басейн' },
    { image: 'interior-bed',     tag: 'Будиночки' }
  ];

  const galleryTags = ['Усі', 'Будиночки', 'Басейн', 'Бар', 'Територія', 'Відпочинок'];

  /* ---------- КУХНЯ І БАР --------------------------------- */
  const kitchen = {
    title: 'Ресторан SAPSAN',
    lead: 'Смачна їжа, авторські напої та відпочинок біля води створюють ідеальний день і незабутні вечори.',
    hours: 'Щодня 10:00 — 22:00',
    note: 'Меню оновлюється рестораном онлайн — ціни та позиції завжди актуальні.',
    frames: [
      { image: 'drink-grapefruit', cap: 'Грейпфрут і розмарин' },
      { image: 'bar-pour',         cap: 'Бар біля басейну' },
      { image: 'drink-passion',    cap: 'Маракуйя' },
      { image: 'drink-dark',       cap: 'Вечірня карта' }
    ]
  };

  /* ---------- FAQ ----------------------------------------- */
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
      title: 'Басейн і шезлонги',
      items: [
        { q: 'Скільки коштує відвідування басейну?', a: 'Денний квиток: Понеділок — Четвер 800 грн, П’ятниця — Неділя 900 грн. Вечірні години з 18:00 до 22:00 — 700 грн у будь-який день.' },
        { q: 'Чи входить шезлонг у вартість квитка?', a: 'Так. У вартість входить користування шезлонгом, парасолькою та роздягальнею. Додатково можна орендувати рушник — 100 грн, халат — 200 грн.' },
        { q: 'Чи можна забронювати шезлонги заздалегідь?', a: 'Так, попереднє бронювання шезлонгів можливе за телефоном ' + settings.phone + ' або через форму на сайті.' }
      ]
    },
    {
      title: 'Гості, діти й тварини',
      items: [
        { q: 'Чи можна з дітьми?', a: 'Так. Діти до 5 років відвідують басейн безкоштовно. Будиночки розраховані на комфортне розміщення родини. Діти до 14 років мають перебувати на території басейну під наглядом дорослих.' },
        { q: 'Чи можна з тваринами?', a: 'Умови перебування з тваринами узгоджуються індивідуально. Будь ласка, повідомте про це заздалегідь під час бронювання за номером ' + settings.phone + '.' },
        { q: 'Чи є ресторан на території?', a: 'Так, на території працює ресторан SAPSAN та бар з авторськими напоями. Графік роботи — щодня з 10:00 до 22:00. Меню доступне онлайн.' }
      ]
    }
  ];

  const faq = faqGroups.reduce((acc, g) => acc.concat(g.items), []);

  const data = {
    settings, advantages, houses, housePricing, pool,
    experiences, chapters, gallery, galleryTags, kitchen, faqGroups, faq
  };

  /* ============================================================
     ІНТЕГРАЦІЯ З АДМІНКОЮ (Telegram-бот)
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
   * Базова перевірка: відповідь має бути непорожнім об'єктом.
   * Масиви замінюються цілком, об'єкти — зливаються по ключах.
   * Детальна валідація полів відсутня — дані з API використовуються як є.
   */
  function applyContent(remote) {
    if (!remote || typeof remote !== 'object' || Array.isArray(remote)) return data;

    const isPlainObject = v => v && typeof v === 'object' && !Array.isArray(v);

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

    /* Плаский FAQ перезбираємо після підміни груп */
    data.faq = (data.faqGroups || []).reduce((acc, g) => acc.concat(g.items || []), []);

    if (data.settings.lat && data.settings.lng) {
      data.settings.mapEmbed = 'https://www.google.com/maps?q=' +
        data.settings.lat + ',' + data.settings.lng + '&hl=uk&z=16&output=embed';
      data.settings.routeLink = 'https://www.google.com/maps/dir/?api=1&destination=' +
        data.settings.lat + ',' + data.settings.lng;
    }

    return data;
  }

  const ready = fetchContent().then(applyContent);

  /* ============================================================
     ХЕЛПЕРИ ЗОБРАЖЕНЬ
     ============================================================ */
  const IMG = () => global.SAPSAN_IMAGES || {};

  function variant(slug, kind) {
    const m = IMG()[slug];
    if (!m) return null;
    if (kind && m[kind]) {
      return { base: slug + '-' + kind, sizes: m[kind].sizes, w: m[kind].w, h: m[kind].h, ar: m[kind].ar };
    }
    return { base: slug, sizes: m.sizes, w: m.w, h: m.h, ar: m.ar };
  }

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const isRemoteUrl = s => typeof s === 'string' && /^https?:\/\//i.test(s);

  global.SAPSAN = {
    data,
    config: CFG,
    ready,

    onReady(fn) {
      const dom = document.readyState === 'loading'
        ? new Promise(res => document.addEventListener('DOMContentLoaded', res))
        : Promise.resolve();
      return Promise.all([dom, ready]).then(() => fn(data));
    },

    load() { return ready; },

    house(id) { return (data.houses || []).filter(h => h.id === id)[0] || null; },

    price(v) {
      if (v === null || v === undefined || v === '') return 'за запитом';
      if (v === 0) return 'безкоштовно';
      return Number(v).toLocaleString('uk-UA') + ' ' + settings.currency;
    },

    meta(slug) { return IMG()[slug] || null; },

    alt(slug) { const m = IMG()[slug]; return (m && m.alt) || 'SAP SAN'; },

    img(slug, kind) {
      if (isRemoteUrl(slug)) return slug;
      const v = variant(slug, kind);
      if (!v) return 'images/' + slug + '.webp';
      return 'images/' + v.base + '-' + v.sizes[v.sizes.length - 1] + '.webp';
    },

    srcset(slug, kind, ext) {
      if (isRemoteUrl(slug)) return '';
      const v = variant(slug, kind);
      if (!v) return '';
      const e = ext || 'webp';
      return v.sizes.map(w => 'images/' + v.base + '-' + w + '.' + e + ' ' + w + 'w').join(', ');
    },

    picture(slug, opts) {
      const o = opts || {};

      if (isRemoteUrl(slug)) {
        const alt = esc(o.alt || '');
        const img = '<img src="' + slug + '" alt="' + alt + '" ' +
          (o.imgClass ? 'class="' + o.imgClass + '" ' : '') +
          (o.priority ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"') + '>';
        return '<picture' + (o.className ? ' class="' + o.className + '"' : '') + '>' + img + '</picture>';
      }

      const m = IMG()[slug];
      const v = variant(slug, o.kind);
      if (!v) return '';

      const sizes = o.sizes || '100vw';
      const alt = esc(o.alt !== undefined ? o.alt : (m && m.alt) || '');
      const focus = (m && m.focus) || [0.5, 0.5];
      const style = 'style="--fx:' + (focus[0] * 100).toFixed(1) + '%;--fy:' + (focus[1] * 100).toFixed(1) + '%"';

      let sources = '';
      if (o.art && m && m[o.art.kind]) {
        const av = variant(slug, o.art.kind);
        sources +=
          '<source media="' + o.art.media + '" type="image/avif" srcset="' +
          this.srcset(slug, o.art.kind, 'avif') + '" sizes="' + sizes +
          '" width="' + av.w + '" height="' + av.h + '">' +
          '<source media="' + o.art.media + '" type="image/webp" srcset="' +
          this.srcset(slug, o.art.kind, 'webp') + '" sizes="' + sizes +
          '" width="' + av.w + '" height="' + av.h + '">';
      }

      sources +=
        '<source type="image/avif" srcset="' + this.srcset(slug, o.kind, 'avif') + '" sizes="' + sizes + '">' +
        '<source type="image/webp" srcset="' + this.srcset(slug, o.kind, 'webp') + '" sizes="' + sizes + '">';

      const img =
        '<img src="' + this.img(slug, o.kind) + '" alt="' + alt + '" ' +
        'width="' + v.w + '" height="' + v.h + '" ' + style + ' ' +
        (o.imgClass ? 'class="' + o.imgClass + '" ' : '') +
        (o.priority ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"') + '>';

      return '<picture' + (o.className ? ' class="' + o.className + '"' : '') + '>' + sources + img + '</picture>';
    }
  };

})(window);
