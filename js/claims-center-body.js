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

  const normalize = str => (str || '').toLocaleLowerCase().replace(/[^a-z0-9]/g, '');

  const matchesQuery = (card, rawTerm) => {
    const lowerTerm = rawTerm.toLocaleLowerCase();
    const normTerm = normalize(rawTerm);
    const haystack = `${card.dataset.company || ''} ${card.dataset.aliases || ''} ${card.textContent || ''}`.toLocaleLowerCase();
    return haystack.includes(lowerTerm) || (normTerm.length > 0 && normalize(haystack).includes(normTerm));
  };

  const render = () => {
    const term = search.value.trim();
    // A search always covers the complete directory, regardless of filter.
    const matches = cards.filter(card =>
      term ? matchesQuery(card, term) : (filter === 'all' || card.dataset.agency === 'true')
    );
    // Show ALL agency carriers by default when filter === 'ours'; when filter === 'all', show all if expanded else all agency + top directory
    const shown = (term || filter === 'ours' || expanded) ? matches : matches.slice(0, 12);
    cards.forEach(card => { card.hidden = !shown.includes(card); });
    empty.hidden = matches.length > 0;
    more.hidden = !!term;
    const isShowingAll = filter === 'all' && expanded;
    more.textContent = isShowingAll ? 'Show only our agency carriers' : `View all ${cards.length} carriers in directory`;
    more.setAttribute('aria-expanded', String(isShowingAll));
    filters.querySelectorAll('button').forEach(button =>
      button.setAttribute('aria-pressed', String(!term && button.dataset.carrierFilter === filter))
    );
    if (term) {
      status.textContent = `${matches.length} matching ${matches.length === 1 ? 'carrier' : 'carriers'} across the full ${cards.length}-carrier directory.`;
    } else if (filter === 'ours') {
      status.textContent = `Showing all ${shown.length} agency & specialty carriers we represent. Switch to "All carriers" or use search to find another insurer.`;
    } else {
      status.textContent = `Showing ${shown.length} of ${matches.length} carriers in the full directory.`;
    }
  };

  filters.hidden = false;
  search.addEventListener('input', render);
  filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.carrierFilter;
    expanded = filter === 'all';
    search.value = '';
    render();
  }));
  more.addEventListener('click', () => {
    if (filter === 'ours' || !expanded) {
      filter = 'all';
      expanded = true;
    } else {
      filter = 'ours';
      expanded = false;
    }
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
