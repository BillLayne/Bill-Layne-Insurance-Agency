(() => {
  const notice=document.getElementById('renters-handoff');
  const next=document.getElementById('next-btn');
  if(!notice || !next)return;
  const original=next.innerHTML;
  const renting=()=>document.getElementById('owner-renter').checked;
  function update(){notice.hidden=!renting();next.innerHTML=renting()?'Continue to Renters Quote &#8594;':original;}
  function transfer(event){
    if(!renting())return;
    event.preventDefault();event.stopImmediatePropagation();
    const values={};
    for(const key of ['firstname','lastname','date_of_birth','phone','email'])values[key]=document.getElementById(key)?.value||'';
    let stored=true;
    try{sessionStorage.setItem('bli_renters_handoff',JSON.stringify({createdAt:Date.now(),values}));}catch{stored=false;}
    const target=new URL('/renters-quote',location.origin);
    const query=new URLSearchParams(location.search);
    for(const key of ['src','zip']){const value=query.get(key);if(value&&(key==='zip'?/^\d{5}$/:/^[a-z0-9_-]{1,80}$/i).test(value))target.searchParams.set(key,value);}
    if(!target.searchParams.has('src'))target.searchParams.set('src','home_renters_handoff');
    if(!stored)target.searchParams.set('reenter','1');
    location.href=target.href;
  }
  document.querySelectorAll('[name=is_owner]').forEach(el=>el.addEventListener('change',update));
  notice.querySelector('a').addEventListener('click',transfer);
  next.addEventListener('click',transfer,true);
  document.getElementById('home-quote-form').addEventListener('submit',transfer,true);
  update();
})();
