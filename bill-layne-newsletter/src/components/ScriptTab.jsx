import { useState } from 'react';
import { APPS_SCRIPT_CODE } from '../utils/appsScriptCode';

const STEPS = [
  {
    num: 1,
    title: 'Create the Google Sheet',
    body: 'Go to sheets.google.com → New spreadsheet. Name it "Bill Layne Newsletter Tracker". Copy the Sheet ID from the URL — it\'s the long string between /d/ and /edit.',
  },
  {
    num: 2,
    title: 'Open Apps Script',
    body: 'Go to script.google.com → New project. Name it "Bill Layne Newsletter Sender". Delete the default myFunction() code. Paste the complete code shown below.',
  },
  {
    num: 3,
    title: 'Update YOUR_SHEET_ID',
    body: 'On line 5 of the script, replace YOUR_GOOGLE_SHEET_ID_HERE with the ID you copied in Step 1.',
  },
  {
    num: 4,
    title: 'Deploy as Web App',
    body: 'Click Deploy → New Deployment. Type: Web App. Execute as: Me. Who has access: Anyone. Click Deploy, grant authorization, copy the Web App URL.',
  },
  {
    num: 5,
    title: 'Paste URL into the Send Tab',
    body: 'In this app, go to the Send tab and paste your Web App URL. You\'re ready to send.',
  },
];

export default function ScriptTab() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = APPS_SCRIPT_CODE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Setup Guide */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Apps Script Setup Guide</h2>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-3">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
                style={{ backgroundColor: '#003f87' }}
              >
                {step.num}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{step.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Block */}
      <div className="rounded-xl overflow-hidden border border-[#30363d]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#C8A84E' }}>
          <span className="text-sm font-bold text-[#003f87] font-mono">Code.gs</span>
          <button
            onClick={handleCopy}
            className="text-xs font-bold px-3 py-1 rounded-md bg-white/90 text-[#003f87] hover:bg-white transition-colors"
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>
        {/* Code */}
        <pre
          className="p-4 overflow-auto text-xs leading-relaxed font-mono"
          style={{
            backgroundColor: '#0d1117',
            color: '#e6edf3',
            maxHeight: 600,
          }}
        >
          <code>{APPS_SCRIPT_CODE}</code>
        </pre>
      </div>
    </div>
  );
}
