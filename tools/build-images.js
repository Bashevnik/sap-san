/* ============================================================
   SAP SAN — ЗБІРКА ФОТО
   ------------------------------------------------------------
   Єдине джерело — new-images/ (оригінали 3200×1800 PNG).
   Каталоги images/ і orig_images/ у збірці не беруть участі.

   Що робить:
   1. Для кожного кадру пише сходинку ширин у AVIF + WebP.
      AVIF іде першим у <picture>, WebP лишається запасним —
      на однаковій якості AVIF важить удвічі менше, а великі
      full-bleed кадри тут вирішальні для відчуття «дорого».
   2. Де кадр потрібен вертикально або квадратно, ріже його
      НЕ по центру, а навколо заданої точки інтересу (focus).
      Через це будиночок, шатро чи келих не втрачають голову
      на мобільному, і не доводиться рятувати композицію
      через object-position уже в браузері.
   3. Пише js/images.js — маніфест зі справжніми розмірами,
      співвідношенням сторін, точкою фокуса й тоном кадру.
      Розмітка бере ширину/висоту звідти, тому CLS = 0.

   node tools/build-images.js            — усе
   node tools/build-images.js lake-aframe — один слаг
   ============================================================ */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'new-images');
const OUT = path.join(__dirname, '..', 'images');
const B1 = 'SAP_SAN_Website_Photos_3200x1800';
const B2 = 'SAP_SAN_Website_Photos_Batch_2_3200x1800';
const B3 = 'SAP_SAN_Website_Photos_Batch_3_3200x1800';
const B4 = 'SAP_SAN_Website_Photos_Batch_4_3200x1800';

/* Сходинки ширин за роллю кадру. Немає сенсу тримати 3200 px
   для мініатюри в галереї й немає сенсу обрізати hero на 1600 —
   на 2× екрані він одразу «милиться».                          */
const LADDER = {
  hero:  [640, 960, 1280, 1600, 2000, 2560, 3200],
  wide:  [640, 960, 1280, 1600, 2000, 2560],
  mid:   [640, 960, 1280, 1600],
  small: [480, 640, 960, 1280]
};

/**
 * КАТАЛОГ КАДРІВ
 * ---------------------------------------------------------------
 * focus  — точка інтересу в частках кадру [x, y]. Використовується
 *          і для обрізань тут, і для object-position у CSS.
 * tone   — 'dark' | 'light' | 'mid': яку накладку класти під текст.
 * crops  — додаткові пропорції: 'p' = 3:4 (мобільний / вертикальні
 *          блоки), 's' = 1:1 (галерея, сітки).
 * alt    — базовий опис українською; сторінки можуть уточнювати.
 *
 * УВАГА про Batch_4: у цій партії імена файлів зсунуті. Починаючи
 * з 04_*, файл N містить кадр, який описує ім'я файлу N−1
 * (напр. 06_lake_house_terrace.png — це насправді спальня, а
 * 07_poolside_cabana.png — тераса будиночка). Мапінг нижче
 * зроблено за фактичним вмістом кадрів, а не за назвами, тому
 * не «виправляйте» його назад під імена файлів.
 * Batch_4/04 не використовується взагалі: розмитий кадр стелі.
 *
 * Чотири кадри з new-images/ свідомо не потрапляють у збірку:
 *   Batch_2/03_brand_banner  — готовий банер попереднього дизайну
 *                              з чужою версткою й текстом усередині;
 *   Batch_3/03_bartender_service — у кадрі великий логотип іншого
 *                              бренду (автомат Pepsi);
 *   Batch_3/04_family_pool   — впізнавані обличчя дітей.
 */
