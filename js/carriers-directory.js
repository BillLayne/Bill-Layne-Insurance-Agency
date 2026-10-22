(function () {
  'use strict';
  var filters = document.querySelector('.cd-filters');
  if (!filters) return;
  var buttons = Array.from(filters.querySelectorAll('[data-filter]'));
  var cards = Array.from(document.querySelectorAll('.cd-card[data-coverage]'));
  var status = document.getElementById('carrier-results');
  filters.hidden = false;
  filters.addEventListener('click', function (event) {
    var button = event.target.closest('[data-filter]');
    if (!button || !filters.contains(button)) return;
    var selected = button.dataset.filter;
    buttons.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
    var count = 0;
    cards.forEach(function (card) {
      var show = selected === 'all' || card.dataset.coverage.split(' ').includes(selected);
      card.hidden = !show;
      if (show) count++;
    });
    status.textContent = selected === 'all'
      ? '10 core carriers · Steadily landlord coverage · NCJUA FAIR Plan'
      : selected === 'home' ? '8 primary home carriers + NCJUA FAIR Plan'
      : count + ' companies to explore for ' + button.textContent.toLowerCase() + ' coverage';
    if (location.hostname === 'www.billlayneinsurance.com' && typeof window.bliTrackConversion === 'function') {
      window.bliTrackConversion('carrier_filter', { cta_source: 'carriers_directory', coverage_type: selected, result_count: count });
    }
  });
}());
