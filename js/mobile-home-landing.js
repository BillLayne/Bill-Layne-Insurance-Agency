(() => {
  'use strict';
  const dialog = document.getElementById('mh-quote');
  const form = document.getElementById('mh-form');
  const status = document.getElementById('mh-status');
  const submit = form.querySelector('[type="submit"]');
  const category = form.elements.category;
  let lastTrigger, placement = 'mobile_home_direct', attempted = false;
  const track = (event, extra = {}) => {
    if (location.hostname !== 'www.billlayneinsurance.com') return;
    window.bliTrackConversion?.(event, {form_name:'mobile_home_landing_quote', cta_source:placement, ...extra});
  };
  document.querySelectorAll('[data-open-quote], .bli-um-quote').forEach(link => {
    link.addEventListener('click', event => {
      if (!dialog.showModal) return;
      event.preventDefault();
      event.stopPropagation(); // The shared link handler must not count this click again.
      const fromMenu = link.classList.contains('bli-um-quote');
      if (fromMenu) document.getElementById('bli-site-menu').close();
      lastTrigger = fromMenu ? document.querySelector('.mh-menu') : link;
      placement = fromMenu ? 'mobile_home_menu' : (link.dataset.source || 'mobile_home_direct');
      if (!attempted && link.dataset.category) category.value = link.dataset.category;
      dialog.showModal();
      if (attempted) status.focus(); else category.focus();
      track('quote_click', {lead_type:'quote'});
    });
  });
  dialog.querySelector('.mh-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => lastTrigger?.focus());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  const dock = document.getElementById('mh-dock');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      dock.hidden = !(entry.boundingClientRect.bottom < 80 && !entry.isIntersecting);
    }, {rootMargin:'-80px 0px 0px 0px'}).observe(document.getElementById('mh-hero-actions'));
  } else dock.hidden = false;
  form.elements.year.max = String(new Date().getFullYear() + 1);
  const updateEmailRequirement = () => {
    const required = form.elements.contact_method.value === 'Email';
    form.elements.email.required = required;
    document.getElementById('mh-email-help').textContent = required ? '(required for email contact)' : '(optional)';
  };
  form.elements.contact_method.addEventListener('change', updateEmailRequirement);
  updateEmailRequirement();
  for (const name of ['name','phone','zip']) form.elements[name].addEventListener('input', () => form.elements[name].setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (attempted || form.elements.website.value) return;
    if (!form.elements.name.value.trim()) {
      form.elements.name.setCustomValidity('Please enter your name.');
      form.elements.name.reportValidity(); return;
    }
    const phone = form.elements.phone;
    if (!/^(?:1)?\d{10}$/.test(phone.value.replace(/\D/g,''))) {
      phone.setCustomValidity('Enter a 10-digit phone number, optionally starting with 1.');
      phone.reportValidity(); return;
    }
    const zip = form.elements.zip;
    // Postal prefix check only. The team reviews the full property address and eligibility.
    if (!/^2[78]\d{3}$/.test(zip.value)) {
      zip.setCustomValidity('Please enter a North Carolina ZIP code beginning with 27 or 28.');
      zip.reportValidity(); return;
    }
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const message = [
      'North Carolina Mobile / Manufactured Home Quote Request',
      `Home type: ${data.category}`, `Property ZIP: ${data.zip}`, `Preferred contact: ${data.contact_method}`,
      `Property address: ${data.address.trim() || 'Not provided'}`, `Approximate year built: ${data.year || 'Not provided'}`,
      `Home use: ${data.usage || 'Not provided'}`, `Current insurance: ${data.insurance.trim() || 'Not provided'}`,
      `Additional information: ${data.notes.trim() || 'Not provided'}`, `Source placement: ${placement}`,
      'Customer requested contact about this quote using the preferred method above.',
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
        body:JSON.stringify({formType:'contact',name:data.name.trim(),phone:data.phone.trim(),email:data.email.trim(),message}),
        signal:AbortSignal.timeout(50000)
      });
      const receipt = await response.json();
      if (!response.ok || receipt.ok !== true || receipt.formType !== 'contact') throw new Error('unconfirmed');
      if (receipt.preview === true) {
        status.textContent = 'Preview only — nothing was sent. On the live page, our team will review your information and contact you about the next steps.';
        submit.textContent = 'Preview completed';
      } else {
        status.textContent = 'Thank you! Our team will review your information and contact you about the next steps. Coverage is not bound by this request.';
        submit.textContent = 'Quote request received';
        track('generate_lead', {lead_type:'quote',service_line:'mobile_home',method:'backend_acknowledged'});
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
