/* ============================================================
   AI SUPER-RESOLUTION ДЛЯ М'ЯКИХ ФОТО
   ------------------------------------------------------------
   Застосовується вибірково — лише до кадрів, які
   tools/sharpness-scan.js об'єктивно визначив як розмиті
   (дисперсія Лапласіана < 5, тоді як решта набору — 20–200+).
   Це не косметика для всього new-images/, а точкове виправлення
   тих кількох кадрів, де м'якість — дефект джерела (рух/фокус
   телефону), а не стиснення чи наш пайплайн.

   Модель: @upscalerjs/esrgan-medium (RDN, DIV2K, x2), той самий
   клас моделі, що і в справжніх ESRGAN-апскейлерах, без
   агресивного «намальованого» шарпенінгу.

   Метод: SR ×2 по тайлах з перекриттям і лінійним блендингом
   країв → даунскейл назад до вихідного розміру. Це не робить
   фото більшим — воно дає той самий розмір, але з деталізацією,
   яку модель відновила, а плоский lanczos-downscale лише
   розмазав би. Класична техніка "upscale-then-downsample" для
   відновлення деталі без фізичного роздування роздільності.

   node tools/ai-upscale.mjs
   ============================================================ */
import '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'new-images', 'enhanced');
const MODEL_DIR = path.join(ROOT, 'node_modules', '@upscalerjs', 'esrgan-medium', 'models', 'x2');
const SCALE = 2;
const TILE = 256;      // вхідний розмір тайла (компроміч швидкість/кількість швів)
const OVERLAP = 32;    // перекриття для лінійного блендингу країв

/* Файли, підтверджені tools/sharpness-scan.js як реально м'які
   ТА фактично використані на сайті (js/data.js) — інші згенеровані,
   але ніде не показані кадри чіпати немає сенсу. */
const TARGETS = [
  { src: 'SAP_SAN_Website_Photos_Batch_4_3200x1800/06_lake_house_terrace.png', slug: 'interior-bed' },
  { src: 'SAP_SAN_Website_Photos_Batch_4_3200x1800/05_house_bedroom.png',      slug: 'interior-bath-2' },
  { src: 'SAP_SAN_Website_Photos_Batch_2_3200x1800/09_lakeside_terrace.png',   slug: 'shade-lake' }
];

/* @tensorflow/tfjs (без нативного tfjs-node, який тут не збирається
   без Python) не має вбудованого файлового IOHandler — той живе
   лише в нативному пакеті. Читаємо model.json і .bin шматки самі. */
function nodeFileIO(dir) {
  return {
    load: async () => {
      const modelJson = JSON.parse(fs.readFileSync(path.join(dir, 'model.json'), 'utf8'));
      const manifest = modelJson.weightsManifest;
      const buffers = [];
      for (const g of manifest) for (const p of g.paths) buffers.push(fs.readFileSync(path.join(dir, p)));
      const cat = Buffer.concat(buffers);
      return {
        modelTopology: modelJson.modelTopology,
        weightSpecs: manifest.flatMap(g => g.weights),
        weightData: cat.buffer.slice(cat.byteOffset, cat.byteOffset + cat.byteLength),
        format: modelJson.format
      };
    }
  };
}

async function srTile(model, buf, w, h, channels) {
  const input = tf.tensor3d(new Uint8Array(buf), [h, w, channels], 'float32').expandDims(0);
  const out = tf.tidy(() => model.predict(input));
  const data = await out.data();
  input.dispose(); out.dispose();
  return Uint8Array.from(data, v => Math.max(0, Math.min(255, Math.round(v))));
}

/**
 * SR по тайлах із перекриттям. Кожен тайл обробляється окремо
 * (модель фізично не тримає весь кадр 3200×1800 в пам'яті на
 * WASM/CPU), а перекриття прибирає видимі шви на межах тайлів —
 * без нього кожен квадрат мав би трохи інший рівень деталізації
 * на краю, і сітка тайлів була б помітна на рівних поверхнях.
 */
