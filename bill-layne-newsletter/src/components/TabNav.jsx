const TABS = [
  { id: 'contacts', label: 'Contacts', icon: '👥' },
  { id: 'editor', label: 'Newsletter', icon: '✉️' },
  { id: 'optouts', label: 'Opt-Outs', icon: '🚫' },
  { id: 'send', label: 'Send', icon: '🚀' },
  { id: 'script', label: 'Apps Script', icon: '⚙️' },
];

export default function TabNav({ activeTab, setActiveTab, stats, optOutCount }) {
  function getBadge(id) {
    if (!stats) return null;
    switch (id) {
      case 'contacts': return stats.total || null;
      case 'editor': return null;
      case 'optouts': return optOutCount || null;
      case 'send': return stats.sendable || null;
      case 'script': return null;
      default: return null;
    }
  }

  return (
    <div className="bg-[#e2e8f0] rounded-[11px] p-1 flex gap-1 mb-4 overflow-x-auto">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        const badge = getBadge(tab.id);
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              active
                ? 'bg-white text-navy shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {badge != null && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active
                    ? 'bg-navy/10 text-navy'
                    : 'bg-slate-300/50 text-slate-500'
                }`}
              >
                {badge.toLocaleString()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
