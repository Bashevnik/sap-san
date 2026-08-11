/* ============================================================
   SAP SAN — BOOKING
   ------------------------------------------------------------
   Frontend-only. Заявка збирається в чистий payload і зараз
   лише логується.

   ІНТЕГРАЦІЯ (для розробника бота/адмінки):
   замінити тіло submitBooking() на POST /api/bookings.
   Формат payload описано у README.
   ============================================================ */
(function () {
  'use strict';

  const D = window.SAPSAN;
  if (!D) return;
  D.onReady(function () { build(); });

  function build() {
  const S = D.data.settings;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Список будиночків із шару даних ------------- */
  const houseSelect = $('#h-house');
  if (houseSelect && D) {
    houseSelect.innerHTML =
      '<option value="">Будь-який вільний</option>' +
      D.data.houses.map(h => '<option value="' + h.id + '">' + h.name + '</option>').join('');
  }

  /* Предвибір будиночка з посилання: booking.html?house=aframe-water */
  const params = new URLSearchParams(location.search);
  const wantHouse = params.get('house');
  if (houseSelect && wantHouse && D && D.house(wantHouse)) houseSelect.value = wantHouse;

  /* ---------- Мінімальні дати — сьогодні ------------------ */
  const today = new Date().toISOString().slice(0, 10);
  ['#h-in', '#h-out', '#s-date'].forEach(sel => {
    const el = $(sel);
    if (el) el.min = today;
  });

  const inEl = $('#h-in'), outEl = $('#h-out');
  if (inEl && outEl) {
    inEl.addEventListener('change', () => {
      outEl.min = inEl.value || today;
      if (outEl.value && outEl.value <= inEl.value) outEl.value = '';
    });
  }

  /* ---------- ТАБИ ---------------------------------------- */
  const tabs = [
    { btn: $('#tab-house'), panel: $('#panel-house'), key: 'house' },
    { btn: $('#tab-sunbeds'), panel: $('#panel-sunbeds'), key: 'sunbeds' }
  ].filter(t => t.btn && t.panel);

  function selectTab(key) {
    tabs.forEach(t => {
      const on = t.key === key;
      t.btn.setAttribute('aria-selected', String(on));
      t.panel.hidden = !on;
    });
  }
  tabs.forEach(t => t.btn.addEventListener('click', () => selectTab(t.key)));
  tabs.forEach((t, i) => {
    t.btn.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.btn.focus();
      selectTab(next.key);
    });
  });
  selectTab(params.get('type') === 'sunbeds' ? 'sunbeds' : 'house');

  /* ---------- ВАЛІДАЦІЯ ----------------------------------- */
  const PHONE = /^[+()\d\s-]{9,20}$/;
  const fieldOf = input => input.closest('.field');

  function setError(input, msg) {
    const f = fieldOf(input);
    if (!f) return;
    const slot = $('[data-err]', f);
    f.classList.toggle('is-invalid', Boolean(msg));
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (slot) slot.textContent = msg || '';
  }

  function validate(form) {
    let ok = true, first = null;
    $$('input, select, textarea', form).forEach(el => {
      if (el.dataset.trap !== undefined) return;      /* пастка не валідується */
      let msg = '';
      const v = (el.value || '').trim();
      if (el.hasAttribute('required') && !v) msg = 'Заповніть це поле';
      else if (el.type === 'tel' && v && !PHONE.test(v)) msg = 'Перевірте номер телефону';
      else if (el.name === 'name' && v && v.length < 2) msg = 'Вкажіть імʼя';
      else if (el.type === 'date' && v && v < today) msg = 'Дата вже минула';
      setError(el, msg);
      if (msg) { ok = false; if (!first) first = el; }
    });

    const ci = $('[name="checkin"]', form), co = $('[name="checkout"]', form);
    if (ci && co && ci.value && co.value && co.value <= ci.value) {
      setError(co, 'Виїзд має бути пізніше заїзду');
      ok = false; if (!first) first = co;
    }
    if (first) first.focus();
    return ok;
  }

  $$('.form input, .form select, .form textarea').forEach(el => {
    const clear = () => { const f = fieldOf(el); if (f && f.classList.contains('is-invalid')) setError(el, ''); };
    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
  });

  /* ---------- ЗАХИСТ ВІД СПАМУ ----------------------------
     Три рівні без CAPTCHA:
     1) honeypot — приховане поле, яке заповнюють лише боти;
     2) мінімальний час на заповнення (боти шлють миттєво);
     3) обмеження частоти відправок з одного браузера.
     Серверну перевірку робить бекенд — ці поля йдуть у payload. */
  const MIN_FILL_MS = 3000;
  const THROTTLE_MS = 30000;
  const startedAt = Date.now();

  function spamCheck(form) {
    const trap = $('[data-trap]', form);
    if (trap && trap.value.trim() !== '') return 'trap';
    if (Date.now() - startedAt < MIN_FILL_MS) return 'tooFast';
    try {
      const last = Number(localStorage.getItem('sapsan:lastBooking') || 0);
      if (last && Date.now() - last < THROTTLE_MS) return 'throttled';
    } catch (_) { /* приватний режим — пропускаємо */ }
    return null;
  }

  /* ---------- ВІДПРАВКА ----------------------------------- */
  /**
   * Заявка йде на POST {apiBase}/bookings.
   * Якщо apiBase у js/config.js порожній — працює демо-режим:
   * payload лише друкується в консоль, сайт не падає.
   */
  function submitBooking(payload) {
    const base = (D.config && D.config.apiBase || '').replace(/\/$/, '');

    if (!base) {
      console.info('[SAP SAN] демо-режим, API не налаштовано. Payload:', payload);
      return new Promise(res => setTimeout(res, 600));
    }

    return fetch(base + '/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(() => ({}));
    });
  }

  /* Людський текст заявки — те, що адміністратор бачить у Telegram */
  function summary(p) {
    const L = [];
    L.push(p.type === 'house' ? '🏠 Заявка на будиночок' : '🌤 Заявка на шезлонги');
    if (p.type === 'house') {
      L.push('Заїзд: ' + p.checkin + ' · Виїзд: ' + p.checkout);
      const h = p.house && D ? D.house(p.house) : null;
      L.push('Будиночок: ' + (h ? h.name : 'будь-який вільний'));
    } else {
      L.push('Дата: ' + p.date);
      L.push('Шезлонгів: ' + p.sunbeds);
    }
    L.push('Гостей: ' + p.adults + ' дор.' + (Number(p.children) ? ' + ' + p.children + ' діт.' : ''));
    L.push('Імʼя: ' + p.name);
    L.push('Телефон: ' + p.phone);
    if (p.comment) L.push('Коментар: ' + p.comment);
    return L.join('\n');
  }

  function wire(formId, successId, kind) {
    const form = $(formId);
    const success = $(successId);
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(form)) return;

      const spam = spamCheck(form);
      if (spam === 'trap' || spam === 'tooFast') {
        /* Ботам показуємо той самий екран — без підказок, що саме спрацювало */
        showSuccess(form, success);
        return;
      }
      if (spam === 'throttled') {
        alert('Заявку вже надіслано. Якщо потрібно змінити деталі — зателефонуйте: ' + (S ? S.phone : ''));
        return;
      }

      const fd = new FormData(form);
      const payload = { type: kind, createdAt: new Date().toISOString(), source: 'website' };
      fd.forEach((v, k) => { if (k !== 'company') payload[k] = typeof v === 'string' ? v.trim() : v; });
      payload.summary = summary(payload);

      const btn = $('button[type="submit"]', form);
      const label = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо…'; }

      submitBooking(payload)
        .then(() => {
          try { localStorage.setItem('sapsan:lastBooking', String(Date.now())); } catch (_) {}
          showSuccess(form, success);
        })
        .catch(() => {
          if (btn) { btn.disabled = false; btn.innerHTML = label; }
          alert('Не вдалося надіслати заявку. Зателефонуйте, будь ласка: ' + (S ? S.phone : ''));
        });
    });
  }

  function showSuccess(form, success) {
    form.querySelectorAll('.field, .form__foot').forEach(n => { n.style.display = 'none'; });
    if (success) {
      success.classList.add('is-on');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  wire('#formHouse', '#successHouse', 'house');
  wire('#formSunbeds', '#successSunbeds', 'sunbeds');
  }
})();
