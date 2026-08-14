import '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCR = 'C:/Users/ALEXBA~1/AppData/Local/Temp/claude/c--Users-alexbashevnik-OneDrive-Desktop-sap-san/908fb150-1cfa-4f0c-b666-2b8819c75db3/scratchpad/';
const MODEL_DIR = path.join(__dirname, '..', 'node_modules', '@upscalerjs', 'esrgan-medium', 'models', 'x2');

/** Minimal fs-backed IOHandler — @tensorflow/tfjs has no Node file loader
    built in (that lives in the native tfjs-node package, which we can't
    compile here). Reads model.json + referenced .bin shards from disk. */
function nodeFileIO(dir) {
  return {
    load: async () => {
      const modelJson = JSON.parse(fs.readFileSync(path.join(dir, 'model.json'), 'utf8'));
      const manifest = modelJson.weightsManifest;
      const buffers = [];
      for (const group of manifest) {
        for (const p of group.paths) {
          buffers.push(fs.readFileSync(path.join(dir, p)));
        }
      }
      const weightData = Buffer.concat(buffers).buffer.slice(0, Buffer.concat(buffers).length);
      return {
        modelTopology: modelJson.modelTopology,
        weightSpecs: manifest.flatMap(g => g.weights),
        weightData,
        format: modelJson.format,
        generatedBy: modelJson.generatedBy,
        convertedBy: modelJson.convertedBy
      };
    }
  };
}

async function main() {
  await tf.setBackend('wasm');
  await tf.ready();
  console.log('backend:', tf.getBackend());

  const t0 = Date.now();
  const model = await tf.loadLayersModel(nodeFileIO(MODEL_DIR));
  console.log('model loaded in', (Date.now() - t0) + 'ms');

  const { data, info } = await sharp('new-images/SAP_SAN_Website_Photos_Batch_3_3200x1800/05_lake_house.png')
    .extract({ left: 1300, top: 50, width: 128, height: 128 })
    .raw().toBuffer({ resolveWithObject: true });

  const t1 = Date.now();
  const input = tf.tensor3d(new Uint8Array(data), [info.height, info.width, info.channels], 'float32').expandDims(0);
  const out = tf.tidy(() => model.predict(input));
  const outData = await out.data();
  console.log('tile inference took', (Date.now() - t1) + 'ms, out shape', out.shape);

  const [, oh, ow, oc] = out.shape;
  const clamped = Uint8Array.from(outData, v => Math.max(0, Math.min(255, Math.round(v))));
  await sharp(Buffer.from(clamped), { raw: { width: ow, height: oh, channels: oc } })
    .png().toFile(SCR + 'sr_tile_2x.png');
  input.dispose(); out.dispose();
  console.log('saved', SCR + 'sr_tile_2x.png', ow + 'x' + oh);
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
