/* Об'єктивний скан різкості всіх фото в new-images/ — дисперсія
   Лапласіана (стандартна безрефе­рентна метрика фокусу/різкості).
   Нижче число = розмитіше зображення. Не використовує AI, тільки
   згортку, тому працює за секунди на весь набір. */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'new-images');
const LAPLACIAN = { width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] };

async function sharpnessOf(file) {
  // Різкість міряємо на зменшеній копії (1600px) — так метрика не
  // залежить від того, що великі фото випадково мають більше шуму.
  const { data, info } = await sharp(file)
    .resize({ width: 1600, withoutEnlargement: true })
    .greyscale()
    .convolve(LAPLACIAN)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sum = 0, sumSq = 0;
  for (let i = 0; i < data.length; i++) { sum += data[i]; sumSq += data[i] * data[i]; }
  const mean = sum / data.length;
  return sumSq / data.length - mean * mean; // variance
}

(async () => {
  const rows = [];
  for (const dir of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    for (const f of fs.readdirSync(full)) {
      if (!/\.png$/i.test(f)) continue;
      const p = path.join(full, f);
      const v = await sharpnessOf(p);
      rows.push({ file: path.join(dir, f), variance: +v.toFixed(1) });
    }
  }
  rows.sort((a, b) => a.variance - b.variance);
  console.log('НАЙРОЗМИТІШІ (низька дисперсія Лапласіана = м\'яко):');
  rows.slice(0, 12).forEach(r => console.log('  ' + String(r.variance).padStart(7) + '  ' + r.file));
  console.log('\nНАЙРІЗКІШІ:');
  rows.slice(-6).forEach(r => console.log('  ' + String(r.variance).padStart(7) + '  ' + r.file));
  fs.writeFileSync(path.join(__dirname, 'sharpness-report.json'), JSON.stringify(rows, null, 1));
  console.log('\n→ tools/sharpness-report.json (' + rows.length + ' файлів)');
})();
