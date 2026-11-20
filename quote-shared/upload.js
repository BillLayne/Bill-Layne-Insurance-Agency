/* Bill Layne Insurance - shared "Have your policy handy?" upload step for the tap-through quote forms
   (renters, mobile home, motorcycle, boat). Same screen and limits as the auto and home forms.
   Load this file before the form's own script. Files are kept in memory only and are sent to /api/policy-upload
   after the quote itself is confirmed. */
window.BLIUpload = (function () {
  'use strict';
  const ICON = 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = n => `<img src="${ICON}${n}.svg" alt="" class="v2-tile-icon" width="48" height="48" onerror="this.remove()">`;
  const $ = id => document.getElementById(id);
  let files = [];        // { name, type, size, base64 }
  let failed = false;    // the quote went through but the file upload could not be confirmed

  function box() {
    return `<div class="v2-field"><label>Your declarations page</label>
      <div class="v2-upload-box">
        <div class="v2-upload-btns">
          <button type="button" class="v2-btn-navy" id="bu-file-btn">Choose files (PDF or photo)</button>
          <button type="button" class="v2-btn-outline" id="bu-cam-btn">Take a photo</button>
        </div>
        <input type="file" id="bu-file" accept="application/pdf,image/*" multiple hidden>
        <input type="file" id="bu-cam" accept="image/*" capture="environment" hidden>
        <div class="v2-upload-meta">PDF, JPG, PNG or HEIC &middot; Up to 6 files &middot; Photos are resized automatically</div>
        ${files.length ? `<ul class="hq-files">${files.map((f, i) => `<li><span>${esc(f.name)}</span><button type="button" class="v2-edit-btn" data-bu-rm="${i}">Remove</button></li>`).join('')}</ul>` : ''}
        <div id="bu-file-err" class="v2-field-err" role="alert" hidden></div>
      </div></div>`;
  }

  // The whole screen: two tiles, and the upload box once "Upload" is chosen.
  function screen(choice) {
    const showUp = choice === 'upload' || (files.length > 0 && choice !== 'questions');
    return `
        <h1 class="v2-heading">Have your policy handy?</h1>
        <p class="v2-sub">Upload your declarations page and skip most of the questions.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile ${showUp ? 'is-selected' : ''}" aria-pressed="${showUp}" id="bu-up">${icon('decpage-upload-jskmdu')}<span>Upload my declarations page</span></button>
          <button type="button" class="v2-tile ${choice === 'questions' ? 'is-selected' : ''}" aria-pressed="${choice === 'questions'}" id="bu-skip">${icon('decpage-skip-fw8c24')}<span>Keep answering questions</span></button>
        </div>
        ${showUp ? `<div class="v2-col">${box()}
          ${files.length ? `<div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="bu-next">Continue with ${files.length} file${files.length > 1 ? 's' : ''} &rarr;</button></div>` : ''}</div>` : ''}`;
  }

  const toB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
  async function shrink(file) {   // large photos are resized in the browser before upload
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size < 1.2 * 1024 * 1024) return file;
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.82));
      return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
    } catch (_) { return file; }
  }
  async function add(list, rerender) {
    let err = '';
    for (const raw of Array.from(list || [])) {
      if (files.length >= 6) { err = 'You can attach up to 6 files.'; break; }
      const f = await shrink(raw);
      if (f.size > 8 * 1024 * 1024) { err = `${raw.name} is larger than 8 MB.`; continue; }
      if (files.reduce((a, x) => a + x.size, 0) + f.size > 12 * 1024 * 1024) { err = 'Those files are too large together (12 MB limit).'; break; }
      files.push({ name: f.name, type: f.type || 'application/octet-stream', size: f.size, base64: await toB64(f) });
    }
    rerender();
    const e = $('bu-file-err'); if (e) { e.textContent = err; e.hidden = !err; }
  }

  // Called from the form's own bind(). opts: { rerender(), choose('upload' | 'questions'), next() }
  function bind(opts) {
    const on = (id, fn) => { const e = $(id); if (e) e.addEventListener('click', fn); };
    on('bu-up', () => opts.choose('upload'));
    on('bu-skip', () => opts.choose('questions'));
    on('bu-next', () => { if (files.length) opts.next(); });
    on('bu-file-btn', () => $('bu-file').click());
    on('bu-cam-btn', () => $('bu-cam').click());
    ['bu-file', 'bu-cam'].forEach(id => { const e = $(id); if (e) e.addEventListener('change', () => add(e.files, opts.rerender)); });
    document.querySelectorAll('[data-bu-rm]').forEach(b => b.addEventListener('click', () => { files.splice(Number(b.dataset.buRm), 1); opts.rerender(); }));
  }

  // meta: { name, phone, email, carrier, notes }. Resolves true when the upload service confirms receipt.
  async function send(meta) {
    if (!files.length) return true;
    try {
      const r = await fetch('/api/policy-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        formType: 'policy-upload', policyType: 'other', name: String(meta.name || '').slice(0, 150), phone: String(meta.phone || '').slice(0, 50), email: meta.email,
        currentCarrier: String(meta.carrier || '').slice(0, 150), renewalDate: '', notes: String(meta.notes || '').slice(0, 6000),
        files: files.map(f => ({ name: f.name, type: f.type, base64: f.base64 })) }) });
      const j = await r.json().catch(() => ({}));
      failed = !(r.ok && j.ok === true);
    } catch (_) { failed = true; }
    return !failed;
  }

  return {
    count: () => files.length,
    names: () => files.map(f => f.name),
    reviewLine: () => `Declarations page attached (${files.length} file${files.length > 1 ? 's' : ''}). Our team will take your coverage details from it.`,
    failNote: () => (failed ? '<div class="v2-error" role="alert">Your request went through, but we could not confirm that your file uploaded. Please text a photo of your policy to (336) 827-9065.</div>' : ''),
    screen, bind, send
  };
})();
