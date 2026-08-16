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
    /* Формулювання замовника з фірмового банера */
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

  /* ---------- ЩО ТУТ Є ------------------------------------
     icon — ключ у наборі SAPSAN.icons (js/brand.js).      */
  const advantages = [
    { icon: 'aframe', title: 'Будинок стоїть на воді',
      text: 'A-frame на понтоні посеред озера. Вранці вода починається одразу за склом — без сусідів у полі зору.' },
    { icon: 'pool',   title: 'Відкритий басейн над озером',
      text: 'Шезлонг, парасолька та роздягальня вже у вартості квитка. Вечірні години — до 22:00.' },
    { icon: 'glass',  title: 'Ресторан і авторський бар',
      text: 'Кухня SAPSAN працює просто на території. Бармен зробить щось окреме за кілька кроків від шезлонга.' },
    { icon: 'fire',   title: 'Своя тераса з мангалом',
      text: 'Власна зона біля кожного будиночка. Вечеря на свіжому повітрі — без черги й без бронювання столика.' },
    { icon: 'pine',   title: 'Ліс, вода і тиша',
      text: 'Береги озера в вербах і соснах. Найгучніше тут — вітер і плюскіт біля понтона.' },
    { icon: 'sun',    title: 'Автономність',
      text: 'Сонячні панелі на даху, кондиціонер, Wi-Fi, повна кухня з посудом. Усе всередині — привозити нічого.' }
  ];

  /* ---------- БУДИНОЧКИ ----------------------------------
     TODO(адмін): назви робочі; площі не вказані в офіційних
     матеріалах. Тариф однаковий на всі будиночки.        */
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
      /* terrace-evening на цьому місці читався як повтор
         terrace-glass (обидва — тераса зі столом і кріслами
         біля води). terrace-solar тут же в галереї, але кадр
         зовсім інший — солярні панелі й мангал крупним планом. */
      hero: 'terrace-solar',
      gallery: ['terrace-lakeview', 'interior-lounge', 'interior-kitchen', 'interior-bed', 'terrace-evening'],
      amenities: ['Панорамне скління', 'Тераса біля води', 'Кухня з посудом', 'Душ та санвузол',
                  'Кондиціонер', 'Мангал', 'Wi-Fi', 'Постільна білизна та рушники']
    }
  ];

  /* Тарифи — з офіційного прайс-листа на оренду будиночка */
  const housePricing = {
    weekday: { id: 'weekday', label: 'Будні',  note: 'Понеділок — Четвер', price: 4000, unit: 'за добу' },
    weekend: { id: 'weekend', label: 'Вихідні', note: 'П’ятниця — Неділя', price: 6000, unit: 'за добу' },
    special: { id: 'special', label: 'Вікенд зі знижкою', note: '2 доби у вихідні',
               price: 5000, unit: 'за добу', save: 'економія 2 000 грн' },
    /* TODO(адмін): святкових тарифів в офіційному прайсі немає.
       Поки price === null — сайт пише «за запитом». */
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

  /* ---------- БАСЕЙН — з офіційного прайс-листа ----------- */
  const pool = {
    hero: 'pool-deck',
    lead: 'Відкритий басейн над озером. Шезлонг, парасолька та роздягальня вже у вартості квитка.',
    hours: 'Щодня 10:00 — 22:00',
    eveningHours: '18:00 — 22:00',

    tariffs: [
      { id: 'day-weekday', label: 'Денний тариф',  note: 'Понеділок — Четвер',   price: 800, meta: 'квиток на весь день', who: 'дорослі' },
      { id: 'day-weekend', label: 'Денний тариф',  note: 'П’ятниця — Неділя',    price: 900, meta: 'квиток на весь день', who: 'дорослі' },
      { id: 'evening',     label: 'Вечірні години', note: 'Щодня, 18:00 — 22:00', price: 700, meta: 'єдина ціна для всіх днів', who: 'дорослі' }
    ],
    /* Дитячий тариф окремо не вказано — відома лише
       безкоштовна категорія. TODO(адмін). */
    children: [
      { label: 'Діти до 5 років',  price: 0,    note: 'безкоштовно' },
      { label: 'Діти від 5 років', price: null, note: 'за дорослим тарифом — уточнюйте' }
    ],

    included: ['Шезлонг', 'Парасолька', 'Роздягальня'],
    extras: [
      { label: 'Рушник', price: 100 },
      { label: 'Халат',  price: 200 }
    ],

    /* Тільки підтверджене офіційними матеріалами. TODO(адмін). */
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

  /* ---------- НАПРЯМКИ ----------------------------------- */
  /* Будиночки/басейн/шезлонги — реальні фото бази: це і є товар,
     який купує гість, підміняти стоком не можна. Кухня й
     територія — радше настрій, тому там кадр із Pexels (той самий
     дух, спокійний бар і туман над сосновим озером), а справжні
     фото кухні й території лишаються в галереї та розділі «Кухня». */
  const experiences = [
    { id: 'houses',    label: 'Будиночки',  image: 'lake-aframe',       href: 'houses.html',  note: 'A-frame на воді' },
    { id: 'pool',      label: 'Басейн',     image: 'pool-forest',       href: 'pool.html',    note: 'Відкрита вода й шезлонги' },
    { id: 'sunbeds',   label: 'Шезлонги',   image: 'cabana-white',      href: 'pool.html#sunbeds', note: 'Шатра з білими шторами' },
    { id: 'kitchen',   label: 'Кухня і бар', image: 'mood-bar',         href: '#kitchen',     note: 'Ресторан і авторські напої' },
    { id: 'territory', label: 'Територія',  image: 'mood-forest',       href: 'gallery.html', note: 'Озеро, верби, тиша' }
  ];

  /* ---------- ОДИН ДЕНЬ ------------------------------------
     Без фотографій: чотири кадри дня тримає фірмова іконка,
     що змінюється разом із текстом (SAPSAN.icons, js/brand.js).
     Слоган-рядок коротший за звичайний опис — тут не документація,
     а настрій. icon має відповідати ключу з PATHS у js/brand.js. */
  const chapters = [
    { n: '01', title: 'Ранок',  icon: 'wind', time: '08:00',
      tag: 'Тиша й туман',
      text: 'Двері тераси — просто у воду. Кава на понтоні, туман ще не зійшов, на тому березі нікого.' },
    { n: '02', title: 'День',   icon: 'wave', time: '12:00',
      tag: 'Вода й нічого зайвого',
      text: 'Басейн над озером, шезлонг у тіні, штори шатра ловлять вітер. Усе за двадцять кроків.' },
    { n: '03', title: 'Вечір',  icon: 'fire', time: '19:00',
      tag: 'Мангал і бар до 22:00',
      text: 'Кухня SAPSAN і авторський бар працюють до вечора. Коктейль забирають на шезлонг або на терасу.' },
    { n: '04', title: 'Ніч',    icon: 'falcon', time: '22:00',
      tag: 'Сапсан завмирає над водою',
      text: 'Скло у відблисках, вода стихає, дім тримається над озером. Приїздять на добу — лишаються на вихідні.' }
  ];

  /* ---------- ГАЛЕРЕЯ ------------------------------------ */
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

  /* ---------- КУХНЯ І БАР --------------------------------
     Свідомо без переліку страв: актуальне меню живе на
     choiceqr і оновлюється рестораном. Вигадувати позиції
     на сайті — гірше, ніж чесно відправити в меню.       */
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

  /* ---------- ПРАВИЛА ТА FAQ -----------------------------
     Відповіді спираються лише на офіційні матеріали.
     Там, де політики немає — чесне «уточнюйте».         */
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
     ------------------------------------------------------------
     Якщо в js/config.js заданий apiBase — сайт тягне контент із
     GET {apiBase}/content і підміняє ним вбудований. Якщо API
     недоступне або відповідає повільно, лишається вбудований
     контент: сайт не має падати через бекенд.
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

  /* ============================================================
     ЧИТАННЯ З UPSTASH REDIS (REST API)
     ------------------------------------------------------------
     Реальна структура Redis:
       properties:list  — sorted set, членами якого є ID будинків
       property:{id}    — hash: id, name, description, maxGuests,
                          priceWeekday/Weekend/Holiday, checkIn/Out,
                          photos, amenities, isActive

     Швидше й надійніше за /api/content, коли сам бот повільний
     чи недоступний, а Redis — ні. Результат іде через ту саму
     sanitize()/applyContent(), що й API-відповідь: несправна
     чи тестова ціна відкидається так само, звідки б вона не
     прийшла. */
  function fetchFromRedis() {
    if (!CFG.redisUrl || !CFG.redisToken) return Promise.resolve(null);

    const base = CFG.redisUrl.replace(/\/$/, '');
    const auth = { Authorization: 'Bearer ' + CFG.redisToken };
    const timeout = CFG.timeoutMs || 4000;

    function rget(path) {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = setTimeout(() => ctrl && ctrl.abort(), timeout);
      return fetch(base + path, { headers: auth, signal: ctrl ? ctrl.signal : undefined })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .finally(() => clearTimeout(timer));
    }

    function flatToObj(arr) {
      const obj = {};
      if (!Array.isArray(arr)) return obj;
      for (let i = 0; i < arr.length; i += 2) obj[arr[i]] = arr[i + 1];
      return obj;
    }

    function hashToHouse(h, idx) {
      let amenities = [];
      try { amenities = h.amenities ? JSON.parse(h.amenities) : []; }
      catch (e) { amenities = h.amenities ? h.amenities.split(',').map(s => s.trim()).filter(Boolean) : []; }
      let gallery = [];
      try { gallery = h.gallery ? JSON.parse(h.gallery) : []; } catch (e) { gallery = []; }

      const num = String(idx + 1).padStart(2, '0');
      return {
        id: 'house-' + h.id,
        index: num,
        name: h.name || ('Будиночок ' + num),
        kicker: h.kicker || '',
        lead: h.lead || h.description || '',
        description: h.description || '',
        guests: parseInt(h.maxGuests, 10) || 4,
        beds: h.beds || '',
        area: h.area || '',
        hero: h.hero || '',
        gallery,
        amenities,
        priceWeekday: parseInt(h.priceWeekday, 10) || null,
        priceWeekend: parseInt(h.priceWeekend, 10) || null,
        priceHoliday: parseInt(h.priceHoliday, 10) || null,
        checkIn: h.checkIn || null,
        checkOut: h.checkOut || null,
        isActive: h.isActive === 'true' || h.isActive === true
      };
    }

    return rget('/zrange/properties:list/0/-1')
      .then(res => {
        const ids = res && Array.isArray(res.result) ? res.result : [];
        if (!ids.length) return null;
        return Promise.all(ids.map(id =>
          rget('/hgetall/property:' + id)
            .then(r => (r && r.result ? flatToObj(r.result) : null))
            .catch(() => null)
        ));
      })
      .then(hashes => {
        if (!hashes) return null;
        const houses = hashes
          .filter(h => h && h.id)
          .filter(h => h.isActive !== 'false')
          .map(hashToHouse);
        if (!houses.length) return null;

        const first = houses[0];
        let housePricing;
        if (first.priceWeekday) {
          housePricing = {
            weekday: { id: 'weekday', label: 'Будні', note: 'Пн — Чт', price: first.priceWeekday, unit: 'за добу' },
            weekend: { id: 'weekend', label: 'Вихідні', note: 'Пт — Нд', price: first.priceWeekend, unit: 'за добу' },
            holiday: { id: 'holiday', label: 'Свята', note: 'Святкові дні', price: first.priceHoliday, unit: 'за добу' }
          };
        }
        return housePricing ? { houses, housePricing } : { houses };
      })
      .catch(err => {
        console.warn('[SAP SAN] Redis недоступний, пробуємо API бота:', err.message);
        return null;
      });
  }

  /* ------------------------------------------------------------
     ПЕРЕВІРКА ВІДПОВІДІ API
     ------------------------------------------------------------
     Адмінка — це Telegram-бот, куди контент вводять руками, і
     туди регулярно потрапляють тестові значення (перевірено на
     проді: телефон «1312312», адреса «LDLSLFLSLFSLF», ціна
     квитка 21 121 323 115 154 грн, порожній слаг фото).

     Сайт не має права показувати таке гостю. Тому кожне поле з
     API проходить структурну перевірку, і все, що не проходить,
     тихо відкидається — на його місці лишається вбудоване
     значення. Це не «недовіра до бекенду», а єдиний спосіб
     гарантувати, що сторінка бронювання завжди показує робочий
     телефон, а слайдер — наявне фото.

     Змістовну коректність тексту тут не перевірити; ловимо те,
     що має однозначну форму: телефон, пошту, посилання,
     координати, ціну, час і наявність слага в маніфесті фото.
     ------------------------------------------------------------ */
  const V = {
    text(v, min) {
      return typeof v === 'string' && v.trim().length >= (min || 2) ? v.trim() : null;
    },
    /* Адреса/опис: має бути схожою на фразу, а не на набір літер */
    phrase(v, min) {
      const s = V.text(v, min || 5);
      return s && /[\s,.]/.test(s) ? s : null;
    },
    /**
     * Підпис у прайсі чи картці — має містити хоча б дві літери.
     * Перевірено на проді: в адмінку потрапляють підписи на кшталт
     * «2000» і «22». Структурно це валідний рядок, але в колонці
     * «Рушник — 100 грн» такий підпис читається як окрема послуга
     * з назвою-числом. Літери — найдешевша ознака справжньої назви.
     */
    label(v) {
      const s = V.text(v, 2);
      return s && (s.match(/\p{L}/gu) || []).length >= 2 ? s : null;
    },
    phone(v) {
      const s = typeof v === 'string' ? v.trim() : '';
      return /^\+?\d[\d\s()\-]{8,19}$/.test(s) && (s.match(/\d/g) || []).length >= 9 ? s : null;
    },
    email(v) {
      const s = typeof v === 'string' ? v.trim() : '';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : null;
    },
    url(v) {
      const s = typeof v === 'string' ? v.trim() : '';
      if (!/^https?:\/\//i.test(s)) return null;
      try { return new URL(s).href; } catch (_) { return null; }
    },
    /* Ціна: ціле число в межах здорового глузду для гривні */
    price(v) {
      if (v === null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n <= 100000 ? n : undefined;
    },
    time(v) {
      const s = typeof v === 'string' ? v.trim() : '';
      return /\d{1,2}[:.]\d{2}/.test(s) ? s : null;
    },
    coord(v, max) {
      const n = Number(v);
      return Number.isFinite(n) && Math.abs(n) <= max ? n : null;
    },
    /* Фото — або слаг із зібраного маніфесту (готовий AVIF/WebP,
       точка фокуса), або пряме посилання на фото, яке адмін
       щойно завантажив через бота (api.telegram.org/file/…,
       без обробки — просто <img>). Будь-що інше — порожній
       рядок, недописаний слаг тощо — відкидаємо: інакше на
       сторінці з'явиться порожній прямокутник. */
    slug(v) {
      if (typeof v !== 'string' || !v) return null;
      if ((global.SAPSAN_IMAGES || {})[v]) return v;
      return /^https?:\/\/\S+$/i.test(v) ? v : null;
    }
  };

  function cleanSettings(s) {
    if (!s || typeof s !== 'object') return {};
    const out = {};
    const put = (k, v) => { if (v !== null && v !== undefined) out[k] = v; };
    put('brand', V.text(s.brand));
    put('descriptor', V.text(s.descriptor));
    put('tagline', V.phrase(s.tagline, 8));
    put('phone', V.phone(s.phone));
    put('phoneHref', V.phone(s.phoneHref));
    put('email', V.email(s.email));
    put('instagram', V.url(s.instagram));
    put('instagramLabel', V.text(s.instagramLabel));
    put('address', V.phrase(s.address));
    put('addressFull', V.phrase(s.addressFull));
    put('lat', V.coord(s.lat, 90));
    put('lng', V.coord(s.lng, 180));
    put('mapLink', V.url(s.mapLink));
    put('menuUrl', V.url(s.menuUrl));
    put('hours', V.time(s.hours));
    put('checkIn', V.time(s.checkIn));
    put('checkOut', V.time(s.checkOut));
    /* Телефон для tel: має бути саме набірним */
    if (out.phoneHref) out.phoneHref = out.phoneHref.replace(/[^\d+]/g, '');
    return out;
  }

  /**
   * Списки приймаємо за принципом «усе або нічого».
   *
   * Причина: частковий список гірший за неоновлений. Якщо з
   * трьох тарифів басейну два містять сміття, а один — ні,
   * фільтрація «по одному» покаже гостю прайс із єдиним рядком,
   * і це виглядатиме як справжня ціна. Краще лишити повний
   * вбудований прайс і написати про проблему в консоль.
   */
  function allOrNothing(list, valid) {
    if (!Array.isArray(list) || !list.length) return null;
    return list.every(valid) ? list : null;
  }

  function cleanHouses(list) {
    const ok = allOrNothing(list, h =>
      h && V.text(h.id) && V.label(h.name) && V.phrase(h.lead, 12) && V.slug(h.hero));
    return ok && ok.map(h => Object.assign({}, h, {
      /* Усередині запису неіснуючий слаг просто прибираємо:
         втрата одного кадру галереї не спотворює зміст. */
      gallery: (Array.isArray(h.gallery) ? h.gallery : []).filter(V.slug),
      amenities: (Array.isArray(h.amenities) ? h.amenities : []).filter(a => V.text(a, 3))
    }));
  }

  function cleanTariffs(list) {
    return allOrNothing(list, t => t && V.label(t.label) && V.price(t.price) !== undefined);
  }

  function cleanImageList(list, key) {
    return allOrNothing(list, x => x && V.slug(x[key || 'image']));
  }

  /** Скільки полів відкинули — видно в консолі, щоб адмін бачив проблему */
  function report(dropped) {
    if (!dropped.length) return;
    console.warn('[SAP SAN] дані з адмінки не пройшли перевірку і замінені ' +
      'вбудованими: ' + dropped.join(', ') + '. Перевірте вміст адмінпанелі.');
  }

  function sanitize(remote) {
    if (!remote || typeof remote !== 'object') return null;
    const out = {};
    const dropped = [];

    if (remote.settings) {
      const s = cleanSettings(remote.settings);
      const lost = Object.keys(remote.settings).filter(k => !(k in s));
      if (lost.length) dropped.push('settings.' + lost.join('/'));
      if (Object.keys(s).length) out.settings = s;
    }

    const houses = cleanHouses(remote.houses);
    if (remote.houses && !houses) dropped.push('houses');
    if (houses) out.houses = houses;

    /* Прайс на будиночки — теж усе або нічого: показати нову
       ціну буднів і стару ціну вихідних означає ввести гостя
       в оману рівно там, де він приймає рішення. */
    if (remote.housePricing && typeof remote.housePricing === 'object') {
      const keys = ['weekday', 'weekend', 'special', 'holiday'].filter(k => remote.housePricing[k]);
      const good = keys.every(k => V.price(remote.housePricing[k].price) !== undefined);
      if (keys.length && good) {
        const hp = {};
        keys.forEach(k => {
          const t = remote.housePricing[k];
          hp[k] = Object.assign({}, t, { price: V.price(t.price) });
        });
        out.housePricing = hp;
      } else if (keys.length) {
        dropped.push('housePricing');
      }
    }

    if (remote.pool && typeof remote.pool === 'object') {
      const p = {};
      const tr = cleanTariffs(remote.pool.tariffs);
      if (remote.pool.tariffs && !tr) dropped.push('pool.tariffs');
      if (tr) p.tariffs = tr;
      const ex = allOrNothing(remote.pool.extras,
        e => e && V.label(e.label) && V.price(e.price) !== undefined);
      if (remote.pool.extras && !ex) dropped.push('pool.extras');
      if (ex) p.extras = ex;

      const r = allOrNothing(remote.pool.rules, x => V.phrase(x, 10));
      if (remote.pool.rules && !r) dropped.push('pool.rules');
      if (r) p.rules = r;

      const pg = allOrNothing(remote.pool.gallery, V.slug);
      if (remote.pool.gallery && !pg) dropped.push('pool.gallery');
      if (pg) p.gallery = pg;
      if (V.slug(remote.pool.hero)) p.hero = remote.pool.hero;
      if (Object.keys(p).length) out.pool = p;
    }

    ['gallery', 'chapters', 'experiences'].forEach(k => {
      const v = cleanImageList(remote[k]);
      if (remote[k] && !v) dropped.push(k);
      if (v) out[k] = v;
    });

    if (Array.isArray(remote.faqGroups)) {
      const g = remote.faqGroups.filter(x => x && V.label(x.title) && Array.isArray(x.items) &&
        x.items.some(i => i && V.phrase(i.q, 6) && V.phrase(i.a, 12)));
      if (g.length) out.faqGroups = g;
      else dropped.push('faqGroups');
    }

    report(dropped);
    return Object.keys(out).length ? out : null;
  }

  /**
   * Зливаємо перевірену відповідь API з вбудованим контентом.
   * Масиви замінюються цілком, об'єкти — зливаються по ключах,
   * тому неповна відповідь не має нічого стирати.
   */
  function applyContent(raw) {
    const remote = sanitize(raw);
    if (!remote) return data;
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

    /* Плаский FAQ — похідний від груп, тож перезбираємо його
       після підміни, інакше структуровані дані розійдуться
       з тим, що видно на сторінці. */
    data.faq = (data.faqGroups || []).reduce((acc, g) => acc.concat(g.items || []), []);

    if (data.settings.lat && data.settings.lng) {
      data.settings.mapEmbed = 'https://www.google.com/maps?q=' +
        data.settings.lat + ',' + data.settings.lng + '&hl=uk&z=16&output=embed';
      data.settings.routeLink = 'https://www.google.com/maps/dir/?api=1&destination=' +
        data.settings.lat + ',' + data.settings.lng;
    }
    return data;
  }

  /* Пріоритет: Redis (швидко, напряму) → API бота → вбудований
     контент. Redis дає лише houses/housePricing — settings/pool/
     галерею й далі бере з /content, якщо Redis їх не повернув. */
  const ready = fetchFromRedis()
    .then(redisData => {
      if (!redisData) return fetchContent();
      return fetchContent().then(apiData =>
        Object.assign({}, apiData || {}, redisData));
    })
    .then(applyContent);

  /* ============================================================
     ХЕЛПЕРИ ЗОБРАЖЕНЬ
     ------------------------------------------------------------
     Розмітка ніде не пише шляхів до файлів руками. Усе йде
     через ці функції, тому додати формат чи ширину = змінити
     один файл, а не сорок місць у HTML.
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

  /* Фото з адмінки (бот) приходять не слагом із власного каталогу,
     а прямим посиланням на api.telegram.org — таких нема в
     new-images/ і build-images.js їх ніколи не бачив. Для них
     picture()/img() віддають просте <img src="URL">: без AVIF/WebP-
     сходинки й точки фокуса (адмінка не знає про них), зате фото
     реально з'являється на сайті, а не тихо зникає. */
  const isRemoteUrl = s => typeof s === 'string' && /^https?:\/\//i.test(s);

  global.SAPSAN = {
    data,
    config: CFG,
    ready,

    /** Проміс, який чекає і на DOM, і на контент */
    onReady(fn) {
      const dom = document.readyState === 'loading'
        ? new Promise(res => document.addEventListener('DOMContentLoaded', res))
        : Promise.resolve();
      return Promise.all([dom, ready]).then(() => fn(data));
    },
    load() { return ready; },

    house(id) { return (data.houses || []).filter(h => h.id === id)[0] || null; },

    /** «4 000 грн», «безкоштовно» або «за запитом» */
    price(v) {
      if (v === null || v === undefined || v === '') return 'за запитом';
      if (v === 0) return 'безкоштовно';
      return Number(v).toLocaleString('uk-UA') + ' ' + settings.currency;
    },

    meta(slug) { return IMG()[slug] || null; },
    alt(slug) { const m = IMG()[slug]; return (m && m.alt) || 'SAP SAN'; },

    /** Найбільший доступний файл — для src та лайтбокса */
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

    /**
     * <picture> з AVIF + WebP, розмірами проти CLS і точкою фокуса.
     * opts: { sizes, alt, className, imgClass, kind, priority, art }
     *
     * art — арт-дирекшн: { media, kind } підмінює кадр на
     * вужчому екрані вертикальним обрізанням із власним фокусом,
     * замість того щоб різати горизонтальний кадр по центру.
     */
    picture(slug, opts) {
      const o = opts || {};

      /* Фото з адмінки (пряме посилання на Telegram) — без
         локального маніфесту нема ні AVIF/WebP-сходинки, ні
         width/height, ні focus. Проста <picture> з одним <img>,
         щоб гість узагалі побачив те, що завантажив адмін. */
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