const CATALOG = {
  /* ---- БУДИНОЧКИ ------------------------------------------- */
  'lake-aframe': {
    src: [B3, '05_lake_house.png'], role: 'hero', tone: 'mid', focus: [0.30, 0.45],
    crops: { p: [0.31, 0.42], s: [0.31, 0.44] },
    alt: 'Будиночок A-frame SAP SAN на понтоні посеред озера, довкола ліс'
  },
  'lake-aframe-wide': {
    src: [B3, '06_lake_house_panorama.png'], role: 'hero', tone: 'mid', focus: [0.22, 0.42],
    /* Мобільний портретний кадр потрібен тепер, коли слаг
       використовується і як hero на головній. */
    crops: { p: [0.22, 0.4] },
    alt: 'Панорама озера SAP SAN із будиночком A-frame на лівому березі'
  },
  'terrace-glass': {
    src: [B3, '07_house_terrace.png'], role: 'wide', tone: 'mid', focus: [0.55, 0.5],
    crops: { p: [0.52, 0.5] },
    alt: 'Скляна стіна будиночка A-frame і тераса зі столом над водою'
  },
  'terrace-lakeview': {
    src: [B3, '10_lake_view_from_house.png'], role: 'wide', tone: 'mid', focus: [0.45, 0.5],
    crops: { p: [0.42, 0.5], s: [0.45, 0.5] },
    alt: 'Вид на озеро з тераси будиночка крізь відчинені двері'
  },
  'terrace-solar': {
    src: [B4, '02_solar_lake_view.png'], role: 'wide', tone: 'mid', focus: [0.62, 0.5],
    crops: { p: [0.3, 0.5] },
    alt: 'Сонячні панелі на даху A-frame, мангал на терасі й озеро'
  },
  'terrace-evening': {
    src: [B4, '07_poolside_cabana.png'], role: 'wide', tone: 'dark', focus: [0.58, 0.55],
    crops: { p: [0.6, 0.5], s: [0.58, 0.5] },
    alt: 'Тераса будиночка A-frame зі столом і кріслами у вечірньому світлі'
  },
  'interior-lounge': {
    src: [B3, '08_house_interior_lounge.png'], role: 'wide', tone: 'light', focus: [0.6, 0.5],
    crops: { s: [0.6, 0.5] },
    alt: 'Вітальня всередині будиночка A-frame з похилими стінами й кухнею'
  },
  'interior-kitchen': {
    src: [B3, '09_house_interior_kitchen.png'], role: 'wide', tone: 'light', focus: [0.55, 0.5],
    crops: { p: [0.5, 0.5], s: [0.55, 0.5] },
    alt: 'Кухня та сходи на другий рівень усередині будиночка A-frame'
  },
  'interior-sofa': {
    src: [B4, '03_house_lounge.png'], role: 'mid', tone: 'light', focus: [0.5, 0.5],
    alt: 'Кухонна лінія та м’які меблі у вітальні будиночка'
  },
  'interior-bath': {
    src: [B4, '01_bathroom_wide.png'], role: 'mid', tone: 'mid', focus: [0.42, 0.5],
    crops: { p: [0.4, 0.5] },
    alt: 'Санвузол будиночка з душем і свіжими рушниками'
  },
  'interior-bath-2': {
    src: [B4, '05_house_bedroom.png'], role: 'mid', tone: 'light', focus: [0.34, 0.55],
    crops: { p: [0.32, 0.55] },
    alt: 'Раковина зі стосом свіжих рушників у санвузлі будиночка'
  },
  'interior-bed': {
    src: [B4, '06_lake_house_terrace.png'], role: 'mid', tone: 'light', focus: [0.5, 0.55],
    crops: { s: [0.5, 0.55] },
    alt: 'Двоспальне ліжко зі свіжою білизною у спальні будиночка'
  },

  /* ---- БАСЕЙН ---------------------------------------------- */
  'pool-deck': {
    src: [B1, '01_pool_terrace.png'], role: 'hero', tone: 'light', focus: [0.5, 0.55],
    crops: { p: [0.62, 0.5], s: [0.5, 0.55] },
    alt: 'Шезлонги, парасольки й білі шатра на терасі басейну SAP SAN'
  },
  'pool-cabanas': {
    src: [B1, '07_pool_cabana.png'], role: 'hero', tone: 'light', focus: [0.55, 0.55],
    crops: { p: [0.66, 0.5] },
    alt: 'Ряд шезлонгів біля басейну й шатра з білими шторами над озером'
  },
  'pool-sky': {
    src: [B1, '04_pool_lake.png'], role: 'hero', tone: 'light', focus: [0.62, 0.6],
    crops: { p: [0.6, 0.55] },
    alt: 'Парасольки та шезлонги на березі озера під високим небом'
  },
  'pool-still': {
    src: [B1, '05_pool_panorama.png'], role: 'hero', tone: 'mid', focus: [0.5, 0.6],
    alt: 'Спокійна вода басейну, канатна огорожа й лісистий берег озера'
  },
  'pool-forest': {
    src: [B1, '06_pool_terrace_wide.png'], role: 'hero', tone: 'mid', focus: [0.5, 0.55],
    crops: { p: [0.55, 0.55] },
    alt: 'Відкритий басейн SAP SAN на тлі лісу та озера'
  },
  'pool-lake': {
    src: [B4, '09_pool_panorama.png'], role: 'wide', tone: 'mid', focus: [0.4, 0.58],
    crops: { p: [0.34, 0.55], s: [0.4, 0.55] },
    alt: 'Кут басейну з поручнями, шезлонги й гладінь озера позаду'
  },
  'pool-walk': {
    src: [B2, '08_pool_walkway.png'], role: 'mid', tone: 'light', focus: [0.45, 0.55],
    alt: 'Доріжка вздовж басейну з поручнями для сходу у воду'
  },
  'loungers-white': {
    src: [B2, '04_pool_loungers.png'], role: 'wide', tone: 'mid', focus: [0.55, 0.55],
    crops: { p: [0.5, 0.55], s: [0.5, 0.55] },
    alt: 'Білі шезлонги на кам’яній терасі вздовж басейну'
  },
  'loungers-black': {
    src: [B2, '05_black_loungers_lake.png'], role: 'wide', tone: 'mid', focus: [0.55, 0.6],
    crops: { s: [0.5, 0.6] },
    alt: 'Темні шезлонги біля води й парасольки на терасі басейну'
  },
  'loungers-poolside': {
    src: [B2, '06_poolside_loungers.png'], role: 'mid', tone: 'mid', focus: [0.45, 0.55],
    alt: 'Шезлонги двох типів на терасі між басейном і озером'
  },
  'cabana-pool': {
    src: [B2, '07_cabana_pool_view.png'], role: 'wide', tone: 'light', focus: [0.5, 0.5],
    crops: { p: [0.5, 0.5], s: [0.5, 0.5] },
    alt: 'Вид на басейн крізь білі штори шатра'
  },
  'cabana-white': {
    src: [B4, '08_pool_lake_view.png'], role: 'hero', tone: 'light', focus: [0.5, 0.5],
    crops: { p: [0.45, 0.5], s: [0.48, 0.5] },
    alt: 'Білі шатра з легкими шторами й тіньовий тент над зоною басейну'
  },
  'cabana-lake': {
    src: [B1, '02_lake_terrace.png'], role: 'hero', tone: 'light', focus: [0.5, 0.55],
    crops: { p: [0.5, 0.55], s: [0.48, 0.55] },
    alt: 'Стіл під парасолькою на терасі біля води, поруч штори шатра'
  },
  'rattan-chair': {
    src: [B1, '03_sunbeds_lake.png'], role: 'wide', tone: 'mid', focus: [0.3, 0.55],
    crops: { p: [0.25, 0.5], s: [0.3, 0.55] },
    alt: 'Плетене крісло-кокон із подушками біля басейну'
  },
  'shade-lake': {
    src: [B2, '09_lakeside_terrace.png'], role: 'mid', tone: 'mid', focus: [0.5, 0.5],
    alt: 'Тіньовий вітрило-тент над терасою біля самої води'
  },

  /* ---- КУХНЯ І БАР ----------------------------------------- */
  'drink-passion': {
    src: [B2, '01_passionfruit_cocktail.png'], role: 'wide', tone: 'light', focus: [0.45, 0.55],
    crops: { p: [0.45, 0.55], s: [0.45, 0.55] },
    alt: 'Коктейль із маракуйєю, м’ятою та апельсином на тлі води басейну'
  },
  'drink-grapefruit': {
    src: [B2, '02_grapefruit_cocktail.png'], role: 'wide', tone: 'light', focus: [0.45, 0.55],
    crops: { p: [0.45, 0.55], s: [0.45, 0.55] },
    alt: 'Коктейль із грейпфрутом і розмарином на бірюзовому тлі'
  },
  'drink-dark': {
    src: [B1, '08_cocktail_detail.png'], role: 'wide', tone: 'dark', focus: [0.35, 0.5],
    crops: { p: [0.35, 0.5], s: [0.35, 0.5] },
    alt: 'Темний коктейль із сушеним лаймом і льодом крупним планом'
  },
  'bar-pour': {
    src: [B3, '01_cocktail_pouring.png'], role: 'wide', tone: 'light', focus: [0.28, 0.45],
    crops: { p: [0.3, 0.5], s: [0.3, 0.5] },
    alt: 'Бармен SAP SAN розливає напій по склянках з льодом'
  },
  'bar-jigger': {
    src: [B3, '02_bartender_jigger.png'], role: 'wide', tone: 'dark', focus: [0.4, 0.45],
    crops: { p: [0.35, 0.5], s: [0.38, 0.5] },
    alt: 'Барменський джигер над склянкою під час приготування коктейлю'
  },

  /* ---- НАСТРІЙ (Pexels, ліцензія Pexels — вільне комерційне
     використання) ----------------------------------------------
     Тільки для атмосферної панелі «Напрямки» на головній, де
     показано загальний вайб напрямку, а не конкретний кадр бази.
     Будиночки, басейн і шезлонги там лишаються РЕАЛЬНИМИ фото —
     це фактичний товар, який купує гість, його не можна підміняти
     стоком. Кухня й територія — радше настрій, тому тут можна
     використати чужий кадр із тим самим духом, доки десь на сайті
     (розділ «Кухня і бар», галерея) лишаються справжні фотографії. */
  'mood-bar': {
    src: ['pexels', 'bar-mood.jpg'], role: 'wide', tone: 'dark', focus: [0.5, 0.55],
    crops: { p: [0.5, 0.55] },
    alt: 'Атмосфера бару: наливають бурштиновий напій у келих на барній стійці',
    credit: 'Photo by Naci Berk Domaniç on Pexels'
  },
  'mood-forest': {
    src: ['pexels', 'forest-mood.jpg'], role: 'wide', tone: 'mid', focus: [0.35, 0.5],
    crops: { p: [0.35, 0.5] },
    alt: 'Туман над лісовим озером у соснах',
    credit: 'Photo by eberhard grossgasteiger on Pexels'
  },

  /* ---- БРЕНД ----------------------------------------------- */
  'brand-uniform': {
    src: [B2, '10_sap_san_service.png'], role: 'wide', tone: 'mid', focus: [0.62, 0.64],
    /* Тільки квадрат: у 3:4 знак на спині фізично не влазить
       цілком, а різати логотип посеред слова — гірше, ніж
       не мати вертикального варіанта взагалі. */
    crops: { s: [0.63, 0.66] },
    alt: 'Знак SAP SAN на футболці працівника біля зони басейну'
  }
};

