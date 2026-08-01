// BLI Mail Studio — template library.
// Shell/footer mirror the LOCKED receipt template (receipt-template.js, bli-email-2026 system):
// #f1f5f9 page, fluid 600px container, 4px card seams, anti-fit spacer, Inter w/ Arial fallback,
// no circle avatars, no agent chip, canonical footer. Fill via each template's build(v) only.
window.BLI_STUDIO = (function () {
  'use strict';

  var FONT = "'Inter',Arial,'Helvetica Neue',Helvetica,sans-serif";

  /* ---------------- helpers ---------------- */
  function E(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function money(v) {
    var n = parseFloat(String(v || '').replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return '';
    return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function humanDate(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length !== 3) return '';
    return MONTHS[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10) + ', ' + p[0];
  }
  function dash(v) { var t = String(v || '').trim(); return t ? t : '—'; }
  function lines(v) {
    return String(v || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  }
  function paras(v) {
    return String(v || '').split(/\r?\n\s*\r?\n/).map(function (p) { return p.trim(); }).filter(Boolean);
  }

  var CARRIERS = ['Nationwide', 'Progressive', 'Travelers', 'National General', 'Foremost',
    'Alamance Farmers Mutual', 'NC Grange Mutual', 'Hagerty', 'Dairyland', 'NCJUA', 'Steadily'];
  var POLICY_TYPES = ['Auto', 'Home', 'Renters', 'Dwelling Fire', 'Mobile Home', 'Umbrella',
    'Motorcycle', 'Boat', 'Business', 'Other'];

  /* ---------------- locked shell parts ---------------- */
  function head(title) {
    return '<!DOCTYPE html>\n<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">\n<head>\n' +
      '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n<meta name="x-apple-disable-message-reformatting">\n' +
      '<meta name="color-scheme" content="light">\n<meta name="supported-color-schemes" content="light">\n' +
      '<title>' + title + '</title>\n' +
      '<!--[if mso]>\n<noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>\n<![endif]-->\n' +
      '<style>\n' +
      "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');\n" +
      'html,body,table,td,a,p,span,div{-webkit-text-size-adjust:100%!important;-ms-text-size-adjust:100%!important}\n' +
      'table,td{mso-table-lspace:0;mso-table-rspace:0}\n' +
      'img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}\n' +
      'body{margin:0;padding:0;width:100%!important;background-color:#f1f5f9}\n' +
      '@media only screen and (max-width:620px){\n' +
      '.email-container{width:100%!important}\n' +
      '.hero-pad{padding:28px 20px!important}\n' +
      '.card-pad{padding:20px 16px!important}\n' +
      '.amount-num{font-size:42px!important}\n' +
      '.h1-m{font-size:22px!important;line-height:1.3!important}\n' +
      '.meta-cell{display:block!important;width:100%!important;padding-right:0!important;padding-left:0!important;border-right:none!important;padding-bottom:10px!important;margin-bottom:10px!important;border-bottom:1px solid rgba(255,255,255,0.18)!important;}\n' +
      '}\n</style>\n</head>\n';
  }

  function shellOpen(preheader) {
    return '<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:' + FONT + ';-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">\n' +
      '<!-- 600px ANTI-FIT SPACER -->\n' +
      '<div style="display:none;white-space:nowrap;font:15px courier;color:#ffffff;line-height:0;width:600px!important;min-width:600px!important;max-width:600px!important;">' +
      new Array(31).join('&nbsp;') + '</div>\n' +
      '<!-- PREHEADER -->\n' +
      '<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">' +
      preheader + '&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f1f5f9" style="background-color:#f1f5f9;">\n' +
      '<tr><td align="center" style="padding:24px 16px;">\n' +
      '<!--[if mso]>\n<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;"><tr><td width="600" style="width:600px;">\n<![endif]-->\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-container" style="width:100%;max-width:600px;margin:0 auto;">\n';
  }

  function shellClose() {
    return '</table>\n<!--[if mso]>\n</td></tr></table>\n<![endif]-->\n</td></tr>\n</table>\n</body>\n</html>\n';
  }

  // Card 1: branded header — gradient top line + agency logo pill + eyebrow.
  function headerCard(eyebrow) {
    return '<tr>\n<td style="padding-bottom:4px;">\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#fafafa" style="background-color:#fafafa;border:1px solid #e2e8f0;border-radius:16px 16px 0 0;">\n' +
      '<tr><td height="5" style="height:5px;background:linear-gradient(90deg,#003f87 0%,#0076d3 50%,#003f87 100%);background-color:#003f87;font-size:0;line-height:0;border-radius:16px 16px 0 0;">&nbsp;</td></tr>\n' +
      '<tr><td align="center" style="padding:20px 24px 16px 24px;">\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 10px auto;"><tr>' +
      '<td bgcolor="#ffffff" style="background-color:#ffffff;padding:10px 18px;border-radius:10px;border:1px solid #e2e8f0;">' +
      '<img src="https://img.billlayneinsurance.com/i/2026/08/bli-agency-logo-4jqj2j.png" width="150" alt="Bill Layne Insurance Agency" style="display:block;width:150px;height:auto;border:0;"></td></tr></table>\n' +
      '<p style="margin:0;font-size:10px;font-weight:700;color:#64748b;font-family:' + FONT + ';letter-spacing:1.5px;text-transform:uppercase;">' + eyebrow + '</p>\n' +
      '</td></tr>\n</table>\n</td>\n</tr>\n';
  }

  // Hero card. opts: {gradient, bgcolor, badge, heading, sub, box:{label,big,sub}, chips:[{label,value}]}
  function heroCard(o) {
    var h = '<tr>\n<td style="padding-bottom:4px;">\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="' + o.bgcolor + '" style="border:1px solid #e2e8f0;">\n' +
      '<tr><td class="hero-pad" align="center" style="padding:34px 32px;background:' + o.gradient + ';background-color:' + o.bgcolor + ';text-align:center;">\n';
    if (o.badge) {
      h += '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px auto;"><tr>' +
        '<td style="background-color:rgba(200,168,78,0.18);border:1px solid rgba(200,168,78,0.45);border-radius:20px;padding:5px 18px;">' +
        '<span style="font-size:11px;font-weight:700;color:#C8A84E;font-family:' + FONT + ';letter-spacing:1.5px;text-transform:uppercase;">' + o.badge + '</span></td></tr></table>\n';
    }
    h += '<p class="h1-m" style="margin:0' + (o.sub || o.box || o.chips ? ' 0 14px 0' : '') + ';font-size:26px;font-weight:700;color:#ffffff;font-family:' + FONT + ';line-height:1.3;">' + o.heading + '</p>\n';
    if (o.sub) {
      h += '<p style="margin:0' + (o.box || o.chips ? ' 0 20px 0' : '') + ';font-size:14.5px;color:rgba(255,255,255,0.88);font-family:' + FONT + ';line-height:1.6;">' + o.sub + '</p>\n';
    }
    if (o.box) {
      h += '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto' + (o.chips ? ' 20px auto' : '') + ';"><tr>' +
        '<td style="background-color:rgba(255,255,255,0.15);border-radius:16px;padding:18px 34px;border:1px solid rgba(255,255,255,0.3);text-align:center;">' +
        '<p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#C8A84E;font-family:' + FONT + ';letter-spacing:1.5px;text-transform:uppercase;">' + o.box.label + '</p>' +
        '<p class="amount-num" style="margin:0' + (o.box.sub ? ' 0 6px 0' : '') + ';font-size:44px;font-weight:700;color:#ffffff;font-family:' + FONT + ';line-height:1.1;">' + o.box.big + '</p>' +
        (o.box.sub ? '<p style="margin:0;font-size:13px;color:rgba(255,255,255,0.9);font-family:' + FONT + ';">' + o.box.sub + '</p>' : '') +
        '</td></tr></table>\n';
    }
    if (o.chips && o.chips.length) {
      var cells = o.chips.map(function (c, i) {
        var pad = i === 0 ? 'padding-right:16px;' : (i === o.chips.length - 1 ? 'padding-left:16px;' : 'padding:0 16px;');
        var brd = i < o.chips.length - 1 ? 'border-right:1px solid rgba(255,255,255,0.2);' : '';
        return '<td class="meta-cell" style="' + pad + brd + '">' +
          '<p style="margin:0;font-size:10px;color:rgba(255,255,255,0.65);font-family:' + FONT + ';letter-spacing:0.5px;text-transform:uppercase;">' + c.label + '</p>' +
          '<p style="margin:2px 0 0 0;font-size:13px;font-weight:700;color:#ffffff;font-family:' + FONT + ';">' + c.value + '</p></td>';
      }).join('');
      h += '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>' +
        '<td style="background-color:rgba(255,255,255,0.12);border-radius:10px;padding:10px 16px;">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' + cells + '</tr></table></td></tr></table>\n';
    }
    h += '</td></tr>\n</table>\n</td>\n</tr>\n';
    return h;
  }

  var GRAD = {
    sales: { gradient: 'linear-gradient(135deg,#0f172a 0%,#1a365d 50%,#0f766e 100%)', bgcolor: '#0f172a' },
    bound: { gradient: 'linear-gradient(135deg,#065f46 0%,#059669 50%,#10b981 100%)', bgcolor: '#065f46' },
    urgent: { gradient: 'linear-gradient(135deg,#92400e 0%,#b45309 50%,#d97706 100%)', bgcolor: '#92400e' },
    navy: { gradient: 'linear-gradient(135deg,#003f87 0%,#003f87 100%)', bgcolor: '#003f87' }
  };

  // Generic white body card.
  function bodyCard(inner, bg) {
    bg = bg || '#ffffff';
    return '<tr>\n<td style="padding-bottom:4px;">\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="' + bg + '" style="background-color:' + bg + ';border:1px solid #e2e8f0;">\n' +
      '<tr><td class="card-pad" style="padding:24px;">\n' + inner + '\n</td></tr>\n</table>\n</td>\n</tr>\n';
  }

  function p(text, extra) {
    return '<p style="margin:0 0 14px 0;font-size:14.5px;color:#334155;font-family:' + FONT + ';line-height:1.7;' + (extra || '') + '">' + text + '</p>';
  }
  function cardTitle(eyebrow, title) {
    return '<p style="margin:0 0 2px 0;font-size:10px;font-weight:700;color:#64748b;font-family:' + FONT + ';letter-spacing:1.5px;text-transform:uppercase;">' + eyebrow + '</p>' +
      '<p style="margin:0 0 16px 0;font-size:19px;font-weight:700;color:#0f172a;font-family:' + FONT + ';">' + title + '</p>';
  }

  // Label/value detail table — alternating shading, NO stacking class on data rows.
  function detailTable(rows) {
    var t = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">';
    rows.forEach(function (r, i) {
      var bg = i % 2 === 0 ? '#faf7ed' : '#ffffff';
      var bb = i < rows.length - 1 ? 'border-bottom:1px solid #e2e8f0;' : '';
      t += '<tr>' +
        '<td width="45%" bgcolor="' + bg + '" style="background-color:' + bg + ';padding:12px 16px;' + bb + '">' +
        '<p style="margin:0;font-size:12px;font-weight:700;color:#64748b;font-family:' + FONT + ';text-transform:uppercase;letter-spacing:0.5px;">' + r[0] + '</p></td>' +
        '<td width="55%" bgcolor="' + bg + '" style="background-color:' + bg + ';padding:12px 16px;' + bb + '">' +
        '<p style="margin:0;font-size:14px;font-weight:' + (r[2] ? '700' : '400') + ';color:' + (r[2] ? '#0f172a' : '#334155') + ';font-family:' + FONT + ';word-break:break-word;">' + r[1] + '</p></td></tr>';
    });
    return t + '</table>';
  }

  // Checkmark bullet rows.
  function checkRows(items) {
    var t = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">';
    items.forEach(function (it) {
      t += '<tr><td width="26" valign="top" style="padding:0 0 10px 0;">' +
        '<span style="font-size:15px;font-weight:700;color:#0f766e;font-family:' + FONT + ';">&#10003;</span></td>' +
        '<td valign="top" style="padding:0 0 10px 0;">' +
        '<p style="margin:0;font-size:14.5px;color:#334155;font-family:' + FONT + ';line-height:1.6;">' + it + '</p></td></tr>';
    });
    return t + '</table>';
  }

  // Numbered steps — 8px rounded SQUARE badges (never circles).
  function stepRows(steps) {
    var t = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">';
    steps.forEach(function (s, i) {
      t += '<tr><td width="38" valign="top" style="padding:0 0 16px 0;">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
        '<td width="26" height="26" align="center" valign="middle" style="background-color:#003f87;border-radius:8px;width:26px;height:26px;text-align:center;">' +
        '<span style="font-size:13px;font-weight:700;color:#ffffff;font-family:' + FONT + ';">' + (i + 1) + '</span></td></tr></table></td>' +
        '<td valign="top" style="padding:0 0 16px 0;">' +
        '<p style="margin:0 0 2px 0;font-size:14.5px;font-weight:700;color:#0f172a;font-family:' + FONT + ';">' + s[0] + '</p>' +
        '<p style="margin:0;font-size:13.5px;color:#64748b;font-family:' + FONT + ';line-height:1.6;">' + s[1] + '</p></td></tr>';
    });
    return t + '</table>';
  }

  // Gold pill CTA button.
  function ctaButton(label, href) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px auto 4px auto;"><tr>' +
      '<td bgcolor="#C8A84E" style="background-color:#C8A84E;border-radius:999px;">' +
      '<a href="' + href + '" style="display:inline-block;padding:14px 34px;font-size:14px;font-weight:700;color:#00295c;font-family:' + FONT + ';text-decoration:none;letter-spacing:0.5px;text-transform:uppercase;">' + label + '</a></td></tr></table>';
  }

  // Tinted callout card (inner block).
  function callout(bg, border, textColor, html) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:' + bg + ';border:1px solid ' + border + ';border-radius:12px;margin:4px 0 14px 0;"><tr><td style="padding:14px 18px;">' +
      '<p style="margin:0;font-size:13.5px;color:' + textColor + ';font-family:' + FONT + ';line-height:1.6;">' + html + '</p></td></tr></table>';
  }

  // Sign-off card (shared, mirrors receipt Card 5).
  function signoffCard(first) {
    var name = first ? ', ' + first : '';
    return bodyCard(
      '<p style="margin:0 0 14px 0;font-size:15px;color:#334155;font-family:' + FONT + ';line-height:1.7;text-align:center;">Questions? Just reply to this email &mdash; we read every message personally.</p>' +
      '<p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;font-family:' + FONT + ';text-align:center;">Thanks for trusting us with your coverage' + name + '.<br>&mdash; Bill Layne Insurance Team</p>' +
      '<p style="margin:14px 0 0 0;font-size:12px;color:#64748b;font-family:' + FONT + ';text-align:center;">&#128172; Prefer Messenger? <a href="https://m.me/dollarbillagency" style="color:#003f87;font-weight:700;text-decoration:none;">Chat with Bill &rarr;</a></p>'
    );
  }

  // Canonical consumer footer (locked — byte-matches receipt template footer).
  function footerCard() {
    return '<tr>\n<td>\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#fafafa" style="background-color:#fafafa;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;">\n' +
      '<tr>\n<td style="padding:28px 24px;text-align:center;" class="card-pad">\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="80" style="margin:0 auto 20px auto;">' +
      '<tr><td height="3" style="height:3px;background:linear-gradient(90deg,#003f87,#C8A84E);font-size:0;line-height:0;">&nbsp;</td></tr></table>\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px auto;"><tr>' +
      '<td bgcolor="#ffffff" style="background-color:#ffffff;padding:10px 20px;border-radius:10px;border:1px solid #e2e8f0;">' +
      '<img src="https://img.billlayneinsurance.com/i/2026/08/bli-agency-logo-4jqj2j.png" width="140" alt="Bill Layne Insurance Agency" style="display:block;width:140px;height:auto;"></td></tr></table>\n' +
      '<p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#0f172a;font-family:' + FONT + ';">Bill Layne Insurance Agency</p>\n' +
      '<p style="margin:0 0 2px 0;font-size:12px;color:#64748b;font-family:' + FONT + ';">1283 N Bridge St &bull; Elkin, NC 28621</p>\n' +
      '<p style="margin:0 0 2px 0;font-size:12px;color:#64748b;font-family:' + FONT + ';">(336) 835-1993 &bull; <a href="mailto:Save@BillLayneInsurance.com" style="color:#003f87;text-decoration:none;">Save@BillLayneInsurance.com</a></p>\n' +
      '<p style="margin:0 0 14px 0;font-size:12px;color:#64748b;font-family:' + FONT + ';"><a href="https://www.BillLayneInsurance.com" style="color:#003f87;text-decoration:none;">www.BillLayneInsurance.com</a> &bull; Est. 2005</p>\n' +
      '<p style="margin:0 0 14px 0;font-size:12px;color:#64748b;font-family:' + FONT + ';">' +
      '<a href="https://www.facebook.com/dollarbillagency" style="color:#003f87;text-decoration:none;font-weight:700;">Facebook</a>&nbsp;|&nbsp;' +
      '<a href="https://www.youtube.com/@ncautoandhome" style="color:#003f87;text-decoration:none;font-weight:700;">YouTube</a>&nbsp;|&nbsp;' +
      '<a href="https://www.instagram.com/ncautoandhome" style="color:#003f87;text-decoration:none;font-weight:700;">Instagram</a>&nbsp;|&nbsp;' +
      '<a href="https://x.com/shopsavecompare" style="color:#003f87;text-decoration:none;font-weight:700;">X</a></p>\n' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px auto;"><tr>' +
      '<td bgcolor="#ffffff" align="center" style="background-color:#ffffff;padding:8px 14px;border-radius:20px;border:1px solid #e2e8f0;">' +
      '<img src="https://i.imgur.com/nDFmjxh.png" width="16" height="16" alt="Google" style="display:inline-block;vertical-align:middle;width:16px;height:16px;margin-right:6px;">' +
      '<span style="font-size:11px;color:#64748b;font-family:' + FONT + ';vertical-align:middle;font-weight:600;">&#11088; 4.9 Stars on Google &bull; 100+ Reviews</span></td></tr></table>\n' +
      '<p style="margin:0 0 6px 0;font-size:11px;color:#64748b;font-family:' + FONT + ';">Follow us on <a href="https://www.facebook.com/dollarbillagency" style="color:#003f87;text-decoration:none;font-weight:700;">Facebook</a> for insurance tips &amp; local updates.</p>\n' +
      '<p style="margin:0 0 14px 0;font-size:11px;color:#64748b;font-family:' + FONT + ';">Prefer to chat? Reach us on <a href="https://m.me/dollarbillagency" style="color:#003f87;text-decoration:none;font-weight:700;">Facebook Messenger</a> anytime.</p>\n' +
      '<p style="margin:0;font-size:10px;color:#94a3b8;font-family:' + FONT + ';line-height:1.6;">You&rsquo;re receiving this because you have an active policy or requested a quote from Bill Layne Insurance Agency.<br>To stop receiving these emails, reply with &quot;unsubscribe&quot; or call (336) 835-1993.</p>\n' +
      '</td>\n</tr>\n</table>\n</td>\n</tr>\n';
  }

  function assemble(title, preheader, cards) {
    return head(title) + shellOpen(preheader) + cards.join('') + footerCard() + shellClose();
  }

  /* ================================================================
     TEMPLATE DEFINITIONS
     ================================================================ */
  var TEMPLATES = [

    /* ---------- 1. Quote follow-up ---------- */
    {
      id: 'quote-followup',
      name: 'Quote Follow-Up',
      icon: '&#128176;',
      desc: 'Friendly nudge on a quote you already sent — optional monthly payment shown big.',
      fields: [
        { id: 'first', label: 'First name', half: true, required: true },
        { id: 'last', label: 'Last name', half: true },
        { id: 'qtype', label: 'Quote type', type: 'select', options: POLICY_TYPES, half: true },
        { id: 'carrier', label: 'Carrier quoted', type: 'select', options: CARRIERS.concat(['Other']), half: true },
        { id: 'monthly', label: 'Monthly payment ($, optional)', type: 'text', placeholder: '124.50', half: true },
        { id: 'qdate', label: 'Quote date', type: 'date', default: 'today', half: true },
        { id: 'note', label: 'Personal note (optional — replaces the default opener)', type: 'textarea', rows: 3, placeholder: 'It was great talking with you Tuesday…' }
      ],
      subject: function (v) {
        return ('your ' + (v.qtype || 'insurance').toLowerCase() + ' quote is ready when you are').slice(0, 45);
      },
      build: function (v) {
        var first = E(dash(v.first));
        var m = money(v.monthly);
        var opener = v.note && v.note.trim()
          ? paras(v.note).map(function (t) { return p(E(t)); }).join('')
          : p('I wanted to follow up on the quote we put together for you. It&rsquo;s saved and ready whenever you are &mdash; no pressure, no obligation.');
        var hero = heroCard({
          gradient: GRAD.sales.gradient, bgcolor: GRAD.sales.bgcolor,
          badge: 'Your Quote Is Ready',
          heading: 'Hi ' + first + ', still thinking it over?',
          sub: 'Your ' + E(v.qtype || 'insurance') + ' quote with ' + E(v.carrier || 'us') + ' is saved and waiting.',
          box: m ? { label: 'Est. Monthly Payment', big: '$' + m, sub: E(v.qtype || '') + ' &bull; ' + E(v.carrier || '') } : null
        });
        var details = detailTable([
          ['Quote Type', E(dash(v.qtype)), false],
          ['Carrier', E(dash(v.carrier)), false],
          ['Quoted On', E(dash(humanDate(v.qdate))), false]
        ].concat(m ? [['Est. Monthly', '$' + m, true]] : []));
        var body = bodyCard(
          cardTitle('Quote Follow-Up', 'Your quote, in plain English') +
          opener +
          p('Rates can change as time passes, so if this one looks right to you, the fastest way to lock it in is a quick call &mdash; it usually takes about ten minutes.') +
          details +
          '<div style="text-align:center;margin-top:18px;">' +
          ctaButton('Lock In My Rate', 'tel:+13368351993') +
          '<p style="margin:8px 0 0 0;font-size:12.5px;color:#64748b;font-family:' + FONT + ';">or just reply to this email with any questions</p></div>'
        );
        return assemble(
          'Your Quote &mdash; Bill Layne Insurance',
          'No pressure &mdash; your quote is saved and ready to go.',
          [headerCard('Your Local Independent Agency &bull; Elkin, NC'), hero, body, signoffCard(first)]
        );
      }
    },

    /* ---------- 2. Welcome / new customer ---------- */
    {
      id: 'welcome',
      name: 'Welcome — New Policy',
      icon: '&#127881;',
      desc: 'New-business welcome: what happens next, plus the Client Hub link.',
      fields: [
        { id: 'first', label: 'First name', half: true, required: true },
        { id: 'last', label: 'Last name', half: true },
        { id: 'ptype', label: 'Policy type', type: 'select', options: POLICY_TYPES, half: true },
        { id: 'carrier', label: 'Carrier', type: 'select', options: CARRIERS.concat(['Other']), half: true },
        { id: 'policy', label: 'Policy number', half: true },
        { id: 'effdate', label: 'Effective date', type: 'date', half: true },
        { id: 'note', label: 'Personal note (optional)', type: 'textarea', rows: 2 }
      ],
      subject: function (v) {
        return ('welcome aboard — your ' + (v.ptype || 'new').toLowerCase() + ' policy').slice(0, 45);
      },
      build: function (v) {
        var first = E(dash(v.first));
        var chips = [];
        if (v.carrier) chips.push({ label: 'Carrier', value: E(v.carrier) });
        if (v.policy) chips.push({ label: 'Policy #', value: E(v.policy) });
        if (v.effdate) chips.push({ label: 'Effective', value: E(humanDate(v.effdate)) });
        var hero = heroCard({
          gradient: GRAD.bound.gradient, bgcolor: GRAD.bound.bgcolor,
          badge: "&#9989; You're Covered",
          heading: 'Welcome to the family, ' + first + '!',
          sub: 'Your ' + E(v.ptype || '') + ' policy is officially active. Here&rsquo;s everything you need to know.',
          chips: chips.length ? chips : null
        });
        var noteHtml = v.note && v.note.trim() ? paras(v.note).map(function (t) { return p(E(t)); }).join('') : '';
        var body = bodyCard(
          cardTitle('Getting Started', 'What happens next') +
          noteHtml +
          stepRows([
            ['Your documents are on the way', 'ID cards and policy papers come directly from ' + E(v.carrier || 'your carrier') + ' by email or mail, usually within a few days.'],
            ['Billing comes from the carrier', 'Statements and payment drafts come from ' + E(v.carrier || 'the carrier') + ' &mdash; not from our office. Questions about a bill? Call us first and we&rsquo;ll sort it out.'],
            ['Save our number', '(336) 835-1993 &mdash; one call handles changes, claims help, ID cards, and anything else.']
          ])
        );
        var hub = bodyCard(
          cardTitle('One Link To Keep', 'Your Client Hub') +
          p('ID cards, claims steps, payment links, and every way to reach us &mdash; all on one page. Bookmark it on your phone:') +
          '<div style="text-align:center;">' +
          ctaButton('Open My Client Hub', 'https://www.billlayneinsurance.com/clients/') +
          '</div>', '#fafafa'
        );
        return assemble(
          'Welcome &mdash; Bill Layne Insurance',
          "You're covered &mdash; here's what happens next.",
          [headerCard('Welcome To Bill Layne Insurance &bull; Est. 2005'), hero, body, hub, signoffCard(first)]
        );
      }
    },

    /* ---------- 3. Document / photo request ---------- */
    {
      id: 'doc-request',
      name: 'Document Request',
      icon: '&#128247;',
      desc: 'Ask for photos, signed forms, or proof items — one per line becomes a checklist.',
      fields: [
        { id: 'first', label: 'First name', half: true, required: true },
        { id: 'last', label: 'Last name', half: true },
        { id: 'items', label: 'Items needed (one per line)', type: 'textarea', rows: 4, required: true, placeholder: 'Photo of the front of your home\nSigned uninsured motorist form\nCopy of your alarm certificate' },
        { id: 'reason', label: 'Why we need them (optional)', placeholder: 'The carrier needs these to finalize your new policy' },
        { id: 'deadline', label: 'Needed by (optional)', type: 'date', half: true },
        { id: 'policyref', label: 'Policy / quote reference (optional)', half: true }
      ],
      subject: function () { return 'quick favor — a few items needed'; },
      build: function (v) {
        var first = E(dash(v.first));
        var items = lines(v.items).map(E);
        var hero = heroCard({
          gradient: GRAD.urgent.gradient, bgcolor: GRAD.urgent.bgcolor,
          badge: 'Quick Action Needed',
          heading: 'Hi ' + first + ', we need a couple of things',
          sub: (v.reason && v.reason.trim() ? E(v.reason) : 'A quick reply with the items below keeps everything on track.') +
            (v.policyref ? ' &bull; Ref: ' + E(v.policyref) : '')
        });
        var deadlineHtml = v.deadline
          ? callout('#fef3c7', '#fcd34d', '#92400e', '<strong>Please send these by ' + E(humanDate(v.deadline)) + '</strong> so there&rsquo;s no interruption or delay with your coverage.')
          : '';
        var body = bodyCard(
          cardTitle('Checklist', 'Here&rsquo;s all we need') +
          (items.length ? checkRows(items) : p('&mdash;')) +
          deadlineHtml +
          p('<strong>The easy way:</strong> snap photos with your phone and reply to this email with them attached. That&rsquo;s it &mdash; we&rsquo;ll handle the rest.') +
          '<div style="text-align:center;">' +
          ctaButton('Send My Documents', 'mailto:Save@BillLayneInsurance.com?subject=' + encodeURIComponent('Documents for ' + (v.first || '') + ' ' + (v.last || '')).replace(/%20/g, '%20')) +
          '<p style="margin:8px 0 0 0;font-size:12.5px;color:#64748b;font-family:' + FONT + ';">or call us at (336) 835-1993 and we&rsquo;ll walk through it together</p></div>'
        );
        return assemble(
          'Items Needed &mdash; Bill Layne Insurance',
          'A quick reply keeps your policy on track.',
          [headerCard('A Quick Request From Your Agency'), hero, body, signoffCard(first)]
        );
      }
    },

    /* ---------- 4. Payment reminder ---------- */
    {
      id: 'payment-reminder',
      name: 'Payment Reminder',
      icon: '&#9203;',
      desc: 'Friendly amount-due reminder with ways to pay and an optional avoid-lapse date.',
      fields: [
        { id: 'first', label: 'First name', half: true, required: true },
        { id: 'last', label: 'Last name', half: true },
        { id: 'carrier', label: 'Carrier', type: 'select', options: CARRIERS.concat(['Other']), half: true },
        { id: 'policy', label: 'Policy number', half: true },
        { id: 'amount', label: 'Amount due ($)', required: true, half: true, placeholder: '187.20' },
        { id: 'duedate', label: 'Due date', type: 'date', required: true, half: true },
        { id: 'canceldate', label: 'Cancels if unpaid by (optional)', type: 'date', half: true },
        { id: 'payphone', label: 'Carrier pay-by-phone # (optional)', half: true, placeholder: '1-800-776-4737' },
        { id: 'payurl', label: 'Carrier pay-online link (optional)', placeholder: 'https://…' }
      ],
      subject: function (v) {
        return ('payment reminder — your ' + (v.carrier || 'insurance').toLowerCase() + ' policy').slice(0, 45);
      },
      build: function (v) {
        var first = E(dash(v.first));
        var m = money(v.amount);
        var hero = heroCard({
          gradient: GRAD.urgent.gradient, bgcolor: GRAD.urgent.bgcolor,
          badge: 'Friendly Payment Reminder',
          heading: 'Hi ' + first + ', a quick heads-up',
          box: { label: 'Amount Due', big: '$' + (m || '0.00'), sub: 'Due ' + E(dash(humanDate(v.duedate))) + (v.carrier ? ' &bull; ' + E(v.carrier) : '') }
        });
        var ways = [];
        if (v.payphone && v.payphone.trim()) ways.push(['Pay by phone', 'Call ' + E(v.carrier || 'the carrier') + ' anytime at <strong>' + E(v.payphone) + '</strong> &mdash; automated, takes about two minutes.']);
        if (v.payurl && v.payurl.trim()) ways.push(['Pay online', '<a href="' + E(v.payurl) + '" style="color:#003f87;font-weight:700;text-decoration:none;">Pay on the ' + E(v.carrier || 'carrier') + ' website &rarr;</a>']);
        ways.push(['Call our office', '(336) 835-1993 &mdash; we&rsquo;re happy to take care of it with you over the phone.']);
        var lapse = v.canceldate
          ? callout('#fef2f2', '#fecaca', '#b91c1c', '<strong>To avoid any lapse in coverage,</strong> ' + E(v.carrier || 'the carrier') + ' needs to receive payment by <strong>' + E(humanDate(v.canceldate)) + '</strong>. A lapse can raise future rates, so it&rsquo;s worth taking care of early.')
          : '';
        var body = bodyCard(
          cardTitle('Payment Details', 'Everything you need') +
          p('Our records show a payment of <strong>$' + (m || '—') + '</strong> is due on <strong>' + E(dash(humanDate(v.duedate))) + '</strong> for your ' + E(v.carrier || '') + ' policy' + (v.policy ? ' <strong>' + E(v.policy) + '</strong>' : '') + '.') +
          lapse +
          stepRows(ways) +
          callout('#f0fdf4', '#bbf7d0', '#166534', '<strong>Already paid?</strong> Wonderful &mdash; payments can cross in the mail. Feel free to disregard this note, or reply and we&rsquo;ll confirm it posted.')
        );
        return assemble(
          'Payment Reminder &mdash; Bill Layne Insurance',
          'A friendly reminder &mdash; here are the easy ways to pay.',
          [headerCard('A Friendly Reminder From Your Agency'), hero, body, signoffCard(first)]
        );
      }
    },

    /* ---------- 5. General branded note ---------- */
    {
      id: 'note',
      name: 'General Note',
      icon: '&#9993;&#65039;',
      desc: 'Any message in full BLI branding — headline, paragraphs, optional button.',
      fields: [
        { id: 'first', label: 'First name', half: true, required: true },
        { id: 'last', label: 'Last name', half: true },
        { id: 'subj', label: 'Subject line (lowercase, 30–45 chars)', required: true, placeholder: 'a quick update on your policy' },
        { id: 'headline', label: 'Headline', required: true, placeholder: 'A quick update, {first}' },
        { id: 'body', label: 'Message (blank line = new paragraph)', type: 'textarea', rows: 7, required: true },
        { id: 'ctalabel', label: 'Button label (optional)', half: true, placeholder: 'Call My Agency' },
        { id: 'ctaurl', label: 'Button link (optional)', half: true, placeholder: 'tel:+13368351993' }
      ],
      subject: function (v) { return (v.subj || 'a note from bill layne insurance').slice(0, 60); },
      build: function (v) {
        var first = E(dash(v.first));
        var headline = E(v.headline || 'A note from your agency').split('{first}').join(first);
        var hero = heroCard({
          gradient: GRAD.navy.gradient, bgcolor: GRAD.navy.bgcolor,
          badge: 'A Note From Your Agency',
          heading: headline
        });
        var bodyHtml = paras(v.body).map(function (t) {
          return p(E(t).split('{first}').join(first).replace(/\n/g, '<br>'));
        }).join('');
        var cta = (v.ctalabel && v.ctalabel.trim() && v.ctaurl && v.ctaurl.trim())
          ? '<div style="text-align:center;margin-top:6px;">' + ctaButton(E(v.ctalabel), E(v.ctaurl)) + '</div>'
          : '';
        var body = bodyCard(
          p('Hi ' + first + ',') + bodyHtml + cta
        );
        return assemble(
          'Bill Layne Insurance',
          headline.replace(/<[^>]+>/g, '').slice(0, 55),
          [headerCard('Bill Layne Insurance Agency &bull; Elkin, NC'), hero, body, signoffCard(first)]
        );
      }
    }
  ];

  return { templates: TEMPLATES, money: money, humanDate: humanDate };
})();
