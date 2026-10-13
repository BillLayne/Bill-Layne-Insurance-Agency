(() => {
  'use strict';
  const input = document.getElementById('helpSearch');
  const cards = [...document.querySelectorAll('.rh-card')];
  const sections = [...document.querySelectorAll('.rh-resource-section')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const results = document.getElementById('help-results');
  const empty = document.getElementById('help-empty');
  const reset = document.getElementById('reset-help');
  let category = 'all';
  const synonyms = {medication:'meds',medications:'meds',medicine:'meds',medicines:'meds',prescription:'meds',prescriptions:'meds',bill:'utilities',bills:'utilities',power:'utilities',groceries:'food',grocery:'food',healthcare:'health',cash:'money',wifi:'internet',broadband:'internet'};
  const normalize = value => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9$]+/g,' ').trim();
  const searchable = new Map(cards.map(card => [card, normalize(card.dataset.name + ' ' + card.textContent)]));
  function update() {
    const words = normalize(input.value).split(' ').filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const match = words.every(word => searchable.get(card).includes(word) || synonyms[word] === card.dataset.category);
      card.hidden = !(match && (category === 'all' || card.dataset.category === category));
      if (!card.hidden) count++;
    });
    sections.forEach(section => { section.hidden = !section.querySelector('.rh-card:not([hidden])'); });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    const active = words.length > 0 || category !== 'all';
    reset.hidden = !active;
    empty.hidden = count !== 0;
    document.querySelector('.rh-start').hidden = active;
    results.textContent = active ? `${count} matching resource${count === 1 ? '' : 's'}${category !== 'all' ? ' in ' + filters.find(b => b.dataset.filter === category).textContent.toLowerCase() : ''}.` : `${cards.length} resources and guides across six everyday needs.`;
  }
  function moveTo(target) {
    target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  }
  input.addEventListener('input', update);
  document.querySelector('.rh-filter-bar').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {category = button.dataset.filter; update();}));
  document.querySelectorAll('[data-category-jump]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    category = link.dataset.categoryJump;
    input.value = '';
    update();
    const target = document.getElementById(category);
    history.replaceState(null, '', '#' + category);
    const heading = target.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
    moveTo(target);
  }));
  document.getElementById('help-search-form').addEventListener('submit', event => {
    event.preventDefault();
    update();
    const heading = document.getElementById('rh-programs-title');
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
    moveTo(document.getElementById('programs'));
  });
  reset.addEventListener('click', () => {
    category = 'all'; input.value = ''; update();
    const all = filters.find(button => button.dataset.filter === 'all');
    all.focus({preventScroll:true});
    moveTo(document.getElementById('programs'));
  });
  update();

  const share = document.getElementById('share-page');
  const status = document.getElementById('share-status');
  const shareUrl = 'https://www.billlayneinsurance.com/nc-help/';
  share.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({title:'Real Help Finder — North Carolina',text:'Find free and low-cost help with everyday essentials.',url:shareUrl});
        status.textContent = 'Share options opened.';
        return;
      } catch(error) { if (error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      share.querySelector('span').textContent = 'Link copied';
      status.textContent = 'Page link copied to clipboard.';
      setTimeout(() => { share.querySelector('span').textContent = 'Share this page'; }, 2500);
    } catch(error) {
      document.getElementById('share-fallback').hidden = false;
      const urlField = document.getElementById('share-url');
      urlField.focus(); urlField.select();
      status.textContent = 'Copy the selected link to share this page.';
    }
  });

  let printState = null;
  function preparePrint() {
    if (printState) return;
    const details = [...document.querySelectorAll('.rh-main details')];
    printState = {hidden:[...cards,...sections,empty].map(el => [el,el.hidden]), details:details.map(el => [el,el.open])};
    cards.forEach(el => {el.hidden=false;});
    sections.forEach(el => {el.hidden=false;});
    empty.hidden=true;
    details.forEach(el => {el.open=true;});
  }
  function restorePrint() {
    if (!printState) return;
    printState.hidden.forEach(([el,value]) => {el.hidden=value;});
    printState.details.forEach(([el,value]) => {el.open=value;});
    printState=null;
  }
  window.addEventListener('beforeprint',preparePrint);
  window.addEventListener('afterprint',restorePrint);
  document.getElementById('print-resources').addEventListener('click', () => {preparePrint(); window.print();});
})();