/* ------------------------------------------------------------
   Обрізання навколо точки інтересу.
   Повертає прямокутник максимальної площі із заданим
   співвідношенням, притиснутий до меж кадру.
   ------------------------------------------------------------ */
function focusCrop(W, H, ratio, fx, fy) {
  let w = W, h = Math.round(W / ratio);
  if (h > H) { h = H; w = Math.round(H * ratio); }
  let left = Math.round(fx * W - w / 2);
  let top = Math.round(fy * H - h / 2);
  left = Math.max(0, Math.min(W - w, left));
  top = Math.max(0, Math.min(H - h, top));
  return { left, top, width: w, height: h };
}

const RATIOS = { p: 3 / 4, s: 1 };

async function emit(pipeline, base, widths, srcW, stats) {
  const done = [];
  for (const w of widths) {
    if (w > srcW) continue;
    const resized = () => pipeline.clone()
      .resize({ width: w, kernel: 'lanczos3', withoutEnlargement: true })
      /* Легкий unsharp повертає мікроконтраст, який завжди
         з'їдає ресемпл. Без нього великі кадри виглядають «мильними»
         навіть у правильній роздільності. */
      .sharpen({ sigma: 0.55, m1: 0.35, m2: 0.55 });

    const avif = path.join(OUT, `${base}-${w}.avif`);
    const webp = path.join(OUT, `${base}-${w}.webp`);
    await resized().avif({ quality: w >= 2000 ? 55 : 60, effort: 4, chromaSubsampling: '4:4:4' }).toFile(avif);
    await resized().webp({ quality: w >= 2000 ? 82 : 86, effort: 5 }).toFile(webp);
    stats.bytes += fs.statSync(avif).size + fs.statSync(webp).size;
    stats.files += 2;
    done.push(w);
  }
  return done;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const manifest = {};
  const stats = { bytes: 0, files: 0 };
  const entries = Object.entries(CATALOG)
    .filter(([slug]) => !only.length || only.includes(slug));

  for (const [slug, cfg] of entries) {
    /* Якщо для цього кадру є AI-покращена версія (tools/ai-upscale.mjs
       пише в new-images/enhanced/ під тим самим іменем файлу) —
       беремо її. Оригінал у new-images/ лишається недоторканим,
       підміна відбувається лише тут, на етапі збірки похідних. */
    const enhanced = path.join(SRC, 'enhanced', cfg.src[1]);
    const file = fs.existsSync(enhanced) ? enhanced : path.join(SRC, cfg.src[0], cfg.src[1]);
    if (!fs.existsSync(file)) { console.warn('НЕМАЄ ДЖЕРЕЛА:', file); continue; }
    if (file === enhanced) console.log('  (AI-покращена версія)', slug);

    const img = sharp(file);
    const meta = await img.metadata();
    const widths = LADDER[cfg.role] || LADDER.mid;

    const sizes = await emit(sharp(file), slug, widths, meta.width, stats);

    const rec = {
      w: meta.width,
      h: meta.height,
      ar: +(meta.width / meta.height).toFixed(4),
      sizes,
      focus: cfg.focus,
      tone: cfg.tone,
      alt: cfg.alt
    };

    /* Додаткові пропорції — окремими файлами, а не CSS-обрізанням */
    for (const [key, ratio] of Object.entries(RATIOS)) {
      const f = cfg.crops && cfg.crops[key];
      if (!f) continue;
      const box = focusCrop(meta.width, meta.height, ratio, f[0], f[1]);
      const cropped = sharp(file).extract(box);
      const capped = widths.filter(w => w <= box.width);
      const ws = await emit(cropped, `${slug}-${key}`, capped.length ? capped : [box.width], box.width, stats);
      rec[key] = { w: box.width, h: box.height, ar: +(box.width / box.height).toFixed(4), sizes: ws };
    }

    manifest[slug] = rec;
    console.log(slug.padEnd(20), sizes.join('/'), Object.keys(RATIOS).filter(k => rec[k]).join('') || '—');
  }

  /* Якщо збирали один слаг — не втрачаємо решту маніфесту */
  let merged = manifest;
  const mp = path.join(__dirname, '..', 'js', 'images.js');
  if (only.length && fs.existsSync(mp)) {
    const prev = JSON.parse(fs.readFileSync(mp, 'utf8')
      .replace(/^[\s\S]*?window\.SAPSAN_IMAGES\s*=\s*/, '').replace(/;\s*$/, ''));
    merged = Object.assign(prev, manifest);
  }

  fs.writeFileSync(mp,
    '/* ЗГЕНЕРОВАНО tools/build-images.js — не редагувати вручну.\n' +
    '   slug -> { w, h, ar, sizes, focus:[x,y], tone, alt, p?, s? } */\n' +
    'window.SAPSAN_IMAGES = ' + JSON.stringify(merged, null, 1) + ';\n');

  console.log('—'.repeat(46));
  console.log(stats.files + ' файлів · ' + (stats.bytes / 1048576).toFixed(1) + ' МБ · ' +
    Object.keys(merged).length + ' кадрів у маніфесті');
})();
