const sharp=require('sharp');const fs=require('fs');const path=require('path');
const SRC='./source-photos';
const OUT='./images';
const MAP={'IMG_2107':'houses-water-wide','IMG_2106':'houses-water-wide-2','IMG_2094':'house-aframe-terrace','IMG_2105':'house-terrace-lake','IMG_2102':'house-terrace-table','IMG_2103':'house-interior-kitchen-wide','IMG_2104':'house-interior-lounge','IMG_2095':'house-bedroom','IMG_2097':'house-living','IMG_2098':'house-kitchen','IMG_2096':'house-bath','IMG_2101':'house-bath-2','IMG_2114':'pool-lounger','IMG_2118':'pool-loungers-lake','IMG_2120':'pool-sky','IMG_2121':'pool-wide-blue','IMG_2122':'pool-umbrellas','IMG_2116':'pool-loungers-row','IMG_2117':'pool-loungers-row-2','IMG_2130':'pool-cabanas','IMG_2093':'pool-cabana-tables','IMG_2113':'terrace-rope-view','IMG_2115':'cabana-curtains','IMG_2124':'cabana-lake','IMG_2125':'pool-cabanas-wide','IMG_2123':'rattan-chair','IMG_2127':'drink-grapefruit','IMG_2128':'drink-passion','IMG_2129':'drink-dark','IMG_2111':'bar-pour','IMG_2112':'brand-tee'};
(async()=>{
 let total=0;const man={};
 for(const [src,slug] of Object.entries(MAP)){
  const file=fs.readdirSync(SRC).find(f=>f.startsWith(src));if(!file)continue;
  const p=path.join(SRC,file);const m=await sharp(p).metadata();
  const targets=[...new Set([640,1000,m.width].filter(w=>w<=m.width))].sort((a,b)=>a-b);
  const ws=[];
  for(const w of targets){
   const o=path.join(OUT,`${slug}-${w}.webp`);
   await sharp(p).resize({width:w,withoutEnlargement:true,kernel:'lanczos3'})
    .sharpen({sigma:0.6,m1:0.4,m2:0.5}).webp({quality:w===m.width?80:78}).toFile(o);
   total+=fs.statSync(o).size;ws.push(w);
  }
  man[slug]={w:m.width,h:m.height,ar:+(m.width/m.height).toFixed(4),sizes:ws};
 }
 fs.writeFileSync('./js/images.js',
  '/* AUTO-GENERATED image manifest — slug -> {w,h,ar,sizes} */\nwindow.SAPSAN_IMAGES = '+JSON.stringify(man,null,1)+';\n');
 console.log('files',fs.readdirSync(OUT).length,'MB',(total/1048576).toFixed(2));
})();
