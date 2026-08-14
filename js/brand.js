/* ============================================================
   SAP SAN — ЗНАК ТА ІКОНОГРАФІКА
   ------------------------------------------------------------
   Один почерк на весь сайт:

   · Штрих 1.25, круглі кінці, сітка 24.
   · Кожна піктограма побудована на трьох формах бази —
     трикутник фронтона A-frame, дуга крила з логотипа
     і горизонталь води. Через це набір читається як один
     алфавіт, а не як зібрані з різних бібліотек іконки.
   · Знак сокола береться з js/falcon.js — того самого
     контуру, що обведений з реального логотипа SAP SAN.

   Підключати ПІСЛЯ js/falcon.js і js/data.js.
   ============================================================ */
(function (global) {
  'use strict';

  const F = global.SAPSAN_FALCON || { vb: '0 0 1000 144', wing: '505 0 495 130', d: '' };

  /** Знак сокола як inline-SVG. cls — додаткові класи. */
  function bird(cls) {
    return '<svg class="bird' + (cls ? ' ' + cls : '') + '" viewBox="' + F.vb + '" ' +
      'fill="currentColor" aria-hidden="true" focusable="false"><path d="' + F.d + '"/></svg>';
  }

  /** Одне крило — той самий контур у зсунутому viewBox. */
  function wing(cls) {
    return '<svg class="bird' + (cls ? ' ' + cls : '') + '" viewBox="' + F.wing + '" ' +
      'fill="currentColor" aria-hidden="true" focusable="false"><path d="' + F.d + '"/></svg>';
  }

  /* ---------- ПІКТОГРАМИ ------------------------------------
     Тільки вміст <svg>; обгортку додає icon().            */
  const PATHS = {
    /* Фронтон A-frame над водою — базова форма всього набору */
    aframe: '<path d="M12 3.2 20.4 17H3.6L12 3.2Z"/><path d="M10.2 17v-4.1h3.6V17"/>' +
            '<path d="M2.4 19.6h19.2M4.6 21.8h14.8"/>',
    /* Чаша басейну з хвилею й драбинкою */
    pool:   '<path d="M3.4 9.6h17.2v8.2a1.8 1.8 0 0 1-1.8 1.8H5.2a1.8 1.8 0 0 1-1.8-1.8V9.6Z"/>' +
            '<path d="M6.2 14.4c1.1-.9 2.2-.9 3.3 0s2.2.9 3.3 0 2.2-.9 3.3 0 1.6.7 2.3.3"/>' +
            '<path d="M8.4 9.6V5.2a1.8 1.8 0 0 1 3.6 0"/>',
    /* Келих: та сама трикутна чаша, що й дах */
    glass:  '<path d="M5 4.4h14L12 12.6 5 4.4Z"/><path d="M12 12.6V19M8.4 19h7.2"/>' +
            '<path d="m15.6 7.6 2.8-3.2"/>',
    /* Мангал: полум'я-трикутник над лінією жару */
    fire:   '<path d="M12 3.4c1.9 2.2 2.8 3.8 2.8 5.6a2.8 2.8 0 0 1-5.6 0c0-.9.4-1.6.4-1.6s.5 1 1.3 1.1c0-1.9.4-3.2 1.1-5.1Z"/>' +
            '<path d="M4.6 13.8h14.8M7 13.8V20M11 13.8v4.2M13 13.8v4.2M17 13.8V20"/>',
    /* Сосна — трикутник, повторений тричі */
    pine:   '<path d="M12 3 8.2 8.6h7.6L12 3ZM12 8 7.4 14.2h9.2L12 8ZM12 13.4 6.4 20.2h11.2L12 13.4Z"/>' +
            '<path d="M12 20.2V22.4"/>',
    /* Сонячна панель + промені */
    sun:    '<circle cx="12" cy="8.6" r="3.4"/>' +
            '<path d="M12 2.4v1.6M12 13.2v1.4M18.2 8.6h-1.6M7.4 8.6H5.8M16.4 4.2l-1.1 1.1M8.7 11.9l-1.1 1.1M16.4 13l-1.1-1.1M8.7 5.3 7.6 4.2"/>' +
            '<path d="M4.4 18.4h15.2M6 21.4h12"/>',
    /* Тиша / ліс і вода */
    wave:   '<path d="M2.6 8.6c1.6-1.3 3.2-1.3 4.8 0s3.2 1.3 4.8 0 3.2-1.3 4.8 0 2.4 1 3.4.4"/>' +
            '<path d="M2.6 13.2c1.6-1.3 3.2-1.3 4.8 0s3.2 1.3 4.8 0 3.2-1.3 4.8 0 2.4 1 3.4.4"/>' +
            '<path d="M2.6 17.8c1.6-1.3 3.2-1.3 4.8 0s3.2 1.3 4.8 0 3.2-1.3 4.8 0 2.4 1 3.4.4"/>',
    /* Вітер / ранковий туман — три хвилі різної довжини, той самий
       розчерк, що й у крилі знака, лише розгорнутий по горизонталі */
    wind:   '<path d="M2.4 7.4h12.4a2.6 2.6 0 1 0-2.4-3.6"/>' +
            '<path d="M2.4 12h16.2a2.8 2.8 0 1 1-2.6 3.9"/>' +
            '<path d="M2.4 16.6h9.6a2.1 2.1 0 1 1-1.9 2.9"/>',
    key:    '<path d="M7.6 3.6 4 9.4h7.2L7.6 3.6Z"/><path d="M7.6 9.4V20M4.8 20h5.6"/>' +
            '<path d="M11.2 6.5h8.4M17 6.5v2.8M19.6 6.5v2.4"/>',
    bed:    '<path d="M3 18.4V8.6M21 18.4v-5.8H3"/><path d="M3 12.6V9.4a1.8 1.8 0 0 1 1.8-1.8h14.4A1.8 1.8 0 0 1 21 9.4v3.2"/>' +
            '<circle cx="7.4" cy="10.6" r="1.6"/><path d="M11 12.6V9.8h7"/>',
    users:  '<circle cx="9" cy="8.2" r="3"/><path d="M3.4 19.4c0-3.1 2.5-5.2 5.6-5.2s5.6 2.1 5.6 5.2"/>' +
            '<path d="M16 5.6a3 3 0 0 1 0 5.6M17.4 14.6c1.9.7 3.2 2.4 3.2 4.8"/>',
    calendar: '<rect x="3.4" y="5.2" width="17.2" height="15.4" rx="1.6"/><path d="M3.4 10h17.2"/>' +
            '<path d="M8 3.4v3.4M16 3.4v3.4"/><path d="M7.6 14h3.2M13.2 14h3.2M7.6 17.4h3.2"/>',
    wifi:   '<path d="M2.6 8.8c5.4-4.5 13.4-4.5 18.8 0"/><path d="M6 12.6c3.5-2.9 8.5-2.9 12 0"/>' +
            '<path d="M9.4 16.4c1.6-1.3 3.6-1.3 5.2 0"/><circle cx="12" cy="19.8" r="1"/>',
    ac:     '<rect x="2.8" y="4.6" width="18.4" height="7.4" rx="1.6"/><path d="M6 8.6h12"/>' +
            '<path d="M7.4 15c0 1.6 1.2 1.6 1.2 3.2M12 15c0 1.8 1.2 1.8 1.2 3.6M16.6 15c0 1.6 1.2 1.6 1.2 3.2"/>',
    towel:  '<path d="M6 3.6h10.4a2 2 0 0 1 2 2v14.8H8a2 2 0 0 1-2-2V3.6Z"/>' +
            '<path d="M6 3.6a2 2 0 0 0-2 2v2.2h2"/><path d="M10.4 8h4.6M10.4 11.4h4.6"/>',
    shield: '<path d="M12 3 5 5.8v5.4c0 4.2 2.8 7.6 7 9.8 4.2-2.2 7-5.6 7-9.8V5.8L12 3Z"/>' +
            '<path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    /* Інтерфейс */
    arrow:  '<path d="M3 12h18M14.4 5.4 21 12l-6.6 6.6"/>',
    arrowL: '<path d="M21 12H3M9.6 5.4 3 12l6.6 6.6"/>',
    ext:    '<path d="M8 16 16 8M9 8h7v7"/>',
    plus:   '<path d="M12 5v14M5 12h14"/>',
    close:  '<path d="M5.6 5.6 18.4 18.4M18.4 5.6 5.6 18.4"/>',
    phone:  '<path d="M8.4 3.6 4.8 3a1.7 1.7 0 0 0-1.8 1.7C3 13.6 10.4 21 19.3 21a1.7 1.7 0 0 0 1.7-1.8l-.6-3.6-4-1.4-2 2.4a14.3 14.3 0 0 1-7-7l2.4-2-1.4-4Z"/>',
    mail:   '<rect x="3" y="5.4" width="18" height="13.2" rx="1.8"/><path d="m3.8 6.6 8.2 6.4 8.2-6.4"/>',
    pin:    '<path d="M12 21.6s7.4-6.6 7.4-12A7.4 7.4 0 0 0 4.6 9.6c0 5.4 7.4 12 7.4 12Z"/><circle cx="12" cy="9.4" r="2.8"/>',
    clock:  '<circle cx="12" cy="12" r="9.2"/><path d="M12 6.8V12l3.6 2.2"/>',
    insta:  '<rect x="3" y="3" width="18" height="18" rx="5.4"/><circle cx="12" cy="12" r="4.2"/>' +
            '<circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/>',
    drag:   '<path d="M2.6 12h5.2M4.8 9 2 12l2.8 3M21.4 12h-5.2M19.2 9 22 12l-2.8 3"/>' +
            '<path d="M12 6.4v11.2"/>',
    down:   '<path d="M12 3.6v16.8M6.4 14.8 12 20.4l5.6-5.6"/>'
  };

  /**
   * Піктограма. name — ключ PATHS, cls — класи обгортки.
   * Заливка вимкнена, штрих спільний — так набір не «пливе»
   * між світлими й темними поверхнями.
   */
  function icon(name, cls) {
    const body = PATHS[name];
    if (!body) return '';
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /**
   * Набірний знак: слово, під ним сокіл, за потреби — дескриптор.
   * Сокіл загорнутий у <span>, а не вставлений напряму: SVG із
   * viewBox 1000×144 інакше приносить у розкладку власну
   * «природну» ширину 1000 px і розсуває шапку. Обгортка тримає
   * пропорцію через padding-bottom, а сам знак лежить у ній
   * абсолютно — і масштабується рівно по ширині слова.
   */
  function mark(opts) {
    const o = opts || {};
    return '<span class="mark">' +
      '<span class="mark__word">SAP SAN</span>' +
      '<span class="mark__bird">' + bird() + '</span>' +
      (o.sub ? '<span class="mark__sub">' + o.sub + '</span>' : '') +
      '</span>';
  }

  /**
   * Акордеон — по одному відкритому в межах списку.
   * Живе тут, а не в home.js/pages.js, бо потрібен і на головній,
   * і на сторінці правил, а цей файл підключений усюди.
   * Висота рахується перед розкриттям, тому перехід іде на
   * конкретне число, а не на auto (яке не анімується).
   */
  function accordion(list) {
    const items = Array.from(list.querySelectorAll('.acc__item'));
    items.forEach(item => {
      const btn = item.querySelector('.acc__q');
      const panel = item.querySelector('.acc__a');
      if (!btn || !panel) return;
      btn.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        items.forEach(o => {
          o.classList.remove('is-open');
          o.querySelector('.acc__q').setAttribute('aria-expanded', 'false');
          o.querySelector('.acc__a').style.height = '0px';
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.height = panel.scrollHeight + 'px';
        }
      });
    });
    /* Після зміни ширини відкрита панель має перерахувати висоту */
    window.addEventListener('resize', () => {
      const open = list.querySelector('.acc__item.is-open .acc__a');
      if (open) open.style.height = open.scrollHeight + 'px';
    });
  }

  const S = global.SAPSAN || (global.SAPSAN = {});
  S.bindAccordion = accordion;
  S.bird = bird;
  S.wing = wing;
  S.icon = icon;
  S.icons = PATHS;
  S.mark = mark;
})(window);
