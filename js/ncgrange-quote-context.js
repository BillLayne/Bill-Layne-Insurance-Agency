/* Preserve the requested NC Grange Mutual property category in the home-quote notes. */
(() => {
  'use strict';
  const interests = new Map([
    ['ncgrange_homeowners', 'Homeowners'],
    ['ncgrange_farmowners', 'Farmowners'],
    ['ncgrange_mobile_modular', 'Mobile & modular home'],
    ['ncgrange_tenant_dwellings', 'Tenant dwelling (property owner coverage)']
  ]);
  const source = new URLSearchParams(location.search).get('src');
  const interest = interests.get(source);
  if (interest || source === 'ncgrange_hero' || source === 'ncgrange_footer' || source === 'ncgrange_header') {
    const sourceField = document.getElementById('lead_source');
    if (sourceField) sourceField.value = source;
  }
  if (!interest) return;
  const notes = document.getElementById('f-additional_notes');
  const form = notes?.form;
  if (!form || notes.value) return;
  notes.value = `Property interest: ${interest}. Please help me explore NC Grange Mutual options and eligibility.`;
  const context = document.createElement('p');
  context.className = 'quoting-for';
  context.id = 'ncgrange-property-interest';
  context.textContent = `Property interest: ${interest}. Options and eligibility will be reviewed by our agency.`;
  const existing = document.getElementById('quoting-for');
  if (existing) existing.after(context);
})();
