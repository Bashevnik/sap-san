/* ============================================================
   SAP SAN — ГЕНЕРАТОР ФІРМОВОЇ ГРАФІКИ
   ------------------------------------------------------------
   Пише assets/brand/*.svg.

   Чому генератор, а не намальовані вручну файли:
   декоративні елементи бази — це верба, очерет, сосна й вода.
   Намальовані «від руки» в редакторі коду вони завжди виходять
   як clipart із п'яти кривих. Тут кожна гілка будується з
   реальної ботанічної логіки (стебло → бічні пагони → листя з
   власним нахилом і розміром), тому виглядає як ілюстрація,
   а не як іконка. Генератор детермінований (свій PRNG із
   зерном), тож повторний запуск дає ті самі файли.

   Крило сокола НЕ генерується: воно обведене з реального
   логотипа SAP SAN (див. FALCON нижче) і є єдиним джерелом
   пластики для всієї решти графіки.

   node tools/brand-svg.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'brand');
fs.mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------
   1. СОКІЛ — обведений з реального знака SAP SAN
   ------------------------------------------------------------
   Контур знято з фірмового банера
   (new-images/SAP_SAN_Website_Photos_Batch_2_3200x1800/03_brand_banner.png):
   ділянку зі знаком вирізано в оригінальній роздільності,
   бінаризовано за Otsu, залишено дві найбільші зв'язні компоненти
   (ліве крило + права половина з корпусом) і обведено potrace.
   Тому пропорції, асиметрія крил, тонкі кінчики махових пер і
   форма голови — оригінальні, а не перемальовані «на око».
   Джерело шляху: tools/falcon-path.json (див. tools/trace-falcon.js).
   viewBox 0 0 1000 144.                                        */
const FALCON_SRC = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'falcon-path.json'), 'utf8'));
const FALCON = FALCON_SRC.d;
const FALCON_VB = FALCON_SRC.viewBox;

/* Одне крило — права половина того самого знака. Не окремий
   малюнок: та сама крива, показана через зсунутий viewBox, тому
   розчерк у декорі гарантовано збігається з логотипом. */
const WING_VB = '505 0 495 130';

/* ------------------------------------------------------------
   2. ДЕТЕРМІНОВАНИЙ PRNG (mulberry32)
   ------------------------------------------------------------ */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n1 = v => Math.round(v * 10) / 10;

/* ------------------------------------------------------------
   3. ГЕОМЕТРІЯ: кубічна крива, дотична, конічна обвідка
   ------------------------------------------------------------ */
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
          a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}
function bezT(p0, p1, p2, p3, t) {
  const u = 1 - t, a = 3 * u * u, b = 6 * u * t, c = 3 * t * t;
  const x = a * (p1[0] - p0[0]) + b * (p2[0] - p1[0]) + c * (p3[0] - p2[0]);
  const y = a * (p1[1] - p0[1]) + b * (p2[1] - p1[1]) + c * (p3[1] - p2[1]);
  const L = Math.hypot(x, y) || 1;
  return [x / L, y / L];
}

/**
 * Стебло змінної товщини як замкнений контур.
 * width(t) дає напівтовщину в частці довжини — так гілка
 * природно звужується до кінчика, а не має однакову вагу.
 */
function taperedStem(p0, p1, p2, p3, width, steps) {
  steps = steps || 44;
  const L = [], R = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = bez(p0, p1, p2, p3, t);
    const [tx, ty] = bezT(p0, p1, p2, p3, t);
    const w = width(t);
    L.push([n1(x - ty * w), n1(y + tx * w)]);
    R.push([n1(x + ty * w), n1(y - tx * w)]);
  }
  R.reverse();
  const pts = L.concat(R);
  return 'M' + pts.map(p => p[0] + ' ' + p[1]).join(' L') + 'Z';
}

/** Ланцетний листок: вістря на кінці, найширше в першій третині. */
function leaf(x, y, ang, len, wid, curl) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const P = (u, v) => [n1(x + u * c - v * s), n1(y + u * s + v * c)];
  const a = P(0, 0), b = P(len, curl * len);
  const c1 = P(len * 0.26, -wid), c2 = P(len * 0.74, -wid * 0.42 + curl * len * 0.5);
  const c3 = P(len * 0.72, wid * 0.5 + curl * len * 0.5), c4 = P(len * 0.24, wid * 0.86);
  return `M${a[0]} ${a[1]}C${c1[0]} ${c1[1]},${c2[0]} ${c2[1]},${b[0]} ${b[1]}` +
         `C${c3[0]} ${c3[1]},${c4[0]} ${c4[1]},${a[0]} ${a[1]}Z`;
}

