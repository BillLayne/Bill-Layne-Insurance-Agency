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
    const imported = new Map(), touched = new Set();
    const signature = () => addresses.map(el => el.value.trim().toLowerCase()).join('|');
    const say = message => { status.textContent = message; };
    const cancel = () => { generation++; controller?.abort(); controller = null; find.disabled = false; find.textContent = 'Find my home details'; };
    const areaRange = n => n < 1000 ? 'under_1000' : n < 1500 ? '1000_1500' : n < 2000 ? '1500_2000' : n < 2500 ? '2000_2500' : n < 3000 ? '2500_3000' : n <= 4000 ? '3000_4000' : 'over_4000';

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
        const s = raw.toLowerCase().trim();
        if (/unknown|other|mixed|multiple|stucco|aluminum|concrete block|cinder|log|metal/.test(s)) return '';
        const hits = [];
        if (/\bbrick\b|masonry|\bstone\b/.test(s)) hits.push('brick');
        if (/\bvinyl\b/.test(s)) hits.push('vinyl');
        if (/\bframe\b|\bwood\b|clapboard|hardiplank|fiber cement|masonite|weatherboard/.test(s)) hits.push('frame');
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
        imported.clear(); accepted = null;
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

    addresses.forEach(field => field.addEventListener('input', () => {
        if (lastAddress && signature() !== lastAddress) {
            clearResearch(); lastAddress = '';
            say('Address changed. Suggested values were cleared; your own entries were kept. Look up this home or continue manually.');
            updateReview();
        }
    }));

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
            ['taxCard', 'County property card ↗'],
            ['gisParcel', 'County parcel map ↗'],
            [!links.gisParcel && 'gis', 'County GIS ↗'],
            ['deed', 'Deed lookup ↗']
        ].filter(([key]) => key && typeof links[key] === 'string' && /^https?:\/\//i.test(links[key]));
        if (!items.length) { box.hidden = true; return; }
        const label = document.createElement('span');
        label.textContent = 'Public record sources: ';
        box.append(label);
        items.forEach(([key, text], idx) => {
            if (idx > 0) box.append(document.createTextNode(' · '));
            const a = document.createElement('a');
            a.href = links[key];
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = text;
            box.append(a);
        });
        box.hidden = false;
    }

    function showMatch() {
        selected = matches[Number(choices.value) || 0];
        if (!selected) return;
        result.hidden = false; apply.disabled = false; apply.textContent = 'This is my home — use available details';
        get('lookup-address').textContent = selected.address;
        const parcelParts = [
            selected.county && selected.county + ' County',
            selected.parcelId ? 'Parcel ' + selected.parcelId : (selected.parcel ? 'Parcel ' + selected.parcel : ''),
            selected.pin && selected.pin !== selected.parcelId ? 'PIN ' + selected.pin : ''
        ].filter(Boolean);
        get('lookup-parcel').textContent = parcelParts.join(' · ');
        get('lookup-mismatch').hidden = !selected.addressDiffers;
        const facts = get('lookup-facts'); facts.replaceChildren();
        const bathSummary = formatBathText(selected);
        [
            ['Year built', selected.yearBuilt || 'Not shown'],
            ['Effective year built', selected.effectiveYearBuilt && selected.effectiveYearBuilt !== selected.yearBuilt ? String(selected.effectiveYearBuilt) + ' (not roof age)' : ''],
            ['Heated area', Number.isFinite(selected.heatedArea) ? Number(selected.heatedArea).toLocaleString() + ' sq ft' : 'Not shown'],
            ['Ground floor area', Number.isFinite(selected.groundFloorArea) && selected.groundFloorArea !== selected.heatedArea ? Number(selected.groundFloorArea).toLocaleString() + ' sq ft' : ''],
            ['Stories', selected.stories ? String(selected.stories) : ''],
            ['Bedrooms / baths', bathSummary],
            ['Exterior wall', selected.exteriorWall],
            ['Foundation', selected.foundation],
            ['Roof covering', selected.roofCover],
            ['Roof structure', selected.roofStructure],
            ['Heating', selected.heatingType],
            ['Lot size', formatAcres(selected.totalAcres)]
        ].filter(([, value]) => value).forEach(([label, value]) => {
            const row = document.createElement('div'), term = document.createElement('dt'), detail = document.createElement('dd');
            term.textContent = label; detail.textContent = value; row.append(term, detail); facts.append(row);
        });
        renderLinks(selected.links);
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

    find.addEventListener('click', async () => {
        autoSplitFullAddressIfNeeded();
        if (addresses[0].value.trim().length < 5 || !/\d/.test(addresses[0].value)) {
            say('Enter your street address above, then try again. You can also continue manually.'); addresses[0].focus(); return;
        }
        if (!addresses[1].value.trim() || !/^\d{5}$/.test(addresses[2].value.trim())) {
            say('Add the city and five-digit ZIP above to help find the correct home.');
            (!addresses[1].value.trim() ? addresses[1] : addresses[2]).focus(); return;
        }
        clearResearch(); updateReview(); lastAddress = signature();
        let address = addresses[0].value.trim();
        if (!address.toLowerCase().includes(addresses[1].value.trim().toLowerCase())) address += ', ' + addresses[1].value.trim();
        if (!/\bNC\b|North Carolina/i.test(address)) address += ', NC';
        if (!address.includes(addresses[2].value.trim())) address += ' ' + addresses[2].value.trim();
        if (address.length > 180) { say('The address is too long for automatic lookup. Please continue manually.'); return; }
        const current = generation;
        controller = new AbortController(); const requestController = controller;
        find.disabled = true; find.textContent = 'Finding your home…';
        say('Looking for public records. You can keep filling out the form or continue without waiting.');
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
            if (current === generation) { controller = null; find.disabled = false; find.textContent = 'Find my home details'; }
        }
    });

    apply.addEventListener('click', () => {
        if (!selected || signature() !== lastAddress) return;
        accepted = { ...selected }; let count = 0;
        const mappedRoof = mapRoofType(selected.roofCover);
        const values = {
            year_built: Number.isInteger(selected.yearBuilt) ? String(selected.yearBuilt) : '',
            square_footage: Number.isFinite(selected.heatedArea) && selected.heatedArea > 0 ? areaRange(selected.heatedArea) : '',
            'f-roof_type': mappedRoof
        };
        fields.forEach(field => {
            const value = values[field.id];
            if (!field.value && !touched.has(field.id) && value && [...field.options].some(option => option.value === value)) {
                ownChange = true; field.value = value; field.dispatchEvent(new Event('change', { bubbles: true })); ownChange = false;
                imported.set(field.id, value); count++;
                if (field.id === 'square_footage') {
                    hint(field, 'From public records: ' + selected.heatedArea.toLocaleString() + ' heated sq ft. Check this range; you can change it.');
                } else if (field.id === 'f-roof_type') {
                    hint(field, 'From public records (' + selected.roofCover + '). Roof age is not inferred — please select Roof Year if known.');
                } else {
                    hint(field, 'From public records. Please check; you can change this.');
                }
            } else if (field.value && value) {
                hint(field, 'Your existing answer was kept. Compare it with the public record above.');
            }
        });

        const mappedConst = mapConstructionType(selected.exteriorWall);
        if (mappedConst && !touched.has('construction_type')) {
            const targetRadio = constructionRadios.find(r => r.value === mappedConst);
            if (targetRadio) {
                ownChange = true; targetRadio.checked = true; targetRadio.dispatchEvent(new Event('change', { bubbles: true })); ownChange = false;
                constructionImported = mappedConst; count++;
            }
        }

        if (countyField && !countyField.value && selected.county) {
            countyField.value = selected.county;
            imported.set('lead_county', selected.county);
        }

        if (typeof gtag === 'function') {
            try {
                gtag('event', 'find_home_information_click', {
                    county: selected.county || 'unknown',
                    fields_prefilled: count
                });
            } catch {}
        }

        apply.disabled = true; apply.textContent = 'Property selected';
        say(count ? 'Available details filled in below. Your existing answers were kept. Please check the fields and continue.' : 'Property selected. Your answers were kept; enter any missing details below and continue.');
        updateReview();
    });

    function researchNotes() {
        if (!accepted || signature() !== lastAddress) return '';
        const p = accepted;
        const lines = [
            '--- COUNTY PROPERTY DOSSIER (Public Record — Needs Verification) ---',
            'Source: Find My Home Information / NC county public records' + (retrievedAt ? ' (' + retrievedAt + ')' : ''),
            'Record address: ' + p.address,
            'County / Parcel: ' + [p.county, p.parcelId ? 'Parcel ' + p.parcelId : ('Parcel ' + p.parcel), p.pin && p.pin !== p.parcelId ? 'PIN ' + p.pin : ''].filter(Boolean).join(' · ')
        ];
        if (p.matchMethod) lines.push('Match method: ' + p.matchMethod + (p.addressDiffers ? ' (County record address differs from entered address; verify parcel)' : ''));
        if (p.yearBuilt) lines.push('Public record year built: ' + p.yearBuilt);
        if (p.effectiveYearBuilt) lines.push('Public record effective year built (not roof age): ' + p.effectiveYearBuilt);
        if (Number.isFinite(p.heatedArea)) lines.push('Public record heated area: ' + p.heatedArea.toLocaleString() + ' sq ft');
        if (Number.isFinite(p.groundFloorArea)) lines.push('Public record ground floor area: ' + p.groundFloorArea.toLocaleString() + ' sq ft');
        if (p.stories) lines.push('Public record stories: ' + p.stories);
        const bathSummary = formatBathText(p);
        if (bathSummary) lines.push('Public record bedrooms / baths: ' + bathSummary);
        if (p.exteriorWall) lines.push('Public record exterior wall: ' + p.exteriorWall);
        if (p.foundation) lines.push('Public record foundation: ' + p.foundation);
        if (p.roofCover) lines.push('Public record roof covering: ' + p.roofCover);
        if (p.roofStructure) lines.push('Public record roof structure: ' + p.roofStructure);
        if (p.heatingType) lines.push('Public record heating type: ' + p.heatingType);
        const acresText = formatAcres(p.totalAcres);
        if (acresText) lines.push('Public record lot size: ' + acresText);
        const valParts = [
            formatCurrency(p.buildingValue) && 'Building ' + formatCurrency(p.buildingValue),
            formatCurrency(p.landValue) && 'Land ' + formatCurrency(p.landValue),
            formatCurrency(p.totalValue) && 'Total Assessed ' + formatCurrency(p.totalValue)
        ].filter(Boolean);
        if (valParts.length) lines.push('County tax assessment (not Coverage A): ' + valParts.join(' · '));
        if (formatCurrency(p.salePrice) || p.saleDate) {
            lines.push('Last recorded sale: ' + [formatCurrency(p.salePrice), p.saleDate].filter(Boolean).join(' on '));
        }
        if (p.deedBook || p.deedPage) lines.push('Deed reference: Book ' + (p.deedBook || 'N/A') + ', Page ' + (p.deedPage || 'N/A'));

        const checkedConst = constructionRadios.find(r => r.checked);
        lines.push('Customer form selections: Year built=' + (get('year_built')?.value || 'Not provided') +
            ' | Area range=' + (get('square_footage')?.selectedOptions?.[0]?.textContent?.trim() || 'Not provided') +
            ' | Construction=' + (checkedConst ? checkedConst.value : 'Not provided') +
            ' | Roof type=' + (roofSelect?.value || 'Not provided') +
            ' | Roof year=' + (get('roof_year_select')?.value || 'Not provided'));

        if (p.links && typeof p.links === 'object') {
            const linkLines = [
                ['taxCard', 'County Property Card'],
                ['gisParcel', 'County GIS Parcel Map'],
                [!p.links.gisParcel && 'gis', 'County GIS'],
                ['deed', 'Deed Lookup'],
                ['fema', 'FEMA Flood Map'],
                ['ncFlood', 'NC Flood FRIS'],
                ['zillow', 'Zillow'],
                ['realtor', 'Realtor.com'],
                ['googleMaps', 'Google Maps']
            ].filter(([k]) => k && p.links[k]).map(([k, label]) => '  - ' + label + ': ' + p.links[k]);
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
        const valid = accepted && signature() === lastAddress;
        review.hidden = !valid;
        if (!valid) { review.textContent = ''; return; }
        const bathSummary = formatBathText(accepted);
        const summaryParts = [
            accepted.yearBuilt && 'built in ' + accepted.yearBuilt,
            Number.isFinite(accepted.heatedArea) && accepted.heatedArea.toLocaleString() + ' heated sq ft',
            accepted.stories && accepted.stories + ' stories',
            bathSummary,
            accepted.exteriorWall,
            accepted.roofCover && 'roof: ' + accepted.roofCover,
            accepted.foundation && 'foundation: ' + accepted.foundation
        ].filter(Boolean);
        review.textContent = [
            'Property records included with your request',
            accepted.address + (accepted.county ? ' (' + accepted.county + ' County · Parcel ' + accepted.parcel + ')' : ''),
            summaryParts.length ? 'Public record: ' + summaryParts.join(' · ') : '',
            'Your answers above are kept separately. Our agency will verify any differences.'
        ].filter(Boolean).join('\n');
    }

    window.homePropertyLookup = { submissionNotes: original => {
        const notes = researchNotes(); return notes ? [original, notes].filter(Boolean).join('\n\n') : original;
    } };
    form.addEventListener('reset', () => {
        clearResearch(); touched.clear(); lastAddress = ''; say(''); updateReview();
    });
    // Research never has to finish before moving to another step.
    new MutationObserver(updateReview).observe(get('quote-review-sections'), { childList: true });
    host.hidden = false;
})();