async function superResolve(model, srcPath) {
  const img = sharp(srcPath);
  const meta = await img.metadata();
  const { width: W, height: H } = meta;
  const stride = TILE - OVERLAP;

  const outW = W * SCALE, outH = H * SCALE;
  const acc = new Float32Array(outW * outH * 3);
  const wsum = new Float32Array(outW * outH);

  const xs = []; for (let x = 0; x < W; x += stride) xs.push(Math.min(x, Math.max(0, W - TILE)));
  const ys = []; for (let y = 0; y < H; y += stride) ys.push(Math.min(y, Math.max(0, H - TILE)));
  const uniq = a => [...new Set(a)];
  const uxs = uniq(xs), uys = uniq(ys);
  const total = uxs.length * uys.length;
  let done = 0;
  const t0 = Date.now();

  for (const ty of uys) {
    for (const tx of uxs) {
      const tw = Math.min(TILE, W - tx), th = Math.min(TILE, H - ty);
      const { data } = await sharp(srcPath).extract({ left: tx, top: ty, width: tw, height: th })
        .raw().toBuffer({ resolveWithObject: true });
      const sr = await srTile(model, data, tw, th, 3);
      const ow = tw * SCALE, oh = th * SCALE;
      const ox = tx * SCALE, oy = ty * SCALE;

      /* Трикутне вікно ваги: центр тайла важить повний внесок,
         краї згасають до нуля — сусідній тайл підхоплює рівно
         там, де цей згасає, тому шов не видно. */
      for (let y = 0; y < oh; y++) {
        const dy = Math.min(y, oh - 1 - y) / (OVERLAP * SCALE);
        const wy = Math.max(0, Math.min(1, dy + 0.001));
        for (let x = 0; x < ow; x++) {
          const dx = Math.min(x, ow - 1 - x) / (OVERLAP * SCALE);
          const wx = Math.max(0, Math.min(1, dx + 0.001));
          const w = Math.min(wx, wy) || 0.02; // мінімальна вага, щоб краї кадру не занулялись
          const gi = ((oy + y) * outW + (ox + x));
          const si = (y * ow + x) * 3;
          acc[gi * 3] += sr[si] * w;
          acc[gi * 3 + 1] += sr[si + 1] * w;
          acc[gi * 3 + 2] += sr[si + 2] * w;
          wsum[gi] += w;
        }
      }
      done++;
      const pct = Math.round((done / total) * 100);
      const eta = Math.round((Date.now() - t0) / done * (total - done) / 1000);
      process.stdout.write(`\r  тайл ${done}/${total} (${pct}%) · ~${eta}s лишилось     `);
    }
  }
  process.stdout.write('\n');

  const outBuf = Buffer.alloc(outW * outH * 3);
  for (let i = 0; i < outW * outH; i++) {
    const w = wsum[i] || 1;
    outBuf[i * 3] = Math.round(acc[i * 3] / w);
    outBuf[i * 3 + 1] = Math.round(acc[i * 3 + 1] / w);
    outBuf[i * 3 + 2] = Math.round(acc[i * 3 + 2] / w);
  }

  return sharp(outBuf, { raw: { width: outW, height: outH, channels: 3 } });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  await tf.setBackend('wasm');
  await tf.ready();
  console.log('backend:', tf.getBackend(), '· ціль:', TARGETS.length, 'фото\n');

  const model = await tf.loadLayersModel(nodeFileIO(MODEL_DIR));

  for (const t of TARGETS) {
    const srcPath = path.join(ROOT, 'new-images', t.src);
    const meta = await sharp(srcPath).metadata();
    console.log(`${t.slug}  (${t.src})  ${meta.width}×${meta.height}`);
    const t0 = Date.now();

    const srImage = await superResolve(model, srcPath);
    /* Даунскейл 2× SR назад до вихідного розміру — фінальний файл
       має ТУ Ж роздільність, що й оригінал, просто з деталізацією,
       відновленою моделлю замість плоского lanczos. */
    const outPath = path.join(OUT, path.basename(t.src));
    await srImage.resize(meta.width, meta.height, { kernel: 'lanczos3' }).png().toFile(outPath);

    console.log(`  → ${path.relative(ROOT, outPath)}  (${Math.round((Date.now() - t0) / 1000)}s)\n`);
  }

  console.log('Готово. Оригінали в new-images/ не змінені — покращені версії лежать окремо в new-images/enhanced/.');
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