/* ------------------------------------------------------------
   4. ВЕРБА — головний рослинний мотив берега
   ------------------------------------------------------------
   Верби стоять по всьому периметру озера SAP SAN (видно майже
   на кожному кадрі), тому саме верба, а не абстрактна «гілочка»,
   є природним декором. Пагони спадають — форма читається навіть
   на 6 % прозорості.                                            */
function willow(seed, opt) {
  const o = Object.assign({ w: 900, h: 620, shoots: 13, drop: 1 }, opt);
  const R = rng(seed);
  const d = [];

  /* Головна гілка — від лівого краю вгорі й далі вправо */
  const A = [0, 40], B = [o.w * 0.3, 8], C = [o.w * 0.62, 66], D = [o.w, 118];
  d.push(taperedStem(A, B, C, D, t => 7.5 * (1 - t * 0.82) + 0.6, 60));

  /* Пагони: чим далі від основи, тим коротші — крона «худне» */
  for (let i = 0; i < o.shoots; i++) {
    const t = 0.06 + (i / (o.shoots - 1)) * 0.92;
    const [sx, sy] = bez(A, B, C, D, t);
    const len = (o.h * 0.86) * (1 - t * 0.42) * (0.62 + R() * 0.5);
    const sway = (R() - 0.5) * 130;
    const s0 = [sx, sy];
    const s1 = [sx + sway * 0.32, sy + len * 0.34];
    const s2 = [sx + sway * 0.86 + (R() - 0.5) * 40, sy + len * 0.7];
    const s3 = [sx + sway + (R() - 0.5) * 46, sy + len * o.drop];
    d.push(taperedStem(s0, s1, s2, s3, u => 1.9 * (1 - u * 0.9) + 0.22, 34));

    /* Листя вздовж пагона */
    const nLeaf = 11 + Math.floor(R() * 9);
    for (let k = 0; k < nLeaf; k++) {
      const u = 0.1 + (k / nLeaf) * 0.9 + (R() - 0.5) * 0.03;
      const [lx, ly] = bez(s0, s1, s2, s3, u);
      const [tx, ty] = bezT(s0, s1, s2, s3, u);
      const base = Math.atan2(ty, tx);
      const side = k % 2 ? 1 : -1;
      const ang = base + side * (0.62 + R() * 0.5) - 0.12;
      const len2 = (30 + R() * 26) * (1 - u * 0.38);
      d.push(leaf(lx, ly, ang, len2, len2 * (0.16 + R() * 0.06), 0.1 + R() * 0.12));
    }
  }
  return { d, w: o.w, h: o.h };
}

/* ------------------------------------------------------------
   5. СОСНА — другий ярус лісу (видно на кадрах басейну)
   ------------------------------------------------------------ */
function pine(seed, opt) {
  const o = Object.assign({ w: 760, h: 420, sprigs: 9 }, opt);
  const R = rng(seed);
  const d = [];
  const A = [0, o.h * 0.72], B = [o.w * 0.34, o.h * 0.52], C = [o.w * 0.66, o.h * 0.4], D = [o.w, o.h * 0.2];
  d.push(taperedStem(A, B, C, D, t => 6 * (1 - t * 0.85) + 0.5, 52));

  for (let i = 0; i < o.sprigs; i++) {
    const t = 0.05 + (i / (o.sprigs - 1)) * 0.9;
    const [sx, sy] = bez(A, B, C, D, t);
    const [tx, ty] = bezT(A, B, C, D, t);
    const base = Math.atan2(ty, tx);
    const side = i % 2 ? 1 : -1;
    const ang = base + side * (0.5 + R() * 0.22);
    const len = (o.h * 0.5) * (1 - t * 0.4) * (0.7 + R() * 0.4);
    const b0 = [sx, sy];
    const b1 = [sx + Math.cos(ang) * len * 0.4, sy + Math.sin(ang) * len * 0.32];
    const b2 = [sx + Math.cos(ang) * len * 0.78, sy + Math.sin(ang) * len * 0.72];
    const b3 = [sx + Math.cos(ang - side * 0.16) * len, sy + Math.sin(ang - side * 0.16) * len];
    d.push(taperedStem(b0, b1, b2, b3, u => 1.5 * (1 - u * 0.9) + 0.2, 24));

    /* Хвоя — пари голок уздовж пагона */
    const nN = 16 + Math.floor(R() * 8);
    for (let k = 0; k < nN; k++) {
      const u = 0.08 + (k / nN) * 0.9;
      const [nx, ny] = bez(b0, b1, b2, b3, u);
      const [ux, uy] = bezT(b0, b1, b2, b3, u);
      const na = Math.atan2(uy, ux);
      for (const sgn of [-1, 1]) {
        const a2 = na + sgn * (0.52 + R() * 0.2);
        const ln = 15 + R() * 13;
        const ex = nx + Math.cos(a2) * ln, ey = ny + Math.sin(a2) * ln;
        const pw = 0.75;
        d.push(`M${n1(nx - Math.sin(na) * pw)} ${n1(ny + Math.cos(na) * pw)}` +
               `L${n1(ex)} ${n1(ey)}` +
               `L${n1(nx + Math.sin(na) * pw)} ${n1(ny - Math.cos(na) * pw)}Z`);
      }
    }
  }
  return { d, w: o.w, h: o.h };
}

