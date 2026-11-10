// Progressive enhancement only: no required inputs, navigation, storage or submission dependency.
(() => {
    'use strict';
    const get = id => document.getElementById(id);
    const host = get('home-property-lookup');
    if (!host || !window.fetch || !window.AbortController) return;
    const form = get('home-quote-form');
    const find = get('lookup-find'), manual = get('lookup-manual'), status = get('lookup-status');
    const result = get('lookup-result'), choices = get('lookup-choice'), apply = get('lookup-apply');
    const addresses = ['property_address', 'city', 'zip_code'].map(get);
    const roofSelect = get('f-roof_type');
    const countyField = get('lead_county');
    const fields = ['year_built', 'square_footage', 'f-roof_type'].map(get).filter(Boolean);
    const constructionRadios = [...document.querySelectorAll('input[name="construction_type"]')];
    let controller, generation = 0, matches = [], selected = null, accepted = null, retrievedAt = '';
    let lastAddress = '', ownChange = false, constructionImported = '';
    let overrides = {};
    const imported = new Map(), touched = new Set();
    const signature = () => addresses.map(el => el.value.trim().toLowerCase()).join('|');
    const say = message => { status.textContent = message; };
    const cancel = () => { generation++; controller?.abort(); controller = null; find.disabled = false; find.textContent = 'Find my home details'; };
    const areaRange = n => n < 1000 ? 'under_1000' : n < 1500 ? '1000_1500' : n < 2000 ? '1500_2000' : n < 2500 ? '2000_2500' : n < 3000 ? '2500_3000' : n <= 4000 ? '3000_4000' : 'over_4000';
    const effectiveRecord = base => base ? { ...base, ...overrides } : null;

    const mapRoofType = raw => {
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
    };

    const mapConstructionType = raw => {
        if (!raw || typeof raw !== 'string') return '';
        const normalized = raw.toLowerCase().trim().replace(/vinyl\s*\/\s*aluminum/g, 'vinyl');
        if (/unknown|other|mixed|multiple|stucco|aluminum|concrete block|cinder|log|metal/.test(normalized)) return '';
        const hits = [];
        if (/\bbrick\b|masonry|\bstone\b/.test(normalized)) hits.push('brick');
        if (/\bvinyl\b/.test(normalized)) hits.push('vinyl');
        if (/\bframe\b|\bwood\b|clapboard|hardiplank|fiber cement|masonite|weatherboard/.test(normalized)) hits.push('frame');
        return hits.length === 1 ? hits[0] : '';
    };

    const formatBathText = p => {
        const parts = [];
        if (Number.isFinite(p.bedrooms)) parts.push(p.bedrooms + ' bed');
        if (Number.isFinite(p.fullBaths)) parts.push(p.fullBaths + ' full bath' + (p.fullBaths === 1 ? '' : 's'));
        if (Number.isFinite(p.halfBaths)) parts.push(p.halfBaths + ' half bath' + (p.halfBaths === 1 ? '' : 's'));
        return parts.join(' · ');
    };

    const formatCurrency = n => Number.isFinite(n) && n >= 0 ? '$' + Math.round(n).toLocaleString('en-US') : '';
    const formatAcres = n => Number.isFinite(n) && n >= 0 ? Number(n.toFixed(2)) + ' acres' : '';

    const hint = (field, message) => {
        if (!field) return;
        const id = field.id + '-record-source';
        let node = get(id);
        if (!node) {
            node = document.createElement('span'); node.id = id; node.className = 'lookup-field-source';
            field.insertAdjacentElement('afterend', node);
            field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
        }
        node.textContent = message; node.hidden = !message;
    };

    // Set up action row and inline editor inside #lookup-result
    let editToggleBtn, resetOverridesBtn, editorBox;
    function ensureEditorUI() {
        if (editToggleBtn) return;
        let actionWrap = result.querySelector('.lookup-result-actions');
        if (!actionWrap) {
            actionWrap = document.createElement('div');
            actionWrap.className = 'lookup-result-actions';
            apply.replaceWith(actionWrap);
            actionWrap.append(apply);
        }
        editToggleBtn = document.createElement('button');
        editToggleBtn.type = 'button';
        editToggleBtn.id = 'lookup-edit-toggle';
        editToggleBtn.className = 'lookup-secondary';
        editToggleBtn.textContent = 'Edit any details that changed';
        actionWrap.append(editToggleBtn);

        resetOverridesBtn = document.createElement('button');
        resetOverridesBtn.type = 'button';
        resetOverridesBtn.id = 'lookup-reset-overrides';
        resetOverridesBtn.className = 'lookup-secondary';
        resetOverridesBtn.textContent = 'Reset to public records';
        resetOverridesBtn.hidden = true;
        actionWrap.append(resetOverridesBtn);

        editorBox = document.createElement('div');
        editorBox.id = 'lookup-editor';
        editorBox.className = 'lookup-editor';
        editorBox.hidden = true;
        editorBox.innerHTML = [
            '<p class="lookup-editor-title">Update any details that changed</p>',
            '<p class="lookup-editor-sub">Everything else from your county record stays imported automatically.</p>',
            '<div class="lookup-editor-grid">',
            '  <div class="lookup-editor-field"><label for="le-yearBuilt">Year built</label><input type="number" id="le-yearBuilt" min="1700" max="2027" step="1"></div>',
            '  <div class="lookup-editor-field"><label for="le-effectiveYearBuilt">Effective / remodel year</label><input type="number" id="le-effectiveYearBuilt" min="1700" max="2027" step="1"></div>',
            '  <div class="lookup-editor-field"><label for="le-heatedArea">Heated area (sq ft)</label><input type="number" id="le-heatedArea" min="100" max="50000" step="1"></div>',
            '  <div class="lookup-editor-field"><label for="le-groundFloorArea">Ground floor area (sq ft)</label><input type="number" id="le-groundFloorArea" min="100" max="50000" step="1"></div>',
            '  <div class="lookup-editor-field"><label for="le-stories">Stories</label><input type="number" id="le-stories" min="1" max="10" step="0.5"></div>',
            '  <div class="lookup-editor-field"><label for="le-totalAcres">Lot size (acres)</label><input type="number" id="le-totalAcres" min="0" max="5000" step="0.01"></div>',
            '  <div class="lookup-editor-grid-3">',
            '    <div class="lookup-editor-field"><label for="le-bedrooms">Bedrooms</label><input type="number" id="le-bedrooms" min="0" max="20" step="1"></div>',
            '    <div class="lookup-editor-field"><label for="le-fullBaths">Full baths</label><input type="number" id="le-fullBaths" min="0" max="20" step="1"></div>',
            '    <div class="lookup-editor-field"><label for="le-halfBaths">Half baths</label><input type="number" id="le-halfBaths" min="0" max="20" step="1"></div>',
            '  </div>',
            '  <div class="lookup-editor-field"><label for="le-exteriorWall">Exterior wall</label><input type="text" id="le-exteriorWall" maxlength="80"></div>',
            '  <div class="lookup-editor-field"><label for="le-foundation">Foundation</label><input type="text" id="le-foundation" maxlength="80"></div>',
            '  <div class="lookup-editor-field"><label for="le-roofCover">Roof covering</label><input type="text" id="le-roofCover" maxlength="80"></div>',
            '  <div class="lookup-editor-field"><label for="le-roofStructure">Roof structure</label><input type="text" id="le-roofStructure" maxlength="80"></div>',
            '  <div class="lookup-editor-field"><label for="le-heatingType">Heating</label><input type="text" id="le-heatingType" maxlength="80"></div>',
            '</div>',
            '<div class="lookup-editor-actions">',
            '  <button type="button" id="lookup-edit-save">Save changes & keep rest</button>',
            '  <button type="button" id="lookup-edit-cancel" class="lookup-secondary">Cancel</button>',
            '</div>'
        ].join('\n');
        actionWrap.insertAdjacentElement('beforebegin', editorBox);

        editToggleBtn.addEventListener('click', () => {
            if (!selected) return;
            if (!editorBox.hidden) { editorBox.hidden = true; return; }
            populateEditor();
            editorBox.hidden = false;
            get('le-heatedArea')?.focus();
        });

        get('lookup-edit-cancel').addEventListener('click', () => {
            editorBox.hidden = true;
        });

        get('lookup-edit-save').addEventListener('click', () => {
            saveEditorChanges();
        });

        resetOverridesBtn.addEventListener('click', () => {
            overrides = {};
            editorBox.hidden = true;
            resetOverridesBtn.hidden = true;
            showMatch();
            if (accepted) applyRecordToForm(true);
            say('Reset to original county public records.');
        });
    }
    ensureEditorUI();

    function populateEditor() {
        const cur = effectiveRecord(selected);
        if (!cur) return;
        const setVal = (id, v) => { const el = get(id); if (el) el.value = (v !== null && v !== undefined) ? String(v) : ''; };
        setVal('le-yearBuilt', cur.yearBuilt);
        setVal('le-effectiveYearBuilt', cur.effectiveYearBuilt);
        setVal('le-heatedArea', cur.heatedArea);
        setVal('le-groundFloorArea', cur.groundFloorArea);
        setVal('le-stories', cur.stories);
        setVal('le-totalAcres', cur.totalAcres);
        setVal('le-bedrooms', cur.bedrooms);
        setVal('le-fullBaths', cur.fullBaths);
        setVal('le-halfBaths', cur.halfBaths);
        setVal('le-exteriorWall', cur.exteriorWall);
        setVal('le-foundation', cur.foundation);
        setVal('le-roofCover', cur.roofCover);
        setVal('le-roofStructure', cur.roofStructure);
        setVal('le-heatingType', cur.heatingType);
    }

    function saveEditorChanges() {
        if (!selected) return;
        const nextOverrides = {};
        const intFields = [
            ['yearBuilt', 'le-yearBuilt', 1700, 2027],
            ['effectiveYearBuilt', 'le-effectiveYearBuilt', 1700, 2027],
            ['heatedArea', 'le-heatedArea', 100, 50000],
            ['groundFloorArea', 'le-groundFloorArea', 100, 50000],
            ['bedrooms', 'le-bedrooms', 0, 20],
            ['fullBaths', 'le-fullBaths', 0, 20],
            ['halfBaths', 'le-halfBaths', 0, 20]
        ];
        intFields.forEach(([key, inputId, min, max]) => {
            const raw = get(inputId)?.value.trim() ?? '';
            if (raw === '') return;
            const n = Math.round(Number(raw));
            if (Number.isFinite(n) && n >= min && n <= max && n !== selected[key]) {
                nextOverrides[key] = n;
            }
        });
        const floatFields = [
            ['stories', 'le-stories', 1, 10],
            ['totalAcres', 'le-totalAcres', 0, 10000]
        ];
        floatFields.forEach(([key, inputId, min, max]) => {
            const raw = get(inputId)?.value.trim() ?? '';
            if (raw === '') return;
            const n = Number(raw);
            if (Number.isFinite(n) && n >= min && n <= max && n !== selected[key]) {
                nextOverrides[key] = n;
            }
        });
        const strFields = [
            ['exteriorWall', 'le-exteriorWall'],
            ['foundation', 'le-foundation'],
            ['roofCover', 'le-roofCover'],
            ['roofStructure', 'le-roofStructure'],
            ['heatingType', 'le-heatingType']
        ];
        strFields.forEach(([key, inputId]) => {
            const val = (get(inputId)?.value || '').trim();
            if (val && val !== (selected[key] || '')) {
                nextOverrides[key] = val;
            }
        });

        overrides = nextOverrides;
        editorBox.hidden = true;
        resetOverridesBtn.hidden = Object.keys(overrides).length === 0;
        showMatch();
        applyRecordToForm(true);
        const changedCount = Object.keys(overrides).length;
        say(changedCount
            ? 'Saved your ' + changedCount + ' update' + (changedCount === 1 ? '' : 's') + ' and kept all other imported property details.'
            : 'All imported county details kept.');
    }

    function clearImported() {
        for (const [id, value] of imported) {
            if (id === 'lead_county') {
                if (countyField && countyField.value === value) countyField.value = '';
                continue;
            }
            const field = get(id);
            if (field && field.value === value && !touched.has(id)) {
                ownChange = true; field.value = ''; field.dispatchEvent(new Event('change', { bubbles: true })); ownChange = false;
            }
        }
        if (constructionImported && !touched.has('construction_type')) {
            const defaultRadio = get('const-frame');
            if (defaultRadio) {
                ownChange = true; defaultRadio.checked = true; defaultRadio.dispatchEvent(new Event('change', { bubbles: true })); ownChange = false;
            }
        }
        constructionImported = '';
        imported.clear(); accepted = null; overrides = {};
        if (editorBox) editorBox.hidden = true;
        if (resetOverridesBtn) resetOverridesBtn.hidden = true;
        fields.forEach(field => hint(field, ''));
    }

    function clearResearch() {
        cancel(); clearImported(); matches = []; selected = null; result.hidden = true;
        get('lookup-choices').hidden = true;
        const linksNode = get('lookup-links');
        if (linksNode) linksNode.hidden = true;
    }

    fields.forEach(field => field.addEventListener('change', () => {
        if (ownChange) return;
        touched.add(field.id);
        if (accepted) hint(field, 'Your answer is kept. The public record is shown above for reference.');
        updateReview();
    }));

    constructionRadios.forEach(radio => radio.addEventListener('change', () => {
        if (ownChange) return;
        touched.add('construction_type');
        updateReview();
    }));

    let autoLookupTimer = null;
    let lastShownSignature = '';

    function isAddressComplete() {
        return addresses[0].value.trim().length >= 5 &&
               /\d/.test(addresses[0].value) &&
               Boolean(addresses[1].value.trim()) &&
               /^\d{5}$/.test(addresses[2].value.trim());
    }

    addresses.forEach(field => field.addEventListener('input', () => {
        if (autoLookupTimer) { clearTimeout(autoLookupTimer); autoLookupTimer = null; }
        if (lastAddress && signature() !== lastAddress) {
            clearResearch(); lastAddress = ''; lastShownSignature = '';
            say('Address changed. Suggested values were cleared; your own entries were kept. Look up this home or continue manually.');
            updateReview();
        }
        autoSplitFullAddressIfNeeded();
        if (isAddressComplete() && signature() !== lastAddress) {
            autoLookupTimer = setTimeout(() => {
                if (isAddressComplete() && signature() !== lastAddress) {
                    runLookup(true);
                }
            }, 600);
        }
    }));

    // Render public record source names as PLAIN TEXT (no <a> links so the customer stays in the quote funnel)
    function renderLinks(links) {
        let box = get('lookup-links');
        if (!box) {
            box = document.createElement('p');
            box.id = 'lookup-links';
            box.className = 'lookup-links';
            const facts = get('lookup-facts');
            if (facts) facts.insertAdjacentElement('afterend', box);
        }
        box.replaceChildren();
        if (!links || typeof links !== 'object') { box.hidden = true; return; }
        const items = [
            ['taxCard', 'County property card'],
            ['gisParcel', 'County parcel map'],
            [!links.gisParcel && 'gis', 'County GIS'],
            ['deed', 'Deed lookup']
        ].filter(([key]) => key && typeof links[key] === 'string' && /^https?:\/\//i.test(links[key]));
        if (!items.length) { box.hidden = true; return; }
        box.textContent = 'Public record sources: ' + items.map(([, label]) => label).join(' · ');
        box.hidden = false;
    }

    function showMatch() {
        selected = matches[Number(choices.value) || 0];
        if (!selected) return;
        const cur = effectiveRecord(selected);
        result.hidden = false;
        if (!accepted) {
            apply.disabled = false;
            apply.textContent = 'This is my home — use available details';
        }
        get('lookup-address').textContent = cur.address;
        const parcelParts = [
            cur.county && cur.county + ' County',
            cur.parcelId ? 'Parcel ' + cur.parcelId : (cur.parcel ? 'Parcel ' + cur.parcel : ''),
            cur.pin && cur.pin !== cur.parcelId ? 'PIN ' + cur.pin : ''
        ].filter(Boolean);
        get('lookup-parcel').textContent = parcelParts.join(' · ');
        get('lookup-mismatch').hidden = !cur.addressDiffers;
        const facts = get('lookup-facts'); facts.replaceChildren();
        const bathSummary = formatBathText(cur);
        const bathEdited = ('bedrooms' in overrides) || ('fullBaths' in overrides) || ('halfBaths' in overrides);
        [
            ['Year built', cur.yearBuilt || 'Not shown', 'yearBuilt' in overrides],
            ['Effective year built', cur.effectiveYearBuilt && cur.effectiveYearBuilt !== cur.yearBuilt ? String(cur.effectiveYearBuilt) + ' (not roof age)' : '', false],
            ['Heated area', Number.isFinite(cur.heatedArea) ? Number(cur.heatedArea).toLocaleString() + ' sq ft' : 'Not shown', 'heatedArea' in overrides],
            ['Ground floor area', Number.isFinite(cur.groundFloorArea) && cur.groundFloorArea !== cur.heatedArea ? Number(cur.groundFloorArea).toLocaleString() + ' sq ft' : '', false],
            ['Stories', cur.stories ? String(cur.stories) : '', 'stories' in overrides],
            ['Bedrooms / baths', bathSummary, bathEdited],
            ['Exterior wall', cur.exteriorWall, 'exteriorWall' in overrides],
            ['Foundation', cur.foundation, 'foundation' in overrides],
            ['Roof covering', cur.roofCover, 'roofCover' in overrides],
            ['Roof structure', cur.roofStructure, 'roofStructure' in overrides],
            ['Heating', cur.heatingType, 'heatingType' in overrides],
            ['Lot size', formatAcres(cur.totalAcres), 'totalAcres' in overrides]
        ].filter(([, value]) => value).forEach(([label, value, isEdited]) => {
            const row = document.createElement('div'), term = document.createElement('dt'), detail = document.createElement('dd');
            term.textContent = label;
            if (isEdited) {
                const badge = document.createElement('span');
                badge.className = 'lookup-edited-badge';
                badge.textContent = 'Updated';
                term.append(badge);
            }
            detail.textContent = value; row.append(term, detail); facts.append(row);
        });
        renderLinks(cur.links);
        if (typeof gtag === 'function' && lastAddress && lastShownSignature !== lastAddress) {
            lastShownSignature = lastAddress;
            try {
                gtag('event', 'property_record_shown', {
                    county: cur.county || 'unknown',
                    match_count: matches.length
                });
            } catch {}
        }
    }

    choices.addEventListener('change', () => { clearImported(); showMatch(); updateReview(); });
    manual.addEventListener('click', () => {
        clearResearch(); say('You can enter your home details below and continue as usual.'); updateReview();
        get('year_built').focus({ preventScroll: true });
        get('year_built').scrollIntoView({ block: 'center', behavior: 'auto' });
    });

    function autoSplitFullAddressIfNeeded() {
        const raw = addresses[0].value.trim();
        if (!raw) return;
        if (!addresses[2].value.trim()) {
            const zipMatch = raw.match(/\b((?:27|28)\d{3})(?:-\d{4})?\s*$/);
            if (zipMatch) addresses[2].value = zipMatch[1];
        }
        if (!addresses[1].value.trim()) {
            const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
            if (parts.length >= 2) {
                const candidate = parts[1].replace(/\b(?:NC|North Carolina)\b.*$/i, '').replace(/\b\d{5}(?:-\d{4})?\b/g, '').trim();
                if (candidate && /^[A-Za-z .'-]{2,50}$/.test(candidate)) {
                    addresses[1].value = candidate;
                    addresses[0].value = parts[0];
                }
            }
        }
    }

    async function runLookup(isAutoRun = false) {
        if (autoLookupTimer) { clearTimeout(autoLookupTimer); autoLookupTimer = null; }
        autoSplitFullAddressIfNeeded();
        if (addresses[0].value.trim().length < 5 || !/\d/.test(addresses[0].value)) {
            if (!isAutoRun) {
                say('Enter your street address above, then try again. You can also continue manually.');
                addresses[0].focus();
            }
            return;
        }
        if (!addresses[1].value.trim() || !/^\d{5}$/.test(addresses[2].value.trim())) {
            if (!isAutoRun) {
                say('Add the city and five-digit ZIP above to help find the correct home.');
                (!addresses[1].value.trim() ? addresses[1] : addresses[2]).focus();
            }
            return;
        }
        if (isAutoRun && signature() === lastAddress) return;
        clearResearch(); updateReview(); lastAddress = signature();
        let address = addresses[0].value.trim();
        if (!address.toLowerCase().includes(addresses[1].value.trim().toLowerCase())) address += ', ' + addresses[1].value.trim();
        if (!/\bNC\b|North Carolina/i.test(address)) address += ', NC';
        if (!address.includes(addresses[2].value.trim())) address += ' ' + addresses[2].value.trim();
        if (address.length > 180) { say('The address is too long for automatic lookup. Please continue manually.'); return; }
        const current = generation;
        controller = new AbortController(); const requestController = controller;
        find.disabled = true; find.textContent = 'Finding your home…';
        say(isAutoRun ? 'Checking county records for your address — keep going, we’ll fill in what we find.' : 'Looking for public records. You can keep filling out the form or continue without waiting.');
        const timeout = setTimeout(() => requestController.abort(), 20000);
        try {
            const response = await fetch('/api/home-property', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }), signal: requestController.signal, credentials: 'same-origin' });
            if (!response.ok) throw new Error('Unavailable');
            const data = await response.json();
            if (current !== generation || signature() !== lastAddress) return;
            if (!Array.isArray(data.matches)) throw new Error('Invalid response');
            matches = data.matches.filter(p => p && typeof p.address === 'string' && typeof p.parcel === 'string');
            retrievedAt = typeof data.retrievedAt === 'string' ? data.retrievedAt : '';
            if (!matches.length) { say('Automatic home details aren’t available for this address. Enter what you know below and continue.'); return; }
            choices.replaceChildren();
            matches.forEach((p, i) => choices.add(new Option(p.address + ' — Parcel ' + p.parcel, String(i))));
            get('lookup-choices').hidden = matches.length < 2;
            showMatch();
            say(matches.length > 1 ? 'We found more than one record. Choose your home and check the details before using them.' : 'We found a county record. Check that this is your home before using the details.');
        } catch {
            if (current !== generation) return;
            say(requestController.signal.aborted ? 'The lookup is taking too long. Your quote still works — enter details below or try again.' : 'We couldn’t retrieve home details right now. Your answers are safe. Enter details below and continue, or try again.');
        } finally {
            clearTimeout(timeout);
            if (current === generation) { controller = null; find.disabled = false; find.textContent = 'Auto-Fill My Home Details'; }
        }
    }

    find.addEventListener('click', () => runLookup(false));

    function applyRecordToForm(fromEditorSave) {
        if (!selected || signature() !== lastAddress) return;
        const cur = effectiveRecord(selected);
        accepted = { ...cur };
        let count = 0;
        const mappedRoof = mapRoofType(cur.roofCover);
        const values = {
            year_built: Number.isInteger(cur.yearBuilt) ? String(cur.yearBuilt) : '',
            square_footage: Number.isFinite(cur.heatedArea) && cur.heatedArea > 0 ? areaRange(cur.heatedArea) : '',
            'f-roof_type': mappedRoof
        };
        const editorOverrideMap = {
            year_built: 'yearBuilt' in overrides,
            square_footage: 'heatedArea' in overrides,
            'f-roof_type': 'roofCover' in overrides
        };
        fields.forEach(field => {
            const value = values[field.id];
            const canOverwrite = !field.value || imported.has(field.id) || (fromEditorSave && editorOverrideMap[field.id]);
            if (canOverwrite && (!touched.has(field.id) || (fromEditorSave && editorOverrideMap[field.id])) && value && [...field.options].some(option => option.value === value)) {
                ownChange = true; field.value = value; field.dispatchEvent(new Event('change', { bubbles: true })); ownChange = false;
                imported.set(field.id, value); count++;
                const sourceLabel = editorOverrideMap[field.id] ? 'From your updated home details' : 'From public records';
                if (field.id === 'square_footage') {
                    hint(field, sourceLabel + ': ' + cur.heatedArea.toLocaleString() + ' heated sq ft. Check this range; you can change it.');
                } else if (field.id === 'f-roof_type') {
                    hint(field, sourceLabel + ' (' + cur.roofCover + '). Roof age is not inferred — please select Roof Year if known.');
                } else {
                    hint(field, sourceLabel + '. Please check; you can change this.');
                }
            } else if (field.value && value && !imported.has(field.id)) {
                hint(field, 'Your existing answer was kept. Compare it with the public record above.');
            }
        });

        const mappedConst = mapConstructionType(cur.exteriorWall);
        if (mappedConst && (!touched.has('construction_type') || (fromEditorSave && ('exteriorWall' in overrides)))) {
            const targetRadio = constructionRadios.find(r => r.value === mappedConst);
            if (targetRadio) {
                ownChange = true; targetRadio.checked = true; targetRadio.dispatchEvent(new Event('change', { bubbles: true })); ownChange = false;
                constructionImported = mappedConst; count++;
            }
        }

        if (countyField && !countyField.value && cur.county) {
            countyField.value = cur.county;
            imported.set('lead_county', cur.county);
        }

        if (!fromEditorSave && typeof gtag === 'function') {
            try {
                gtag('event', 'find_home_information_click', {
                    county: cur.county || 'unknown',
                    fields_prefilled: count
                });
            } catch {}
        }

        apply.disabled = true; apply.textContent = 'Property selected';
        if (!fromEditorSave) {
            say(count ? 'Available details filled in below. Your existing answers were kept. Please check the fields and continue.' : 'Property selected. Your answers were kept; enter any missing details below and continue.');
        }
        updateReview();
    }

    apply.addEventListener('click', () => applyRecordToForm(false));

    function researchNotes() {
        if (!accepted || !selected || signature() !== lastAddress) return '';
        const orig = selected;
        const cur = effectiveRecord(selected);
        const lines = [
            '--- COUNTY PROPERTY DOSSIER (Public Record — Needs Verification) ---',
            'Source: Find My Home Information / NC county public records' + (retrievedAt ? ' (' + retrievedAt + ')' : ''),
            'Record address: ' + orig.address,
            'County / Parcel: ' + [orig.county, orig.parcelId ? 'Parcel ' + orig.parcelId : ('Parcel ' + orig.parcel), orig.pin && orig.pin !== orig.parcelId ? 'PIN ' + orig.pin : ''].filter(Boolean).join(' · ')
        ];
        if (orig.matchMethod) lines.push('Match method: ' + orig.matchMethod + (orig.addressDiffers ? ' (County record address differs from entered address; verify parcel)' : ''));
        if (orig.yearBuilt) lines.push('Public record year built: ' + orig.yearBuilt);
        if (orig.effectiveYearBuilt) lines.push('Public record effective year built (not roof age): ' + orig.effectiveYearBuilt);
        if (Number.isFinite(orig.heatedArea)) lines.push('Public record heated area: ' + orig.heatedArea.toLocaleString() + ' sq ft');
        if (Number.isFinite(orig.groundFloorArea)) lines.push('Public record ground floor area: ' + orig.groundFloorArea.toLocaleString() + ' sq ft');
        if (orig.stories) lines.push('Public record stories: ' + orig.stories);
        const origBathSummary = formatBathText(orig);
        if (origBathSummary) lines.push('Public record bedrooms / baths: ' + origBathSummary);
        if (orig.exteriorWall) lines.push('Public record exterior wall: ' + orig.exteriorWall);
        if (orig.foundation) lines.push('Public record foundation: ' + orig.foundation);
        if (orig.roofCover) lines.push('Public record roof covering: ' + orig.roofCover);
        if (orig.roofStructure) lines.push('Public record roof structure: ' + orig.roofStructure);
        if (orig.heatingType) lines.push('Public record heating type: ' + orig.heatingType);
        const acresText = formatAcres(orig.totalAcres);
        if (acresText) lines.push('Public record lot size: ' + acresText);
        const valParts = [
            formatCurrency(orig.buildingValue) && 'Building ' + formatCurrency(orig.buildingValue),
            formatCurrency(orig.landValue) && 'Land ' + formatCurrency(orig.landValue),
            formatCurrency(orig.totalValue) && 'Total Assessed ' + formatCurrency(orig.totalValue)
        ].filter(Boolean);
        if (valParts.length) lines.push('County tax assessment (not Coverage A): ' + valParts.join(' · '));
        if (formatCurrency(orig.salePrice) || orig.saleDate) {
            lines.push('Last recorded sale: ' + [formatCurrency(orig.salePrice), orig.saleDate].filter(Boolean).join(' on '));
        }
        if (orig.deedBook || orig.deedPage) lines.push('Deed reference: Book ' + (orig.deedBook || 'N/A') + ', Page ' + (orig.deedPage || 'N/A'));

        const overrideKeys = Object.keys(overrides);
        if (overrideKeys.length) {
            const labels = {
                yearBuilt: 'Year built',
                heatedArea: 'Heated area (sq ft)',
                stories: 'Stories',
                bedrooms: 'Bedrooms',
                fullBaths: 'Full baths',
                halfBaths: 'Half baths',
                exteriorWall: 'Exterior wall',
                foundation: 'Foundation',
                roofCover: 'Roof covering',
                roofStructure: 'Roof structure',
                heatingType: 'Heating',
                totalAcres: 'Lot size (acres)'
            };
            lines.push('Customer corrections to public record:');
            overrideKeys.forEach(k => {
                const oldVal = orig[k] !== null && orig[k] !== undefined && orig[k] !== '' ? orig[k] : 'Not shown';
                lines.push('  - ' + (labels[k] || k) + ': ' + oldVal + ' -> ' + cur[k]);
            });
        }

        const checkedConst = constructionRadios.find(r => r.checked);
        lines.push('Customer form selections: Year built=' + (get('year_built')?.value || 'Not provided') +
            ' | Area range=' + (get('square_footage')?.selectedOptions?.[0]?.textContent?.trim() || 'Not provided') +
            ' | Construction=' + (checkedConst ? checkedConst.value : 'Not provided') +
            ' | Roof type=' + (roofSelect?.value || 'Not provided') +
            ' | Roof year=' + (get('roof_year_select')?.value || 'Not provided'));

        if (orig.links && typeof orig.links === 'object') {
            const linkLines = [
                ['taxCard', 'County Property Card'],
                ['gisParcel', 'County GIS Parcel Map'],
                [!orig.links.gisParcel && 'gis', 'County GIS'],
                ['deed', 'Deed Lookup'],
                ['fema', 'FEMA Flood Map'],
                ['ncFlood', 'NC Flood FRIS'],
                ['zillow', 'Zillow'],
                ['realtor', 'Realtor.com'],
                ['googleMaps', 'Google Maps']
            ].filter(([k]) => k && orig.links[k]).map(([k, label]) => '  - ' + label + ': ' + orig.links[k]);
            if (linkLines.length) {
                lines.push('Official & research links:');
                lines.push(...linkLines);
            }
        }
        lines.push('Note: Roof age and Coverage A replacement cost are not inferred from county tax records.');
        return lines.join('\n');
    }

    function updateReview() {
        const review = get('lookup-review'); if (!review) return;
        const valid = accepted && selected && signature() === lastAddress;
        review.hidden = !valid;
        if (!valid) { review.textContent = ''; return; }
        const cur = effectiveRecord(selected);
        const bathSummary = formatBathText(cur);
        const summaryParts = [
            cur.yearBuilt && 'built in ' + cur.yearBuilt,
            Number.isFinite(cur.heatedArea) && cur.heatedArea.toLocaleString() + ' heated sq ft',
            cur.stories && cur.stories + ' stories',
            bathSummary,
            cur.exteriorWall,
            cur.roofCover && 'roof: ' + cur.roofCover,
            cur.foundation && 'foundation: ' + cur.foundation
        ].filter(Boolean);
        const editedCount = Object.keys(overrides).length;
        review.textContent = [
            'Property records included with your request',
            cur.address + (cur.county ? ' (' + cur.county + ' County · Parcel ' + cur.parcel + ')' : ''),
            summaryParts.length ? (editedCount ? 'Property details (includes your updates): ' : 'Public record: ') + summaryParts.join(' · ') : '',
            'Your answers above are kept separately. Our agency will verify any differences.'
        ].filter(Boolean).join('\n');
    }

    window.homePropertyLookup = { submissionNotes: original => {
        const notes = researchNotes(); return notes ? [original, notes].filter(Boolean).join('\n\n') : original;
    } };
    form.addEventListener('reset', () => {
        if (autoLookupTimer) { clearTimeout(autoLookupTimer); autoLookupTimer = null; }
        clearResearch(); touched.clear(); lastAddress = ''; lastShownSignature = ''; say(''); updateReview();
    });
    // Research never has to finish before moving to another step.
    new MutationObserver(updateReview).observe(get('quote-review-sections'), { childList: true });
    host.hidden = false;
    if (addresses[0] && addresses[0].value) {
        autoSplitFullAddressIfNeeded();
        if (isAddressComplete() && signature() !== lastAddress) {
            runLookup(true);
        }
    }
})();
