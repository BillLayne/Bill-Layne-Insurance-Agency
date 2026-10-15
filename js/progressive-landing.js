/* Progressive page interactions; content remains available without JavaScript. */
(() => {
  'use strict';
  document.querySelectorAll('.pr-faq-item button').forEach((button) => {
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
  const dropdowns = [...document.querySelectorAll('.pr-header-nav details')];
  dropdowns.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open) dropdowns.forEach((other) => { if (other !== details) other.open = false; });
    });
    details.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { details.open = false; }));
  });
  document.addEventListener('click', (event) => {
    dropdowns.forEach((details) => { if (!details.contains(event.target)) details.open = false; });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = dropdowns.find((details) => details.open);
    if (open) { open.open = false; open.querySelector('summary').focus(); }
  });
})();
