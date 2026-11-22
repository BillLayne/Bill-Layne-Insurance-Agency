/* Bill Layne Insurance - address suggestions for the tap-through quote forms.
   As the customer types a street address, matching North Carolina addresses are offered; one tap fills street, city and ZIP.
   Source: the State of North Carolina's public address service (NC OneMap, AddressNC). No account and no key.
   If the service is slow or down nothing is shown and typing by hand works exactly as before.
   Load this file after the form's own script. It finds the fields by id, so the form code needs no changes. */
(function () {
  'use strict';
  const SERVICE = 'https://services.nconemap.gov/secure/rest/services/AddressNC/AddressNC_geocoder/GeocodeServer/suggest';
  const STREET_IDS = ['property_address', 'street_address', 'address'];
  const $ = id => document.getElementById(id);
  let box = null, forInput = null, timer = 0, seq = 0, items = [], active = -1, lastPicked = '';

  const KEEP_UPPER = /^(NC|NE|NW|SE|SW|US|PO|II|III|IV)$/;
  const title = s => String(s || '').toLowerCase().split(' ').map(w => {
    if (!w) return w;
    if (KEEP_UPPER.test(w.toUpperCase())) return w.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');

  function parse(text) {   // "352 HOWARDS BRIDGE ROAD, UNION GROVE, NC, 28689"
    const parts = String(text || '').split(',').map(p => p.trim()).filter(Boolean);
    const zip = parts.find(p => /^\d{5}$/.test(p)) || '';
    return { street: title(parts[0] || ''), city: title(parts[1] || ''), zip };
  }

  function style() {
    if ($('bli-addr-style')) return;
    const st = document.createElement('style'); st.id = 'bli-addr-style';
    st.textContent = '.bli-addr-wrap{position:relative}' +
      '.bli-addr-list{position:absolute;left:0;right:0;top:100%;z-index:40;margin:4px 0 0;padding:4px;list-style:none;background:#fff;border:1.5px solid #8696ab;border-radius:14px;box-shadow:0 10px 28px rgba(5,32,61,.18);max-height:320px;overflow:auto;text-align:left}' +
      '.bli-addr-item{display:block;width:100%;min-height:48px;padding:9px 12px;border:0;border-radius:10px;background:#fff;color:#05203d;font:inherit;font-size:16px;font-weight:700;line-height:1.25;text-align:left;cursor:pointer}' +
      '.bli-addr-item small{display:block;font-size:13.5px;font-weight:600;color:#475569;margin-top:1px}' +
      '.bli-addr-item:hover,.bli-addr-item.is-active{background:#fff7df}' +
      '.bli-addr-note{padding:6px 12px 4px;font-size:12px;font-weight:600;color:#64748b}';
    document.head.appendChild(st);
  }

  function close() {
    if (box && box.parentNode) box.parentNode.removeChild(box);
    box = null; items = []; active = -1;
    if (forInput) forInput.setAttribute('aria-expanded', 'false');
  }

  function fill(id, value) {
    const el = $(id); if (!el || !value) return;
    el.value = value; el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function pick(i) {
    const it = items[i]; const input = forInput; if (!it || !input) return;
    const a = parse(it.text);
    lastPicked = a.street;
    close();
    input.value = a.street; input.dispatchEvent(new Event('input', { bubbles: true }));
    fill('city', a.city); fill('zip_code', a.zip);
    const next = !a.city ? $('city') : !a.zip ? $('zip_code') : null;   // finish whatever the record did not have
    if (next) next.focus(); else input.blur();
  }

  function show(input, list) {
    close(); if (!list.length || document.activeElement !== input) return;
    style();
    const holder = input.parentElement; if (!holder) return;
    holder.classList.add('bli-addr-wrap');
    items = list; forInput = input;
    box = document.createElement('ul'); box.className = 'bli-addr-list'; box.setAttribute('role', 'listbox'); box.id = 'bli-addr-list';
    list.forEach((it, i) => {
      const a = parse(it.text);
      const li = document.createElement('li'); li.setAttribute('role', 'presentation');
      const b = document.createElement('button'); b.type = 'button'; b.className = 'bli-addr-item'; b.setAttribute('role', 'option');
      b.appendChild(document.createTextNode(a.street));
      const sm = document.createElement('small'); sm.textContent = [a.city, 'NC', a.zip].filter(Boolean).join(', ').replace(', NC, ', ', NC '); b.appendChild(sm);
      // mousedown/touchstart fire before the field loses focus, so the tap is not lost
      b.addEventListener('mousedown', e => { e.preventDefault(); });
      b.addEventListener('click', () => pick(i));
      li.appendChild(b); box.appendChild(li);
    });
    const note = document.createElement('li'); note.className = 'bli-addr-note'; note.textContent = 'Tap your address, or keep typing.'; box.appendChild(note);
    holder.appendChild(box);
    input.setAttribute('aria-expanded', 'true'); input.setAttribute('aria-controls', 'bli-addr-list');
  }

  function lookup(input) {
    const q = input.value.trim();
    // wait for a house number and the start of a street name; skip right after a pick
    if (!/^\d+[A-Za-z]?\s+\S{3,}/.test(q) || q === lastPicked) { close(); return; }
    const mine = ++seq;
    const ctl = window.AbortController ? new AbortController() : null;
    const t = setTimeout(() => { if (ctl) ctl.abort(); }, 4000);
    fetch(SERVICE + '?f=json&maxSuggestions=5&text=' + encodeURIComponent(q), ctl ? { signal: ctl.signal } : undefined)
      .then(r => (r.ok ? r.json() : null))
      .then(j => { clearTimeout(t); if (mine !== seq || !j || !Array.isArray(j.suggestions)) return; show(input, j.suggestions.filter(s => s && s.text && !s.isCollection).slice(0, 5)); })
      .catch(() => { clearTimeout(t); });
  }

  document.addEventListener('input', e => {
    const el = e.target; if (!el || STREET_IDS.indexOf(el.id) === -1 || !e.isTrusted) return;
    lastPicked = '';
    clearTimeout(timer); timer = setTimeout(() => lookup(el), 230);
  });
  document.addEventListener('keydown', e => {
    if (!box || e.target !== forInput) return;
    const btns = box.querySelectorAll('.bli-addr-item');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length;
      btns.forEach((b, i) => b.classList.toggle('is-active', i === active));
    } else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(active); }
    else if (e.key === 'Escape') close();
  });
  document.addEventListener('focusout', e => { if (e.target === forInput) setTimeout(() => { if (document.activeElement !== forInput) close(); }, 150); });
})();
