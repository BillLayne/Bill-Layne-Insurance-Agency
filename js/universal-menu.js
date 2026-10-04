/* Shared progressive enhancement. Page-specific menus remain a no-script fallback. */
(function () {
 'use strict';
 var panel = document.getElementById('bli-site-menu');
 if (!panel || typeof panel.showModal !== 'function') return;
 var triggerSelector = '#menu-btn, #menu-toggle, #menu-toggle-btn, #mobile-menu-button, #mobileMenuToggle, #menuToggle, #blinavToggle, #hub-dock-menu, .dock-menu, .renters-site-menu > summary, [data-bli-menu-open], button[onclick="openMenu()"]';
 var triggers = Array.from(document.querySelectorAll(triggerSelector));
 var opener = null, overflow = '', padding = '', rootOverflow = '';
 function normalize(path) { return path.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/'; }
 var canonical = document.querySelector('link[rel="canonical"]');
 var current = normalize(canonical ? new URL(canonical.href, location.href).pathname : location.pathname);
 var best = null, bestLength = -1;
 panel.querySelectorAll('.bli-um-link').forEach(function (link) {
  var path = normalize(new URL(link.href, location.href).pathname);
  if (path === current || (path !== '/' && current.indexOf(path + '/') === 0)) {
   if (path.length > bestLength) { best = link; bestLength = path.length; }
  }
 });
 if (best) {
  best.setAttribute('aria-current', normalize(new URL(best.href, location.href).pathname) === current ? 'page' : 'location');
  if (best.closest('.bli-um-children')) {
   document.getElementById('bli-um-resources').hidden = false;
   panel.querySelector('.bli-um-expand').setAttribute('aria-expanded', 'true');
  }
 }
 triggers.forEach(function (trigger) {
  trigger.setAttribute('aria-controls', panel.id);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'dialog');
 });
 function open(trigger) {
  if (panel.open) return;
  opener = trigger;
  overflow = document.body.style.overflow;
  padding = document.body.style.paddingRight;
  rootOverflow = document.documentElement.style.overflow;
  var gutter = window.innerWidth - document.documentElement.clientWidth;
  if (gutter > 0) document.body.style.paddingRight = (parseFloat(getComputedStyle(document.body).paddingRight) + gutter) + 'px';
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  panel.showModal();
  panel.querySelector('.bli-um-scroll').scrollTop = 0;
  triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'true'); });
  panel.querySelector('.bli-um-close').focus({ preventScroll: true });
 }
 function close() { if (panel.open) panel.close(); }
 panel.addEventListener('close', function () {
  document.body.style.overflow = overflow;
  document.body.style.paddingRight = padding;
  document.documentElement.style.overflow = rootOverflow;
  triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
  if (opener && opener.isConnected) opener.focus({ preventScroll: true });
 });
 document.addEventListener('click', function (event) {
  var trigger = event.target.closest(triggerSelector);
  if (!trigger || panel.contains(trigger)) return;
  event.preventDefault(); event.stopImmediatePropagation();
  open(trigger);
 }, true);
 panel.querySelector('.bli-um-close').addEventListener('click', close);
 panel.querySelector('.bli-um-expand').addEventListener('click', function () {
  var expanded = this.getAttribute('aria-expanded') === 'true';
  this.setAttribute('aria-expanded', String(!expanded));
  document.getElementById('bli-um-resources').hidden = expanded;
 });
 panel.addEventListener('click', function (event) {
  if (event.target !== panel) return;
  var bounds = panel.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
 });
 document.addEventListener('keydown', function (event) {
  if (!panel.open) return;
  if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); }
  if (event.key === 'Tab') {
   var controls = Array.from(panel.querySelectorAll('a,button')).filter(function (el) { return el.getClientRects().length && !el.disabled; });
   var first = controls[0], last = controls[controls.length - 1];
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
   else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
 }, true);
 document.documentElement.classList.add('bli-um-ready');
})();
