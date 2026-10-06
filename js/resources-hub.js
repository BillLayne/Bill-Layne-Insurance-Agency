(function () {
    'use strict';
    const heroSearch = document.getElementById('resourceSearch');
    const directorySearch = document.getElementById('directorySearch');
    const cards = Array.from(document.querySelectorAll('#resource-tool-grid .resource-card'));
    const status = document.getElementById('searchStatus');
    const filters = Array.from(document.querySelectorAll('[data-filter]'));
    const situations = Array.from(document.querySelectorAll('[data-intent]'));
    const reset = document.getElementById('showAllTools');
    let category = '';
    const track = (name, values) => {
        if (typeof window.gtag === 'function') window.gtag('event', name, values);
    };
    const words = value => value.toLowerCase().match(/[a-z0-9]+/g) || [];
    const indexed = cards.map(card => ({ card, words: words(`${card.dataset.name} ${card.textContent}`), categories: (card.dataset.category || '').split(/\s+/) }));
    function apply() {
        const query = words(directorySearch.value);
        let count = 0;
        indexed.forEach(item => {
            const inCategory = !category || item.categories.includes(category) || (category === 'community' && item.categories.includes('local'));
            item.card.hidden = !(inCategory && query.every(word => item.words.some(entry => entry.startsWith(word))));
            if (!item.card.hidden) count += 1;
        });
        filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
        situations.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.intent === category)));
        status.textContent = count ? `Showing ${count} of ${cards.length} resources.` : 'No matching resources. Try another search or clear the filters.';
        document.getElementById('resource-empty').hidden = count !== 0;
        reset.hidden = !category && !query.length;
    }
    function moveToResults() {
        document.getElementById('directory').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
        status.focus({ preventScroll: true });
    }
    function clear() {
        category = '';
        heroSearch.value = '';
        directorySearch.value = '';
        apply();
    }
    [heroSearch, directorySearch].forEach(input => input.addEventListener('input', () => {
        heroSearch.value = directorySearch.value = input.value;
        apply();
    }));
    document.getElementById('resource-hero-search').addEventListener('submit', event => {
        event.preventDefault();
        apply();
        moveToResults();
        track('resource_search', { result_count: cards.filter(card => !card.hidden).length });
    });
    directorySearch.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); moveToResults(); }
    });
    filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; apply(); }));
    situations.forEach(button => button.addEventListener('click', () => {
        clear();
        category = button.dataset.intent;
        apply();
        moveToResults();
        track('resource_intent_selected', { resource_intent: category, visible_tools: cards.filter(card => !card.hidden).length });
    }));
    reset.addEventListener('click', clear);
    document.querySelectorAll('[data-reset]').forEach(button => button.addEventListener('click', () => { clear(); directorySearch.focus(); }));
    document.querySelectorAll('[data-browse]').forEach(link => link.addEventListener('click', clear));
    document.addEventListener('click', event => {
        const link = event.target.closest('.rh-main a[data-tool], .rh-main .resource-card, .rh-main .rh-related');
        if (link) track('resource_tool_click', { tool_name: link.dataset.tool || link.querySelector('h3').textContent, tool_url: link.href });
    });
    apply();
})();
