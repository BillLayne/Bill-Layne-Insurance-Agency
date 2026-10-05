/* Progressive enhancement: all carriers and native disclosures work without JS. */
(() => {
  'use strict';
  const root = document.querySelector('.claims-body');
  if (!root) return;
  const search = root.querySelector('#company-search');
  const cards = [...root.querySelectorAll('.company-card')];
  const filters = root.querySelector('.cl-filters');
  const more = root.querySelector('#view-all-carriers');
  const status = root.querySelector('#carrier-status');
  const empty = root.querySelector('#no-results');
  let filter = 'ours';
  let expanded = false;
  const render = () => {
    const term = search.value.trim().toLocaleLowerCase();
    // A search always covers the complete directory, regardless of filter.
    const matches = cards.filter(card => term ? card.dataset.company.includes(term) : (filter === 'all' || card.dataset.agency === 'true'));
    const shown = term || expanded ? matches : matches.slice(0, 8);
    cards.forEach(card => { card.hidden = !shown.includes(card); });
    empty.hidden = matches.length > 0;
    more.hidden = !!term || (filter === 'all' && matches.length <= 8);
    more.textContent = expanded ? 'Show fewer carriers' : 'View all carriers';
    more.setAttribute('aria-expanded', String(expanded));
    filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(!term && button.dataset.carrierFilter === filter)));
    status.textContent = term ? `${matches.length} matching ${matches.length === 1 ? 'carrier' : 'carriers'} across the full directory.` : `Showing ${shown.length} of ${matches.length} ${filter === 'ours' ? 'agency' : 'listed'} carriers.`;
  };
  filters.hidden = false;
  search.addEventListener('input', render);
  filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.carrierFilter;
    expanded = false;
    search.value = '';
    render();
  }));
  more.addEventListener('click', () => {
    if (filter === 'ours') { filter = 'all'; expanded = true; }
    else { expanded = !expanded; }
    render();
  });
  render();
  // Reveal a collapsed tool before following preserved navigation anchors.
  const revealHash = hash => {
    if (!hash || hash === '#') return;
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
    if (!target || !root.contains(target)) return;
    let node = target;
    while (node && node !== root) { if (node.tagName === 'DETAILS') node.open = true; node = node.parentElement; }
  };
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor) revealHash(anchor.getAttribute('href'));
  });
  window.addEventListener('hashchange', () => revealHash(location.hash));
  revealHash(location.hash);
})();
