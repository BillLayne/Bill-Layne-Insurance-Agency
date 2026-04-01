import { useCallback, useMemo, useState, useRef } from 'react';
import { parseAndDedup } from '../utils/csvParser';

const STAT_CARDS = [
  { key: 'total', label: 'Total Records', color: 'bg-[#f8fafc] border-[#e2e8f0]', numColor: 'text-slate-700' },
  { key: 'hasEmail', label: 'Have Email', color: 'bg-[#eff6ff] border-[#bfdbfe]', numColor: 'text-navy' },
  { key: 'noEmail', label: 'No Email', color: 'bg-[#f8fafc] border-[#e2e8f0]', numColor: 'text-slate-500' },
  { key: 'dupes', label: 'Dupes Removed', color: 'bg-[#fffbeb] border-[#fde68a]', numColor: 'text-amber-600' },
  { key: 'flagged', label: 'Flagged — Review', color: 'bg-[#fef2f2] border-[#fecaca]', numColor: 'text-red-500' },
  { key: 'sendable', label: 'Ready to Send', color: 'bg-[#f0fdf4] border-[#86efac]', numColor: 'text-green-600' },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'send', label: 'Send' },
  { id: 'noEmail', label: 'No Email' },
  { id: 'dupes', label: 'Dupes' },
  { id: 'review', label: 'Review' },
];

function statusBadge(c, optOuts) {
  if (!c.hasEmail) return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1f5f9] text-slate-500">NO EMAIL</span>;
  if (c.isDupe) return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#fffbeb] text-amber-600">DUPE</span>;
  if (c.flagged) return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#fef2f2] text-red-500">REVIEW</span>;
  if (optOuts.includes(c.email)) return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#fef2f2] text-red-500">OPT-OUT</span>;
  if (c.include) return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#f0fdf4] text-green-600">&check; SEND</span>;
  return null;
}

export default function ContactsTab({ contacts, setContacts, stats, setStats, optOuts }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const { contacts: parsed, stats: s } = parseAndDedup(e.target.result);
      setContacts(parsed);
      setStats(s);
    };
    reader.readAsText(file);
  }, [setContacts, setStats]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
  }, [handleFile]);

  const filtered = useMemo(() => {
    let list = contacts;
    switch (filter) {
      case 'send': list = list.filter((c) => c.include && !optOuts.includes(c.email)); break;
      case 'noEmail': list = list.filter((c) => !c.hasEmail); break;
      case 'dupes': list = list.filter((c) => c.isDupe); break;
      case 'review': list = list.filter((c) => c.flagged && c.hasEmail); break;
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.displayName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    return list;
  }, [contacts, filter, search, optOuts]);

  const filterCounts = useMemo(() => ({
    all: contacts.length,
    send: contacts.filter((c) => c.include && !optOuts.includes(c.email)).length,
    noEmail: contacts.filter((c) => !c.hasEmail).length,
    dupes: contacts.filter((c) => c.isDupe).length,
    review: contacts.filter((c) => c.flagged && c.hasEmail).length,
  }), [contacts, optOuts]);

  const showList = filtered.slice(0, 250);

  if (!contacts.length) {
    return (
      <div
        className={`border-2 border-dashed rounded-xl p-16 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-navy bg-blue-50' : 'border-[#e2e8f0] bg-white'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <p className="text-4xl mb-3">📂</p>
        <p className="text-lg font-bold text-slate-700 mb-1">Drop your Agency Matrix CSV here</p>
        <p className="text-sm text-slate-400">or click to browse. Accepts .csv files only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className={`rounded-xl border p-4 ${card.color}`}>
            <p className={`text-[22px] font-extrabold font-mono ${card.numColor}`}>
              {(stats?.[card.key] ?? 0).toLocaleString()}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              filter === f.id ? 'bg-navy text-white' : 'bg-white border border-[#e2e8f0] text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.id === 'send' && '✅ '}{f.label} · {filterCounts[f.id]?.toLocaleString()}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto text-sm border border-[#e2e8f0] rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:border-navy"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Name</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">First Name</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Email</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {showList.map((c, i) => (
              <tr key={c.recno || i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'}>
                <td className="px-4 py-2 text-slate-800">{c.displayName || '—'}</td>
                <td className="px-4 py-2 text-slate-600">{c.firstName}</td>
                <td className="px-4 py-2 text-slate-600 font-mono text-xs">{c.email || '—'}</td>
                <td className="px-4 py-2">{statusBadge(c, optOuts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 250 && (
          <div className="text-center text-xs text-slate-400 py-2 border-t border-[#e2e8f0]">
            Showing 250 of {filtered.length.toLocaleString()}
          </div>
        )}
      </div>

      {/* Re-upload */}
      <div className="text-center">
        <button
          onClick={() => { setContacts([]); setStats(null); }}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          Clear &amp; upload a different CSV
        </button>
      </div>
    </div>
  );
}
