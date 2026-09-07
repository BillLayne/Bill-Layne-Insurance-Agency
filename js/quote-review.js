// Read-only summaries of existing form controls; never send or store review data.
let quoteReviewEditing = false;

function editQuoteReviewStep(step) {
    quoteReviewEditing = true;
    currentStep = step;
    showStep(currentStep);
}

function renderQuoteReview() {
    const host = document.getElementById('quote-review-sections');
    if (!host) return;
    host.replaceChildren();
    document.querySelectorAll('.form-step').forEach(step => {
        const number = Number(step.dataset.step);
        if (number >= totalSteps) return;
        const section = document.createElement('details');
        section.className = 'quote-review-section';
        section.open = number === 1;
        const summary = document.createElement('summary');
        const titles = document.getElementById('auto-quote-form')
            ? ['Contact information', 'Drivers', 'Current coverage', 'Vehicles', 'Coverage options']
            : ['Contact information', 'Property details', 'Current coverage', 'Coverage preferences'];
        const title = titles[number - 1];
        summary.textContent = title;
        section.appendChild(summary);
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'quote-review-edit';
        edit.textContent = 'Edit ' + title.toLowerCase();
        edit.addEventListener('click', () => editQuoteReviewStep(number));
        section.appendChild(edit);
        const list = document.createElement('dl');
        const radioNames = new Set();
        step.querySelectorAll('input, select, textarea').forEach(field => {
            if (!field.name || field.type === 'hidden' || field.disabled) return;
            // The whole step is hidden while reviewing; skip only conditional content inside it.
            for (let parent = field.parentElement; parent && parent !== step; parent = parent.parentElement) {
                if (parent.hidden || getComputedStyle(parent).display === 'none') return;
            }
            const group = field.closest('.field-group');
            let label = field.labels?.[0]?.textContent.trim() || field.name.replaceAll('_', ' ');
            let value = field.value.trim();
            if (field.type === 'radio') {
                if (!field.checked || radioNames.has(field.name)) return;
                radioNames.add(field.name);
                value = label;
                label = group?.querySelector('.field-label')?.textContent.trim() || field.name.replaceAll('_', ' ');
            } else if (field.type === 'checkbox') {
                value = field.checked ? 'Selected' : 'Not selected';
            } else if (field.tagName === 'SELECT') {
                value = field.value ? field.selectedOptions[0].textContent.trim() : 'Not provided';
            } else if (field.type === 'date' && value) {
                const [year, month, day] = value.split('-');
                value = month + '/' + day + '/' + year;
            }
            const entry = field.closest('[data-driver], [data-vehicle]');
            if (entry) label = (entry.dataset.driver ? 'Driver ' + entry.dataset.driver : 'Vehicle ' + entry.dataset.vehicle) + ' — ' + label;
            const row = document.createElement('div');
            const term = document.createElement('dt');
            term.textContent = label.replace(/\s*\*\s*/g, ' ').replace(/\s+/g, ' ').trim();
            const answer = document.createElement('dd');
            answer.textContent = value || 'Not provided';
            row.append(term, answer);
            list.appendChild(row);
        });
        section.appendChild(list);
        host.appendChild(section);
    });
}

function focusQuoteReview() {
    const title = document.getElementById('quote-review-title');
    title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
    title.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
