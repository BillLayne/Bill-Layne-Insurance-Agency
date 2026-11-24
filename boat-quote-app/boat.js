/* Bill Layne Insurance - Boat / Personal Watercraft Quote V2 (tap-through). Same look and engine as the motorcycle form.
   A live page sets window.BLI_BQ_MODE = 'live' before loading this file; the private test page leaves it unset.
   Every value sent matches what the office script (validateSpecialtyQuote, boat schema) accepts today. */
(function () {
  'use strict';

  const LIVE = window.BLI_BQ_MODE === 'live';
  // Thank-you screen: the shared "What happens next" box and "Save our number" link (quote-shared/thanks.js).
  const THANKS2_ON = true;   // live since 2026-11-23 (approved by Bill)
  const TY = () => (THANKS2_ON && window.BLI_THANKS) || null;
  const TP = LIVE ? '' : '[TEST BOAT V2] ';
  const STORAGE_KEY = LIVE ? 'bli_boat_quote_session' : 'bli_boat_v2_test_session';
  const params = new URLSearchParams(window.location.search);
  const srcParam = /^[a-z0-9_-]{1,80}$/i.test(params.get('src') || '') ? params.get('src') : '';
  const ctaSource = LIVE ? (srcParam || 'boat_quote') : 'boat_v2_test';
  const MAX_BOATS = 3, MAX_OPERATORS = 4;

  const ICON_BASE = 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-';
  const ICONS = { yes: 'insured-yes-8pg2wf', no: 'insured-no-mk4ws4', advise: 'coverage-not-sure-jmye8d', confirm: 'confirm-dbnygk' };
  const icon = n => `<img src="${ICON_BASE}${ICONS[n]}.svg" alt="" class="v2-tile-icon" width="48" height="48" onerror="this.remove()">`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // [value the office script accepts, wording the customer sees]
  const PWC = 'Personal watercraft / Jet Ski';
  const TYPES = [['Pontoon / deck boat', 'Pontoon or deck boat'], ['Fishing / bass boat', 'Fishing or bass boat'], ['Runabout / bowrider', 'Runabout or bowrider'], ['Cruiser / cabin boat', 'Cruiser or cabin boat'],
    ['Sailboat', 'Sailboat'], [PWC, 'Jet Ski or personal watercraft'], ['Other', 'Something else']];
  const NOUN = { 'Pontoon / deck boat': 'pontoon', 'Fishing / bass boat': 'fishing boat', 'Runabout / bowrider': 'boat', 'Cruiser / cabin boat': 'boat', 'Sailboat': 'sailboat', [PWC]: 'watercraft', 'Other': 'boat' };
  const MAKES = { 'Pontoon / deck boat': ['Bennington', 'Sun Tracker', 'Harris', 'Sylvan', 'Lowe', 'Avalon', 'Godfrey', 'Crest'],
    'Fishing / bass boat': ['Tracker', 'Ranger', 'Nitro', 'Skeeter', 'Triton', 'Lowe', 'Alumacraft', 'Carolina Skiff'],
    'Runabout / bowrider': ['Sea Ray', 'Bayliner', 'Chaparral', 'Stingray', 'Tahoe', 'Glastron', 'Yamaha', 'MasterCraft'],
    'Cruiser / cabin boat': ['Sea Ray', 'Bayliner', 'Chaparral', 'Carver', 'Regal', 'Rinker'],
    'Sailboat': ['Catalina', 'Hunter', 'Beneteau', 'Hobie', 'MacGregor', 'O’Day'],
    [PWC]: ['Sea-Doo', 'Yamaha', 'Kawasaki'] };
  // Popular models shown as tiles on the model screen (suggestions only; the customer can always type another one).
  // Keyed by type first because a brand such as Lowe or Yamaha builds different boats for different uses.
  const MODELS = {
    'Pontoon / deck boat': { 'Bennington': ['S Series', 'SX Series', 'L Series', 'R Series', 'Q Series', 'QX Series'], 'Sun Tracker': ['Party Barge 18', 'Party Barge 20', 'Party Barge 22', 'Bass Buggy 16', 'Bass Buggy 18', 'Fishin\u2019 Barge 20'],
      'Harris': ['Cruiser', 'Sunliner', 'Solstice', 'Grand Mariner', 'Crowne'], 'Sylvan': ['Mirage', 'L Series', 'S Series', 'G Series', 'X Series'], 'Lowe': ['Ultra', 'SS', 'SF', 'Retreat'],
      'Avalon': ['Venture', 'LSZ', 'Catalina', 'Excalibur'], 'Godfrey': ['Sweetwater', 'AquaPatio', 'Sanpan', 'Monaco'], 'Crest': ['Classic', 'Caliber', 'Savannah', 'Continental'] },
    'Fishing / bass boat': { 'Tracker': ['Pro Team 175', 'Pro Team 190', 'Pro Team 195', 'Bass Tracker Classic', 'Pro Guide', 'Grizzly'], 'Ranger': ['Z518', 'Z519', 'Z520', 'Z521', 'RT178', 'RT188'],
      'Nitro': ['Z17', 'Z18', 'Z19', 'Z20', 'Z21'], 'Skeeter': ['ZX200', 'ZX225', 'ZX250', 'FXR20', 'FXR21'], 'Triton': ['18 TRX', '19 TRX', '20 TRX', '21 TRX'],
      'Lowe': ['Stinger', 'Skorpion', 'Roughneck', 'Fish & Ski'], 'Alumacraft': ['Competitor', 'Classic', 'Trophy', 'Escape', 'Prowler'], 'Carolina Skiff': ['17 LS', '19 LS', '21 LS', 'JVX Series', 'E Series', 'Ultra Elite'] },
    'Runabout / bowrider': { 'Sea Ray': ['SPX 190', 'SPX 210', 'SPX 230', 'SDX 250', 'SLX 260', 'Sundeck'], 'Bayliner': ['VR4', 'VR5', 'VR6', 'Element E16', 'Element E18', '185 Bowrider'],
      'Chaparral': ['19 SSi', '21 SSi', '23 SSi', '21 Surf', 'H2O 19', 'H2O 21'], 'Stingray': ['182 SC', '192 SC', '201 DC', '208 LR', '225 SE'], 'Tahoe': ['185 S', '210 S', '450 TS', '500 TS', '1950', '2150'],
      'Glastron': ['GT 185', 'GT 205', 'GX 195', 'GX 215', 'GTD 200'], 'Yamaha': ['AR190', 'AR210', 'SX190', 'SX210', '212', '242'], 'MasterCraft': ['NXT20', 'NXT22', 'XT21', 'XT23', 'X24', 'ProStar'] },
    'Cruiser / cabin boat': { 'Sea Ray': ['Sundancer 260', 'Sundancer 320', 'Sundancer 370', 'SLX 280'], 'Bayliner': ['Ciera', '285', '305', '335'], 'Chaparral': ['Signature 250', 'Signature 270', 'Signature 310', 'Signature 330'],
      'Carver': ['C34', 'C37', 'C40', 'C43', 'C52'], 'Regal': ['26 Express', '28 Express', '33 Express', '38 Grande Coupe'], 'Rinker': ['260 EX', '290 EX', '310 EX', '340 EX'] },
    'Sailboat': { 'Catalina': ['22', '25', '27', '30', '34', '36'], 'Hunter': ['22', '26', '27', '31', '33', '36'], 'Beneteau': ['Oceanis 30.1', 'Oceanis 34.1', 'Oceanis 38.1', 'First 27', 'First 36'],
      'Hobie': ['Hobie 16', 'Hobie 14', 'Getaway', 'Wave', 'Tandem Island'], 'MacGregor': ['26M', '26X', '25', '22'], 'O\u2019Day': ['22', '23', '25', '27', '30'] },
    [PWC]: { 'Sea-Doo': ['Spark', 'Spark Trixx', 'GTI 130', 'GTI SE', 'GTX 170', 'RXP-X', 'Wake 170', 'FishPro'], 'Yamaha': ['EX', 'EX Deluxe', 'VX', 'VX Cruiser', 'FX Cruiser', 'GP1800R'],
      'Kawasaki': ['STX 160', 'Ultra 160', 'Ultra 310', 'SX-R'] }
  };
  const popularModels = v => (MODELS[v.type] || {})[v.make] || [];
  const ENGINES = [['Outboard', 'Outboard'], ['Inboard', 'Inboard'], ['Stern drive / I-O', 'Stern drive (inboard/outboard)'], ['Jet drive', 'Jet drive'],
    ['Sail with auxiliary motor', 'Sail with a small motor'], ['Sail only / no motor', 'Sail only, no motor'], ['Other', 'Something else']];
  // The office script needs one number for value. A range sends its midpoint and the range itself goes in the notes.
  const VALUES = [['4000', 'Under $5,000'], ['10000', '$5,000 to $15,000'], ['22000', '$15,000 to $30,000'], ['45000', '$30,000 to $60,000'], ['80000', 'Over $60,000']];
  const OWNED = [['Owned outright', 'I own it outright'], ['Financed', 'I’m making payments'], ['Leased', 'It’s leased'], ['Shopping / not purchased', 'Still shopping']];
  const USES = [['Personal recreation', 'Family fun and cruising'], ['Fishing for pleasure', 'Fishing for fun'], ['Charter / guide / business', 'Charter, guide or business'], ['Rental to others', 'I rent it out'],
    ['Racing', 'Racing'], ['Live aboard', 'I live aboard'], ['Other', 'Something else']];
  const WATERS = [['Inland lakes / rivers', 'Lakes and rivers'], ['Coastal / intracoastal', 'Coast or Intracoastal Waterway'], ['Offshore / ocean', 'Offshore or ocean'], ['Other / not sure', 'Not sure']];
  const HOME_STORAGE = 'Home on trailer';
  const KEPT = [[HOME_STORAGE, 'At home on a trailer'], ['Marina slip', 'Marina slip'], ['Dry stack', 'Dry stack storage'], ['Storage yard', 'Storage yard'], ['Mooring buoy', 'On a mooring'], ['Other', 'Somewhere else']];
  const YNS = [['Yes', 'Yes'], ['No', 'No'], ['Not sure', 'Not sure']];
  const HULL = [['Fiberglass', 'Fiberglass'], ['Aluminum', 'Aluminum'], ['Not sure', 'Not sure']];
  const LICENSE = [['Valid', 'Valid license'], ['Permit', 'Learner’s permit'], ['Suspended / revoked', 'Suspended or revoked'], ['No license', 'No license'], ['Other / discuss', 'Something else']];
  // The office script needs one number for years of boat ownership. The low end of the range is sent and the range goes in the notes.
  const OWN_YEARS = [['0', 'This is my first boat'], ['1', '1 to 2 years'], ['3', '3 to 5 years'], ['6', '6 to 10 years'], ['11', 'More than 10 years']];
  const RELATION = [['Spouse / partner', 'Spouse or partner'], ['Child', 'Child'], ['Other household member', 'Lives with me'], ['Other', 'Someone else']];
  const FULL = 'Liability plus comprehensive and collision', DECIDE = 'Help me decide', MATCH = 'Match my current policy';
  const COVER = [['Liability only', 'Liability only'], [FULL, 'Liability plus coverage for my boat']];
  const LIMITS = [['$100,000', '$100,000'], ['$300,000', '$300,000'], ['$500,000', '$500,000']];
  const DEDUCTIBLES = [['$250', '$250'], ['$500', '$500'], ['$1,000', '$1,000'], ['$2,500', '$2,500']];
  const GEAR = [['Yes', 'Yes, I have gear to cover'], ['No', 'No']];
  const BUNDLES = ['Auto', 'Home', 'Renters'];
  const LATER = 'Will provide later';

  const HELP = {
    cover: { title: 'Liability and coverage for your boat', body: 'Liability pays for injuries and damage you cause to other people and their property on the water. Coverage for your boat may pay to repair or replace your own boat, motor and trailer after a crash, theft, fire, storm or sinking. A lender or a marina usually requires it.',
      example: 'A storm damages your boat on its trailer. Liability only would not pay for it. Coverage for your boat may, after your deductible.' },
    limits: { title: 'Liability limit', body: 'The most your policy may pay when you are responsible for injuring someone or damaging their property with your boat. Some marinas and lenders ask for a certain amount.',
      example: 'Your boat hits a dock and another boat. With a $300,000 limit, the policy may pay up to $300,000 for the damage and injuries.' },
    deductible: { title: 'Deductible', body: 'The part of a covered repair bill you pay yourself before your coverage pays. You choose the amount. A higher deductible means you pay more out of pocket when you have a claim.',
      example: 'With a $500 deductible and a $3,000 covered repair, you pay $500 and the policy may pay the remaining $2,500.' },
    gear: { title: 'Fishing gear and equipment', body: 'Rods, reels, tackle, electronics you carry on and off, coolers, skis and tubes. A boat policy usually covers only a small amount of these unless you ask for more.',
      example: 'Your tackle and two fish finders are stolen from the boat. Fishing equipment coverage may pay to replace them.' },
    value: { title: 'What it is worth', body: 'A rough figure for the boat and its motor together, not counting the trailer. A best guess is fine; our team checks it before quoting.',
      example: 'A 2019 pontoon with a 115 horsepower outboard that would sell for about $28,000 goes in the $15,000 to $30,000 group.' }
  };

  // Insurer logo tiles: same list and logos as the other forms.
  const LOGOS_URL = (function () { try { return new URL('../auto-quote-app/logos.json', document.currentScript.src).href; } catch (_) { return '../auto-quote-app/logos.json'; } })();
  const IL = 'https://img.billlayneinsurance.com/i/2026/11/';
  let insurers = [['State Farm', 'state-farm-insurance-logo-c4hm2m.png'], ['Allstate', 'allstate-insurance-logo-nq7c5z.png'], ['Nationwide', 'nationwide-insurance-logo-j5zp2s.png'],
    ['Progressive', 'progressive-insurance-logo-2kcvze.png'], ['GEICO', 'geico-insurance-logo-s92zrs.png'], ['Liberty Mutual', 'liberty-mutual-insurance-logo-ffrtts.png']]
    .map(([name, f]) => ({ name, logo: IL + f, showLabel: false }));
  let otherCarrierOpen = false, otherMakeOpen = false, olderYearOpen = false, exactValueOpen = false, otherModelOpen = false, otherMotorOpen = false;
  function logoTile(c, selected) {
    const safe = esc(c.name);
    const inner = c.logo
      ? `<span class="v2-logo-frame"><img src="${esc(c.logo)}" alt="${safe}" width="132" height="60" class="is-carrier-logo" onerror="this.parentElement.innerHTML='<span class=\\'v2-logo-text\\'>${safe}</span>'"></span>${c.showLabel ? `<span class="v2-logo-label">${safe}</span>` : ''}`
      : `<span class="v2-logo-frame"><span class="v2-logo-text">${safe}</span></span>`;
    return `<button type="button" class="v2-tile logo-tile ${c.logo && c.showLabel ? 'has-label' : ''} ${selected ? 'is-selected' : ''}" aria-label="${safe}" aria-pressed="${selected}" data-carrier="${safe}">${inner}</button>`;
  }
  // Brand logo tiles (hosted on the agency image host). A brand with no file here shows its name as text.
  const MAKE_LOGOS = { 'Bayliner': 'bayliner-boat-logo-2zmbxk.png', 'MasterCraft': 'mastercraft-boat-logo-fthbjy.png', 'Nitro': 'nitro-boat-logo-44cexk.png', 'Ranger': 'ranger-boat-logo-jc3a64.png',
    'Sea Ray': 'sea-ray-boat-logo-akdf6k.png', 'Sun Tracker': 'sun-tracker-boat-logo-p3vup4.png', 'Tahoe': 'tahoe-boat-logo-wvcngg.png', 'Tracker': 'tracker-boat-logo-gev75d.png', 'Triton': 'triton-boat-logo-sksbwx.png',
    'Yamaha': 'yamaha-motorcycle-logo-6xghss.png', 'Kawasaki': 'jet-ski-boat-logo-jhjn59.png',   /* Kawasaki only appears on the Jet Ski screen; Bill chose the Jet Ski wordmark for it */
    // supplied by Bill 2026-11-20
    'Alumacraft': 'alumacraft-boat-logo-bq9wcy.png', 'Avalon': 'avalon-boat-logo-ft7s6j.png', 'Beneteau': 'beneteau-boat-logo-tbjy8y.png', 'Bennington': 'bennington-boat-logo-kv5y5e.png',
    'Carolina Skiff': 'carolina-skiff-boat-logo-kegz6q.png', 'Carver': 'carver-boat-logo-bufkbt.png', 'Catalina': 'catalina-boat-logo-mt8dm5.png', 'Chaparral': 'chaparral-boat-logo-ynfrq7.png',
    'Crest': 'crest-boat-logo-rp4nu5.png', 'Glastron': 'glastron-boat-logo-e3q2v3.png', 'Godfrey': 'godfrey-boat-logo-296scg.png', 'Harris': 'harris-boat-logo-k3p4b5.png', 'Hobie': 'hobie-boat-logo-s58mwg.png',
    'Hunter': 'hunter-boat-logo-6vfrfg.png', 'Lowe': 'lowe-boat-logo-dt6zte.png', 'MacGregor': 'macgregor-boat-logo-x53wdx.png', 'O\u2019Day': 'o-day-boat-logo-gzggax.png', 'Regal': 'regal-boat-logo-w2y3ac.png',
    'Rinker': 'rinker-boat-logo-fp3zyd.png', 'Sea-Doo': 'sea-doo-boat-logo-b9hsxz.png', 'Skeeter': 'skeeter-boat-logo-z63ut2.png', 'Stingray': 'stingray-boat-logo-3azdpj.png', 'Sylvan': 'sylvan-boat-logo-vt98bu.png' };
  const MAKE_LABELLED = ['Crest', 'Harris'];   // these logos are a symbol with no name on it, so the name is printed underneath
  function makeTile(m, selected) {
    const safe = esc(m), f = MAKE_LOGOS[m], lab = f && MAKE_LABELLED.includes(m);
    const inner = f
      ? `<span class="v2-logo-frame"><img src="${IL}${f}" alt="${safe}" width="132" height="60" class="is-carrier-logo" onerror="this.parentElement.innerHTML='<span class=\\'v2-logo-text\\'>${safe}</span>'"></span>${lab ? `<span class="v2-logo-label">${safe}</span>` : ''}`
      : `<span class="v2-logo-frame"><span class="v2-logo-text">${safe}</span></span>`;
    return `<button type="button" class="v2-tile logo-tile ${lab ? 'has-label' : ''} ${selected ? 'is-selected' : ''}" aria-label="${safe}" aria-pressed="${selected}" data-val="${safe}">${inner}</button>`;
  }
  // Simple side-view drawings so a customer can pick by look, not by name. Bow points right. Live since 2026-11-20 (approved by Bill).
  const TYPE_ART_ON = true;
  const WATER = '<path d="M2 44q5-3 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0" stroke="#8696ab" stroke-width="1.6"/>';
  const TYPE_ART = {
    'Pontoon / deck boat': '<path d="M9 36a3.5 3.5 0 0 1 3.5-3.5H80l9 3.5-9 3.5H12.5A3.5 3.5 0 0 1 9 36z"/><path d="M14 32.500V23h60v9.500M26 23v9.500M38 23v9.500M50 23v9.500M62 23v9.500"/><path d="M24 23V11M56 23V11M18 11.500q22-7 44 0"/><path d="M9 30H5v9"/>',
    'Fishing / bass boat': '<path d="M7 31h67l18-4-10 11H13z"/><path d="M7 31v-8H3v11l1.500 7"/><path d="M30 31v-6m-3.500 0h7v-4h-7zM66 31v-5m-3.500 0h7v-4h-7z"/><path d="M43 31v-5l6-3v8"/><path d="M86 28l4-9"/>',
    'Runabout / bowrider': '<path d="M9 28h53q18 0 30-4l-8 14H15q-6 0-6-10z"/><path d="M52 28l-7-10h3l11 10"/><path d="M15 28v-5h10v5M30 28v-4h8v4"/><path d="M66 27q11-5 22-2.500"/><path d="M10 35l-5 7"/>',
    'Cruiser / cabin boat': '<path d="M6 27h64q16 0 23-4l-7 15H12z"/><path d="M20 27V16h30l11 11"/><path d="M25 16v-6h16l5 6"/><path d="M26 19.500h8v4h-8zM38 19.500h8v4h-8z"/><circle cx="66" cy="32" r="1.6"/><circle cx="74" cy="31.500" r="1.6"/><circle cx="58" cy="32.500" r="1.6"/>',
    'Sailboat': '<path d="M14 32h68l-8 7H22z"/><path d="M48 32V4"/><path d="M45.500 7v22h-25z"/><path d="M51 10v19h23z"/><path d="M44 39l2 5h6l2-5"/>',
    'Personal watercraft / Jet Ski': '<path d="M10 34q20-4 46-4l28-4q6 0 4 4L78 38H18q-8 0-8-4z"/><path d="M24 30q2-6 16-6h10l4 6"/><path d="M56 30l8-8 20 4"/><path d="M57 29l4-10m-3 0h8"/>',
    'Other': '<path d="M14 28h68l-8 10H22z"/><text x="48" y="21" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor" stroke="none" font-family="inherit">?</text>'
  };
  const TYPE_HINT = { 'Fishing / bass boat': 'Low deck with fishing seats', 'Runabout / bowrider': 'Open boat for skiing and cruising', 'Cruiser / cabin boat': 'Has a cabin you can sleep in', 'Pontoon / deck boat': 'Flat deck on floats' };
  const typeTile = ([v, t], current) => v === 'Other'   // no drawing: a slim full-width row so all seven choices fit a phone's first screen
    ? `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-val="${esc(v)}" style="grid-column:1/-1;min-height:48px"><span>${esc(t)}</span></button>`
    : `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-val="${esc(v)}" style="flex-direction:column;gap:2px;padding:8px 8px 9px">
      <svg viewBox="0 0 96 48" width="92" height="46" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;color:#05203d">${TYPE_ART[v]}${WATER}</svg>
      <span>${esc(t)}</span>${TYPE_HINT[v] ? `<small style="display:block;font-size:12.5px;font-weight:600;line-height:1.25;color:#334155">${TYPE_HINT[v]}</small>` : ''}</button>`;
  // Motor screen upgrade: drawings of where the motor sits, a shorter list by boat type, and an outboard brand + horsepower screen.
  // Live since 2026-11-20 (approved by Bill).
  const MOTOR_V2 = true;
  const HULL_BACK = '<path d="M94 19H34l-5 17h65"/>';   // the back end of a boat, stern on the left
  const ENGINE_ART = {
    'Outboard': HULL_BACK + '<rect x="15" y="8" width="15" height="12" rx="3"/><path d="M24 20v20M19 40h10M24 40v4M30 19h4"/>',
    'Inboard': HULL_BACK + '<rect x="58" y="23" width="15" height="9" rx="2"/><path d="M58 30L40 41M37 37l5 8M33 36v9"/>',
    'Stern drive / I-O': HULL_BACK + '<rect x="37" y="23" width="15" height="9" rx="2"/><path d="M37 28h-7M30 26h-7v15M17 41h10M23 41v3"/>',
    'Jet drive': HULL_BACK + '<path d="M30 27h-7v6h7M48 36q5 4 11 0"/><path d="M20 30H9M20 26l-9-4M20 34l-9 4" stroke="#8696ab"/>',
    'Sail with auxiliary motor': TYPE_ART['Sailboat'] + '<path d="M9 25h6v5H9zM12 30v10M9 40h6"/>',
    'Sail only / no motor': TYPE_ART['Sailboat'],
    'Other': '<path d="M14 28h68l-8 10H22z"/><text x="48" y="21" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor" stroke="none" font-family="inherit">?</text>'
  };
  const ENGINE_HINT = { 'Outboard': 'Hangs on the back of the boat', 'Inboard': 'Inside the boat, propeller underneath', 'Stern drive / I-O': 'Motor inside, drive on the back', 'Jet drive': 'No propeller' };
  const ENGINE_NAME = { 'Stern drive / I-O': 'Stern drive' };
  const SAIL_ENGINES = ['Sail with auxiliary motor', 'Sail only / no motor', 'Other'];
  const enginesFor = v => ENGINES.filter(([k]) => v.type === 'Sailboat' ? SAIL_ENGINES.includes(k) : k === 'Other' || !SAIL_ENGINES.includes(k));
  const engineTile = ([k, t], current) => k === 'Other'
    ? `<button type="button" class="v2-tile compact ${current === k ? 'is-selected' : ''}" aria-pressed="${current === k}" data-val="${esc(k)}" style="grid-column:1/-1;min-height:48px"><span>${esc(t)}</span></button>`
    : `<button type="button" class="v2-tile compact ${current === k ? 'is-selected' : ''}" aria-pressed="${current === k}" data-val="${esc(k)}" style="flex-direction:column;gap:2px;padding:8px 8px 9px">
      <svg viewBox="0 0 96 48" width="92" height="46" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;color:#05203d">${ENGINE_ART[k]}${WATER}</svg>
      <span>${esc(ENGINE_NAME[k] || t)}</span>${ENGINE_HINT[k] ? `<small style="display:block;font-size:12.5px;font-weight:600;line-height:1.25;color:#334155">${ENGINE_HINT[k]}</small>` : ''}</button>`;
  const MOTOR_BRANDS = ['Mercury', 'Yamaha', 'Honda', 'Suzuki', 'Evinrude', 'Johnson', 'Tohatsu'];
  const hasMotor = v => v.engine_type !== 'Sail only / no motor';
  const MAX_YEAR = new Date().getFullYear() + 1;
  const TOP_YEARS = Array.from({ length: 18 }, (_, i) => String(MAX_YEAR - i));
  const DROPDOWN_YEARS = Array.from({ length: MAX_YEAR - 1981 + 1 }, (_, i) => String(MAX_YEAR - i));

  // ---------- State ----------
  const blankB = () => ({ type: '', make: '', year: '', model: '', length_feet: '', horsepower: '', engine_type: '', motor_brand: '', value: '', value_label: '', ownership: '', lender: '',
    use: '', waters: '', storage_type: '', storage_place: '', trailer: '', hull_material: 'Not sure', modified: 'Not sure', modifications: '' });
  const blankO = () => ({ firstname: '', lastname: '', date_of_birth: '', relationship: '', license_status: '', ownership_years: '', training: '',
    violations: '', violation_details: '', accidents: '', accident_details: '', suspensions: '', suspension_details: '' });
  const blank = () => ({ boats: [blankB()], operators: [blankO()], firstname: '', lastname: '', phone: '', email: '', date_of_birth: '', address: '', city: '', zip_code: '',
    currently_insured: '', carrier: '', expiration: '', continuous: '', cancelled: '', cancellation_details: '',
    effective_date: '', start_choice: '', coverage: '', liability_limits: '', deductible: '', gear: '', gear_value: '', bundles: [], notes: '' });
  let state = blank(), stepId = 'type:0', history = ['type:0'];
  let sending = false, sendError = '', confirmation = '', contactDone = false, submitted = false, formStarted = false;
  let editStack = [];   // { to, until }: jump to `to` after finishing step `until` (or after the very next step when `until` is not set)
  let helpEl = null, sheetEl = null;

  const sid = () => stepId.split(':')[0];
  const idx = () => Number(stepId.split(':')[1] || 0);
  const B = () => state.boats[idx()] || state.boats[0];
  const O = () => state.operators[idx()] || state.operators[0];

  function save() { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state, stepId, history, contactDone, t: Date.now() })); } catch (_) {} }
  function restore() {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (raw && raw.state && raw.stepId && raw.stepId !== 'done' && Array.isArray(raw.state.boats) && raw.state.boats.length && Array.isArray(raw.state.operators) && raw.state.operators.length) {
        state = Object.assign(blank(), raw.state);
        state.boats = state.boats.slice(0, MAX_BOATS).map(v => Object.assign(blankB(), v));
        state.operators = state.operators.slice(0, MAX_OPERATORS).map(r => Object.assign(blankO(), r));
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
    const base = LIVE ? { cta_source: ctaSource, form_type: 'boat', step_id: sid() }
      : { traffic_type: 'internal', cta_source: 'boat_v2_test', form_name: 'boat_quote_v2_test', step_id: sid() };
    if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign(base, detail || {}));
  }
  function fireFormStart() {
    if (formStarted) return; formStarted = true;
    if (LIVE && typeof window.gtag === 'function') window.gtag('event', 'form_start', { form_type: 'boat', form_name: 'boat_quote', cta_source: ctaSource });
  }

  // ---------- Flow ----------
  const BOAT_STEPS = ['type', 'make', 'year', 'model', 'size', 'engine', 'motor', 'value', 'owned', 'use', 'waters', 'kept', 'trailer', 'vdetails'];
  const OP_STEPS = ['rwho', 'license', 'years', 'course', 'record'];
  // The auto form's upload-or-continue step (shared file /quote-shared/upload.js): two tiles, and an upload skips the coverage questions.
  // Live since 2026-11-20 (approved by Bill).
  const UP = window.BLIUpload || null;
  const HANDY_ON = !!UP;
  const usedDec = () => HANDY_ON && !!state.used_dec && state.currently_insured === 'Yes';
  const decNote = () => (usedDec() ? 'DECLARATIONS PAGE UPLOADED - the customer chose to skip the coverage questions. Take the coverage details from the attached page or ask.\n' : '');
  function decFilesLost() {   // attached files live in memory only; after a reload the skipped questions come back
    if (!(HANDY_ON && state.used_dec) || UP.count()) return false;
    state.used_dec = false; state.dec_choice = ''; save(); return true;
  }
  function sequence() {
    const seq = [];
    state.boats.forEach((v, i) => BOAT_STEPS.forEach(st => { if (st === 'engine' && v.type === PWC) return; if (st === 'motor' && (!MOTOR_V2 || !hasMotor(v))) return; seq.push(st + ':' + i); }));   // a personal watercraft is always jet drive
    seq.push('vmore', 'contact', 'address');
    state.operators.forEach((r, j) => OP_STEPS.forEach(st => { if (st === 'rwho' && j === 0) return; seq.push(st + ':' + j); }));
    seq.push('rmore', 'insured');
    if (state.currently_insured === 'Yes') { seq.push('carrier'); if (HANDY_ON) seq.push('handy'); if (!usedDec()) seq.push('renewal'); }
    if (usedDec()) { seq.push('extras', 'review', 'done'); return seq; }   // the declarations page answers the rest
    seq.push('history', 'start', 'cover', 'limits');
    if (state.coverage === FULL) seq.push('deductible');
    if (state.coverage !== 'Liability only') seq.push('gear');
    seq.push('extras', 'review', 'done');
    return seq;
  }
  const EYEBROW = { handy: 'CURRENT COVERAGE', vmore: 'YOUR BOAT', contact: 'ABOUT YOU', address: 'ABOUT YOU', rmore: 'OPERATORS',
    insured: 'CURRENT COVERAGE', carrier: 'CURRENT COVERAGE', renewal: 'CURRENT COVERAGE', history: 'CURRENT COVERAGE',
    start: 'YOUR COVERAGE', cover: 'YOUR COVERAGE', limits: 'YOUR COVERAGE', deductible: 'YOUR COVERAGE', gear: 'YOUR COVERAGE', extras: 'ALMOST DONE', review: 'REVIEW', done: 'QUOTE RECEIVED' };
  function eyebrow() {
    const s = sid();
    if (BOAT_STEPS.includes(s)) return state.boats.length > 1 ? `WATERCRAFT ${idx() + 1} OF ${state.boats.length}` : 'YOUR BOAT';
    if (OP_STEPS.includes(s)) return state.operators.length > 1 ? `OPERATOR ${idx() + 1} OF ${state.operators.length}` : 'OPERATORS';
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
    otherMakeOpen = false; olderYearOpen = false; exactValueOpen = false; otherModelOpen = false; otherMotorOpen = false; save();
    if (!fromBack) { try { window.history.pushState({ bq: stepId }, ''); } catch (_) {} }
    track('boat_v2_step_view'); render(true); window.scrollTo(0, 0);
  }
  function pick(btn, fn) {
    if (btn) { document.querySelectorAll('#stage .v2-tile:not([data-chip])').forEach(t => t.classList.remove('is-selected')); btn.classList.add('is-selected'); }
    fn(); save(); track('boat_v2_step_complete'); fireFormStart(); setTimeout(next, 230);
  }

  // ---------- Small builders ----------
  const helpBtn = key => `<button type="button" class="v2-help-btn" data-help="${key}" aria-label="What is ${esc(HELP[key].title)}?">?</button>`;
  const tiles = (list, current, cols, compact) => `<div class="v2-grid-${cols}">${list.map(([v, t, ic]) =>
    `<button type="button" class="v2-tile ${compact ? 'compact' : ''} ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-val="${esc(v)}">${ic ? icon(ic) : ''}<span>${esc(t)}</span></button>`).join('')}</div>`;
  const decideTile = (current, text) => `<div class="v2-grid-2 hq-decide" style="grid-template-columns:1fr">
      <button type="button" class="v2-tile compact ${current === DECIDE ? 'is-selected' : ''}" data-val="${DECIDE}">${text || 'Not sure, help me decide'}</button></div>`;
  // A question with small answer buttons that stay on the screen (no auto-advance).
  const chipRow = (key, question, list, current, extra) => `<div class="v2-group-block"><div class="v2-group-title">${question}</div><div class="v2-grid-3" style="margin-bottom:0">${list.map(([v, t]) =>
    `<button type="button" class="v2-tile compact ${current === v ? 'is-selected' : ''}" aria-pressed="${current === v}" data-chip="${key}" data-val="${esc(v)}">${esc(t)}</button>`).join('')}</div>${extra || ''}</div>`;
  const detailBox = (key, labelText, value, ph) => `<div class="v2-field" style="margin-top:12px"><label for="ta-${key}">${labelText}</label>
    <textarea id="ta-${key}" class="v2-textarea" rows="3" maxlength="600" data-ta="${key}" placeholder="${esc(ph)}">${esc(value)}</textarea></div>`;
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
  // A leading 1 or 0 is never part of a US area code (it is the country code from autofill or habit), so it is dropped
  // before the 10 digits are kept. Without this the last digit of the real number was cut off.
  const phoneOk = v => { const d = String(v || '').replace(/\D/g, ''); return d.length === 10 && /^[2-9]\d\d[2-9]/.test(d) && !/^(\d)\1{9}$/.test(d); };
  const fmtPhone = v => { const d = (v || '').replace(/\D/g, '').replace(/^[01]+/, '').slice(0, 10); return d.length >= 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length >= 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d; };
  const money = n => '$' + Number(n).toLocaleString('en-US');
  function showErr(msg) { const e = $('hq-err'); if (e) { e.textContent = msg; e.hidden = !msg; if (msg) e.scrollIntoView({ block: 'center' }); } }
  const ERR = '<div id="hq-err" class="v2-error" role="alert" hidden></div>';
  const why = t => `<div class="v2-why"><span class="v2-why-badge" aria-hidden="true">i</span><div><strong>Why we ask</strong><p>${t}</p></div></div>`;
  const label = (list, v) => (list.find(x => x[0] === v) || [, ''])[1];
  const noun = v => NOUN[v.type] || 'boat';
  const bName = v => [v.year, v.make, v.model === 'Not sure' ? '' : v.model].filter(Boolean).join(' ') || label(TYPES, v.type) || 'Watercraft';
  const oName = (r, j) => j === 0 ? (`${state.firstname} ${state.lastname}`.trim() || 'You') : (`${r.firstname} ${r.lastname}`.trim() || 'Operator ' + (j + 1));
  const whose = j => j === 0 ? 'your' : esc((state.operators[j].firstname || 'this person') + '’s');
  const many = () => state.boats.length > 1;
  const listRows = (items, kind) => `<div class="v2-review-list">${items.map((t, i) => `
    <div class="v2-review-row"><div><div class="v2-review-label">${kind} ${i + 1}</div><div class="v2-review-val">${esc(t)}</div></div>
    <div style="display:flex;gap:8px"><button type="button" class="v2-edit-btn" data-list-edit="${i}">Edit</button>${i > 0 ? `<button type="button" class="v2-edit-btn" data-list-remove="${i}">Remove</button>` : ''}</div></div>`).join('')}</div>`;

  // ---------- Screens ----------
  function screen() {
    const s = state, v = B(), r = O(), j = idx();
    switch (sid()) {
      case 'type': return `
        <h1 class="v2-heading">${j === 0 ? 'What would you like to insure?' : 'What is the next one?'}</h1>
        <p class="v2-sub">${TYPE_ART_ON ? 'Tap the one that looks like yours.' : j === 0 ? 'Tap an option to start. A licensed North Carolina team compares boat insurance for you.' : 'Choose the closest match.'}</p>
        ${TYPE_ART_ON ? `<div class="v2-grid-2">${TYPES.map(t => typeTile(t, v.type)).join('')}</div>` : tiles(TYPES, v.type, 2, true)}`;

      case 'make': {
        const list = MAKES[v.type] || [], known = list.includes(v.make), otherOn = otherMakeOpen || (!!v.make && !known) || !list.length;
        return `
        <h1 class="v2-heading">Who makes your ${noun(v)}?</h1>
        <p class="v2-sub">${list.length ? 'Tap the brand.' : 'Type the brand below.'}</p>
        ${list.length ? `<div class="v2-grid-3">${list.map(m => makeTile(m, v.make === m)).join('')}
          <button type="button" class="v2-tile logo-tile ${otherOn ? 'is-selected' : ''}" aria-pressed="${otherOn}" data-make-other><span class="v2-logo-frame"><span class="v2-logo-text">Another brand</span></span></button></div>` : ''}
        ${otherOn ? `<div class="v2-col">
          <div class="v2-field"><label for="bq-other-make">Enter the brand</label><input id="bq-other-make" class="v2-input" type="text" autocapitalize="words" maxlength="100" value="${esc(known ? '' : v.make)}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="bq-other-make-next">Continue &rarr;</button></div>` : ''}`;
      }

      case 'year': {
        const older = olderYearOpen || (!!v.year && Number(v.year) < 1981);
        return `
        <h1 class="v2-heading">What year is your ${esc(v.make)}?</h1>
        <p class="v2-sub">Tap the model year, or choose an older year from the list.</p>
        <div class="v2-grid-3">${TOP_YEARS.map(y => `<button type="button" class="v2-tile compact ${v.year === y ? 'is-selected' : ''}" aria-pressed="${v.year === y}" data-val="${y}">${y}</button>`).join('')}</div>
        <div class="v2-col">
          <div class="v2-field"><label for="bq-year-dd">Older model year</label>
            <select id="bq-year-dd" class="v2-select"><option value="">Select year (1981–${MAX_YEAR})...</option>
              ${DROPDOWN_YEARS.map(y => `<option value="${y}" ${v.year === y ? 'selected' : ''}>${y}</option>`).join('')}
              <option value="OLDER" ${older ? 'selected' : ''}>Older than 1981</option></select></div>
          ${older ? `<div class="v2-field"><label for="bq-older-year">Enter the year (before 1981)</label>
            <input id="bq-older-year" class="v2-input" type="text" inputmode="numeric" maxlength="4" placeholder="1978" value="${esc(v.year && Number(v.year) < 1981 ? v.year : '')}"></div>
            ${ERR}<button type="button" class="v2-btn-gold" id="bq-older-year-next">Continue &rarr;</button>` : ''}
        </div>`;
      }

      case 'model': {
        const pop = popularModels(v), listed = pop.includes(v.model);
        const typeIn = !pop.length || otherModelOpen || (!!v.model && !listed && v.model !== 'Not sure');
        return `
        <h1 class="v2-heading">What is your ${esc(v.year)} ${esc(v.make)} model?</h1>
        <p class="v2-sub">${pop.length ? 'Tap your model, or type it if it is not shown.' : 'Type the model below. A best guess is fine.'}</p>
        ${pop.length ? `<div class="v2-grid-2">${pop.map(m => `<button type="button" class="v2-tile compact ${v.model === m ? 'is-selected' : ''}" aria-pressed="${v.model === m}" data-val="${esc(m)}"><span>${esc(m)}</span></button>`).join('')}
          <button type="button" class="v2-tile compact ${typeIn ? 'is-selected' : ''}" data-model-other><span>Another model</span></button>
          <button type="button" class="v2-tile compact ${v.model === 'Not sure' ? 'is-selected' : ''}" data-val="Not sure"><span>Not sure</span></button></div>` : ''}
        ${typeIn ? `<div class="v2-col">
          <div class="v2-field"><label for="bq-model">Enter your ${esc(v.year)} ${esc(v.make)} model</label><input id="bq-model" class="v2-input" type="text" autocapitalize="words" maxlength="100" placeholder="Example: ${v.type === PWC ? 'GTI 130' : 'Party Barge 20'}" value="${esc(listed || v.model === 'Not sure' ? '' : v.model)}"></div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="bq-model-next">Continue &rarr;</button>
          ${pop.length ? '' : '<button type="button" class="v2-btn-outline" style="width:100%" id="bq-model-skip">Not sure of the model</button>'}</div></div>` : ''}`;
      }

      case 'size': return `
        <h1 class="v2-heading">How big is it?</h1>
        <p class="v2-sub">${MOTOR_V2 ? 'Optional. A best guess is fine.' : 'Both are optional. Fill in what you know.'}</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="bq-length">Length, feet</label><input id="bq-length" class="v2-input" type="text" inputmode="decimal" maxlength="5" placeholder="Example: 20" value="${esc(v.length_feet)}"></div>
            ${MOTOR_V2 ? '' : `<div class="v2-field"><label for="bq-hp">Horsepower</label><input id="bq-hp" class="v2-input" type="text" inputmode="numeric" maxlength="5" placeholder="Example: 115" value="${esc(v.horsepower)}"></div>`}
          </div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="bq-size-next">Continue &rarr;</button>
          <button type="button" class="v2-btn-outline" style="width:100%" id="bq-size-skip">Not sure, skip</button></div>
        </div>`;

      case 'engine': return `
        <h1 class="v2-heading">What kind of motor does it have?</h1>
        <p class="v2-sub">${MOTOR_V2 ? 'Tap the one that looks like yours.' : 'Choose the closest match.'}</p>
        ${MOTOR_V2 ? `<div class="v2-grid-2">${enginesFor(v).map(e => engineTile(e, v.engine_type)).join('')}</div>` : tiles(ENGINES, v.engine_type, 2, true)}`;

      case 'motor': {
        const outboard = v.engine_type === 'Outboard', known = MOTOR_BRANDS.includes(v.motor_brand);
        const otherOn = otherMotorOpen || (!!v.motor_brand && !known && v.motor_brand !== 'Not sure');
        return `
        <h1 class="v2-heading">${outboard ? 'Tell us about the motor' : 'How much horsepower?'}</h1>
        <p class="v2-sub">${outboard ? 'Both are optional. Tap the brand and add the horsepower if you know it.' : 'Optional. It is usually on the motor or in the owner\u2019s papers.'}</p>
        ${outboard ? `<div class="v2-group-block"><div class="v2-group-title">Who makes the motor?</div><div class="v2-grid-3" style="margin-bottom:0">
          ${MOTOR_BRANDS.map(m => `<button type="button" class="v2-tile compact ${v.motor_brand === m ? 'is-selected' : ''}" aria-pressed="${v.motor_brand === m}" data-motor="${m}">${m}</button>`).join('')}
          <button type="button" class="v2-tile compact ${otherOn ? 'is-selected' : ''}" aria-pressed="${otherOn}" data-motor="__OTHER__">Another</button>
          <button type="button" class="v2-tile compact ${v.motor_brand === 'Not sure' ? 'is-selected' : ''}" aria-pressed="${v.motor_brand === 'Not sure'}" data-motor="Not sure">Not sure</button></div>
          ${otherOn ? `<div class="v2-field" style="margin-top:12px"><label for="bq-motor-other">Enter the motor brand</label><input id="bq-motor-other" class="v2-input" type="text" autocapitalize="words" maxlength="60" value="${esc(known || v.motor_brand === 'Not sure' ? '' : v.motor_brand)}"></div>` : ''}</div>` : ''}
        <div class="v2-col">
          <div class="v2-field"><label for="bq-hp">Horsepower${outboard ? ' (optional)' : ''}</label><input id="bq-hp" class="v2-input" type="text" inputmode="numeric" maxlength="5" placeholder="Example: 115" value="${esc(v.horsepower)}"></div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="bq-motor-next">Continue &rarr;</button>
          <button type="button" class="v2-btn-outline" style="width:100%" id="bq-motor-skip">Not sure, skip</button></div>
        </div>`;
      }

      case 'value': {
        const exactOn = exactValueOpen || (!!v.value && !v.value_label && v.value !== '1');
        return `
        <h1 class="v2-heading">About what is it worth? ${helpBtn('value')}</h1>
        <p class="v2-sub">The boat and motor together, not the trailer. A best guess is fine.</p>
        ${tiles(VALUES.map(([n, t]) => [t, t]), v.value_label, 2, true)}
        <div class="v2-grid-2">
          <button type="button" class="v2-tile compact ${exactOn ? 'is-selected' : ''}" data-value-exact><span>Type an amount</span></button>
          <button type="button" class="v2-tile compact ${v.value_label === 'Not sure' ? 'is-selected' : ''}" data-val="Not sure"><span>Not sure</span></button></div>
        ${exactOn ? `<div class="v2-col">
          <div class="v2-field"><label for="bq-value">Approximate value in dollars</label><input id="bq-value" class="v2-input" type="text" inputmode="numeric" maxlength="10" placeholder="Example: 18500" value="${esc(v.value_label ? '' : v.value)}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="bq-value-next">Continue &rarr;</button></div>` : ''}`;
      }

      case 'owned': return `
        <h1 class="v2-heading">Do you own your ${noun(v)}?</h1>
        <p class="v2-sub">Choose the closest match.</p>
        ${tiles(OWNED, v.ownership, 2, true)}`;

      case 'use': return `
        <h1 class="v2-heading">How do you mostly use it?</h1>
        <p class="v2-sub">Choose the closest match.</p>
        ${tiles(USES, v.use, 2, true)}`;

      case 'waters': return `
        <h1 class="v2-heading">Where do you take it?</h1>
        <p class="v2-sub">The kind of water you are on most.</p>
        ${tiles(WATERS, v.waters, 2, true)}
        ${why('Lake boats and saltwater boats are quoted by different insurance companies. Knowing up front gets you the right quote the first time.')}`;

      case 'kept': return `
        <h1 class="v2-heading">Where is it kept?</h1>
        <p class="v2-sub">Where it sits most of the year.</p>
        ${tiles(KEPT, v.storage_type, 2, true)}`;

      case 'trailer': return `
        <h1 class="v2-heading">Should the quote include a trailer?</h1>
        <p class="v2-sub">A trailer you own and use for this ${noun(v)}.</p>
        ${tiles(YNS, v.trailer, 3, true)}`;

      case 'vdetails': return `
        <h1 class="v2-heading">Two quick details</h1>
        <p class="v2-sub">Tap what you know. Leave the rest on Not sure.</p>
        ${chipRow('hull_material', 'What is the hull made of?', HULL, v.hull_material)}
        ${chipRow('modified', 'Any engine upgrades for speed, or past damage to it?', YNS, v.modified,
          v.modified === 'Yes' ? detailBox('modifications', 'What was changed or damaged, and was it repaired?', v.modifications, 'Example: Hull repaired after hitting a stump in 2023.') : '')}
        <div class="v2-col"><button type="button" class="v2-btn-gold" id="bq-vdetails-next">Continue &rarr;</button></div>`;

      case 'vmore': return `
        <h1 class="v2-heading">Anything else to insure?</h1>
        <p class="v2-sub">You can add up to ${MAX_BOATS} on one request, such as a second boat or a pair of Jet Skis.</p>
        <div class="v2-col">
          ${listRows(s.boats.map(x => `${bName(x)} · ${label(TYPES, x.type)}`), 'Watercraft')}
          <div class="v2-actions-stack">
            ${s.boats.length < MAX_BOATS ? '<button type="button" class="v2-btn-outline" style="width:100%" id="bq-add-boat">+ Add another</button>' : ''}
            <button type="button" class="v2-btn-gold" id="bq-vmore-next">No, that&rsquo;s all &rarr;</button>
          </div>
        </div>`;

      case 'contact': return `
        <h1 class="v2-heading">You&rsquo;re halfway there. Who is this quote for?</h1>
        <p class="v2-sub"><strong>Next: who drives the boat.</strong> We send your quotes by text or email.</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="firstname">First name</label><input id="firstname" class="v2-input" type="text" autocomplete="given-name" autocapitalize="words" maxlength="40" value="${esc(s.firstname)}"></div>
            <div class="v2-field"><label for="lastname">Last name</label><input id="lastname" class="v2-input" type="text" autocomplete="family-name" autocapitalize="words" maxlength="60" value="${esc(s.lastname)}"></div>
          </div>
          <div class="v2-field"><label for="phone">Mobile phone</label><input id="phone" class="v2-input" type="tel" inputmode="tel" autocomplete="tel" value="${esc(s.phone)}"></div>
          <div class="v2-field"><label for="email">Email</label><input id="email" class="v2-input" type="email" inputmode="email" autocomplete="email" autocapitalize="off" maxlength="180" value="${esc(s.email)}"></div>
          <div class="v2-field"><label for="dob-mm">Date of birth</label>${dateBoxes('dob', s.date_of_birth, 'Date of birth')}</div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="bq-contact-next">Continue &rarr;</button>
        </div>
        ${why('Insurance companies use your name and date of birth to price a policy. We never sell your information.')}`;

      case 'address': return `
        <h1 class="v2-heading">What is your home address?</h1>
        <p class="v2-sub">Boat insurance is priced partly by where you live.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="address">Street address</label><input id="address" class="v2-input" type="text" autocomplete="street-address" autocapitalize="words" maxlength="160" value="${esc(s.address)}"></div>
          <div class="hq-two">
            <div class="v2-field"><label for="city">City</label><input id="city" class="v2-input" type="text" autocomplete="address-level2" autocapitalize="words" maxlength="80" value="${esc(s.city)}"></div>
            <div class="v2-field"><label for="zip_code">ZIP</label><input id="zip_code" class="v2-input" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(s.zip_code)}"></div>
          </div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="bq-address-next">Next: who drives it &rarr;</button>
        </div>`;

      case 'rwho': return `
        <h1 class="v2-heading">Who else drives it?</h1>
        <p class="v2-sub">Add anyone in your home who drives ${many() ? 'them' : 'it'}.</p>
        <div class="v2-col">
          <div class="hq-two">
            <div class="v2-field"><label for="r-first">First name</label><input id="r-first" class="v2-input" type="text" autocapitalize="words" maxlength="40" value="${esc(r.firstname)}"></div>
            <div class="v2-field"><label for="r-last">Last name</label><input id="r-last" class="v2-input" type="text" autocapitalize="words" maxlength="60" value="${esc(r.lastname)}"></div>
          </div>
          <div class="v2-field"><label for="rdob-mm">Date of birth</label>${dateBoxes('rdob', r.date_of_birth, 'Operator date of birth')}</div>
        </div>
        ${chipRow('relationship', 'How are they related to you?', RELATION, r.relationship).replace('v2-grid-3', 'v2-grid-2')}
        <div class="v2-col">${ERR}<button type="button" class="v2-btn-gold" id="bq-rwho-next">Continue &rarr;</button></div>`;

      case 'license': return `
        <h1 class="v2-heading">What is the status of ${whose(j)} driver license?</h1>
        <p class="v2-sub">${j === 0 ? 'We start with you. You can add other operators next.' : 'Choose the closest match.'}</p>
        ${tiles(LICENSE, r.license_status, 2, true)}
        ${why('Boat insurance companies look at your driving record on the road as well as on the water.')}`;

      case 'years': return `
        <h1 class="v2-heading">How long ${j === 0 ? 'have you' : 'has ' + esc(r.firstname || 'this person')} owned a boat?</h1>
        <p class="v2-sub">Count any boat, not only this one.</p>
        ${tiles(OWN_YEARS, r.ownership_years, 1, true)}`;

      case 'course': return `
        <h1 class="v2-heading">${j === 0 ? 'Have you' : 'Has ' + esc(r.firstname || 'this person')} finished a boating safety course?</h1>
        <p class="v2-sub">For example, the North Carolina Wildlife boating course.</p>
        ${tiles(YNS, r.training, 3, true)}
        ${why('Some insurance companies give credit for an approved boating safety course.')}`;

      case 'record': return `
        <h1 class="v2-heading">${j === 0 ? 'Your' : esc(r.firstname || 'This person') + '’s'} driving and boating record</h1>
        <p class="v2-sub">On the road or on the water. Insurance companies check, so a straight answer gets you an accurate price.</p>
        ${chipRow('violations', 'Tickets or moving violations in the past 3 years?', YNS, r.violations,
          r.violations === 'Yes' ? detailBox('violation_details', 'What and about when?', r.violation_details, 'Example: Speeding ticket, spring 2025.') : '')}
        ${chipRow('accidents', 'Accidents or insurance claims in the past 5 years?', YNS, r.accidents,
          r.accidents === 'Yes' ? detailBox('accident_details', 'What happened and about when?', r.accident_details, 'Example: Hail claim on the boat cover in 2024.') : '')}
        ${chipRow('suspensions', 'License suspended or revoked in the past 5 years?', YNS, r.suspensions,
          r.suspensions === 'Yes' ? detailBox('suspension_details', 'Why and about when?', r.suspension_details, 'Example: Suspended for 30 days in 2022.') : '')}
        <div class="v2-col">${ERR}<button type="button" class="v2-btn-gold" id="bq-record-next">Continue &rarr;</button></div>`;

      case 'rmore': return `
        <h1 class="v2-heading">Does anyone else drive it?</h1>
        <p class="v2-sub">Add anyone in your home who drives ${many() ? 'them' : 'it'}, even now and then.</p>
        <div class="v2-col">
          ${listRows(s.operators.map((x, i) => oName(x, i) + (i === 0 ? ' (you)' : '')), 'Operator')}
          <div class="v2-actions-stack">
            ${s.operators.length < MAX_OPERATORS ? '<button type="button" class="v2-btn-outline" style="width:100%" id="bq-add-op">+ Add another person</button>' : ''}
            <button type="button" class="v2-btn-gold" id="bq-rmore-next">No, that&rsquo;s all &rarr;</button>
          </div>
        </div>`;

      case 'insured': return `
        <h1 class="v2-heading">${many() ? 'Are they' : 'Is it'} insured right now?</h1>
        <p class="v2-sub">Whether you have a policy now or are starting fresh, our team can help.</p>
        ${tiles([['Yes', 'Yes', 'yes'], ['No', 'No', 'no'], ['Not sure', 'Not sure', 'advise']], s.currently_insured, 3)}`;

      case 'carrier': {
        const known = insurers.some(c => c.name === s.carrier);
        const otherOn = otherCarrierOpen || (!!s.carrier && !known);
        return `
        <h1 class="v2-heading">Who insures ${many() ? 'them' : 'it'} now?</h1>
        <p class="v2-sub">Tap your current company so our team knows what to compare against.</p>
        <div class="v2-grid-3">${insurers.map(c => logoTile(c, s.carrier === c.name)).join('')}${logoTile({ name: 'Other', logo: '' }, otherOn)}</div>
        ${otherOn ? `<div class="v2-col">
          <div class="v2-field"><label for="bq-other-carrier">Enter your current insurance company</label>
            <input id="bq-other-carrier" class="v2-input" type="text" autocapitalize="words" maxlength="100" value="${esc(known ? '' : s.carrier)}"></div>
          ${ERR}<button type="button" class="v2-btn-gold" id="bq-other-carrier-next">Continue &rarr;</button></div>` : ''}
        <div class="v2-actions-stack"><button type="button" class="v2-btn-outline" style="width:100%" id="bq-carrier-skip">Not sure</button></div>`;
      }

      case 'renewal': return `
        <h1 class="v2-heading">When does your current policy end?</h1>
        <p class="v2-sub">It is on your policy or your bill. Not sure? Skip it.</p>
        <div class="v2-col">
          <div class="v2-field"><label for="ex-mm">Policy end date (optional)</label>${dateBoxes('ex', s.expiration, 'Policy end date')}</div>
          ${ERR}
          <div class="v2-actions-stack"><button type="button" class="v2-btn-gold" id="bq-renewal-next">Continue &rarr;</button>
          <button type="button" class="v2-btn-outline" style="width:100%" id="bq-renewal-skip">Not sure</button></div>
        </div>`;

      case 'history': return `
        <h1 class="v2-heading">Your insurance history</h1>
        <p class="v2-sub">Two quick questions.</p>
        ${chipRow('continuous', 'Have you had boat insurance for the past 12 months with no gap?', YNS, s.continuous)}
        ${chipRow('cancelled', 'Has an insurance company declined, cancelled or not renewed you in the past 3 years?', YNS, s.cancelled,
          s.cancelled === 'Yes' ? detailBox('cancellation_details', 'What happened and about when?', s.cancellation_details, 'Example: Policy cancelled for a missed payment in 2024.') : '')}
        <div class="v2-col">${ERR}<button type="button" class="v2-btn-gold" id="bq-history-next">Continue &rarr;</button></div>`;

      case 'start': return `
        <h1 class="v2-heading">When should coverage start?</h1>
        <p class="v2-sub">Buying one soon? Pick that date. A best guess is fine.</p>
        ${tiles([['today', 'As soon as possible'], ['week', 'In about a week'], ['month', 'The 1st of next month'], ['pick', 'Pick a date'], ['none', 'Not sure yet']], s.start_choice, 2, true)}
        ${s.start_choice === 'pick' ? `<div class="v2-col">
          <div class="v2-field"><label for="st-mm">Start date</label>${dateBoxes('st', s.effective_date, 'Start date')}</div>
          ${ERR}
          <button type="button" class="v2-btn-gold" id="bq-start-next">Continue &rarr;</button></div>` : ''}`;

      case 'cover': return `
        <h1 class="v2-heading">What coverage would you like? ${helpBtn('cover')}</h1>
        <p class="v2-sub">Liability covers other people. Coverage for your boat pays to repair or replace your own.</p>
        ${tiles(COVER, s.coverage === MATCH ? '' : s.coverage, 1, true)}
        ${decideTile(s.coverage)}`;

      case 'limits': return `
        <h1 class="v2-heading">How much liability coverage? ${helpBtn('limits')}</h1>
        <p class="v2-sub">Pick the amount you want quoted, or let our team walk through options with you.</p>
        ${tiles(LIMITS, s.liability_limits, 3, true)}
        ${decideTile(s.liability_limits)}`;

      case 'deductible': return `
        <h1 class="v2-heading">Which deductible would you like? ${helpBtn('deductible')}</h1>
        <p class="v2-sub">The amount you pay first on a covered claim.</p>
        ${tiles(DEDUCTIBLES, s.deductible, 2, true)}
        ${decideTile(s.deductible)}`;

      case 'gear': return `
        <h1 class="v2-heading">Any fishing gear or equipment to cover? ${helpBtn('gear')}</h1>
        <p class="v2-sub">Rods, tackle, portable electronics, skis and tubes.</p>
        ${tiles(GEAR, s.gear, 1, true)}
        ${decideTile(s.gear)}`;

      case 'extras': return `
        <h1 class="v2-heading">Last two things</h1>
        <p class="v2-sub">Both are optional.</p>
        <div class="v2-group-block"><div class="v2-group-title">Would you like another quote too? Tap any that apply.</div><div class="v2-grid-3" style="margin-bottom:0">
          ${BUNDLES.map(b => `<button type="button" class="v2-tile compact ${s.bundles.includes(b) ? 'is-selected' : ''}" aria-pressed="${s.bundles.includes(b)}" data-bundle="${b}">${b}</button>`).join('')}</div></div>
        <div class="v2-col">
          <div class="v2-field"><label for="bq-notes">Anything else we should know? (optional)</label><textarea id="bq-notes" class="v2-textarea" maxlength="700">${esc(s.notes)}</textarea></div>
          <button type="button" class="v2-btn-gold" id="bq-extras-next">Continue to review &rarr;</button>
        </div>`;

      case 'handy': return UP.screen(state.dec_choice);

      case 'review': {
        const recordLine = x => ['violations', 'accidents', 'suspensions'].map((k, n) => `${['tickets', 'accidents', 'suspensions'][n]}: ${(x[k] || 'not sure').toLowerCase()}`).join(', ');
        const rows = [];
        s.boats.forEach((x, i) => rows.push([many() ? 'Watercraft ' + (i + 1) : 'Your ' + noun(x),
          [bName(x), label(TYPES, x.type), MOTOR_V2 && x.motor_brand && x.motor_brand !== 'Not sure' ? x.motor_brand + ' motor' + (x.horsepower ? ', ' + x.horsepower + ' hp' : '') : '', x.value_label ? 'Worth: ' + x.value_label.toLowerCase() : (x.value ? 'Worth about ' + money(x.value) : ''), label(OWNED, x.ownership), label(USES, x.use), label(WATERS, x.waters),
            label(KEPT, x.storage_type) + (x.storage_place ? ' (' + x.storage_place + ')' : ''), 'Trailer: ' + (x.trailer || 'not sure').toLowerCase()].filter(Boolean).join(' · '), 'boat:' + i]));
        rows.push(['Contact', `${s.firstname} ${s.lastname} · ${s.phone} · ${s.email}`, 'contact'], ['Home address', [s.address, s.city, 'NC', s.zip_code].filter(Boolean).join(', '), 'address']);
        s.operators.forEach((x, i) => rows.push([s.operators.length > 1 ? 'Operator ' + (i + 1) : 'Operator',
          [oName(x, i), label(LICENSE, x.license_status), label(OWN_YEARS, x.ownership_years), 'Safety course: ' + (x.training || 'not sure').toLowerCase(), recordLine(x)].filter(Boolean).join(' · '), 'op:' + i]));
        rows.push(['Insured now', s.currently_insured + (s.currently_insured === 'Yes' && s.carrier ? ' · ' + s.carrier : '') + (s.currently_insured === 'Yes' && s.expiration ? ' · ends ' + niceDate(s.expiration) : ''), 'ins'],
          ['Coverage starts', s.start_choice === 'none' || !s.effective_date ? 'Not sure yet' : niceDate(s.effective_date), 'start'],
          ['Coverage', s.coverage === FULL ? 'Liability plus coverage for my boat' : s.coverage === 'Liability only' ? 'Liability only' : 'Help me decide', 'cover'],
          ['Liability coverage', !s.liability_limits || s.liability_limits === DECIDE ? 'Help me decide' : s.liability_limits, 'limits']);
        if (s.coverage === FULL) rows.push(['Deductible', s.deductible || DECIDE, 'deductible']);
        if (s.coverage !== 'Liability only') rows.push(['Fishing gear and equipment', s.gear === 'Yes' ? 'Yes' + (s.gear_value ? ', about ' + s.gear_value : '') : s.gear === 'No' ? 'No' : 'Help me decide', 'gear']);
        rows.push(['Other quotes', s.bundles.length ? s.bundles.join(', ') : 'No thanks', 'extras'], ['Notes', s.notes || 'None', 'extras']);
        if (usedDec()) {   // an upload replaces the skipped questions with one line
          const skip = ['start', 'cover', 'limits', 'deductible', 'gear']; for (let i = rows.length - 1; i >= 0; i--) if (skip.includes(rows[i][2])) rows.splice(i, 1);
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
          <button type="button" class="v2-btn-gold" id="bq-send" ${sending ? 'disabled' : ''}>${sending ? 'Sending…' : 'Send my quote request'}</button>
          <p class="hq-fineprint">By sending, you confirm you have reviewed your answers. Requesting a quote does not bind, change or cancel coverage.</p>
        </div>`;
      }

      case 'done': return `
        <div class="v2-final-icon" aria-hidden="true">${icon('confirm')}</div>
        <h1 class="v2-heading">A licensed North Carolina agent is comparing insurance for your ${many() ? 'watercraft' : noun(s.boats[0])}. We will send your prices by text or email within one business day.</h1>
        ${s.email ? `<p class="v2-final-confirm-email">A confirmation email is on its way to <strong>${esc(s.email)}</strong>.</p>` : ''}
        ${HANDY_ON ? UP.failNote() : ''}<p class="v2-sub">Request reference: <strong>${esc(confirmation)}</strong>. Have a question right now? Call us or text us below.</p>
        ${TY() ? TY().next() : ''}
        <div class="v2-final-actions">
          <a class="v2-btn-gold" href="tel:3368351993" data-source="boat_v2_final_call">Call 336-835-1993</a>
          <a class="v2-btn-navy" href="sms:+13368279065" data-source="boat_v2_final_text">Text (336) 827-9065</a>
        </div>
        ${TY() ? TY().save('boat_v2') : ''}
        ${s.bundles.length ? `<div class="hq-offer"><strong>You asked for ${s.bundles.length > 1 ? 'other quotes' : (s.bundles[0] === 'Auto' ? 'an auto' : 'a ' + s.bundles[0].toLowerCase()) + ' quote'} too.</strong><p>Each one takes a few minutes.</p>
          ${s.bundles.map(b => `<a class="v2-btn-outline" style="width:100%;margin-top:8px" href="/${b.toLowerCase()}-quote?src=boat_quote_done" data-source="boat_quote_done_${b.toLowerCase()}">Start my ${b.toLowerCase()} quote &rarr;</a>`).join('')}</div>` : ''}`;
    }
    return '';
  }

  // ---------- What the office receives ----------
  function buildPayload() {
    const s = state, ans = x => x || 'Not sure';
    const top = [], extraNotes = [];
    s.boats.forEach((v, i) => {
      const who = `Watercraft ${i + 1} (${bName(v)})`;
      if (v.value_label === 'Not sure') top.push(`VALUE NOT KNOWN for ${who}. The $1 in the value row is a placeholder.`);
      else if (v.value_label) top.push(`Value of ${who}: customer chose ${v.value_label}. The ${money(v.value)} in the value row is the middle of that range.`);
      if (v.model === 'Not sure') top.push(`Model not known for ${who}.`);
    });
    s.boats.forEach((v, i) => { if (v.waters === 'Coastal / intracoastal' || v.waters === 'Offshore / ocean')
      top.unshift(`*** ${v.waters === 'Offshore / ocean' ? 'OFFSHORE / OCEAN' : 'COASTAL / INTRACOASTAL'} USE - Watercraft ${i + 1} (${bName(v)}). Check which companies will write salt water before quoting. ***`); });
    s.operators.forEach((r, j) => { if (r.ownership_years) top.push(`Boat ownership, ${oName(r, j)}: ${label(OWN_YEARS, r.ownership_years)}. The number in the row is the low end.`); });
    if (s.coverage !== 'Liability only' && s.gear === 'Yes') top.push('Fishing gear and equipment to cover: YES' + (s.gear_value ? ', worth about ' + s.gear_value : ', value not given') + '.');
    if (s.start_choice === 'none' || !s.effective_date) extraNotes.push('Start date: not sure yet. Today’s date was sent as a placeholder.');
    if (s.bundles.length > 1) extraNotes.push('Also wants quotes for: ' + s.bundles.join(', ') + '.');
    return {
      form_type: 'boat_insurance', cta_source: ctaSource,
      applicant: { firstname: (TP + s.firstname).trim().slice(0, 60), lastname: s.lastname.slice(0, 60), date_of_birth: s.date_of_birth, phone: s.phone, email: s.email.slice(0, 180),
        address: oneLine(s.address).slice(0, 180), city: oneLine(s.city).slice(0, 80), state: 'NC', zip_code: s.zip_code,
        effective_date: s.start_choice === 'none' || !s.effective_date ? todayIso() : s.effective_date },
      assets: s.boats.map(v => { const away = v.storage_type && v.storage_type !== HOME_STORAGE, place = oneLine(v.storage_place);
        return { type: v.type, year: v.year, make: oneLine(v.make).slice(0, 100), model: oneLine(v.model).slice(0, 100) || 'Not sure', length_feet: v.length_feet, hull_material: v.hull_material,
          value: v.value || '1', ownership: v.ownership, lender: ['Financed', 'Leased'].includes(v.ownership) ? (oneLine(v.lender).slice(0, 180) || LATER) : '',
          storage_same: v.storage_type === HOME_STORAGE ? 'Yes' : away && place ? 'No' : 'Not sure', storage_address: away && place ? place.slice(0, 600) : '',
          engine_type: v.type === PWC ? 'Jet drive' : v.engine_type, horsepower: v.horsepower,
          engine_details: v.engine_type === 'Outboard' && v.motor_brand ? ('Outboard brand: ' + oneLine(v.motor_brand)).slice(0, 600) : '', use: v.use, waters: v.waters, storage_type: v.storage_type, marina: away ? place.slice(0, 180) : '',
          trailer: ans(v.trailer), modified: v.modified, modifications: v.modified === 'Yes' ? (v.modifications.trim().slice(0, 600) || LATER) : '' }; }),
      operators: s.operators.map((r, j) => ({ same_as_applicant: j === 0 ? 'Yes' : 'No',
        firstname: j === 0 ? '' : oneLine(r.firstname).slice(0, 60), lastname: j === 0 ? '' : oneLine(r.lastname).slice(0, 60), date_of_birth: j === 0 ? '' : r.date_of_birth,
        relationship: j === 0 ? 'Self' : r.relationship, license_status: r.license_status, ownership_years: r.ownership_years || '0', training: ans(r.training),
        violations: ans(r.violations), violation_details: r.violations === 'Yes' ? (r.violation_details.trim().slice(0, 600) || LATER) : '',
        accidents: ans(r.accidents), accident_details: r.accidents === 'Yes' ? (r.accident_details.trim().slice(0, 600) || LATER) : '',
        suspensions: ans(r.suspensions), suspension_details: r.suspensions === 'Yes' ? (r.suspension_details.trim().slice(0, 600) || LATER) : '' })),
      coverage: { currently_insured: ans(s.currently_insured), carrier: s.currently_insured === 'Yes' ? (oneLine(s.carrier).slice(0, 100) || 'Not sure') : '',
        expiration: s.currently_insured === 'Yes' ? s.expiration : '', continuous: ans(s.continuous), cancelled: ans(s.cancelled),
        cancellation_details: s.cancelled === 'Yes' ? (s.cancellation_details.trim().slice(0, 600) || LATER) : '',
        coverage: !s.coverage || s.coverage === MATCH ? DECIDE : s.coverage, liability_limits: s.liability_limits || DECIDE,
        deductible: s.coverage === FULL ? (s.deductible || DECIDE) : s.coverage === 'Liability only' ? 'Not requested' : DECIDE,
        medical: DECIDE, uninsured: DECIDE, towing: DECIDE,
        fishing_equipment: s.coverage === 'Liability only' ? 'No' : s.gear === 'Yes' || s.gear === 'No' ? s.gear : DECIDE,
        bundle: s.bundles.length === 0 ? 'No thanks' : s.bundles.length === 1 ? s.bundles[0] : 'Several policies',
        notes: (decNote() + top.concat([TP + s.notes.trim()], extraNotes).join('\n').trim()).trim().slice(0, 1200) },
      confirm_accuracy: true   // the customer sends from the Review screen, which says so
    };
  }
  window.__BQ_PREVIEW_PAYLOAD__ = () => (LIVE ? null : buildPayload());

  async function send() {
    if (sending) return;
    if (decFilesLost()) { stepId = 'handy'; history = ['type:0', 'handy']; sendError = ''; render(true); window.scrollTo(0, 0); return; }
    if (state.start_choice !== 'none' && state.effective_date && state.effective_date < todayIso()) { sendError = 'The start date has passed. Tap Edit next to “Coverage starts” and choose a new date.'; render(); return; }
    sending = true; sendError = ''; render();
    try {
      const r = await fetch('/api/quote-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.ok !== true || !/^BOAT-[0-9]{6}-[A-Z0-9]{4}$/.test(j.confirmationNumber || '')) throw new Error('no-ack');
      confirmation = j.confirmationNumber; submitted = true;
      if (HANDY_ON && UP.count()) await UP.send({ name: (TP + state.firstname + ' ' + state.lastname).trim(), phone: state.phone, email: state.email, carrier: state.carrier,
        notes: TP + 'Ref: ' + confirmation + ' | Policy type: boat / watercraft quote' + (usedDec() ? ' | The customer uploaded the declarations page and skipped the coverage questions.' : '') });
      if (LIVE && typeof window.gtag === 'function') {
        const d = { form_type: 'boat', form_name: 'boat_quote', service_line: 'boat', cta_source: ctaSource, method: 'backend_acknowledged' };
        window.gtag('event', 'form_submit', d); window.gtag('event', 'generate_lead', d);
      } else track('boat_v2_test_submit', { confirmation_number: confirmation });
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
    const lines = [`${TP}=== PARTIAL BOAT QUOTE LEAD (Abandoned Mid-Form) ===`.trim(), `Stopped at: ${sid()}`, `Name: ${name}`, `Phone: ${s.phone}`, `Email: ${s.email}`,
      `DOB: ${s.date_of_birth || 'Not entered'}`].concat(s.boats.map((v, i) => `Watercraft ${i + 1}: ${bName(v)} (${label(TYPES, v.type) || 'type not entered'})${v.waters ? ' - ' + label(WATERS, v.waters) : ''}`),
      [s.address ? `Address: ${[s.address, s.city, 'NC', s.zip_code].filter(Boolean).join(', ')}` : '']).filter(Boolean);
    try {
      fetch('/api/homepage-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify({
        formType: 'contact', name: `${TP}[PARTIAL BOAT QUOTE - Stopped at: ${sid()}] ${name}`.trim().slice(0, 150),
        phone: String(s.phone).slice(0, 50), email: s.email.slice(0, 254), message: lines.join('\n').slice(0, 4900) }) }).catch(() => {});
      track(LIVE ? 'partial_lead_saved' : 'boat_v2_test_partial', { stopped_at: sid() });
    } catch (_) {}
  }

  // ---------- Pop-ups: help, and a small sheet for one typed answer ----------
  function overlay(el, html) { el.innerHTML = html; el.hidden = false; document.body.classList.add('v2-help-open'); requestAnimationFrame(() => el.classList.add('is-in')); }
  function closeOverlay(el) { if (!el) return; el.classList.remove('is-in'); el.hidden = true; document.body.classList.remove('v2-help-open'); }
  function openHelp(key) {
    const h = HELP[key]; if (!h) return;
    if (!helpEl) { helpEl = document.createElement('div'); helpEl.className = 'v2-help-overlay'; helpEl.hidden = true; document.body.appendChild(helpEl);
      helpEl.addEventListener('click', e => { if (e.target === helpEl || e.target.closest('[data-help-close]')) closeOverlay(helpEl); }); }
    overlay(helpEl, `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="bq-help-title" tabindex="-1"><div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="bq-help-title">${esc(h.title)}</h2><button type="button" class="v2-help-x" data-help-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${esc(h.body)}</p><div class="v2-help-example"><strong>Example</strong><p>${esc(h.example)}</p></div>
      <p class="v2-help-fine">General information only. Your policy decides what is covered.</p>
      <button type="button" class="v2-btn-gold v2-help-ok" data-help-close>Got it</button></div>`);
  }
  let sheetCfg = null;
  const SHEETS = {
    lender: { title: 'Who is the loan or lease with?', body: 'The bank, credit union or finance company. They are listed on the policy.', label: 'Lender name', ph: 'Example: State Employees Credit Union', max: 180,
      get: () => B().lender, set: t => { B().lender = t; } },
    place: { title: 'Where is that?', body: 'The marina or storage place and the town, or the lake it is on. Our team needs it to quote.', label: 'Name and town', ph: 'Example: Lake Norman Marina, Sherrills Ford', max: 180,
      get: () => B().storage_place, set: t => { B().storage_place = t; } },
    gear: { title: 'About how much is it all worth?', body: 'A rough total for the gear and equipment. A best guess is fine.', label: 'Approximate value', ph: 'Example: $1,500', max: 40,
      get: () => state.gear_value, set: t => { state.gear_value = t; } }
  };
  function openSheet(kind) {
    sheetCfg = SHEETS[kind];
    if (!sheetEl) { sheetEl = document.createElement('div'); sheetEl.className = 'v2-help-overlay hq-claim-overlay'; sheetEl.hidden = true; document.body.appendChild(sheetEl);
      sheetEl.addEventListener('click', e => {
        const t = $('bq-sheet-text');
        if (e.target.closest('[data-sheet-save]')) { sheetCfg.set(oneLine(e.target.closest('[data-sheet-skip]') ? '' : t.value)); closeOverlay(sheetEl); save(); track('boat_v2_step_complete'); next(); return; }
        if (e.target === sheetEl || e.target.closest('[data-sheet-close]')) { sheetCfg.set(oneLine(t.value)); save(); closeOverlay(sheetEl); }
      }); }
    overlay(sheetEl, `<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="bq-sheet-title" tabindex="-1"><div class="v2-help-grip" aria-hidden="true"></div>
      <div class="v2-help-head"><h2 class="v2-help-title" id="bq-sheet-title">${sheetCfg.title}</h2><button type="button" class="v2-help-x" data-sheet-close aria-label="Close">&times;</button></div>
      <p class="v2-help-body">${sheetCfg.body}</p>
      <label class="hq-claim-label" for="bq-sheet-text">${sheetCfg.label}</label>
      <input id="bq-sheet-text" class="v2-input" type="text" autocapitalize="words" maxlength="${sheetCfg.max}" placeholder="${esc(sheetCfg.ph)}" value="${esc(sheetCfg.get())}">
      <button type="button" class="v2-btn-gold v2-help-ok" data-sheet-save>Save and continue &rarr;</button>
      <button type="button" class="v2-btn-outline hq-claim-skip" data-sheet-save data-sheet-skip>Skip, I&rsquo;ll tell you later</button></div>`);
    const t = $('bq-sheet-text'); if (t) { try { t.focus({ preventScroll: true }); } catch (_) {} }
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
        const n = $('v2-m-next'); if (n && primary) { primary.classList.add('v2-in-bar'); n.addEventListener('click', () => primary.click()); }   /* the bar copy presses this one; on phones the page copy is hidden (styles.css .v2-in-bar) */
      }
    }
  }
  const on = (id, fn) => { const e = $(id); if (e) e.addEventListener('click', fn); };
  const each = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
  const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
  function dropStale() { const seq = sequence(); history = history.filter(h => seq.includes(h)); if (!history.length) history = [stepId]; }
  const mark = b => { document.querySelectorAll('#stage .v2-tile:not([data-chip])').forEach(t => t.classList.remove('is-selected')); b.classList.add('is-selected'); };

  function bind() {
    const s = sid();
    on('v2-back', back);
    if (HANDY_ON) UP.bind({ rerender: () => render(),
      choose: c => { state.dec_choice = c; if (c === 'questions') state.used_dec = false; save(); fireFormStart(); render(); if (c === 'questions') setTimeout(next, 230); },
      next: () => { state.dec_choice = 'upload'; state.used_dec = true; save(); next(); } });
    each('[data-help]', b => b.addEventListener('click', () => openHelp(b.dataset.help)));

    // Tap-one-and-move-on screens
    each('#stage [data-val]:not([data-chip])', b => b.addEventListener('click', () => {
      const x = b.dataset.val, v = B(), r = O();
      if (s === 'type') return pick(b, () => { if (v.type !== x) { v.make = ''; v.model = ''; if (x === PWC) v.engine_type = 'Jet drive'; else if (v.type === PWC) v.engine_type = ''; } v.type = x; });
      if (s === 'make') { otherMakeOpen = false; return pick(b, () => { if (v.make !== x) v.model = ''; v.make = x; }); }
      if (s === 'model') { otherModelOpen = false; return pick(b, () => { v.model = x; }); }
      if (s === 'year') return pick(b, () => { v.year = x; });
      if (s === 'engine') return pick(b, () => { if (x !== 'Outboard') v.motor_brand = ''; if (x === 'Sail only / no motor') v.horsepower = ''; v.engine_type = x; });
      if (s === 'value') { exactValueOpen = false; return pick(b, () => { v.value_label = x; v.value = x === 'Not sure' ? '1' : (VALUES.find(p => p[1] === x) || ['1'])[0]; }); }
      if (s === 'owned') {
        if (x === 'Financed' || x === 'Leased') { mark(b); v.ownership = x; save(); fireFormStart(); openSheet('lender'); return; }
        return pick(b, () => { v.ownership = x; v.lender = ''; });
      }
      if (s === 'use') return pick(b, () => { v.use = x; });
      if (s === 'waters') return pick(b, () => { v.waters = x; });
      if (s === 'kept') {
        if (x !== HOME_STORAGE) { mark(b); v.storage_type = x; save(); openSheet('place'); return; }
        return pick(b, () => { v.storage_type = x; v.storage_place = ''; });
      }
      if (s === 'trailer') return pick(b, () => { v.trailer = x; });
      if (s === 'license') return pick(b, () => { r.license_status = x; });
      if (s === 'years') return pick(b, () => { r.ownership_years = x; });
      if (s === 'course') return pick(b, () => { r.training = x; });
      if (s === 'insured') return pick(b, () => { state.currently_insured = x; if (x !== 'Yes') { state.carrier = ''; state.expiration = ''; } });
      if (s === 'cover') return pick(b, () => { state.coverage = x; if (x !== FULL) state.deductible = ''; if (x === 'Liability only') { state.gear = ''; state.gear_value = ''; } });
      if (s === 'limits') return pick(b, () => { state.liability_limits = x; });
      if (s === 'deductible') return pick(b, () => { state.deductible = x; });
      if (s === 'gear') {
        if (x === 'Yes') { mark(b); state.gear = 'Yes'; save(); openSheet('gear'); return; }
        return pick(b, () => { state.gear = x; state.gear_value = ''; });
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
    const chipTarget = () => (s === 'vdetails' ? B() : s === 'history' ? state : O());
    each('[data-chip]', b => b.addEventListener('click', () => { chipTarget()[b.dataset.chip] = b.dataset.val; save(); fireFormStart(); rerender(); const t = document.querySelector('#stage [data-ta]:placeholder-shown'); if (t && b.dataset.val === 'Yes') { try { t.focus({ preventScroll: true }); } catch (_) {} } }));
    each('[data-ta]', t => t.addEventListener('input', () => { chipTarget()[t.dataset.ta] = t.value; save(); }));

    // Brand: another brand
    each('[data-make-other]', b => b.addEventListener('click', () => { otherMakeOpen = true; const v = B(); if ((MAKES[v.type] || []).includes(v.make)) v.make = ''; render(); const o = $('bq-other-make'); if (o) o.focus(); }));
    on('bq-other-make-next', () => { const m = oneLine(val('bq-other-make')); if (!m) { showErr('Please enter the brand.'); return; } const v = B(); if (v.make !== m) v.model = ''; v.make = m; otherMakeOpen = false; save(); fireFormStart(); next(); });

    const yearDd = $('bq-year-dd');
    if (yearDd) yearDd.addEventListener('change', () => {
      const y = yearDd.value;
      if (y === 'OLDER') { olderYearOpen = true; rerender(); const o = $('bq-older-year'); if (o) o.focus(); return; }
      if (!y) return;
      olderYearOpen = false; B().year = y; save(); track('boat_v2_step_complete'); fireFormStart(); next();
    });
    on('bq-older-year-next', () => {
      const y = val('bq-older-year');
      if (!/^\d{4}$/.test(y) || Number(y) < 1900 || Number(y) > 1980) { showErr('Please enter a four-digit year before 1981, for example 1978.'); return; }
      B().year = y; olderYearOpen = false; save(); fireFormStart(); next();
    });
    each('[data-model-other]', b => b.addEventListener('click', () => { otherModelOpen = true; const v = B(); if (popularModels(v).includes(v.model) || v.model === 'Not sure') v.model = ''; render(); const o = $('bq-model'); if (o) o.focus(); }));
    on('bq-model-next', () => { const m = oneLine(val('bq-model')); if (!m) { showErr('Please enter the model. A best guess is fine.'); return; } B().model = m; otherModelOpen = false; save(); fireFormStart(); next(); });
    on('bq-model-skip', () => { B().model = 'Not sure'; otherModelOpen = false; save(); fireFormStart(); next(); });
    each('[data-motor]', b => b.addEventListener('click', () => {
      const v = B(), x = b.dataset.motor, hp = $('bq-hp'); if (hp) v.horsepower = hp.value.replace(/[^\d]/g, '');
      if (x === '__OTHER__') { otherMotorOpen = true; if (MOTOR_BRANDS.includes(v.motor_brand) || v.motor_brand === 'Not sure') v.motor_brand = ''; }
      else { otherMotorOpen = false; v.motor_brand = v.motor_brand === x ? '' : x; }
      save(); fireFormStart(); rerender(); if (x === '__OTHER__') { const o = $('bq-motor-other'); if (o) o.focus(); }
    }));
    function saveMotor(skip) {
      const v = B(), hp = skip ? '' : val('bq-hp').replace(/[^\d]/g, ''), other = $('bq-motor-other');
      if (hp && Number(hp) > 10000) { showErr('Please check the horsepower, or leave it blank.'); return; }
      if (other && !skip) { const t = oneLine(other.value); if (t) v.motor_brand = t; }
      if (!skip) v.horsepower = hp ? String(Number(hp)) : '';
      otherMotorOpen = false; save(); next();
    }
    on('bq-motor-next', () => saveMotor(false));
    on('bq-motor-skip', () => saveMotor(true));
    function saveSize(skip) {
      const len = skip ? '' : val('bq-length').replace(/[^\d.]/g, ''), hp = skip || MOTOR_V2 ? '' : val('bq-hp').replace(/[^\d]/g, ''), v = B();
      if (len && (!/^\d+(\.\d)?$/.test(len) || Number(len) < 1 || Number(len) > 300)) { showErr('Please check the length in feet, for example 20 or 18.5, or leave it blank.'); return; }
      if (hp && Number(hp) > 10000) { showErr('Please check the horsepower, or leave it blank.'); return; }
      if (!skip) { v.length_feet = len ? String(Number(len)) : ''; if (!MOTOR_V2) v.horsepower = hp ? String(Number(hp)) : ''; }
      save(); next();
    }
    on('bq-size-next', () => saveSize(false));
    on('bq-size-skip', () => saveSize(true));
    each('[data-value-exact]', b => b.addEventListener('click', () => { exactValueOpen = true; const v = B(); if (v.value_label) { v.value_label = ''; v.value = ''; } render(); const o = $('bq-value'); if (o) o.focus(); }));
    on('bq-value-next', () => { const n = val('bq-value').replace(/[^\d]/g, ''); if (!n || Number(n) < 1 || Number(n) > 10000000) { showErr('Please enter the amount in dollars, numbers only.'); return; }
      const v = B(); v.value = String(Number(n)); v.value_label = ''; exactValueOpen = false; save(); fireFormStart(); next(); });
    on('bq-vdetails-next', () => { save(); next(); });

    // Watercraft and operator lists
    on('bq-add-boat', () => { if (state.boats.length >= MAX_BOATS) return; state.boats.push(blankB()); go('type:' + (state.boats.length - 1)); });
    on('bq-vmore-next', () => { save(); next(); });
    on('bq-add-op', () => { if (state.operators.length >= MAX_OPERATORS) return; state.operators.push(blankO()); go('rwho:' + (state.operators.length - 1)); });
    on('bq-rmore-next', () => { save(); next(); });
    each('[data-list-edit]', b => b.addEventListener('click', () => {
      const i = Number(b.dataset.listEdit);
      if (s === 'vmore') { editStack.push({ to: 'vmore', until: 'vdetails:' + i }); go('type:' + i); }
      else { editStack.push({ to: 'rmore', until: 'record:' + i }); go((i > 0 ? 'rwho:' : 'license:') + i); }
    }));
    each('[data-list-remove]', b => b.addEventListener('click', () => {
      const i = Number(b.dataset.listRemove); if (i < 1) return;
      (s === 'vmore' ? state.boats : state.operators).splice(i, 1); dropStale(); save(); rerender();
    }));

    const ph = $('phone'); if (ph) ph.addEventListener('input', () => { ph.value = fmtPhone(ph.value); });
    on('bq-contact-next', () => {
      state.firstname = oneLine(val('firstname')); state.lastname = oneLine(val('lastname')); state.phone = val('phone'); state.email = val('email');
      const dob = readDate('dob');
      if (!state.firstname || !state.lastname) { showErr('Please enter your first and last name.'); return; }
      if (!phoneOk(state.phone)) { showErr('Please check your phone number. Enter the 10 digits starting with the area code.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { showErr('Please enter a valid email address.'); return; }
      if (!dob || dob >= todayIso() || dob < '1900-01-01') { showErr('Please enter your date of birth as month, day and four-digit year.'); return; }
      state.date_of_birth = dob; contactDone = true; next();
    });
    on('bq-address-next', () => {
      state.address = oneLine(val('address')); state.city = oneLine(val('city')); state.zip_code = val('zip_code').replace(/\D/g, '').slice(0, 5);
      if (!state.address || !state.city) { showErr('Please enter the street address and city.'); return; }
      if (!/^(27|28)\d{3}$/.test(state.zip_code)) { showErr('Please enter a North Carolina ZIP code (it starts with 27 or 28).'); return; }
      save(); next();
    });
    ['r-first', 'r-last'].forEach(id => { const e = $(id); if (e) e.addEventListener('input', () => { O()[id === 'r-first' ? 'firstname' : 'lastname'] = e.value; save(); }); });
    ['rdob-mm', 'rdob-dd', 'rdob-yyyy'].forEach(id => { const e = $(id); if (e) e.addEventListener('input', () => { const d = readDate('rdob'); if (d) { O().date_of_birth = d; save(); } }); });
    on('bq-rwho-next', () => {
      const r = O(); r.firstname = oneLine(val('r-first')); r.lastname = oneLine(val('r-last'));
      const dob = readDate('rdob');
      if (!r.firstname || !r.lastname) { showErr('Please enter their first and last name.'); return; }
      if (!dob || dob >= todayIso() || dob < '1900-01-01') { showErr('Please enter their date of birth as month, day and four-digit year.'); return; }
      if (!r.relationship) { showErr('Please tap how they are related to you.'); return; }
      r.date_of_birth = dob; save(); next();
    });
    on('bq-record-next', () => { const r = O(); if (!r.violations || !r.accidents || !r.suspensions) { showErr('Please answer all three questions. Not sure is fine.'); return; } save(); track('boat_v2_step_complete'); next(); });

    each('[data-carrier]', b => b.addEventListener('click', () => {
      if (b.dataset.carrier === 'Other') { otherCarrierOpen = true; if (insurers.some(c => c.name === state.carrier)) state.carrier = ''; render(); const o = $('bq-other-carrier'); if (o) o.focus(); return; }
      otherCarrierOpen = false; pick(b, () => { state.carrier = b.dataset.carrier; });
    }));
    on('bq-other-carrier-next', () => { const c = oneLine(val('bq-other-carrier')); if (!c) { showErr('Please enter the insurance company name, or tap Not sure.'); return; } state.carrier = c; otherCarrierOpen = false; next(); });
    on('bq-carrier-skip', () => { state.carrier = ''; otherCarrierOpen = false; next(); });
    on('bq-renewal-next', () => { const d = readDate('ex'); if (d === null) { showErr('Please enter the date as month, day and four-digit year, or tap Not sure.'); return; } state.expiration = d; save(); next(); });
    on('bq-renewal-skip', () => { state.expiration = ''; save(); next(); });
    on('bq-history-next', () => { if (!state.continuous || !state.cancelled) { showErr('Please answer both questions. Not sure is fine.'); return; } save(); track('boat_v2_step_complete'); next(); });
    on('bq-start-next', () => { const d = readDate('st'); if (!d) { showErr('Please enter the start date as month, day and four-digit year.'); return; }
      if (d < todayIso()) { showErr('The start date cannot be in the past.'); return; } state.effective_date = d; save(); next(); });

    each('[data-bundle]', b => b.addEventListener('click', () => { const k = b.dataset.bundle, at = state.bundles.indexOf(k); if (at === -1) state.bundles.push(k); else state.bundles.splice(at, 1);
      const n = $('bq-notes'); if (n) state.notes = n.value; save(); rerender(); }));
    const notes = $('bq-notes'); if (notes) notes.addEventListener('input', () => { state.notes = notes.value; save(); });
    on('bq-extras-next', next);

    each('[data-edit]', b => b.addEventListener('click', () => {
      const [k, n] = b.dataset.edit.split(':');
      if (k === 'boat') { editStack = [{ to: 'review', until: 'vdetails:' + n }]; go('type:' + n); return; }
      if (k === 'op') { editStack = [{ to: 'review', until: 'record:' + n }]; go((Number(n) > 0 ? 'rwho:' : 'license:') + n); return; }
      if (k === 'ins') { editStack = [{ to: 'review', until: 'history' }]; go('insured'); return; }
      if (k === 'cover') { editStack = [{ to: 'review', until: 'extras' }]; go('cover'); return; }   // walks limits, deductible and gear too
      editStack = [{ to: 'review' }]; go(k);
    }));
    on('bq-send', send);
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
  render();
})();
