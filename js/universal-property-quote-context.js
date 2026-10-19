/* Preserve Universal Property & Casualty quote source and coverage-review selection on home-quote.html. */
(() => {
  'use strict';
  const sources = new Set([
    'universal_header',
    'universal_hero',
    'universal_coverage_review',
    'universal_footer',
    'universal_mobile_bar'
  ]);
  const source = new URLSearchParams(location.search).get('src');
  if (!sources.has(source)) return;

  const sourceField = document.getElementById('lead_source');
  if (sourceField) sourceField.value = source;

  const notes = document.getElementById('f-additional_notes');
  const form = notes?.form;
  if (!form) return;

  form.addEventListener('formdata', (event) => {
    const message = event.formData.get('additional_notes') || '';
    if (!message.includes(`Quote source: ${source}`)) {
      event.formData.set('additional_notes', `${message}\nQuote source: ${source}.`.trim());
    }
  });

  if (notes.value) return;

  if (source === 'universal_coverage_review') {
    notes.value =
      'Coverage review request: Please help me review Universal Property & Casualty home insurance options, including replacement cost, roof/wind-hail deductibles, and optional protections.';
    const context = document.createElement('p');
    context.className = 'quoting-for';
    context.id = 'universal-property-interest';
    context.textContent =
      'Request selection: Home coverage review (Universal Property & Casualty). Options and eligibility will be reviewed by our agency.';
    const existing = document.getElementById('quoting-for');
    if (existing) existing.after(context);
  } else {
    notes.value =
      'Please help me explore Universal Property & Casualty home insurance options and eligibility.';
  }
})();
