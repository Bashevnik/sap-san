/* Одноразовий прогін для new-fotka.png: на відміну від
   tools/ai-upscale.mjs (де ціль — прибрати м'якість БЕЗ зміни
   розміру), тут мета інша — реально підняти роздільність з
   1672×941 до рівня решти сайту (~3200 по ширині). Тому 2×
   SR-результат (3344×1882) залишається як є, без даунскейлу
   назад. Логіка тайлінгу й блендингу — та сама. */
import '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MODEL_DIR = path.join(ROOT, 'node_modules', '@upscalerjs', 'esrgan-medium', 'models', 'x2');
const SRC = path.join(ROOT, 'new-images', 'new-fotka.png');
const OUT = path.join(ROOT, 'new-images', 'enhanced', 'new-fotka-2x.png');
const SCALE = 2, TILE = 256, OVERLAP = 32;

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

async function superResolve(model, srcPath) {
  const meta = await sharp(srcPath).metadata();
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

      for (let y = 0; y < oh; y++) {
        const dy = Math.min(y, oh - 1 - y) / (OVERLAP * SCALE);
        const wy = Math.max(0, Math.min(1, dy + 0.001));
        for (let x = 0; x < ow; x++) {
          const dx = Math.min(x, ow - 1 - x) / (OVERLAP * SCALE);
          const wx = Math.max(0, Math.min(1, dx + 0.001));
          const w = Math.min(wx, wy) || 0.02;
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
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await tf.setBackend('wasm'); await tf.ready();
  const model = await tf.loadLayersModel(nodeFileIO(MODEL_DIR));
  const meta = await sharp(SRC).metadata();
  console.log('new-fotka.png', meta.width + 'x' + meta.height, '-> 2x SR (без даунскейлу назад)');
  const t0 = Date.now();
  const srImage = await superResolve(model, SRC);
  await srImage.png().toFile(OUT);
  const outMeta = await sharp(OUT).metadata();
  console.log(`→ ${path.relative(ROOT, OUT)}  ${outMeta.width}x${outMeta.height}  (${Math.round((Date.now() - t0) / 1000)}s)`);
}
main().catch(e => { console.error('FAILED:', e); process.exit(1); });
