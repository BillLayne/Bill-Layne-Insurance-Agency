/* Keep a Travelers inquiry with the chosen existing auto or home quote form. */
(() => {
  'use strict';
  const sources = new Set(['travelers_hero', 'travelers_footer', 'travelers_header', 'travelers_auto', 'travelers_home']);
  const source = new URLSearchParams(location.search).get('src');
  if (!sources.has(source)) return;
  const auto = document.getElementById('auto-quote-form');
  const home = document.getElementById('lead_source');
  if (!auto && !home) return;
  if (home) home.value = source;
  const notes = document.getElementById('f-additional_notes');
  if (!notes?.form) return;
  // Include attribution in the agency payload without showing tracking codes in the customer's notes.
  notes.form.addEventListener('formdata', (event) => {
    const message = event.formData.get('additional_notes') || '';
    event.formData.set('additional_notes', `${message}\nQuote source: ${source}.`);
  });
  if (notes.value) return;
  const product = auto ? 'auto insurance' : 'home insurance';
  notes.value = `I'd like help exploring Travelers ${product} options.`;
})();
