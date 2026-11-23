/* Bill Layne Insurance - Renters Quote V2 (tap-through). Same look and rules as /auto-quote-app/ and /home-quote-app/.
   A live page sets window.BLI_RQ_MODE = 'live' before loading this file; the private test page leaves it unset.
   Every value sent matches what the office script (validateRenters_) accepts today. */
(function () {
  'use strict';

  const LIVE = window.BLI_RQ_MODE === 'live';
  const TP = LIVE ? '' : '[TEST RENT V2] ';
  const STORAGE_KEY = LIVE ? 'bli_renters_quote_session' : 'bli_renters_v2_test_session';
  const params = new URLSearchParams(window.location.search);
  const srcParam = /^[a-z0-9_-]{1,80}$/i.test(params.get('src') || '') ? params.get('src') : '';
  const ctaSource = LIVE ? (srcParam || 'renters_quote') : 'renters_v2_test';

  const ICON_BASE = 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-';
  const ICONS = { homeYes: 'home-yes-45j7s3', yes: 'insured-yes-8pg2wf', no: 'insured-no-mk4ws4', advise: 'coverage-not-sure-jmye8d', confirm: 'confirm-dbnygk', full: 'coverage-full-g66cfp' };
  const icon = n => `<img src="${ICON_BASE}${ICONS[n]}.svg" alt="" class="v2-tile-icon" width="48" height="48" onerror="this.remove()">`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Stored values = exactly the choices the office script accepts.
  const RENTAL_TYPES = [['Apartment', 'Apartment'], ['House', 'House'], ['Condo / other', 'Condo, townhome or other']];
  // Line drawings on the rental-type tiles and on the "auto quote too?" Yes / No tiles, in the same style as the home form's drawings.
  const RQ_ART_ON = true;   // live since 2026-11-23 (approved by Bill)
  const RQ_ART = {
    'Apartment': '<path d="M32 9h32v29H32z"/><path d="M29 9h38"/><path d="M36.500 13h5v4h-5zM45.500 13h5v4h-5zM54.500 13h5v4h-5zM36.500 20.500h5v4h-5zM45.500 20.500h5v4h-5zM54.500 20.500h5v4h-5zM36.500 28h5v4h-5zM54.500 28h5v4h-5zM45 30h6v8h-6z"/>',
    'House': '<path d="M32 22h32v16H32z"/><path d="M28 22.500L48 10l20 12.500"/><path d="M58 16.500V11h4v8"/><path d="M45 28h6v10h-6zM36 26h5v5h-5zM55 26h5v5h-5z"/>',
    'Condo / other': '<path d="M18 20v18h60V20"/><path d="M16 21.500L28 12l10 8 10-8 10 8 10-8 12 9.500"/><path d="M38 20v18M58 20v18"/><path d="M25.500 30h5v8h-5zM45.500 30h5v8h-5zM65.500 30h5v8h-5zM25.500 22.500h5v4h-5zM45.500 22.500h5v4h-5zM65.500 22.500h5v4h-5z"/>'
  };
  const RQ_CAR = '<path d="M21 34v-5.500c0-1.800 1.200-3 3-3.400l8.500-1.600 7-8h18.500l7.500 8 6.500 1.600c1.800.400 3 1.600 3 3.400V34"/><path d="M21 34h8M39 34h19M68 34h7"/><circle cx="34" cy="34" r="4.500"/><circle cx="63" cy="34" r="4.500"/><path d="M37.500 23.500l5-5.500h14.500l5 5.500zM50 18v5.500"/>';
  const RQ_BUNDLE_ART = { yes: RQ_CAR, no: `<g opacity=".38">${RQ_CAR}</g><path d="M28 43L68 6" stroke-width="2.600"/>` };
  const rqSvg = art => `<svg viewBox="0 0 96 48" width="96" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;color:#05203d;max-width:100%;height:auto">${art}<path d="M4 40H92" stroke="#8696ab" stroke-width="1.6"/></svg>`;
  const RQ_ART_STYLE = 'flex-direction:column;justify-content:flex-start;gap:2px;padding:8px 6px 9px';
  const BELONGINGS = [['$30,000', '$30,000'], ['$50,000', '$50,000'], ['$75,000', '$75,000'], ['$100,000 or more', '$100,000 or more']];
  const LIABILITY = [['$100,000', '$100,000'], ['$300,000', '$300,000'], ['$500,000', '$500,000'], ['Match my lease requirements', 'Match my lease']];
  const HELP_ME = 'Help me decide';

  const HELP = {
    belongings: { title: 'Coverage for your belongings', body: 'May pay to repair or replace your things, such as furniture, clothes and electronics, after a covered loss like a fire or theft. Your landlord’s insurance covers the building, not what you own.',
      example: 'A kitchen fire in the unit next door fills your apartment with smoke and ruins your couch, bedding and clothes.' },
    liability: { title: 'Liability coverage', body: 'May pay if you are legally responsible for injuring someone or damaging someone else’s property, including damage you cause to the place you rent.',
      example: 'You leave a pan on the stove and the fire damages the kitchen. The landlord’s insurer asks you to pay for the repairs.' },
    landlord: { title: 'Why we ask about your lease', body: 'Many leases require renters insurance, often with a set liability amount and the landlord listed on the policy. Knowing that up front lets our team quote what your lease asks for.',
      example: 'Your lease says: “Tenant must carry $100,000 liability and list the property manager as an interested party.”' }
  };

  // Insurer logo tiles: same list and logos as the auto and home forms.
  const LOGOS_URL = (function () { try { return new URL('../auto-quote-app/logos.json', document.currentScript.src).href; } catch (_) { return '../auto-quote-app/logos.json'; } })();
  const NOT_RENTERS = ['The General', 'Direct Auto'];
  const IL = 'https://img.billlayneinsurance.com/i/2026/11/';
  let insurers = [['State Farm', 'state-farm-insurance-logo-c4hm2m.png'], ['Allstate', 'allstate-insurance-logo-nq7c5z.png'], ['Nationwide', 'nationwide-insurance-logo-j5zp2s.png'],
    ['Progressive', 'progressive-insurance-logo-2kcvze.png'], ['GEICO', 'geico-insurance-logo-s92zrs.png'], ['Liberty Mutual', 'liberty-mutual-insurance-logo-ffrtts.png']]
    .map(([name, f]) => ({ name, logo: IL + f, showLabel: false }));
  let otherCarrierOpen = false;
  function logoTile(c, selected) {
    const safe = esc(c.name);
    const inner = c.logo
      ? `<span class="v2-logo-frame"><img src="${esc(c.logo)}" alt="${safe}" width="132" height="60" class="is-carrier-logo" onerror="this.parentElement.innerHTML='<span class=\\'v2-logo-text\\'>${safe}</span>'"></span>${c.showLabel ? `<span class="v2-logo-label">${safe}</span>` : ''}`
      : `<span class="v2-logo-frame"><span class="v2-logo-text">${safe}</span></span>`;
    return `<button type="button" class="v2-tile logo-tile ${c.logo && c.showLabel ? 'has-label' : ''} ${selected ? 'is-selected' : ''}" aria-label="${safe}" aria-pressed="${selected}" data-carrier="${safe}">${inner}</button>`;
  }

  // ---------- State ----------
  const blank = () => ({ rental_type: '', property_address: '', unit: '', city: '', zip_code: '', effective_date: '', start_choice: '',
    current_insurance: '', current_carrier: '', previous_claims: '', claims_details: '',
    firstname: '', lastname: '', phone: '', email: '', date_of_birth: '',
    personal_property: '', liability: '', landlord_requirement: '', lease_details: '', bundle_auto: '', additional_notes: '' });
  let state = blank(), stepId = 'rtype', history = ['rtype'];
  let sending = false, sendError = '', confirmation = '', contactDone = false, submitted = false, formStarted = false, editReturn = null;
  let helpEl = null, sheetEl = null;

  function save() { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state, stepId, history, contactDone, t: Date.now() })); } catch (_) {} }
  function restore() {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (raw && raw.state && raw.stepId && raw.stepId !== 'done') { state = Object.assign(blank(), raw.state); stepId = raw.stepId; history = raw.history || [stepId]; contactDone = !!raw.contactDone; }
    } catch (_) {}
    try {   // contact details carried over from a finished auto or home quote, in this browser tab only
      const c = JSON.parse(sessionStorage.getItem('bli_carry_contact') || 'null');
      if (c && !state.firstname && !state.email) ['firstname', 'lastname', 'phone', 'email', 'date_of_birth'].forEach(k => { if (c[k]) state[k] = c[k]; });
    } catch (_) {}
    try { const z = params.get('zip'); if (z && /^[0-9]{5}$/.test(z) && !state.zip_code) state.zip_code = z; } catch (_) {}
  }

  function track(name, detail) {
    const base = LIVE ? { cta_source: ctaSource, form_name: 'renters_quote', service_line: 'renters', step_id: stepId }
      : { traffic_type: 'internal', cta_source: 'renters_v2_test', form_name: 'renters_quote_v2_test', step_id: stepId };
    if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign(base, detail || {}));
  }
  function fireFormStart() {
    if (formStarted) return; formStarted = true;
    if (LIVE && typeof window.gtag === 'function') window.gtag('event', 'form_start', { form_type: 'renters_insurance', form_name: 'renters_quote', cta_source: ctaSource });
  }

  // ---------- Flow ----------
  // The auto form's upload-or-continue step (shared file /quote-shared/upload.js): two tiles, and an upload skips the coverage questions.
  // Live since 2026-11-20 (approved by Bill).
  const UP = window.BLIUpload || null;
  const HANDY_ON = !!UP;
  const usedDec = () => HANDY_ON && !!state.used_dec && state.current_insurance === 'Yes';
  const decNote = () => (usedDec() ? 'DECLARATIONS PAGE UPLOADED - the customer chose to skip the coverage questions. Take the coverage details from the attached page or ask.\n' : '');
  function decFilesLost() {   // attached files live in memory only; after a reload the skipped questions come back
    if (!(HANDY_ON && state.used_dec) || UP.count()) return false;
    state.used_dec = false; state.dec_choice = ''; save(); return true;
  }
  function sequence() {
    const seq = ['rtype', 'address', 'start', 'insured'];
    if (state.current_insurance === 'Yes') { seq.push('carrier'); if (HANDY_ON) seq.push('handy'); }
    if (usedDec()) { seq.push('contact', 'extras', 'review', 'done'); return seq; }   // the declarations page answers the rest
    seq.push('claims', 'contact', 'belongings', 'liability', 'landlord', 'extras', 'review', 'done');
    return seq;
  }
  const EYEBROW = { handy: 'CURRENT COVERAGE', rtype: 'YOUR RENTAL', address: 'YOUR RENTAL', start: 'YOUR RENTAL', insured: 'CURRENT COVERAGE', carrier: 'CURRENT COVERAGE', claims: 'CLAIMS',
    contact: 'ABOUT YOU', belongings: 'YOUR COVERAGE', liability: 'YOUR COVERAGE', landlord: 'YOUR LEASE', extras: 'ALMOST DONE', review: 'REVIEW', done: 'QUOTE RECEIVED' };

  function go(id) { stepId = id; history.push(id); enter(); }
  function next() {
    const seq = sequence();
    if (editReturn && seq.includes(editReturn) && editReturn !== stepId) { const t = editReturn; editReturn = null; go(t); return; }
    editReturn = null;
    go(seq[Math.min(seq.indexOf(stepId) + 1, seq.length - 1)]);
  }
  function back() { if (history.length < 2) return; history.pop(); stepId = history[history.length - 1]; enter(true); }
  function enter(fromBack) {
    save();
    if (!fromBack) { try { window.history.pushState({ rq: stepId }, ''); } catch (_) {} }
    track('renters_v2_step_view'); render(true); window.scrollTo(0, 0);
  }
  function pick(btn, fn) {
    if (btn) { btn.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); btn.classList.add('is-selected'); }
    fn(); save(); track('renters_v2_step_complete'); fireFormStart(); setTimeout(next, 230);
  }

  // ---------- Small builders ----------
  const helpBtn = key => `<button type="button" class="v2-help-btn" data-help="${key}" aria-label="What is ${esc(HELP[key].title)}?">?</button>`;
  const tiles = (attr, list, current, cols, compact) => `<div class="v2-grid-${cols}">${list.map(([v, t, ic]) =>
    `<button type="button" class="v2-tile ${compact ? 'compact' : ''} ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-${attr}="${esc(v)}">${ic ? icon(ic) : ''}<span>${esc(t)}</span></button>`).join('')}</div>`;
  const decideTile = (attr, current) => `<div class="v2-grid-2 hq-decide" style="grid-template-columns:1fr">
      <button type="button" class="v2-tile compact ${current === HELP_ME ? 'is-selected' : ''}" data-${attr}="${HELP_ME}">Not sure, help me decide</button></div>`;
  // Date boxes jump ahead on their own: month -> day -> year, and Backspace in an empty box goes back one.
  // A month that starts 2-9 or a day that starts 4-9 can only be one digit, so it is padded and the cursor moves on.
  document.addEventListener('input', e => {
    const el = e.target; if (!el || !el.classList || !el.classList.contains('v2-date-part')) return;
    const m = /^(.*)-(mm|dd)$/.exec(el.id || ''); el.value = el.value.replace(/\D/g, ''); if (!m) return;
    if (el.value.length === 1 && Number(el.value) > (m[2] === 'mm' ? 1 : 3)) el.value = '0' + el.value;
    if (el.value.length >= 2) { const nx = document.getElementById(m[1] + '-' + (m[2] === 'mm' ? 'dd' : 'yyyy')); if (nx) { nx.focus(); if (nx.select) nx.select(); } }
  });
  document.addEventListener('keydown', e => {
    const el = e.target; if (e.key !== 'Backspace' || !el || !el.classList || !el.classList.contains('v2-date-part') || el.value) return;
    const m = /^(.*)-(dd|yyyy)$/.exec(el.id || ''); if (!m) return;
    const pv = document.getElementById(m[1] + '-' + (m[2] === 'dd' ? 'mm' : 'dd')); if (pv) { e.preventDefault(); pv.focus(); }
  });
  function dateBoxes(prefix, iso, aria) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '') || [];
    return `<div class="v2-date-group">
      <input id="${prefix}-mm" class="v2-input v2-date-part" type="text" inputmode="numeric" maxlength="2" placeholder="MM" aria-label="${aria} month" value="${m[2] || ''}">
      <span class="v2-date-sep" aria-hidden="true">/</span>
      <input id="${prefix}-dd" class="v2-input v2-date-part" type="text" inputmode="numeric" maxlength="2" placeholder="DD" aria-label="${aria} day" value="${m[3] || ''}">
      <span class="v2-date-sep" aria-hidden="true">/</span>
      <input id="${prefix}-yyyy" class="v2-input v2-date-part" type="text" inputmode="numeric" maxlength="4" placeholder="YYYY" aria-label="${aria} year" value="${m[1] || ''}">
    </div>`;
  }
  const $ = id => document.getElementById(id);
  const val = id => (($(id) || {}).value || '').trim();
  function readDate(prefix) {   // '' = empty, null = invalid, else ISO
    const mm = val(prefix + '-mm'), dd = val(prefix + '-dd'), yy = val(prefix + '-yyyy');
    if (!mm && !dd && !yy) return '';
    const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
    if (!/^\d{4}$/.test(yy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
    return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayIso = () => iso(new Date());
  const niceDate = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? `${Number(m[2])}/${Number(m[3])}/${m[1]}` : ''; };
  // A leading 1 or 0 is never part of a US area code (it is the country code from autofill or habit), so it is dropped
  // before the 10 digits are kept. Without this the last digit of the real number was cut off.
  const phoneOk = v => { const d = String(v || '').replace(/\D/g, ''); return d.length === 10 && /^[2-9]\d\d[2-9]/.test(d) && !/^(\d)\1{9}$/.test(d); };
  const fmtPhone = v => { const d = (v || '').replace(/\D/g, '').replace(/^[01]+/, '').slice(0, 10); return d.length >= 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length >= 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d; };
  function showErr(msg) { const e = $('hq-err'); if (e) { e.textContent = msg; e.hidden = !msg; if (msg) e.scrollIntoView({ block: 'center' }); } }
  const ERR = '<div id="hq-err" class="v2-error" role="alert" hidden></div>';
  const why = t => `<div class="v2-why"><span class="v2-why-badge" aria-hidden="true">i</span><div><strong>Why we ask</strong><p>${t}</p></div></div>`;

  // ---------- Screens ----------
  function screen() {
    const s = state;
    switch (stepId) {
      case 'rtype': return `
        <h1 class="v2-heading">What kind of place do you rent?</h1>
        <p class="v2-sub">Tap an option to start. A licensed North Carolina team compares renters insurance for you.</p>
        ${RQ_ART_ON ? `<div class="v2-grid-3">${RENTAL_TYPES.map(([v, t]) => `<button type="button" class="v2-tile compact ${s.rental_type === v ? 'is-selected' : ''}" aria-pressed="${s.rental_type === v}" data-rtype="${esc(v)}" style="${RQ_ART_STYLE}">${rqSvg(RQ_ART[v])}<span>${esc(t)}</span></button>`).join('')}</div>`
          : tiles('rtype', RENTAL_TYPES, s.rental_type, 3, true)}`;

      case 'address': return `
        <h1 class="v2-heading">What is the address of the place you rent?</h1>
        <p class="v2-sub">Renters insurance is priced by where you live.</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="property_address">Street address</label><input id="property_address" class="v2-input" type="text" autocomplete="address-line1" autocapitalize="words" value="${esc(s.property_address)}"></div>
            <div class="v2-field"><label for="unit">Apt or unit</label><input id="unit" class="v2-input" type="text" autocomplete="address-line2" maxlength="40" value="${esc(s.unit)}"></div>
          </div>
          <div class="hq-two">
            <div class="v2-field"><label for="city">City</label><input id="city" class="v2-input" type="text" autocomplete="address-level2" autocapitalize="words" value="${esc(s.city)}"></div>
            <div class="v2-field"><label for="zip_code">ZIP</label><input id="zip_code" class="v2-input" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(s.zip_code)}"></div>
          </div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="rq-address-next">Continue &rarr;</button>
        </div>`;

      case 'start': return `
        <h1 class="v2-heading">When should coverage start?</h1>
        <p class="v2-sub">Moving in soon? Pick your move-in date. A best guess is fine.</p>
        ${tiles('start', [['today', 'As soon as possible'], ['week', 'In about a week'], ['month', 'The 1st of next month'], ['pick', 'Pick a date']], s.start_choice, 2, true)}
        ${s.start_choice === 'pick' ? `<div class="v2-col">
          <div class="v2-field"><label for="st-mm">Start date</label>${dateBoxes('st', s.effective_date, 'Start date')}</div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="rq-start-next">Continue &rarr;</button></div>` : ''}`;

      case 'insured': return `
        <h1 class="v2-heading">Do you have renters insurance right now?</h1>
        <p class="v2-sub">Whether you have a policy now or are starting fresh, our team can help.</p>
        ${tiles('insured', [['Yes', 'Yes', 'yes'], ['No', 'No', 'no'], ['Not sure', 'Not sure', 'advise']], s.current_insurance, 3)}`;

      case 'carrier': {
        const known = insurers.some(c => c.name === s.current_carrier);
        const otherOn = otherCarrierOpen || (!!s.current_carrier && !known);
        return `
        <h1 class="v2-heading">Who is your renters insurance with?</h1>
        <p class="v2-sub">Tap your current company so our team knows what to compare against.</p>
        <div class="v2-grid-3">${insurers.map(c => logoTile(c, s.current_carrier === c.name)).join('')}${logoTile({ name: 'Other', logo: '' }, otherOn)}</div>
        ${otherOn ? `<div class="v2-col">
          <div class="v2-field"><label for="rq-other-carrier">Enter your current insurance company</label>
            <input id="rq-other-carrier" class="v2-input" type="text" autocapitalize="words" maxlength="100" value="${esc(known ? '' : s.current_carrier)}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="rq-other-carrier-next">Continue &rarr;</button></div>` : ''}
        <div class="v2-actions-stack"><button type="button" class="v2-btn-outline" style="width:100%" id="rq-carrier-skip">Not sure</button></div>`;
      }

      case 'claims': return `
        <h1 class="v2-heading">Any renters or home insurance claims in the past 5 years?</h1>
        <p class="v2-sub">At this address or a place you lived before.</p>
        ${tiles('claims', [['Yes', 'Yes'], ['No', 'No'], ['Not sure', 'Not sure']], s.previous_claims, 3, true)}
        ${why('Past claims affect which companies can offer a policy. Knowing up front helps our team match you with the right ones.')}`;

      case 'contact': return `
        <h1 class="v2-heading">You&rsquo;re halfway there. Who is this quote for?</h1>
        <p class="v2-sub"><strong>Next: the coverage you&rsquo;d like.</strong> We send your quotes by text or email.</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="firstname">First name</label><input id="firstname" class="v2-input" type="text" autocomplete="given-name" autocapitalize="words" maxlength="40" value="${esc(s.firstname)}"></div>
            <div class="v2-field"><label for="lastname">Last name</label><input id="lastname" class="v2-input" type="text" autocomplete="family-name" autocapitalize="words" maxlength="60" value="${esc(s.lastname)}"></div>
          </div>
          <div class="v2-field"><label for="phone">Mobile phone</label><input id="phone" class="v2-input" type="tel" inputmode="tel" autocomplete="tel" value="${esc(s.phone)}"></div>
          <div class="v2-field"><label for="email">Email</label><input id="email" class="v2-input" type="email" inputmode="email" autocomplete="email" autocapitalize="off" maxlength="180" value="${esc(s.email)}"></div>
          <div class="v2-field"><label for="dob-mm">Date of birth</label>${dateBoxes('dob', s.date_of_birth, 'Date of birth')}</div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="rq-contact-next">Next: your coverage &rarr;</button>
        </div>
        ${why('Insurance companies use your name and date of birth to price a policy. We never sell your information.')}`;

      case 'belongings': return `
        <h1 class="v2-heading">About how much are your belongings worth? ${helpBtn('belongings')}</h1>
        <p class="v2-sub">Think furniture, clothes, electronics and kitchen items. A rough number is fine.</p>
        ${tiles('belongings', BELONGINGS, s.personal_property, 2, true)}
        ${decideTile('belongings', s.personal_property)}`;

      case 'liability': return `
        <h1 class="v2-heading">How much liability coverage would you like? ${helpBtn('liability')}</h1>
        <p class="v2-sub">Many leases ask for a set amount. If yours does, choose &ldquo;Match my lease&rdquo;.</p>
        ${tiles('liability', LIABILITY, s.liability, 2, true)}
        ${decideTile('liability', s.liability)}`;

      case 'landlord': return `
        <h1 class="v2-heading">Does your landlord require renters insurance? ${helpBtn('landlord')}</h1>
        <p class="v2-sub">Check your lease if you have it handy.</p>
        ${tiles('landlord', [['Yes', 'Yes'], ['No', 'No'], ['Not sure yet', 'Not sure yet']], s.landlord_requirement, 3, true)}`;

      case 'extras': return `
        <h1 class="v2-heading">Last two things</h1>
        <p class="v2-sub">Both are optional.</p>
        <div class="v2-group-block"><div class="v2-group-title">Would you like an auto quote too?</div><div class="v2-grid-2" style="margin-bottom:0">
          ${['yes', 'no'].map(v => `<button type="button" class="v2-tile compact ${s.bundle_auto === v ? 'is-selected' : ''}" aria-pressed="${s.bundle_auto === v}" data-bundle="${v}"${RQ_ART_ON ? ` style="${RQ_ART_STYLE}"` : ''}>${RQ_ART_ON ? rqSvg(RQ_BUNDLE_ART[v]) : ''}<span>${v === 'yes' ? 'Yes' : 'No'}</span></button>`).join('')}</div></div>
        <div class="v2-col">
          <div class="v2-field"><label for="additional_notes">Anything else we should know? (optional)</label><textarea id="additional_notes" class="v2-textarea" maxlength="1000">${esc(s.additional_notes)}</textarea></div>
          <button type="button" class="v2-btn-gold" id="rq-extras-next">Continue to review &rarr;</button>
        </div>`;

      case 'handy': return UP.screen(state.dec_choice);

      case 'review': {
        const rows = [
          ['Rental', `${label(RENTAL_TYPES, s.rental_type)} · ${[s.property_address, s.unit, s.city, 'NC', s.zip_code].filter(Boolean).join(', ')}`, 'rtype'],
          ['Coverage starts', niceDate(s.effective_date), 'start'],
          ['Insured now', s.current_insurance + (s.current_insurance === 'Yes' && s.current_carrier ? ' · ' + s.current_carrier : ''), 'insured'],
          ['Claims (5 years)', s.previous_claims + (s.previous_claims === 'Yes' ? ' · ' + (s.claims_details || 'details not given') : ''), 'claims'],
          ['Contact', `${s.firstname} ${s.lastname} · ${s.phone} · ${s.email}`, 'contact'],
          ['Belongings', s.personal_property, 'belongings'],
          ['Liability', s.liability, 'liability'],
          ['Landlord requires it', s.landlord_requirement + (s.landlord_requirement === 'Yes' && s.lease_details ? ' · ' + s.lease_details : ''), 'landlord'],
          ['Auto quote too', s.bundle_auto === 'yes' ? 'Yes' : 'No', 'extras'],
          ['Notes', s.additional_notes || 'None', 'extras']];
        if (usedDec()) {   // an upload replaces the skipped questions with one line
          const skip = ['claims', 'belongings', 'liability', 'landlord']; for (let i = rows.length - 1; i >= 0; i--) if (skip.includes(rows[i][2])) rows.splice(i, 1);
          rows.push(['Your policy', UP.reviewLine(), 'handy']);
        }
        return `
        <h1 class="v2-heading">Review your quote request</h1>
        <p class="v2-sub">Tap Edit to change anything, then send.</p>
        <div class="v2-col">
          <div class="v2-review-list">${rows.map(([l, v, id]) => `
            <div class="v2-review-row"><div><div class="v2-review-label">${esc(l)}</div><div class="v2-review-val">${esc(v)}</div></div>
            <button type="button" class="v2-edit-btn" data-edit="${id}">Edit</button></div>`).join('')}</div>
          ${sendError ? `<div class="v2-error" role="alert">${esc(sendError)}</div>` : ''}
          <button type="button" class="v2-btn-gold" id="rq-send" ${sending ? 'disabled' : ''}>${sending ? 'Sending…' : 'Send my quote request'}</button>
          <p class="hq-fineprint">Requesting a quote does not bind, change or cancel coverage.</p>
        </div>`;
      }

      case 'done': return `
        <div class="v2-final-icon" aria-hidden="true">${icon('confirm')}</div>
        <h1 class="v2-heading">A licensed North Carolina agent is comparing renters insurance for you. We will send your prices by text or email within one business day.</h1>
        ${s.email ? `<p class="v2-final-confirm-email">A confirmation email is on its way to <strong>${esc(s.email)}</strong>.</p>` : ''}
        ${HANDY_ON ? UP.failNote() : ''}<p class="v2-sub">Request reference: <strong>${esc(confirmation)}</strong>. Have a question right now? Call us or text us below.</p>
        <div class="v2-final-actions">
          <a class="v2-btn-gold" href="tel:3368351993" data-source="renters_v2_final_call">Call 336-835-1993</a>
          <a class="v2-btn-navy" href="sms:+13368279065" data-source="renters_v2_final_text">Text (336) 827-9065</a>
        </div>
        ${s.bundle_auto === 'yes' ? `<div class="hq-offer"><strong>You asked for an auto quote too.</strong><p>It takes a few minutes.</p>
          <a class="v2-btn-outline" style="width:100%" href="/auto-quote?src=renters_quote_done" data-source="renters_quote_done_auto">Start my auto quote &rarr;</a></div>` : ''}`;
    }
    return '';
  }
  const label = (list, v) => (list.find(x => x[0] === v) || [, ''])[1];

  // ---------- What the office receives ----------
  function buildPayload() {
    const s = state;
    return {
      form_type: 'renters_insurance', cta_source: ctaSource,
      rental_type: s.rental_type, property_address: s.property_address.slice(0, 180), unit: s.unit.slice(0, 40), city: s.city.slice(0, 80), zip_code: s.zip_code,
      effective_date: s.effective_date,
      firstname: (TP + s.firstname).trim().slice(0, 60), lastname: s.lastname.slice(0, 60), date_of_birth: s.date_of_birth, phone: s.phone, email: s.email,
      current_insurance: s.current_insurance, current_carrier: s.current_insurance === 'Yes' ? s.current_carrier.slice(0, 100) : '',
      previous_claims: s.previous_claims, claims_details: s.previous_claims === 'Yes' ? s.claims_details.slice(0, 600) : '',
      personal_property: s.personal_property || HELP_ME, liability: s.liability || HELP_ME,
      landlord_requirement: s.landlord_requirement || 'Not sure yet', lease_details: s.landlord_requirement === 'Yes' ? s.lease_details.slice(0, 800) : '',
      bundle_auto: s.bundle_auto === 'yes', additional_notes: (decNote() + (TP + s.additional_notes).trim()).trim().slice(0, 1200)
    };
  }
  window.__RQ_PREVIEW_PAYLOAD__ = () => (LIVE ? null : buildPayload());

  async function send() {
    if (sending) return;
    if (decFilesLost()) { stepId = 'handy'; history = ['rtype', 'handy']; sendError = ''; render(true); window.scrollTo(0, 0); return; }
    if (state.effective_date < todayIso()) { sendError = 'The start date has passed. Tap Edit next to “Coverage starts” and choose a new date.'; render(); return; }
    sending = true; sendError = ''; render();
    try {
      const r = await fetch('/api/quote-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.ok !== true || !/^RENTERS-[0-9]{6}-[A-Z0-9]{4}$/.test(j.confirmationNumber || '')) throw new Error('no-ack');
      confirmation = j.confirmationNumber; submitted = true;
      if (HANDY_ON && UP.count()) await UP.send({ name: (TP + state.firstname + ' ' + state.lastname).trim(), phone: state.phone, email: state.email, carrier: state.current_carrier,
        notes: TP + 'Ref: ' + confirmation + ' | Policy type: renters quote' + (usedDec() ? ' | The customer uploaded the declarations page and skipped the coverage questions.' : '') });
      if (LIVE && typeof window.gtag === 'function') {
        const detail = { form_name: 'renters_quote', service_line: 'renters', method: 'backend_acknowledged', cta_source: ctaSource };
        window.gtag('event', 'form_submit', detail); window.gtag('event', 'generate_lead', detail);
      } else track('renters_v2_test_submit', { confirmation_number: confirmation });
      try { sessionStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem('bli_carry_contact'); } catch (_) {}
      sending = false; stepId = 'done'; history = ['done']; render(true); window.scrollTo(0, 0);
    } catch (_) {
      // Never retry automatically: the office may already have it.
      sending = false;
      sendError = 'We could not confirm that your request went through. Please do not send it again. Call us at 336-835-1993 or text (336) 827-9065 and our team will check.';
      render();
    }
  }

  function sendPartial() {
    if (!contactDone || submitted || sendPartial.sent || !state.email) return;
    sendPartial.sent = true;
    const s = state, name = `${s.firstname} ${s.lastname}`.trim();
    const lines = [`${TP}=== PARTIAL RENTERS QUOTE LEAD (Abandoned Mid-Form) ===`.trim(), `Stopped at: ${stepId}`, `Name: ${name}`, `Phone: ${s.phone}`, `Email: ${s.email}`,
      `DOB: ${s.date_of_birth || 'Not entered'}`, `Rental Type: ${s.rental_type || 'Not entered'}`, `Address: ${[s.property_address, s.unit, s.city, 'NC', s.zip_code].filter(Boolean).join(', ')}`,
      s.effective_date ? `Start date: ${s.effective_date}` : ''].filter(Boolean);
    try {
      fetch('/api/homepage-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify({
        formType: 'contact', name: `${TP}[PARTIAL RENTERS QUOTE - Stopped at: ${stepId}] ${name}`.trim().slice(0, 150),
        phone: String(s.phone).slice(0, 50), email: s.email.slice(0, 254), message: lines.join('\n').slice(0, 4900) }) }).catch(() => {});
      track(LIVE ? 'partial_lead_saved' : 'renters_v2_test_partial', { stopped_at: stepId });
    } catch (_) {}
  }

  // ---------- Pop-ups: help, and a details sheet for "Yes" answers ----------
  function overlay(el, html) { el.innerHTML = html; el.hidden = false; document.body.classList.add('v2-help-open'); requestAnimationFrame(() => el.classList.add('is-in')); }
  function closeOverlay(el) { if (!el) return; el.classList.remove('is-in'); el.hidden = true; document.body.classList.remove('v2-help-open'); }
  function openHelp(key) {
    const h = HELP[key]; if (!h) return;
    if (!helpEl) { helpEl = document.createElement('div'); helpEl.className = 'v2-help-overlay'; helpEl.hidden = true; document.body.appendChild(helpEl);
      helpEl.addEventListener('click', e => { if (e.target === helpEl || e.target.closest('[data-help-close]')) closeOverlay(helpEl); }); }
    overlay(helpEl, `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="rq-help-title" tabindex="-1"><div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="rq-help-title">${esc(h.title)}</h2><button type="button" class="v2-help-x" data-help-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${esc(h.body)}</p><div class="v2-help-example"><strong>Example</strong><p>${esc(h.example)}</p></div>
      <p class="v2-help-fine">General information only. Your policy decides what is covered.</p>
      <button type="button" class="v2-btn-gold v2-help-ok" data-help-close>Got it</button></div>`);
  }
  // kind: 'claims' -> claims_details (600), 'lease' -> lease_details (800)
  function openSheet(kind) {
    const cfg = kind === 'claims'
      ? { key: 'claims_details', max: 600, title: 'Tell us about the claim', body: 'What happened, about when, and was it paid? A sentence or two is plenty.', ph: 'Example: Laptop and TV stolen in a break-in in 2024. Claim was paid.' }
      : { key: 'lease_details', max: 800, title: 'What does your lease require?', body: 'If you know it, tell us the liability amount and whether the landlord or property manager must be listed on the policy.', ph: 'Example: $100,000 liability. List ABC Property Management as an interested party.' };
    if (!sheetEl) { sheetEl = document.createElement('div'); sheetEl.className = 'v2-help-overlay hq-claim-overlay'; sheetEl.hidden = true; document.body.appendChild(sheetEl);
      sheetEl.addEventListener('click', e => {
        const k = sheetEl.dataset.key, t = $('rq-sheet-text');
        if (e.target.closest('[data-sheet-save]')) { state[k] = (t.value || '').trim(); closeOverlay(sheetEl); save(); track('renters_v2_step_complete'); next(); return; }
        if (e.target === sheetEl || e.target.closest('[data-sheet-close]')) { state[k] = (t.value || '').trim(); save(); closeOverlay(sheetEl); }
      }); }
    sheetEl.dataset.key = cfg.key;
    overlay(sheetEl, `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="rq-sheet-title" tabindex="-1"><div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="rq-sheet-title">${cfg.title}</h2><button type="button" class="v2-help-x" data-sheet-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${cfg.body}</p>
      <label class="hq-claim-label" for="rq-sheet-text">Details</label>
      <textarea id="rq-sheet-text" class="v2-textarea" rows="4" maxlength="${cfg.max}" placeholder="${esc(cfg.ph)}">${esc(state[cfg.key])}</textarea>
      <button type="button" class="v2-btn-gold v2-help-ok" data-sheet-save>Save and continue &rarr;</button>
      <button type="button" class="v2-btn-outline hq-claim-skip" data-sheet-save>Skip, I&rsquo;ll explain later</button></div>`);
    const t = $('rq-sheet-text'); if (t) { try { t.focus({ preventScroll: true }); } catch (_) {} }
  }
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (sheetEl && !sheetEl.hidden) closeOverlay(sheetEl); else if (helpEl && !helpEl.hidden) closeOverlay(helpEl); });

  // ---------- Render + events ----------
  function render(animate) {
    const stage = $('stage'), seq = sequence(), i = Math.max(0, seq.indexOf(stepId));
    let pct = stepId === 'done' ? 100 : Math.max(6, Math.round((i / (seq.length - 1)) * 100));
    if (stepId !== 'done' && render._i >= 0) {   // an answer can add screens, which used to make the number drop
      if (i > render._i) pct = Math.min(99, Math.max(pct, render._p + 1));
      else if (i === render._i) pct = Math.max(pct, render._p);
      else pct = Math.max(6, Math.min(pct, render._p - 1));
    }
    render._i = i; render._p = pct;
    const fill = $('v2-progress-fill'), lab = $('v2-progress-label'), bar = $('v2-progressbar');
    if (fill) fill.style.width = pct + '%'; if (lab) lab.textContent = pct + '%'; if (bar) bar.setAttribute('aria-valuenow', String(pct));
    const about = document.querySelector('.v2-about'); if (about) about.hidden = stepId !== 'rtype';
    const showBack = history.length > 1 && stepId !== 'done';
    stage.innerHTML = `<div class="${animate ? 'v2-step-enter' : ''}"><div class="v2-back-row"><button type="button" class="v2-back-link" id="v2-back" ${showBack ? '' : 'hidden'}>&larr; Back</button></div>
      <div class="v2-eyebrow">${EYEBROW[stepId] || ''}</div>${screen()}</div>`;
    bind();
    const mb = $('v2-mobile-bar');
    if (mb) {
      const primary = document.querySelector('#stage .v2-btn-gold:not(a)');
      if (!showBack && !primary) { mb.hidden = true; mb.innerHTML = ''; document.body.classList.remove('has-mobile-bar'); }
      else {
        document.body.classList.add('has-mobile-bar'); mb.hidden = false;
        mb.innerHTML = `${showBack ? '<button type="button" class="v2-mobile-back" id="v2-m-back">&larr; Back</button>' : ''}${primary ? `<button type="button" class="v2-btn-gold v2-mobile-next" id="v2-m-next" ${primary.disabled ? 'disabled' : ''}>${primary.innerHTML}</button>` : ''}`;
        const b = $('v2-m-back'); if (b) b.addEventListener('click', back);
        const n = $('v2-m-next'); if (n && primary) { primary.classList.add('v2-in-bar'); n.addEventListener('click', () => primary.click()); }   /* the bar copy presses this one; on phones the page copy is hidden (styles.css .v2-in-bar) */
      }
    }
  }
  const on = (id, fn) => { const e = $(id); if (e) e.addEventListener('click', fn); };
  const each = (sel, fn) => document.querySelectorAll(sel).forEach(fn);

  function bind() {
    on('v2-back', back);
    if (HANDY_ON) UP.bind({ rerender: () => render(),
      choose: c => { state.dec_choice = c; if (c === 'questions') state.used_dec = false; save(); fireFormStart(); render(); if (c === 'questions') setTimeout(next, 230); },
      next: () => { state.dec_choice = 'upload'; state.used_dec = true; save(); next(); } });
    each('[data-help]', b => b.addEventListener('click', () => openHelp(b.dataset.help)));
    each('[data-rtype]', b => b.addEventListener('click', () => pick(b, () => { state.rental_type = b.dataset.rtype; })));
    on('rq-address-next', () => {
      state.property_address = val('property_address'); state.unit = val('unit'); state.city = val('city'); state.zip_code = val('zip_code').replace(/\D/g, '').slice(0, 5);
      if (!state.property_address || !state.city) { showErr('Please enter the street address and city.'); return; }
      if (!/^(27|28)\d{3}$/.test(state.zip_code)) { showErr('Please enter a North Carolina ZIP code (it starts with 27 or 28).'); return; }
      fireFormStart(); save(); next();
    });
    each('[data-start]', b => b.addEventListener('click', () => {
      const c = b.dataset.start, d = new Date();
      if (c === 'pick') { state.start_choice = 'pick'; if (!state.effective_date) state.effective_date = ''; save(); render(); const f = $('st-mm'); if (f) f.focus(); return; }
      if (c === 'week') d.setDate(d.getDate() + 7);
      if (c === 'month') { d.setMonth(d.getMonth() + 1, 1); }
      pick(b, () => { state.start_choice = c; state.effective_date = iso(d); });
    }));
    on('rq-start-next', () => { const d = readDate('st'); if (!d) { showErr('Please enter the start date as month, day and four-digit year.'); return; }
      if (d < todayIso()) { showErr('The start date cannot be in the past.'); return; } state.effective_date = d; save(); next(); });
    each('[data-insured]', b => b.addEventListener('click', () => pick(b, () => { state.current_insurance = b.dataset.insured; if (state.current_insurance !== 'Yes') state.current_carrier = ''; })));
    each('[data-carrier]', b => b.addEventListener('click', () => {
      if (b.dataset.carrier === 'Other') { otherCarrierOpen = true; if (insurers.some(c => c.name === state.current_carrier)) state.current_carrier = ''; render(); const o = $('rq-other-carrier'); if (o) o.focus(); return; }
      otherCarrierOpen = false; pick(b, () => { state.current_carrier = b.dataset.carrier; });
    }));
    on('rq-other-carrier-next', () => { const v = val('rq-other-carrier'); if (!v) { showErr('Please enter the insurance company name, or tap Not sure.'); return; } state.current_carrier = v; otherCarrierOpen = false; next(); });
    on('rq-carrier-skip', () => { state.current_carrier = ''; otherCarrierOpen = false; next(); });
    each('[data-claims]', b => b.addEventListener('click', () => {
      if (b.dataset.claims === 'Yes') { b.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); b.classList.add('is-selected'); state.previous_claims = 'Yes'; save(); openSheet('claims'); return; }
      pick(b, () => { state.previous_claims = b.dataset.claims; state.claims_details = ''; });
    }));
    const ph = $('phone'); if (ph) ph.addEventListener('input', () => { ph.value = fmtPhone(ph.value); });
    on('rq-contact-next', () => {
      state.firstname = val('firstname'); state.lastname = val('lastname'); state.phone = val('phone'); state.email = val('email');
      const dob = readDate('dob');
      if (!state.firstname || !state.lastname) { showErr('Please enter your first and last name.'); return; }
      if (!phoneOk(state.phone)) { showErr('Please check your phone number. Enter the 10 digits starting with the area code.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { showErr('Please enter a valid email address.'); return; }
      if (!dob || dob >= todayIso() || dob < '1900-01-01') { showErr('Please enter your date of birth as month, day and four-digit year.'); return; }
      state.date_of_birth = dob; contactDone = true; next();
    });
    each('[data-belongings]', b => b.addEventListener('click', () => pick(b, () => { state.personal_property = b.dataset.belongings; })));
    each('[data-liability]', b => b.addEventListener('click', () => pick(b, () => { state.liability = b.dataset.liability; })));
    each('[data-landlord]', b => b.addEventListener('click', () => {
      if (b.dataset.landlord === 'Yes') { b.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); b.classList.add('is-selected'); state.landlord_requirement = 'Yes'; save(); openSheet('lease'); return; }
      pick(b, () => { state.landlord_requirement = b.dataset.landlord; state.lease_details = ''; });
    }));
    each('[data-bundle]', b => b.addEventListener('click', () => { state.bundle_auto = b.dataset.bundle; save(); const n = $('additional_notes'); if (n) state.additional_notes = n.value; const y = window.scrollY; render(); window.scrollTo(0, y); }));
    const notes = $('additional_notes'); if (notes) notes.addEventListener('input', () => { state.additional_notes = notes.value; save(); });
    on('rq-extras-next', next);
    each('[data-edit]', b => b.addEventListener('click', () => { editReturn = 'review'; go(b.dataset.edit); }));
    on('rq-send', send);
  }

  window.addEventListener('popstate', () => { if (sheetEl && !sheetEl.hidden) { closeOverlay(sheetEl); return; } if (helpEl && !helpEl.hidden) { closeOverlay(helpEl); return; } if (stepId !== 'done') back(); });
  let awayTimer = null;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') awayTimer = setTimeout(sendPartial, 60000);
    else if (awayTimer) { clearTimeout(awayTimer); awayTimer = null; }
  });
  window.addEventListener('pagehide', sendPartial);

  if (location.protocol !== 'file:') {
    fetch(LOGOS_URL, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then(d => {
      const list = d && Array.isArray(d.currentInsurers) ? d.currentInsurers : null; if (!list) return;
      insurers = list.filter(c => c && c.enabled !== false && c.name !== 'Other' && !NOT_RENTERS.includes(c.name))
        .sort((a, b) => (a.order || 99) - (b.order || 99)).map(c => ({ name: c.name, logo: c.logo || '', showLabel: !!c.showLabel }));
      if (stepId === 'carrier') render();
    }).catch(() => {});
  }

  restore();
  if (decFilesLost() && sequence().includes('handy')) { stepId = 'handy'; history = ['rtype', 'handy']; }
  if (!sequence().includes(stepId)) { stepId = 'rtype'; history = ['rtype']; }
  render();
})();
