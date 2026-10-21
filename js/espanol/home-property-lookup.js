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
    const fields = ['year_built', 'square_footage'].map(get);
    let controller, generation = 0, matches = [], selected = null, accepted = null, retrievedAt = '';
    let lastAddress = '', ownChange = false;
    const imported = new Map(), touched = new Set();
    const signature = () => addresses.map(el => el.value.trim().toLowerCase()).join('|');
    const say = message => { status.textContent = message; };
    const cancel = () => { generation++; controller?.abort(); controller = null; find.disabled = false; find.textContent = "Buscar los datos de mi casa"; };
    const areaRange = n => n < 1000 ? 'under_1000' : n < 1500 ? '1000_1500' : n < 2000 ? '1500_2000' : n < 2500 ? '2000_2500' : n < 3000 ? '2500_3000' : n <= 4000 ? '3000_4000' : 'over_4000';
    const hint = (field, message) => {
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
            const field = get(id);
            if (field.value === value && !touched.has(id)) {
                ownChange = true; field.value = ''; field.dispatchEvent(new Event('change', { bubbles: true })); ownChange = false;
            }
        }
        imported.clear(); accepted = null;
        fields.forEach(field => hint(field, ''));
    }
    function clearResearch() {
        cancel(); clearImported(); matches = []; selected = null; result.hidden = true;
        get('lookup-choices').hidden = true;
    }
    fields.forEach(field => field.addEventListener('change', () => {
        if (ownChange) return;
        touched.add(field.id);
        if (accepted) hint(field, "Conservamos tu respuesta. El registro público aparece arriba como referencia.");
        updateReview();
    }));
    addresses.forEach(field => field.addEventListener('input', () => {
        if (lastAddress && signature() !== lastAddress) {
            clearResearch(); lastAddress = '';
            say("Cambió la dirección. Eliminamos los datos sugeridos y conservamos los que ingresaste. Busca esta vivienda o continúa manualmente.");
            updateReview();
        }
    }));
    function showMatch() {
        selected = matches[Number(choices.value) || 0];
        if (!selected) return;
        result.hidden = false; apply.disabled = false; apply.textContent = "Es mi casa: usar los datos disponibles";
        get('lookup-address').textContent = selected.address;
        get('lookup-parcel').textContent = [selected.county && selected.county + ' (condado)', 'Parcela ' + selected.parcel].filter(Boolean).join(' · ');
        get('lookup-mismatch').hidden = !selected.addressDiffers;
        const facts = get('lookup-facts'); facts.replaceChildren();
        [
            ["Año de construcción", selected.yearBuilt || "No disponible"],
            ["Superficie climatizada", selected.heatedArea ? Number(selected.heatedArea).toLocaleString() + ' pies cuadrados' : "No disponible"],
            ["Material del techo", selected.roofCover], ["Exterior", selected.exteriorWall]
        ].filter(([, value]) => value).forEach(([label, value]) => {
            const row = document.createElement('div'), term = document.createElement('dt'), detail = document.createElement('dd');
            term.textContent = label; detail.textContent = value; row.append(term, detail); facts.append(row);
        });
    }
    choices.addEventListener('change', () => { clearImported(); showMatch(); updateReview(); });
    manual.addEventListener('click', () => {
        clearResearch(); say("Puedes ingresar los datos de tu casa y continuar."); updateReview();
        get('year_built').focus({ preventScroll: true });
        get('year_built').scrollIntoView({ block: 'center', behavior: 'auto' });
    });
    find.addEventListener('click', async () => {
        if (addresses[0].value.trim().length < 5 || !/\d/.test(addresses[0].value)) {
            say("Escribe la dirección arriba e inténtalo otra vez. También puedes continuar manualmente."); addresses[0].focus(); return;
        }
        if (!addresses[1].value.trim() || !/^\d{5}$/.test(addresses[2].value.trim())) {
            say("Agrega la ciudad y el código postal de 5 dígitos para buscar la vivienda correcta.");
            (!addresses[1].value.trim() ? addresses[1] : addresses[2]).focus(); return;
        }
        clearResearch(); updateReview(); lastAddress = signature();
        let address = addresses[0].value.trim();
        if (!address.toLowerCase().includes(addresses[1].value.trim().toLowerCase())) address += ', ' + addresses[1].value.trim();
        if (!/\bNC\b|North Carolina/i.test(address)) address += ', NC';
        if (!address.includes(addresses[2].value.trim())) address += ' ' + addresses[2].value.trim();
        if (address.length > 180) { say("La dirección es demasiado larga para la búsqueda. Continúa manualmente."); return; }
        const current = generation;
        controller = new AbortController(); const requestController = controller;
        find.disabled = true; find.textContent = "Buscando tu vivienda…";
        say("Buscando registros públicos. Puedes seguir completando el formulario sin esperar.");
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
            if (!matches.length) { say("No encontramos datos automáticos para esta dirección. Ingresa los datos que conoces y continúa."); return; }
            choices.replaceChildren();
            matches.forEach((p, i) => choices.add(new Option(p.address + ' — Parcela ' + p.parcel, String(i))));
            get('lookup-choices').hidden = matches.length < 2;
            showMatch();
            say(matches.length > 1 ? "Encontramos varios registros. Elige tu vivienda y revisa los datos antes de usarlos." : "Encontramos un registro del condado. Verifica que sea tu casa antes de usar los datos.");
        } catch {
            if (current !== generation) return;
            say(requestController.signal.aborted ? "La búsqueda está tardando. Puedes ingresar los datos manualmente o intentar de nuevo." : "No pudimos consultar los datos. Conservamos tus respuestas. Ingresa los datos manualmente o intenta de nuevo.");
        } finally {
            clearTimeout(timeout);
            if (current === generation) { controller = null; find.disabled = false; find.textContent = "Buscar los datos de mi casa"; }
        }
    });
    apply.addEventListener('click', () => {
        if (!selected || signature() !== lastAddress) return;
        accepted = { ...selected }; let count = 0;
        const values = { year_built: Number.isInteger(selected.yearBuilt) ? String(selected.yearBuilt) : '',
            square_footage: Number.isFinite(selected.heatedArea) && selected.heatedArea > 0 ? areaRange(selected.heatedArea) : '' };
        fields.forEach(field => {
            const value = values[field.id];
            if (!field.value && !touched.has(field.id) && value && [...field.options].some(option => option.value === value)) {
                ownChange = true; field.value = value; field.dispatchEvent(new Event('change', { bubbles: true })); ownChange = false;
                imported.set(field.id, value); count++;
                hint(field, field.id === 'square_footage' ? 'De registros públicos: ' + selected.heatedArea.toLocaleString() + ' pies cuadrados climatizados. Revisa este rango; puedes cambiarlo.' : "Dato de registros públicos. Revísalo; puedes cambiarlo.");
            } else if (field.value && value) hint(field, "Conservamos tu respuesta. Compárala con el registro público de arriba.");
        });
        apply.disabled = true; apply.textContent = "Propiedad seleccionada";
        say(count ? "Completamos los datos disponibles y conservamos tus respuestas. Revisa los campos y continúa." : "Propiedad seleccionada. Conservamos tus respuestas. Completa los datos que falten y continúa.");
        updateReview();
    });
    function researchNotes() {
        if (!accepted || signature() !== lastAddress) return '';
        const p = accepted;
        const lines = ['Property lookup — customer selected this property; public facts still require verification.',
            'Source: Find My Home Information / county public records' + (retrievedAt ? ' (' + retrievedAt + ')' : '') + '.',
            'Record address: ' + p.address, 'County / parcel: ' + p.county + ' / ' + p.parcel];
        if (p.yearBuilt) lines.push('Public record year built: ' + p.yearBuilt);
        if (p.heatedArea) lines.push('Public record heated area: ' + p.heatedArea + ' pies cuadrados');
        if (p.roofCover) lines.push('Public record roof covering: ' + p.roofCover);
        if (p.exteriorWall) lines.push('Public record exterior: ' + p.exteriorWall);
        fields.forEach(field => lines.push('Current form ' + (field.id === 'year_built' ? 'year built' : 'area range') + ': ' + (field.value ? field.selectedOptions[0].textContent.trim() : "Sin indicar")));
        if (p.addressDiffers) lines.push('County record address differs from the entered address; verify parcel.');
        lines.push('Roof age and dwelling coverage are not inferred from public records.');
        return lines.join('\n');
    }
    function updateReview() {
        const review = get('lookup-review'); if (!review) return;
        const valid = accepted && signature() === lastAddress;
        review.hidden = !valid;
        review.textContent = valid ? [
            "Registros de la propiedad incluidos en tu solicitud", accepted.address,
            'Registro público: ' + [accepted.yearBuilt && 'construida en ' + accepted.yearBuilt, accepted.heatedArea && accepted.heatedArea.toLocaleString() + ' pies cuadrados climatizados'].filter(Boolean).join(' · '),
            "Tus respuestas se conservan por separado. Nuestro equipo verificará cualquier diferencia."
        ].filter(line => line !== 'Registro público: ').join('\n') : '';
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
