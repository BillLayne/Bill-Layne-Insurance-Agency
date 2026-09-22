'use strict';
const logForm = document.querySelector('#improvement-form');
const contactsForm = document.querySelector('#contacts-form');
const entriesNode = document.querySelector('#entries');
const report = document.querySelector('#print-report');
const logFields = {work:160,date:10,contractor:160,receipt:240,notes:1000};
const contactFields = {household:120,address:240,carrier:120,claims:80,contact:120,phone:80,utility:120,utilityPhone:80,meeting:240,documents:240,notes:1500};
const labels = {work:'Work completed',date:'Date completed',contractor:'Contractor',receipt:'Receipt or warranty location',notes:'Notes',household:'Household',address:'Home address',carrier:'Insurance company',claims:'Claims phone',contact:'Trusted contact',phone:'Trusted contact phone',utility:'Utility provider',utilityPhone:'Utility emergency phone',meeting:'Meeting place',documents:'Important document location'};
let entries = [], editing = -1, dirty = false;
const node = (tag,text) => { const el=document.createElement(tag); el.textContent=text; return el; };
const values = form => Object.fromEntries(new FormData(form));
const hasDraft = () => Object.values(values(logForm)).some(Boolean);
function resetEdit() { editing=-1;logForm.reset();document.querySelector('#save-entry').textContent='Add improvement';document.querySelector('#cancel-edit').hidden=true; }
function render() {
 entriesNode.replaceChildren();
 entries.forEach((entry,index)=>{
  const card=node('article','');card.append(node('h3',entry.work));
  for(const key of Object.keys(logFields).filter(k=>k!=='work')) card.append(node('p',`${labels[key]}: ${entry[key] || 'Not provided'}`));
  const edit=node('button','Edit');edit.type='button';edit.className='button secondary';edit.setAttribute('aria-label',`Edit ${entry.work}`);
  edit.addEventListener('click',()=>{if(hasDraft()&&!confirm('Replace the improvement currently in the form?'))return;editing=index;for(const key of Object.keys(logFields))logForm.elements[key].value=entry[key];document.querySelector('#save-entry').textContent='Save changes';document.querySelector('#cancel-edit').hidden=false;logForm.elements.work.focus();});
  const remove=node('button','Remove');remove.type='button';remove.className='button secondary';remove.setAttribute('aria-label',`Remove ${entry.work}`);
  remove.addEventListener('click',()=>{if(!confirm('Remove this improvement from the current log?'))return;entries.splice(index,1);if(editing===index)resetEdit();else if(editing>index)editing--;dirty=true;render();document.querySelector('#entry-status').focus();});
  card.append(edit,remove);entriesNode.append(card);
 });
 document.querySelector('#entry-status').textContent=entries.length?`${entries.length} improvement${entries.length===1?'':'s'} in your log.`:'No improvements added yet.';
 document.querySelector('#entry-status').tabIndex=-1;
 document.querySelector('#print-log').disabled=!entries.length;
}
logForm.addEventListener('submit',event=>{event.preventDefault();if(!logForm.reportValidity())return;const entry=values(logForm);entry.work=entry.work.trim();if(!entry.work){logForm.elements.work.focus();return;}if(editing<0&&entries.length>=100){alert('This log supports up to 100 improvements. Save a backup before starting another log.');return;}if(editing<0)entries.push(entry);else entries[editing]=entry;dirty=true;resetEdit();render();document.querySelector('#entry-status').focus();});
document.querySelector('#cancel-edit').addEventListener('click',resetEdit);
contactsForm.addEventListener('submit',e=>e.preventDefault());
contactsForm.addEventListener('input',()=>{dirty=true;});logForm.addEventListener('input',()=>{dirty=true;});
function reportHeader(title) {report.replaceChildren(node('h1',title),node('p','Bill Layne Insurance Agency · (336) 835-1993'));}
function addReportFields(data,fields) {for(const key of Object.keys(fields))report.append(node('p',`${labels[key]}: ${data[key]||'Not provided'}`));}
document.querySelector('#print-log').addEventListener('click',()=>{if(hasDraft()){alert('Add or save the improvement in the form before printing.');return;}reportHeader('My Home Improvement Log');entries.forEach((entry,i)=>{report.append(node('h2',`${i+1}. ${entry.work}`));addReportFields(entry,logFields);});report.append(node('p','This record does not notify the agency, change coverage or guarantee a discount.'));window.print();});
document.querySelector('#print-contacts').addEventListener('click',()=>{reportHeader('My Emergency Contact Packet');report.append(node('h2','Immediate emergency: Call 911'),node('p','Agency questions: (336) 835-1993. Contact your insurance company using your verified claims number below.'));addReportFields(values(contactsForm),contactFields);window.print();});
document.querySelector('#download-records').addEventListener('click',()=>{
 if(hasDraft()){alert('Add or save the improvement in the form before saving a backup.');return;}
 const data={version:1,entries,contacts:values(contactsForm)};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=node('a','');a.href=url;a.download='bill-layne-home-records.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);dirty=false;document.querySelector('#backup-status').textContent='Backup download requested. Check your Downloads folder and keep the file somewhere private.';
});
function cleanObject(obj,fields) {if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error();const clean={};for(const [key,max]of Object.entries(fields)){if(typeof obj[key]!=='string'||obj[key].length>max)throw Error();clean[key]=obj[key];}return clean;}
document.querySelector('#restore-records').addEventListener('change',async event=>{
 const input=event.target,file=input.files[0];if(!file)return;
 try {if(file.size>500000)throw Error();const data=JSON.parse(await file.text());if(data.version!==1||!Array.isArray(data.entries)||data.entries.length>100)throw Error();const restored=data.entries.map(entry=>{const clean=cleanObject(entry,logFields);if(!clean.work.trim()||(clean.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(clean.date)||!Number.isFinite(Date.parse(clean.date))||new Date(clean.date).toISOString().slice(0,10)!==clean.date)))throw Error();return clean;});const contacts=cleanObject(data.contacts,contactFields);
 if((entries.length||hasDraft()||Object.values(values(contactsForm)).some(Boolean))&&!confirm('Replace the records on this page with this backup?'))return;
 entries=restored;for(const key of Object.keys(contactFields))contactsForm.elements[key].value=contacts[key];resetEdit();dirty=false;render();document.querySelector('#backup-status').textContent='Backup opened. Your records are ready to edit.';
 }catch{document.querySelector('#backup-status').textContent='This file is not a valid toolkit backup. Your current records have not changed.';}finally{input.value='';}
});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
render();
