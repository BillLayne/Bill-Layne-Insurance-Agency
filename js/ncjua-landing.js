(() => {
  'use strict';

  const dialog = document.getElementById('review-property');
  const form = document.getElementById('ncjua-review-form');
  const propTypeSelect = document.getElementById('ncjua-property-type');
  const occupancySelect = document.getElementById('ncjua-occupancy');
  const addressInput = document.getElementById('ncjua-address');
  const nameInput = document.getElementById('ncjua-name');
  const phoneInput = document.getElementById('ncjua-phone');
  const emailInput = document.getElementById('ncjua-email');
  const notesInput = document.getElementById('ncjua-difficulty');
  const statusEl = document.getElementById('ncjua-form-status');
  const uploadBox = document.getElementById('ncjua-upload-next');
  const submitBtn = form?.querySelector('[type="submit"]');
  const mobileBar = document.getElementById('ncjua-mobile-bar');
  const heroActions = document.getElementById('ncjua-hero-actions');

  let lastTrigger = null;
  let placement = 'ncjua_direct';
  let submitting = false;
  let completed = false;

  const safeSource = value =>
    /^[a-z0-9_-]{1,80}$/i.test(value || '') ? value : 'ncjua_direct';

  const track = (event, extra = {}) =>
    window.bliTrackConversion?.(event, {
      form_name: 'ncjua_property_review',
      cta_source: placement,
      ...extra
    });

  function applyPreselection(typeVal, occVal) {
    if (typeVal && propTypeSelect) {
      const match = Array.from(propTypeSelect.options).find(
        o => o.value.toLowerCase() === typeVal.toLowerCase()
      );
      if (match) propTypeSelect.value = match.value;
    }
    if (occVal && occupancySelect) {
      const match = Array.from(occupancySelect.options).find(
        o => o.value.toLowerCase() === occVal.toLowerCase()
      );
      if (match) occupancySelect.value = match.value;
    }
  }

  function openReviewModal(triggerEl) {
    if (!dialog) return;
    lastTrigger = triggerEl || null;
    placement = safeSource(
      triggerEl?.dataset.source ||
        new URLSearchParams(location.search).get('src')
    );

    const cardType = triggerEl?.dataset.propertyType;
    const cardOcc = triggerEl?.dataset.occupancy;
    applyPreselection(cardType, cardOcc);

    if (!dialog.open) {
      dialog.showModal();
    }
    if (cardType && addressInput) {
      addressInput.focus();
    } else if (propTypeSelect) {
      propTypeSelect.focus();
    }
    track('quote_click', {
      lead_type: 'property_review',
      property_type: propTypeSelect?.value || ''
    });
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href], button[data-open-review]');
    if (!link) return;

    if (link.hasAttribute('data-open-review')) {
      event.preventDefault();
      openReviewModal(link);
      return;
    }

    if (link.tagName === 'A' && link.getAttribute('href')) {
      const target = new URL(link.href, location.href);
      if (
        target.origin === location.origin &&
        target.pathname === location.pathname &&
        target.hash === '#review-property'
      ) {
        event.preventDefault();
        const siteMenu = document.getElementById('bli-site-menu');
        if (siteMenu?.open) {
          siteMenu.querySelector('.bli-um-close')?.click();
        }
        openReviewModal(link);
      }
    }
  });

  dialog?.querySelector('.ncjua-dialog-close')?.addEventListener('click', () => {
    dialog.close();
  });

  dialog?.addEventListener('close', () => {
    lastTrigger?.focus?.();
  });

  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      dialog.close();
    }
  });

  // URL hash / query parameter preselection support
  const params = new URLSearchParams(location.search);
  if (params.get('type') || params.get('occupancy')) {
    applyPreselection(params.get('type'), params.get('occupancy'));
  }
  if (location.hash === '#review-property') {
    openReviewModal(null);
  }

  // Mobile sticky bottom bar visibility after hero actions scroll out of view
  if (mobileBar && heroActions && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry) return;
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        mobileBar.classList.toggle('is-visible', scrolledPast);
      },
      { threshold: 0 }
    );
    observer.observe(heroActions);
  } else if (mobileBar) {
    mobileBar.classList.add('is-visible');
  }

  // Form validation & submission
  phoneInput?.addEventListener('input', () => phoneInput.setCustomValidity(''));

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || completed) return;

    const digits = (phoneInput?.value || '').replace(/\D/g, '');
    if (!/^(?:1)?\d{10}$/.test(digits)) {
      phoneInput.setCustomValidity('Please enter a valid 10-digit phone number.');
      phoneInput.reportValidity();
      return;
    }

    if (!form.reportValidity()) return;

    if (window.__BLI_LOCAL_PREVIEW) {
      statusEl.dataset.error = 'false';
      statusEl.textContent =
        'Preview mode: We received your property review details. Next step: our team will let you know which exterior photos or documents are needed. Submitting this request does not bind coverage or guarantee approval.';
      if (uploadBox) uploadBox.hidden = false;
      statusEl.focus();
      return;
    }

    const formData = new FormData(form);
    if (formData.get('website')) return;

    const propType = String(formData.get('property_type') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const occupancy = String(formData.get('occupancy') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const difficulty = String(formData.get('difficulty') || '').trim();

    const message = [
      'NCJUA / NC FAIR Plan Property Review Request',
      'Property type: ' + propType,
      'Property address: ' + address,
      'Occupancy: ' + occupancy,
      'Insurance difficulty / notes: ' + difficulty,
      'Source placement: ' + placement,
      'Note: Initial property review request only; coverage is subject to eligibility and underwriting review.'
    ].join('\n');

    submitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Request…';
    }
    statusEl.textContent = '';
    statusEl.dataset.error = 'false';

    try {
      const response = await fetch('/api/homepage-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'contact',
          name,
          phone,
          email,
          message
        }),
        signal: AbortSignal.timeout(50000)
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true || result.formType !== 'contact') {
        throw new Error('unconfirmed');
      }

      completed = true;
      statusEl.dataset.error = 'false';
      statusEl.textContent =
        'Thank you — we received your property review request. Next step: our team will review your information and contact you to explain which current property photos or details are needed. Submitting a review request does not guarantee eligibility, approval, or a binding date.';
      if (uploadBox) uploadBox.hidden = false;
      if (submitBtn) submitBtn.textContent = 'Property Review Requested';
      track('generate_lead', {
        lead_type: 'property_review',
        service_line: propType,
        method: 'web_form'
      });
      form.querySelectorAll('input, select, textarea').forEach(el => {
        el.disabled = true;
      });
    } catch {
      statusEl.dataset.error = 'true';
      statusEl.textContent =
        'We could not confirm receipt of your request. To avoid sending a duplicate request, please call 336-835-1993 so our team can assist you directly.';
      if (submitBtn) submitBtn.textContent = 'Receipt Unconfirmed';
    } finally {
      submitting = false;
      statusEl.focus();
    }
  });
})();
