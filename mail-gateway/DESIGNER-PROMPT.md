# Claude Designer prompt — gateway-ready Gmail templates

Paste everything between the lines below into your Claude Designer project's
instructions (or at the start of a Designer chat). Every template it produces
will then carry a hidden one-click **Draft in Gmail** button that talks to the
BLI Mail Gateway — and that button strips itself out of the email that
actually gets sent, so customers never see it.

The gateway page at billlayneinsurance.com/mail-gateway/ ALSO auto-removes
this toolbar on intake, so dropping a toolbar-equipped file there is safe too.

---- COPY EVERYTHING BELOW THIS LINE ----

## GMAIL DELIVERY RULES — BLI MAIL GATEWAY (always follow when building email templates)

Every email template you produce must be "gateway-ready":

1. **One complete, self-contained HTML document** (a single file). Table-based
   layout, ALL CSS inline on the elements, fluid down from 600px, mobile-first.
   No external stylesheets, no `@import`, no web fonts (system fonts/Arial
   only). Every image must use a full `https://` URL. Keep the finished file
   under 95 KB (Gmail clips at ~102 KB).

2. **Set the `<title>` to the exact email subject line.** The sending tools
   auto-fill the Gmail subject from it.

3. **At the very end of `<body>`, include this send toolbar exactly as
   written.** It stays invisible in email clients, only appears when the file
   is opened in a browser, and removes itself from the HTML it sends:

```html
<div id="bli-send-toolbar" style="display:none;position:fixed;top:12px;right:12px;z-index:99999;font-family:Arial,sans-serif;text-align:right">
  <button id="bli-send-btn" type="button" style="background:#003f87;color:#ffffff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;font-weight:bold;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3)">&#9993;&#65039; Draft in Gmail</button>
  <div id="bli-send-status" style="display:none;margin-top:6px;background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:5px 9px;font-size:12px;color:#0f172a;max-width:260px"></div>
</div>
<script id="bli-send-script">
(function () {
  var box = document.getElementById('bli-send-toolbar');
  box.style.display = 'block';
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function status(msg) { var s = document.getElementById('bli-send-status'); s.style.display = 'block'; s.innerHTML = msg; }
  document.getElementById('bli-send-btn').onclick = function () {
    var url = read('bliMailGateway.url') || prompt('BLI Mail Gateway URL (ends in /exec):') || '';
    var secret = read('bliMailGateway.secret') || prompt('Gateway secret:') || '';
    url = url.trim(); secret = secret.trim();
    if (!url || !secret) { status('Setup cancelled.'); return; }
    store('bliMailGateway.url', url); store('bliMailGateway.secret', secret);
    var to = prompt('Customer email (leave blank for a draft with no recipient yet):') || '';
    var clone = document.documentElement.cloneNode(true);
    var t1 = clone.querySelector('#bli-send-toolbar'); if (t1) t1.parentNode.removeChild(t1);
    var t2 = clone.querySelector('#bli-send-script'); if (t2) t2.parentNode.removeChild(t2);
    var html = '<!doctype html>\n' + clone.outerHTML;
    status('Creating draft&hellip;');
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: secret, mode: 'draft', to: to.trim(), subject: document.title, html: html }), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (d) { status(d.ok ? '&#9989; Draft created &mdash; open <a href="https://mail.google.com/mail/u/0/#drafts" target="_blank" rel="noopener">Gmail &rsaquo; Drafts</a>' : '&#10060; ' + (d.error || 'Gateway error')); })
      .catch(function () { status('&#10060; Could not reach the gateway from this preview. Download the file and open it, or drop it on billlayneinsurance.com/mail-gateway/'); });
  };
})();
</script>
```

4. **Never put a password, secret, or API key anywhere in the file.** The
   toolbar asks for the gateway URL and secret the first time and remembers
   them in that browser only.

---- COPY EVERYTHING ABOVE THIS LINE ----

## How Bill uses it

1. Build the template in Designer as usual.
2. Download the file (or open the preview) — a navy **✉️ Draft in Gmail**
   button floats top-right.
3. Click it. First time only: paste the gateway /exec URL + secret. Enter the
   customer's email (or leave blank), and the draft appears in Gmail Drafts —
   subject taken from the template's `<title>`, BCC to Save@ automatic.
4. If the Designer preview sandbox blocks the call, download the file and
   open it from your computer — or just drop it on
   https://www.billlayneinsurance.com/mail-gateway/ like any other template.
