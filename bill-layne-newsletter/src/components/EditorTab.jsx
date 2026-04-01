import { useState } from 'react';

function charColor(len, min, max) {
  if (len >= min && len <= max) return 'text-green-600';
  if (len > max) return 'text-red-500';
  return 'text-slate-400';
}

export default function EditorTab({ subject, setSubject, preheader, setPreheader, htmlBody, setHtmlBody }) {
  const [previewMode, setPreviewMode] = useState('desktop');

  return (
    <div className="space-y-4">
      {/* Subject Line */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subject Line</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="your march update from bill"
          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy"
        />
        <p className={`text-xs mt-1 ${charColor(subject.length, 30, 45)}`}>
          {subject.length} characters {subject.length >= 30 && subject.length <= 45 ? '— ideal length' : subject.length > 45 ? '— too long for mobile' : '— target 30–45'}
        </p>
      </div>

      {/* Preheader */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Preheader Text</label>
        <input
          type="text"
          value={preheader}
          onChange={(e) => setPreheader(e.target.value)}
          placeholder="your policy update + a savings tip inside"
          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy"
        />
        <p className={`text-xs mt-1 ${charColor(preheader.length, 35, 55)}`}>
          {preheader.length} characters {preheader.length >= 35 && preheader.length <= 55 ? '— ideal length' : '— target 35–55'}
        </p>
      </div>

      {/* Personalization Hint */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-800">
          📌 <strong>Personalization placeholders</strong> your HTML can use:{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">{'{{FIRST_NAME}}'}</code> ·{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">{'{{FULL_NAME}}'}</code> ·{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">{'{{UNSUBSCRIBE_LINK}}'}</code> ·{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">{'{{OPT_OUT_URL}}'}</code>{' '}
          — Apps Script injects these at send time.
        </p>
      </div>

      {/* Split Pane */}
      <div className="grid grid-cols-2 gap-4" style={{ minHeight: 520 }}>
        {/* Editor */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-[#e2e8f0] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">HTML Editor</span>
            <span className="text-[10px] text-slate-400 font-mono">{htmlBody.length.toLocaleString()} chars</span>
          </div>
          <textarea
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            placeholder="Paste your newsletter HTML here..."
            className="flex-1 w-full p-4 font-mono text-xs resize-none focus:outline-none text-slate-700 leading-relaxed"
            style={{ minHeight: 480 }}
          />
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-[#e2e8f0] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Live Preview</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`text-xs px-2 py-1 rounded ${previewMode === 'desktop' ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                🖥 Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`text-xs px-2 py-1 rounded ${previewMode === 'mobile' ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                📱 Mobile
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-[#f1f5f9] p-3 flex justify-center">
            {htmlBody ? (
              <iframe
                srcDoc={htmlBody}
                title="Newsletter Preview"
                className="bg-white border border-[#e2e8f0] rounded-lg"
                style={{
                  width: previewMode === 'mobile' ? 375 : '100%',
                  height: '100%',
                  minHeight: 460,
                  border: 'none',
                }}
              />
            ) : (
              <div className="flex items-center justify-center text-slate-400 text-sm h-full">
                Paste HTML in the editor to preview it here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
