# SAP SAN — контракт API між сайтом і Telegram-ботом

Сайт — статичний (HTML/CSS/vanilla JS, без збірки). Бот виступає адмінкою:
що змінили в Telegram — те зʼявляється на сайті.

Фронтенд **уже готовий** до інтеграції. Треба реалізувати два ендпоінти
і вписати адресу в `js/config.js`:

```js
window.SAPSAN_CONFIG = {
  apiBase: 'https://ваш-бекенд.vercel.app/api',
  cacheTtl: 60,
  timeoutMs: 4000
};
```

Порожній `apiBase` = демо-режим на вбудованому контенті з `js/data.js`.

---

## Як сайт поводиться

1. На кожній сторінці першим ділом іде `GET {apiBase}/content`.
2. Прийшли дані — сайт малює їх. Не прийшли, помилка або таймаут 4 с —
   малює вбудований контент і пише попередження в консоль.
   **Сайт ніколи не має падати через недоступний бекенд.**
3. Підміняються лише ті розділи, які реально прийшли. Можна віддавати
   тільки `houses` — решта лишиться вбудованою.
4. `settings` зливається по ключах, решта розділів замінюється цілком.

---

## GET /content

Повертає `200 application/json`. Потрібен CORS:
`Access-Control-Allow-Origin: *` (або домен сайту).

Усі поля необовʼязкові. Нижче — повна форма.

```jsonc
{
  "settings": {
    "brand": "SAP SAN",
    "descriptor": "Resort & Retreat",
    "tagline": "Місце, куди хочеться повертатися",

    "phone": "098 093 80 99",
    "phoneHref": "+380980938099",
    "email": "temorin7@gmail.com",
    "instagram": "https://www.instagram.com/sapsan_resort_/",
    "instagramLabel": "@sapsan_resort_",

    "address": "Бакали, Київська область",
    "addressFull": "P24M+7W Бакали, Київська область, Україна",
    "lat": 49.705605,
    "lng": 30.0347499,
    "mapLink": "https://maps.app.goo.gl/jLzCdgu8ZdnuLptz7",

    "hours": "Щодня 10:00 — 22:00",
    "menuUrl": "https://sapsan-resort.choiceqr.com/",
    "checkIn": "14:00",
    "checkOut": "12:00",
    "currency": "грн"
  },

  // Якщо змінити lat/lng — карта і кнопка «Прокласти маршрут»
  // перерахуються самі, нічого більше слати не треба.

  "advantages": [
    { "icon": "wave", "title": "Будиночки на воді", "text": "…" }
    // icon: wave | pool | fork | fire | tree | key
  ],

  "houses": [
    {
      "id": "aframe-water",          // латиницею, унікальний, іде в URL
      "index": "01",
      "name": "A-frame на воді",
      "kicker": "Просто над водою",   // короткий надзаголовок
      "lead": "Один-два речення для картки й слайдера.",
      "description": "Розгорнутий опис для сторінки будиночка.",
      "guests": 4,
      "beds": "1 двоспальне ліжко + розкладний диван",
      "area": "",
      "hero": "houses-water-wide",    // slug зображення, див. нижче
      "gallery": ["house-bedroom", "house-living"],
      "amenities": ["Панорамне скління", "Тераса з мангалом"]
    }
  ],

  "housePricing": {
    "weekday": { "label": "Будні дні",  "note": "Пн — Чт", "price": 4000, "unit": "за добу" },
    "weekend": { "label": "Вихідні дні","note": "Пт — Нд", "price": 6000, "unit": "за добу" },
    "special": { "label": "Вікенд зі знижкою", "note": "2 доби у вихідні",
                 "price": 5000, "unit": "за добу", "save": "економія 2 000 грн" },
    "holiday": { "label": "Свята", "note": "Святкові дні", "price": null, "unit": "за добу" },
    "included": ["Постільна білизна", "Посуд"],
    "rules": ["Час заїзду — з 14:00", "Час виїзду — до 12:00"]
  },

  "pool": {
    "hero": "pool-cabanas",
    "lead": "…",
    "hours": "Щодня 10:00 — 22:00",
    "eveningHours": "18:00 — 22:00",
    "tariffs": [
      { "id": "day-weekday", "label": "Денний тариф", "note": "Пн — Чт",
        "price": 800, "meta": "квиток на весь день" }
    ],
    "children": [
      { "label": "Діти до 5 років", "price": 0, "note": "безкоштовно" },
      { "label": "Діти від 5 років", "price": null, "note": "уточнюйте" }
    ],
    "included": ["Шезлонг", "Парасолька", "Роздягальня"],
    "extras": [ { "label": "Рушник", "price": 100 } ],
    "rules": ["Діти до 14 років — під наглядом дорослих"],
    "gallery": ["pool-cabanas-wide", "pool-lounger"]
  },

  "gallery": [
    { "image": "pool-cabanas-wide", "alt": "Опис для alt", "tag": "Басейн" }
  ],
  "galleryTags": ["Усі", "Будиночки", "Басейн", "Бар", "Територія", "Відпочинок"],

  "faqGroups": [
    { "title": "Бронювання та оплата",
      "items": [ { "q": "Питання?", "a": "Відповідь." } ] }
  ],

  "experiences": [
    { "id": "houses", "label": "Будиночки", "image": "house-aframe-terrace",
      "href": "houses.html", "note": "A-frame над водою" }
  ],
  "chapters": [
    { "n": "01", "title": "Будиночки", "image": "house-aframe-terrace", "text": "…" }
  ]
}
```

