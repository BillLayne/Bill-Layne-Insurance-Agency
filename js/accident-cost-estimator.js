/* Illustrative one-person comparison. No network requests. */
(function(){'use strict';
const limits={min:[50000,100000,50000],'100300100':[100000,300000,100000],'250500100':[250000,500000,100000]};
const money=n=>'$'+n.toLocaleString('en-US');
function init(){const get=id=>document.getElementById(id);if(!get('ace-calculate'))return;
const fields=['ace-vehicle','ace-injury','ace-property','ace-limits'].map(get);let calculated=false;
function calculate(focus){const missing=fields.find(f=>f.value==='');if(missing){for(const id of ['ace-injury-cost','ace-property-cost','ace-gap-cost'])get(id).textContent='—';for(const id of ['ace-injury-bar','ace-property-bar'])get(id).style.width='0%';get('ace-result-heading').textContent='Complete your example';get('ace-result-note').textContent='Choose all four options to refresh the comparison.';get('ace-injury-limit').textContent='Selected per-person limit: —';get('ace-property-limit').textContent='Selected property limit: —';get('ace-limit-note').textContent='An illustrative comparison, not a coverage determination.';get('ace-cta-wrap').hidden=true;get('ace-error').textContent='Choose all four options to build your example.';missing.focus();return;}
get('ace-error').textContent='';const injury=Number(fields[1].value),property=Number(fields[0].value)+Number(fields[2].value),selected=limits[fields[3].value],unknown=!selected;
const injuryLimit=unknown?null:Math.min(selected[0],selected[1]);const gap=unknown?null:Math.max(0,injury-injuryLimit)+Math.max(0,property-selected[2]);
get('ace-result-heading').textContent=unknown?'Let’s find your actual limits':'Your illustrative comparison';
get('ace-result-note').textContent='Hypothetical damages for one injured person and other people’s property. Total: '+money(injury+property)+'.';
get('ace-injury-cost').textContent=money(injury);get('ace-property-cost').textContent=money(property);
get('ace-injury-limit').textContent=unknown?'Per-person limit unknown — check your policy':'Per-person limit: '+money(injuryLimit)+' · Per-accident limit: '+money(selected[1]);
get('ace-property-limit').textContent=unknown?'Property limit unknown — check your policy':'Shared property-damage limit: '+money(selected[2]);
get('ace-gap-cost').textContent=unknown?'Limits unknown':money(gap);
get('ace-limit-note').textContent=unknown?'We haven’t assumed limits for you. Send your declarations page for a personal review.':gap>0?'These hypothetical damages exceed the selected limits by this amount. Actual coverage and personal exposure depend on the policy and claim.':'These sample amounts do not exceed the selected limits. This does not confirm coverage or adequate protection.';
for(const [id,cost,limit] of [['ace-injury-bar',injury,injuryLimit],['ace-property-bar',property,unknown?null:selected[2]]]){get(id).style.width=unknown?'0%':Math.min(100,cost/limit*100)+'%';get(id).style.background=!unknown&&cost>limit?'#f3c54d':'#80b9de';}
get('ace-cta-wrap').hidden=false;calculated=true;
try{const payload={value:injury+property,liability_limits:fields[3].value,scenario:'one_injured_person'};if(gap!==null)payload.coverage_gap=gap;if(typeof window.bliTrackLead==='function')window.bliTrackLead('accident_cost_estimator_calculate',payload);else if(typeof window.gtag==='function')window.gtag('event','accident_cost_estimator_calculate',payload);}catch(_){/* Results survive tracking failures. */}
if(focus)get('ace-result').focus({preventScroll:false});}
get('ace-calculate').addEventListener('click',()=>calculate(true));get('ace-sample').addEventListener('click',()=>{['30000','100000','5000','min'].forEach((v,i)=>{fields[i].value=v;});calculate(true);});fields.forEach(f=>f.addEventListener('change',()=>{if(calculated)calculate(false);}));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();})();
