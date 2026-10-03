(() => {
  const cards = [...document.querySelectorAll('.check-card')];
  const count = document.getElementById('progress-count');
  const fill = document.getElementById('progress-fill');
  const message = document.getElementById('progress-message');
  const clear = document.getElementById('clear-checks');
  const summary = document.getElementById('notes-summary');
  const summaryList = document.getElementById('summary-list');
  const copyButton = document.getElementById('copy-notes');
  const copyStatus = document.getElementById('copy-status');
  const reviewLink = document.getElementById('policy-review-link');
  const transferStatus = document.getElementById('transfer-status');
  const answersKey = 'bli-home-renewal-checkup-v2';
  const transferKey = 'bli-home-renewal-policy-notes';

  function selection(card) {
    return card.querySelector('[data-status]:checked')?.value || '';
  }

  function issues() {
    return cards.filter(card => selection(card) === 'needs-review').map(card => ({
      title: card.querySelector('h3').textContent.trim(),
      note: card.querySelector('[data-note]').value.trim() || 'I would like to discuss this.'
    }));
  }

  function notesText() {
    return 'Home insurance renewal checkup:\n\n' + issues()
      .map(item => `${item.title}\n${item.note}`).join('\n\n');
  }

  function update() {
    let reviewed = 0;
    cards.forEach(card => {
      const status = selection(card);
      const needsReview = status === 'needs-review';
      if (status) reviewed++;
      card.querySelector('[data-detail]').hidden = !needsReview;
      card.classList.toggle('is-complete', status === 'okay');
      card.classList.toggle('has-issue', needsReview);
    });

    count.textContent = `${reviewed} of ${cards.length}`;
    fill.style.width = `${reviewed / cards.length * 100}%`;
    message.textContent = reviewed === cards.length
      ? 'You have reviewed all five. Your questions are ready below.'
      : 'Choose an answer for each item as you go.';

    const items = issues();
    summary.hidden = items.length === 0;
    document.getElementById('renewal-checkup-notes').value = items.length ? notesText() : '';
    summaryList.replaceChildren();
    items.forEach(item => {
      const li = document.createElement('li');
      const title = document.createElement('strong');
      const note = document.createElement('p');
      title.textContent = item.title;
      note.textContent = item.note;
      li.append(title, note);
      summaryList.append(li);
    });

    try {
      sessionStorage.setItem(answersKey, JSON.stringify(cards.map(card => ({
        status: selection(card), note: card.querySelector('[data-note]').value
      }))));
    } catch (_) { /* The checkup still works when browser storage is unavailable. */ }
  }

  try {
    const saved = JSON.parse(sessionStorage.getItem(answersKey) || '[]');
    cards.forEach((card, index) => {
      const answer = saved[index];
      if (!answer) return;
      const radio = [...card.querySelectorAll('[data-status]')]
        .find(input => input.value === answer.status);
      if (radio) radio.checked = true;
      if (typeof answer.note === 'string') card.querySelector('[data-note]').value = answer.note;
    });
  } catch (_) { /* Start with blank answers. */ }

  cards.forEach(card => {
    card.querySelectorAll('[data-status]').forEach(input => input.addEventListener('change', () => {
      copyStatus.textContent = '';
      transferStatus.textContent = '';
      update();
      if (input.checked && input.value === 'needs-review') card.querySelector('[data-note]').focus();
    }));
    card.querySelector('[data-note]').addEventListener('input', () => {
      copyStatus.textContent = '';
      transferStatus.textContent = '';
      update();
    });
  });

  clear.addEventListener('click', () => {
    cards.forEach(card => {
      card.querySelectorAll('[data-status]').forEach(input => { input.checked = false; });
      card.querySelector('[data-note]').value = '';
    });
    copyStatus.textContent = '';
    transferStatus.textContent = '';
    try { sessionStorage.removeItem(transferKey); } catch (_) { /* Optional storage. */ }
    update();
    cards[0].querySelector('[data-status]').focus();
  });

  copyButton.addEventListener('click', async () => {
    const value = notesText();
    try {
      await navigator.clipboard.writeText(value);
      copyStatus.textContent = 'Copied. You can paste these notes into a message or quote form.';
    } catch (_) {
      copyStatus.textContent = 'Copy did not work in this browser. Your notes are still shown above.';
    }
  });

  reviewLink.addEventListener('click', event => {
    transferStatus.textContent = '';
    try {
      if (issues().length) sessionStorage.setItem(transferKey, notesText());
      else sessionStorage.removeItem(transferKey);
    } catch (_) {
      if (issues().length) {
        event.preventDefault();
        transferStatus.textContent = 'Your browser could not carry the notes. Copy them first, then open the policy review form.';
        summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  update();
})();