### Ціни

- число → `«4 000 грн»`
- `0` → `«безкоштовно»`
- `null` або відсутнє → `«за запитом»`

Тобто якщо тариф на свята ще не визначили — шліть `null`, і сайт
коректно напише «за запитом» замість вигаданої суми.

### Зображення

Поля `hero`, `image`, `gallery[]` приймають **slug**, а не URL.
Перелік доступних slug — у `js/images.js` (`window.SAPSAN_IMAGES`).
Сайт сам підставляє потрібну ширину (640 / 1000 / нативна) через `srcset`.

Приклади: `houses-water-wide`, `house-aframe-terrace`, `house-bedroom`,
`house-living`, `house-kitchen`, `house-bath`, `pool-cabanas`,
`pool-cabanas-wide`, `pool-lounger`, `cabana-lake`, `drink-passion`.

Якщо бот має вміти **завантажувати нові фото**, потрібен третій ендпоінт
(`POST /images`), який складе файл у `images/` у трьох ширинах і поповнить
`SAPSAN_IMAGES`. Це поза поточним обсягом фронтенду — узгодьте окремо.

---

## POST /bookings

Приймає заявку з сайту. Відповідь `200` з будь-яким JSON
(наприклад `{"ok": true, "id": 42}`). Будь-який не-2xx → сайт покаже
користувачу повідомлення з проханням зателефонувати.

**Заявка на будиночок:**

```json
{
  "type": "house",
  "source": "website",
  "createdAt": "2026-08-12T10:00:00.000Z",
  "checkin": "2026-09-10",
  "checkout": "2026-09-13",
  "house": "aframe-pano",
  "adults": "2",
  "children": "0",
  "name": "Олена",
  "phone": "+380 67 111 22 33",
  "comment": "…",
  "summary": "🏠 Заявка на будиночок\nЗаїзд: … · Виїзд: …\n…"
}
```

**Заявка на шезлонги:**

```json
{
  "type": "sunbeds",
  "source": "website",
  "createdAt": "…",
  "date": "2026-09-10",
  "sunbeds": "2",
  "adults": "2",
  "children": "1",
  "name": "…",
  "phone": "…",
  "comment": "…",
  "summary": "🌤 Заявка на шезлонги\nДата: …\nШезлонгів: 2\n…"
}
```

`house` може бути порожнім рядком — це «будь-який вільний».

### Поле `summary`

Уже зібраний текст заявки українською. Його можна **переслати в Telegram
як є** — там тип заявки, дати, будиночок або кількість шезлонгів, гості,
імʼя, телефон і коментар.

### Захист від спаму

На фронтенді вже стоїть honeypot (поле `company`), мінімальний час
заповнення 3 с і обмеження 30 с між заявками з одного браузера.
Поле `company` до API **не доходить** — воно вирізається.

Серверна частина має додати свій **rate-limit за IP** — фронтендові
перевірки обходяться тривіально.

---

## Мінімальний приклад (Vercel, Node)

```js
// api/content.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(await db.getContent());        // та сама форма, що вище
}

// api/bookings.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  const b = req.body;
  await db.saveBooking(b);
  await telegram.sendMessage(ADMIN_CHAT_ID, b.summary);
  res.json({ ok: true });
}
```

---

## Як перевірити інтеграцію

1. Підняти бекенд, вписати `apiBase` у `js/config.js`.
2. Відкрити `houses.html` — назви й ціни мають прийти з бази.
3. Змінити ціну в боті, перезавантажити сторінку — має оновитись.
4. Надіслати заявку з `booking.html` — має прилетіти в Telegram.
5. Вимкнути бекенд і перезавантажити сайт — сторінки мають лишитись
   робочими на вбудованому контенті.

Пункт 5 обовʼязковий: сайт не має залежати від доступності бота.
