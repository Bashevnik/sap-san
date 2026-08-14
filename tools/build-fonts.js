/* ============================================================
   SAP SAN — ЛОКАЛЬНІ ШРИФТИ
   ------------------------------------------------------------
   Тягне з Google Fonts лише потрібні підмножини (latin,
   latin-ext, cyrillic, cyrillic-ext) і кладе .woff2 поруч із
   згенерованим assets/fonts/fonts.css з локальними шляхами.

   Навіщо локально, а не <link> на fonts.googleapis.com:
   заголовок сайту — це набірний знак SAP SAN. Поки шрифт
   їде зі стороннього домену, у першому кадрі стоїть підміна,
   і бренд «мигає». Локальний woff2 із preload прибирає це
   повністю, заразом знімаючи два зовнішні з'єднання.

   Гарнітури:
     Cormorant Garamond — та сама висококонтрастна антиква,
       якою набраний реальний логотип SAP SAN.
     Jost — геометричний гротеск; широкий трекінг капітелі
       перегукується з розрядкою в знаку, а сухі прямі форми —
       з геометрією A-frame.

   node tools/build-fonts.js
   ============================================================ */
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'fonts');
const KEEP = ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const URL = 'https://fonts.googleapis.com/css2' +
  '?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400' +
  '&family=Jost:wght@300;400;500;600' +
  '&display=swap';

function fetch(url, binary) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': UA } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location, binary).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' ' + url));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const css = await fetch(URL, false);

  /* Google віддає блоки виду:  ⁄* cyrillic *⁄ @font-face { … } */
  const blocks = css.split(/\/\*\s*/).slice(1);
  const out = [];
  let kept = 0, bytes = 0;

  for (const raw of blocks) {
    const subset = raw.slice(0, raw.indexOf('*/')).trim();
    if (!KEEP.includes(subset)) continue;
    const body = raw.slice(raw.indexOf('*/') + 2);

    const fam = (body.match(/font-family:\s*'([^']+)'/) || [])[1];
    const style = (body.match(/font-style:\s*(\w+)/) || [])[1] || 'normal';
    const weight = (body.match(/font-weight:\s*([\d ]+)/) || [])[1] || '400';
    const url = (body.match(/url\(([^)]+)\)/) || [])[1];
    const range = (body.match(/unicode-range:\s*([^;]+);/) || [])[1];
    if (!fam || !url) continue;

    const name = `${slug(fam)}-${subset}-${style}-${weight.trim().replace(/\s+/g, '_')}.woff2`;
    const file = path.join(OUT, name);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, await fetch(url, true));
    }
    bytes += fs.statSync(file).size;
    kept++;

    out.push(
      `/* ${fam} · ${subset} · ${style} ${weight.trim()} */\n` +
      `@font-face{font-family:'${fam}';font-style:${style};font-weight:${weight.trim()};` +
      `font-display:swap;src:url(${name}) format('woff2');unicode-range:${range}}`);
  }

  fs.writeFileSync(path.join(OUT, 'fonts.css'),
    '/* ЗГЕНЕРОВАНО tools/build-fonts.js — не редагувати вручну. */\n' + out.join('\n') + '\n');

  console.log(kept + ' файлів · ' + (bytes / 1024).toFixed(0) + ' КБ');
  console.log('→ assets/fonts/fonts.css');
})();
