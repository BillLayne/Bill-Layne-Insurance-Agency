/* Product links select a quote topic; visitors can edit every field. */
(() => {
  'use strict';
  const products = new Map([
    ['motorcycle', { topic: 'quote_motorcycle', name: 'motorcycle' }],
    ['atv', { topic: 'quote_atv', name: 'ATV' }],
    ['travel-trailer', { topic: 'quote_travel_trailer', name: 'travel trailer' }],
    ['motorhome', { topic: 'quote_motorhome', name: 'motorhome' }]
  ]);
  const query = new URLSearchParams(location.search);
  const product = products.get(query.get('product'));
  if (!product) return;
  const topic = document.getElementById('contact-subject');
  const message = document.getElementById('contact-message');
  if (!topic || !message || topic.value || message.value) return;
  topic.value = product.topic;
  const carrier = query.get('carrier') === 'national-general' ? 'National General ' : '';
  message.value = `I'd like to explore ${carrier}${product.name} insurance options. Please contact me to review my needs.`;
  if (location.hash === '#contactForm') {
    const showForm = () => document.fonts.ready.then(() => {
      document.getElementById('contactForm').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    if (document.readyState === 'complete') showForm();
    else window.addEventListener('load', showForm, { once: true });
  }
})();
