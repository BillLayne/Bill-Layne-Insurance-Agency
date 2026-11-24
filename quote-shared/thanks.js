/* Shared pieces of the quote forms' thank-you screen: the "What happens next" box and the "Save our number" link.
   One place for the wording and the office hours, so a change here reaches every form that uses it.
   Usage inside a form's final screen:  BLI_THANKS.next()  and  BLI_THANKS.save('home_v2')  (the name is used for click tracking). */
(function () {
  'use strict';
  var VCARD_URL = '/quote-shared/bill-layne-insurance.vcf';
  // Days the office is closed although it is a weekday, as 'YYYY-MM-DD' in Eastern time. Empty until Bill gives his list.
  var CLOSED_DAYS = [];

  // true = open now, false = closed now, null = could not tell (the box then shows the plain hours instead).
  function officeOpenNow(at) {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(at || new Date());
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ''; };
      var hour = Number(get('hour')) % 24;
      if (CLOSED_DAYS.indexOf(get('year') + '-' + get('month') + '-' + get('day')) > -1) return false;
      return ['Sat', 'Sun'].indexOf(get('weekday')) === -1 && hour >= 9 && hour < 17;
    } catch (_) { return null; }
  }

  function next() {
    var open = officeOpenNow();
    var first = open === false ? 'Our office is closed right now. We will start on your quote the next business day.'
      : (open ? 'Our office is open now.' : 'Our office hours are Monday to Friday, 9 AM to 5 PM.');
    return '<div class="v2-next-box" style="max-width:620px;margin:0 auto 18px;padding:14px 16px;border:1.5px solid #d5dce6;border-radius:16px;background:#fff;text-align:left">'
      + '<strong style="display:block;font-size:17px;font-weight:800;color:#05203d;margin-bottom:6px">What happens next</strong>'
      + '<p style="margin:0 0 8px;font-size:15.5px;font-weight:700;color:#05203d">' + first + '</p>'
      + '<ol style="margin:0;padding-left:20px;font-size:15.5px;line-height:1.5;color:#334155">'
      + '<li>Our team reviews your answers and compares carriers.</li>'
      + '<li>We send your prices by text or email.</li>'
      + '<li>You look them over and ask us anything. Asking for a quote does not start or change any coverage.</li>'
      + '</ol></div>';
  }

  function save(name) {
    var src = String(name || 'quote').replace(/[^a-z0-9_]/gi, '') + '_final_save_contact';
    return '<div class="v2-save-contact" style="max-width:620px;margin:14px auto 0;text-align:center">'
      + '<a class="v2-btn-outline" style="width:100%" href="' + VCARD_URL + '" data-source="' + src + '">Save our number to your contacts</a>'
      + '<p style="margin:8px 0 0;font-size:14.5px;color:#5b6b80">So you know it is us when we call or text.</p></div>';
  }

  window.BLI_THANKS = { next: next, save: save, officeOpenNow: officeOpenNow };
})();
