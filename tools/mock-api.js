/* ============================================================
   SAP SAN — ЕТАЛОННИЙ МОК API
   ------------------------------------------------------------
   Робоча реалізація контракту з API.md на чистому Node,
   без залежностей. Потрібна, щоб побачити, як сайт споживає
   дані, ще до того, як готовий справжній бекенд.

   Запуск:
     node tools/mock-api.js

   Потім у js/config.js:
     apiBase: 'http://127.0.0.1:8940/api'

   Відкрити houses.html — назви й ціни прийдуть звідси.
   Надіслати заявку з booking.html — прилетить у консоль.
   ============================================================ */
'use strict';

const http = require('http');
const PORT = process.env.PORT || 8940;

/* Те, що в реальному боті лежатиме в БД і редагуватиметься
   працівниками. Форма — строго за API.md. */
const content = {
  settings: {
    phone: '098 093 80 99',
    phoneHref: '+380980938099',
    email: 'temorin7@gmail.com',
    instagram: 'https://www.instagram.com/sapsan_resort_/',
    instagramLabel: '@sapsan_resort_',
    address: 'Бакали, Київська область',
    addressFull: 'P24M+7W Бакали, Київська область, Україна',
    lat: 49.705605,
    lng: 30.0347499,
    hours: 'Щодня 10:00 — 22:00',
    menuUrl: 'https://sapsan-resort.choiceqr.com/',
    checkIn: '14:00',
    checkOut: '12:00'
  },

  houses: [
    {
      id: 'aframe-water',
      index: '01',
      name: 'A-frame на воді',
      kicker: 'Просто над водою',
      lead: 'Будиночок стоїть на самій воді. Вранці озеро починається одразу за склом.',
      description: 'Двоповерховий A-frame із панорамним фронтоном. Спальня на другому рівні, вітальня та кухня внизу, тераса з мангалом виходить на воду.',
      guests: 4,
      beds: '1 двоспальне ліжко + розкладний диван',
      area: '',
      hero: 'houses-water-wide',
      gallery: ['house-terrace-lake', 'house-bedroom', 'house-living', 'house-bath', 'house-kitchen'],
      amenities: ['Панорамне скління', 'Тераса з мангалом', 'Кухня з посудом', 'Душ та санвузол', 'Кондиціонер', 'Wi-Fi']
    },
    {
      id: 'aframe-terrace',
      index: '02',
      name: 'A-frame з терасою',
      kicker: 'Тераса на озеро',
      lead: 'Велика відкрита тераса, власна зона мангалу і жодних сусідів у полі зору.',
      description: 'Просторий A-frame із найбільшою терасою серед будиночків.',
      guests: 4,
      beds: '1 двоспальне ліжко + розкладний диван',
      area: '',
      hero: 'house-aframe-terrace',
      gallery: ['house-terrace-table', 'house-kitchen', 'house-interior-lounge', 'house-bath-2', 'house-living'],
      amenities: ['Панорамне скління', 'Простора тераса', 'Повноцінна кухня', 'Душ та санвузол', 'Мангал', 'Wi-Fi']
    }
  ],

  housePricing: {
    weekday: { label: 'Будні дні', note: 'Понеділок — Четвер', price: 4000, unit: 'за добу' },
    weekend: { label: 'Вихідні дні', note: 'Пʼятниця — Неділя', price: 6000, unit: 'за добу' },
    special: { label: 'Вікенд зі знижкою', note: '2 доби у вихідні', price: 5000, unit: 'за добу', save: 'економія 2 000 грн' },
    /* null → сайт напише «за запитом». Не вигадуйте суму. */
    holiday: { label: 'Свята', note: 'Святкові та довгі вихідні', price: null, unit: 'за добу' },
    included: [
      'Повне користування будинком та прилеглою територією',
      'Облаштована зона для відпочинку — мангал, тераса',
      'Чиста постільна білизна, рушники та базові засоби гігієни',
      'Посуд та кухонне приладдя'
    ],
    rules: ['Час заїзду — з 14:00', 'Час виїзду — до 12:00', 'Для фіксації дати обовʼязкова передоплата']
  },

  pool: {
    hero: 'pool-cabanas',
    lead: 'Відкритий басейн над озером.',
    hours: 'Щодня 10:00 — 22:00',
    eveningHours: '18:00 — 22:00',
    tariffs: [
      { id: 'day-weekday', label: 'Денний тариф', note: 'Понеділок — Четвер', price: 800, meta: 'квиток на весь день' },
      { id: 'day-weekend', label: 'Денний тариф', note: 'Пʼятниця — Неділя', price: 900, meta: 'квиток на весь день' },
      { id: 'evening', label: 'Вечірні години', note: 'Щодня, 18:00 — 22:00', price: 700, meta: 'єдина ціна' }
    ],
    children: [
      { label: 'Діти до 5 років', price: 0, note: 'безкоштовно' },
      { label: 'Діти від 5 років', price: null, note: 'за дорослим тарифом — уточнюйте' }
    ],
    included: ['Шезлонг', 'Парасолька', 'Роздягальня'],
    extras: [{ label: 'Рушник', price: 100 }, { label: 'Халат', price: 200 }],
    rules: [
      'Діти до 5 років відвідують басейн безкоштовно',
      'У вартість квитка входить шезлонг, парасолька та роздягальня',
      'Діти до 14 років — під наглядом дорослих'
    ],
    gallery: ['pool-cabanas-wide', 'pool-loungers-lake', 'cabana-curtains', 'pool-lounger', 'pool-umbrellas', 'pool-wide-blue']
  }
};

/* Прийняті заявки. У реальному боті — БД + повідомлення в Telegram. */
const bookings = [];

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
};

const json = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = req.url.split('?')[0];

  if (url === '/api/content' && req.method === 'GET') {
    return json(res, 200, content);
  }

  if (url === '/api/bookings' && req.method === 'POST') {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 20000) req.destroy(); });
    req.on('end', () => {
      let b;
      try { b = JSON.parse(raw); } catch (_) { return json(res, 400, { error: 'bad json' }); }

      bookings.push(b);
      console.log('\n─────────── НОВА ЗАЯВКА #' + bookings.length + ' ───────────');
      console.log(b.summary || JSON.stringify(b, null, 1));
      console.log('─'.repeat(48));
      /* Тут у справжньому боті:
         await telegram.sendMessage(ADMIN_CHAT_ID, b.summary) */
      json(res, 200, { ok: true, id: bookings.length });
    });
    return;
  }

  if (url === '/api/bookings' && req.method === 'GET') {
    return json(res, 200, bookings);
  }

  json(res, 404, { error: 'not found' });
}).listen(PORT, () => {
  console.log('SAP SAN mock API → http://127.0.0.1:' + PORT + '/api');
  console.log('  GET  /api/content');
  console.log('  POST /api/bookings');
  console.log('\nУ js/config.js встановіть:');
  console.log("  apiBase: 'http://127.0.0.1:" + PORT + "/api'");
});
