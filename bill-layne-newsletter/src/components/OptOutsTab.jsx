import { useState } from 'react';

export default function OptOutsTab({ optOuts, setOptOuts }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const emails = input
      .split(/[,\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.includes('@') && !optOuts.includes(s));
    if (emails.length) {
      setOptOuts([...optOuts, ...emails]);
    }
    setInput('');
  };

  const handleRemove = (email) => {
    setOptOuts(optOuts.filter((e) => e !== email));
  };

  const handleClearAll = () => {
    if (window.confirm('Remove all emails from the suppression list? This cannot be undone.')) {
      setOptOuts([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">🚫 Suppression List</h2>
            <p className="text-sm text-slate-500 mt-1">
              Contacts here are excluded from every send. Apps Script auto-adds anyone who clicks
              Unsubscribe — syncs to your Google Sheet.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-center ml-4">
            <p className="text-2xl font-extrabold font-mono text-red-500">{optOuts.length}</p>
            <p className="text-[10px] uppercase tracking-wide text-red-400 font-semibold">Opted Out</p>
          </div>
        </div>
      </div>

      {/* Add Emails */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Add Emails Manually
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder={'one@example.com\ntwo@example.com\nor comma-separated'}
          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:border-navy"
        />
        <button
          onClick={handleAdd}
          className="mt-2 bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-light transition-colors"
        >
          Add
        </button>
      </div>

      {/* List */}
      {optOuts.length > 0 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e2e8f0]">
            <span className="text-xs font-semibold text-slate-500">
              {optOuts.length} email{optOuts.length !== 1 ? 's' : ''} suppressed
            </span>
            <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-600 font-semibold">
              Clear all
            </button>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {optOuts.map((email, i) => (
                <tr key={email} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'}>
                  <td className="px-4 py-2 font-mono text-xs text-slate-700">{email}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleRemove(email)}
                      className="text-slate-300 hover:text-red-500 text-lg leading-none"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          💡 Apps Script automatically adds opt-outs to your Google Sheet when someone clicks the
          unsubscribe link. Those persist between sessions via the Sheet. The list above is your
          per-session suppression on top of the Sheet's list.
        </p>
      </div>
    </div>
  );
}
