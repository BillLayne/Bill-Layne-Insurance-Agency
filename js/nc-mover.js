/* Device-local moving checklist. No personal information is collected by this tool. */
(() => {
  'use strict';
  const KEY = 'bli_nc_mover_plan_v1';
  const REVIEWED = 'October 15, 2026';
  const QUOTE = 'https://www.billlayneinsurance.com/get-quote?src=tool_nc_mover';
  const OFFICIAL = [
    ['New-resident requirements', 'https://www.ncdot.gov/dmv/help/moving/Pages/new-residents.aspx'],
    ['Driver-license insurance proof', 'https://www.ncdot.gov/dmv/help/Pages/proving-insurance.aspx'],
    ['Vehicle insurance / FS-1', 'https://www.ncdot.gov/dmv/title-registration/insurance-requirements/Pages/default.aspx'],
    ['REAL ID documents', 'https://www.ncdot.gov/dmv/license-id/nc-real-id/Pages/requirements.aspx']
  ];
  const COUNTIES = new Map([['surry','Surry County'],['wilkes','Wilkes County'],['yadkin','Yadkin County'],['alleghany','Alleghany County'],['forsyth','Forsyth County'],['statewide','Statewide North Carolina']]);
  const GROUPS = ['Start before your move', 'Get your DMV documents ready', 'Complete your NC transition'];
  const $ = (id) => document.getElementById(id);
  const form = $('mv-builder-form');
  if (!form) return;
  const create = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  const task = (id, title, hint, group, detail, source) => ({ id, title, hint, group, detail, source });
  function tasks(a) {
    const car = a.car === 'yes', buyer = a.housing === 'buying';
    const list = [
      task('license-documents','Gather license and residency documents','Choose documents from the current NCDMV list.',1,'Organize identity, Social Security, NC address and any applicable lawful-status or name-change documents. The REAL ID route calls for two residency documents. Check the official list for your application.',3),
      task('insurance-proof','Confirm your insurance documentation','Ask which proof fits your license visit.',1,car ? 'Ask your NC-licensed insurer for acceptable liability-insurance proof in your name. DL-123 is one option; NCDMV also lists policies, cards and binders. FS-1 has a different vehicle-verification purpose.' : 'Tell NCDMV whether you own or drive a vehicle, including someone else’s car. Insurance-proof requirements depend on your circumstances. Ask our agency about suitable documentation; do not assume DL-123 and FS-1 are both required.',1),
      task('license-transfer','Complete your NC driver-license transition','If you plan to drive, check the 60-day deadline.',2,'New residents who plan to drive need an NC license within 60 days of establishing permanent residence. Confirm your application requirements and visit arrangements directly with NCDMV.',0),
      task('coverage-confirm','Confirm your new policies are active','Keep your dates and insurance documents together.',2,'Check the effective dates, insured people and property, and the documents issued by your insurer. '+(buyer ? 'Coordinate with your closing and lender.' : 'Coordinate with your lease start date.')+(car ? ' Confirm the NC auto policy is in place for the vehicle transition.' : ' If your driving or vehicle situation changes, ask our agency what to update.'))
    ];
    if (car) list.push(
      task('auto-insurance','Arrange NC auto insurance','Coordinate coverage with your move.',0,'Review vehicles, household drivers, garaging address and the NC policy start date with your agent. Keep continuous coverage during the move; NC vehicle registration requires insurance from an NC-licensed insurer.',2),
      task('vehicle-records','Gather title, registration and lender details','Check what applies to your vehicle.',1,'Organize your vehicle title or current registration if a lender holds the title, along with lender information. Use NCDMV’s current title and registration checklist for additional forms and proof.',0),
      task('vehicle-registration','Complete NC title and registration requirements','Registration can be due sooner than 60 days.',2,'NCDMV’s guidance ties registration timing to gainful employment or the end of the prior-state reciprocity period, whichever comes first. Confirm the deadline for your situation instead of waiting until day 60.',0),
      task('old-state','Coordinate your old-state plates and policy','Avoid a gap while changing states.',2,'Ask your prior state about its plate-return and registration rules. Coordinate the old policy’s cancellation with your agent after the new policy is active and the prior state’s requirements are satisfied. Do not assume every state follows the same sequence.')
    );
    else list.push(task('license-without-car','Review your license needs without a car','Your driving plans still matter.',0,'Not bringing a car does not answer every license or insurance question. Check NCDMV’s instructions for your situation, including whether you will drive another person’s vehicle. Call Bill Layne Insurance at 336-835-1993 for help with insurance questions.',1));
    if (buyer) list.push(
      task('home-cover','Arrange homeowners coverage for closing','Review your property and effective date.',0,'Share the property details and closing date with your agent. Review the proposed policy and confirm when coverage will begin; a quote alone does not start coverage.'),
      task('lender','Confirm your lender’s insurance requirements','Have lender and loan details ready.',0,'Ask your lender what evidence of insurance and mortgagee wording it needs. Share those instructions with the agency before closing.'),
      task('wind-roof','Review wind/hail deductibles and roof terms','Understand the policy’s settlement provisions.',0,'Ask whether wind/hail is included or excluded, which deductible applies, and whether your roof is settled at replacement cost or actual cash value. Review roof age, materials and condition against the proposed policy.'),
      task('optional-home','Ask about optional home protections','Review what is available and what is excluded.',0,'Discuss water backup, service line and other available options. Ask about flood needs separately. Availability, eligibility and the exact terms depend on the property and policy.'),
      task('bundle-home','Compare auto + home options','Review the coverage as well as the price.',0,car ? 'Ask our agency to compare available auto and home choices, including eligible combined or separate policies. Confirm limits, deductibles and effective dates; savings are not guaranteed.' : 'If you also need auto insurance, ask about available auto and home choices. Review eligible combined and separate policies without assuming a bundle is required or available.')
    );
    else list.push(
      task('renters-cover','Arrange renters coverage for move-in','Coordinate with your lease start date.',0,'Share the rental address and lease start date with your agent. Review the policy and confirm the effective date before relying on coverage.'),
      task('renters-limits','Review belongings and liability limits','Choose coverage for your needs.',0,'Review the value of your belongings, the deductible, personal-liability limits and the policy’s loss-of-use provisions. Ask how your belongings would be valued after a covered loss.'),
      task('lease','Confirm landlord insurance requirements','Read the insurance terms in your lease.',0,'Ask the landlord what limits and evidence of insurance it requires. Share the written requirements with your agent; review what your own renters policy will cover.'),
      task('bundle-renters','Compare auto + renters options','Ask about available combined or separate choices.',0,car ? 'Compare available auto and renters options with our agency. Review coverage and deductibles alongside any eligible combination; availability and savings vary.' : 'If you need auto insurance as well, ask about available auto and renters options. Renting a home does not automatically mean you need an auto policy.')
    );
    return list.sort((x,y) => x.group-y.group);
  }
  const ALL_IDS = new Set(['yes','no'].flatMap(car => ['buying','renting'].flatMap(housing => tasks({car,housing}).map(t => t.id))));
  const blank = () => ({ answers:{car:'',housing:'',county:''}, plan:null, completed:[], generatedAt:null });
  let state = blank(), completed = new Set(), started = false;
  const valid = a => a && ['yes','no'].includes(a.car) && ['buying','renting'].includes(a.housing) && COUNTIES.has(a.county);
  const clean = a => ({car:['yes','no'].includes(a?.car)?a.car:'',housing:['buying','renting'].includes(a?.housing)?a.housing:'',county:COUNTIES.has(a?.county)?a.county:''});
  const track = (event, extra={}) => { if (typeof window.bliTrackConversion === 'function') window.bliTrackConversion(event,{event_category:'tool',cta_source:'tool_nc_mover',tool_name:'nc_mover',...extra}); };
  function storageNotice() { $('mv-storage-notice').hidden = false; }
  function save() { try { localStorage.setItem(KEY,JSON.stringify({version:1,...state,completed:[...completed]})); } catch (_) { storageNotice(); } }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw && raw.length < 20000) {
      const saved = JSON.parse(raw);
      if (saved.version===1) {
        state.answers=clean(saved.answers); state.plan=valid(saved.plan)?clean(saved.plan):null;
        completed=new Set(Array.isArray(saved.completed)?saved.completed.filter(id=>ALL_IDS.has(id)):[]);
        state.generatedAt=typeof saved.generatedAt==='string'&&!Number.isNaN(Date.parse(saved.generatedAt))?saved.generatedAt:null;
      }
    }
  } catch (_) { /* An unavailable or invalid save never prevents use of the planner. */ }
  function setControls() {
    form.reset(); for (const key of ['car','housing']) { const input=form.querySelector(`input[name="${key}"][value="${state.answers[key]}"]`); if(input) input.checked=true; }
    $('mv-county').value=state.answers.county;
  }
  const summary = a => `${a.car==='yes'?'Car':'No car coming'} + ${a.housing==='buying'?'Homeowner':'Renter'} · ${COUNTIES.get(a.county)}`;
  function selectionSummary() {
    $('mv-selection-summary').textContent=valid(state.answers)?'Your plan: '+summary(state.answers):'Choose all three answers to build your plan.';
  }
  function announce(text) { $('mv-status').textContent=text; }
  function moveTo(element) { element.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); element.focus({preventScroll:true}); }
  function sourceLink(index) { const a=create('a',null,'Official NCDMV guidance');a.href=OFFICIAL[index][1];a.target='_blank';a.rel='noopener noreferrer';return a; }
  function renderTasks() {
    const frag=document.createDocumentFragment(), list=tasks(state.plan);
    GROUPS.forEach((name,group) => {
      const section=create('section','mv-task-group');const heading=create('h3',null,name);section.append(heading);
      list.filter(t=>t.group===group).forEach(t=>{
        const row=create('div','mv-task'+(completed.has(t.id)?' is-complete':''));row.dataset.taskId=t.id;
        const label=create('label','mv-check');label.htmlFor='mv-task-'+t.id;const box=create('input');box.type='checkbox';box.id='mv-task-'+t.id;box.dataset.task=t.id;box.checked=completed.has(t.id);box.className='mv-task-checkbox';label.append(box,create('span','mv-sr','Mark '+t.title+' complete'));
        const details=create('details'), toggle=create('summary');const copy=create('span','mv-task-copy');copy.append(create('strong',null,t.title),create('span','mv-task-hint',t.hint));toggle.append(copy,create('span','mv-chevron','›'));const body=create('div','mv-task-detail');body.append(create('p',null,t.detail));if(t.source!==undefined)body.append(sourceLink(t.source));details.append(toggle,body);row.append(label,details);section.append(row);
      });frag.append(section);
    });$('mv-tasks').replaceChildren(frag);
  }
  function progress() {
    if(!state.plan)return;const list=tasks(state.plan), done=list.filter(t=>completed.has(t.id)).length;
    $('mv-progress-text').textContent=`${done} of ${list.length} complete`;$('mv-progress').max=list.length;$('mv-progress').value=done;
    $('mv-mini-summary').textContent=`${done} of ${list.length} steps complete`;
  }
  function renderPrint() {
    if(!state.plan)return;const out=document.createDocumentFragment(), a=state.plan;
    out.append(create('p','mv-print-agency','BILL LAYNE INSURANCE AGENCY'),create('h1',null,'New-to-NC 60-Day Action Plan'),create('p','mv-print-summary',summary(a)),create('p',null,'1283 N Bridge St, Elkin, NC 28621 · 336-835-1993 · Save@BillLayneInsurance.com'));
    const generated=new Date(state.generatedAt||Date.now()).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});out.append(create('p','mv-print-date',`Date generated: ${generated} · Content reviewed: ${REVIEWED}`));
    const list=tasks(a),done=list.filter(t=>completed.has(t.id)).length;out.append(create('p',null,`${done} of ${list.length} tasks complete`));
    GROUPS.forEach((name,group)=>{
      const section=create('section','mv-print-group');section.append(create('h2',null,name));list.filter(t=>t.group===group).forEach(t=>{const item=create('article','mv-print-task');const heading=create('h3');heading.append(create('span','mv-print-check',completed.has(t.id)?'✓':''),document.createTextNode(t.title));item.append(heading,create('p',null,t.detail));section.append(item)});out.append(section);
    });
    const guidance=create('section','mv-print-guidance');guidance.append(create('h2',null,'Timing and documents'),create('p',null,'If you plan to drive, obtain an NC driver license within 60 days of establishing permanent residence. Registration can be due sooner based on employment or prior-state reciprocity. Verify the timing directly with NCDMV.'),create('p',null,'DL-123: one accepted form of driver-license liability-insurance proof. FS-1: vehicle-insurance verification submitted by an insurer when required. Not interchangeable; you may not need both.'));out.append(guidance);
    const sources=create('section','mv-print-sources');sources.append(create('h2',null,'Official NCDMV resources'));OFFICIAL.forEach(([label,url])=>{const p=create('p');p.append(create('strong',null,label+': '),document.createTextNode(url));sources.append(p)});out.append(sources,create('p','mv-print-quote','Request an insurance quote: '+QUOTE),create('p','mv-print-disclaimer','Independent insurance agency. Not affiliated with NCDMV. Requirements and insurance availability vary by situation.'));$('mv-print').replaceChildren(out);
  }
  function renderPlan() {
    $('mv-results').hidden=false;$('mv-plan-summary').textContent=summary(state.plan);$('mv-mini-county').textContent=COUNTIES.get(state.plan.county);
    $('mv-county-heading').textContent=state.plan.county==='statewide'?'Moving to North Carolina?':'Moving to '+COUNTIES.get(state.plan.county)+'?';
    $('mv-county-copy').textContent=`Get help organizing your NC auto and ${state.plan.housing==='buying'?'homeowners':'renters'} insurance with Bill Layne Insurance Agency in Elkin. We help people across North Carolina.`;
    renderTasks();progress();renderPrint();
  }
  setControls();selectionSummary();if(state.plan)renderPlan();
  form.addEventListener('change',()=>{
    state.answers={car:form.querySelector('input[name="car"]:checked')?.value||'',housing:form.querySelector('input[name="housing"]:checked')?.value||'',county:$('mv-county').value};state.answers=clean(state.answers);
    $('mv-error').hidden=true;selectionSummary();save();if(!started){started=true;track('mover_checklist_started');}
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!valid(state.answers)){
      const missing=[];if(!state.answers.car)missing.push('whether you are bringing a car');if(!state.answers.housing)missing.push('buying or renting');if(!state.answers.county)missing.push('your NC county');
      $('mv-error').textContent='Please choose '+missing.join(', ')+'.';$('mv-error').hidden=false;
      (state.answers.car?(state.answers.housing?$('mv-county'):form.querySelector('input[name="housing"]')):form.querySelector('input[name="car"]')).focus();return;
    }
    state.plan={...state.answers};state.generatedAt=new Date().toISOString();renderPlan();save();track('mover_checklist_generated');announce('Your personalized checklist is ready. '+$('mv-progress-text').textContent+'.');moveTo($('mv-plan-heading'));
  });
  $('mv-tasks').addEventListener('change',event=>{
    const box=event.target;if(!box.matches('.mv-task-checkbox')||!ALL_IDS.has(box.dataset.task))return;
    if(box.checked)completed.add(box.dataset.task);else completed.delete(box.dataset.task);
    box.closest('.mv-task').classList.toggle('is-complete',box.checked);progress();renderPrint();save();announce($('mv-progress-text').textContent+'.');if(box.checked)track('mover_task_completed',{task_id:box.dataset.task});
  });
  $('mv-print-button').addEventListener('click',()=>{renderPrint();track('mover_print_selected');window.print();});
  $('mv-reset').addEventListener('click',()=>{
    if(!window.confirm('Reset your saved answers and all completed tasks on this device?'))return;
    state=blank();completed.clear();started=false;try{localStorage.removeItem(KEY)}catch(_){storageNotice()}
    setControls();selectionSummary();$('mv-results').hidden=true;$('mv-error').hidden=true;$('mv-print').replaceChildren(create('h1',null,'New-to-NC 60-Day Action Plan'),create('p',null,'Build your personalized plan on this page before printing.'));announce('Your plan has been reset.');moveTo($('mv-builder-heading'));
  });
  document.querySelectorAll('a[href="#mv-builder"]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();moveTo($('mv-builder-heading'));}));
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{const entry=entries[0];$('mv-mobile-bar').hidden=entry.isIntersecting||entry.boundingClientRect.bottom>0;},{threshold:0}).observe($('mv-hero'));
})();
