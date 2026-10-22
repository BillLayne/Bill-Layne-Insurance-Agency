(() => {
  'use strict';
  const dialog = document.getElementById('hg-quote');
  const form = document.getElementById('hg-form');
  const status = document.getElementById('hg-status');
  const submit = form.querySelector('[type="submit"]');
  const category = form.elements.category;
  let lastTrigger, placement = 'hagerty_direct', attempted = false;
  const track = (event, extra = {}) => {
    if (location.hostname !== 'www.billlayneinsurance.com') return;
    window.bliTrackConversion?.(event, {form_name:'hagerty_classic_quote', cta_source:placement, ...extra});
  };
  document.querySelectorAll('[data-open-quote]').forEach(link => {
    link.addEventListener('click', event => {
      if (!dialog.showModal) return;
      event.preventDefault();
      // Prevent the shared delegated link handler from counting this click twice.
      event.stopPropagation();
      lastTrigger = link;
      placement = link.dataset.source || 'hagerty_direct';
      if (!attempted && link.dataset.category) category.value = link.dataset.category;
      dialog.showModal();
      if (attempted) status.focus(); else category.focus();
      track('quote_click', {lead_type:'quote'});
    });
  });
  dialog.querySelector('.hg-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => lastTrigger?.focus());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  const dock = document.getElementById('hg-dock');
  const heroActions = document.getElementById('hg-hero-actions');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      dock.hidden = !(entry.boundingClientRect.bottom < 80 && !entry.isIntersecting);
    }, {rootMargin:'-80px 0px 0px 0px'}).observe(heroActions);
  } else dock.hidden = false;
  form.elements.year.max = String(new Date().getFullYear() + 1);
  form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));
  form.elements.zip.addEventListener('input', () => form.elements.zip.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (attempted || form.elements.website.value) return;
    const phone = form.elements.phone;
    if (!/^(?:1)?\d{10}$/.test(phone.value.replace(/\D/g,''))) {
      phone.setCustomValidity('Enter a 10-digit phone number, optionally starting with 1.');
      phone.reportValidity(); return;
    }
    const zip = form.elements.zip;
    // NC postal ZIP prefixes; final address and eligibility are reviewed by the agency.
    if (!/^2[78]\d{3}$/.test(zip.value)) {
      zip.setCustomValidity('Please enter a North Carolina ZIP code beginning with 27 or 28.');
      zip.reportValidity(); return;
    }
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const message = [
      'Hagerty Classic / Collector Vehicle Quote Request',
      `Vehicle category: ${data.category}`, `Year: ${data.year}`, `Make: ${data.make}`, `Model: ${data.model}`,
      `North Carolina ZIP: ${data.zip}`, `Estimated vehicle value: ${data.value || 'Not provided'}`,
      `Modifications / restoration: ${data.restoration || 'Not provided'}`,
      `Vehicle use: ${data.usage || 'Not provided'}`, `Storage: ${data.storage || 'Not provided'}`,
      `Source placement: ${placement}`,
      'Initial quote request only. Coverage and eligibility require review; no coverage bound.'
    ].join('\n');
    attempted = true;
    submit.disabled = true;
    submit.textContent = 'Sending your request…';
    status.textContent = '';
    status.dataset.error = 'false';
    try {
      const response = await fetch('/api/homepage-submit', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({formType:'contact', name:data.name.trim(), phone:data.phone.trim(), email:data.email.trim(), message}),
        signal:AbortSignal.timeout(50000)
      });
      const receipt = await response.json();
      if (!response.ok || receipt.ok !== true || receipt.formType !== 'contact') throw new Error('unconfirmed');
      if (receipt.preview === true) {
        status.textContent = 'Preview only — nothing was sent. On the live page, our team will receive these details and contact you to review your vehicle, eligibility and coverage options.';
        submit.textContent = 'Preview completed';
      } else {
        status.textContent = 'Thank you — your request was received. Our team will review your vehicle details and contact you to discuss eligibility, coverage options and any photos or information needed. Coverage is not bound by this request.';
        submit.textContent = 'Quote request received';
        track('generate_lead', {lead_type:'quote',service_line:'classic_auto',method:'backend_acknowledged'});
      }
      form.querySelectorAll('input,select,textarea').forEach(el => {el.disabled=true;});
    } catch {
      status.dataset.error = 'true';
      status.textContent = 'We could not confirm receipt. Your request may have reached us. Please call 336-835-1993 before submitting again so we can check and avoid a duplicate.';
      submit.textContent = 'Receipt unconfirmed — please call';
    }
    status.focus();
  });
})();
