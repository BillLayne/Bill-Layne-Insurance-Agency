(() => {
  const form = document.querySelector('#business-form');
  const type = document.querySelector('#business-type');
  const upload = document.querySelector('#policy-upload');
  const fileInput = document.querySelector('#policy-file');
  const fileStatus = document.querySelector('#file-status');
  const remove = document.querySelector('#remove-file');
  const status = document.querySelector('#form-status');
  const submit = form.querySelector('[type=submit]');
  let busy = false, sent = false;
  const scrollTo = element => { element.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'center'}); };
  document.querySelectorAll('[data-business]').forEach(card => card.addEventListener('click', event => {
    event.preventDefault(); type.value = card.dataset.business; scrollTo(form); type.focus({preventScroll:true});
  }));
  document.querySelector('[data-review]').addEventListener('click', event => {
    event.preventDefault(); upload.open = true; form.elements.coverage.value = 'Multiple coverages / policy review'; scrollTo(upload); fileInput.focus({preventScroll:true});
  });
  function validateFile() {
    const f = fileInput.files[0]; let error = '';
    if (f && f.size > 8 * 1024 * 1024) error = 'Please choose a file no larger than 8 MB.';
    if (f && !(f.type === 'application/pdf' || /^image\//.test(f.type) || /\.(pdf|jpg|jpeg|png|heic|heif|webp)$/i.test(f.name))) error = 'Please choose a PDF or policy image.';
    if (f && !f.size) error = 'This file is empty. Please choose another file.';
    fileInput.setCustomValidity(error); fileStatus.textContent = error || (f ? 'Selected: ' + f.name : ''); remove.hidden = !f; return !error;
  }
  fileInput.addEventListener('change', validateFile);
  remove.addEventListener('click', () => {fileInput.value = ''; validateFile(); fileInput.focus();});
  const encode = f => new Promise((resolve,reject) => {const reader=new FileReader(); reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(f);});
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || sent) return;
    if (!validateFile() || !form.reportValidity()) { if(fileInput.validationMessage) upload.open=true; return; }
    busy=true;submit.disabled=true;status.textContent='Sending your request…';
    try {
      const data=new FormData(form);
      const notes=['BUSINESS INSURANCE QUOTE / REVIEW REQUEST','Business name: '+data.get('businessName'),'Business type: '+data.get('businessType'),'ZIP code: '+data.get('zip'),'Coverage needed: '+data.get('coverage'),'Preferred contact method: '+data.get('contactMethod'),'Page: /business-insurance/'].join('\n');
      const payload={formType:'policy-upload',policyType:'other',name:data.get('contactName'),phone:data.get('phone'),email:data.get('email'),notes};
      const f=fileInput.files[0]; if(f) payload.files=[{name:f.name,type:f.type,base64:await encode(f)}];
      const response=await fetch('/api/policy-upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if (!response.ok || result.ok !== true || result.formType !== 'policy-upload') throw new Error('unconfirmed');
      sent=true; status.textContent='Thank you. Your business request was received. Our team will contact you using your preferred method.';submit.textContent='Request received';
    } catch {
      status.textContent='We could not confirm delivery. Your details are still here. Please call 336-835-1993 before trying again so we can check for your request.';submit.disabled=false;
    } finally {busy=false;}
  });
})();
