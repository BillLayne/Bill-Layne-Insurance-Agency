(() => {
  'use strict';
  const form=document.getElementById('quote-form');
  if (!form) return;
  const rules=MobileHomeQuote, steps=[...form.querySelectorAll('.form-step')];
  const next=document.getElementById('next-btn'), back=document.getElementById('back-btn'), dock=document.getElementById('dock-continue');
  const errorSummary=document.getElementById('error-summary');
  const names=['About You','Your Mobile Home','Current Insurance','Coverage Preferences','Review & Send'];
  const captions=['Continue to Your Mobile Home →','Continue to Current Insurance →','Continue to Coverage →','Review My Request →','Send My Mobile Home Request →'];
  const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today=localDate(new Date());
  let step=0,editing=false,submitting=false,attempted=false,submitted=false,started=false;
  form.elements.date_of_birth.min='1900-01-01'; form.elements.date_of_birth.max=today;
  form.elements.effective_date.min=today;
  ['year_built','roof_year'].forEach(key=>form.elements[key].max=String(new Date().getFullYear()+1));
  const query=new URLSearchParams(location.search);
  const source=/^[a-z0-9_-]{1,80}$/i.test(query.get('src')||'') ? query.get('src') : 'mobile_home_quote';
  if (/^(27|28)\d{3}$/.test(query.get('zip')||'')) form.elements.zip_code.value=query.get('zip');
  // Answers stay in this page's memory; no personal data in analytics or browser storage.
  function track(event,extra={}) { try { if (typeof gtag==='function') gtag('event',event,{form_type:'mobile_home',cta_source:source,...extra}); } catch (_) {} }
  form.addEventListener('input',()=>{ if(!started){started=true;track('form_start');} });
  form.addEventListener('change',()=>{ if(!started){started=true;track('form_start');} });
  function values() {
    const fd=new FormData(form),data={form_type:'mobile_home_insurance',cta_source:source};
    Object.keys(rules.sizes).forEach(key=>{ if(key!=='cta_source') data[key]=String(fd.get(key)||''); });
    data.bundle_auto=fd.has('bundle_auto');data.confirm_accuracy=fd.has('confirm_accuracy');return data;
  }
  function conditional(key,target) {
    const input=form.elements[key],container=document.getElementById(target);
    const update=()=>{const show=input.value==='yes';container.hidden=!show;container.querySelectorAll('input,textarea,select').forEach(el=>el.disabled=!show);};
    input.addEventListener('change',update);update();
  }
  conditional('current_insurance','carrier-fields');conditional('previous_claims','claims-field');
  function clearErrors() {
    errorSummary.hidden=true;errorSummary.textContent='';
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(el=>{el.hidden=true;el.textContent='';});
  }
  function showErrors(errors,index) {
    let first=null;
    Object.entries(errors).forEach(([key,message])=>{
      const inputs=[...form.querySelectorAll(`[name="${key}"]`)];
      if (!inputs.length || (index!==undefined && !inputs.some(el=>steps[index].contains(el)))) return;
      const error=document.getElementById(`err-${key}`);
      inputs.forEach(el=>el.setAttribute('aria-invalid','true'));
      if (error){error.textContent=message;error.hidden=false;}
      first ||= inputs[0];
    });
    if (!first) return true;
    errorSummary.textContent='Please check the highlighted answers before continuing.';errorSummary.hidden=false;
    const optional=first.closest('details');if(optional)optional.open=true;
    first.focus({preventScroll:true});first.scrollIntoView({block:'center',behavior:'instant'});return false;
  }
  function valid(index) {clearErrors();return showErrors(rules.validate(values(),today,index===4).errors,index);}
  function focusHeading() {const h=steps[step].querySelector('h2');h.focus({preventScroll:true});h.scrollIntoView({block:'start',behavior:'instant'});}
  function show(index,focus=true) {
    step=index;clearErrors();steps.forEach((s,i)=>s.hidden=i!==step);
    const percent=(step+1)*20;
    document.getElementById('step-caption').textContent=`Step ${step+1} of 5 — ${names[step]}`;
    document.getElementById('progress-pct').textContent=`${percent}% done`;
    document.getElementById('progress-fill').style.width=`${percent}%`;
    document.querySelector('.progress-track').setAttribute('aria-valuenow',String(percent));
    back.hidden=step===0&&!editing;back.textContent=editing?'← Return to review':'← Back';
    next.textContent=editing?'Save & Return to Review →':captions[step];
    dock.textContent=step===4?'Review & send request →':'Continue my request →';
    if(step===4)renderReview();if(focus)focusHeading();
  }
  function renderReview() {
    const data=rules.validate(values(),today,false).data,container=document.getElementById('review-details');container.replaceChildren();
    rules.sections.forEach(([title,keys],index)=>{
      const block=document.createElement('section');block.className='review-block';
      const header=document.createElement('div');header.className='review-block-header';
      const h=document.createElement('h3');h.textContent=title;
      const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.setAttribute('aria-label',`Edit ${title.toLowerCase()}`);
      edit.addEventListener('click',()=>{editing=true;show(index);});header.append(h,edit);block.append(header);
      const dl=document.createElement('dl');keys.forEach(key=>{
        if ((key==='current_carrier'||key==='coverage_expiration')&&data.current_insurance!=='yes') return;
        if(key==='claims_details'&&data.previous_claims!=='yes')return;
        const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
        dt.textContent=rules.labels[key];dd.textContent=rules.display(key,data[key]);row.append(dt,dd);dl.append(row);
      });block.append(dl);container.append(block);
    });
  }
  back.addEventListener('click',()=>{if(attempted)return;if(editing){editing=false;show(4);}else show(Math.max(0,step-1));});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(submitting||attempted||submitted)return;
    if(!valid(step))return;
    if(editing){editing=false;show(4);return;}
    if(step<4){show(step+1);return;}
    const checked=rules.validate(values(),localDate(new Date()),true);
    if(Object.keys(checked.errors).length){
      const firstKey=Object.keys(checked.errors)[0],el=form.querySelector(`[name="${firstKey}"]`);
      if(el){show(steps.findIndex(s=>s.contains(el)),false);showErrors(checked.errors,step);}return;
    }
    const payload=checked.data;
    // One network attempt only. A lost response may follow a successful save.
    attempted=true;submitting=true;next.disabled=true;back.disabled=true;next.textContent='Sending your request…';
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),55000);
    try {
      const response=await fetch('/api/quote-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      const result=await response.json();
      if(!response.ok||result.ok!==true||result.quoteType!=='MOBILE_HOME'||!/^MOBILE_HOME-\d{6}-[A-Z0-9]{4}$/.test(result.confirmationNumber||''))throw new Error('Unconfirmed receipt');
      submitted=true;form.hidden=true;document.querySelector('.progress-header').hidden=true;
      const receipt=document.getElementById('receipt');receipt.hidden=false;
      document.getElementById('confirmation-number').textContent=result.confirmationNumber;
      const heading=document.getElementById('receipt-heading');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});
      dock.textContent='Request received ✓';dock.disabled=true;
      track('generate_lead',{method:'backend_acknowledged'});
    } catch (_) {
      errorSummary.replaceChildren(document.createTextNode('We could not confirm your request. It may already have arrived. Your answers are still here. Please '));
      const call=document.createElement('a');call.href='tel:3368351993';call.textContent='call us at 336-835-1993 before submitting again';errorSummary.append(call,document.createTextNode('.'));
      errorSummary.hidden=false;errorSummary.tabIndex=-1;errorSummary.focus({preventScroll:true});errorSummary.scrollIntoView({block:'center',behavior:'instant'});
      next.textContent='Call us to confirm your request';next.disabled=true;dock.textContent='Call us to confirm';track('form_error',{error_type:'unconfirmed'});
    } finally {clearTimeout(timeout);submitting=false;}
  });
  dock.addEventListener('click',()=>{
    if(attempted&&!submitted){location.href='tel:3368351993';return;}
    if(submitted)return;
    const rect=document.getElementById('form-card').getBoundingClientRect();
    if(rect.top>innerHeight||rect.bottom<100){focusHeading();return;}
    if(step===4){focusHeading();return;} // Let the customer review before sending.
    form.requestSubmit();
  });
  const observer=new IntersectionObserver(entries=>{document.querySelector('.mobile-dock').classList.toggle('is-visible',!entries[0].isIntersecting&&entries[0].boundingClientRect.bottom<0);});
  observer.observe(document.querySelector('.quote-hero'));show(0,false);
})();
