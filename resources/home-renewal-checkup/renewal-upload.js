(() => {
  const form = document.getElementById('renewal-upload-form');
  const fileInput = document.getElementById('renewal-files');
  const cameraInput = document.getElementById('renewal-camera');
  const fileList = document.getElementById('renewal-file-list');
  const errorBox = document.getElementById('renewal-upload-error');
  const submitButton = document.getElementById('renewal-submit');
  const success = document.getElementById('renewal-upload-success');
  const endpoint = '/api/home-renewal-upload';
  const maxFiles = 6;
  const maxFileBytes = 8 * 1024 * 1024;
  const maxTotalBytes = 12 * 1024 * 1024;
  const selectedFiles = [];
  let submitted = false;

  function showError(text) {
    errorBox.textContent = text;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.textContent = '';
    errorBox.hidden = true;
  }

  function fileType(file) {
    const types = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', heic: 'image/heic', heif: 'image/heif', webp: 'image/webp' };
    const extension = (file.name || '').split('.').pop().toLowerCase();
    return types[extension] || '';
  }

  function allowed(file) {
    return Boolean(fileType(file)) && (!file.type || file.type === fileType(file) || file.type === 'application/octet-stream' ||
      (fileType(file) === 'image/heic' && file.type === 'image/heic-sequence') ||
      (fileType(file) === 'image/heif' && file.type === 'image/heif-sequence'));
  }

  function totalBytes() {
    return selectedFiles.reduce((sum, file) => sum + file.size, 0);
  }

  function renderFiles() {
    fileList.replaceChildren();
    selectedFiles.forEach((file, index) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      const remove = document.createElement('button');
      name.textContent = `${file.name || `Page ${index + 1}`} (${Math.max(1, Math.round(file.size / 1024))} KB)`;
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${file.name || `page ${index + 1}`}`);
      remove.addEventListener('click', () => {
        selectedFiles.splice(index, 1);
        clearError();
        renderFiles();
      });
      item.append(name, remove);
      fileList.append(item);
    });
  }

  function addFiles(files) {
    clearError();
    for (const file of Array.from(files || [])) {
      if (selectedFiles.length >= maxFiles) {
        showError('You can add up to 6 pages. Remove one before adding another.');
        break;
      }
      if (!allowed(file)) {
        showError('Please choose a PDF or image file.');
        continue;
      }
      if (file.size > maxFileBytes) {
        showError(`${file.name || 'This file'} is over 8 MB. Please choose a smaller file.`);
        continue;
      }
      if (totalBytes() + file.size > maxTotalBytes) {
        showError('Your files together are over 12 MB. Please choose fewer or smaller pages.');
        break;
      }
      selectedFiles.push(file);
    }
    renderFiles();
  }

  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = '';
  });
  cameraInput.addEventListener('change', () => {
    addFiles(cameraInput.files);
    cameraInput.value = '';
  });

  function readAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitted || submitButton.disabled) return;
    if (document.getElementById('renewal-website').value.trim()) return;
    clearError();
    if (selectedFiles.length === 0) {
      showError('Please add a clear renewal photo or PDF before sending.');
      fileInput.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending your renewal…';
    try {
      const files = [];
      for (const file of selectedFiles) {
        files.push({
          name: file.name || 'renewal-page.jpg',
          type: fileType(file),
          sizeKB: Math.max(1, Math.round(file.size / 1024)),
          base64: await readAsBase64(file)
        });
      }

      const payload = {
        formType: 'policy-upload',
        name: document.getElementById('renewal-name').value.trim(),
        phone: document.getElementById('renewal-phone').value.trim(),
        email: document.getElementById('renewal-email').value.trim(),
        policyType: 'home',
        currentCarrier: document.getElementById('renewal-carrier').value.trim(),
        renewalDate: document.getElementById('renewal-date').value.trim(),
        notes: document.getElementById('renewal-checkup-notes').value.trim(),
        source: 'upload-policy-page',
        files,
        fileName: files[0].name,
        fileType: files[0].type,
        fileSizeKB: files[0].sizeKB,
        fileBase64: files[0].base64
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || result?.ok !== true || result.formType !== 'policy-upload') throw new Error('unconfirmed');
      submitted = true;
      try { if (typeof window.bliTrackConversion === 'function') {
        window.bliTrackConversion('policy_upload_submit', { lead_type: 'policy_upload', policy_type: 'home', upload_pages: files.length, cta_source: 'home_renewal_checkup', service_line: 'home' });
      } } catch (_) { /* Tracking must not hide a confirmed upload. */ }
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (_) {
      showError('We could not confirm your renewal was received. Please call (336) 835-1993 before sending it again.');
      submitButton.disabled = false;
      submitButton.textContent = 'Send my renewal for review';
    }
  });
})();
