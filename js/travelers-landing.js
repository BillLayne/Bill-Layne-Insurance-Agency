/* Keep answers available when JavaScript is disabled. */
(() => {
  'use strict';
  document.querySelectorAll('.tr-faq-item button').forEach((button) => {
    const answer = document.getElementById(button.getAttribute('aria-controls'));
    if (!answer) return;
    button.setAttribute('aria-expanded', 'false');
    answer.hidden = true;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });
})();