/* ------------------------------------------------------------
   6. ОЧЕРЕТ — кромка води
   ------------------------------------------------------------ */
function reeds(seed, opt) {
  const o = Object.assign({ w: 900, h: 380, blades: 26 }, opt);
  const R = rng(seed);
  const d = [];
  for (let i = 0; i < o.blades; i++) {
    const x = (i / (o.blades - 1)) * o.w + (R() - 0.5) * 26;
    const h = o.h * (0.42 + R() * 0.56);
    const lean = (R() - 0.5) * 150;
    const b0 = [x, o.h];
    const b1 = [x + lean * 0.14, o.h - h * 0.42];
    const b2 = [x + lean * 0.58, o.h - h * 0.78];
    const b3 = [x + lean, o.h - h];
    d.push(taperedStem(b0, b1, b2, b3, t => 3.4 * (1 - t) * (1 - t) + 0.25, 26));

    /* На кожному третьому — качалка рогозу */
    if (i % 3 === 1) {
      const hh = 26 + R() * 20, hw = 3.6 + R() * 1.6;
      const [tx, ty] = bezT(b0, b1, b2, b3, 1);
      const a = Math.atan2(ty, tx);
      const cx = b3[0] + Math.cos(a) * hh * 0.5, cy = b3[1] + Math.sin(a) * hh * 0.5;
      d.push(`M${n1(cx)} ${n1(cy)}m${n1(-hw)} 0a${n1(hw)} ${n1(hh / 2)} 0 1 0 ${n1(hw * 2)} 0` +
             `a${n1(hw)} ${n1(hh / 2)} 0 1 0 ${n1(-hw * 2)} 0Z`);
    }
  }
  return { d, w: o.w, h: o.h };
}

/* ------------------------------------------------------------
   7. ВОДА — довгі лінії поверхні озера
   ------------------------------------------------------------ */
function water(seed, opt) {
  const o = Object.assign({ w: 1600, h: 300, lines: 15 }, opt);
  const R = rng(seed);
  const d = [];
  for (let i = 0; i < o.lines; i++) {
    const t = i / (o.lines - 1);
    const y = t * o.h;
    const amp = 3 + t * 11 + R() * 4;
    const seg = 5 + Math.floor(R() * 4);
    const inset = R() * o.w * 0.22;
    const x0 = inset, x1 = o.w - R() * o.w * 0.16;
    let p = `M${n1(x0)} ${n1(y)}`;
    for (let k = 0; k < seg; k++) {
      const sx = x0 + ((x1 - x0) / seg) * k;
      const ex = x0 + ((x1 - x0) / seg) * (k + 1);
      const mid = (sx + ex) / 2;
      p += `Q${n1(mid)} ${n1(y + (k % 2 ? amp : -amp))},${n1(ex)} ${n1(y)}`;
    }
    d.push({ p, w: n1(0.6 + t * 1.5) });
  }
  return { d, w: o.w, h: o.h };
}

/* ------------------------------------------------------------
   8. ЗБІРКА ФАЙЛІВ
   ------------------------------------------------------------ */
