'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const paths = {
    camera: '<path d="M14 4h-4L8 7H3v14h18V7h-5z"/><circle cx="12" cy="13" r="4"/>',
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
    file: '<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8m-8 4h8"/>',
    clipboard: '<path d="M8 4H5v18h14V4h-3M8 2h8v5H8zM8 12h8m-8 5h6"/>',
    download: '<path d="M12 3v14m-6-6 6 6 6-6M5 21h14"/>',
    edit: '<path d="m15 4 5 5-12 12H3v-5zM13 6l5 5"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 16h12l1-16M10 10v8m4-8v8"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    close: '<path d="m5 5 14 14M5 19 19 5"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    upload: '<path d="M12 18V3m-6 6 6-6 6 6M3 16v5h18v-5"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
    shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z"/>',
    spinner: '<path d="M21 12a9 9 0 1 1-9-9"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
    save: '<path d="M3 3h15l3 3v15H3zM7 3v6h10V3M7 21v-8h10v8"/>'
  };
  const lineIcons = () => document.querySelectorAll('.inventory-app i').forEach(el => {
    const cls = el.className;
    const match = cls.match(/fa-(camera|image|house|home|door-open|file[^ ]*|clipboard[^ ]*|list-check|box-open|print|download|upload|pen[^ ]*|trash[^ ]*|copy|check[^ ]*|plus[^ ]*|times|chevron-down|robot|search|envelope|shield[^ ]*|spinner|save|bolt|sliders-h|info-circle|exclamation-triangle)/);
    const key = match ? match[1] : 'file';
    let name = key;
    if (/camera|image/.test(key)) name = 'camera';
    else if (/home|house|door|bolt/.test(key)) name = 'home';
    else if (/clipboard|list|box/.test(key)) name = 'clipboard';
    else if (/file|print/.test(key)) name = /arrow-down|pdf|excel/.test(key) ? 'download' : 'file';
    else if (/pen/.test(key)) name = 'edit';
    else if (/trash/.test(key)) name = 'trash';
    else if (/check/.test(key)) name = 'check';
    else if (/plus/.test(key)) name = 'plus';
    else if (key === 'times') name = 'close';
    else if (key === 'chevron-down') name = 'down';
    else if (key === 'robot') name = 'search';
    else if (key === 'envelope') name = 'mail';
    else if (/shield/.test(key)) name = 'shield';
    else if (/info|exclamation|sliders/.test(key)) name = 'info';
    if (el.dataset.lineIcon === name) return;
    el.dataset.lineIcon = name;
    el.classList.add('inventory-line-icon');
    el.setAttribute('aria-hidden','true');
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.file}</svg>`;
  });
  lineIcons();
  new MutationObserver(lineIcons).observe(document.querySelector('.inventory-app'), {childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  const openSection = (hash) => {
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    const details = target.closest('details');
    if (details) details.open = true;
    target.scrollIntoView({behavior: 'smooth', block: 'start'});
  };
  document.querySelectorAll('a[href="#quick-start"],a[href="#scan-list-section"]').forEach(link => {
    link.addEventListener('click', () => openSection(link.hash));
  });
  if (location.hash) openSection(location.hash);
  let previousCount = 0;
  const sync = () => {
    const count = Number(document.getElementById('item-count').textContent);
    document.getElementById('inventory-pdf').disabled = count === 0;
    document.getElementById('inventory-download-note').textContent = count ? 'Estimates are not a settlement amount. Downloaded reports do not send or open a claim.' : 'Add an item to enable PDF download.';
    document.querySelector('#export-bar button[onclick="exportCSV()"]').disabled = count === 0;
    document.querySelector('#export-bar button[onclick="emailAdjuster()"]').disabled = count === 0;
    if (count === 0 || previousCount === 0) document.getElementById('ai-all-btn').disabled = count === 0;
    previousCount = count;
  };
  const render = window.renderInventory;
  window.renderInventory = function () { render(); sync(); };
  sync();
  document.getElementById('ai-btn').classList.remove('hidden');
  document.getElementById('ai-btn').innerHTML = '<i class="fas fa-search"></i> Find estimated price';
  try {
    const data = JSON.parse(localStorage.getItem('bli_claims_inventory') || 'null');
    if (data && Array.isArray(data.inventory) && data.inventory.length) document.getElementById('inventory-resume').hidden = false;
  } catch (_) { /* Existing save-status message explains unavailable storage. */ }
  // Associate the retained controls with their visible labels.
  document.querySelectorAll('.inventory-app input[id],.inventory-app select[id],.inventory-app textarea[id]').forEach(input => {
    const label = input.closest('div')?.querySelector('label');
    if (label) label.htmlFor = input.id;
  });
  document.getElementById('photo-ai-result').setAttribute('role', 'status');
  document.getElementById('photo-ai-result').setAttribute('aria-live', 'polite');
  document.getElementById('ai-status').setAttribute('role', 'status');
  document.getElementById('ai-status').setAttribute('aria-live', 'polite');
  const photoInputs = ['item-photo','item-photo-camera'].map(id=>document.getElementById(id));
  photoInputs.forEach(input => {
    const label = input.closest('label');
    label.tabIndex = 0;
    label.setAttribute('role','button');
    label.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !input.disabled) {
        event.preventDefault(); input.click();
      }
    });
  });
  const upload = window.handlePhotoUpload;
  let uploading = false;
  window.handlePhotoUpload = async function (event) {
    if (uploading) return;
    uploading = true;
    photoInputs.forEach(input => {input.disabled=true;input.closest('label').setAttribute('aria-disabled','true');});
    document.getElementById('photo-preview').setAttribute('aria-busy','true');
    try { await upload(event); }
    finally {
      uploading = false;
      photoInputs.forEach(input => {input.disabled=false;input.closest('label').removeAttribute('aria-disabled');});
      document.getElementById('photo-preview').setAttribute('aria-busy','false');
    }
  };
});
