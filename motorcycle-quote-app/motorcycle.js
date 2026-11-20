/* Bill Layne Insurance - Motorcycle / ATV Quote V2 (tap-through). Same look and rules as the auto, home, renters and mobile home forms.
   A live page sets window.BLI_MCQ_MODE = 'live' before loading this file; the private test page leaves it unset.
   Every value sent matches what the office script (validateSpecialtyQuote, motorcycle schema) accepts today. */
(function () {
  'use strict';

  const LIVE = window.BLI_MCQ_MODE === 'live';
  const TP = LIVE ? '' : '[TEST MC V2] ';
  const STORAGE_KEY = LIVE ? 'bli_motorcycle_quote_session' : 'bli_motorcycle_v2_test_session';
  const params = new URLSearchParams(window.location.search);
  const srcParam = /^[a-z0-9_-]{1,80}$/i.test(params.get('src') || '') ? params.get('src') : '';
  const ctaSource = LIVE ? (srcParam || 'motorcycle_quote') : 'motorcycle_v2_test';
  const MAX_VEHICLES = 3, MAX_RIDERS = 4;

  const ICON_BASE = 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-';
  const ICONS = { yes: 'insured-yes-8pg2wf', no: 'insured-no-mk4ws4', advise: 'coverage-not-sure-jmye8d', confirm: 'confirm-dbnygk' };
  const icon = n => `<img src="${ICON_BASE}${ICONS[n]}.svg" alt="" class="v2-tile-icon" width="48" height="48" onerror="this.remove()">`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // [value the office script accepts, wording the customer sees]
  const TYPES = [['Motorcycle / trike', 'Motorcycle or trike'], ['ATV', 'ATV (four-wheeler)'], ['Side-by-side / UTV', 'Side-by-side or UTV'], ['Dirt bike', 'Dirt bike'], ['Scooter / moped', 'Scooter or moped'], ['Other / discuss', 'Something else']];
  const NOUN = { 'Motorcycle / trike': 'motorcycle', 'ATV': 'ATV', 'Side-by-side / UTV': 'side-by-side', 'Dirt bike': 'dirt bike', 'Scooter / moped': 'scooter', 'Other / discuss': 'vehicle' };
  const OFFROAD = ['ATV', 'Side-by-side / UTV', 'Dirt bike'];
  const TAGGABLE = ['ATV', 'Side-by-side / UTV'];   // these get the license tag question
  const TAG = [['Yes', 'Yes, it has a tag or will get one'], ['No', 'No, off-road only'], ['Not sure', 'Not sure']];
  const MAKES_ROAD = ['Harley-Davidson', 'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Indian', 'BMW', 'Triumph'];
  const MAKES_OFF = ['Polaris', 'Honda', 'Can-Am', 'Yamaha', 'Kawasaki', 'Kubota', 'John Deere', 'Suzuki'];
  // Popular models shown as tiles. The full list for the chosen year comes from the federal vehicle database (NHTSA vPIC), same as the auto form.
  const MODELS_ROAD = { 'Harley-Davidson': ['Street Glide', 'Road Glide', 'Road King', 'Fat Boy', 'Sportster', 'Heritage Classic'], 'Honda': ['Gold Wing', 'Rebel 500', 'Rebel 1100', 'Shadow', 'Grom', 'CBR600RR'],
    'Yamaha': ['MT-07', 'MT-09', 'YZF-R6', 'YZF-R3', 'V Star', 'Bolt'], 'Kawasaki': ['Ninja 400', 'Ninja 650', 'Ninja ZX-6R', 'Vulcan S', 'Z900', 'KLR650'],
    'Suzuki': ['GSX-R600', 'GSX-R750', 'Hayabusa', 'Boulevard', 'SV650', 'V-Strom 650'], 'Indian': ['Scout', 'Chief', 'Chieftain', 'Roadmaster', 'Springfield', 'Challenger'],
    'BMW': ['R 1250 GS', 'S 1000 RR', 'R nineT', 'F 850 GS', 'K 1600', 'G 310 R'], 'Triumph': ['Bonneville', 'Street Triple', 'Speed Twin', 'Tiger 900', 'Rocket 3', 'Trident 660'] };
  const MODELS_OFF = { 'Polaris': ['Sportsman 570', 'Sportsman 850', 'RZR', 'Ranger', 'General', 'Outlaw'], 'Honda': ['FourTrax Rancher', 'FourTrax Foreman', 'Pioneer 700', 'Pioneer 1000', 'Talon', 'CRF250F'],
    'Can-Am': ['Outlander', 'Renegade', 'Defender', 'Maverick', 'Commander'], 'Yamaha': ['Grizzly', 'Kodiak', 'Raptor 700', 'Wolverine', 'Viking', 'YZ250F'],
    'Kawasaki': ['Brute Force', 'Mule', 'Teryx', 'KRX 1000', 'KLX', 'KX250'], 'Kubota': ['RTV-X900', 'RTV-X1100C', 'RTV-XG850 Sidekick', 'RTV520'],
    'John Deere': ['Gator XUV835M', 'Gator XUV590', 'Gator HPX', 'Gator TX'], 'Suzuki': ['KingQuad 400', 'KingQuad 500', 'KingQuad 750', 'DR-Z400', 'RM-Z250'] };
  const ALSO_MAKES_CARS = ['Honda', 'Suzuki', 'BMW'];   // for these, only the motorcycle list is asked for, so no car models appear
  const MAX_YEAR = new Date().getFullYear() + 1;
  const TOP_YEARS = Array.from({ length: 18 }, (_, i) => String(MAX_YEAR - i));
  const DROPDOWN_YEARS = Array.from({ length: MAX_YEAR - 1981 + 1 }, (_, i) => String(MAX_YEAR - i));
  // Simple side-view drawings so a customer can pick by look. Front points right. Live since 2026-11-20 (approved by Bill).
  const TYPE_ART_ON = true;
  const GROUND = '<path d="M4 44H92" stroke="#8696ab" stroke-width="1.6"/>';
  const TYPE_ART = {
    'Motorcycle / trike': '<circle cx="20" cy="34" r="8"/><circle cx="76" cy="34" r="8"/><path d="M20 34l12-12h20l8-7h6l10 19"/><path d="M40 22q9-9 20-1"/><path d="M26 22h14"/><path d="M38 25h14v9H38z"/><path d="M62 15l-4-6h7"/><path d="M34 37H14"/>',
    'ATV': '<circle cx="22" cy="33" r="9"/><circle cx="74" cy="33" r="9"/><circle cx="22" cy="33" r="3"/><circle cx="74" cy="33" r="3"/><path d="M8 24h20l7-7h18l9 7h22"/><path d="M35 17h14"/><path d="M57 18l4-9m-5 0h9"/><path d="M33 27h30v7H33z"/>',
    'Side-by-side / UTV': '<circle cx="22" cy="35" r="7.500"/><circle cx="76" cy="35" r="7.500"/><path d="M6 30h84v-6l-18-2"/><path d="M6 30V18h20v12"/><path d="M30 30V8h26l16 14"/><path d="M40 30v-9h9M56 8v22"/><path d="M60 22l5-6"/>',
    'Dirt bike': '<circle cx="20" cy="33" r="9"/><circle cx="78" cy="33" r="9"/><path d="M20 33l15-15h21l7-7 15 22"/><path d="M29 17h26"/><path d="M63 11l-3-6h8"/><path d="M66 19l15 3"/><path d="M14 17l17 2"/><path d="M40 20h12l-4 10h-10z"/><path d="M38 30L24 21"/>',
    'Scooter / moped': '<circle cx="22" cy="36" r="6.500"/><circle cx="76" cy="36" r="6.500"/><path d="M22 36q-2-12 12-12h12v8h18l8-20"/><path d="M28 23h18"/><path d="M68 12h8"/><path d="M72 12l4 24"/><path d="M14 30q4-7 14-7"/>',
    'Other / discuss': '<circle cx="24" cy="34" r="8"/><circle cx="72" cy="34" r="8"/><path d="M24 34h48"/><text x="48" y="22" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor" stroke="none" font-family="inherit">?</text>'
  };
  const TYPE_HINT = { 'Motorcycle / trike': 'Street bikes and three-wheelers', 'ATV': 'You sit on top, handlebars', 'Side-by-side / UTV': 'Seats side by side, steering wheel', 'Dirt bike': 'Off-road bike', 'Scooter / moped': 'Step-through, small engine' };
  const typeTile = ([v, t], current) => `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-val="${esc(v)}" style="flex-direction:column;gap:2px;padding:8px 8px 9px">
      <svg viewBox="0 0 96 48" width="92" height="46" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;color:#05203d">${TYPE_ART[v]}${GROUND}</svg>
      <span>${esc(t)}</span>${TYPE_HINT[v] ? `<small style="display:block;font-size:12.5px;font-weight:600;line-height:1.25;color:#334155">${TYPE_HINT[v]}</small>` : ''}</button>`;
  const OWNED = [['Owned outright', 'I own it outright'], ['Financed', 'I’m making payments'], ['Leased', 'It’s leased'], ['Shopping / not purchased', 'Still shopping']];
  const USES = [['Pleasure / occasional rides', 'Fun and weekend rides'], ['Commuting under 10 miles', 'Riding to work, under 10 miles'], ['Commuting 10 miles or more', 'Riding to work, 10 miles or more'],
    ['Off-road / farm', 'Off-road or farm'], ['Business / delivery', 'Business or delivery'], ['Racing / track', 'Racing or track days'], ['Other', 'Something else']];
  const KEPT = [['Locked garage', 'Locked garage'], ['Carport', 'Carport'], ['Driveway / outside', 'Driveway or outside'], ['Storage facility', 'Storage facility'], ['Other', 'Somewhere else']];
  const YNS = [['Yes', 'Yes'], ['No', 'No'], ['Not sure', 'Not sure']];
  const POWER = [['Gasoline', 'Gas'], ['Electric', 'Electric'], ['Other / not sure', 'Not sure']];
  const TITLE = [['Clean', 'Clean'], ['Salvage / rebuilt', 'Salvage or rebuilt'], ['Not sure', 'Not sure']];
  const LICENSE = [['Valid', 'Valid license'], ['Permit', 'Learner’s permit'], ['Suspended / revoked', 'Suspended or revoked'], ['No license', 'No license'], ['Other / discuss', 'Something else']];
  const NA_ENDORSE = 'Not applicable — off-road vehicle only';
  const ENDORSE = [['Full motorcycle license / endorsement', 'Yes, full endorsement'], ['Motorcycle permit', 'Motorcycle permit'], ['Not yet', 'Not yet'], ['Not sure', 'Not sure']];
  const RELATION = [['Spouse / partner', 'Spouse or partner'], ['Child', 'Child'], ['Other household member', 'Lives with me'], ['Other', 'Someone else']];
  const COVER = [['Liability only', 'Liability only'], ['Liability plus comprehensive and collision', 'Liability plus Comp & Collision']];
  const MATCH = 'Match my current policy', DECIDE = 'Help me decide', FULL = 'Liability plus comprehensive and collision';
  // Same liability choices as the auto form.
  const LIMITS = [['50/100/50', 'State Minimum (50/100/50)', ''], ['100/300/50', '100/300/50', ''], ['100/300/100', '100/300/100', 'Most Popular'], ['250/500/250', '250/500/250', 'Best Protection']];
  const CUSTOM = [['Yes', 'Yes, I have custom parts or equipment'], ['No', 'No, it is stock']];
  const DEDUCTIBLES = [['$250', '$250'], ['$500', '$500'], ['$1,000', '$1,000']];
  const BUNDLES = ['Auto', 'Home', 'Renters'];
  const LATER = 'Will provide later';

  const HELP = {
    endorse: { title: 'Motorcycle endorsement', body: 'In North Carolina you need a motorcycle endorsement on your driver license, or a motorcycle learner permit, to ride on public roads. Off-road vehicles such as ATVs and dirt bikes do not need one.',
      example: 'Your license shows a small "M" when you have the endorsement. If you are still working on it, choose "Not yet" and our team will explain your options.' },
    cover: { title: 'Liability and Comp & Collision', body: 'Liability pays for injuries and damage you cause to other people. Comprehensive and Collision (Comp & Collision) may pay to repair or replace your own bike after a crash, theft, fire, storm or hitting a deer. A lender usually requires both.',
      example: 'Your parked motorcycle is stolen. Liability only would not pay for it. Comprehensive may, after your deductible.' },
    limits: { title: 'What the three numbers mean', body: 'They are the most your policy may pay, in thousands of dollars, when you cause a crash. First number: one injured person. Second: everyone injured in that crash. Third: damage to other people\u2019s property. 50/100/50 is the North Carolina minimum.',
      example: 'With 100/300/100, the policy may pay up to $100,000 for one person\u2019s injuries, up to $300,000 for everyone hurt, and up to $100,000 for the other driver\u2019s car and property.' },
    custom: { title: 'Custom parts and equipment', body: 'Anything added after it left the factory: chrome, custom paint, exhaust, saddlebags, a windshield, a winch, a lift kit, upgraded wheels. A policy usually covers only a small amount of these unless you ask for more.',
      example: 'You added $4,000 of chrome and saddlebags and the bike is stolen. Without extra custom equipment coverage, the policy may pay for the stock bike but only part of what you added.' },
    deductible: { title: 'Deductible', body: 'The part of a covered repair bill you pay yourself before your coverage pays. You choose the amount. A higher deductible means you pay more out of pocket when you have a claim.',
      example: 'With a $500 deductible and a $3,000 covered repair, you pay $500 and the policy may pay the remaining $2,500.' }
  };

  // Insurer logo tiles: same list and logos as the other forms.
  const LOGOS_URL = (function () { try { return new URL('../auto-quote-app/logos.json', document.currentScript.src).href; } catch (_) { return '../auto-quote-app/logos.json'; } })();
  const IL = 'https://img.billlayneinsurance.com/i/2026/11/';
  let insurers = [['State Farm', 'state-farm-insurance-logo-c4hm2m.png'], ['Allstate', 'allstate-insurance-logo-nq7c5z.png'], ['Nationwide', 'nationwide-insurance-logo-j5zp2s.png'],
    ['Progressive', 'progressive-insurance-logo-2kcvze.png'], ['GEICO', 'geico-insurance-logo-s92zrs.png'], ['Liberty Mutual', 'liberty-mutual-insurance-logo-ffrtts.png']]
    .map(([name, f]) => ({ name, logo: IL + f, showLabel: false }));
  let otherCarrierOpen = false, otherMakeOpen = false, olderYearOpen = false, otherModelOpen = false, loadingModels = false;
  const modelCache = {};
  const popularModels = v => ['Motorcycle / trike', 'ATV', 'Side-by-side / UTV', 'Dirt bike'].includes(v.type) ? ((OFFROAD.includes(v.type) ? MODELS_OFF : MODELS_ROAD)[v.make] || []) : [];
  const allModels = v => modelCache[v.make + '|' + v.year] || [];
  function loadModels(v) {
    const key = v.make + '|' + v.year;
    if (modelCache[key] || !v.make || !/^\d{4}$/.test(v.year) || Number(v.year) < 1981 || location.protocol === 'file:') { loadingModels = false; return; }
    loadingModels = true;
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 2500);
    const base = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/' + encodeURIComponent(v.make) + '/modelyear/' + encodeURIComponent(v.year);
    const urls = [base + '/vehicletype/motorcycle?format=json'].concat(ALSO_MAKES_CARS.includes(v.make) ? [] : [base + '?format=json']);
    Promise.all(urls.map(u => fetch(u, { signal: ctl.signal }).then(r => (r.ok ? r.json() : { Results: [] })).catch(() => ({ Results: [] })))).then(res => {
      clearTimeout(timer);
      const seen = new Set(), out = [];
      res.forEach(d => (d.Results || []).forEach(row => { const n = String(row.Model_Name || '').trim(); if (n && n.length <= 60 && !seen.has(n.toLowerCase())) { seen.add(n.toLowerCase()); out.push(n); } }));
      out.sort((a, b) => a.localeCompare(b)); modelCache[key] = out;
    }).catch(() => { modelCache[key] = []; }).then(() => { loadingModels = false; if (sid() === 'model' && V().make + '|' + V().year === key) { const y = window.scrollY; render(); window.scrollTo(0, y); } });
  }
  // Brand logo tiles (hosted on the agency image host). A brand with no file here shows its name as text.
  const MAKE_LOGOS = { 'Harley-Davidson': 'harley-davidson-motorcycle-logo-4q2pda.png', 'Honda': 'honda-motorcycle-logo-uunccs.png', 'Yamaha': 'yamaha-motorcycle-logo-6xghss.png',
    'Kawasaki': 'kawasaki-motorcycle-logo-7p8chr.png', 'Suzuki': 'suzuki-motorcycle-logo-pgk2s6.png', 'Indian': 'indian-motorcycle-logo-qqvekr.png', 'BMW': 'bmw-motorcycle-logo-8fvr5f.png',
    'Triumph': 'triumph-motorcycle-logo-e5vvs8.png', 'Polaris': 'polaris-motorcycle-logo-9rqyru.png', 'Kubota': 'kubota-motorcycle-logo-m9ja7m.png', 'John Deere': 'john-deere-motorcycle-logo-7fa3h4.png' };
  const MAKE_LABELLED = [];   // brands whose logo has no name on it get the name printed underneath
  function makeTile(m, selected) {
    const safe = esc(m), f = MAKE_LOGOS[m], lab = f && MAKE_LABELLED.includes(m);
    const inner = f
      ? `<span class="v2-logo-frame"><img src="${IL}${f}" alt="${safe}" width="132" height="60" class="is-carrier-logo" onerror="this.parentElement.innerHTML='<span class=\\'v2-logo-text\\'>${safe}</span>'"></span>${lab? `<span class="v2-logo-label">${safe}</span>` : ''}`
      : `<span class="v2-logo-frame"><span class="v2-logo-text">${safe}</span></span>`;
    return `<button type="button" class="v2-tile logo-tile ${lab ? 'has-label' : ''} ${selected ? 'is-selected' : ''}" aria-label="${safe}" aria-pressed="${selected}" data-val="${safe}">${inner}</button>`;
  }
  function logoTile(c, selected) {
    const safe = esc(c.name);
    const inner = c.logo
      ? `<span class="v2-logo-frame"><img src="${esc(c.logo)}" alt="${safe}" width="132" height="60" class="is-carrier-logo" onerror="this.parentElement.innerHTML='<span class=\\'v2-logo-text\\'>${safe}</span>'"></span>${c.showLabel ? `<span class="v2-logo-label">${safe}</span>` : ''}`
      : `<span class="v2-logo-frame"><span class="v2-logo-text">${safe}</span></span>`;
    return `<button type="button" class="v2-tile logo-tile ${c.logo && c.showLabel ? 'has-label' : ''} ${selected ? 'is-selected' : ''}" aria-label="${safe}" aria-pressed="${selected}" data-carrier="${safe}">${inner}</button>`;
  }

  // ---------- State ----------
  const blankV = () => ({ type: '', make: '', year: '', model: '', engine_cc: '', ownership: '', lender: '', road_tag: '', use: '', storage_type: '',
    power: 'Other / not sure', title_status: 'Not sure', abs: 'Not sure', anti_theft: 'Not sure', modified: 'Not sure', modifications: '' });
  const blankR = () => ({ firstname: '', lastname: '', date_of_birth: '', relationship: '', license_status: '', endorsement: '', training: '',
    violations: '', violation_details: '', accidents: '', accident_details: '', suspensions: '', suspension_details: '' });
  const blank = () => ({ vehicles: [blankV()], riders: [blankR()], firstname: '', lastname: '', phone: '', email: '', date_of_birth: '', address: '', city: '', zip_code: '',
    currently_insured: '', carrier: '', expiration: '', continuous: '', cancelled: '', cancellation_details: '',
    effective_date: '', start_choice: '', coverage: '', liability_limits: '', deductible: '', custom_equipment: '', custom_value: '', bundles: [], notes: '' });
  let state = blank(), stepId = 'type:0', history = ['type:0'];
  let sending = false, sendError = '', confirmation = '', contactDone = false, submitted = false, formStarted = false;
  let editStack = [];   // { to, until }: jump to `to` after finishing step `until` (or after the very next step when `until` is not set)
  let helpEl = null, sheetEl = null;

  const sid = () => stepId.split(':')[0];
  const idx = () => Number(stepId.split(':')[1] || 0);
  const V = () => state.vehicles[idx()] || state.vehicles[0];
  const R = () => state.riders[idx()] || state.riders[0];

  function save() { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state, stepId, history, contactDone, t: Date.now() })); } catch (_) {} }
  function restore() {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (raw && raw.state && raw.stepId && raw.stepId !== 'done' && Array.isArray(raw.state.vehicles) && raw.state.vehicles.length && Array.isArray(raw.state.riders) && raw.state.riders.length) {
        state = Object.assign(blank(), raw.state);
        state.vehicles = state.vehicles.slice(0, MAX_VEHICLES).map(v => Object.assign(blankV(), v));
        state.riders = state.riders.slice(0, MAX_RIDERS).map(r => Object.assign(blankR(), r));
        if (!Array.isArray(state.bundles)) state.bundles = [];
        stepId = raw.stepId; history = raw.history || [stepId]; contactDone = !!raw.contactDone;
      }
    } catch (_) {}
    try {   // contact details carried over from a finished auto or home quote, in this browser tab only
      const c = JSON.parse(sessionStorage.getItem('bli_carry_contact') || 'null');
      if (c && c.email && !state.firstname && !state.email) ['firstname', 'lastname', 'phone', 'email', 'date_of_birth'].forEach(k => { if (c[k]) state[k] = c[k]; });
    } catch (_) {}
    try { const z = params.get('zip'); if (z && /^[0-9]{5}$/.test(z) && !state.zip_code) state.zip_code = z; } catch (_) {}
  }

  function track(name, detail) {
    const base = LIVE ? { cta_source: ctaSource, form_type: 'motorcycle', step_id: sid() }
      : { traffic_type: 'internal', cta_source: 'motorcycle_v2_test', form_name: 'motorcycle_quote_v2_test', step_id: sid() };
    if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign(base, detail || {}));
  }
  function fireFormStart() {
    if (formStarted) return; formStarted = true;
    if (LIVE && typeof window.gtag === 'function') window.gtag('event', 'form_start', { form_type: 'motorcycle', form_name: 'motorcycle_quote', cta_source: ctaSource });
  }

  // ---------- Flow ----------
  const allOffroad = () => state.vehicles.every(v => OFFROAD.includes(v.type));
  // The auto form's upload-or-continue step (shared file /quote-shared/upload.js): two tiles, and an upload skips the coverage questions.
  // Shown on the test page only until Bill approves.
  const UP = window.BLIUpload || null;
  const HANDY_ON = !!UP && !LIVE;
  const usedDec = () => HANDY_ON && !!state.used_dec && state.currently_insured === 'Yes';
  const decNote = () => (usedDec() ? 'DECLARATIONS PAGE UPLOADED - the customer chose to skip the coverage questions. Take the coverage details from the attached page or ask.\n' : '');
  function decFilesLost() {   // attached files live in memory only; after a reload the skipped questions come back
    if (!(HANDY_ON && state.used_dec) || UP.count()) return false;
    state.used_dec = false; state.dec_choice = ''; save(); return true;
  }
  function sequence() {
    const seq = [];
    state.vehicles.forEach((v, i) => { seq.push('type:' + i, 'make:' + i, 'year:' + i, 'model:' + i, 'cc:' + i, 'owned:' + i); if (TAGGABLE.includes(v.type)) seq.push('tag:' + i); seq.push('use:' + i, 'kept:' + i, 'vdetails:' + i); });
    seq.push('vmore', 'contact', 'address');
    state.riders.forEach((r, j) => { if (j > 0) seq.push('rwho:' + j); seq.push('license:' + j); if (!allOffroad()) seq.push('endorse:' + j); seq.push('course:' + j, 'record:' + j); });
    seq.push('rmore', 'insured');
    if (state.currently_insured === 'Yes') { seq.push('carrier'); if (HANDY_ON) seq.push('handy'); if (!usedDec()) seq.push('renewal'); }
    if (usedDec()) { seq.push('extras', 'review', 'done'); return seq; }   // the declarations page answers the rest
    seq.push('history', 'start', 'cover', 'limits');
    if (state.coverage === FULL) seq.push('deductible');
    if (state.coverage !== 'Liability only') seq.push('custom');   // custom equipment coverage goes with Comp & Collision
    seq.push('extras', 'review', 'done');
    return seq;
  }
  const EYEBROW = { handy: 'CURRENT COVERAGE', type: 'YOUR RIDE', make: 'YOUR RIDE', year: 'YOUR RIDE', model: 'YOUR RIDE', cc: 'YOUR RIDE', tag: 'YOUR RIDE', owned: 'YOUR RIDE', use: 'YOUR RIDE', kept: 'YOUR RIDE', vdetails: 'YOUR RIDE', vmore: 'YOUR RIDE',
    contact: 'ABOUT YOU', address: 'ABOUT YOU', rwho: 'RIDERS', license: 'RIDERS', endorse: 'RIDERS', course: 'RIDERS', record: 'RIDERS', rmore: 'RIDERS',
    insured: 'CURRENT COVERAGE', carrier: 'CURRENT COVERAGE', renewal: 'CURRENT COVERAGE', history: 'CURRENT COVERAGE',
    start: 'YOUR COVERAGE', cover: 'YOUR COVERAGE', limits: 'YOUR COVERAGE', deductible: 'YOUR COVERAGE', custom: 'YOUR COVERAGE', extras: 'ALMOST DONE', review: 'REVIEW', done: 'QUOTE RECEIVED' };
  function eyebrow() {
    const s = sid();
    if (['type', 'make', 'year', 'model', 'cc', 'owned', 'tag', 'use', 'kept', 'vdetails'].includes(s) && state.vehicles.length > 1) return `VEHICLE ${idx() + 1} OF ${state.vehicles.length}`;
    if (['rwho', 'license', 'endorse', 'course', 'record'].includes(s) && state.riders.length > 1) return `RIDER ${idx() + 1} OF ${state.riders.length}`;
    return EYEBROW[s] || '';
  }

  function go(id) { stepId = id; history.push(id); enter(); }
  function next() {
    const seq = sequence(), top = editStack[editStack.length - 1];
    if (top && (!top.until || top.until === stepId)) { editStack.pop(); if (seq.includes(top.to) && top.to !== stepId) { go(top.to); return; } }
    go(seq[Math.min(seq.indexOf(stepId) + 1, seq.length - 1)]);
  }
  function back() { if (history.length < 2) return; history.pop(); stepId = history[history.length - 1]; if (!sequence().includes(stepId)) { stepId = 'type:0'; history = ['type:0']; } enter(true); }
  function enter(fromBack) {
    otherMakeOpen = false; olderYearOpen = false; otherModelOpen = false; if (sid() === 'model') loadModels(V()); save();
    if (!fromBack) { try { window.history.pushState({ mc: stepId }, ''); } catch (_) {} }
    track('motorcycle_v2_step_view'); render(true); window.scrollTo(0, 0);
  }
  function pick(btn, fn) {
    if (btn) { btn.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); btn.classList.add('is-selected'); }
    fn(); save(); track('motorcycle_v2_step_complete'); fireFormStart(); setTimeout(next, 230);
  }

  // ---------- Small builders ----------
  const helpBtn = key => `<button type="button" class="v2-help-btn" data-help="${key}" aria-label="What is ${esc(HELP[key].title)}?">?</button>`;
  const tiles = (list, current, cols, compact) => `<div class="v2-grid-${cols}">${list.map(([v, t, ic]) =>
    `<button type="button" class="v2-tile ${compact ? 'compact' : ''} ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-val="${esc(v)}">${ic ? icon(ic) : ''}<span>${esc(t)}</span></button>`).join('')}</div>`;
  const decideTile = current => `<div class="v2-grid-2 hq-decide" style="grid-template-columns:1fr">
      <button type="button" class="v2-tile compact ${current === DECIDE ? 'is-selected' : ''}" data-val="${DECIDE}">Not sure, help me decide</button></div>`;
  // A question with small answer buttons that stay on the screen (no auto-advance).
  const chipRow = (key, question, list, current, extra) => `<div class="v2-group-block"><div class="v2-group-title">${question}</div><div class="v2-grid-3" style="margin-bottom:0">${list.map(([v, t]) =>
    `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-chip="${key}" data-val="${esc(v)}">${esc(t)}</button>`).join('')}</div>${extra || ''}</div>`;
  const detailBox = (key, labelText, value, ph) => `<div class="v2-field" style="margin-top:12px"><label for="ta-${key}">${labelText}</label>
    <textarea id="ta-${key}" class="v2-textarea" rows="3" maxlength="600" data-ta="${key}" placeholder="${esc(ph)}">${esc(value)}</textarea></div>`;
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
  const oneLine = s => String(s || '').replace(/[\x00-\x1f]+/g, ' ').trim();
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
  const label = (list, v) => (list.find(x => x[0] === v) || [, ''])[1];
  const noun = v => NOUN[v.type] || 'vehicle';
  const vName = v => [v.year, v.make, v.model].filter(Boolean).join(' ') || label(TYPES, v.type) || 'Vehicle';
  const rName = (r, j) => j === 0 ? (`${state.firstname} ${state.lastname}`.trim() || 'You') : (`${r.firstname} ${r.lastname}`.trim() || 'Rider ' + (j + 1));
  const whose = j => j === 0 ? 'your' : esc((state.riders[j].firstname || 'this rider') + '’s');
  const itThem = () => state.vehicles.length > 1 ? 'they' : 'it';
  const listRows = (items, kind) => `<div class="v2-review-list">${items.map((t, i) => `
    <div class="v2-review-row"><div><div class="v2-review-label">${kind} ${i + 1}</div><div class="v2-review-val">${esc(t)}</div></div>
    <div style="display:flex;gap:8px"><button type="button" class="v2-edit-btn" data-list-edit="${i}">Edit</button>${i > 0 ? `<button type="button" class="v2-edit-btn" data-list-remove="${i}">Remove</button>` : ''}</div></div>`).join('')}</div>`;

  // ---------- Screens ----------
  function screen() {
    const s = state, v = V(), r = R(), j = idx();
    switch (sid()) {
      case 'type': return `
        <h1 class="v2-heading">${j === 0 ? 'What would you like to insure?' : 'What is the next one?'}</h1>
        <p class="v2-sub">${TYPE_ART_ON ? 'Tap the one that looks like yours.' : j === 0 ? 'Tap an option to start. A licensed North Carolina team compares motorcycle and ATV insurance for you.' : 'Choose the closest match.'}</p>
        ${TYPE_ART_ON ? `<div class="v2-grid-2">${TYPES.map(t => typeTile(t, v.type)).join('')}</div>` : tiles(TYPES, v.type, 2, true)}`;

      case 'make': {
        const list = OFFROAD.includes(v.type) ? MAKES_OFF : MAKES_ROAD, known = list.includes(v.make), otherOn = otherMakeOpen || (!!v.make && !known);
        return `
        <h1 class="v2-heading">Who makes your ${noun(v)}?</h1>
        <p class="v2-sub">Tap the brand.</p>
        <div class="v2-grid-3">${list.map(m => makeTile(m, v.make === m)).join('')}
          <button type="button" class="v2-tile logo-tile ${otherOn ? 'is-selected' : ''}" aria-pressed="${otherOn}" data-make-other><span class="v2-logo-frame"><span class="v2-logo-text">Another brand</span></span></button></div>
        ${otherOn ? `<div class="v2-col">
          <div class="v2-field"><label for="mc-other-make">Enter the brand</label><input id="mc-other-make" class="v2-input" type="text" autocapitalize="words" maxlength="100" value="${esc(known ? '' : v.make)}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="mc-other-make-next">Continue &rarr;</button></div>` : ''}`;
      }

      case 'year': {
        const older = olderYearOpen || (!!v.year && Number(v.year) < 1981);
        return `
        <h1 class="v2-heading">What year is your ${esc(v.make)}?</h1>
        <p class="v2-sub">Tap the model year, or choose an older year from the list.</p>
        <div class="v2-grid-3">${TOP_YEARS.map(y => `<button type="button" class="v2-tile compact ${v.year === y ? 'is-selected' : ''}" aria-pressed="${v.year === y}" data-val="${y}">${y}</button>`).join('')}</div>
        <div class="v2-col">
          <div class="v2-field"><label for="mc-year-dd">Older model year</label>
            <select id="mc-year-dd" class="v2-select"><option value="">Select year (1981\u2013${MAX_YEAR})...</option>
              ${DROPDOWN_YEARS.map(y => `<option value="${y}" ${v.year === y ? 'selected' : ''}>${y}</option>`).join('')}
              <option value="OLDER" ${older ? 'selected' : ''}>Older than 1981</option></select></div>
          ${older ? `<div class="v2-field"><label for="mc-older-year">Enter the year (before 1981)</label>
            <input id="mc-older-year" class="v2-input" type="text" inputmode="numeric" maxlength="4" placeholder="1978" value="${esc(v.year && Number(v.year) < 1981 ? v.year : '')}"></div>
            ${ERR}<button type="button" class="v2-btn-gold" id="mc-older-year-next">Continue &rarr;</button>` : ''}
        </div>`;
      }

      case 'model': {
        const pop = popularModels(v), all = allModels(v), listed = pop.includes(v.model) || all.includes(v.model);
        const typeIn = otherModelOpen || (!!v.model && !listed) || (!loadingModels && !pop.length && !all.length);
        return `
        <h1 class="v2-heading">What is your ${esc(v.year)} ${esc(v.make)} model?</h1>
        <p class="v2-sub">${pop.length ? 'Tap your model, or choose from the full list.' : loadingModels ? 'Loading the models for ' + esc(v.year) + ' ' + esc(v.make) + '...' : all.length ? 'Choose your model from the list, or type it if it is not there.' : 'Type the model below. A best guess is fine.'}</p>
        ${pop.length ? `<div class="v2-grid-2">${pop.map(m => `<button type="button" class="v2-tile compact ${v.model === m ? 'is-selected' : ''}" aria-pressed="${v.model === m}" data-val="${esc(m)}"><span>${esc(m)}</span></button>`).join('')}</div>` : ''}
        <div class="v2-col">
          ${pop.length || all.length ? `<div class="v2-field"><label for="mc-model-dd">${all.length ? 'All ' + esc(v.year) + ' ' + esc(v.make) + ' models' : 'Another model'}</label>
            <select id="mc-model-dd" class="v2-select"><option value="">${loadingModels ? 'Loading models...' : 'Select model...'}</option>
              ${all.map(m => `<option value="${esc(m)}" ${v.model === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}
              <option value="__OTHER__" ${typeIn ? 'selected' : ''}>My model is not listed</option></select></div>` : ''}
          ${typeIn ? `<div class="v2-field"><label for="mc-model">Enter your ${esc(v.year)} ${esc(v.make)} model</label>
            <input id="mc-model" class="v2-input" type="text" autocapitalize="words" maxlength="100" value="${esc(listed ? '' : v.model)}"></div>
            ${ERR}<button type="button" class="v2-btn-gold" id="mc-model-next">Continue &rarr;</button>` : ''}
        </div>`;
      }

      case 'cc': return `
        <h1 class="v2-heading">What size is the engine?</h1>
        <p class="v2-sub">Optional. It is the number in cc, and it is often part of the model name.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="mc-cc">Engine size, cc (optional)</label><input id="mc-cc" class="v2-input" type="text" inputmode="numeric" maxlength="5" placeholder="Example: 650" value="${esc(v.engine_cc)}"></div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="mc-cc-next">Continue &rarr;</button>
          <button type="button" class="v2-btn-outline" style="width:100%" id="mc-cc-skip">Not sure, skip</button></div>
        </div>`;

      case 'owned': return `
        <h1 class="v2-heading">Do you own your ${noun(v)}?</h1>
        <p class="v2-sub">Choose the closest match.</p>
        ${tiles(OWNED, v.ownership, 2, true)}`;

      case 'tag': return `
        <h1 class="v2-heading">Will your ${noun(v)} have a license tag to drive on the road?</h1>
        <p class="v2-sub">A North Carolina license plate, now or soon.</p>
        ${tiles(TAG, v.road_tag, 1, true)}
        ${why('One that is tagged for the road is quoted differently from one that stays off-road. Knowing up front gets you the right quote the first time.')}`;

      case 'use': return `
        <h1 class="v2-heading">How do you mostly use it?</h1>
        <p class="v2-sub">Choose the closest match.</p>
        ${tiles(USES, v.use, 2, true)}`;

      case 'kept': return `
        <h1 class="v2-heading">Where is it kept?</h1>
        <p class="v2-sub">Where it sits most nights.</p>
        ${tiles(KEPT, v.storage_type, 2, true)}`;

      case 'vdetails': return `
        <h1 class="v2-heading">A few quick details</h1>
        <p class="v2-sub">Tap what you know. Leave the rest on Not sure.</p>
        ${chipRow('power', 'Gas or electric?', POWER, v.power)}
        ${chipRow('title_status', 'What kind of title does it have?', TITLE, v.title_status)}
        ${chipRow('abs', 'Anti-lock brakes (ABS)?', YNS, v.abs)}
        ${chipRow('anti_theft', 'Alarm or other anti-theft device?', YNS, v.anti_theft)}
        ${chipRow('modified', 'Custom parts or changes, such as a lift kit, custom paint or engine work?', YNS, v.modified,
          v.modified === 'Yes' ? detailBox('modifications', 'What was added or changed?', v.modifications, 'Example: Custom exhaust and saddlebags, about $2,000.') : '')}
        <div class="v2-col"><button type="button" class="v2-btn-gold" id="mc-vdetails-next">Continue &rarr;</button></div>`;

      case 'vmore': return `
        <h1 class="v2-heading">Anything else to insure?</h1>
        <p class="v2-sub">You can add up to ${MAX_VEHICLES} on one request. Motorcycles, ATVs and side-by-sides can go on the same quote.</p>
        <div class="v2-col">
          ${listRows(s.vehicles.map(x => `${vName(x)} · ${label(TYPES, x.type)}`), 'Vehicle')}
          <div class="v2-actions-stack">
            ${s.vehicles.length < MAX_VEHICLES ? '<button type="button" class="v2-btn-outline" style="width:100%" id="mc-add-vehicle">+ Add another</button>' : ''}
            <button type="button" class="v2-btn-gold" id="mc-vmore-next">No, that&rsquo;s all &rarr;</button>
          </div>
        </div>`;

      case 'contact': return `
        <h1 class="v2-heading">You&rsquo;re halfway there. Who is this quote for?</h1>
        <p class="v2-sub"><strong>Next: who rides.</strong> We send your quotes by text or email.</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="firstname">First name</label><input id="firstname" class="v2-input" type="text" autocomplete="given-name" autocapitalize="words" maxlength="40" value="${esc(s.firstname)}"></div>
            <div class="v2-field"><label for="lastname">Last name</label><input id="lastname" class="v2-input" type="text" autocomplete="family-name" autocapitalize="words" maxlength="60" value="${esc(s.lastname)}"></div>
          </div>
          <div class="v2-field"><label for="phone">Mobile phone</label><input id="phone" class="v2-input" type="tel" inputmode="tel" autocomplete="tel" value="${esc(s.phone)}"></div>
          <div class="v2-field"><label for="email">Email</label><input id="email" class="v2-input" type="email" inputmode="email" autocomplete="email" autocapitalize="off" maxlength="180" value="${esc(s.email)}"></div>
          <div class="v2-field"><label for="dob-mm">Date of birth</label>${dateBoxes('dob', s.date_of_birth, 'Date of birth')}</div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="mc-contact-next">Continue &rarr;</button>
        </div>
        ${why('Insurance companies use your name and date of birth to price a policy. We never sell your information.')}`;

      case 'address': return `
        <h1 class="v2-heading">What is your home address?</h1>
        <p class="v2-sub">Motorcycle and ATV insurance is priced by where you live.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="address">Street address</label><input id="address" class="v2-input" type="text" autocomplete="street-address" autocapitalize="words" maxlength="160" value="${esc(s.address)}"></div>
          <div class="hq-two">
            <div class="v2-field"><label for="city">City</label><input id="city" class="v2-input" type="text" autocomplete="address-level2" autocapitalize="words" maxlength="80" value="${esc(s.city)}"></div>
            <div class="v2-field"><label for="zip_code">ZIP</label><input id="zip_code" class="v2-input" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(s.zip_code)}"></div>
          </div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="mc-address-next">Next: who rides &rarr;</button>
        </div>`;

      case 'rwho': return `
        <h1 class="v2-heading">Who else rides?</h1>
        <p class="v2-sub">Add anyone in your home who rides ${state.vehicles.length > 1 ? 'them' : 'it'}.</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="r-first">First name</label><input id="r-first" class="v2-input" type="text" autocapitalize="words" maxlength="40" value="${esc(r.firstname)}"></div>
            <div class="v2-field"><label for="r-last">Last name</label><input id="r-last" class="v2-input" type="text" autocapitalize="words" maxlength="60" value="${esc(r.lastname)}"></div>
          </div>
          <div class="v2-field"><label for="rdob-mm">Date of birth</label>${dateBoxes('rdob', r.date_of_birth, 'Rider date of birth')}</div>
        </div>
        ${chipRow('relationship', 'How are they related to you?', RELATION, r.relationship).replace('v2-grid-3', 'v2-grid-2')}
        <div class="v2-col">${ERR}<button type="button" class="v2-btn-gold" id="mc-rwho-next">Continue &rarr;</button></div>`;

      case 'license': return `
        <h1 class="v2-heading">What is the status of ${whose(j)} driver license?</h1>
        <p class="v2-sub">${j === 0 ? 'We start with you. You can add other riders next.' : 'Choose the closest match.'}</p>
        ${tiles(LICENSE, r.license_status, 2, true)}`;

      case 'endorse': return `
        <h1 class="v2-heading">${j === 0 ? 'Do you' : 'Does ' + esc(r.firstname || 'this rider')} have a motorcycle endorsement? ${helpBtn('endorse')}</h1>
        <p class="v2-sub">It is the &ldquo;M&rdquo; on a North Carolina driver license.</p>
        ${tiles(ENDORSE.concat(state.vehicles.some(x => OFFROAD.includes(x.type)) ? [[NA_ENDORSE, 'Not needed, off-road only']] : []), r.endorsement, 2, true)}`;

      case 'course': return `
        <h1 class="v2-heading">${j === 0 ? 'Have you' : 'Has ' + esc(r.firstname || 'this rider')} finished a rider safety course?</h1>
        <p class="v2-sub">For example, a Motorcycle Safety Foundation class.</p>
        ${tiles(YNS, r.training, 3, true)}
        ${why('Some insurance companies give credit for an approved safety course.')}`;

      case 'record': return `
        <h1 class="v2-heading">${j === 0 ? 'Your' : esc(r.firstname || 'This rider') + '’s'} driving record</h1>
        <p class="v2-sub">In any vehicle, not only on a motorcycle. Insurance companies check, so a straight answer gets you an accurate price.</p>
        ${chipRow('violations', 'Tickets or moving violations in the past 3 years?', YNS, r.violations,
          r.violations === 'Yes' ? detailBox('violation_details', 'What and about when?', r.violation_details, 'Example: Speeding ticket, spring 2025.') : '')}
        ${chipRow('accidents', 'Accidents or insurance claims in the past 5 years?', YNS, r.accidents,
          r.accidents === 'Yes' ? detailBox('accident_details', 'What happened and about when?', r.accident_details, 'Example: Rear-ended at a stop light in 2024, not my fault.') : '')}
        ${chipRow('suspensions', 'License suspended or revoked in the past 5 years?', YNS, r.suspensions,
          r.suspensions === 'Yes' ? detailBox('suspension_details', 'Why and about when?', r.suspension_details, 'Example: Suspended for 30 days in 2022.') : '')}
        <div class="v2-col">${ERR}<button type="button" class="v2-btn-gold" id="mc-record-next">Continue &rarr;</button></div>`;

      case 'rmore': return `
        <h1 class="v2-heading">Does anyone else ride?</h1>
        <p class="v2-sub">Add anyone in your home who rides, even now and then.</p>
        <div class="v2-col">
          ${listRows(s.riders.map((x, i) => rName(x, i) + (i === 0 ? ' (you)' : '')), 'Rider')}
          <div class="v2-actions-stack">
            ${s.riders.length < MAX_RIDERS ? '<button type="button" class="v2-btn-outline" style="width:100%" id="mc-add-rider">+ Add another rider</button>' : ''}
            <button type="button" class="v2-btn-gold" id="mc-rmore-next">No, that&rsquo;s all &rarr;</button>
          </div>
        </div>`;

      case 'insured': return `
        <h1 class="v2-heading">${s.vehicles.length > 1 ? 'Are they' : 'Is it'} insured right now?</h1>
        <p class="v2-sub">Whether you have a policy now or are starting fresh, our team can help.</p>
        ${tiles([['Yes', 'Yes', 'yes'], ['No', 'No', 'no'], ['Not sure', 'Not sure', 'advise']], s.currently_insured, 3)}`;

      case 'carrier': {
        const known = insurers.some(c => c.name === s.carrier);
        const otherOn = otherCarrierOpen || (!!s.carrier && !known);
        return `
        <h1 class="v2-heading">Who insures ${s.vehicles.length > 1 ? 'them' : 'it'} now?</h1>
        <p class="v2-sub">Tap your current company so our team knows what to compare against.</p>
        <div class="v2-grid-3">${insurers.map(c => logoTile(c, s.carrier === c.name)).join('')}${logoTile({ name: 'Other', logo: '' }, otherOn)}</div>
        ${otherOn ? `<div class="v2-col">
          <div class="v2-field"><label for="mc-other-carrier">Enter your current insurance company</label>
            <input id="mc-other-carrier" class="v2-input" type="text" autocapitalize="words" maxlength="100" value="${esc(known ? '' : s.carrier)}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="mc-other-carrier-next">Continue &rarr;</button></div>` : ''}
        <div class="v2-actions-stack"><button type="button" class="v2-btn-outline" style="width:100%" id="mc-carrier-skip">Not sure</button></div>`;
      }

      case 'renewal': return `
        <h1 class="v2-heading">When does your current policy end?</h1>
        <p class="v2-sub">It is on your policy or your bill. Not sure? Skip it.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="ex-mm">Policy end date (optional)</label>${dateBoxes('ex', s.expiration, 'Policy end date')}</div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="mc-renewal-next">Continue &rarr;</button>
          <button type="button" class="v2-btn-outline" style="width:100%" id="mc-renewal-skip">Not sure</button></div>
        </div>`;

      case 'history': return `
        <h1 class="v2-heading">Your insurance history</h1>
        <p class="v2-sub">Two quick questions.</p>
        ${chipRow('continuous', 'Have you had motorcycle or ATV insurance for the past 12 months with no gap?', YNS, s.continuous)}
        ${chipRow('cancelled', 'Has an insurance company declined, cancelled or not renewed you in the past 3 years?', YNS, s.cancelled,
          s.cancelled === 'Yes' ? detailBox('cancellation_details', 'What happened and about when?', s.cancellation_details, 'Example: Policy cancelled for a missed payment in 2024.') : '')}
        <div class="v2-col">${ERR}<button type="button" class="v2-btn-gold" id="mc-history-next">Continue &rarr;</button></div>`;

      case 'start': return `
        <h1 class="v2-heading">When should coverage start?</h1>
        <p class="v2-sub">Buying one soon? Pick that date. A best guess is fine.</p>
        ${tiles([['today', 'As soon as possible'], ['week', 'In about a week'], ['month', 'The 1st of next month'], ['pick', 'Pick a date'], ['none', 'Not sure yet']], s.start_choice, 2, true)}
        ${s.start_choice === 'pick' ? `<div class="v2-col">
          <div class="v2-field"><label for="st-mm">Start date</label>${dateBoxes('st', s.effective_date, 'Start date')}</div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="mc-start-next">Continue &rarr;</button></div>` : ''}`;

      case 'cover': return `
        <h1 class="v2-heading">What coverage would you like? ${helpBtn('cover')}</h1>
        <p class="v2-sub">Liability covers other people. Comp &amp; Collision covers your own ${s.vehicles.length > 1 ? 'vehicles' : noun(s.vehicles[0])}.</p>
        ${tiles(COVER, s.coverage === MATCH ? '' : s.coverage, 1, true)}
        ${decideTile(s.coverage)}`;

      case 'limits': return `
        <h1 class="v2-heading">Choose your liability limits ${helpBtn('limits')}</h1>
        <p class="v2-sub">Pick the limit you want quoted, or let our team walk through options with you.${s.vehicles.length > 1 ? ' The same limits apply to every vehicle on the policy.' : ''}</p>
        <div class="v2-grid-2">${LIMITS.map(([v2, t, badge]) => `<button type="button" class="v2-tile compact ${s.liability_limits === v2 ? 'is-selected' : ''}" aria-pressed="${s.liability_limits === v2}" data-val="${v2}">${badge ? `<span class="v2-tile-badge">${badge}</span>` : ''}<span>${t}</span></button>`).join('')}</div>
        ${decideTile(s.liability_limits)}`;

      case 'custom': return `
        <h1 class="v2-heading">Any custom parts or equipment to cover? ${helpBtn('custom')}</h1>
        <p class="v2-sub">Things added after it left the factory, such as chrome, exhaust, saddlebags, a winch or a lift kit.</p>
        ${tiles(CUSTOM, s.custom_equipment, 1, true)}
        ${decideTile(s.custom_equipment)}`;

      case 'deductible': return `
        <h1 class="v2-heading">Which deductible would you like? ${helpBtn('deductible')}</h1>
        <p class="v2-sub">The amount you pay first on a covered claim.</p>
        ${tiles(DEDUCTIBLES, s.deductible, 3, true)}
        ${decideTile(s.deductible)}`;

      case 'extras': return `
        <h1 class="v2-heading">Last two things</h1>
        <p class="v2-sub">Both are optional.</p>
        <div class="v2-group-block"><div class="v2-group-title">Would you like another quote too? Tap any that apply.</div><div class="v2-grid-3" style="margin-bottom:0">
          ${BUNDLES.map(b => `<button type="button" class="v2-tile compact ${s.bundles.includes(b) ? 'is-selected' : ''}" aria-pressed="${s.bundles.includes(b)}" data-bundle="${b}">${b}</button>`).join('')}</div></div>
        <div class="v2-col">
          <div class="v2-field"><label for="mc-notes">Anything else we should know? (optional)</label><textarea id="mc-notes" class="v2-textarea" maxlength="900">${esc(s.notes)}</textarea></div>
          <button type="button" class="v2-btn-gold" id="mc-extras-next">Continue to review &rarr;</button>
        </div>`;

      case 'handy': return UP.screen(state.dec_choice);

      case 'review': {
        const recordLine = x => ['violations', 'accidents', 'suspensions'].map((k, n) => `${['tickets', 'accidents', 'suspensions'][n]}: ${(x[k] || 'not sure').toLowerCase()}`).join(', ');
        const rows = [];
        s.vehicles.forEach((x, i) => rows.push([s.vehicles.length > 1 ? 'Vehicle ' + (i + 1) : 'Your ' + noun(x),
          [vName(x), label(TYPES, x.type), label(OWNED, x.ownership), TAGGABLE.includes(x.type) ? 'License tag for the road: ' + (x.road_tag || 'Not sure').toLowerCase() : '', label(USES, x.use), label(KEPT, x.storage_type)].filter(Boolean).join(' · '), 'veh:' + i]));
        rows.push(['Contact', `${s.firstname} ${s.lastname} · ${s.phone} · ${s.email}`, 'contact'], ['Home address', [s.address, s.city, 'NC', s.zip_code].filter(Boolean).join(', '), 'address']);
        s.riders.forEach((x, i) => rows.push([s.riders.length > 1 ? 'Rider ' + (i + 1) : 'Rider',
          [rName(x, i), label(LICENSE, x.license_status), allOffroad() ? '' : label(ENDORSE.concat([[NA_ENDORSE, 'Endorsement not needed']]), x.endorsement), recordLine(x)].filter(Boolean).join(' · '), 'rid:' + i]));
        rows.push(['Insured now', s.currently_insured + (s.currently_insured === 'Yes' && s.carrier ? ' · ' + s.carrier : '') + (s.currently_insured === 'Yes' && s.expiration ? ' · ends ' + niceDate(s.expiration) : ''), 'ins'],
          ['Coverage starts', s.start_choice === 'none' || !s.effective_date ? 'Not sure yet' : niceDate(s.effective_date), 'start'],
          ['Coverage', s.coverage === FULL ? 'Liability plus Comp & Collision' : s.coverage === DECIDE || !s.coverage ? 'Help me decide' : s.coverage, 'cover']);
        rows.push(['Liability limits', !s.liability_limits || s.liability_limits === DECIDE ? 'Help me decide' : s.liability_limits, 'limits']);
        if (s.coverage === FULL) rows.push(['Deductible', s.deductible || DECIDE, 'deductible']);
        if (s.coverage !== 'Liability only') rows.push(['Custom equipment', s.custom_equipment === 'Yes' ? 'Yes' + (s.custom_value ? ', about ' + s.custom_value : '') : s.custom_equipment === 'No' ? 'No, it is stock' : 'Help me decide', 'custom']);
        rows.push(['Other quotes', s.bundles.length ? s.bundles.join(', ') : 'No thanks', 'extras'], ['Notes', s.notes || 'None', 'extras']);
        if (usedDec()) {   // an upload replaces the skipped questions with one line
          const skip = ['start', 'cover', 'limits', 'deductible', 'custom']; for (let i = rows.length - 1; i >= 0; i--) if (skip.includes(rows[i][2])) rows.splice(i, 1);
          rows.push(['Your policy', UP.reviewLine(), 'handy']);
        }
        return `
        <h1 class="v2-heading">Review your quote request</h1>
        <p class="v2-sub">Tap Edit to change anything, then send.</p>
        <div class="v2-col">
          <div class="v2-review-list">${rows.map(([l, t, id]) => `
            <div class="v2-review-row"><div><div class="v2-review-label">${esc(l)}</div><div class="v2-review-val">${esc(t)}</div></div>
            <button type="button" class="v2-edit-btn" data-edit="${id}">Edit</button></div>`).join('')}</div>
          ${sendError ? `<div class="v2-error" role="alert">${esc(sendError)}</div>` : ''}
          <button type="button" class="v2-btn-gold" id="mc-send" ${sending ? 'disabled' : ''}>${sending ? 'Sending…' : 'Send my quote request'}</button>
          <p class="hq-fineprint">By sending, you confirm you have reviewed your answers. Requesting a quote does not bind, change or cancel coverage.</p>
        </div>`;
      }

      case 'done': return `
        <div class="v2-final-icon" aria-hidden="true">${icon('confirm')}</div>
        <h1 class="v2-heading">A licensed North Carolina agent is comparing insurance for your ${s.vehicles.length > 1 ? 'vehicles' : noun(s.vehicles[0])}. We will send your prices by text or email within one business day.</h1>
        ${s.email ? `<p class="v2-final-confirm-email">A confirmation email is on its way to <strong>${esc(s.email)}</strong>.</p>` : ''}
        ${HANDY_ON ? UP.failNote() : ''}<p class="v2-sub">Request reference: <strong>${esc(confirmation)}</strong>. Have a question right now? Call us or text us below.</p>
        <div class="v2-final-actions">
          <a class="v2-btn-gold" href="tel:3368351993" data-source="motorcycle_v2_final_call">Call 336-835-1993</a>
          <a class="v2-btn-navy" href="sms:+13368279065" data-source="motorcycle_v2_final_text">Text (336) 827-9065</a>
        </div>
        ${s.bundles.length ? `<div class="hq-offer"><strong>You asked for ${s.bundles.length > 1 ? 'other quotes' : (s.bundles[0] === 'Auto' ? 'an auto' : 'a ' + s.bundles[0].toLowerCase()) + ' quote'} too.</strong><p>Each one takes a few minutes.</p>
          ${s.bundles.map(b => `<a class="v2-btn-outline" style="width:100%;margin-top:8px" href="/${b.toLowerCase()}-quote?src=motorcycle_quote_done" data-source="motorcycle_quote_done_${b.toLowerCase()}">Start my ${b.toLowerCase()} quote &rarr;</a>`).join('')}</div>` : ''}`;
    }
    return '';
  }

  // ---------- What the office receives ----------
  function buildPayload() {
    const s = state, off = allOffroad();
    const ans = x => x || 'Not sure';
    const extraNotes = [], tagNotes = [];
    s.vehicles.forEach((v, i) => { if (!TAGGABLE.includes(v.type)) return; const a = v.road_tag || 'Not sure';
      tagNotes.push(a === 'Yes' ? `*** LICENSE TAG FOR ROAD USE: YES - Vehicle ${i + 1} (${vName(v)}). Quote as tagged for the road. ***` : `License tag for road use, Vehicle ${i + 1} (${vName(v)}): ${a === 'No' ? 'No, off-road only' : 'Not sure - ask'}.`); });
    if (s.start_choice === 'none' || !s.effective_date) extraNotes.push('Start date: not sure yet. Today’s date was sent as a placeholder.');
    if (s.coverage !== 'Liability only') {
      const ce = s.custom_equipment === 'Yes' ? 'YES' + (s.custom_value ? ', worth about ' + s.custom_value : ', value not given') : s.custom_equipment === 'No' ? 'No, it is stock' : 'Help me decide';
      tagNotes.push('Custom parts and equipment coverage: ' + ce + '.');
    }
    if (s.bundles.length > 1) extraNotes.push('Also wants quotes for: ' + s.bundles.join(', ') + '.');
    return {
      form_type: 'motorcycle_insurance', cta_source: ctaSource,
      applicant: { firstname: (TP + s.firstname).trim().slice(0, 60), lastname: s.lastname.slice(0, 60), date_of_birth: s.date_of_birth, phone: s.phone, email: s.email.slice(0, 180),
        address: oneLine(s.address).slice(0, 180), city: oneLine(s.city).slice(0, 80), state: 'NC', zip_code: s.zip_code,
        effective_date: s.start_choice === 'none' || !s.effective_date ? todayIso() : s.effective_date },
      assets: s.vehicles.map(v => ({ type: v.type, year: v.year, make: oneLine(v.make).slice(0, 100), model: oneLine(v.model).slice(0, 100), engine_cc: v.engine_cc,
        power: v.power, ownership: v.ownership, lender: ['Financed', 'Leased'].includes(v.ownership) ? (oneLine(v.lender).slice(0, 180) || LATER) : '',
        storage_same: 'Not sure', title_status: v.title_status, use: v.use, storage_type: v.storage_type, abs: v.abs, anti_theft: v.anti_theft,
        modified: v.modified, modifications: v.modified === 'Yes' ? (v.modifications.trim().slice(0, 600) || LATER) : '' })),
      operators: s.riders.map((r, j) => ({ same_as_applicant: j === 0 ? 'Yes' : 'No',
        firstname: j === 0 ? '' : oneLine(r.firstname).slice(0, 60), lastname: j === 0 ? '' : oneLine(r.lastname).slice(0, 60), date_of_birth: j === 0 ? '' : r.date_of_birth,
        relationship: j === 0 ? 'Self' : r.relationship, license_status: r.license_status, endorsement: off ? NA_ENDORSE : ans(r.endorsement), training: ans(r.training),
        violations: ans(r.violations), violation_details: r.violations === 'Yes' ? (r.violation_details.trim().slice(0, 600) || LATER) : '',
        accidents: ans(r.accidents), accident_details: r.accidents === 'Yes' ? (r.accident_details.trim().slice(0, 600) || LATER) : '',
        suspensions: ans(r.suspensions), suspension_details: r.suspensions === 'Yes' ? (r.suspension_details.trim().slice(0, 600) || LATER) : '' })),
      coverage: { currently_insured: ans(s.currently_insured), carrier: s.currently_insured === 'Yes' ? (oneLine(s.carrier).slice(0, 100) || 'Not sure') : '',
        expiration: s.currently_insured === 'Yes' ? s.expiration : '', continuous: ans(s.continuous), cancelled: ans(s.cancelled),
        cancellation_details: s.cancelled === 'Yes' ? (s.cancellation_details.trim().slice(0, 600) || LATER) : '',
        coverage: !s.coverage || s.coverage === MATCH ? DECIDE : s.coverage, liability_limits: s.liability_limits || DECIDE, deductible: s.coverage === FULL ? (s.deductible || DECIDE) : s.coverage === 'Liability only' ? 'Not requested' : DECIDE,
        medical: DECIDE, uninsured: DECIDE, towing: DECIDE,
        bundle: s.bundles.length === 0 ? 'No thanks' : s.bundles.length === 1 ? s.bundles[0] : 'Several policies',
        notes: (decNote() + tagNotes.concat([TP + s.notes.trim()], extraNotes).join('\n').trim()).trim().slice(0, 1200) },
      confirm_accuracy: true   // the customer sends from the Review screen, which says so
    };
  }
  window.__MC_PREVIEW_PAYLOAD__ = () => (LIVE ? null : buildPayload());

  async function send() {
    if (sending) return;
    if (decFilesLost()) { stepId = 'handy'; history = ['type:0', 'handy']; sendError = ''; render(true); window.scrollTo(0, 0); return; }
    if (state.start_choice !== 'none' && state.effective_date && state.effective_date < todayIso()) { sendError = 'The start date has passed. Tap Edit next to “Coverage starts” and choose a new date.'; render(); return; }
    sending = true; sendError = ''; render();
    try {
      const r = await fetch('/api/quote-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.ok !== true || !/^MOTORCYCLE-[0-9]{6}-[A-Z0-9]{4}$/.test(j.confirmationNumber || '')) throw new Error('no-ack');
      confirmation = j.confirmationNumber; submitted = true;
      if (HANDY_ON && UP.count()) await UP.send({ name: (TP + state.firstname + ' ' + state.lastname).trim(), phone: state.phone, email: state.email, carrier: state.carrier,
        notes: TP + 'Ref: ' + confirmation + ' | Policy type: motorcycle / ATV quote' + (usedDec() ? ' | The customer uploaded the declarations page and skipped the coverage questions.' : '') });
      if (LIVE && typeof window.gtag === 'function') {
        const d = { form_type: 'motorcycle', form_name: 'motorcycle_quote', service_line: 'motorcycle', cta_source: ctaSource, method: 'backend_acknowledged' };
        window.gtag('event', 'form_submit', d); window.gtag('event', 'generate_lead', d);
      } else track('motorcycle_v2_test_submit', { confirmation_number: confirmation });
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
    const lines = [`${TP}=== PARTIAL MOTORCYCLE / ATV QUOTE LEAD (Abandoned Mid-Form) ===`.trim(), `Stopped at: ${sid()}`, `Name: ${name}`, `Phone: ${s.phone}`, `Email: ${s.email}`,
      `DOB: ${s.date_of_birth || 'Not entered'}`].concat(s.vehicles.map((v, i) => `Vehicle ${i + 1}: ${vName(v)} (${label(TYPES, v.type) || 'type not entered'})${v.road_tag ? ' - license tag for road use: ' + v.road_tag : ''}`),
      [s.address ? `Address: ${[s.address, s.city, 'NC', s.zip_code].filter(Boolean).join(', ')}` : '']).filter(Boolean);
    try {
      fetch('/api/homepage-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify({
        formType: 'contact', name: `${TP}[PARTIAL MOTORCYCLE QUOTE - Stopped at: ${sid()}] ${name}`.trim().slice(0, 150),
        phone: String(s.phone).slice(0, 50), email: s.email.slice(0, 254), message: lines.join('\n').slice(0, 4900) }) }).catch(() => {});
      track(LIVE ? 'partial_lead_saved' : 'motorcycle_v2_test_partial', { stopped_at: sid() });
    } catch (_) {}
  }

  // ---------- Pop-ups: help, and a details sheet (lender) ----------
  function overlay(el, html) { el.innerHTML = html; el.hidden = false; document.body.classList.add('v2-help-open'); requestAnimationFrame(() => el.classList.add('is-in')); }
  function closeOverlay(el) { if (!el) return; el.classList.remove('is-in'); el.hidden = true; document.body.classList.remove('v2-help-open'); }
  function openHelp(key) {
    const h = HELP[key]; if (!h) return;
    if (!helpEl) { helpEl = document.createElement('div'); helpEl.className = 'v2-help-overlay'; helpEl.hidden = true; document.body.appendChild(helpEl);
      helpEl.addEventListener('click', e => { if (e.target === helpEl || e.target.closest('[data-help-close]')) closeOverlay(helpEl); }); }
    overlay(helpEl, `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="mc-help-title" tabindex="-1"><div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="mc-help-title">${esc(h.title)}</h2><button type="button" class="v2-help-x" data-help-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${esc(h.body)}</p><div class="v2-help-example"><strong>Example</strong><p>${esc(h.example)}</p></div>
      <p class="v2-help-fine">General information only. Your policy decides what is covered.</p>
      <button type="button" class="v2-btn-gold v2-help-ok" data-help-close>Got it</button></div>`);
  }
  // One small pop-up for a single typed answer: the lender, or the value of custom equipment.
  let sheetCfg = null;
  const SHEETS = {
    lender: { title: 'Who is the loan or lease with?', body: 'The bank, credit union or finance company. They are listed on the policy.', label: 'Lender name', ph: 'Example: State Employees Credit Union', max: 180, mode: 'text',
      get: () => V().lender, set: t => { V().lender = t; } },
    custom: { title: 'About how much is it all worth?', body: 'A rough total for everything added. A best guess is fine, and our team can help you work it out.', label: 'Approximate value', ph: 'Example: $2,500', max: 40, mode: 'text',
      get: () => state.custom_value, set: t => { state.custom_value = t; } }
  };
  function openSheet(kind) {
    sheetCfg = SHEETS[kind];
    if (!sheetEl) { sheetEl = document.createElement('div'); sheetEl.className = 'v2-help-overlay hq-claim-overlay'; sheetEl.hidden = true; document.body.appendChild(sheetEl);
      sheetEl.addEventListener('click', e => {
        const t = $('mc-sheet-text');
        if (e.target.closest('[data-sheet-save]')) { sheetCfg.set(oneLine(e.target.closest('[data-sheet-skip]') ? '' : t.value)); closeOverlay(sheetEl); save(); track('motorcycle_v2_step_complete'); next(); return; }
        if (e.target === sheetEl || e.target.closest('[data-sheet-close]')) { sheetCfg.set(oneLine(t.value)); save(); closeOverlay(sheetEl); }
      }); }
    overlay(sheetEl, `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="mc-sheet-title" tabindex="-1"><div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="mc-sheet-title">${sheetCfg.title}</h2><button type="button" class="v2-help-x" data-sheet-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${sheetCfg.body}</p>
      <label class="hq-claim-label" for="mc-sheet-text">${sheetCfg.label}</label>
      <input id="mc-sheet-text" class="v2-input" type="text" autocapitalize="words" maxlength="${sheetCfg.max}" placeholder="${esc(sheetCfg.ph)}" value="${esc(sheetCfg.get())}">
      <button type="button" class="v2-btn-gold v2-help-ok" data-sheet-save>Save and continue &rarr;</button>
      <button type="button" class="v2-btn-outline hq-claim-skip" data-sheet-save data-sheet-skip>Skip, I&rsquo;ll tell you later</button></div>`);
    const t = $('mc-sheet-text'); if (t) { try { t.focus({ preventScroll: true }); } catch (_) {} }
  }
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (sheetEl && !sheetEl.hidden) closeOverlay(sheetEl); else if (helpEl && !helpEl.hidden) closeOverlay(helpEl); });

  // ---------- Render + events ----------
  function render(animate) {
    const stage = $('stage'), seq = sequence(), i = Math.max(0, seq.indexOf(stepId));
    const pct = stepId === 'done' ? 100 : Math.max(6, Math.round((i / (seq.length - 1)) * 100));
    const fill = $('v2-progress-fill'), lab = $('v2-progress-label'), bar = $('v2-progressbar');
    if (fill) fill.style.width = pct + '%'; if (lab) lab.textContent = pct + '%'; if (bar) bar.setAttribute('aria-valuenow', String(pct));
    const about = document.querySelector('.v2-about'); if (about) about.hidden = stepId !== 'type:0';
    const showBack = history.length > 1 && stepId !== 'done';
    stage.innerHTML = `<div class="${animate ? 'v2-step-enter' : ''}"><div class="v2-back-row"><button type="button" class="v2-back-link" id="v2-back" ${showBack ? '' : 'hidden'}>&larr; Back</button></div>
      <div class="v2-eyebrow">${eyebrow()}</div>${screen()}</div>`;
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
  const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
  function dropStale() { const seq = sequence(); history = history.filter(h => seq.includes(h)); if (!history.length) history = [stepId]; }

  function bind() {
    const s = sid();
    on('v2-back', back);
    if (HANDY_ON) UP.bind({ rerender: () => render(),
      choose: c => { state.dec_choice = c; if (c === 'questions') state.used_dec = false; save(); fireFormStart(); render(); if (c === 'questions') setTimeout(next, 230); },
      next: () => { state.dec_choice = 'upload'; state.used_dec = true; save(); next(); } });
    each('[data-help]', b => b.addEventListener('click', () => openHelp(b.dataset.help)));

    // Tap-one-and-move-on screens
    each('#stage [data-val]:not([data-chip])', b => b.addEventListener('click', () => {
      const x = b.dataset.val, v = V(), r = R();
      if (s === 'type') return pick(b, () => { if (v.type !== x) { const offWas = OFFROAD.includes(v.type), offNow = OFFROAD.includes(x); if (v.type && offWas !== offNow) v.make = ''; } v.type = x; if (!TAGGABLE.includes(x)) v.road_tag = ''; });
      if (s === 'make') { otherMakeOpen = false; return pick(b, () => { if (v.make !== x) v.model = ''; v.make = x; }); }
      if (s === 'year') return pick(b, () => { if (v.year !== x) v.model = ''; v.year = x; });
      if (s === 'model') return pick(b, () => { v.model = x; });
      if (s === 'owned') {
        if (x === 'Financed' || x === 'Leased') { b.parentElement.querySelectorAll('.v2-tile').forEach(t => t.classList.remove('is-selected')); b.classList.add('is-selected'); v.ownership = x; save(); fireFormStart(); openSheet('lender'); return; }
        return pick(b, () => { v.ownership = x; v.lender = ''; });
      }
      if (s === 'tag') return pick(b, () => { v.road_tag = x; });
      if (s === 'use') return pick(b, () => { v.use = x; });
      if (s === 'kept') return pick(b, () => { v.storage_type = x; });
      if (s === 'license') return pick(b, () => { r.license_status = x; });
      if (s === 'endorse') return pick(b, () => { r.endorsement = x; });
      if (s === 'course') return pick(b, () => { r.training = x; });
      if (s === 'insured') return pick(b, () => { state.currently_insured = x; if (x !== 'Yes') { state.carrier = ''; state.expiration = ''; if (state.coverage === MATCH) state.coverage = ''; } });
      if (s === 'cover') return pick(b, () => { state.coverage = x; if (x !== FULL) state.deductible = ''; });
      if (s === 'deductible') return pick(b, () => { state.deductible = x; });
      if (s === 'limits') return pick(b, () => { state.liability_limits = x; });
      if (s === 'custom') {
        if (x === 'Yes') { document.querySelectorAll('#stage .v2-tile').forEach(t => t.classList.remove('is-selected')); b.classList.add('is-selected'); state.custom_equipment = 'Yes'; save(); openSheet('custom'); return; }
        return pick(b, () => { state.custom_equipment = x; state.custom_value = ''; });
      }
      if (s === 'start') {
        const d = new Date();
        if (x === 'pick') { state.start_choice = 'pick'; save(); render(); const f = $('st-mm'); if (f) f.focus(); return; }
        if (x === 'none') return pick(b, () => { state.start_choice = 'none'; state.effective_date = ''; });
        if (x === 'week') d.setDate(d.getDate() + 7);
        if (x === 'month') d.setMonth(d.getMonth() + 1, 1);
        return pick(b, () => { state.start_choice = x; state.effective_date = iso(d); });
      }
    }));

    // Answer buttons that stay on the screen
    const chipTarget = () => (s === 'vdetails' ? V() : s === 'history' ? state : R());
    each('[data-chip]', b => b.addEventListener('click', () => { chipTarget()[b.dataset.chip] = b.dataset.val; save(); fireFormStart(); rerender(); const t = document.querySelector('#stage [data-ta]:placeholder-shown'); if (t && b.dataset.val === 'Yes') { try { t.focus({ preventScroll: true }); } catch (_) {} } }));
    each('[data-ta]', t => t.addEventListener('input', () => { chipTarget()[t.dataset.ta] = t.value; save(); }));

    // Make: another brand
    each('[data-make-other]', b => b.addEventListener('click', () => { otherMakeOpen = true; const v = V(); if ((OFFROAD.includes(v.type) ? MAKES_OFF : MAKES_ROAD).includes(v.make)) v.make = ''; render(); const o = $('mc-other-make'); if (o) o.focus(); }));
    on('mc-other-make-next', () => { const m = oneLine(val('mc-other-make')); if (!m) { showErr('Please enter the brand.'); return; } const v = V(); if (v.make !== m) v.model = ''; v.make = m; otherMakeOpen = false; save(); fireFormStart(); next(); });

    const yearDd = $('mc-year-dd');
    if (yearDd) yearDd.addEventListener('change', () => {
      const y = yearDd.value, v = V();
      if (y === 'OLDER') { olderYearOpen = true; rerender(); const o = $('mc-older-year'); if (o) o.focus(); return; }
      if (!y) return;
      olderYearOpen = false; if (v.year !== y) v.model = ''; v.year = y; save(); track('motorcycle_v2_step_complete'); fireFormStart(); next();
    });
    on('mc-older-year-next', () => {
      const y = val('mc-older-year'), v = V();
      if (!/^\d{4}$/.test(y) || Number(y) < 1900 || Number(y) > 1980) { showErr('Please enter a four-digit year before 1981, for example 1978.'); return; }
      if (v.year !== y) v.model = ''; v.year = y; olderYearOpen = false; save(); fireFormStart(); next();
    });
    const modelDd = $('mc-model-dd');
    if (modelDd) modelDd.addEventListener('change', () => {
      const m = modelDd.value;
      if (m === '__OTHER__') { otherModelOpen = true; const v = V(); if (popularModels(v).includes(v.model) || allModels(v).includes(v.model)) v.model = ''; rerender(); const o = $('mc-model'); if (o) o.focus(); return; }
      if (!m) return;
      otherModelOpen = false; V().model = m; save(); track('motorcycle_v2_step_complete'); next();
    });
    on('mc-model-next', () => { const m = oneLine(val('mc-model')); if (!m) { showErr('Please enter the model. A best guess is fine.'); return; } V().model = m; otherModelOpen = false; save(); next(); });
    on('mc-cc-next', () => { const cc = val('mc-cc').replace(/[^\d]/g, ''); if (cc && Number(cc) > 10000) { showErr('Please check the engine size, or tap Not sure.'); return; } V().engine_cc = cc ? String(Number(cc)) : ''; save(); next(); });
    on('mc-cc-skip', () => { V().engine_cc = ''; save(); next(); });
    on('mc-vdetails-next', () => { save(); next(); });

    // Vehicle and rider lists
    on('mc-add-vehicle', () => { if (state.vehicles.length >= MAX_VEHICLES) return; state.vehicles.push(blankV()); go('type:' + (state.vehicles.length - 1)); });
    on('mc-vmore-next', () => { save(); next(); });
    on('mc-add-rider', () => { if (state.riders.length >= MAX_RIDERS) return; state.riders.push(blankR()); go('rwho:' + (state.riders.length - 1)); });
    on('mc-rmore-next', () => { save(); next(); });
    each('[data-list-edit]', b => b.addEventListener('click', () => {
      const i = Number(b.dataset.listEdit);
      if (s === 'vmore') { editStack.push({ to: 'vmore', until: 'vdetails:' + i }); go('type:' + i); }
      else { editStack.push({ to: 'rmore', until: 'record:' + i }); go((i > 0 ? 'rwho:' : 'license:') + i); }
    }));
    each('[data-list-remove]', b => b.addEventListener('click', () => {
      const i = Number(b.dataset.listRemove); if (i < 1) return;
      (s === 'vmore' ? state.vehicles : state.riders).splice(i, 1); dropStale(); save(); rerender();
    }));

    const ph = $('phone'); if (ph) ph.addEventListener('input', () => { ph.value = fmtPhone(ph.value); });
    on('mc-contact-next', () => {
      state.firstname = oneLine(val('firstname')); state.lastname = oneLine(val('lastname')); state.phone = val('phone'); state.email = val('email');
      const dob = readDate('dob');
      if (!state.firstname || !state.lastname) { showErr('Please enter your first and last name.'); return; }
      if (state.phone.replace(/\D/g, '').length !== 10) { showErr('Please enter a 10-digit phone number.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { showErr('Please enter a valid email address.'); return; }
      if (!dob || dob >= todayIso() || dob < '1900-01-01') { showErr('Please enter your date of birth as month, day and four-digit year.'); return; }
      state.date_of_birth = dob; contactDone = true; next();
    });
    on('mc-address-next', () => {
      state.address = oneLine(val('address')); state.city = oneLine(val('city')); state.zip_code = val('zip_code').replace(/\D/g, '').slice(0, 5);
      if (!state.address || !state.city) { showErr('Please enter the street address and city.'); return; }
      if (!/^(27|28)\d{3}$/.test(state.zip_code)) { showErr('Please enter a North Carolina ZIP code (it starts with 27 or 28).'); return; }
      save(); next();
    });
    ['r-first', 'r-last'].forEach(id => { const e = $(id); if (e) e.addEventListener('input', () => { R()[id === 'r-first' ? 'firstname' : 'lastname'] = e.value; save(); }); });
    ['rdob-mm', 'rdob-dd', 'rdob-yyyy'].forEach(id => { const e = $(id); if (e) e.addEventListener('input', () => { const d = readDate('rdob'); if (d) { R().date_of_birth = d; save(); } }); });
    on('mc-rwho-next', () => {
      const r = R(); r.firstname = oneLine(val('r-first')); r.lastname = oneLine(val('r-last'));
      const dob = readDate('rdob');
      if (!r.firstname || !r.lastname) { showErr('Please enter the rider’s first and last name.'); return; }
      if (!dob || dob >= todayIso() || dob < '1900-01-01') { showErr('Please enter the rider’s date of birth as month, day and four-digit year.'); return; }
      if (!r.relationship) { showErr('Please tap how they are related to you.'); return; }
      r.date_of_birth = dob; save(); next();
    });
    on('mc-record-next', () => { const r = R(); if (!r.violations || !r.accidents || !r.suspensions) { showErr('Please answer all three questions. Not sure is fine.'); return; } save(); track('motorcycle_v2_step_complete'); next(); });

    each('[data-carrier]', b => b.addEventListener('click', () => {
      if (b.dataset.carrier === 'Other') { otherCarrierOpen = true; if (insurers.some(c => c.name === state.carrier)) state.carrier = ''; render(); const o = $('mc-other-carrier'); if (o) o.focus(); return; }
      otherCarrierOpen = false; pick(b, () => { state.carrier = b.dataset.carrier; });
    }));
    on('mc-other-carrier-next', () => { const c = oneLine(val('mc-other-carrier')); if (!c) { showErr('Please enter the insurance company name, or tap Not sure.'); return; } state.carrier = c; otherCarrierOpen = false; next(); });
    on('mc-carrier-skip', () => { state.carrier = ''; otherCarrierOpen = false; next(); });
    on('mc-renewal-next', () => { const d = readDate('ex'); if (d === null) { showErr('Please enter the date as month, day and four-digit year, or tap Not sure.'); return; } state.expiration = d; save(); next(); });
    on('mc-renewal-skip', () => { state.expiration = ''; save(); next(); });
    on('mc-history-next', () => { if (!state.continuous || !state.cancelled) { showErr('Please answer both questions. Not sure is fine.'); return; } save(); track('motorcycle_v2_step_complete'); next(); });
    on('mc-start-next', () => { const d = readDate('st'); if (!d) { showErr('Please enter the start date as month, day and four-digit year.'); return; }
      if (d < todayIso()) { showErr('The start date cannot be in the past.'); return; } state.effective_date = d; save(); next(); });

    each('[data-bundle]', b => b.addEventListener('click', () => { const k = b.dataset.bundle, at = state.bundles.indexOf(k); if (at === -1) state.bundles.push(k); else state.bundles.splice(at, 1);
      const n = $('mc-notes'); if (n) state.notes = n.value; save(); rerender(); }));
    const notes = $('mc-notes'); if (notes) notes.addEventListener('input', () => { state.notes = notes.value; save(); });
    on('mc-extras-next', next);

    each('[data-edit]', b => b.addEventListener('click', () => {
      const [k, n] = b.dataset.edit.split(':');
      if (k === 'veh') { editStack = [{ to: 'review', until: 'vdetails:' + n }]; go('type:' + n); return; }
      if (k === 'rid') { editStack = [{ to: 'review', until: 'record:' + n }]; go((Number(n) > 0 ? 'rwho:' : 'license:') + n); return; }
      if (k === 'ins') { editStack = [{ to: 'review', until: 'history' }]; go('insured'); return; }
      if (k === 'cover') { editStack = [{ to: 'review', until: 'extras' }]; go('cover'); return; }   // walks limits, deductible and custom equipment too
      editStack = [{ to: 'review' }]; go(k);
    }));
    on('mc-send', send);
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
      insurers = list.filter(c => c && c.enabled !== false && c.name !== 'Other')
        .sort((a, b) => (a.order || 99) - (b.order || 99)).map(c => ({ name: c.name, logo: c.logo || '', showLabel: !!c.showLabel }));
      if (stepId === 'carrier') render();
    }).catch(() => {});
  }

  restore();
  if (decFilesLost() && sequence().includes('handy')) { stepId = 'handy'; history = ['type:0', 'handy']; }
  if (!sequence().includes(stepId)) { stepId = 'type:0'; history = ['type:0']; }
  if (sid() === 'model') loadModels(V());
  render();
})();
