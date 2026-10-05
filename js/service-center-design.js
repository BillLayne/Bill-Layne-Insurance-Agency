/* Progressive enhancement: existing service panels remain the fallback. */
if (typeof window.openServicePanel === 'function') {
  document.documentElement.classList.add('service-ui-ready');
  document.querySelectorAll('.service-hero-actions button[aria-controls]').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    const sync = () => button.setAttribute('aria-expanded', String(panel.classList.contains('open')));
    sync();
    new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ['class'] });
  });
}
