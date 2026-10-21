(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const validSource = value => /^[a-z0-9_-]{1,80}$/i.test(value || '') ? value : '';
  window.esQuoteSource = validSource(params.get('src')) || 'espanol_quote_direct';
  window.esQuoteEmailBody = data => {
    const lines=['Solicitud de cotización en español', 'Atención: equipo de Dobson / Rosa Jimenez', 'Referencia del intento (recepción sin confirmar): '+data.confirmation_number, ''];
    document.querySelectorAll('.quote-review-section').forEach(section => {
      lines.push(section.querySelector('summary').textContent);
      section.querySelectorAll('dl > div').forEach(row => lines.push(row.querySelector('dt').textContent+': '+row.querySelector('dd').textContent));
      lines.push('');
    });
    document.querySelectorAll('.form-step.active .field-group').forEach(group => {
      const field=group.querySelector('textarea, input:checked');
      if (!field) return;
      const label=group.querySelector('.field-label')?.textContent.trim() || '';
      lines.push(label+': '+(field.type==='radio'?field.labels?.[0]?.textContent.trim():field.value));
    });
    lines.push('',data.additional_notes || '');
    return lines.join('\n');
  };
  window.focusQuoteStep = () => {
    const field = document.querySelector('.form-step.active input:not([type=hidden]), .form-step.active select');
    (field || document.getElementById('main-content'))?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    field?.focus({preventScroll:true});
  };
  document.addEventListener('DOMContentLoaded', () => {
    if (window.__BLI_LOCAL_PREVIEW) {
      const note = document.createElement('p');
      note.className = 'es-preview-note';
      note.textContent = 'Vista previa para revisión. No se envían solicitudes reales.';
      document.querySelector('header')?.after(note);
    }
    // Never pass names, email, phone, DOB or address in a URL.
    document.querySelectorAll('[data-es-quote-link]').forEach(link => {
      const url = new URL(link.href, location.href);
      url.searchParams.set('src', validSource(params.get('src')) || link.dataset.source || 'espanol_selector');
      if (/^\d{5}$/.test(params.get('zip') || '')) url.searchParams.set('zip', params.get('zip'));
      link.href = url.pathname + url.search + url.hash;
    });
    document.querySelectorAll('a[href^="/espanol/cotizar-"]').forEach(link => {
      if (link.hasAttribute('data-es-quote-link')) return;
      const zip = document.querySelector('[name=zip_code]')?.value || params.get('zip');
      if (/^\d{5}$/.test(zip || '')) {
        const url = new URL(link.href, location.href);url.searchParams.set('zip',zip);link.href=url.pathname+url.search;
      }
    });
    const form = document.querySelector('#home-quote-form');
    const renter = document.querySelector('#owner-renter');
    const notice = document.querySelector('#renters-handoff');
    if (form && renter && notice) {
      function syncRenter() {
        notice.hidden = !renter.checked;
        if (renter.checked) document.querySelector('#next-btn').textContent = 'Pedir ayuda para inquilinos';
        else if (typeof showStep === 'function') showStep(currentStep);
      }
      form.querySelectorAll('[name=is_owner]').forEach(field => field.addEventListener('change',syncRenter));
      const handoff = () => {
        const data = Object.fromEntries(['firstname','lastname','phone','zip_code'].map(name => [name, form.elements[name]?.value || '']));
        try {sessionStorage.setItem('bli_es_renters_handoff',JSON.stringify(data));} catch {}
        location.href='/espanol/?src=espanol_home_renters&tipo=inquilino#cotizar';
      };
      document.addEventListener('click',event => {
        if (!renter.checked || !(event.target.closest('#next-btn') || event.target.closest('#renters-handoff a'))) return;
        event.preventDefault();event.stopImmediatePropagation();handoff();
      },true);
      form.addEventListener('submit',event => {
        if (!renter.checked) return;
        event.preventDefault();event.stopImmediatePropagation();handoff();
      },true);
    }
  });
  // The private preview cannot send data. Automated checks enable only mocked
  // requests through an initialization flag and intercept every API route.
  document.addEventListener('submit',event => {
    if (!event.target.matches('#auto-quote-form,#home-quote-form')) return;
    if (!window.__BLI_LOCAL_PREVIEW || window.__BLI_TEST_SUBMISSIONS) return;
    event.preventDefault();event.stopImmediatePropagation();
    let status = document.querySelector('#es-preview-status');
    if (!status) {
      status=document.createElement('p');status.id='es-preview-status';status.className='es-preview-note';status.tabIndex=-1;status.setAttribute('role','status');event.target.append(status);
    }
    status.textContent='Vista previa: no se ha enviado ninguna solicitud. Puedes revisar y editar tus respuestas.';status.focus();
  },true);
})();
