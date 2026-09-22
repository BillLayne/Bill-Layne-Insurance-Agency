// Email one-time-code sign-in. All secrets and approved addresses are server-side.
const ROOT = '/clients/toolkit';
const COOKIE = '__Secure-bli_toolkit_email';
const CHALLENGE = '__Secure-bli_toolkit_challenge';
const encoder = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');
const digest = async text => hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));
const equal = (a,b) => {if(a.length!==b.length)return false;let difference=0;for(let i=0;i<a.length;i++)difference|=a.charCodeAt(i)^b.charCodeAt(i);return difference===0;};
async function sign(value,secret) {const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));}
const flags=`Path=${ROOT}; HttpOnly; Secure; SameSite=Strict`;
const escape = value => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function protect(response) {const result=new Response(response.body,response);result.headers.set('Cache-Control','private, no-store');result.headers.set('X-Robots-Tag','noindex, nofollow');result.headers.set('Referrer-Policy','same-origin');result.headers.set('X-Content-Type-Options','nosniff');result.headers.set('X-Frame-Options','DENY');return result;}
function redirect(path,cookies=[]) {const headers=new Headers({Location:path});for(const cookie of cookies)headers.append('Set-Cookie',cookie);return protect(new Response(null,{status:303,headers}));}
const readCookie=(request,name)=>(request.headers.get('Cookie')||'').split(';').map(p=>p.trim()).find(p=>p.startsWith(name+'='))?.slice(name.length+1)||'';
async function token(payload,secret){return payload+'.'+await sign(payload,secret);}
async function verified(value,secret){const parts=value.split('.');if(parts.length!==5)return null;const signature=parts.pop(),payload=parts.join('.');if(!/^[a-f0-9]{64}$/.test(signature)||!equal(signature,await sign(payload,secret)))return null;return parts;}
function page({message='',status=200,verify=false,local=false}={}) {
 const form=verify?`<h1>Check your email.</h1><p>If your address is approved, a six-digit code is on its way. It expires in 10 minutes. Check your spam folder too.</p><form method="post" action="${ROOT}/access"><input type="hidden" name="action" value="verify"><label for="code">Six-digit sign-in code</label><input id="code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required autofocus><button type="submit">Open my toolkit</button></form><p><a href="${ROOT}/access?restart=1">Use a different email or request a new code</a></p><small>Wait at least one minute before requesting another code. Only the newest code works.</small>`:`<h1>Your email.<br>Your client toolkit.</h1><p>Enter the email address you have on file with our agency. We’ll email you a temporary code—no password to remember.</p><form method="post" action="${ROOT}/access"><input type="hidden" name="action" value="request"><label for="email">Your email address</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required><label class="remember"><input name="remember" type="checkbox" value="yes"><span>Remember this device for 30 days<small>Use this only on your own phone or computer.</small></span></label><button type="submit">Email my sign-in code</button></form><small>Without this option, your sign-in lasts up to 8 hours. Sign out on shared devices.</small>`;
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Client Toolkit Sign In | Bill Layne Insurance</title><style>body{margin:0;background:#f0f6f9;color:#102e47;font:16px/1.6 system-ui,sans-serif}main{max-width:440px;margin:6vh auto;padding:30px;background:white;border:1px solid #d8e4eb;border-radius:18px}h1{font-size:32px;line-height:1.15}label{display:block;font-weight:600}input:not([type=checkbox]),button{box-sizing:border-box;width:100%;padding:14px;font:inherit;border-radius:8px;margin:10px 0;border:1px solid #98aebe}button{background:#102e47;color:white;cursor:pointer}a{color:#087e79}small{display:block;color:#526679;font-size:12px}input:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #137eb6;outline-offset:3px}.message{color:#9a2929}.remember{display:flex;gap:12px;align-items:flex-start;font-size:14px;margin:14px 0}.remember input{width:20px;height:20px;flex-shrink:0}.remember small{font-weight:400}.preview{background:#e9f4f2;padding:12px;border-radius:8px;font-size:13px}@media(max-width:520px){main{margin:24px 16px;padding:24px}}</style></head><body><main><p>Bill Layne Insurance · Client Benefits</p>${local?'<p class="preview">Local test only. No email is sent. <a href="http://127.0.0.1:8098/inbox" target="_blank" rel="noopener noreferrer">Open the test inbox</a> after requesting your code.</p>':''}${message?`<p class="message" role="alert">${escape(message)}</p>`:''}${form}<p>Need help? <a href="tel:3368351993">Call (336) 835-1993</a>.</p><a href="/clients/">Payments, ID cards and claims help →</a></main></body></html>`;
 return protect(new Response(html,{status,headers:{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}}));
}
function newCode(){let value;do{value=crypto.getRandomValues(new Uint32Array(1))[0];}while(value>=4294000000);return String(value%1000000).padStart(6,'0');}
export async function onRequest(context) {
 const {request,env}=context,url=new URL(request.url);let emails,authURL,local=false;
 try {emails=JSON.parse(env.CLIENT_TOOLKIT_APPROVED_EMAILS||'null');authURL=new URL(env.CLIENT_TOOLKIT_AUTH_URL);local=['127.0.0.1','localhost'].includes(url.hostname)&&authURL.hostname==='127.0.0.1'&&authURL.port==='8098';if(!Array.isArray(emails)||!emails.length||emails.some(e=>typeof e!=='string'||e.length>254||e!==e.trim().toLowerCase()||!/^\S+@\S+\.\S+$/.test(e))||typeof env.CLIENT_TOOLKIT_SESSION_SECRET!=='string'||env.CLIENT_TOOLKIT_SESSION_SECRET.length<32||typeof env.CLIENT_TOOLKIT_AUTH_SECRET!=='string'||env.CLIENT_TOOLKIT_AUTH_SECRET.length<32||(!local&&(authURL.protocol!=='https:'||authURL.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(authURL.pathname))))throw Error();}
 catch{return page({message:'Client sign-in is not ready yet. Please call our team for help.',status:503});}
 const secret=env.CLIENT_TOOLKIT_SESSION_SECRET,now=Math.floor(Date.now()/1000),hashes=await Promise.all(emails.map(digest));
 const atAccess=/^\/clients\/toolkit\/access\/?$/.test(url.pathname),atLogout=/^\/clients\/toolkit\/logout\/?$/.test(url.pathname);
 const challenge=await verified(readCookie(request,CHALLENGE),secret);
 const validChallenge=challenge&&/^[a-f0-9]{32}$/.test(challenge[0])&&/^[a-f0-9]{64}$/.test(challenge[1])&&Number(challenge[2])>now&&Number(challenge[2])<=now+600&&['0','1'].includes(challenge[3]);
 const show=(message='',status=200,verify=!!validChallenge)=>page({message,status,verify,local});
 if(atLogout){if(request.method!=='POST'||request.headers.get('Origin')!==url.origin)return show('Please use the sign-out button.',403);return redirect(ROOT+'/access',[`${COOKIE}=; ${flags}; Max-Age=0`,`${CHALLENGE}=; ${flags}; Max-Age=0`,`__Secure-bli_toolkit=; ${flags}; Max-Age=0`]);}
 if(atAccess&&request.method==='GET'){if(url.searchParams.has('restart'))return redirect(ROOT+'/access',[`${CHALLENGE}=; ${flags}; Max-Age=0`]);return show();}
 if(atAccess&&request.method==='POST') {
  if(request.headers.get('Origin')!==url.origin)return show('Please reopen this page and try again.',403);
  if(!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded'))return show('Please use the sign-in form.',415);
  if(Number(request.headers.get('Content-Length')||0)>2048)return show('Please check your entry.',413);
  const raw=await request.text();if(raw.length>2048)return show('Please check your entry.',413);const form=new URLSearchParams(raw);
  const ipHash=await sign('ip|'+(request.headers.get('CF-Connecting-IP')||'unknown'),env.CLIENT_TOOLKIT_AUTH_SECRET);
  async function service(data){
   // Apps Script serves ContentService replies through a separate GET URL.
   // Never resend the state-changing POST or forward its secret to a redirect.
   const signal=AbortSignal.timeout(45000);
   let res=await fetch(authURL.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,ipHash,secret:env.CLIENT_TOOLKIT_AUTH_SECRET}),redirect:'manual',signal});
   if([301,302,303].includes(res.status)){
    const target=new URL(res.headers.get('Location'));
    if(target.protocol!=='https:'||target.hostname!=='script.googleusercontent.com')throw Error();
    await res.body?.cancel();
    res=await fetch(target.href,{method:'GET',redirect:'error',signal});
   }
   if(!res.ok)throw Error();const result=await res.json();if(!result||typeof result.ok!=='boolean')throw Error();return result;
  }
  try {
   if(form.get('action')==='request') {
    const email=(form.get('email')||'').trim().toLowerCase();if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))return show('Enter a valid email address.',400,false);
    const emailHash=await digest(email),id=hex(crypto.getRandomValues(new Uint8Array(16))),code=newCode(),codeHash=await sign(`${id}|${emailHash}|${code}`,env.CLIENT_TOOLKIT_AUTH_SECRET);
    const result=await service({action:'issue',id,email,emailHash,code,codeHash,approved:emails.includes(email)});
    if(!result.ok)return show(['limited','cooldown'].includes(result.reason)?'Please wait before requesting another code. Try again later or call our team.':'Email sign-in is temporarily unavailable. Please try again later.',result.reason==='limited'||result.reason==='cooldown'?429:503,false);
    const value=await token(`${id}.${emailHash}.${now+600}.${form.get('remember')==='yes'?'1':'0'}`,secret);
    return redirect(ROOT+'/access',[`${CHALLENGE}=${value}; ${flags}; Max-Age=600`]);
   }
   if(form.get('action')==='verify') {
    if(!validChallenge)return show('Your sign-in request expired. Request a new code.',401,false);
    const code=(form.get('code')||'').trim();
    // Even malformed codes consume an attempt rather than bypassing the limit.
    const codeHash=await sign(`${challenge[0]}|${challenge[1]}|${/^\d{6}$/.test(code)?code:'invalid'}`,env.CLIENT_TOOLKIT_AUTH_SECRET);
    const result=await service({action:'verify',id:challenge[0],emailHash:challenge[1],codeHash});
    if(!result.ok)return show(result.reason==='limited'?'Too many attempts. Please try again later.':'Sign-in is temporarily unavailable. Please try again later.',result.reason==='limited'?429:503);
    if(!result.verified||!hashes.includes(challenge[1]))return show('That code is incorrect, expired or already used. Try again or request a new code.',401);
    const remember=challenge[3]==='1',ttl=remember?30*86400:8*3600;
    const session=await token(`${challenge[1]}.${now}.${now+ttl}.${remember?'1':'0'}`,secret);
    return redirect(ROOT+'/',[`${COOKIE}=${session}; ${flags}${remember?`; Max-Age=${ttl}`:''}`,`${CHALLENGE}=; ${flags}; Max-Age=0`,`__Secure-bli_toolkit=; ${flags}; Max-Age=0`]);
   }
   return show('Please use the sign-in form.',400);
  }catch{return show('Sign-in is temporarily unavailable. Please try again later.',503);}
 }
 if(atAccess)return show('Please use the sign-in form.',405);
 if(!['GET','HEAD'].includes(request.method))return show('This request is not supported.',405);
 const session=await verified(readCookie(request,COOKIE),secret);
 if(!session||!hashes.includes(session[0])||!['0','1'].includes(session[3])||!/^\d{10}$/.test(session[1])||!/^\d{10}$/.test(session[2])||Number(session[1])>now||Number(session[2])<=now||Number(session[2])-Number(session[1])!==(session[3]==='1'?30*86400:8*3600))return redirect(ROOT+'/access');
 return protect(await context.next());
}
