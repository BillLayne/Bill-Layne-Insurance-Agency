export default function SendTab({
  subject, preheader, htmlBody, contacts, optOuts,
  appsScriptUrl, setAppsScriptUrl,
  sendStatus, setSendStatus, sending, setSending,
}) {
  const sendable = contacts.filter(
    (c) => c.include && !optOuts.includes(c.email)
  );

  const checklist = [
    { label: 'Subject line', pass: subject.length > 0, value: subject || 'not set' },
    { label: 'Preheader', pass: preheader.length > 0, value: preheader || 'not set (optional)' },
    { label: 'Newsletter HTML', pass: htmlBody.length > 0, value: htmlBody.length > 0 ? `${htmlBody.length.toLocaleString()} chars` : 'not set' },
    { label: 'CSV loaded', pass: contacts.length > 0, value: contacts.length > 0 ? `${contacts.length.toLocaleString()} records` : 'no CSV loaded' },
    { label: 'Recipients', pass: sendable.length > 0, value: sendable.length > 0 ? `${sendable.length.toLocaleString()} emails ready` : '0 — upload a CSV' },
    { label: 'Opt-outs suppressed', pass: true, value: String(optOuts.length) },
    { label: 'Apps Script URL', pass: appsScriptUrl.length > 0, value: appsScriptUrl.length > 0 ? 'configured' : 'not set' },
  ];

  const canSend = !sending && subject && htmlBody && sendable.length > 0 && appsScriptUrl;

  const handleSend = async () => {
    if (!appsScriptUrl) return alert('Paste your Apps Script URL in the Send tab.');
    if (!subject) return alert('Add a subject line in the Editor tab.');
    if (!htmlBody) return alert('Add newsletter HTML in the Editor tab.');
    if (!sendable.length) return alert('No sendable contacts. Upload a CSV.');

    setSending(true);
    setSendStatus(null);

    try {
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({
          subject,
          preheader,
          htmlBody,
          recipients: sendable.map((c) => ({
            recno: c.recno,
            email: c.email,
            firstName: c.firstName,
            displayName: c.displayName,
          })),
        }),
      });
      const data = await response.json();
      setSendStatus({ ok: data.status === 'success', msg: data.message });
    } catch (err) {
      setSendStatus({ ok: false, msg: 'Network error: ' + err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Apps Script URL */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Google Apps Script Web App URL
        </label>
        <input
          type="text"
          value={appsScriptUrl}
          onChange={(e) => setAppsScriptUrl(e.target.value)}
          placeholder="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-navy"
        />
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#e2e8f0]">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pre-Send Checklist</span>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {checklist.map((item, i) => (
              <tr key={item.label} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'}>
                <td className="px-4 py-2.5 w-8 text-center">
                  {item.pass ? <span className="text-green-500">✅</span> : <span className="text-red-400">❌</span>}
                </td>
                <td className="px-2 py-2.5 font-semibold text-slate-700">{item.label}</td>
                <td className="px-4 py-2.5 text-slate-500 text-right font-mono text-xs truncate max-w-[280px]">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
          canSend
            ? 'bg-navy text-white hover:bg-navy-light cursor-pointer'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {sending ? '⏳ Sending...' : `🚀 Send to ${sendable.length.toLocaleString()} Recipients`}
      </button>

      {/* Status */}
      {sendStatus && (
        <div className={`rounded-xl p-4 border ${sendStatus.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm font-semibold ${sendStatus.ok ? 'text-green-700' : 'text-red-700'}`}>
            {sendStatus.ok ? '✅' : '❌'} {sendStatus.msg}
          </p>
        </div>
      )}

      {/* Gmail Limits */}
      {sendable.length > 0 && (
        <div className={`rounded-xl p-4 border ${sendable.length > 500 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          {sendable.length > 500 ? (
            <p className="text-xs text-amber-800">
              ⚠️ <strong>Gmail sending limits:</strong> Free Gmail = 500/day. Your{' '}
              {sendable.length.toLocaleString()} contacts will need {Math.ceil(sendable.length / 500)}{' '}
              days at 500/day. Consider upgrading to Google Workspace (2,000/day) or spreading sends
              over multiple days.
            </p>
          ) : (
            <p className="text-xs text-green-700">
              ✅ Your {sendable.length.toLocaleString()} contacts are within Gmail's 500/day free limit.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
