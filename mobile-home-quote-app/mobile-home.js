/* Bill Layne Insurance - Mobile Home Quote V2 (tap-through). Same look and rules as the auto, home and renters forms.
   A live page sets window.BLI_MQ_MODE = 'live' before loading this file; the private test page leaves it unset.
   Every value sent matches what the office script (MobileHomeQuote.validate) accepts today. */
(function () {
  'use strict';

  const LIVE = window.BLI_MQ_MODE === 'live';
  const TP = LIVE ? '' : '[TEST MH V2] ';
  const STORAGE_KEY = LIVE ? 'bli_mobile_home_quote_session' : 'bli_mobile_home_v2_test_session';
  const params = new URLSearchParams(window.location.search);
  const srcParam = /^[a-z0-9_-]{1,80}$/i.test(params.get('src') || '') ? params.get('src') : '';
  const ctaSource = LIVE ? (srcParam || 'mobile_home_quote') : 'mobile_home_v2_test';

  const ICON_BASE = 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-';
  const ICONS = { homeYes: 'home-yes-45j7s3', yes: 'insured-yes-8pg2wf', no: 'insured-no-mk4ws4', advise: 'coverage-not-sure-jmye8d', confirm: 'confirm-dbnygk', full: 'coverage-full-g66cfp' };
  const icon = n => `<img src="${ICON_BASE}${ICONS[n]}.svg" alt="" class="v2-tile-icon" width="48" height="48" onerror="this.remove()">`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Stored values = exactly the choices the office script accepts.
  const STYLES = [['single_wide', 'Single-wide'], ['double_wide', 'Double-wide'], ['multi_section', 'Multi-section or triple-wide'], ['not_sure', 'Not sure']];
  // Simple end-view drawings so a customer can pick by look. Shown on the test page only until Bill approves.
  const STYLE_ART_ON = !LIVE;
  const GROUND = '<path d="M4 40H92" stroke="#8696ab" stroke-width="1.6"/>';
  const STYLE_ART = {
    single_wide: '<path d="M34 20h28v18H34z"/><path d="M31 20.500L48 11l17 9.500"/><path d="M45 27h6v11h-6zM37.500 24h4.500v5h-4.500zM54 24h4.500v5H54z"/>',
    double_wide: '<path d="M22 20h52v18H22z"/><path d="M19 20.500L48 9l29 11.500"/><path d="M48 9v29" stroke-dasharray="3 3"/><path d="M53 27h6v11h-6zM28 25h8v6h-8zM63 25h7v6h-7zM39 25h5v6h-5z"/>',
    multi_section: '<path d="M10 20h76v18H10z"/><path d="M7 20.500L48 7l41 13.500"/><path d="M35 11.500V38M61 11.500V38" stroke-dasharray="3 3"/><path d="M45 27h6v11h-6zM16 25h8v6h-8zM72 25h8v6h-8zM26 25h5v6h-5zM65 25h-1"/>'
  };
  const STYLE_HINT = { single_wide: 'One section, about 14 to 18 feet wide', double_wide: 'Two sections joined, about 24 to 32 feet wide', multi_section: 'Three or more sections' };
  const styleTile = ([v, t], current) => v === 'not_sure'   // no drawing: a slim full-width row
    ? `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-style="${v}" style="grid-column:1/-1;min-height:48px"><span>${esc(t)}</span></button>`
    : `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-style="${v}" style="flex-direction:column;gap:2px;padding:8px 8px 9px${v === 'multi_section' ? ';grid-column:1/-1' : ''}">
      <svg viewBox="0 0 96 48" width="${v === 'multi_section' ? 116 : 96}" height="${v === 'multi_section' ? 58 : 48}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;color:#05203d">${STYLE_ART[v]}${GROUND}</svg>
      <span>${esc(t)}</span><small style="display:block;font-size:12.5px;font-weight:600;line-height:1.25;color:#334155">${STYLE_HINT[v]}</small></button>`;
  const LAND = [['owned', 'I own or am buying the land'], ['rented_lot', 'I rent the lot'], ['other', 'Something else'], ['', 'Not sure']];
  const USE = [['primary', 'My main home'], ['seasonal', 'Seasonal or second home'], ['rental', 'I rent it to someone else'], ['not_sure', 'Not sure yet']];
  const AMOUNTS = [['25000', '$25,000'], ['50000', '$50,000'], ['75000', '$75,000'], ['100000', '$100,000'], ['150000', '$150,000']];
  // Sent as their own fields (office script Version 19 has rows for them).
  const SETTLE = [['Replacement cost', 'Replacement cost'], ['Actual cash value', 'Actual cash value']];
  const STRUCT = [['Yes', 'Yes, I have other buildings'], ['No', 'No']];
  const CONTENTS = [['$10,000', '$10,000'], ['$25,000', '$25,000'], ['$50,000', '$50,000'], ['None', 'I don\u2019t need this']];
  const LIABILITY = [['$100,000', '$100,000'], ['$300,000', '$300,000'], ['$500,000', '$500,000']];
  const HELP_ME = 'Help me decide';
  const DEDUCTIBLES = [['500', '$500'], ['1000', '$1,000'], ['2500', '$2,500']];
  const YNS = [['yes', 'Yes'], ['no', 'No'], ['not_sure', 'Not sure']];

  const HELP = {
    amount: { title: 'Coverage on the home', body: 'The amount your policy may pay to repair or replace the mobile home after a covered loss. It is based on what it would cost to replace the home, not on what you paid for it or what the land is worth.',
      example: 'A tree falls through the roof in a storm. This coverage may pay for the repairs, after your deductible.' },
    deductible: { title: 'Deductible', body: 'The part of a covered repair bill you pay yourself before your coverage pays. You choose the amount. A higher deductible means you pay more out of pocket when you have a claim.',
      example: 'With a $1,000 deductible and a $6,000 covered repair, you pay $1,000 and the policy may pay the remaining $5,000.' },
    settlement: { title: 'Replacement cost or actual cash value', body: 'This decides how a covered claim on the home is paid. Replacement cost may pay to repair or replace with new materials. Actual cash value pays what the damaged part was worth at the time, after age and wear are taken off. Some older mobile homes can only be insured at actual cash value.',
      example: 'A storm ruins a 15-year-old roof. Replacement cost may pay for a new roof. Actual cash value pays what a 15-year-old roof was worth.' },
    structures: { title: 'Other structures', body: 'Buildings on your lot that are not attached to the home, such as a shed, a detached garage, a carport or a fence. They are covered by their own amount on the policy.',
      example: 'A tree falls on your storage shed. Other structures coverage may pay to repair or replace it, after your deductible.' },
    contents: { title: 'Personal property', body: 'Your belongings inside the home: furniture, clothes, electronics, appliances that are not built in. You choose an amount that would let you replace what you own.',
      example: 'A kitchen fire ruins your furniture and clothes. Personal property coverage may pay to replace them, after your deductible.' },
    liability: { title: 'Personal liability', body: 'Pays when you are responsible for someone else being hurt or their property being damaged, at your home or away from it. It also may pay for a lawyer if you are sued.',
      example: 'A visitor falls on your steps and breaks a wrist. Liability coverage may pay their medical bills.' },
    land: { title: 'Why we ask about the land', body: 'Whether the home sits on land you own or on a rented lot affects which insurance companies will offer a policy and what they ask for.',
      example: 'A home in a mobile home park on a rented lot is quoted a little differently from one on your own acreage.' }
  };

  // Insurer logo tiles: same list and logos as the auto and home forms.
  const LOGOS_URL = (function () { try { return new URL('../auto-quote-app/logos.json', document.currentScript.src).href; } catch (_) { return '../auto-quote-app/logos.json'; } })();
  const NOT_HOME_INSURERS = ['The General', 'Direct Auto'];
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
  const blank = () => ({ is_owner: '', home_style: '', property_address: '', city: '', zip_code: '', land_ownership: '', land_answered: false, occupancy: '',
    year_built: '', square_footage: '', roof_year: '', current_insurance: '', current_carrier: '', coverage_expiration: '',
    previous_claims: '', claims_details: '', firstname: '', lastname: '', phone: '', email: '', date_of_birth: '',
    effective_date: '', start_choice: '', desired_dwelling_amount: '', amount_answered: false, settlement: '', other_structures: '', other_structures_value: '', personal_property: '', liability: '', deductible: '', bundle_auto: '', additional_notes: '' });
  let state = blank(), stepId = 'own', history = ['own'];
  let sending = false, sendError = '', confirmation = '', contactDone = false, submitted = false, formStarted = false, editReturn = null;
  let helpEl = null, sheetEl = null, ownAmountOpen = false, ownContentsOpen = false;

  function save() { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state, stepId, history, contactDone, t: Date.now() })); } catch (_) {} }
  function restore() {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (raw && raw.state && raw.stepId && raw.stepId !== 'done') { state = Object.assign(blank(), raw.state); stepId = raw.stepId; history = raw.history || [stepId]; contactDone = !!raw.contactDone; }
    } catch (_) {}
    try {   // contact details carried over from a finished auto or home quote, in this browser tab only
      const c = JSON.parse(sessionStorage.getItem('bli_carry_contact') || 'null');
      if (c && !state.firstname && !state.email) ['firstname', 'lastname', 'phone', 'email', 'date_of_birth'].forEach(k => { if (c[k]) state[k] = c[k]; });
      if (c && c.street && !state.property_address) { state.property_address = c.street; state.city = c.city || ''; state.zip_code = c.zip || ''; if (c.owner === 'yes' || c.owner === 'buying') state.is_owner = c.owner; }
    } catch (_) {}
    try { const z = params.get('zip'); if (z && /^[0-9]{5}$/.test(z) && !state.zip_code) state.zip_code = z; } catch (_) {}
  }

  function track(name, detail) {
    const base = LIVE ? { cta_source: ctaSource, form_type: 'mobile_home', step_id: stepId }
      : { traffic_type: 'internal', cta_source: 'mobile_home_v2_test', form_name: 'mobile_home_quote_v2_test', step_id: stepId };
    if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign(base, detail || {}));
  }
  function fireFormStart() {
    if (formStarted) return; formStarted = true;
    if (LIVE && typeof window.gtag === 'function') window.gtag('event', 'form_start', { form_type: 'mobile_home', cta_source: ctaSource });
  }

  // ---------- Flow ----------
  function sequence() {
    const seq = ['own', 'style', 'address', 'land', 'use', 'details', 'insured'];
    if (state.current_insurance === 'yes') seq.push('carrier', 'renewal');
    seq.push('claims', 'contact', 'start', 'amount', 'settlement', 'structures', 'contents', 'liability', 'deductible', 'extras', 'review', 'done');
    return seq;
  }
  const EYEBROW = { own: 'YOUR MOBILE HOME', style: 'YOUR MOBILE HOME', address: 'YOUR MOBILE HOME', land: 'YOUR MOBILE HOME', use: 'YOUR MOBILE HOME', details: 'YOUR MOBILE HOME',
    insured: 'CURRENT COVERAGE', carrier: 'CURRENT COVERAGE', renewal: 'CURRENT COVERAGE', claims: 'CLAIMS', contact: 'ABOUT YOU',
    start: 'YOUR COVERAGE', amount: 'YOUR COVERAGE', settlement: 'YOUR COVERAGE', structures: 'YOUR COVERAGE', contents: 'YOUR COVERAGE', liability: 'YOUR COVERAGE', deductible: 'YOUR COVERAGE', extras: 'ALMOST DONE', review: 'REVIEW', done: 'QUOTE RECEIVED' };

  function go(id) { stepId = id; history.push(id); enter(); }
  function next() {
    const seq = sequence();
    if (editReturn && seq.includes(editReturn) && editReturn !== stepId) { const t = editReturn; editReturn = null; go(t); return; }
    editReturn = null;
    go(seq[Math.min(seq.indexOf(stepId) + 1, seq.length - 1)]);
  }
  function back() { if (history.length < 2) return; history.pop(); stepId = history[history.length - 1]; enter(true); }
  function enter(fromBack) {
    ownAmountOpen = false; ownContentsOpen = false; save();
    if (!fromBack) { try { window.history.pushState({ mq: stepId }, ''); } catch (_) {} }
    track('mobile_home_v2_step_view'); render(true); window.scrollTo(0, 0);
  }
  function pick(btn, fn) {
    if (btn) { btn.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); btn.classList.add('is-selected'); }
    fn(); save(); track('mobile_home_v2_step_complete'); fireFormStart(); setTimeout(next, 230);
  }

  // ---------- Small builders ----------
  const helpBtn = key => `<button type="button" class="v2-help-btn" data-help="${key}" aria-label="What is ${esc(HELP[key].title)}?">?</button>`;
  const tiles = (attr, list, current, cols, compact) => `<div class="v2-grid-${cols}">${list.map(([v, t, ic]) =>
    `<button type="button" class="v2-tile ${compact ? 'compact' : ''} ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-${attr}="${esc(v)}">${ic ? icon(ic) : ''}<span>${esc(t)}</span></button>`).join('')}</div>`;
  const decideTile = (attr, current) => `<div class="v2-grid-2 hq-decide" style="grid-template-columns:1fr">
      <button type="button" class="v2-tile compact ${current === HELP_ME ? 'is-selected' : ''}" data-${attr}="${HELP_ME}">Not sure, help me decide</button></div>`;
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
  const fmtPhone = v => { const d = (v || '').replace(/\D/g, '').slice(0, 10); return d.length >= 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length >= 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d; };
  function showErr(msg) { const e = $('hq-err'); if (e) { e.textContent = msg; e.hidden = !msg; if (msg) e.scrollIntoView({ block: 'center' }); } }
  const ERR = '<div id="hq-err" class="v2-error" role="alert" hidden></div>';
  const why = t => `<div class="v2-why"><span class="v2-why-badge" aria-hidden="true">i</span><div><strong>Why we ask</strong><p>${t}</p></div></div>`;

  // ---------- Screens ----------
  function screen() {
    const s = state;
    switch (stepId) {
      case 'own': return `
        <h1 class="v2-heading">Do you own the mobile home?</h1>
        <p class="v2-sub">Tap an option to start. A licensed North Carolina team compares mobile home insurance for you.</p>
        ${tiles('own', [['yes', 'I own it', 'homeYes'], ['buying', 'I\u2019m buying it', 'full']], s.is_owner, 2)}`;

      case 'style': return `
        <h1 class="v2-heading">What kind of mobile home is it?</h1>
        <p class="v2-sub">${STYLE_ART_ON ? 'Tap the one that looks like yours.' : 'Choose the closest match.'}</p>
        ${STYLE_ART_ON ? `<div class="v2-grid-2">${STYLES.map(t => styleTile(t, s.home_style)).join('')}</div>` : tiles('style', STYLES, s.home_style, 2, true)}`;

      case 'address': return `
        <h1 class="v2-heading">Where is the mobile home?</h1>
        <p class="v2-sub">Mobile home insurance is priced by where the home sits.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="property_address">Street address</label><input id="property_address" class="v2-input" type="text" autocomplete="street-address" autocapitalize="words" maxlength="160" value="${esc(s.property_address)}"></div>
          <div class="hq-two">
            <div class="v2-field"><label for="city">City</label><input id="city" class="v2-input" type="text" autocomplete="address-level2" autocapitalize="words" maxlength="80" value="${esc(s.city)}"></div>
            <div class="v2-field"><label for="zip_code">ZIP</label><input id="zip_code" class="v2-input" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(s.zip_code)}"></div>
          </div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="mq-address-next">Continue &rarr;</button>
        </div>`;

      case 'land': return `
        <h1 class="v2-heading">Do you own the land it sits on? ${helpBtn('land')}</h1>
        <p class="v2-sub">Choose the closest match.</p>
        ${tiles('land', LAND, s.land_answered ? s.land_ownership : '\u0000', 2, true)}`;

      case 'use': return `
        <h1 class="v2-heading">How is the home used?</h1>
        <p class="v2-sub">Choose the closest match.</p>
        ${tiles('use', USE, s.occupancy, 2, true)}`;

      case 'details': return `
        <h1 class="v2-heading">A few details about the home</h1>
        <p class="v2-sub">Fill in what you know and skip the rest. Our team can look up what is missing.</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="year_built">Year built</label><input id="year_built" class="v2-input" type="text" inputmode="numeric" maxlength="4" placeholder="Example: 2004" value="${esc(s.year_built)}"></div>
            <div class="v2-field"><label for="square_footage">Square feet</label><input id="square_footage" class="v2-input" type="text" inputmode="numeric" maxlength="5" placeholder="Example: 1200" value="${esc(s.square_footage)}"></div>
          </div>
          <div class="v2-field"><label for="roof_year">Year the roof was last replaced or re-coated (optional)</label><input id="roof_year" class="v2-input hq-year" type="text" inputmode="numeric" maxlength="4" placeholder="Example: 2018" value="${esc(s.roof_year)}"></div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="mq-details-next">Continue &rarr;</button>
        </div>`;

      case 'insured': return `
        <h1 class="v2-heading">Is the mobile home insured right now?</h1>
        <p class="v2-sub">Whether you have a policy now or are starting fresh, our team can help.</p>
        ${tiles('insured', [['yes', 'Yes', 'yes'], ['no', 'No', 'no'], ['not_sure', 'Not sure', 'advise']], s.current_insurance, 3)}`;

      case 'carrier': {
        const known = insurers.some(c => c.name === s.current_carrier);
        const otherOn = otherCarrierOpen || (!!s.current_carrier && !known);
        return `
        <h1 class="v2-heading">Who insures the mobile home now?</h1>
        <p class="v2-sub">Tap your current company so our team knows what to compare against.</p>
        <div class="v2-grid-3">${insurers.map(c => logoTile(c, s.current_carrier === c.name)).join('')}${logoTile({ name: 'Other', logo: '' }, otherOn)}</div>
        ${otherOn ? `<div class="v2-col">
          <div class="v2-field"><label for="mq-other-carrier">Enter your current insurance company</label>
            <input id="mq-other-carrier" class="v2-input" type="text" autocapitalize="words" maxlength="100" value="${esc(known ? '' : s.current_carrier)}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="mq-other-carrier-next">Continue &rarr;</button></div>` : ''}
        <div class="v2-actions-stack"><button type="button" class="v2-btn-outline" style="width:100%" id="mq-carrier-skip">Not sure</button></div>`;
      }

      case 'renewal': return `
        <h1 class="v2-heading">When does your current policy end?</h1>
        <p class="v2-sub">It is on your policy or your bill. Not sure? Skip it.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="ex-mm">Policy end date (optional)</label>${dateBoxes('ex', s.coverage_expiration, 'Policy end date')}</div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="mq-renewal-next">Continue &rarr;</button>
          <button type="button" class="v2-btn-outline" style="width:100%" id="mq-renewal-skip">Not sure</button></div>
        </div>`;

      case 'claims': return `
        <h1 class="v2-heading">Any home insurance claims in the past 5 years?</h1>
        <p class="v2-sub">On this home or a home you owned before.</p>
        ${tiles('claims', YNS, s.previous_claims, 3, true)}
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
          <button type="button" class="v2-btn-gold" id="mq-contact-next">Next: your coverage &rarr;</button>
        </div>
        ${why('Insurance companies use your name and date of birth to price a policy. We never sell your information.')}`;

      case 'start': return `
        <h1 class="v2-heading">When should coverage start?</h1>
        <p class="v2-sub">Buying or moving the home? Pick that date. A best guess is fine.</p>
        ${tiles('start', [['today', 'As soon as possible'], ['week', 'In about a week'], ['month', 'The 1st of next month'], ['pick', 'Pick a date'], ['none', 'Not sure yet']], s.start_choice, 2, true)}
        ${s.start_choice === 'pick' ? `<div class="v2-col">
          <div class="v2-field"><label for="st-mm">Start date</label>${dateBoxes('st', s.effective_date, 'Start date')}</div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="mq-start-next">Continue &rarr;</button></div>` : ''}`;

      case 'amount': {
        const preset = AMOUNTS.some(x => x[0] === s.desired_dwelling_amount);
        const ownOn = ownAmountOpen || (s.amount_answered && !!s.desired_dwelling_amount && !preset);
        return `
        <h1 class="v2-heading">How much coverage do you want on the home? ${helpBtn('amount')}</h1>
        <p class="v2-sub">This is the cost to replace the home, not the land. Most people let our team work it out.</p>
        <div class="v2-grid-2">${AMOUNTS.map(([v, t]) => `<button type="button" class="v2-tile compact ${s.amount_answered && s.desired_dwelling_amount === v && !ownOn ? 'is-selected' : ''}" aria-pressed="${s.amount_answered && s.desired_dwelling_amount === v && !ownOn}" data-amount="${v}"><span>${t}</span></button>`).join('')}
          <button type="button" class="v2-tile compact ${ownOn ? 'is-selected' : ''}" aria-pressed="${ownOn}" id="mq-own-amount"><span>Enter my own amount</span></button></div>
        ${ownOn ? `<div class="v2-col">
          <div class="v2-field"><label for="mq-amount-own">Coverage amount in dollars</label><input id="mq-amount-own" class="v2-input" type="text" inputmode="numeric" maxlength="9" placeholder="Example: 185000" value="${esc(preset ? '' : s.desired_dwelling_amount)}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="mq-amount-own-next">Continue &rarr;</button></div>` : ''}
        <div class="v2-grid-2 hq-decide" style="grid-template-columns:1fr">
          <button type="button" class="v2-tile compact ${s.amount_answered && s.desired_dwelling_amount === '' && !ownOn ? 'is-selected' : ''}" data-amount="">Not sure, help me decide</button></div>`;
      }

      case 'settlement': return `
        <h1 class="v2-heading">How should a claim on the home be paid? ${helpBtn('settlement')}</h1>
        <p class="v2-sub">Replacement cost pays for new. Actual cash value pays what it was worth, after age and wear.</p>
        ${tiles('settle', SETTLE, s.settlement, 1, true)}
        ${decideTile('settle', s.settlement)}`;

      case 'structures': return `
        <h1 class="v2-heading">Any other buildings to cover? ${helpBtn('structures')}</h1>
        <p class="v2-sub">A shed, detached garage, carport or fence on your lot.</p>
        ${tiles('struct', STRUCT, s.other_structures, 1, true)}
        ${decideTile('struct', s.other_structures)}`;

      case 'contents': {
        const preset = CONTENTS.some(x => x[0] === s.personal_property) || s.personal_property === HELP_ME;
        const ownOn = ownContentsOpen || (!!s.personal_property && !preset);
        return `
        <h1 class="v2-heading">How much coverage for your belongings? ${helpBtn('contents')}</h1>
        <p class="v2-sub">Furniture, clothes, electronics and other things you own inside the home.</p>
        <div class="v2-grid-2">${CONTENTS.filter(x => x[0] !== 'None').map(([v, t]) => `<button type="button" class="v2-tile compact ${s.personal_property === v && !ownOn ? 'is-selected' : ''}" aria-pressed="${s.personal_property === v && !ownOn}" data-contents="${v}"><span>${t}</span></button>`).join('')}
          <button type="button" class="v2-tile compact ${ownOn ? 'is-selected' : ''}" aria-pressed="${ownOn}" id="mq-own-contents"><span>Enter my own amount</span></button></div>
        ${ownOn ? `<div class="v2-col">
          <div class="v2-field"><label for="mq-contents-own">Coverage amount in dollars</label><input id="mq-contents-own" class="v2-input" type="text" inputmode="numeric" maxlength="8" placeholder="Example: 35000" value="${esc(preset ? '' : s.personal_property.replace(/[^\d]/g, ''))}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="mq-contents-own-next">Continue &rarr;</button></div>` : ''}
        <div class="v2-grid-2 hq-decide" style="grid-template-columns:1fr">
          <button type="button" class="v2-tile compact ${s.personal_property === 'None' && !ownOn ? 'is-selected' : ''}" data-contents="None">I don&rsquo;t need this</button>
          <button type="button" class="v2-tile compact ${s.personal_property === HELP_ME && !ownOn ? 'is-selected' : ''}" data-contents="${HELP_ME}">Not sure, help me decide</button></div>`;
      }

      case 'liability': return `
        <h1 class="v2-heading">How much liability coverage? ${helpBtn('liability')}</h1>
        <p class="v2-sub">Covers you when someone else is hurt or their property is damaged.</p>
        ${tiles('liab', LIABILITY, s.liability, 3, true)}
        ${decideTile('liab', s.liability)}`;

      case 'deductible': return `
        <h1 class="v2-heading">Which deductible would you like? ${helpBtn('deductible')}</h1>
        <p class="v2-sub">The amount you pay first on a covered claim.</p>
        ${tiles('deductible', DEDUCTIBLES, s.deductible, 3, true)}
        <div class="v2-grid-2 hq-decide" style="grid-template-columns:1fr">
          <button type="button" class="v2-tile compact ${s.deductible === 'not_sure' ? 'is-selected' : ''}" data-deductible="not_sure">Not sure, help me decide</button></div>`;

      case 'extras': return `
        <h1 class="v2-heading">Last two things</h1>
        <p class="v2-sub">Both are optional.</p>
        <div class="v2-group-block"><div class="v2-group-title">Would you like an auto quote too?</div><div class="v2-grid-2" style="margin-bottom:0">
          ${['yes', 'no'].map(v => `<button type="button" class="v2-tile compact ${s.bundle_auto === v ? 'is-selected' : ''}" aria-pressed="${s.bundle_auto === v}" data-bundle="${v}">${v === 'yes' ? 'Yes' : 'No'}</button>`).join('')}</div></div>
        <div class="v2-col">
          <div class="v2-field"><label for="additional_notes">Anything else we should know? (optional)</label><textarea id="additional_notes" class="v2-textarea" maxlength="1000">${esc(s.additional_notes)}</textarea></div>
          <button type="button" class="v2-btn-gold" id="mq-extras-next">Continue to review &rarr;</button>
        </div>`;

      case 'review': {
        const money = v => '$' + Number(v).toLocaleString('en-US');
        const rows = [
          ['Mobile home', `${label(STYLES, s.home_style)} \u00b7 ${s.is_owner === 'buying' ? 'buying it' : 'I own it'}`, 'own'],
          ['Address', [s.property_address, s.city, 'NC', s.zip_code].filter(Boolean).join(', '), 'address'],
          ['Land', label(LAND, s.land_ownership), 'land'],
          ['Use', label(USE, s.occupancy), 'use'],
          ['Details', `Built ${s.year_built || 'not sure'} \u00b7 ${s.square_footage ? s.square_footage + ' sq ft' : 'size not sure'} \u00b7 roof ${s.roof_year || 'not sure'}`, 'details'],
          ['Insured now', label(YNS, s.current_insurance) + (s.current_insurance === 'yes' && s.current_carrier ? ' \u00b7 ' + s.current_carrier : '') + (s.current_insurance === 'yes' && s.coverage_expiration ? ' \u00b7 ends ' + niceDate(s.coverage_expiration) : ''), 'insured'],
          ['Claims (5 years)', label(YNS, s.previous_claims) + (s.previous_claims === 'yes' ? ' \u00b7 ' + (s.claims_details || 'details not given') : ''), 'claims'],
          ['Contact', `${s.firstname} ${s.lastname} \u00b7 ${s.phone} \u00b7 ${s.email}`, 'contact'],
          ['Coverage starts', s.effective_date ? niceDate(s.effective_date) : 'Not sure yet', 'start'],
          ['Coverage on the home', s.desired_dwelling_amount ? money(s.desired_dwelling_amount) : 'Help me decide', 'amount'],
          ['Claim payment', s.settlement || HELP_ME, 'settlement'],
          ['Other buildings', s.other_structures === 'Yes' ? 'Yes' + (s.other_structures_value ? ': ' + s.other_structures_value : '') : s.other_structures || HELP_ME, 'structures'],
          ['Belongings', s.personal_property === 'None' ? 'Not needed' : s.personal_property || HELP_ME, 'contents'],
          ['Liability', s.liability || HELP_ME, 'liability'],
          ['Deductible', s.deductible && s.deductible !== 'not_sure' ? money(s.deductible) : 'Help me decide', 'deductible'],
          ['Auto quote too', s.bundle_auto === 'yes' ? 'Yes' : 'No', 'extras'],
          ['Notes', s.additional_notes || 'None', 'extras']];
        return `
        <h1 class="v2-heading">Review your quote request</h1>
        <p class="v2-sub">Tap Edit to change anything, then send.</p>
        <div class="v2-col">
          <div class="v2-review-list">${rows.map(([l, v, id]) => `
            <div class="v2-review-row"><div><div class="v2-review-label">${esc(l)}</div><div class="v2-review-val">${esc(v)}</div></div>
            <button type="button" class="v2-edit-btn" data-edit="${id}">Edit</button></div>`).join('')}</div>
          ${sendError ? `<div class="v2-error" role="alert">${esc(sendError)}</div>` : ''}
          <button type="button" class="v2-btn-gold" id="mq-send" ${sending ? 'disabled' : ''}>${sending ? 'Sending…' : 'Send my quote request'}</button>
          <p class="hq-fineprint">By sending, you confirm you have reviewed your answers. Requesting a quote does not bind, change or cancel coverage.</p>
        </div>`;
      }

      case 'done': return `
        <div class="v2-final-icon" aria-hidden="true">${icon('confirm')}</div>
        <h1 class="v2-heading">A licensed North Carolina agent is comparing mobile home insurance for you. We will send your prices by text or email within one business day.</h1>
        ${s.email ? `<p class="v2-final-confirm-email">A confirmation email is on its way to <strong>${esc(s.email)}</strong>.</p>` : ''}
        <p class="v2-sub">Request reference: <strong>${esc(confirmation)}</strong>. Have a question right now? Call us or text us below.</p>
        <div class="v2-final-actions">
          <a class="v2-btn-gold" href="tel:3368351993" data-source="mobile_home_v2_final_call">Call 336-835-1993</a>
          <a class="v2-btn-navy" href="sms:+13368279065" data-source="mobile_home_v2_final_text">Text (336) 827-9065</a>
        </div>
        ${s.bundle_auto === 'yes' ? `<div class="hq-offer"><strong>You asked for an auto quote too.</strong><p>It takes a few minutes.</p>
          <a class="v2-btn-outline" style="width:100%" href="/auto-quote?src=mobile_home_quote_done" data-source="mobile_home_quote_done_auto">Start my auto quote &rarr;</a></div>` : ''}`;
    }
    return '';
  }
  const label = (list, v) => (list.find(x => x[0] === v) || [, ''])[1];

  // ---------- What the office receives ----------
  // Office script Version 19 (2026-11-20) has its own rows for these four, so they are sent as fields, not in the notes.
  // An empty value shows as "Help me decide" in the office email.
  function coverageFields() {
    const s = state, one = t => String(t || '').replace(/\s+/g, ' ').trim(), given = t => (t && t !== HELP_ME ? t : '');
    return {
      settlement: one(given(s.settlement)).slice(0, 40),
      other_structures: one(s.other_structures === 'Yes' ? 'Yes' + (s.other_structures_value ? ': ' + s.other_structures_value : ', details not given') : given(s.other_structures)).slice(0, 120),
      personal_property: one(s.personal_property === 'None' ? 'Not needed' : given(s.personal_property)).slice(0, 40),
      liability: one(given(s.liability)).slice(0, 40)
    };
  }
  function buildPayload() {
    const s = state;
    return {
      form_type: 'mobile_home_insurance', cta_source: ctaSource,
      firstname: (TP + s.firstname).trim().slice(0, 60), lastname: s.lastname.slice(0, 60), date_of_birth: s.date_of_birth, phone: s.phone, email: s.email.slice(0, 120),
      is_owner: s.is_owner, property_address: s.property_address.slice(0, 160), city: s.city.slice(0, 80), zip_code: s.zip_code,
      home_style: s.home_style, year_built: s.year_built, occupancy: s.occupancy, land_ownership: s.land_ownership, square_footage: s.square_footage, roof_year: s.roof_year,
      current_insurance: s.current_insurance || 'not_sure', current_carrier: s.current_insurance === 'yes' ? s.current_carrier.slice(0, 100) : '',
      coverage_expiration: s.current_insurance === 'yes' ? s.coverage_expiration : '',
      previous_claims: s.previous_claims || 'not_sure', claims_details: s.previous_claims === 'yes' ? s.claims_details.slice(0, 800) : '',
      effective_date: s.effective_date, desired_dwelling_amount: s.desired_dwelling_amount, ...coverageFields(), deductible: s.deductible || 'not_sure',
      bundle_auto: s.bundle_auto === 'yes', additional_notes: (TP + s.additional_notes).trim().slice(0, 1500),
      confirm_accuracy: true   // the customer sends from the Review screen, which says so
    };
  }
  window.__MQ_PREVIEW_PAYLOAD__ = () => (LIVE ? null : buildPayload());

  async function send() {
    if (sending) return;
    if (state.effective_date && state.effective_date < todayIso()) { sendError = 'The start date has passed. Tap Edit next to “Coverage starts” and choose a new date.'; render(); return; }
    sending = true; sendError = ''; render();
    try {
      const r = await fetch('/api/quote-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.ok !== true || !/^MOBILE_HOME-[0-9]{6}-[A-Z0-9]{4}$/.test(j.confirmationNumber || '')) throw new Error('no-ack');
      confirmation = j.confirmationNumber; submitted = true;
      if (LIVE && typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form_type: 'mobile_home', cta_source: ctaSource, method: 'backend_acknowledged' });
      else track('mobile_home_v2_test_submit', { confirmation_number: confirmation });
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
    const lines = [`${TP}=== PARTIAL MOBILE HOME QUOTE LEAD (Abandoned Mid-Form) ===`.trim(), `Stopped at: ${stepId}`, `Name: ${name}`, `Phone: ${s.phone}`, `Email: ${s.email}`,
      `DOB: ${s.date_of_birth || 'Not entered'}`, `Home type: ${label(STYLES, s.home_style) || 'Not entered'}`, `Address: ${[s.property_address, s.city, 'NC', s.zip_code].filter(Boolean).join(', ')}`,
      s.effective_date ? `Start date: ${s.effective_date}` : ''].filter(Boolean);
    try {
      fetch('/api/homepage-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify({
        formType: 'contact', name: `${TP}[PARTIAL MOBILE HOME QUOTE - Stopped at: ${stepId}] ${name}`.trim().slice(0, 150),
        phone: String(s.phone).slice(0, 50), email: s.email.slice(0, 254), message: lines.join('\n').slice(0, 4900) }) }).catch(() => {});
      track(LIVE ? 'partial_lead_saved' : 'mobile_home_v2_test_partial', { stopped_at: stepId });
    } catch (_) {}
  }

  // ---------- Pop-ups: help, and a details sheet for "Yes" answers ----------
  function overlay(el, html) { el.innerHTML = html; el.hidden = false; document.body.classList.add('v2-help-open'); requestAnimationFrame(() => el.classList.add('is-in')); }
  function closeOverlay(el) { if (!el) return; el.classList.remove('is-in'); el.hidden = true; document.body.classList.remove('v2-help-open'); }
  function openHelp(key) {
    const h = HELP[key]; if (!h) return;
    if (!helpEl) { helpEl = document.createElement('div'); helpEl.className = 'v2-help-overlay'; helpEl.hidden = true; document.body.appendChild(helpEl);
      helpEl.addEventListener('click', e => { if (e.target === helpEl || e.target.closest('[data-help-close]')) closeOverlay(helpEl); }); }
    overlay(helpEl, `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="mq-help-title" tabindex="-1"><div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="mq-help-title">${esc(h.title)}</h2><button type="button" class="v2-help-x" data-help-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${esc(h.body)}</p><div class="v2-help-example"><strong>Example</strong><p>${esc(h.example)}</p></div>
      <p class="v2-help-fine">General information only. Your policy decides what is covered.</p>
      <button type="button" class="v2-btn-gold v2-help-ok" data-help-close>Got it</button></div>`);
  }
  // kind: 'claims' -> claims_details (600), 'lease' -> lease_details (800)
  function openSheet(kind) {
    const cfg = kind === 'claims'
      ? { key: 'claims_details', max: 800, title: 'Tell us about the claim', body: 'What happened, about when, and was it paid? A sentence or two is plenty.', ph: 'Example: Wind damage to the roof and skirting in 2023. Claim was paid.' }
      : kind === 'structures'
      ? { key: 'other_structures_value', max: 60, title: 'What are they, and about what are they worth?', body: 'A rough figure is fine. Our team can help you work it out.', ph: 'Example: Shed and carport, about $6,000' }
      : { key: 'lease_details', max: 800, title: 'What does your lease require?', body: 'If you know it, tell us the liability amount and whether the landlord or property manager must be listed on the policy.', ph: 'Example: $100,000 liability. List ABC Property Management as an interested party.' };
    if (!sheetEl) { sheetEl = document.createElement('div'); sheetEl.className = 'v2-help-overlay hq-claim-overlay'; sheetEl.hidden = true; document.body.appendChild(sheetEl);
      sheetEl.addEventListener('click', e => {
        const k = sheetEl.dataset.key, t = $('mq-sheet-text');
        if (e.target.closest('[data-sheet-save]')) { state[k] = (t.value || '').replace(/\s+/g, ' ').trim(); closeOverlay(sheetEl); save(); track('mobile_home_v2_step_complete'); next(); return; }
        if (e.target === sheetEl || e.target.closest('[data-sheet-close]')) { state[k] = (t.value || '').trim(); save(); closeOverlay(sheetEl); }
      }); }
    sheetEl.dataset.key = cfg.key;
    overlay(sheetEl, `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="mq-sheet-title" tabindex="-1"><div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="mq-sheet-title">${cfg.title}</h2><button type="button" class="v2-help-x" data-sheet-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${cfg.body}</p>
      <label class="hq-claim-label" for="mq-sheet-text">Details</label>
      <textarea id="mq-sheet-text" class="v2-textarea" rows="4" maxlength="${cfg.max}" placeholder="${esc(cfg.ph)}">${esc(state[cfg.key])}</textarea>
      <button type="button" class="v2-btn-gold v2-help-ok" data-sheet-save>Save and continue &rarr;</button>
      <button type="button" class="v2-btn-outline hq-claim-skip" data-sheet-save>Skip, I&rsquo;ll explain later</button></div>`);
    const t = $('mq-sheet-text'); if (t) { try { t.focus({ preventScroll: true }); } catch (_) {} }
  }
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (sheetEl && !sheetEl.hidden) closeOverlay(sheetEl); else if (helpEl && !helpEl.hidden) closeOverlay(helpEl); });

  // ---------- Render + events ----------
  function render(animate) {
    const stage = $('stage'), seq = sequence(), i = Math.max(0, seq.indexOf(stepId));
    const pct = stepId === 'done' ? 100 : Math.max(6, Math.round((i / (seq.length - 1)) * 100));
    const fill = $('v2-progress-fill'), lab = $('v2-progress-label'), bar = $('v2-progressbar');
    if (fill) fill.style.width = pct + '%'; if (lab) lab.textContent = pct + '%'; if (bar) bar.setAttribute('aria-valuenow', String(pct));
    const about = document.querySelector('.v2-about'); if (about) about.hidden = stepId !== 'own';
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
        const n = $('v2-m-next'); if (n && primary) n.addEventListener('click', () => primary.click());
      }
    }
  }
  const on = (id, fn) => { const e = $(id); if (e) e.addEventListener('click', fn); };
  const each = (sel, fn) => document.querySelectorAll(sel).forEach(fn);

  function bind() {
    on('v2-back', back);
    each('[data-help]', b => b.addEventListener('click', () => openHelp(b.dataset.help)));
    each('[data-own]', b => b.addEventListener('click', () => pick(b, () => { state.is_owner = b.dataset.own; })));
    each('[data-style]', b => b.addEventListener('click', () => pick(b, () => { state.home_style = b.dataset.style; })));
    on('mq-address-next', () => {
      state.property_address = val('property_address'); state.city = val('city'); state.zip_code = val('zip_code').replace(/\D/g, '').slice(0, 5);
      if (!state.property_address || !state.city) { showErr('Please enter the street address and city.'); return; }
      if (!/^(27|28)\d{3}$/.test(state.zip_code)) { showErr('Please enter a North Carolina ZIP code (it starts with 27 or 28).'); return; }
      fireFormStart(); save(); next();
    });
    each('[data-land]', b => b.addEventListener('click', () => pick(b, () => { state.land_ownership = b.dataset.land; state.land_answered = true; })));
    each('[data-use]', b => b.addEventListener('click', () => pick(b, () => { state.occupancy = b.dataset.use; })));
    on('mq-details-next', () => {
      const y = val('year_built'), f = val('square_footage').replace(/,/g, ''), r = val('roof_year'), maxY = new Date().getFullYear() + 1;
      const yearOk = v => !v || (/^\d{4}$/.test(v) && Number(v) >= 1900 && Number(v) <= maxY);
      if (!yearOk(y)) { showErr('Please check the year built, or leave it blank.'); return; }
      if (f && (!/^\d+$/.test(f) || Number(f) < 100 || Number(f) > 10000)) { showErr('Please check the square feet, or leave it blank.'); return; }
      if (!yearOk(r)) { showErr('Please check the roof year, or leave it blank.'); return; }
      state.year_built = y; state.square_footage = f; state.roof_year = r; save(); next();
    });
    each('[data-insured]', b => b.addEventListener('click', () => pick(b, () => { state.current_insurance = b.dataset.insured; if (state.current_insurance !== 'yes') { state.current_carrier = ''; state.coverage_expiration = ''; } })));
    each('[data-carrier]', b => b.addEventListener('click', () => {
      if (b.dataset.carrier === 'Other') { otherCarrierOpen = true; if (insurers.some(c => c.name === state.current_carrier)) state.current_carrier = ''; render(); const o = $('mq-other-carrier'); if (o) o.focus(); return; }
      otherCarrierOpen = false; pick(b, () => { state.current_carrier = b.dataset.carrier; });
    }));
    on('mq-other-carrier-next', () => { const v = val('mq-other-carrier'); if (!v) { showErr('Please enter the insurance company name, or tap Not sure.'); return; } state.current_carrier = v; otherCarrierOpen = false; next(); });
    on('mq-carrier-skip', () => { state.current_carrier = ''; otherCarrierOpen = false; next(); });
    on('mq-renewal-next', () => { const d = readDate('ex'); if (d === null) { showErr('Please enter the date as month, day and four-digit year, or tap Not sure.'); return; } state.coverage_expiration = d; save(); next(); });
    on('mq-renewal-skip', () => { state.coverage_expiration = ''; save(); next(); });
    each('[data-claims]', b => b.addEventListener('click', () => {
      if (b.dataset.claims === 'yes') { b.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); b.classList.add('is-selected'); state.previous_claims = 'yes'; save(); openSheet('claims'); return; }
      pick(b, () => { state.previous_claims = b.dataset.claims; state.claims_details = ''; });
    }));
    each('[data-start]', b => b.addEventListener('click', () => {
      const c = b.dataset.start, d = new Date();
      if (c === 'pick') { state.start_choice = 'pick'; save(); render(); const f = $('st-mm'); if (f) f.focus(); return; }
      if (c === 'none') { pick(b, () => { state.start_choice = 'none'; state.effective_date = ''; }); return; }
      if (c === 'week') d.setDate(d.getDate() + 7);
      if (c === 'month') { d.setMonth(d.getMonth() + 1, 1); }
      pick(b, () => { state.start_choice = c; state.effective_date = iso(d); });
    }));
    on('mq-start-next', () => { const d = readDate('st'); if (!d) { showErr('Please enter the start date as month, day and four-digit year.'); return; }
      if (d < todayIso()) { showErr('The start date cannot be in the past.'); return; } state.effective_date = d; save(); next(); });
    each('[data-amount]', b => b.addEventListener('click', () => { ownAmountOpen = false; document.querySelectorAll('#stage .v2-tile').forEach(t => t.classList.remove('is-selected')); pick(b, () => { state.desired_dwelling_amount = b.dataset.amount; state.amount_answered = true; }); }));
    on('mq-own-amount', () => { ownAmountOpen = true; if (AMOUNTS.some(x => x[0] === state.desired_dwelling_amount)) state.desired_dwelling_amount = ''; render(); const f = $('mq-amount-own'); if (f) f.focus(); });
    on('mq-amount-own-next', () => { const n = val('mq-amount-own').replace(/[^\d]/g, '');
      if (!n || Number(n) < 1000 || Number(n) > 5000000) { showErr('Please enter the amount in whole dollars, numbers only, for example 185000.'); return; }
      state.desired_dwelling_amount = String(Number(n)); state.amount_answered = true; ownAmountOpen = false; save(); track('mobile_home_v2_step_complete'); next(); });
    const pickOne = (attr, key) => each('[data-' + attr + ']', b => b.addEventListener('click', () => { document.querySelectorAll('#stage .v2-tile').forEach(t => t.classList.remove('is-selected')); pick(b, () => { state[key] = b.dataset[attr]; }); }));
    pickOne('settle', 'settlement'); pickOne('contents', 'personal_property'); pickOne('liab', 'liability');
    on('mq-own-contents', () => { ownContentsOpen = true; if (CONTENTS.some(x => x[0] === state.personal_property) || state.personal_property === HELP_ME) state.personal_property = ''; render(); const f = $('mq-contents-own'); if (f) f.focus(); });
    on('mq-contents-own-next', () => { const n = val('mq-contents-own').replace(/[^\d]/g, '');
      if (!n || Number(n) < 1000 || Number(n) > 2000000) { showErr('Please enter the amount in whole dollars, numbers only, for example 35000.'); return; }
      state.personal_property = '$' + Number(n).toLocaleString('en-US'); ownContentsOpen = false; save(); track('mobile_home_v2_step_complete'); next(); });
    each('[data-struct]', b => b.addEventListener('click', () => {
      document.querySelectorAll('#stage .v2-tile').forEach(t => t.classList.remove('is-selected'));
      if (b.dataset.struct === 'Yes') { b.classList.add('is-selected'); state.other_structures = 'Yes'; save(); openSheet('structures'); return; }
      pick(b, () => { state.other_structures = b.dataset.struct; state.other_structures_value = ''; });
    }));
    each('[data-deductible]', b => b.addEventListener('click', () => pick(b, () => { state.deductible = b.dataset.deductible; })));
    const ph = $('phone'); if (ph) ph.addEventListener('input', () => { ph.value = fmtPhone(ph.value); });
    on('mq-contact-next', () => {
      state.firstname = val('firstname'); state.lastname = val('lastname'); state.phone = val('phone'); state.email = val('email');
      const dob = readDate('dob');
      if (!state.firstname || !state.lastname) { showErr('Please enter your first and last name.'); return; }
      if (state.phone.replace(/\D/g, '').length !== 10) { showErr('Please enter a 10-digit phone number.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { showErr('Please enter a valid email address.'); return; }
      if (!dob || dob >= todayIso() || dob < '1900-01-01') { showErr('Please enter your date of birth as month, day and four-digit year.'); return; }
      state.date_of_birth = dob; contactDone = true; next();
    });
    each('[data-bundle]', b => b.addEventListener('click', () => { state.bundle_auto = b.dataset.bundle; save(); const n = $('additional_notes'); if (n) state.additional_notes = n.value; const y = window.scrollY; render(); window.scrollTo(0, y); }));
    const notes = $('additional_notes'); if (notes) notes.addEventListener('input', () => { state.additional_notes = notes.value; save(); });
    on('mq-extras-next', next);
    each('[data-edit]', b => b.addEventListener('click', () => { editReturn = 'review'; go(b.dataset.edit); }));
    on('mq-send', send);
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
      insurers = list.filter(c => c && c.enabled !== false && c.name !== 'Other' && !NOT_HOME_INSURERS.includes(c.name))
        .sort((a, b) => (a.order || 99) - (b.order || 99)).map(c => ({ name: c.name, logo: c.logo || '', showLabel: !!c.showLabel }));
      if (stepId === 'carrier') render();
    }).catch(() => {});
  }

  restore();
  if (!sequence().includes(stepId)) { stepId = 'own'; history = ['own']; }
  render();
})();
