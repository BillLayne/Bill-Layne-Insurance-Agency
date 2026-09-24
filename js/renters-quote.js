(() => {
  'use strict';
  const form = document.getElementById('renters-form');
  const steps = [...form.querySelectorAll('.form-step')];
  const next = document.getElementById('next-btn');
  const back = document.getElementById('back-btn');
  const errorSummary = document.getElementById('error-summary');
  const names = ['Your rental', 'About you', 'Coverage & review'];
  let step = 0;
  let editing = false;
  let submitted = false;
  let submitting = false;
  const dateString = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const today = dateString(new Date());
  form.elements.effective_date.min = today;
  form.elements.date_of_birth.max = today;
  form.elements.date_of_birth.min = '1900-01-01';
  function focusHeading() { const heading = steps[step].querySelector('h2'); heading.focus({preventScroll:true}); heading.scrollIntoView({behavior:'instant', block:'start'}); }
  function clearErrors() {
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(el => { el.hidden = true; el.textContent = ''; });
    errorSummary.hidden = true;
  }
  function validate(index) {
    clearErrors();
    let first = null;
    let errors = 0;
    for (const input of steps[index].querySelectorAll('[required]')) {
      let message = '';
      if (input.type === 'radio') {
        if (!form.querySelector('[name="rental_type"]:checked')) message = 'Choose the type of place you rent.';
      } else if (!input.value.trim()) message = 'Please complete this field.';
      else if (input.id === 'phone' && !/^(?:1)?\d{10}$/.test(input.value.replace(/\D/g, ''))) message = 'Enter a 10-digit phone number, with area code.';
      else if (input.id === 'zip_code' && !/^\d{5}$/.test(input.value)) message = 'Enter a 5-digit ZIP code.';
      else if (input.id === 'date_of_birth' && input.value >= today) message = 'Enter a date of birth before today.';
      else if (input.id === 'effective_date' && input.value < today) message = 'Choose today or a future date.';
      else if (!input.validity.valid) message = input.type === 'email' ? 'Enter a complete email address, like you@example.com.' : 'Please check this answer.';
      if (message) {
        const error = document.getElementById(input.type === 'radio' ? 'err-rental-type' : `err-${input.id}`);
        input.setAttribute('aria-invalid','true');
        if (error) {
          error.hidden = false; error.textContent = message;
          const described = new Set((input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
          described.add(error.id); input.setAttribute('aria-describedby',[...described].join(' '));
        }
        first ||= input; errors++;
      }
    }
    if (first) {
      errorSummary.textContent = `Please check ${errors === 1 ? 'the highlighted answer' : `the ${errors} highlighted answers`} before continuing.`;
      errorSummary.hidden = false; first.focus({preventScroll:true}); first.scrollIntoView({block:'center',behavior:'instant'});
      return false;
    }
    return true;
  }
  function show(index, focus = true) {
    step = index; clearErrors();
    steps.forEach((el, i) => { el.hidden = i !== step; });
    document.getElementById('step-caption').textContent = `Step ${step+1} of 3`;
    document.getElementById('step-name').textContent = names[step];
    document.getElementById('progress-fill').style.width = `${(step+1)/3*100}%`;
    document.querySelectorAll('.step-list li').forEach((el,i) => {
      el.classList.toggle('done',i<step);
      if (i === step) el.setAttribute('aria-current','step'); else el.removeAttribute('aria-current');
    });
    back.hidden = step === 0 && !editing;
    if (!submitted) next.textContent = editing ? 'Save & return to review →' : step === 2 ? 'Send my renters request →' : 'Continue →';
    document.getElementById('next-hint').textContent = editing ? 'Your other answers will stay in place' : ['Next: a little about you','Next: coverage & review','Your request does not bind coverage'][step];
    if (step === 2) renderReview();
    if (focus) focusHeading();
  }
  function conditional(selectId, value, containerId) {
    const select = document.getElementById(selectId);
    const container = document.getElementById(containerId);
    const update = () => {
      const active = select.value === value;
      container.hidden = !active;
      container.querySelectorAll('input,textarea,select').forEach(el => { el.disabled = !active; });
    };
    select.addEventListener('change', update); update();
  }
  conditional('current_insurance','Yes','carrier-field');
  conditional('previous_claims','Yes','claims-field');
  conditional('landlord_requirement','Yes','lease-field');
  function values() { return new FormData(form); }
  function renderReview() {
    const data = values();
    const value = key => data.get(key)?.toString().trim() || 'Not provided';
    const date = key => { const raw = data.get(key); if (!raw) return 'Not provided'; return new Date(`${raw}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); };
    const sections = [
      ['Your rental', 0, [ ['Type',value('rental_type')],['Address',[data.get('property_address'),data.get('unit'),data.get('city'),'NC',data.get('zip_code')].filter(Boolean).join(', ')],['Start date',date('effective_date')]]],
      ['About you', 1, [['Name',[data.get('firstname'),data.get('lastname')].filter(Boolean).join(' ')],['Birth date',date('date_of_birth')],['Phone',value('phone')],['Email',value('email')],['Insured now',value('current_insurance')],...(data.get('current_insurance') === 'Yes' ? [['Carrier',value('current_carrier')]] : []),['Past claims',value('previous_claims')],...(data.get('previous_claims') === 'Yes' ? [['Claim details',value('claims_details')]] : [])]],
      ['Your preferences', 2, [['Belongings',value('personal_property')],['Liability',value('liability')],['Landlord requires',value('landlord_requirement')],...(data.get('landlord_requirement') === 'Yes' ? [['Lease details',value('lease_details')]] : []),['Auto quote',data.has('bundle_auto') ? 'Yes, please compare' : 'Not requested'],['Notes',value('additional_notes')]]]
    ];
    const root = document.getElementById('review-content'); root.replaceChildren();
    sections.forEach(([title,index,rows]) => {
      const section = document.createElement('section'); section.className = 'review-section';
      const head = document.createElement('header'); const h = document.createElement('h4'); h.textContent = title; head.append(h);
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'edit-btn'; edit.textContent = 'Edit'; edit.setAttribute('aria-label',`Edit ${title.toLowerCase()}`);
      edit.addEventListener('click', () => {
        if (index === 2) { document.getElementById('personal_property').focus(); document.getElementById('personal_property').scrollIntoView({block:'center',behavior:'instant'}); }
        else { editing = true; show(index); }
      }); head.append(edit); section.append(head);
      const dl = document.createElement('dl');
      rows.forEach(([label,answer]) => { const row = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = label; dd.textContent = answer; row.append(dt,dd); dl.append(row); });
      section.append(dl); root.append(section);
    });
  }
  async function advance() {
    if (submitting || submitted) return;
    if (!validate(step)) return;
    if (editing) { editing = false; show(2); return; }
    if (step < 2) { show(step+1); return; }
    // Revalidate previous steps, including data transferred from Home.
    for (let index = 0; index < 2; index++) {
      show(index, false);
      if (!validate(index)) return;
    }
    show(2, false); renderReview();
    const payload = Object.fromEntries(values());
    payload.form_type = 'renters_insurance';
    payload.bundle_auto = form.elements.bundle_auto.checked;
    payload.cta_source = /^[a-z0-9_-]{1,80}$/i.test(params.get('src') || '') ? params.get('src') : 'renters_quote';
    submitting = true;
    next.disabled = true; back.disabled = true; next.textContent = 'Sending…';
    form.setAttribute('aria-busy','true');
    // Freeze answers while the request is in flight so the receipt matches the sent data.
    const controls = [...form.querySelectorAll('input,select,textarea,button')].filter(el => !el.disabled);
    controls.forEach(el => { el.disabled = true; });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),55000);
    try {
      const response = await fetch('/api/quote-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      const result = await response.json();
      if (!response.ok || result.ok !== true || result.quoteType !== 'RENTERS' || !/^RENTERS-[0-9]{6}-[A-Z0-9]{4}$/.test(result.confirmationNumber || '')) throw new Error('Unconfirmed request');
      submitted = true;
      document.getElementById('confirmation-number').textContent = result.confirmationNumber;
      form.hidden = true; document.getElementById('form-actions').hidden = true;
      document.querySelector('.progress').hidden = true;
      document.getElementById('quote-complete').hidden = false;
      const title = document.getElementById('complete-title'); title.focus({preventScroll:true}); title.scrollIntoView({block:'start',behavior:'instant'});
      try {
        if (typeof window.gtag === 'function') {
          const detail = {form_name:'renters_quote',service_line:'renters',method:'backend_acknowledged',cta_source:payload.cta_source};
          window.gtag('event','form_submit',detail); window.gtag('event','generate_lead',detail);
        }
      } catch {}
    } catch {
      // Do not retry an uncertain POST. The agency may already have received it.
      submitted = true;
      const error = document.getElementById('submission-error'); error.hidden = false;
      error.focus({preventScroll:true}); error.scrollIntoView({block:'center',behavior:'instant'});
      next.textContent = 'Please call to confirm receipt';
      document.getElementById('next-hint').textContent = 'Your answers are preserved. Call (336) 835-1993 before resubmitting.';
    } finally {
      clearTimeout(timer); submitting = false; form.removeAttribute('aria-busy');
      controls.forEach(el => { el.disabled = false; }); back.disabled = false;
    }
  }
  next.addEventListener('click', advance);
  form.addEventListener('submit', event => { event.preventDefault(); advance(); });
  back.addEventListener('click', () => { if (editing) { editing = false; show(2); } else show(Math.max(0,step-1)); });
  form.addEventListener('input', () => { if (step === 2) renderReview(); });
  form.addEventListener('change', () => { if (step === 2) renderReview(); });
  const params = new URLSearchParams(location.search);
  if (/^\d{5}$/.test(params.get('zip') || '')) form.elements.zip_code.value = params.get('zip');
  const choices = new URL('/get-quote',location.href);
  for (const key of ['zip','src']) { const value = params.get(key); if (value && (key === 'zip' ? /^\d{5}$/ : /^[a-z0-9_-]{1,80}$/i).test(value)) choices.searchParams.set(key,value); }
  document.getElementById('coverage-link').href = choices.href;
  let handoffMissing = params.get('reenter') === '1';
  try {
    const raw = sessionStorage.getItem('bli_renters_handoff'); sessionStorage.removeItem('bli_renters_handoff');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.createdAt <= Date.now() && Date.now() - saved.createdAt < 300000 && saved.values) {
        ['firstname','lastname','date_of_birth','phone','email'].forEach(key => {
          if (typeof saved.values[key] === 'string') form.elements[key].value = saved.values[key].slice(0,180);
        });
      } else handoffMissing = true;
    }
  } catch { handoffMissing = true; }
  if (handoffMissing) {
    const note = document.createElement('p'); note.className = 'notice';
    note.textContent = 'Please enter your contact details again in Step 2. Your browser could not carry them over from the Home form.';
    steps[1].querySelector('.step-heading').append(note);
  }
  if (window.visualViewport) {
    const originalHeight = window.innerHeight;
    const keyboard = () => { const focused = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName); document.body.classList.toggle('keyboard-open', focused && originalHeight - visualViewport.height > 150); };
    visualViewport.addEventListener('resize',keyboard); document.addEventListener('focusout',() => requestAnimationFrame(keyboard));
  }
  next.disabled = false; show(0,false);
})();
