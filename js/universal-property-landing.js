/* Universal Property & Casualty landing page interactions: accessible FAQ accordion and mobile sticky quote/call bar. */
(() => {
  'use strict';

  const faqButtons = Array.from(document.querySelectorAll('.up-faq-item button[aria-controls]'));
  faqButtons.forEach((button, index) => {
    const answer = document.getElementById(button.getAttribute('aria-controls'));
    const item = button.closest('.up-faq-item');
    if (!answer) return;
    button.setAttribute('aria-expanded', 'false');
    answer.hidden = true;
    if (item) item.classList.remove('is-open');

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
      if (item) item.classList.toggle('is-open', !expanded);
    });

    button.addEventListener('keydown', (event) => {
      let targetIndex = -1;
      if (event.key === 'ArrowDown') targetIndex = (index + 1) % faqButtons.length;
      else if (event.key === 'ArrowUp') targetIndex = (index - 1 + faqButtons.length) % faqButtons.length;
      else if (event.key === 'Home') targetIndex = 0;
      else if (event.key === 'End') targetIndex = faqButtons.length - 1;
      if (targetIndex !== -1) {
        event.preventDefault();
        faqButtons[targetIndex].focus();
      }
    });
  });

  const heroActions = document.querySelector('.up-hero-actions');
  const mobileBar = document.querySelector('.up-mobile-bar');
  if (heroActions && mobileBar && 'IntersectionObserver' in window) {
    const updateBar = (visible) => {
      mobileBar.classList.toggle('is-visible', visible);
      mobileBar.setAttribute('aria-hidden', String(!visible));
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const scrolledPastHero = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
          updateBar(scrolledPastHero);
        });
      },
      { threshold: 0 }
    );
    observer.observe(heroActions);
  }
})();
