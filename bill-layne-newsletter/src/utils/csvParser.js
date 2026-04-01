import Papa from 'papaparse';

export function resolveContact(row) {
  const name = (row.Name || '').trim();
  const biz = (row['Business Name'] || '').trim();

  // Display name: prefer Name, fall back to Business Name
  const displayName = name || biz;

  // First name: first word of display name, title-cased
  const words = displayName.split(/\s+/).filter(Boolean);
  const firstName = words[0]
    ? words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase()
    : 'Friend';

  // Email validation: must have @, a dot, and be more than 3 chars
  const emailRaw = (row.Email || '').trim();
  const email =
    emailRaw.length > 3 && emailRaw.includes('@') && emailRaw.includes('.')
      ? emailRaw.toLowerCase()
      : '';

  // Flagged: deceased, DBA references, or suspicious patterns
  const flagged = /deceased|d\.b\.a|dba\b|\(deceased\)/i.test(displayName);

  return { recno: row.RECNO, displayName, firstName, email, flagged };
}

export function parseAndDedup(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rawRows = parsed.data;
  const seen = new Set();

  const contacts = rawRows.map((row) => {
    const c = resolveContact(row);
    const isDupe = c.email ? seen.has(c.email) : false;
    if (c.email) seen.add(c.email);
    const include = !!c.email && !isDupe && !c.flagged;
    return { ...c, isDupe, hasEmail: !!c.email, include };
  });

  const stats = {
    total: contacts.length,
    hasEmail: contacts.filter((c) => c.hasEmail).length,
    noEmail: contacts.filter((c) => !c.hasEmail).length,
    dupes: contacts.filter((c) => c.isDupe).length,
    flagged: contacts.filter((c) => c.flagged && c.hasEmail).length,
    sendable: contacts.filter((c) => c.include).length,
  };

  return { contacts, stats };
}