function fillSVG(name, geo, opacityRamp) {
  const paths = geo.d.map((p, i) => {
    const op = opacityRamp ? (0.55 + 0.45 * (1 - i / geo.d.length)).toFixed(2) : '1';
    return `<path d="${p}" opacity="${op}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geo.w} ${geo.h}" ` +
    `fill="currentColor" aria-hidden="true" focusable="false">${paths}</svg>`;
}

function strokeSVG(geo) {
  const paths = geo.d.map(l =>
    `<path d="${l.p}" stroke-width="${l.w}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geo.w} ${geo.h}" ` +
    `fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true" ` +
    `focusable="false">${paths}</svg>`;
}

const files = {
  'falcon.svg':
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FALCON_VB}" fill="currentColor" ` +
    `aria-hidden="true" focusable="false"><path d="${FALCON}"/></svg>`,

  'wing.svg':
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WING_VB}" fill="currentColor" ` +
    `aria-hidden="true" focusable="false"><path d="${FALCON}"/></svg>`,

  'willow.svg': fillSVG('willow', willow(20240812, { w: 900, h: 640, shoots: 13 }), true),
  'willow-sm.svg': fillSVG('willow-sm', willow(7749, { w: 620, h: 430, shoots: 8 }), true),
  'pine.svg': fillSVG('pine', pine(31337, { w: 760, h: 430, sprigs: 9 }), true),
  'reeds.svg': fillSVG('reeds', reeds(505, { w: 900, h: 360, blades: 26 }), true),
  'water.svg': strokeSVG(water(9001, { w: 1600, h: 300, lines: 15 })),
  'water-wide.svg': strokeSVG(water(4242, { w: 2400, h: 200, lines: 11 })),

  /* Фавікон: той самий знак, а не окремий малюнок.
     Тло — --ink, сокіл — --aqua з палітри сайту.
     По вертикалі знак навмисно розтягнутий у 2.4 раза: у
     природних пропорціях (1000×144) на 16 px лишається смужка
     в один піксель і мітка вкладки читається як пляма.
     Розмах крил при цьому зберігається — силует упізнаваний. */
  '../favicon.svg':
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="11" fill="#0D1418"/>` +
    `<g fill="#79BFCB" transform="translate(5 22.28) scale(0.054 0.135)">` +
    `<path d="${FALCON}"/></g></svg>`,

  /* A-frame — креслення силуету будиночка над водою.
     Той самий кут даху, що й на реальних фото (≈ 62°). */
  'aframe.svg':
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none" ` +
    `stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" aria-hidden="true" ` +
    `focusable="false">` +
    `<path d="M200 24 344 250M200 24 56 250M56 250h288"/>` +
    `<path d="M200 24 200 250" opacity=".45"/>` +
    `<path d="M120 148h160M96 199h208" opacity=".45"/>` +
    `<path d="M20 262h360M4 278h392M40 292h320" opacity=".7"/>` +
    `<path d="M164 250v-58h72v58" opacity=".8"/>` +
    `</svg>`
};

/* Той самий контур потрібен і в рантаймі (шапка, підвал,
   прелоадер, індикатор прокрутки, курсор), тому пишемо його
   ще й як маленький js-модуль. Одне джерело — жодного шансу,
   що знак у шапці й знак у декорі розійдуться. */
fs.writeFileSync(path.join(__dirname, '..', 'js', 'falcon.js'),
  '/* ЗГЕНЕРОВАНО tools/brand-svg.js — не редагувати вручну.\n' +
  '   Контур обведено з реального знака SAP SAN. */\n' +
  'window.SAPSAN_FALCON = ' + JSON.stringify({ vb: FALCON_VB, wing: WING_VB, d: FALCON }) + ';\n');
console.log('   → js/falcon.js');

let total = 0;
for (const [name, body] of Object.entries(files)) {
  const p = path.join(OUT, name);
  fs.writeFileSync(p, body + '\n');
  total += Buffer.byteLength(body);
  console.log(String(Math.round(Buffer.byteLength(body) / 1024) + ' KB').padStart(7), name);
}
console.log('—'.repeat(28));
console.log(String(Math.round(total / 1024) + ' KB').padStart(7), Object.keys(files).length + ' файлів');

/* iOS ігнорує SVG в apple-touch-icon, тому растеризуємо той самий
   фавікон у 180×180 PNG. sharp уже є в devDependencies заради фото. */
(async () => {
  try {
    const sharp = require('sharp');
    const out = path.join(__dirname, '..', 'assets', 'apple-touch-icon.png');
    await sharp(Buffer.from(files['../favicon.svg'])).resize(180, 180).png().toFile(out);
    console.log('   → assets/apple-touch-icon.png');
  } catch (e) {
    console.warn('   apple-touch-icon пропущено:', e.message);
  }
})();
