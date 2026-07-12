/**
 * BLI Mail Gateway — drop-in client for any BLI tool.
 *
 * Paste this file's contents into a <script> tag (or include the file) in any
 * template app, then call bliMail(...) from a "Draft in Gmail" button.
 *
 * The gateway URL + secret are asked for ONCE per browser/app and stored in
 * that app's localStorage. Never hardcode the secret into a page or an email.
 *
 * Example wiring:
 *
 *   <button onclick="draftInGmail()">Draft in Gmail</button>
 *   <script>
 *     async function draftInGmail() {
 *       try {
 *         const r = await bliMail({
 *           mode: 'draft',                       // or 'send'
 *           to: '',                              // optional for drafts
 *           subject: document.title,
 *           html: getEmailHtml()                 // app-specific: the finished email HTML
 *         });
 *         alert('Draft created ✓  Open Gmail › Drafts');
 *       } catch (e) { alert(e.message); }
 *     }
 *   </script>
 */

function bliMailConfig(force) {
  let url = localStorage.getItem('bliMailGateway.url') || '';
  let secret = localStorage.getItem('bliMailGateway.secret') || '';
  if (force || !url) {
    url = (prompt('BLI Mail Gateway URL (ends in /exec):', url) || '').trim();
    if (url) localStorage.setItem('bliMailGateway.url', url);
  }
  if (force || !secret) {
    secret = (prompt('BLI Mail Gateway secret:', '') || '').trim();
    if (secret) localStorage.setItem('bliMailGateway.secret', secret);
  }
  return { url: url, secret: secret };
}

async function bliMail(payload) {
  const cfg = bliMailConfig(false);
  if (!cfg.url || !cfg.secret) {
    throw new Error('Gateway not configured - reload and enter the gateway URL + secret.');
  }
  let res;
  try {
    res = await fetch(cfg.url, {
      method: 'POST',
      // text/plain keeps this a "simple request" so the browser skips the
      // CORS preflight, which Apps Script web apps cannot answer.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ secret: cfg.secret }, payload)),
      redirect: 'follow'
    });
  } catch (e) {
    throw new Error('Could not reach the gateway. Check the URL and your connection.');
  }
  const data = await res.json().catch(function () {
    return { ok: false, error: 'Gateway returned a bad response (HTTP ' + res.status + '). Is access set to "Anyone"?' };
  });
  if (!data.ok) throw new Error(data.error || 'Gateway error.');
  return data;
}
