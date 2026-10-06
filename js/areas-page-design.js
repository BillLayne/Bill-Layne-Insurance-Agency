(function () {
    'use strict';
    var form = document.getElementById('area-search-form');
    var input = document.getElementById('locationSearch');
    var section = document.getElementById('areas-results');
    var list = document.getElementById('areas-search-results');
    var status = document.getElementById('areas-feedback');
    var clear = document.getElementById('areas-clear');
    var empty = document.getElementById('areas-no-results');
    var heading = document.getElementById('areas-results-title');
    if (!form || !input || !section || !list || !status || !clear || !empty || !heading) return;
    var rows = Array.from(list.querySelectorAll('[data-area-name]'));
    var timer;
    function normalize(text) {
        return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }
    function filter(moveFocus) {
        var query = normalize(input.value);
        var count = 0;
        rows.forEach(function (row) {
            var matched = !query || normalize(row.getAttribute('data-area-name')).indexOf(query) !== -1;
            row.hidden = !matched;
            if (matched) count++;
        });
        section.classList.toggle('as-search-active', !!query || moveFocus);
        clear.hidden = !input.value;
        list.hidden = count === 0;
        empty.hidden = count !== 0;
        status.textContent = query ? (count ? count + ' community guide' + (count === 1 ? '' : 's') + ' found.' : 'No dedicated community guide found. We can still help with your North Carolina location.') : '';
        if (moveFocus) {
            heading.focus({ preventScroll: true });
            section.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
    }
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        window.clearTimeout(timer);
        filter(true);
    });
    input.addEventListener('input', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { filter(false); }, 180);
    });
    input.addEventListener('search', function () { filter(false); });
    clear.addEventListener('click', function () {
        window.clearTimeout(timer);
        input.value = '';
        filter(false);
        input.focus();
    });
    // The entire county directory is ordinary HTML and is never filtered away.
    document.body.classList.add('as-search-ready');
})();
