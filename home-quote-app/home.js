/* Bill Layne Insurance - Home Quote V2 (tap-through). Same look and rules as /auto-quote-app/.
   One script, two modes: a live page sets window.BLI_HQ_MODE = 'live' before loading this file;
   the private test page leaves it unset and keeps every test marking. */
(function () {
  'use strict';

  const LIVE = window.BLI_HQ_MODE === 'live';
  // Landlord / rental property version: the same form and county lookup with a few different questions.
  // A page turns it on with window.BLI_HQ_VARIANT = 'landlord' before loading this file. It is sent to the office as a home request, clearly marked.
  const LL = window.BLI_HQ_VARIANT === 'landlord';
  const FIRST = LL ? 'rental' : 'own';
  const TP = LIVE ? '' : (LL ? '[TEST LANDLORD V2] ' : '[TEST HOME V2] ');
  const STORAGE_KEY = LL ? (LIVE ? 'bli_landlord_quote_session' : 'bli_landlord_v2_test_session') : (LIVE ? 'bli_home_quote_session' : 'bli_home_v2_test_session');
  const TURNSTILE_SITE_KEY = '0x4AAAAAADs4upS36xby4dVi';
  const params = new URLSearchParams(window.location.search);
  const srcParam = (params.get('src') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60);
  const ctaSource = LL ? (LIVE ? (srcParam || 'landlord_quote') : 'landlord_v2_test') : (LIVE ? (srcParam || 'direct') : 'home_v2_test');
  const IS_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  const ICON_BASE = 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-';
  const ICONS = {
    homeYes: 'home-yes-45j7s3', homeNo: 'home-no-dsrf2a', yes: 'insured-yes-8pg2wf', no: 'insured-no-mk4ws4',
    alert: 'incidents-yes-5fcxmr', ok: 'incidents-no-5atrce', upload: 'decpage-upload-jskmdu', skip: 'decpage-skip-fw8c24',
    advise: 'coverage-not-sure-jmye8d', confirm: 'confirm-dbnygk', full: 'coverage-full-g66cfp'
  };
  const icon = n => `<img src="${ICON_BASE}${ICONS[n]}.svg" alt="" class="v2-tile-icon" width="48" height="48" onerror="this.remove()">`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  // ---------- Stored values are the SAME values the current home form sends ----------
  const PROPERTY_TYPES = [['single_family', 'Single-family home'], ['condo', 'Condo or townhome'], ['mobile_home', 'Mobile or manufactured home'],
    ['rental_property', 'Rental property I own'], ['farm', 'Farm'], ['other', 'Something else']];
  const LL_RENTAL = ['Long-term rental', 'Short-term or vacation rental', 'Vacant or being renovated', 'Something else'];
  // Simple front-view drawings on the landlord building tiles (test page; same style as the mobile home drawings).
  const LL_ART = {
    single_family: '<path d="M32 22h32v16H32z"/><path d="M28 22.500L48 10l20 12.500"/><path d="M58 16.500V11h4v8"/><path d="M45 28h6v10h-6zM36 26h5v5h-5zM55 26h5v5h-5z"/>',
    condo: '<path d="M18 20v18h60V20"/><path d="M16 21.500L28 12l10 8 10-8 10 8 10-8 12 9.500"/><path d="M38 20v18M58 20v18"/><path d="M25.500 30h5v8h-5zM45.500 30h5v8h-5zM65.500 30h5v8h-5zM25.500 22.500h5v4h-5zM45.500 22.500h5v4h-5zM65.500 22.500h5v4h-5z"/>',
    duplex: '<path d="M20 22h56v16H20z"/><path d="M17 22.500L48 10l31 12.500"/><path d="M48 10v28" stroke-dasharray="3 3"/><path d="M38.500 28h5.500v10h-5.500zM52 28h5.500v10H52zM26 26h7v5h-7zM63 26h7v5h-7z"/>',
    mobile_home: '<path d="M12 22h72v14H12z"/><path d="M10 22l6-5h64l6 5"/><path d="M42 26h6v10h-6zM19 26h9v5h-9zM32 26h6v5h-6zM54 26h9v5h-9zM68 26h9v5h-9z"/><path d="M20 36v4M76 36v4M40 38h10"/>'
  };
  // Kind-of-rental drawings: a house with a key (long-term), a suitcase (vacation rental), a ladder (vacant or being renovated).
  const LL_HOUSE = '<path d="M18 24h24v14H18z"/><path d="M15 24.500L30 14l15 10.500"/><path d="M27 30h6v8h-6z"/>';
  const LL_USE_ART = {
    'Long-term rental': LL_HOUSE + '<circle cx="60" cy="27" r="5.500"/><path d="M65.500 27H82M76 27v4.500M80 27v3.500"/>',
    'Short-term or vacation rental': LL_HOUSE + '<rect x="55" y="23" width="24" height="15" rx="2.500"/><path d="M62 23v-4h10v4M61 23v15M73 23v15"/>',
    'Vacant or being renovated': LL_HOUSE + '<path d="M57 38l6-25M69 38l6-25"/><path d="M58.500 32h12M60 26h12M61.500 20h12"/>'
  };
  const llUseTile = (v, current) => !LL_USE_ART[v]
    ? `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-ll="rental_use" data-val="${v}" style="grid-column:1/-1;min-height:48px"><span>${v}</span></button>`
    : `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-ll="rental_use" data-val="${v}" style="flex-direction:column;gap:2px;padding:8px 8px 9px${v === 'Vacant or being renovated' ? ';grid-column:1/-1' : ''}">
      <svg viewBox="0 0 96 48" width="96" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;color:#05203d">${LL_USE_ART[v]}<path d="M4 40H92" stroke="#8696ab" stroke-width="1.6"/></svg>
      <span>${v}</span></button>`;
  // The same drawings on the home form's own "What kind of home is it?" tiles, plus rental (house and key) and farm (barn and silo).
  // Shown on the home test page only until Bill approves.
  const HOME_ART_ON = !LIVE;
  LL_ART.rental_property = LL_USE_ART['Long-term rental'];
  LL_ART.farm = '<path d="M24 38V25l5-8 9-4 9 4 5 8v13"/><path d="M24 25h28"/><path d="M33 29h10v9H33zM33 29l10 9M43 29l-10 9"/><path d="M60 38V19a5.500 5.500 0 0111 0v19M60 25h11M60 31h11"/>';
  const llTypeTile = ([v, t], current, half) => !LL_ART[v]   // no drawing: a slim full-width row (or a plain half tile when it sits beside a drawn one)
    ? `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-ptype="${v}" style="${half ? '' : 'grid-column:1/-1;min-height:48px'}"><span>${esc(t)}</span></button>`
    : `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-ptype="${v}" style="flex-direction:column;gap:2px;padding:8px 8px 9px">
      <svg viewBox="0 0 96 48" width="96" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;color:#05203d">${LL_ART[v]}<path d="M4 40H92" stroke="#8696ab" stroke-width="1.6"/></svg>
      <span>${esc(t)}</span></button>`;
  const LL_TYPES = [['single_family', 'Single-family house'], ['condo', 'Condo or townhome'], ['duplex', 'Duplex or multi-family'], ['mobile_home', 'Mobile or manufactured home'], ['other', 'Something else']];
  const LL_UNITS = ['1', '2', '3 or 4', '5 or more'];
  const LL_TENANT = ['Yes, a tenant lives there', 'Not yet, between tenants'];
  const LL_MANAGER = ['I manage it myself', 'A property manager does'];
  // Wording swaps for the landlord version, applied to each screen as it is drawn.
  const LL_WORDS = [['What is the address of the home?', 'What is the address of the rental property?'], ['What kind of home is it?', 'What kind of building is it?'],
    ['What year was the home built?', 'What year was it built?'], ['About how big is the home?', 'About how big is it?'], ['What is the outside of the home made of?', 'What is the outside made of?'],
    ['Is the home insured right now?', 'Is the property insured right now?'], ['Who insures the home now?', 'Who insures the property now?'],
    ['Any home insurance claims in the past 5 years?', 'Any insurance claims on this property in the past 5 years?'], ['How much coverage do you want on the home?', 'How much coverage do you want on the building?'],
    ['Does the home have a swimming pool?', 'Does the property have a swimming pool?'], ['comparing home insurance companies for you', 'comparing rental property insurance for you'],
    ['Choose your home:', 'Choose the property:'], ['Yes, that’s my home', 'Yes, that’s the property'], ['Not my home. I’ll answer myself', 'Not the right one. I’ll answer myself'],
    ['We can look up the home in county records', 'We can look up the property in county records'], ['Finding your home…', 'Finding the property…'], ['Find my home details', 'Find the property details'],
    ['North Carolina home insurance is priced by the home itself and where it sits.', 'Rental property insurance is priced by the building itself and where it sits.'],
    ['<div class="v2-review-label">Home</div>', '<div class="v2-review-label">Rental property</div>'], ['Coverage on the home', 'Coverage on the building']];
  const llWords = html => LL_WORDS.reduce((t, [a, b]) => t.split(a).join(b), html);
  const SQFT = [['under_1000', 'Under 1,000'], ['1000_1500', '1,000 to 1,500'], ['1500_2000', '1,500 to 2,000'], ['2000_2500', '2,000 to 2,500'],
    ['2500_3000', '2,500 to 3,000'], ['3000_4000', '3,000 to 4,000'], ['over_4000', 'Over 4,000'], ['not_sure', 'Not sure']];
  const CONSTRUCTION = [['frame', 'Wood frame'], ['brick', 'Brick or stone'], ['vinyl', 'Vinyl siding'], ['other', 'Something else']];
  const ROOF_TYPES = [['asphalt_shingle', 'Asphalt shingle'], ['architectural', 'Architectural shingle'], ['metal', 'Metal'],
    ['tile', 'Tile'], ['wood_shake', 'Wood shake'], ['flat', 'Flat'], ['unknown', 'Not sure']];
  const ROOF_AGES = ['Less than 5 years', '5 to 10 years', '11 to 15 years', '16 to 20 years', 'Over 20 years', 'Original roof', 'Not sure'];
  const AMOUNTS = [['under_100k', 'Under $100,000'], ['100k_150k', '$100,000 to $150,000'], ['150k_200k', '$150,000 to $200,000'],
    ['200k_250k', '$200,000 to $250,000'], ['250k_300k', '$250,000 to $300,000'], ['300k_400k', '$300,000 to $400,000'],
    ['400k_500k', '$400,000 to $500,000'], ['over_500k', 'Over $500,000']];
  const DEDUCTIBLES = [['1000', '$1,000'], ['2000', '$2,000'], ['2500', '$2,500'], ['not_sure', 'Not sure']];
  const EXTRAS = [['water_backup', 'Water backup and sump pump'], ['jewelry_valuables', 'Jewelry and valuables'],
    ['home_business', 'Home business'], ['identity_theft', 'Identity theft'], ['umbrella_interest', 'Umbrella policy']];
  const label = (list, v) => (list.find(x => x[0] === v) || [, ''])[1];

  // Current-insurer logo tiles: the same list and logos the auto form uses (/auto-quote-app/logos.json).
  // Auto-only companies are left out of the home list.
  const LOGOS_URL = (function () { try { return new URL('../auto-quote-app/logos.json', document.currentScript.src).href; } catch (_) { return '../auto-quote-app/logos.json'; } })();
  const NOT_HOME_INSURERS = ['The General', 'Direct Auto'];
  const IL = 'https://img.billlayneinsurance.com/i/2026/11/';
  let insurers = [   // fallback if logos.json cannot be read
    ['State Farm', IL + 'state-farm-insurance-logo-c4hm2m.png'], ['Allstate', IL + 'allstate-insurance-logo-nq7c5z.png'],
    ['Nationwide', IL + 'nationwide-insurance-logo-j5zp2s.png'], ['Travelers', IL + 'travelers-insurance-logo-g5kjgw.png'],
    ['Progressive', IL + 'progressive-insurance-logo-2kcvze.png'], ['Liberty Mutual', IL + 'liberty-mutual-insurance-logo-ffrtts.png'],
    ['USAA', IL + 'usaa-insurance-logo-w3dpue.png'], ['Erie', IL + 'erie-insurance-logo-c4hn3n.png'], ['Farmers', IL + 'farmers-insurance-logo-k2nas7.png']
  ].map(([name, logo]) => ({ name, logo, showLabel: false }));
  let otherCarrierOpen = false;
  function logoTile(c, selected) {
    const safe = esc(c.name);
    const inner = c.logo
      ? `<span class="v2-logo-frame"><img src="${esc(c.logo)}" alt="${safe}" width="132" height="60" class="is-carrier-logo" onerror="this.parentElement.innerHTML='<span class=\\'v2-logo-text\\'>${safe}</span>'"></span>${c.showLabel ? `<span class="v2-logo-label">${safe}</span>` : ''}`
      : `<span class="v2-logo-frame"><span class="v2-logo-text">${safe}</span></span>`;
    return `<button type="button" class="v2-tile logo-tile ${c.logo && c.showLabel ? 'has-label' : ''} ${selected ? 'is-selected' : ''}" aria-label="${safe}" aria-pressed="${selected}" data-carrier="${safe}">${inner}</button>`;
  }

  const HELP = {
    dwelling: { title: 'Dwelling coverage', body: 'The amount your policy may pay to rebuild your home after a covered loss. It is based on the cost to rebuild the house, not on what the home would sell for.',
      example: 'A kitchen fire damages the cabinets, wiring and part of the roof. Dwelling coverage may pay for the repairs, after your deductible.' },
    deductible: { title: 'Deductible', body: 'The part of a covered repair bill you pay yourself before your coverage pays. You choose the amount. A higher deductible means you pay more out of pocket when you have a claim.',
      example: 'With a $1,000 deductible and an $8,000 covered roof repair, you pay $1,000 and the policy may pay the remaining $7,000.' },
    water_backup: { title: 'Water backup and sump pump', body: 'May pay for damage when water backs up through a drain or sewer line, or when a sump pump stops working. Many home policies do not cover this unless it is added.',
      example: 'A heavy storm overwhelms the drain and water comes up through the basement floor drain, ruining the carpet.' },
    jewelry_valuables: { title: 'Jewelry and valuables', body: 'Home policies usually limit how much they pay for certain items such as jewelry, watches, guns and collectibles. Listing an item separately may raise that limit.',
      example: 'An engagement ring is stolen. Without it listed, the policy may pay only up to its standard jewelry limit.' },
    home_business: { title: 'Home business', body: 'Home policies usually give little or no coverage for business equipment, inventory, or customers who come to your home. Tell us if you run a business from the property.',
      example: 'You sell crafts online and store the inventory in a spare room.' },
    identity_theft: { title: 'Identity theft', body: 'May help with the cost of restoring your identity, such as lost wages, notary fees and legal help, after someone uses your personal information.',
      example: 'Someone opens credit cards in your name and you spend weeks clearing your records.' },
    umbrella_interest: { title: 'Umbrella policy', body: 'Extra liability coverage that sits on top of your home and auto policies. It may pay when a claim against you is larger than those policies cover.',
      example: 'A guest is seriously hurt at your home and the claim is larger than your home policy’s liability limit.' },
    roof: { title: 'Why we ask about the roof', body: 'The age and type of the roof affect which insurance companies will offer a policy and how roof damage may be paid. An honest best guess is fine; our team confirms details before any quote is final.',
      example: 'Not sure when it was replaced? Choose “Not sure” and we will look it up with you.' }
  };

  // ---------- State ----------
  const blank = () => ({
    is_owner: '', property_address: '', city: '', zip_code: '', county: '',
    property_type: '', year_built: '', square_footage: '', construction_type: '', roof_type: '', roof_age: '', roof_year_exact: '',
    closing_date: '', current_insurance: '', current_carrier: '', coverage_expiration: '', current_dwelling_amount: '',
    previous_claims: '', claim_details: '', firstname: '', lastname: '', phone: '', email: '', date_of_birth: '',
    desired_dwelling_amount: '', deductible: '', water_backup: false, jewelry_valuables: false, home_business: false,
    identity_theft: false, umbrella_interest: false, has_pool: '', liability_items: '', security_system: '', bundle_auto: '',
    additional_notes: '', lookup: null, lookupUsed: false, fromLookup: {}
  });
  let state = blank();
  let stepId = 'own';
  let history = ['own'];
  let files = [];              // {name, type, base64, size}
  let lookup = { busy: false, matches: [], picked: 0, msg: '', sample: false };
  let turnstileToken = '';
  let sending = false, sendError = '', confirmation = '', uploadFailed = false, contactDone = false, submitted = false, formStarted = false;
  let helpEl = null;

  function save() { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state, stepId, history, contactDone, t: Date.now() })); } catch (_) {} }
  function restore() {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (raw && raw.state && raw.stepId && raw.stepId !== 'done') {
        state = Object.assign(blank(), raw.state); stepId = raw.stepId; history = raw.history || [stepId]; contactDone = !!raw.contactDone;
      }
    } catch (_) {}
    // Contact details carried over from a finished auto quote ("Want a home quote too?")
    try {
      const c = JSON.parse(sessionStorage.getItem('bli_carry_contact') || 'null');
      if (c && c.email && !state.firstname && !state.email) {   // only a finished auto quote carries an email
        ['firstname', 'lastname', 'phone', 'email', 'date_of_birth'].forEach(k => { if (c[k]) state[k] = c[k]; });
        if (c.street && !state.property_address) { state.property_address = c.street; state.city = c.city || ''; state.zip_code = c.zip || ''; }
        if (!state.is_owner) state.is_owner = 'yes';
        state.bundle_auto = 'yes';
      }
    } catch (_) {}
    try { const z = params.get('zip'); if (z && /^[0-9]{5}$/.test(z) && !state.zip_code) state.zip_code = z; } catch (_) {}
  }

  function track(name, detail) {
    const base = LIVE ? { cta_source: ctaSource, form_name: LL ? 'landlord_quote' : 'home_quote', form_type: 'home_insurance', step_id: stepId }
      : { traffic_type: 'internal', cta_source: ctaSource, form_name: LL ? 'landlord_quote_v2_test' : 'home_quote_v2_test', step_id: stepId };
    if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign(base, detail || {}));
  }
  function fireFormStart() {
    if (formStarted) return; formStarted = true;
    if (LIVE && typeof window.gtag === 'function') window.gtag('event', 'form_start', { form_type: 'home_insurance', cta_source: ctaSource });
  }

  // ---------- Flow ----------
  // The auto form's upload-or-continue step: two tiles, and an upload skips the coverage questions.
  // Live since 2026-11-20 (approved by Bill).
  const HANDY_ON = true;
  const usedDec = () => HANDY_ON && !!state.used_dec && state.is_owner !== 'buying' && state.current_insurance === 'yes';
  function sequence() {
    if (state.is_owner === 'renter') return ['own', 'renter'];
    const seq = (LL ? ['rental'] : ['own']).concat(['address', 'ptype', 'year', 'sqft', 'construction', 'rooftype', 'roofage']);
    if (LL) { seq.push('units'); if (state.rental_use !== 'Vacant or being renovated') seq.push('tenant'); seq.push('manager'); }
    if (state.is_owner === 'buying') seq.push('closing'); else { seq.push('insured'); if (state.current_insurance === 'yes') { seq.push('carrier'); if (HANDY_ON) seq.push('handy'); if (!usedDec()) seq.push('current'); } }
    if (usedDec()) { seq.push('contact', 'notes', 'review', 'done'); return seq; }   // the declarations page answers the rest
    seq.push('claims', 'contact', 'dwelling', 'deductible'); if (!LL) seq.push('extras');   // the extras screen is about a home you live in
    seq.push('household', 'notes', 'review', 'done');
    return seq;
  }
  const EYEBROW = { rental: 'YOUR RENTAL', units: 'YOUR RENTAL', tenant: 'YOUR RENTAL', manager: 'YOUR RENTAL', handy: 'CURRENT COVERAGE', own: 'YOUR HOME', renter: 'RENTERS', address: 'YOUR HOME', ptype: 'YOUR HOME', year: 'YOUR HOME', sqft: 'YOUR HOME',
    construction: 'YOUR HOME', rooftype: 'THE ROOF', roofage: 'THE ROOF', closing: 'YOUR PURCHASE', insured: 'CURRENT COVERAGE', carrier: 'CURRENT COVERAGE', current: 'CURRENT COVERAGE',
    claims: 'CLAIMS', contact: 'ABOUT YOU', dwelling: 'YOUR COVERAGE', deductible: 'YOUR COVERAGE', extras: 'YOUR COVERAGE', household: 'A FEW QUICK ONES',
    notes: 'ALMOST DONE', review: 'REVIEW', done: 'QUOTE RECEIVED' };

  let editReturn = null;
  function go(id) { stepId = id; history.push(id); enter(); }
  function next() {
    const seq = sequence();
    if (editReturn && seq.includes(editReturn) && editReturn !== stepId) { const t = editReturn; editReturn = null; go(t); return; }
    editReturn = null;
    const i = seq.indexOf(stepId);
    go(seq[Math.min(i + 1, seq.length - 1)]);
  }
  function back() {
    if (history.length < 2) return;
    history.pop(); stepId = history[history.length - 1]; enter(true);
  }
  function enter(fromBack) {
    save();
    if (!fromBack) { try { window.history.pushState({ hq: stepId }, ''); } catch (_) {} }
    track('home_v2_step_view');
    render(true);
    window.scrollTo(0, 0);
  }
  function pick(btn, fn) {   // tap a tile: show it selected for a moment, then move on
    if (btn) { btn.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); btn.classList.add('is-selected'); }
    fn(); save(); track('home_v2_step_complete'); fireFormStart();
    setTimeout(next, 230);
  }

  // ---------- Small builders ----------
  const helpBtn = key => `<button type="button" class="v2-help-btn" data-help="${key}" aria-label="What is ${esc(HELP[key].title)}?">?</button>`;
  const tiles = (attr, list, current, cols, compact) => `<div class="v2-grid-${cols}">${list.map(([v, t, ic]) =>
    `<button type="button" class="v2-tile ${compact ? 'compact' : ''} ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-${attr}="${esc(v)}">${ic ? icon(ic) : ''}<span>${esc(t)}</span></button>`).join('')}</div>`;
  const fromRecord = key => state.fromLookup[key] ? `<p class="hq-from-record">From county records. Change it if it is wrong.</p>` : '';
  const yesNo = (key, q) => `<div class="v2-group-block"><div class="v2-group-title">${esc(q)}</div><div class="v2-grid-2" style="margin-bottom:0">
      ${['yes', 'no'].map(v => `<button type="button" class="v2-tile compact ${state[key] === v ? 'is-selected' : ''}" aria-pressed="${state[key] === v}" data-yn="${key}" data-val="${v}">${v === 'yes' ? 'Yes' : 'No'}</button>`).join('')}
    </div></div>`;
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
  function readDate(prefix, allowFuture) {   // '' = empty, null = invalid, else ISO
    const g = id => (document.getElementById(`${prefix}-${id}`) || {}).value || '';
    const mm = g('mm').trim(), dd = g('dd').trim(), yy = g('yyyy').trim();
    if (!mm && !dd && !yy) return '';
    const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
    if (!/^\d{4}$/.test(yy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
    if (!allowFuture && d > new Date()) return null;
    return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }
  const fmtPhone = v => { const d = (v || '').replace(/\D/g, '').slice(0, 10); return d.length >= 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length >= 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d; };
  function showErr(msg) { const e = document.getElementById('hq-err'); if (e) { e.textContent = msg; e.hidden = !msg; if (msg) e.scrollIntoView({ block: 'center' }); } }
  const ERR = '<div id="hq-err" class="v2-error" role="alert" hidden></div>';
  const why = t => `<div class="v2-why"><span class="v2-why-badge" aria-hidden="true">i</span><div><strong>Why we ask</strong><p>${t}</p></div></div>`;

  // ---------- County record lookup (same service the current home form uses: /api/home-property) ----------
  const areaRange = n => n < 1000 ? 'under_1000' : n < 1500 ? '1000_1500' : n < 2000 ? '1500_2000' : n < 2500 ? '2000_2500' : n < 3000 ? '2500_3000' : n <= 4000 ? '3000_4000' : 'over_4000';
  function mapRoofType(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const s = raw.toLowerCase().trim();
    if (/unknown|other|mixed|multiple|none|n\/a/.test(s)) return '';
    const hits = [];
    if (/architectural|dimensional|laminated/.test(s)) hits.push('architectural');
    else if (/asphalt|comp\b|composition|3[\s-]*tab|fiberglass/.test(s) || (/\bshingle\b/.test(s) && !/wood|shake|cedar|tile|slate|metal|tin|steel|aluminum/.test(s))) hits.push('asphalt_shingle');
    if (/\bmetal\b|standing seam|corrugated|\btin\b|steel|aluminum|copper/.test(s)) hits.push('metal');
    if (/\btile\b|clay|concrete tile|slate/.test(s)) hits.push('tile');
    if (/wood|shake|cedar/.test(s)) hits.push('wood_shake');
    if (/\bflat\b|membrane|epdm|tpo|built[\s-]*up|tar|gravel|roll|modified bitumen/.test(s)) hits.push('flat');
    return hits.length === 1 ? hits[0] : '';
  }
  function mapConstruction(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const s = raw.toLowerCase().trim().replace(/vinyl\s*\/\s*aluminum/g, 'vinyl');
    if (/unknown|other|mixed|multiple|stucco|aluminum|concrete block|cinder|log|metal/.test(s)) return '';
    const hits = [];
    if (/\bbrick\b|masonry|\bstone\b/.test(s)) hits.push('brick');
    if (/\bvinyl\b/.test(s)) hits.push('vinyl');
    if (/\bframe\b|\bwood\b|clapboard|hardiplank|fiber cement|masonite|weatherboard/.test(s)) hits.push('frame');
    return hits.length === 1 ? hits[0] : '';
  }
  function recordFacts(p) {
    const f = [];
    if (p.yearBuilt) f.push(['Year built', String(p.yearBuilt)]);
    if (p.heatedArea) f.push(['Heated area', Math.round(p.heatedArea).toLocaleString('en-US') + ' sq ft']);
    // County records often prefix a code ("10-Vinyl/Aluminum Siding"); show the words only.
    const plain = v => String(v).replace(/^\s*\d{1,3}\s*[-:]\s*/, '');
    if (p.exteriorWall) f.push(['Outside walls', plain(p.exteriorWall)]);
    if (p.roofCover) f.push(['Roof', plain(p.roofCover)]);
    if (p.stories) f.push(['Stories', String(p.stories)]);
    if (Number.isFinite(p.bedrooms)) f.push(['Bedrooms', String(p.bedrooms)]);
    if (p.county) f.push(['County', p.county]);
    return f;
  }
  const SOURCE_NAMES = [['taxCard', 'County property card'], ['gisParcel', 'County parcel map'], ['gis', 'County GIS'], ['deed', 'Deed lookup']];
  const OFFICE_LINKS = [['taxCard', 'County Property Card'], ['gisParcel', 'County GIS Parcel Map'], ['gis', 'County GIS'], ['deed', 'Deed Lookup'],
    ['fema', 'FEMA Flood Map'], ['ncFlood', 'NC Flood FRIS'], ['zillow', 'Zillow'], ['realtor', 'Realtor.com'], ['googleMaps', 'Google Maps']];
  const okUrl = u => typeof u === 'string' && /^https?:\/\//i.test(u);
  const pickLinks = (links, list) => (links && typeof links === 'object')
    ? list.filter(([k]) => okUrl(links[k]) && !(k === 'gis' && okUrl(links.gisParcel))).map(([k, t]) => [t, links[k]]) : [];
  const rawRecord = () => lookup.matches[lookup.picked] || null;
  const hasEdits = () => !!(lookup.overrides && Object.keys(lookup.overrides).length);
  const effRecord = () => { const r = rawRecord(); return r ? Object.assign({}, r, lookup.overrides || {}) : null; };
  const EDIT_FIELDS = [['yearBuilt', 'Year built', 'num', 1700, new Date().getFullYear() + 1], ['heatedArea', 'Heated area (sq ft)', 'num', 100, 50000],
    ['stories', 'Stories', 'num', 1, 10], ['bedrooms', 'Bedrooms', 'num', 0, 20], ['exteriorWall', 'Outside walls', 'text'], ['roofCover', 'Roof', 'text']];

  function fullAddress() {
    let a = state.property_address.trim();
    if (!a.toLowerCase().includes(state.city.trim().toLowerCase())) a += ', ' + state.city.trim();
    if (!/\bNC\b|North Carolina/i.test(a)) a += ', NC';
    if (!a.includes(state.zip_code.trim())) a += ' ' + state.zip_code.trim();
    return a;
  }
  async function runLookup() {
    lookup = { busy: true, matches: [], picked: 0, msg: '', sample: false };
    render();
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const r = await fetch('/api/home-property', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: fullAddress() }), signal: ctl.signal, credentials: 'same-origin' });
      if (!r.ok) throw new Error('unavailable');
      const d = await r.json();
      const m = (d.matches || []).filter(p => p && typeof p.address === 'string' && typeof p.parcel === 'string');
      lookup = { busy: false, matches: m, picked: 0, sample: false,
        msg: m.length ? '' : 'We could not find a county record for this address. That is fine. Tap Continue and answer a few questions about the home.' };
    } catch (_) {
      if (!LIVE && IS_LOCAL) {   // local preview has no lookup service: show a made-up record so the screen can be seen
        lookup = { busy: false, picked: 0, sample: true, msg: '', matches: [{ address: fullAddress().toUpperCase(), parcel: 'SAMPLE-0000', county: 'Surry',
          yearBuilt: 1998, heatedArea: 1842, exteriorWall: 'Brick veneer', roofCover: 'Asphalt shingle', stories: 1, bedrooms: 3,
          links: { taxCard: 'https://example.com/sample-tax-card', gisParcel: 'https://example.com/sample-parcel-map' } }] };
      } else {
        lookup = { busy: false, matches: [], picked: 0, sample: false, msg: 'We could not reach county records right now. Your answers are safe. Tap Continue and answer a few questions about the home.' };
      }
    } finally { clearTimeout(timer); }
    render();
  }
  function useRecord(p) {
    const fl = {};
    if (p.yearBuilt) { state.year_built = String(p.yearBuilt); fl.year_built = true; }
    if (p.heatedArea) { state.square_footage = areaRange(p.heatedArea); fl.square_footage = true; }
    const c = mapConstruction(p.exteriorWall); if (c) { state.construction_type = c; fl.construction_type = true; }
    const r = mapRoofType(p.roofCover); if (r) { state.roof_type = r; fl.roof_type = true; }
    if (p.county) state.county = p.county;
    state.lookup = { address: p.address, parcel: p.parcel, county: p.county || '', facts: recordFacts(p), sample: !!lookup.sample,
      edited: hasEdits() ? Object.keys(lookup.overrides) : [], links: pickLinks(p.links, OFFICE_LINKS) };
    state.lookupUsed = true; state.fromLookup = fl;
  }

  // ---------- Screens ----------
  function screen() {
    const s = state;
    switch (stepId) {
      case 'rental': return `
        <h1 class="v2-heading">What kind of rental property is it?</h1>
        <p class="v2-sub">Tap an option to start. A licensed North Carolina team compares rental property insurance for you.</p>
        <div class="v2-grid-2">${LL_RENTAL.map(v => llUseTile(v, s.rental_use)).join('')}</div>`;

      case 'units': return `
        <h1 class="v2-heading">How many units are in the building?</h1>
        <p class="v2-sub">A single house is 1. A duplex is 2.</p>
        <div class="v2-grid-2">${LL_UNITS.map(v => `<button type="button" class="v2-tile compact ${s.rental_units === v ? 'is-selected' : ''}" aria-pressed="${s.rental_units === v}" data-ll="rental_units" data-val="${v}"><span>${v}</span></button>`).join('')}</div>`;

      case 'tenant': return `
        <h1 class="v2-heading">Is it rented right now?</h1>
        <p class="v2-sub">Insurance companies ask whether someone is living there.</p>
        <div class="v2-grid-2" style="grid-template-columns:1fr">${LL_TENANT.map(v => `<button type="button" class="v2-tile compact ${s.rental_tenant === v ? 'is-selected' : ''}" aria-pressed="${s.rental_tenant === v}" data-ll="rental_tenant" data-val="${v}"><span>${v}</span></button>`).join('')}</div>`;

      case 'manager': return `
        <h1 class="v2-heading">Who looks after the property?</h1>
        <p class="v2-sub">Who handles repairs and deals with the tenant.</p>
        <div class="v2-grid-2" style="grid-template-columns:1fr">${LL_MANAGER.map(v => `<button type="button" class="v2-tile compact ${s.rental_manager === v ? 'is-selected' : ''}" aria-pressed="${s.rental_manager === v}" data-ll="rental_manager" data-val="${v}"><span>${v}</span></button>`).join('')}</div>`;

      case 'own': return `
        <h1 class="v2-heading">Do you own the home you want to insure?</h1>
        <p class="v2-sub">Tap an option to start. A licensed North Carolina team compares home insurance companies for you.</p>
        ${tiles('own', [['yes', 'I own it', 'homeYes'], ['buying', 'I’m buying it', 'full'], ['renter', 'I rent', 'homeNo']], s.is_owner, 3)}`;

      case 'renter': return `
        <h1 class="v2-heading">Renting? We have a shorter form for you.</h1>
        <p class="v2-sub">Renters insurance covers your belongings and your liability, not the building. It takes about two minutes.</p>
        <div class="v2-actions-stack"><a class="v2-btn-gold" href="${LIVE ? '/renters-quote?src=home_quote_renter' : '../renters-quote-v2-test/?src=home_quote_renter'}" data-source="home_quote_renter_handoff">Start a renters quote &rarr;</a>
        <button type="button" class="v2-btn-outline" style="width:100%" id="hq-not-renter">I own or am buying the home</button></div>`;

      case 'address': {
        const p = effRecord();
        const sources = p ? pickLinks(p.links, SOURCE_NAMES).map(x => x[0]) : [];
        const editor = p && lookup.editing ? `
            <div class="hq-editor">
              <div class="hq-editor-title">Update anything that has changed</div>
              <div class="hq-editor-grid">${EDIT_FIELDS.map(([k, t, kind]) => `
                <div class="v2-field"><label for="hq-ed-${k}">${t}</label>
                  <input id="hq-ed-${k}" class="v2-input" type="text" ${kind === 'num' ? 'inputmode="decimal"' : 'maxlength="80" autocapitalize="words"'} value="${esc(p[k] == null ? '' : p[k])}"></div>`).join('')}
              </div>
              <div id="hq-ed-err" class="v2-field-err" role="alert" hidden></div>
              <div class="hq-editor-actions">
                <button type="button" class="v2-btn-navy" id="hq-ed-save">Save changes</button>
                <button type="button" class="v2-btn-outline" id="hq-ed-cancel">Cancel</button>
              </div>
            </div>` : '';
        const found = p ? `
          <div class="hq-record">
            <div class="hq-record-kick">${lookup.sample ? 'Sample record (test preview only)' : 'We found a county record'}</div>
            <div class="hq-record-addr">${esc(p.address)}</div>
            ${lookup.matches.length > 1 ? `<label class="hq-record-pick" for="hq-match">More than one record matched. Choose your home:</label>
              <select id="hq-match" class="v2-select">${lookup.matches.map((m, i) => `<option value="${i}" ${i === lookup.picked ? 'selected' : ''}>${esc(m.address)} — Parcel ${esc(m.parcel)}</option>`).join('')}</select>` : ''}
            <dl class="hq-facts">${recordFacts(p).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
            ${hasEdits() ? '<p class="hq-record-edited">Includes your updates.</p>' : ''}
            ${editor}
            ${lookup.editing ? '' : `<div class="hq-record-tools">
              <button type="button" class="hq-link-btn" id="hq-ed-open">Edit these details</button>
              ${hasEdits() ? '<button type="button" class="hq-link-btn" id="hq-ed-reset">Reset to county record</button>' : ''}
            </div>`}
            ${sources.length ? `<p class="hq-record-sources">Public record sources: ${sources.map(esc).join(' \u00b7 ')}</p>` : ''}
            <p class="hq-record-note">Public county records can be out of date. You can change any answer on the next screens.</p>
          </div>
          <div class="v2-actions-stack">
            <button type="button" class="v2-btn-gold" id="hq-use-record">Yes, that’s my home &rarr;</button>
            <button type="button" class="v2-btn-outline" style="width:100%" id="hq-skip-record">Not my home. I’ll answer myself</button>
          </div>` : '';
        return `
        <h1 class="v2-heading">${s.is_owner === 'buying' ? 'What is the address of the home you’re buying?' : 'What is the address of the home?'}</h1>
        <p class="v2-sub">We can look up the home in county records and fill in the details for you.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="property_address">Street address</label>
            <input id="property_address" class="v2-input" type="text" autocomplete="street-address" autocapitalize="words" enterkeyhint="next" value="${esc(s.property_address)}"></div>
          <div class="hq-two">
            <div class="v2-field"><label for="city">City</label><input id="city" class="v2-input" type="text" autocomplete="address-level2" autocapitalize="words" value="${esc(s.city)}"></div>
            <div class="v2-field"><label for="zip_code">ZIP</label><input id="zip_code" class="v2-input" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(s.zip_code)}"></div>
          </div>
          ${ERR}
          ${lookup.msg ? `<p class="hq-lookup-msg" role="status">${esc(lookup.msg)}</p>` : ''}
          ${found || `<div class="v2-actions-stack">
            <button type="button" class="v2-btn-gold" id="hq-find" ${lookup.busy ? 'disabled' : ''}>${lookup.busy ? 'Finding your home…' : 'Find my home details &rarr;'}</button>
            <button type="button" class="v2-btn-outline" style="width:100%" id="hq-addr-skip">${lookup.msg ? 'Continue &rarr;' : 'Skip the lookup'}</button>
          </div>`}
        </div>
        ${why('North Carolina home insurance is priced by the home itself and where it sits. The address lets our team check the right county and fire district.')}`;
      }

      case 'ptype': return `
        <h1 class="v2-heading">What kind of home is it?</h1>
        <p class="v2-sub">${LL || HOME_ART_ON ? 'Tap the one that looks like it.' : 'Choose the closest match.'}</p>
        ${LL ? `<div class="v2-grid-2">${LL_TYPES.map(t => llTypeTile(t, s.property_type)).join('')}</div>`
          : HOME_ART_ON ? `<div class="v2-grid-2">${PROPERTY_TYPES.map(t => llTypeTile(t, s.property_type, true)).join('')}</div>`
          : tiles('ptype', PROPERTY_TYPES, s.property_type, 2, true)}`;

      case 'year': return `
        <h1 class="v2-heading">What year was the home built?</h1>
        <p class="v2-sub">A best guess is fine.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="year_built">Year built</label>
            <input id="year_built" class="v2-input hq-year" type="text" inputmode="numeric" maxlength="4" placeholder="Example: 1998" value="${esc(s.year_built)}">${fromRecord('year_built')}</div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="hq-year-next">Continue &rarr;</button>
          <button type="button" class="v2-btn-outline" style="width:100%" id="hq-year-skip">Not sure</button></div>
        </div>`;

      case 'sqft': return `
        <h1 class="v2-heading">About how big is the home?</h1>
        <p class="v2-sub">Heated square feet. A rough range is all we need.</p>
        ${fromRecord('square_footage')}
        ${tiles('sqft', SQFT, s.square_footage, 2, true)}`;

      case 'construction': return `
        <h1 class="v2-heading">What is the outside of the home made of?</h1>
        <p class="v2-sub">Choose what covers most of the outside walls.</p>
        ${fromRecord('construction_type')}
        ${tiles('construction', CONSTRUCTION, s.construction_type, 2, true)}`;

      case 'rooftype': return `
        <h1 class="v2-heading">What kind of roof does it have? ${helpBtn('roof')}</h1>
        <p class="v2-sub">Choose the closest match.</p>
        ${fromRecord('roof_type')}
        ${tiles('rooftype', ROOF_TYPES, s.roof_type, 2, true)}`;

      case 'roofage': return `
        <h1 class="v2-heading">How old is the roof? ${helpBtn('roof')}</h1>
        <p class="v2-sub">Since it was last fully replaced. A best guess is fine.</p>
        ${tiles('roofage', ROOF_AGES.map(a => [a, a]), s.roof_age, 2, true)}`;

      case 'closing': return `
        <h1 class="v2-heading">When do you expect to close?</h1>
        <p class="v2-sub">Your lender will need proof of insurance before closing. A rough date is fine.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="cl-mm">Closing date (optional)</label>${dateBoxes('cl', s.closing_date, 'Closing date')}</div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="hq-closing-next">Continue &rarr;</button>
          <button type="button" class="v2-btn-outline" style="width:100%" id="hq-closing-skip">Not sure yet</button></div>
        </div>`;

      case 'insured': return `
        <h1 class="v2-heading">Is the home insured right now?</h1>
        <p class="v2-sub">Whether you have a policy now or are starting fresh, our team can help.</p>
        ${tiles('insured', [['yes', 'Yes', 'yes'], ['no', 'No', 'no']], s.current_insurance, 2)}`;

      case 'carrier': {
        const known = insurers.some(c => c.name === s.current_carrier);
        const otherOn = otherCarrierOpen || (!!s.current_carrier && !known);
        return `
        <h1 class="v2-heading">Who insures the home now?</h1>
        <p class="v2-sub">Tap your current company so our team knows what to compare against.</p>
        <div class="v2-grid-3">
          ${insurers.map(c => logoTile(c, s.current_carrier === c.name)).join('')}
          ${logoTile({ name: 'Other', logo: '' }, otherOn)}
        </div>
        ${otherOn ? `<div class="v2-col">
          <div class="v2-field"><label for="hq-other-carrier">Enter your current insurance company</label>
            <input id="hq-other-carrier" class="v2-input" type="text" autocapitalize="words" value="${esc(known ? '' : s.current_carrier)}"></div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="hq-other-carrier-next">Continue &rarr;</button>
        </div>` : ''}
        <div class="v2-actions-stack"><button type="button" class="v2-btn-outline" style="width:100%" id="hq-carrier-skip">Not sure</button></div>`;
      }

      case 'handy': {
        const showUp = s.dec_choice === 'upload' || (files.length > 0 && s.dec_choice !== 'questions');
        return `
        <h1 class="v2-heading">Have your policy handy?</h1>
        <p class="v2-sub">Upload your declarations page and skip most of the questions.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile ${showUp ? 'is-selected' : ''}" aria-pressed="${showUp}" id="hq-handy-upload">${icon('upload')}<span>Upload my declarations page</span></button>
          <button type="button" class="v2-tile ${s.dec_choice === 'questions' ? 'is-selected' : ''}" aria-pressed="${s.dec_choice === 'questions'}" id="hq-handy-skip">${icon('skip')}<span>Keep answering questions</span></button>
        </div>
        ${showUp ? `<div class="v2-col">${uploadBox('Your declarations page')}
          ${files.length ? `<div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="hq-handy-next">Continue with ${files.length} file${files.length > 1 ? 's' : ''} &rarr;</button></div>` : ''}</div>` : ''}`;
      }

      case 'current': return `
        <h1 class="v2-heading">Tell us about your ${s.current_carrier ? esc(s.current_carrier) + ' ' : 'current '}policy</h1>
        <p class="v2-sub">${HANDY_ON ? 'Both are optional. They are on your policy or your bill.' : 'Have your policy handy? A photo of the declarations page answers all of this.'}</p>
        <div class="v2-col">
          ${HANDY_ON ? '' : uploadBox()}
          <div class="v2-field"><label for="ex-mm">Renewal date (optional)</label>${dateBoxes('ex', s.coverage_expiration, 'Renewal date')}</div>
          <div class="v2-field"><label for="current_dwelling_amount">Dwelling coverage on your policy now (optional)</label>
            <select id="current_dwelling_amount" class="v2-select"><option value="">Not sure</option>${AMOUNTS.map(([v, t]) => `<option value="${v}" ${s.current_dwelling_amount === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="hq-current-next">Continue &rarr;</button>
        </div>`;

      case 'claims': return `
        <h1 class="v2-heading">Any home insurance claims in the past 5 years?</h1>
        <p class="v2-sub">On this home or a home you owned before.</p>
        ${tiles('claims', [['yes', 'Yes'], ['no', 'No']], s.previous_claims, 2, true)}
        ${why('Past claims affect which companies can offer a policy. Knowing up front helps our team match you with the right ones.')}`;

      case 'contact': return `
        <h1 class="v2-heading">You&rsquo;re halfway there. Who is this quote for?</h1>
        <p class="v2-sub"><strong>Next: the coverage you&rsquo;d like.</strong> We send your quotes by text or email.</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="firstname">First name</label><input id="firstname" class="v2-input" type="text" autocomplete="given-name" autocapitalize="words" value="${esc(s.firstname)}"></div>
            <div class="v2-field"><label for="lastname">Last name</label><input id="lastname" class="v2-input" type="text" autocomplete="family-name" autocapitalize="words" value="${esc(s.lastname)}"></div>
          </div>
          <div class="v2-field"><label for="phone">Mobile phone</label><input id="phone" class="v2-input" type="tel" inputmode="tel" autocomplete="tel" value="${esc(s.phone)}"></div>
          <div class="v2-field"><label for="email">Email</label><input id="email" class="v2-input" type="email" inputmode="email" autocomplete="email" autocapitalize="off" value="${esc(s.email)}"></div>
          <div class="v2-field"><label for="dob-mm">Date of birth</label>${dateBoxes('dob', s.date_of_birth, 'Date of birth')}</div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="hq-contact-next">Next: your coverage &rarr;</button>
        </div>
        ${why('Insurance companies use the homeowner’s name and date of birth to price a policy. We never sell your information.')}`;

      case 'dwelling': return `
        <h1 class="v2-heading">How much coverage do you want on the home? ${helpBtn('dwelling')}</h1>
        <p class="v2-sub">This is the cost to rebuild, not the sale price. Most people let our team work it out.</p>
        ${tiles('dwelling', AMOUNTS, s._dwPicked ? s.desired_dwelling_amount : '\u0000', 2, true)}
        <div class="v2-grid-2 hq-decide" style="grid-template-columns:1fr">
          <button type="button" class="v2-tile compact ${s.desired_dwelling_amount === '' && s._dwPicked ? 'is-selected' : ''}" data-dwelling="">Not sure, help me decide</button>
        </div>`;

      case 'deductible': return `
        <h1 class="v2-heading">Which deductible would you like? ${helpBtn('deductible')}</h1>
        <p class="v2-sub">The amount you pay first on a covered claim.</p>
        ${tiles('deductible', DEDUCTIBLES, s.deductible, 2, true)}`;

      case 'extras': return `
        <h1 class="v2-heading">Any extras to include in your quote?</h1>
        <p class="v2-sub">Choose any that apply, or just continue.</p>
        <div class="v2-col">
          <div class="v2-check-list v2-check-list-boxed">${EXTRAS.map(([k, t]) => `
            <div class="v2-check-row"><button type="button" class="v2-check ${s[k] ? 'is-on' : ''}" role="checkbox" aria-checked="${!!s[k]}" data-extra="${k}">
              <span class="v2-check-box" aria-hidden="true"></span><span>${esc(t)}</span></button>${helpBtn(k)}</div>`).join('')}</div>
          <button type="button" class="v2-btn-gold" id="hq-extras-next">Continue &rarr;</button>
        </div>`;

      case 'household': {
        const done = s.has_pool && s.liability_items && s.security_system && s.bundle_auto;
        return `
        <h1 class="v2-heading">A few quick yes or no questions</h1>
        <p class="v2-sub">These help our team check discounts and liability options.</p>
        ${yesNo('has_pool', 'Does the home have a swimming pool?')}
        ${yesNo('liability_items', 'Any trampolines, dogs or farm animals on the property?')}
        ${yesNo('security_system', 'Does it have an alarm or security system?')}
        ${yesNo('bundle_auto', 'Would you like an auto quote too?')}
        ${ERR}
        <div class="v2-actions-stack">${done ? '<button type="button" class="v2-btn-gold" id="hq-house-next">Continue &rarr;</button>' : ''}</div>`;
      }

      case 'notes': return `
        <h1 class="v2-heading">Anything else we should know? (optional)</h1>
        <p class="v2-sub">Recent updates, a new roof, questions, or the best time to reach you.</p>
        <div class="v2-col">
          ${s.current_insurance === 'yes' ? '' : uploadBox('Have photos or documents to share? (optional)')}
          <div class="v2-field"><label for="additional_notes">Notes</label><textarea id="additional_notes" class="v2-textarea">${esc(s.additional_notes)}</textarea></div>
          <button type="button" class="v2-btn-gold" id="hq-notes-next">Continue to review &rarr;</button>
        </div>`;

      case 'review': {
        let rows = [
          ['Home', `${s.property_address}, ${s.city}, NC ${s.zip_code}${s.county ? ' · ' + s.county + ' County' : ''}`, 'address'],
          (LL ? ['Kind of rental', s.rental_use || 'Not answered', 'rental'] : ['Ownership', s.is_owner === 'buying' ? `Buying${s.closing_date ? ' · closing ' + s.closing_date : ''}` : 'I own it', 'own']),
          [LL ? 'Type of building' : 'Type of home', label(LL ? LL_TYPES : PROPERTY_TYPES, s.property_type) || 'Not answered', 'ptype'],
          ['Year built', s.year_built || 'Not sure', 'year'],
          ['Size', label(SQFT, s.square_footage) ? label(SQFT, s.square_footage) + (s.square_footage === 'not_sure' ? '' : ' sq ft') : 'Not answered', 'sqft'],
          ['Outside walls', label(CONSTRUCTION, s.construction_type) || 'Not answered', 'construction'],
          ['Roof', `${label(ROOF_TYPES, s.roof_type) || 'Not answered'} · ${s.roof_age || 'age not answered'}`, 'rooftype']
        ];
        if (s.is_owner !== 'buying') rows.push(['Current insurance', s.current_insurance === 'yes'
          ? `Yes${s.current_carrier ? ' · ' + s.current_carrier : ''}${s.coverage_expiration ? ' · renews ' + s.coverage_expiration : ''}` : 'No', 'insured']);
        rows.push(
          ['Claims (5 years)', cap(s.previous_claims) + (s.previous_claims === 'yes' ? ' \u00b7 ' + (s.claim_details || 'details not given') : ''), 'claims'],
          ['Contact', `${s.firstname} ${s.lastname} · ${s.phone} · ${s.email}`, 'contact'],
          ['Coverage on the home', label(AMOUNTS, s.desired_dwelling_amount) || 'Help me decide', 'dwelling'],
          ['Deductible', label(DEDUCTIBLES, s.deductible) || 'Not answered', 'deductible'],
          ['Extras', EXTRAS.filter(([k]) => s[k]).map(x => x[1]).join(', ') || 'None', 'extras'],
          ['Quick questions', `Pool: ${cap(s.has_pool)} · Trampoline, dogs or farm animals: ${cap(s.liability_items)} · Alarm: ${cap(s.security_system)} · Auto quote too: ${cap(s.bundle_auto)}`, 'household'],
          ['Notes', s.additional_notes || 'None', 'notes']);
        if (LL) {
          rows = rows.filter(r => r[2] !== 'extras');
          const at = rows.findIndex(r => r[2] === 'rooftype') + 1;
          rows.splice(at, 0, ['Units', s.rental_units || 'Not answered', 'units'], ...(s.rental_use === 'Vacant or being renovated' ? [] : [['Rented now', s.rental_tenant || 'Not answered', 'tenant']]), ['Looked after by', s.rental_manager || 'Not answered', 'manager']);
        }
        if (usedDec()) {
          rows = rows.filter(r => !['claims', 'dwelling', 'deductible', 'extras', 'household'].includes(r[2]));
          rows.splice(rows.length - 1, 0, ['Your policy', `Declarations page attached (${files.length} file${files.length > 1 ? 's' : ''}). Our team will take your coverage details from it.`, 'handy']);
        }
        if (files.length) rows.push(['Attached', files.map(f => f.name).join(', '), s.current_insurance === 'yes' ? (HANDY_ON ? 'handy' : 'current') : 'notes']);
        return `
        <h1 class="v2-heading">Review your quote request</h1>
        <p class="v2-sub">Tap Edit to change anything, then send.</p>
        <div class="v2-col">
          <div class="v2-review-list">${rows.map(([l, v, id]) => `
            <div class="v2-review-row"><div><div class="v2-review-label">${esc(l)}</div><div class="v2-review-val">${esc(v)}</div></div>
            <button type="button" class="v2-edit-btn" data-edit="${id}">Edit</button></div>`).join('')}</div>
          <div class="v2-turnstile-wrap" id="hq-turnstile"></div>
          ${sendError ? `<div class="v2-error" role="alert">${esc(sendError)}</div>` : ''}
          <button type="button" class="v2-btn-gold" id="hq-send" ${sending ? 'disabled' : ''}>${sending ? 'Sending…' : 'Send my quote request'}</button>
          <p class="hq-fineprint">Requesting a quote does not bind, change or cancel coverage.</p>
        </div>`;
      }

      case 'done': return `
        <div class="v2-final-icon" aria-hidden="true">${icon('confirm')}</div>
        <h1 class="v2-heading">A licensed North Carolina agent is comparing home insurance companies for you. We will send your prices by text or email within one business day.</h1>
        ${s.email ? `<p class="v2-final-confirm-email">A confirmation email is on its way to <strong>${esc(s.email)}</strong>.</p>` : ''}
        <p class="v2-sub">Request reference: <strong>${esc(confirmation)}</strong>. Have a question right now? Call us or text us below.</p>
        ${uploadFailed ? '<div class="v2-upload-warn" role="alert"><div class="v2-upload-warn-title">Your quote request was received, but your files did not upload.</div>Please text a photo to (336) 827-9065 or reply to your confirmation email with the file.</div>' : ''}
        <div class="v2-final-actions">
          <a class="v2-btn-gold" href="tel:3368351993" data-source="home_v2_final_call">Call 336-835-1993</a>
          <a class="v2-btn-navy" href="sms:+13368279065" data-source="home_v2_final_text">Text (336) 827-9065</a>
        </div>
        ${s.bundle_auto === 'yes' ? `<div class="hq-offer"><strong>You asked for an auto quote too.</strong><p>It takes a few minutes and your contact details carry over.</p>
          <a class="v2-btn-outline" style="width:100%" href="/auto-quote?src=home_quote_done" data-source="home_quote_done_auto">Start my auto quote &rarr;</a></div>` : ''}`;
    }
    return '';
  }

  function uploadBox(title) {
    return `<div class="v2-field"><label>${esc(title || 'Snap a photo of your current policy (optional)')}</label>
      <div class="v2-upload-box">
        <div class="v2-upload-btns">
          <button type="button" class="v2-btn-navy" id="hq-file-btn">Choose files (PDF or photo)</button>
          <button type="button" class="v2-btn-outline" id="hq-cam-btn">Take a photo</button>
        </div>
        <input type="file" id="hq-file" accept="application/pdf,image/*" multiple hidden>
        <input type="file" id="hq-cam" accept="image/*" capture="environment" hidden>
        <div class="v2-upload-meta">PDF, JPG, PNG or HEIC &middot; Up to 6 files &middot; Photos are resized automatically</div>
        ${files.length ? `<ul class="hq-files">${files.map((f, i) => `<li><span>${esc(f.name)}</span><button type="button" class="v2-edit-btn" data-rmfile="${i}">Remove</button></li>`).join('')}</ul>` : ''}
        <div id="hq-file-err" class="v2-field-err" role="alert" hidden></div>
      </div></div>`;
  }

  // ---------- Files: shrink large photos in the browser, same limits as the upload service ----------
  const toB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
  async function shrink(file) {
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
  async function addFiles(list) {
    const errEl = document.getElementById('hq-file-err'); let err = '';
    for (const raw of Array.from(list || [])) {
      if (files.length >= 6) { err = 'You can attach up to 6 files.'; break; }
      const f = await shrink(raw);
      if (f.size > 8 * 1024 * 1024) { err = `${raw.name} is larger than 8 MB.`; continue; }
      if (files.reduce((a, x) => a + x.size, 0) + f.size > 12 * 1024 * 1024) { err = 'Those files are too large together (12 MB limit).'; break; }
      files.push({ name: f.name, type: f.type || 'application/octet-stream', size: f.size, base64: await toB64(f) });
    }
    render();
    if (err) { const e = document.getElementById('hq-file-err'); if (e) { e.textContent = err; e.hidden = false; } } else if (errEl) errEl.hidden = true;
  }

  // ---------- What the office receives: the same field names and stored values as the current home form ----------
  function buildPayload() {
    const s = state;
    const roofYear = /^\d{4}$/.test(s.roof_year_exact) ? s.roof_year_exact : (s.roof_age === 'Original roof' && /^\d{4}$/.test(s.year_built) ? s.year_built : '');
    const notes = [
      LL ? `*** LANDLORD / RENTAL PROPERTY QUOTE - the customer does NOT live here *** Kind of rental: ${s.rental_use || 'not answered'} · Building: ${label(LL_TYPES, s.property_type) || 'not answered'} · Units: ${s.rental_units || 'not answered'} · Rented now: ${s.rental_use === 'Vacant or being renovated' ? 'vacant' : (s.rental_tenant || 'not answered')} · Looked after by: ${s.rental_manager || 'not answered'}` : '',
      s.additional_notes.trim(),
      s.roof_age ? `Roof age: ${s.roof_age}` : '',
      s.previous_claims === 'yes' ? `Claim details: ${s.claim_details || 'not given'}` : '',
      s.is_owner === 'buying' ? `BUYING THIS HOME${s.closing_date ? ' | Expected closing: ' + s.closing_date : ''}` : '',
      s.lookupUsed && s.lookup ? `County record used (customer confirmed${s.lookup.edited && s.lookup.edited.length ? '; customer UPDATED: ' + s.lookup.edited.join(', ') : ''}): ${s.lookup.address} | Parcel ${s.lookup.parcel} | ${s.lookup.facts.map(f => f.join(': ')).join(' · ')}` : '',
      s.lookupUsed && s.lookup && s.lookup.links && s.lookup.links.length ? `Official & research links: ${s.lookup.links.map(l => l.join(': ')).join(' ; ')}` : '',
      usedDec() ? 'DECLARATIONS PAGE UPLOADED - the customer chose to skip the coverage questions. Take coverage, deductible, extras and claims from the attached page or ask.' : '',
      files.length ? `[Declarations page / files: ${files.map(f => f.name).join(', ')}]` : '',
      (LIVE && /^(travelers|alamance|ncgrange|universal)_/.test(srcParam)) ? `Quote source: ${srcParam}` : ''
    ].filter(Boolean).join(' | ');
    const now = new Date();
    const conf = `HOME-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    return {
      form_type: 'home_insurance',
      firstname: (TP + s.firstname).trim(), lastname: s.lastname, date_of_birth: s.date_of_birth, email: s.email, phone: s.phone,
      is_owner: LL ? 'LANDLORD - rental property' : s.is_owner, property_address: s.property_address, city: s.city, zip_code: s.zip_code,
      property_type: LL ? 'rental_property' + (s.property_type ? ' (' + s.property_type + ')' : '') : s.property_type, year_built: s.year_built, square_footage: s.square_footage, construction_type: s.construction_type,
      roof_type: s.roof_type, roof_year: roofYear,
      current_insurance: s.is_owner === 'buying' ? 'no' : s.current_insurance, current_carrier: s.current_carrier, coverage_expiration: s.coverage_expiration,
      current_dwelling_amount: s.current_dwelling_amount, previous_claims: s.previous_claims,
      desired_dwelling_amount: s.desired_dwelling_amount, deductible: s.deductible,
      water_backup: !!s.water_backup, jewelry_valuables: !!s.jewelry_valuables, home_business: !!s.home_business, flood_interest: false,
      identity_theft: !!s.identity_theft, umbrella_interest: !!s.umbrella_interest,
      bundle_auto: s.bundle_auto, has_pool: s.has_pool, liability_items: s.liability_items, security_system: s.security_system,
      additional_notes: (TP + notes).trim(), county: s.county, lead_source: ctaSource, cta_source: ctaSource,
      confirmation_number: conf, turnstile_token: turnstileToken
    };
  }
  window.__HQ_PREVIEW_PAYLOAD__ = () => (LIVE ? null : buildPayload());   // test page only: lets us inspect what would be sent

  // Attached files live in memory only. If the page was reloaded they are gone, so the skipped questions come back.
  function decFilesLost() {
    if (!(HANDY_ON && state.used_dec) || files.length) return false;
    state.used_dec = false; state.dec_choice = ''; save(); return true;
  }
  async function send() {
    if (sending) return;
    if (decFilesLost()) { stepId = 'handy'; history = [FIRST, 'handy']; sendError = ''; render(true); window.scrollTo(0, 0); return; }
    if (!turnstileToken) { sendError = 'Please wait a moment for the security check to finish, then tap Send again.'; render(); return; }
    sending = true; sendError = ''; render();
    const payload = buildPayload();
    try {
      const r = await fetch('/api/quote-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.ok !== true || !j.confirmationNumber) throw new Error('no-ack');
      confirmation = j.confirmationNumber; submitted = true;
      if (LIVE && typeof window.gtag === 'function') {
        window.gtag('event', 'form_submit', { form_type: 'home_insurance', confirmation_number: confirmation });
        window.gtag('event', 'generate_lead', { lead_type: 'quote', service_line: LL ? 'landlord' : 'home', form_name: LL ? 'landlord_quote' : 'home_quote', method: 'backend_acknowledged' });
      } else track('home_v2_test_submit', { confirmation_number: confirmation });
      if (files.length) {
        try {
          const u = await fetch('/api/policy-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
            formType: 'policy-upload', policyType: 'home', name: (TP + state.firstname + ' ' + state.lastname).trim().slice(0, 150), phone: state.phone, email: state.email,
            currentCarrier: state.current_carrier.slice(0, 150), renewalDate: state.coverage_expiration, notes: (TP + 'Ref: ' + confirmation + ' | ' + payload.additional_notes).trim().slice(0, 6000),
            files: files.map(f => ({ name: f.name, type: f.type, base64: f.base64 })) }) });
          const uj = await u.json().catch(() => ({}));
          if (!u.ok || uj.ok !== true) uploadFailed = true;
        } catch (_) { uploadFailed = true; }
      }
      try { sessionStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem('bli_carry_contact'); } catch (_) {}
      sending = false; stepId = 'done'; history = ['done']; render(true); window.scrollTo(0, 0);
    } catch (_) {
      sending = false;
      sendError = 'We could not confirm receipt of your quote request. Your answers are still here. Please try again or call us at 336-835-1993.';
      render();
    }
  }

  // If someone leaves after giving contact details but before sending, tell the office so the team can follow up.
  function sendPartial() {
    if (!contactDone || submitted || sendPartial.sent || !state.email) return;
    sendPartial.sent = true;
    const s = state, name = `${s.firstname} ${s.lastname}`.trim();
    const lines = [`${TP}Partial ${LL ? 'Landlord' : 'Home'} Quote`.trim(), `Stopped at: ${EYEBROW[stepId] || stepId} (${stepId})`, `Name: ${name}`, `Phone: ${s.phone}`, `Email: ${s.email}`,
      `Home: ${s.property_address}, ${s.city}, NC ${s.zip_code}`, `Ownership: ${s.is_owner}`, s.property_type ? `Type: ${label(PROPERTY_TYPES, s.property_type)}` : '',
      s.year_built ? `Year built: ${s.year_built}` : '', s.roof_age ? `Roof age: ${s.roof_age}` : '', s.previous_claims ? `Claims (5 yrs): ${s.previous_claims}${s.claim_details ? ' - ' + s.claim_details : ''}` : ''].filter(Boolean);
    try {
      fetch('/api/homepage-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify({
        formType: 'contact', name: `${TP}[PARTIAL ${LL ? 'LANDLORD' : 'HOME'} QUOTE - Stopped at: ${stepId}] ${name}`.trim().slice(0, 150),
        phone: String(s.phone).slice(0, 50), email: s.email.slice(0, 254), message: lines.join('\n').slice(0, 4900) }) }).catch(() => {});
      track(LIVE ? 'partial_lead_saved' : 'home_v2_test_partial', { stopped_at: stepId });
    } catch (_) {}
  }

  // ---------- Claim details sheet: opens when they answer Yes to "any claims?" ----------
  let claimEl = null;
  function openClaimSheet() {
    if (!claimEl) {
      claimEl = document.createElement('div'); claimEl.className = 'v2-help-overlay hq-claim-overlay'; claimEl.hidden = true; document.body.appendChild(claimEl);
      claimEl.addEventListener('click', e => {
        if (e.target.closest('[data-claim-save]')) { state.claim_details = (document.getElementById('hq-claim-text').value || '').trim(); closeClaimSheet(); save(); track('home_v2_step_complete'); next(); return; }
        if (e.target === claimEl || e.target.closest('[data-claim-close]')) { state.claim_details = (document.getElementById('hq-claim-text').value || '').trim(); save(); closeClaimSheet(); }
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && claimEl && !claimEl.hidden) closeClaimSheet(); });
    }
    claimEl.innerHTML = `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="hq-claim-title" tabindex="-1">
      <div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="hq-claim-title">Tell us about the claim</h2><button type="button" class="v2-help-x" data-claim-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">What happened, about when, and was it paid? A sentence or two is plenty. More than one claim? List each one.</p>
      <label class="hq-claim-label" for="hq-claim-text">Claim details</label>
      <textarea id="hq-claim-text" class="v2-textarea" rows="4" placeholder="Example: Hail damage to the roof in 2023. Roof was replaced.">${esc(state.claim_details)}</textarea>
      <p class="v2-help-fine">Our team confirms the details with you before any quote is final.</p>
      <button type="button" class="v2-btn-gold v2-help-ok" data-claim-save>Save and continue &rarr;</button>
      <button type="button" class="v2-btn-outline hq-claim-skip" data-claim-save>Skip, I&rsquo;ll explain later</button></div>`;
    claimEl.hidden = false; document.body.classList.add('v2-help-open');
    requestAnimationFrame(() => { claimEl.classList.add('is-in'); const t = document.getElementById('hq-claim-text'); if (t) { try { t.focus({ preventScroll: true }); } catch (_) {} } });
  }
  function closeClaimSheet() { if (!claimEl) return; claimEl.classList.remove('is-in'); claimEl.hidden = true; document.body.classList.remove('v2-help-open'); }

  // ---------- Help sheet (same look as the auto form's coverage help) ----------
  function openHelp(key) {
    const h = HELP[key]; if (!h) return;
    if (!helpEl) {
      helpEl = document.createElement('div'); helpEl.className = 'v2-help-overlay'; helpEl.hidden = true; document.body.appendChild(helpEl);
      helpEl.addEventListener('click', e => { if (e.target === helpEl || e.target.closest('[data-help-close]')) closeHelp(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && helpEl && !helpEl.hidden) closeHelp(); });
    }
    helpEl.innerHTML = `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="hq-help-title" tabindex="-1">
      <div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="hq-help-title">${esc(h.title)}</h2><button type="button" class="v2-help-x" data-help-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${esc(h.body)}</p>
      <div class="v2-help-example"><strong>Example</strong><p>${esc(h.example)}</p></div>
      <p class="v2-help-fine">General information only. Your policy decides what is covered.</p>
      <button type="button" class="v2-btn-gold v2-help-ok" data-help-close>Got it</button></div>`;
    helpEl.hidden = false; document.body.classList.add('v2-help-open');
    requestAnimationFrame(() => helpEl.classList.add('is-in'));
  }
  function closeHelp() { if (!helpEl) return; helpEl.classList.remove('is-in'); helpEl.hidden = true; document.body.classList.remove('v2-help-open'); }

  // ---------- Render + events ----------
  function render(animate) {
    const stage = document.getElementById('stage');
    const seq = sequence(), i = Math.max(0, seq.indexOf(stepId));
    const pct = stepId === 'done' ? 100 : Math.max(6, Math.round((i / (seq.length - 1)) * 100));
    const fill = document.getElementById('v2-progress-fill'), lab = document.getElementById('v2-progress-label'), bar = document.getElementById('v2-progressbar');
    if (fill) fill.style.width = pct + '%'; if (lab) lab.textContent = pct + '%'; if (bar) bar.setAttribute('aria-valuenow', String(pct));
    const about = document.querySelector('.v2-about'); if (about) about.hidden = stepId !== FIRST;
    const showBack = history.length > 1 && stepId !== 'done';
    stage.innerHTML = `<div class="${animate ? 'v2-step-enter' : ''}"><div class="v2-back-row"><button type="button" class="v2-back-link" id="v2-back" ${showBack ? '' : 'hidden'}>&larr; Back</button></div>
      <div class="v2-eyebrow">${LL ? (EYEBROW[stepId] || '').replace('YOUR HOME', 'YOUR RENTAL') : (EYEBROW[stepId] || '')}</div>${LL ? llWords(screen()) : screen()}</div>`;
    bind();
    mobileBar(showBack);
  }
  function mobileBar(showBack) {
    const bar = document.getElementById('v2-mobile-bar'); if (!bar) return;
    const primary = document.querySelector('#stage .v2-btn-gold:not(a)');
    if (!showBack && !primary) { bar.hidden = true; bar.innerHTML = ''; document.body.classList.remove('has-mobile-bar'); return; }
    document.body.classList.add('has-mobile-bar'); bar.hidden = false;
    bar.innerHTML = `${showBack ? '<button type="button" class="v2-mobile-back" id="v2-m-back">&larr; Back</button>' : ''}${primary ? `<button type="button" class="v2-btn-gold v2-mobile-next" id="v2-m-next" ${primary.disabled ? 'disabled' : ''}>${primary.innerHTML}</button>` : ''}`;
    const mb = document.getElementById('v2-m-back'); if (mb) mb.addEventListener('click', back);
    const mn = document.getElementById('v2-m-next'); if (mn && primary) mn.addEventListener('click', () => primary.click());
  }
  const $ = id => document.getElementById(id);
  const on = (id, fn) => { const e = $(id); if (e) e.addEventListener('click', fn); };
  const each = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
  const val = id => (($(id) || {}).value || '').trim();

  function readAddress() { state.property_address = val('property_address'); state.city = val('city'); state.zip_code = val('zip_code').replace(/\D/g, '').slice(0, 5); }
  function addressOk() {
    readAddress();
    if (!state.property_address || !state.city) { showErr('Please enter the street address and city.'); return false; }
    if (!/^(27|28)\d{3}$/.test(state.zip_code)) { showErr('Please enter a North Carolina ZIP code (it starts with 27 or 28).'); return false; }
    return true;
  }

  function bind() {
    on('v2-back', back);
    each('[data-help]', b => b.addEventListener('click', () => openHelp(b.dataset.help)));
    each('[data-own]', b => b.addEventListener('click', () => pick(b, () => { state.is_owner = b.dataset.own; })));
    each('[data-ll]', b => b.addEventListener('click', () => pick(b, () => { state[b.dataset.ll] = b.dataset.val; })));
    on('hq-not-renter', () => { state.is_owner = ''; back(); });

    // address + county record lookup
    ['property_address', 'city', 'zip_code'].forEach(id => { const e = $(id); if (e) e.addEventListener('input', () => { readAddress(); if (lookup.matches.length || lookup.msg) { lookup = { busy: false, matches: [], picked: 0, msg: '', sample: false }; save(); render(); const again = $(id); if (again) { again.focus(); try { again.setSelectionRange(again.value.length, again.value.length); } catch (_) {} } } else save(); }); });
    on('hq-find', () => { if (addressOk()) { fireFormStart(); runLookup(); } });
    on('hq-addr-skip', () => { if (addressOk()) { state.lookupUsed = false; state.lookup = null; state.fromLookup = {}; track('home_v2_step_complete', { lookup: 'skipped' }); next(); } });
    const sel = $('hq-match'); if (sel) sel.addEventListener('change', () => { lookup.picked = Number(sel.value); lookup.overrides = {}; lookup.editing = false; render(); });
    on('hq-use-record', () => { useRecord(effRecord()); track('home_v2_step_complete', { lookup: hasEdits() ? 'used_edited' : 'used' }); next(); });
    on('hq-ed-open', () => { lookup.editing = true; render(); const f = $('hq-ed-heatedArea'); if (f) f.focus(); });
    on('hq-ed-cancel', () => { lookup.editing = false; render(); });
    on('hq-ed-reset', () => { lookup.overrides = {}; lookup.editing = false; render(); });
    on('hq-ed-save', () => {
      const raw = rawRecord(), ov = {}; let bad = '';
      EDIT_FIELDS.forEach(([k, t, kind, min, max]) => {
        const v = val('hq-ed-' + k), was = raw[k] == null ? '' : String(raw[k]);
        if (v === was) return;
        if (kind === 'num') {
          if (v === '') { ov[k] = null; return; }
          const n = Number(v.replace(/,/g, ''));
          if (!Number.isFinite(n) || n < min || n > max) { bad = bad || `Please check ${t.toLowerCase()}.`; return; }
          ov[k] = n;
        } else ov[k] = v.slice(0, 80);
      });
      if (bad) { const e = $('hq-ed-err'); if (e) { e.textContent = bad; e.hidden = false; } return; }
      lookup.overrides = ov; lookup.editing = false; render();
    });
    on('hq-skip-record', () => { state.lookupUsed = false; state.lookup = null; state.fromLookup = {}; track('home_v2_step_complete', { lookup: 'declined' }); next(); });

    each('[data-ptype]', b => b.addEventListener('click', () => {
      if (!LL && b.dataset.ptype === 'mobile_home') {   // mobile homes have their own form with the right questions
        b.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); b.classList.add('is-selected');
        state.property_type = 'mobile_home'; save();
        try { sessionStorage.setItem('bli_carry_contact', JSON.stringify({ street: state.property_address, city: state.city, zip: state.zip_code, owner: state.is_owner })); } catch (_) {}
        setTimeout(() => { window.location.href = (LIVE ? '/mobile-home-quote' : '../mobile-home-quote-v2-test/') + '?src=home_quote_mobile_home'; }, 230);
        return;
      }
      pick(b, () => { state.property_type = b.dataset.ptype; });
    }));
    on('hq-year-next', () => { const y = val('year_built'); const n = Number(y); if (!/^\d{4}$/.test(y) || n < 1700 || n > new Date().getFullYear() + 1) { showErr('Please enter a four-digit year, or tap Not sure.'); return; } if (y !== state.year_built) delete state.fromLookup.year_built; state.year_built = y; next(); });
    on('hq-year-skip', () => { state.year_built = ''; delete state.fromLookup.year_built; next(); });
    each('[data-sqft]', b => b.addEventListener('click', () => pick(b, () => { if (state.square_footage !== b.dataset.sqft) delete state.fromLookup.square_footage; state.square_footage = b.dataset.sqft; })));
    each('[data-construction]', b => b.addEventListener('click', () => pick(b, () => { if (state.construction_type !== b.dataset.construction) delete state.fromLookup.construction_type; state.construction_type = b.dataset.construction; })));
    each('[data-rooftype]', b => b.addEventListener('click', () => pick(b, () => { if (state.roof_type !== b.dataset.rooftype) delete state.fromLookup.roof_type; state.roof_type = b.dataset.rooftype; })));
    each('[data-roofage]', b => b.addEventListener('click', () => pick(b, () => { state.roof_age = b.dataset.roofage; })));
    on('hq-closing-next', () => { const d = readDate('cl', true); if (d === null) { showErr('Please enter the date as month, day and four-digit year, or tap Not sure yet.'); return; } state.closing_date = d; next(); });
    on('hq-closing-skip', () => { state.closing_date = ''; next(); });
    each('[data-insured]', b => b.addEventListener('click', () => pick(b, () => { state.current_insurance = b.dataset.insured; })));
    on('hq-handy-upload', () => { state.dec_choice = 'upload'; save(); fireFormStart(); render(); });
    on('hq-handy-skip', () => { state.dec_choice = 'questions'; state.used_dec = false; save(); fireFormStart(); render(); setTimeout(next, 230); });
    on('hq-handy-next', () => { if (!files.length) return; state.dec_choice = 'upload'; state.used_dec = true; save(); next(); });
    on('hq-current-next', () => { const d = readDate('ex', true); if (d === null) { showErr('Please enter the renewal date as month, day and four-digit year, or leave it blank.'); return; }
      state.coverage_expiration = d; state.current_dwelling_amount = val('current_dwelling_amount'); next(); });
    each('[data-carrier]', b => b.addEventListener('click', () => {
      if (b.dataset.carrier === 'Other') { otherCarrierOpen = true; if (insurers.some(c => c.name === state.current_carrier)) state.current_carrier = ''; render(); const o = $('hq-other-carrier'); if (o) o.focus(); return; }
      otherCarrierOpen = false; pick(b, () => { state.current_carrier = b.dataset.carrier; });
    }));
    on('hq-other-carrier-next', () => { const v = val('hq-other-carrier'); if (!v) { showErr('Please enter the insurance company name, or tap Not sure.'); return; } state.current_carrier = v; otherCarrierOpen = false; next(); });
    on('hq-carrier-skip', () => { state.current_carrier = ''; otherCarrierOpen = false; next(); });
    each('[data-claims]', b => b.addEventListener('click', () => {
      if (b.dataset.claims === 'yes') {
        b.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); b.classList.add('is-selected');
        state.previous_claims = 'yes'; save(); fireFormStart(); openClaimSheet(); return;
      }
      pick(b, () => { state.previous_claims = 'no'; state.claim_details = ''; });
    }));

    const ph = $('phone'); if (ph) ph.addEventListener('input', () => { ph.value = fmtPhone(ph.value); });
    on('hq-contact-next', () => {
      state.firstname = val('firstname'); state.lastname = val('lastname'); state.phone = val('phone'); state.email = val('email');
      const dob = readDate('dob', false);
      if (!state.firstname || !state.lastname) { showErr('Please enter your first and last name.'); return; }
      if (state.phone.replace(/\D/g, '').length !== 10) { showErr('Please enter a 10-digit phone number.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { showErr('Please enter a valid email address.'); return; }
      if (!dob) { showErr('Please enter your date of birth as month, day and four-digit year.'); return; }
      state.date_of_birth = dob; contactDone = true; next();
    });
    each('[data-dwelling]', b => b.addEventListener('click', () => pick(b, () => { state.desired_dwelling_amount = b.dataset.dwelling; state._dwPicked = true; })));
    each('[data-deductible]', b => b.addEventListener('click', () => pick(b, () => { state.deductible = b.dataset.deductible; })));
    each('[data-extra]', b => b.addEventListener('click', () => { state[b.dataset.extra] = !state[b.dataset.extra]; save(); const y = window.scrollY; render(); window.scrollTo(0, y); }));
    on('hq-extras-next', next);
    each('[data-yn]', b => b.addEventListener('click', () => { state[b.dataset.yn] = b.dataset.val; save(); const y = window.scrollY; render(); window.scrollTo(0, y); }));
    on('hq-house-next', next);
    const notes = $('additional_notes'); if (notes) notes.addEventListener('input', () => { state.additional_notes = notes.value; save(); });
    on('hq-notes-next', next);

    on('hq-file-btn', () => $('hq-file').click()); on('hq-cam-btn', () => $('hq-cam').click());
    ['hq-file', 'hq-cam'].forEach(id => { const e = $(id); if (e) e.addEventListener('change', () => { addFiles(e.files); }); });
    each('[data-rmfile]', b => b.addEventListener('click', () => { files.splice(Number(b.dataset.rmfile), 1); render(); }));

    each('[data-edit]', b => b.addEventListener('click', () => { editReturn = 'review'; go(b.dataset.edit); }));
    on('hq-send', send);
    const slot = $('hq-turnstile');
    if (slot && window.turnstile && typeof window.turnstile.render === 'function' && !slot.dataset.mounted) {
      slot.dataset.mounted = '1';
      try { window.turnstile.render(slot, { sitekey: TURNSTILE_SITE_KEY, callback: t => { turnstileToken = t; }, 'expired-callback': () => { turnstileToken = ''; } }); } catch (_) {}
    }
  }

  window.addEventListener('popstate', () => { if (claimEl && !claimEl.hidden) { closeClaimSheet(); return; } if (helpEl && !helpEl.hidden) { closeHelp(); return; } if (stepId !== 'done') back(); });
  // Leaving the tab for a minute counts as walking away; coming back in time cancels it.
  let awayTimer = null;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') awayTimer = setTimeout(sendPartial, 60000);
    else if (awayTimer) { clearTimeout(awayTimer); awayTimer = null; }
  });
  window.addEventListener('pagehide', sendPartial);

  // Insurer logos come from the auto form's list so both forms stay in step.
  if (location.protocol !== 'file:') {
    fetch(LOGOS_URL, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then(d => {
      const list = d && Array.isArray(d.currentInsurers) ? d.currentInsurers : null;
      if (!list) return;
      insurers = list.filter(c => c && c.enabled !== false && c.name !== 'Other' && !NOT_HOME_INSURERS.includes(c.name))
        .sort((a, b) => (a.order || 99) - (b.order || 99)).map(c => ({ name: c.name, logo: c.logo || '', showLabel: !!c.showLabel }));
      if (stepId === 'carrier') render();
    }).catch(() => {});
  }

  restore();
  if (decFilesLost() && sequence().includes('handy')) { stepId = 'handy'; history = [FIRST, 'handy']; }
  if (!sequence().includes(stepId)) { stepId = FIRST; history = [FIRST]; }
  render();
})();
