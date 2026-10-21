(() => {
  'use strict';
  const dialog = document.getElementById('cotizar');
  const form = document.getElementById('es-quote-form');
  const select = document.getElementById('es-insurance');
  const status = document.getElementById('es-form-status');
  const submit = form.querySelector('[type="submit"]');
  let trigger, placement = 'espanol_direct', submitting = false, completed = false;
  const safeSource = value => /^[a-z0-9_-]{1,80}$/i.test(value || '') ? value : 'espanol_direct';
  const track = (event, extra = {}) => window.bliTrackConversion?.(event, { form_name: 'espanol_request', language: 'es', cta_source: placement, ...extra });
  function openQuote(link) {
    trigger = link;
    placement = safeSource(link?.dataset.source || new URLSearchParams(location.search).get('src'));
    const type = link?.dataset.insurance;
    if (type && Array.from(select.options).some(option => option.value === type)) select.value = type;
    if (!dialog.open) dialog.showModal();
    select.focus();
    track('quote_click', { lead_type: 'quote' });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const target = new URL(link.href, location.href);
    if (target.origin === location.origin && target.pathname === location.pathname && target.hash === '#cotizar') {
      event.preventDefault();
      const menu = document.getElementById('bli-site-menu');
      if (menu?.open) menu.querySelector('.bli-um-close')?.click();
      openQuote(link);
    }
    // Close the shared drawer before following a local section link.
    if (link.closest('#bli-site-menu') && ['#seguros', '#nosotros', '#contacto'].includes(target.hash)) {
      document.getElementById('bli-site-menu').querySelector('.bli-um-close')?.click();
    }
  });
  dialog.querySelector('.es-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger?.focus());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  if (location.hash === '#cotizar') openQuote(null);
  const params = new URLSearchParams(location.search);
  if (params.get('tipo') && Array.from(select.options).some(o => o.value === params.get('tipo'))) select.value = params.get('tipo');
  // Same-tab handoff from the Spanish home form, kept out of the URL.
  if (params.get('src') === 'espanol_home_renters') {
    try {
      const saved = JSON.parse(sessionStorage.getItem('bli_es_renters_handoff') || 'null');
      sessionStorage.removeItem('bli_es_renters_handoff');
      if (saved) {
        document.getElementById('es-name').value = [saved.firstname, saved.lastname].filter(Boolean).join(' ');
        document.getElementById('es-phone').value = saved.phone || '';
        document.getElementById('es-zip').value = saved.zip_code || '';
      }
    } catch {}
  }
  const docsButton = document.getElementById('es-doc-toggle');
  const docs = document.getElementById('es-doc-more');
  docs.hidden = true;
  docsButton.addEventListener('click', () => {
    docs.hidden = !docs.hidden;
    docsButton.setAttribute('aria-expanded', String(!docs.hidden));
    docsButton.textContent = docs.hidden ? 'Consultar documentos' : 'Cerrar información';
  });
  if ('IntersectionObserver' in window) {
    const map = document.getElementById('es-office-map');
    const mapObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      map.src = map.dataset.src;
      mapObserver.disconnect();
    }, { rootMargin: '300px' });
    mapObserver.observe(map);
  } else {
    document.getElementById('es-office-map').src = document.getElementById('es-office-map').dataset.src;
  }
  const phone = document.getElementById('es-phone');
  const zip = document.getElementById('es-zip');
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  zip.addEventListener('input', () => zip.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || completed) return;
    if (!/^(?:1)?\d{10}$/.test(phone.value.replace(/\D/g, ''))) {
      phone.setCustomValidity('Escribe un teléfono de diez dígitos.'); phone.reportValidity(); return;
    }
    if (!/^\d{5}$/.test(zip.value)) {
      zip.setCustomValidity('Escribe un código postal de cinco dígitos.'); zip.reportValidity(); return;
    }
    if (!form.reportValidity()) return;
    if (window.__BLI_LOCAL_PREVIEW) {
      status.dataset.error = 'false';
      status.textContent = 'Vista previa: el formulario está completo. No se ha enviado ninguna solicitud.';
      status.focus();
      return;
    }
    const data = new FormData(form);
    if (data.get('website')) return;
    const type = select.selectedOptions[0].textContent;
    const message = ['Solicitud en español — Aseguranza Comunidad Unida / Dobson', 'Atención solicitada: equipo de habla hispana / Rosa Jimenez', 'Tipo de seguro: ' + type, 'Código postal: ' + data.get('zip'), 'Contacto preferido: ' + data.get('preference'), 'Idioma: español', 'Origen: ' + placement, 'Solicitud de orientación/cotización; no activa ni modifica cobertura.'].join('\n');
    submitting = true; submit.disabled = true; submit.textContent = 'Enviando…'; status.textContent = ''; status.dataset.error = 'false';
    try {
      // Use the existing acknowledged contact intake; never retry an uncertain POST.
      const response = await fetch('/api/homepage-submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'contact', name: String(data.get('name')).trim(), phone: phone.value.trim(), email: '', message }),
        signal: AbortSignal.timeout(50000)
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true || result.formType !== 'contact') throw new Error('unconfirmed');
      completed = true;
      status.textContent = '¡Gracias! Recibimos tu solicitud de atención en español. El equipo revisará tus datos para comunicarse contigo. Esto no activa ni modifica una póliza.';
      submit.textContent = 'Solicitud recibida';
      track('generate_lead', { lead_type: 'contact', service_line: select.value, method: 'web_form' });
      form.querySelectorAll('input,select').forEach(field => field.disabled = true);
    } catch {
      status.dataset.error = 'true';
      status.textContent = 'No pudimos confirmar la recepción. Para evitar enviar tu solicitud dos veces, llama al 336-356-2200 y verifica con el equipo antes de intentarlo de nuevo.';
      submit.textContent = 'Recepción sin confirmar';
      // Do not enable an immediate retry: a timeout can follow a successful save.
    } finally {
      submitting = false;
      status.focus();
    }
  });
})();
