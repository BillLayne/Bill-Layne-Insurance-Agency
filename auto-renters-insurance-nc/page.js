// Keep preview traffic out of production analytics.
(function () {
  'use strict';
  if (location.hostname !== 'www.billlayneinsurance.com') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-N37THY37CR');
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=G-N37THY37CR';
  document.head.appendChild(tag);
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  function loadClarity() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.clarity.ms/tag/vo5s3jhhub';
    document.head.appendChild(script);
  }
  function idle() {
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadClarity, { timeout: 4000 });
    else window.setTimeout(loadClarity, 1500);
  }
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
})();
