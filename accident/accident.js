/* Accident Helper - roadside walkthrough. Everything stays on this phone until Send. */
(function () {
  'use strict';
  var KEY = 'bli-accident-helper-v1';
  var DB = 'bli-accident-photos';
  var STEPS = 8;
  var $ = function (id) { return document.getElementById(id); };
  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var GROUPS = {
    officerCard: 'Officer card or slip', otherLicense: "Other driver's license", otherCard: "Other driver's insurance card", otherPlate: "Other driver's plate",
    yourVehicle: 'Your vehicle', otherVehicle: 'Other vehicle', plates: 'License plates', scene: 'The scene', damageClose: 'Damage close-ups',
    signs: 'Signs and signals', skid: 'Skid marks and debris', road: 'Road and weather', vin: 'VIN plate', odometer: 'Odometer', injury: 'Injuries', towReceipt: 'Tow receipt'
  };

  var state = load();
  var thumbUrls = {};
  var activeGroup = null;

  function blank() {
    return { view: 'welcome', step: 1, ref: '', hurt: '', police: {}, other: {}, witnesses: [], what: {}, car: {}, contact: {}, photos: [], sent: null };
  }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.photos) return s; } catch (e) {}
    return blank();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function get(path) { var p = path.split('.'); var o = state; for (var i = 0; i < p.length; i++) { if (o == null) return ''; o = o[p[i]]; } return o == null ? '' : o; }
  function set(path, v) { var p = path.split('.'); var o = state; for (var i = 0; i < p.length - 1; i++) { if (typeof o[p[i]] !== 'object' || o[p[i]] === null) o[p[i]] = {}; o = o[p[i]]; } o[p[p.length - 1]] = v; save(); }
  function newRef() {
    var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = '', a = new Uint8Array(4);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.floor(Math.random() * 256); });
    for (var i = 0; i < 4; i++) r += abc[a[i] % abc.length];
    return 'ACC-' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + r;
  }

  /* ---------- IndexedDB for photo blobs ---------- */
  function db() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no idb'));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('photos'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idb(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction('photos', mode), st = tx.objectStore('photos'), req = fn(st);
        tx.oncomplete = function () { res(req && req.result); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function putBlob(id, blob) { return idb('readwrite', function (s) { return s.put(blob, id); }); }
  function getBlob(id) { return idb('readonly', function (s) { return s.get(id); }); }
  function delBlob(id) { return idb('readwrite', function (s) { return s.delete(id); }); }
  function clearBlobs() { return idb('readwrite', function (s) { return s.clear(); }); }

  /* ---------- Photo capture and compression ---------- */
  function compress(file) {
    return new Promise(function (res) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        try {
          var max = 1600, w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, max / Math.max(w, h));
          var c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (b) { URL.revokeObjectURL(url); res(b || file); }, 'image/jpeg', 0.82);
        } catch (e) { URL.revokeObjectURL(url); res(file); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); res(file); };
      img.src = url;
    });
  }
  function addPhotos(files, group) {
    var list = Array.prototype.slice.call(files || []);
    if (!list.length) return Promise.resolve();
    status('Saving ' + list.length + ' photo' + (list.length > 1 ? 's' : '') + ' on this phone…');
    return list.reduce(function (p, f) {
      return p.then(function () {
        return compress(f).then(function (blob) {
          var id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          return putBlob(id, blob).then(function () {
            state.photos.push({ id: id, group: group, name: f.name || 'photo.jpg', type: blob.type || 'image/jpeg', size: blob.size, at: new Date().toISOString() });
            save();
          });
        });
      });
    }, Promise.resolve()).then(function () { status(''); renderPhotos(); if (!$('photo-dialog').open) openGallery(group); }, function () { status('Could not save that photo. Try again or keep it in your camera roll.'); });
  }
  function status(t) { var el = $('send-status'); if (el && !$('view-steps').hidden && state.step !== 8) { el.textContent = ''; } var n = $('saved-note'); if (n && t) { n.lastChild.textContent = t; } else if (n) { n.lastChild.textContent = 'Progress saved on this phone.'; } }
  function thumb(id) {
    if (thumbUrls[id]) return Promise.resolve(thumbUrls[id]);
    return getBlob(id).then(function (b) { if (!b) return ''; thumbUrls[id] = URL.createObjectURL(b); return thumbUrls[id]; });
  }
  function photosIn(group) { return state.photos.filter(function (p) { return p.group === group; }); }

  function renderPhotos() {
    qsa('.ah-photo-row').forEach(function (row) {
      var g = row.dataset.photo, ps = photosIn(g), has = ps.length > 0;
      row.dataset.has = has ? '1' : '0';
      row.setAttribute('aria-label', row.dataset.label + ': ' + (has ? ps.length + ' photos added, open' : 'add photos'));
      row.innerHTML = '<span class="ah-row-icon"><svg class="ah-icon"><use href="#' + (has ? 'i-check' : 'i-camera') + '"/></svg></span>' +
        '<span class="ah-row-text"><strong>' + row.dataset.label + '</strong><small>' + (has ? ps.length + ' photo' + (ps.length > 1 ? 's' : '') + ' added' : row.dataset.sub) + '</small></span>' +
        '<span class="ah-row-action"><svg class="ah-icon"><use href="#' + (has ? 'i-chev' : 'i-plus') + '"/></svg></span>' +
        '<span class="ah-thumbs"></span>';
      if (has) {
        var box = qs('.ah-thumbs', row), shown = ps.slice(0, 4);
        shown.forEach(function (p) { var img = document.createElement('img'); img.className = 'ah-thumb'; img.alt = ''; thumb(p.id).then(function (u) { img.src = u; }); box.appendChild(img); });
        if (ps.length > 4) { var m = document.createElement('span'); m.className = 'ah-thumb-more'; m.textContent = '+' + (ps.length - 4); box.appendChild(m); }
      }
    });
    qsa('.ah-tile').forEach(function (t) { var n = photosIn(t.dataset.photo).length; t.dataset.has = n ? '1' : '0'; qs('.ah-tile-count', t).textContent = n ? n + ' added' : ''; });
    var total = state.photos.length, rc = $('review-photo-count'); if (rc) rc.textContent = total ? total + ' photo' + (total > 1 ? 's' : '') + ' on this phone' : 'none yet';
  }
  function openGallery(group) {
    activeGroup = group;
    var dlg = $('photo-dialog'), grid = $('photo-dialog-grid'), ps = photosIn(group);
    $('photo-dialog-title').textContent = GROUPS[group] || 'Photos';
    grid.innerHTML = '';
    if (!ps.length) { var p = document.createElement('p'); p.textContent = 'No photos yet. Take one or choose from your gallery.'; grid.appendChild(p); }
    ps.forEach(function (p) {
      var f = document.createElement('figure'), img = document.createElement('img'), b = document.createElement('button');
      img.alt = GROUPS[group] + ' photo'; thumb(p.id).then(function (u) { img.src = u; });
      b.type = 'button'; b.setAttribute('aria-label', 'Remove this photo'); b.textContent = '×';
      b.onclick = function () { delBlob(p.id); state.photos = state.photos.filter(function (x) { return x.id !== p.id; }); save(); renderPhotos(); openGallery(group); };
      f.appendChild(img); f.appendChild(b); grid.appendChild(f);
    });
    if (!dlg.open) dlg.showModal();
  }
  function pick(capture) { var inp = $('photo-input'); if (capture) inp.setAttribute('capture', 'environment'); else inp.removeAttribute('capture'); inp.value = ''; inp.click(); }

  /* ---------- Views and steps ---------- */
  function showView(v) {
    state.view = v; save();
    qsa('.ah-view').forEach(function (el) { el.hidden = el.dataset.view !== v; });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function showStep(n) {
    n = Math.max(1, Math.min(STEPS, n)); state.step = n; save();
    if (!state.ref) { state.ref = newRef(); save(); }
    if (n === 6) { if (!get('what.date')) set('what.date', new Date().toISOString().slice(0, 10)); if (!get('what.time')) { var d = new Date(); set('what.time', ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)); } }
    qsa('.ah-step').forEach(function (el) { el.hidden = Number(el.dataset.step) !== n; });
    $('step-num').textContent = n;
    var bar = qs('.ah-progress'); bar.setAttribute('aria-valuenow', n); $('progress-fill').style.width = (n / STEPS * 100) + '%';
    $('btn-next').innerHTML = (n === STEPS - 1 ? 'Review &amp; send' : 'Continue') + ' <span aria-hidden="true">&rarr;</span>';
    qs('.ah-nav').dataset.last = n === STEPS ? '1' : '0';
    $('btn-skip').hidden = n === 1 || n === STEPS;
    fill(); renderPhotos(); if (n === 5) renderWitnesses(); if (n === STEPS) renderReview();
    showView('steps');
    var h = qs('.ah-step[data-step="' + n + '"] h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  function fill() {
    qsa('[data-field]').forEach(function (el) {
      var v = get(el.dataset.field);
      if (el.classList.contains('ah-chip')) el.setAttribute('aria-pressed', v === el.dataset.value ? 'true' : 'false');
      else if (el.value !== v) el.value = v;
    });
    qsa('[data-show]').forEach(function (el) { var p = el.dataset.show.split(':'); el.hidden = get(p[0]) !== p[1]; });
  }
  function renderWitnesses() {
    var box = $('witness-list'); box.innerHTML = '';
    state.witnesses.forEach(function (w, i) {
      var d = document.createElement('div'); d.className = 'ah-witness';
      d.innerHTML = '<div class="ah-witness-head"><span>Person ' + (i + 1) + '</span><button type="button" data-remove="' + i + '">Remove</button></div>' +
        '<label class="ah-field"><span>Name</span><input type="text" data-w="name" data-i="' + i + '" autocomplete="off"></label>' +
        '<label class="ah-field"><span>Phone</span><input type="tel" inputmode="tel" data-w="phone" data-i="' + i + '" autocomplete="off"></label>' +
        '<label class="ah-field"><span>Witness or passenger? What did they see?</span><textarea rows="3" data-w="saw" data-i="' + i + '"></textarea></label>';
      qsa('[data-w]', d).forEach(function (inp) { inp.value = w[inp.dataset.w] || ''; inp.addEventListener('input', function () { state.witnesses[i][inp.dataset.w] = inp.value; save(); }); });
      qs('[data-remove]', d).onclick = function () { state.witnesses.splice(i, 1); save(); renderWitnesses(); };
      box.appendChild(d);
    });
  }
  function renderReview() {
    var driver = ['name', 'phone', 'insurer', 'policy', 'plate', 'vehicle'].some(function (k) { return get('other.' + k); }) || photosIn('otherLicense').length || photosIn('otherCard').length;
    var st = { driver: driver, photos: state.photos.length > 0, notes: !!get('what.notes') };
    qsa('.ah-status').forEach(function (el) { el.dataset.empty = st[el.dataset.status] ? '0' : '1'; });
    $('btn-send').disabled = !$('consent').checked;
    $('btn-mailto').href = 'mailto:Save@BillLayneInsurance.com?subject=' + encodeURIComponent('Accident report ' + state.ref) + '&body=' + encodeURIComponent(summary());
  }

  /* ---------- Summary and sending ---------- */
  function line(label, v) { return v ? label + ': ' + v + '\n' : ''; }
  function summary() {
    var s = 'ACCIDENT REPORT ' + state.ref + '\nSent from the Accident Helper at billlayneinsurance.com/accident\nPrepared ' + new Date().toLocaleString('en-US') + '\n\n';
    s += 'YOUR CONTACT\n' + line('Name', get('contact.name')) + line('Phone', get('contact.phone')) + line('Email', get('contact.email')) + line('Bill Layne customer', get('contact.customer')) + line('Insurance company', get('contact.insurer')) + '\n';
    s += 'SAFETY\n' + line('Anyone hurt', get('hurt')) + line('You or a passenger hurt', get('car.injured')) + line('Injury notes', get('car.injuryNotes')) + '\n';
    s += 'POLICE\n' + line('Agency', get('police.agency')) + line('Officer', get('police.officer')) + line('Report number', get('police.report')) + '\n';
    s += 'OTHER DRIVER\n' + line('Name', get('other.name')) + line('Phone', get('other.phone')) + line('Insurance', get('other.insurer')) + line('Policy', get('other.policy')) + line('Plate', get('other.plate')) + line('Vehicle', get('other.vehicle')) + line('Others involved', get('other.more')) + '\n';
    s += 'WHAT HAPPENED\n' + line('Date', get('what.date')) + line('Time', get('what.time')) + line('Location', get('what.location')) + line('Map', get('what.map')) + line('Weather and road', get('what.weather')) + line('In their words', get('what.notes')) + '\n';
    s += 'YOUR CAR\n' + line('Drivable', get('car.drivable')) + line('Towed', get('car.towed')) + line('Tow company', get('car.towCo')) + line('Tow phone', get('car.towPhone')) + line('Taken to', get('car.towTo')) + line('Car is now', get('car.where')) + '\n';
    if (state.witnesses.length) { s += 'WITNESSES AND PASSENGERS\n'; state.witnesses.forEach(function (w, i) { s += (i + 1) + '. ' + [w.name, w.phone, w.saw].filter(Boolean).join(' - ') + '\n'; }); s += '\n'; }
    var counts = {}; state.photos.forEach(function (p) { counts[p.group] = (counts[p.group] || 0) + 1; });
    s += 'PHOTOS (' + state.photos.length + ')\n'; Object.keys(counts).forEach(function (g) { s += '- ' + (GROUPS[g] || g) + ': ' + counts[g] + '\n'; });
    s += '\nThis report does not open a claim. The insurance company opens the claim.\n';
    return s;
  }
  function toBase64(blob) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.onerror = rej; r.readAsDataURL(blob); }); }
  var sending = false;
  function overlay(title, text, done) {
    var d = $('send-overlay'); $('send-overlay-title').textContent = title; $('send-overlay-text').textContent = text;
    $('send-overlay-spinner').hidden = !!done; $('send-overlay-check').hidden = !done;
    if (!d.open) d.showModal();
  }
  function overlayClose() { var d = $('send-overlay'); if (d.open) d.close(); }
  $('send-overlay').addEventListener('cancel', function (e) { if (sending) e.preventDefault(); });
  window.addEventListener('beforeunload', function (e) { if (sending) { e.preventDefault(); e.returnValue = ''; } });
  function send() {
    var btn = $('btn-send'), st = $('send-status'); btn.disabled = true; $('send-fallback').hidden = true;
    sending = true; overlay('Sending your report…', 'Please keep this page open until you see the confirmation.');
    var photos = state.photos.slice(), batches = []; while (photos.length) batches.push(photos.splice(0, 5));
    if (!batches.length) batches.push([]);
    st.textContent = 'Sending…';
    var i = 0;
    function next() {
      if (i >= batches.length) {
        state.sent = new Date().toISOString(); save(); $('done-ref').textContent = state.ref; sending = false;
        overlay('Sent. We have it.', 'Your reference number is ' + state.ref + '.', true);
        setTimeout(function () { overlayClose(); showView('done'); }, 900); return;
      }
      var batch = batches[i];
      st.textContent = batches.length > 1 ? 'Sending part ' + (i + 1) + ' of ' + batches.length + '…' : 'Sending…';
      overlay(batches.length > 1 ? 'Sending part ' + (i + 1) + ' of ' + batches.length + '…' : 'Sending your report…', 'Please keep this page open until you see the confirmation.');
      Promise.all(batch.map(function (p) { return getBlob(p.id).then(function (b) { return toBase64(b).then(function (b64) { return { name: state.ref + '-' + p.group + '-' + p.id + '.jpg', type: p.type, base64: b64 }; }); }); }))
        .then(function (files) {
          return fetch('/api/accident-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
            formType: 'accident-report', ref: state.ref, part: i + 1, parts: batches.length,
            name: get('contact.name'), phone: get('contact.phone'), email: get('contact.email'), customer: get('contact.customer'), insurer: get('contact.insurer'),
            hurt: get('hurt'), drivable: get('car.drivable'), county: get('what.location'), summary: i === 0 ? summary() : '', files: files, source: 'accident-helper'
          }) });
        })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error('unconfirmed'); }); })
        .then(function () { i++; next(); })
        .catch(function () { sending = false; overlayClose(); st.textContent = ''; $('send-fallback').hidden = false; btn.disabled = false; $('send-fallback').scrollIntoView({ block: 'center' }); });
    }
    next();
  }

  /* ---------- Wire up ---------- */
  function go(n) { showStep(n); }
  $('btn-start').onclick = function () { if (!state.ref) state.ref = newRef(); showStep(state.sent ? 1 : (state.step || 1)); };
  $('btn-resume').onclick = function () { showStep(state.step || 1); };
  $('btn-restart').onclick = function () { if (confirm('Start a new report? This removes the saved report and photos from this phone.')) { reset(); } };
  $('btn-back').onclick = function () { if (state.step <= 1) showView('welcome'); else go(state.step - 1); };
  $('btn-next').onclick = function () { go(state.step + 1); };
  $('btn-skip').onclick = function () { go(state.step + 1); };
  qsa('.ah-edit').forEach(function (b) { b.onclick = function () { go(Number(b.dataset.goto)); }; });
  qsa('.ah-chip').forEach(function (c) { c.onclick = function () { set(c.dataset.field, c.dataset.value); fill(); }; });
  qsa('input[data-field],textarea[data-field]').forEach(function (el) { el.addEventListener('input', function () { set(el.dataset.field, el.value); if (state.step === STEPS) renderReview(); }); });
  qsa('[data-photo]').forEach(function (el) { el.addEventListener('click', function () { var g = el.dataset.photo; if (photosIn(g).length) openGallery(g); else { activeGroup = g; pick(true); } }); });
  $('photo-input').addEventListener('change', function () { addPhotos(this.files, activeGroup); });
  $('photo-dialog-add').onclick = function () { pick(true); };
  $('photo-dialog-gallery').onclick = function () { pick(false); };
  $('photo-dialog-close').onclick = function () { $('photo-dialog').close(); };
  $('btn-add-witness').onclick = function () { state.witnesses.push({ name: '', phone: '', saw: '' }); save(); renderWitnesses(); var last = qsa('#witness-list input')[(state.witnesses.length - 1) * 2]; if (last) last.focus(); };
  $('btn-locate').onclick = function () {
    var note = $('locate-note');
    if (!navigator.geolocation) { note.textContent = 'Location is not available on this phone. Type the road and nearest cross street.'; return; }
    note.textContent = 'Finding your location…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude.toFixed(5), lng = pos.coords.longitude.toFixed(5), map = 'https://www.google.com/maps?q=' + lat + ',' + lng;
      set('what.map', map); set('what.coords', lat + ', ' + lng);
      note.innerHTML = 'Location saved (' + lat + ', ' + lng + '). <a href="' + map + '" target="_blank" rel="noopener">Open in Maps</a>. Add the road name above so we can find it quickly.';
    }, function () { note.textContent = 'We could not get your location. Type the road and nearest cross street instead.'; }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };
  $('consent').addEventListener('change', renderReview);
  $('btn-send').onclick = send;
  $('btn-retry').onclick = send;
  $('btn-save-copy').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([summary()], { type: 'text/plain' })); a.download = state.ref + '-accident-report.txt'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 30000); };
  $('btn-clear').onclick = function () { if (confirm('Remove this report and its photos from this phone?')) reset(); };
  function reset() { clearBlobs().catch(function () {}); Object.keys(thumbUrls).forEach(function (k) { URL.revokeObjectURL(thumbUrls[k]); }); thumbUrls = {}; state = blank(); save(); fill(); renderPhotos(); $('consent').checked = false; $('resume-note').hidden = true; showView('welcome'); }

  /* ---------- Boot ---------- */
  var hasProgress = state.step > 1 || state.photos.length || Object.keys(state.other || {}).length || get('what.notes');
  if (state.sent) { $('done-ref').textContent = state.ref; showView('done'); }
  else { fill(); renderPhotos(); $('resume-note').hidden = !hasProgress; showView('welcome'); }
})();
