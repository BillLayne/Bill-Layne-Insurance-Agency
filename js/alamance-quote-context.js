/* Preserve the requested property discussion in the existing home-quote notes. */
(() => {
  'use strict';
  const interests = new Map([
    ['alamance_homeowners', 'NC homeowners'],
    ['alamance_country_homes', 'country home and acreage'],
    ['alamance_rentals', 'dwelling fire / rental property'],
    ['alamance_farm_outbuildings', 'farm property and outbuildings']
  ]);
  const source = new URLSearchParams(location.search).get('src');
  const interest = interests.get(source);
  if (interest || source === 'alamance_hero' || source === 'alamance_footer') {
    const sourceField = document.getElementById('lead_source');
    if (sourceField) sourceField.value = source;
  }
  if (!interest) return;
  const notes = document.getElementById('f-additional_notes');
  const form = notes?.form;
  if (!form || notes.value) return;
  notes.value = `Property interest: ${interest}. Please help me explore Alamance Farmers Mutual options and eligibility.`;
  const context = document.createElement('p');
  context.className = 'quoting-for';
  context.id = 'alamance-property-interest';
  context.textContent = `Property interest: ${interest}. Options and eligibility will be reviewed by our agency.`;
  const existing = document.getElementById('quoting-for');
  if (existing) existing.after(context);
})();
