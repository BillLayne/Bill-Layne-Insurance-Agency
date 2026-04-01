import { useState, useMemo } from 'react';
import Header from './components/Header';
import TabNav from './components/TabNav';
import ContactsTab from './components/ContactsTab';
import EditorTab from './components/EditorTab';
import OptOutsTab from './components/OptOutsTab';
import SendTab from './components/SendTab';
import ScriptTab from './components/ScriptTab';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [optOuts, setOptOuts] = useState([]);
  const [appsScriptUrl, setAppsScriptUrl] = useState('https://script.google.com/macros/s/AKfycbzv-euYHAHqC_3hLCxI5ZX5FMozaRhKlwBOR8C_1pfvQZuypl9qgVHdMxa8j5NYk0Ql/exec');
  const [activeTab, setActiveTab] = useState('contacts');
  const [sendStatus, setSendStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const sendableCount = useMemo(() => {
    return contacts.filter((c) => c.include && !optOuts.includes(c.email)).length;
  }, [contacts, optOuts]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Header sendableCount={sendableCount} />
        <TabNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          optOutCount={optOuts.length}
        />

        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={contacts}
            setContacts={setContacts}
            stats={stats}
            setStats={setStats}
            optOuts={optOuts}
          />
        )}
        {activeTab === 'editor' && (
          <EditorTab
            subject={subject}
            setSubject={setSubject}
            preheader={preheader}
            setPreheader={setPreheader}
            htmlBody={htmlBody}
            setHtmlBody={setHtmlBody}
          />
        )}
        {activeTab === 'optouts' && (
          <OptOutsTab optOuts={optOuts} setOptOuts={setOptOuts} />
        )}
        {activeTab === 'send' && (
          <SendTab
            subject={subject}
            preheader={preheader}
            htmlBody={htmlBody}
            contacts={contacts}
            optOuts={optOuts}
            appsScriptUrl={appsScriptUrl}
            setAppsScriptUrl={setAppsScriptUrl}
            sendStatus={sendStatus}
            setSendStatus={setSendStatus}
            sending={sending}
            setSending={setSending}
          />
        )}
        {activeTab === 'script' && <ScriptTab />}

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Bill Layne Insurance Agency &bull; Newsletter Manager v1.0 &bull; 2026
        </div>
      </div>
    </div>
  );
}
