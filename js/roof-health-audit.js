/**
 * MyRoofage Roof Health Audit - JavaScript Logic
 * Powered by Bill Layne Insurance
 *
 * Handles multi-image upload, validation, Cloudflare Worker API calls,
 * and results rendering for AI-powered roof condition assessment.
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  // UPDATE THIS after deploying your Cloudflare Worker:
  const WORKER_URL = 'https://roof-health-audit.bill-7e3.workers.dev/analyze';

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // ============================================================
  // STATE
  // ============================================================
  let files = [];
  let previewUrls = [];
  let isAnalyzing = false;
  let result = null;

  // ============================================================
  // DOM REFERENCES
  // ============================================================
  const uploadSection = document.getElementById('upload-section');
  const previewSection = document.getElementById('preview-section');
  const analyzingSection = document.getElementById('analyzing-section');
  const resultsSection = document.getElementById('results-section');
  const errorBox = document.getElementById('error-box');
  const errorText = document.getElementById('error-text');
  const photoGrid = document.getElementById('photo-grid');
  const photoCount = document.getElementById('photo-count');
  const analyzeBtn = document.getElementById('analyze-btn');
  const addMoreSection = document.getElementById('add-more-section');
  const dropZone = document.getElementById('drop-zone');

  // ============================================================
  // FILE HANDLING
  // ============================================================
  function handleFileSelect(e) {
    e.stopPropagation();
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-blue-400', 'bg-blue-50');
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      processFiles(imageFiles);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('border-blue-400', 'bg-blue-50');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('border-blue-400', 'bg-blue-50');
  }

  function processFiles(newFiles) {
    let errorMsg = null;
    const remainingSlots = MAX_FILES - files.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);

    if (newFiles.length > remainingSlots && remainingSlots > 0) {
      errorMsg = 'Only the first ' + remainingSlots + ' images were added. Max ' + MAX_FILES + ' photos allowed.';
    } else if (remainingSlots === 0) {
      errorMsg = 'Maximum of ' + MAX_FILES + ' photos reached.';
      showError(errorMsg);
      return;
    }

    const validFiles = [];
    filesToAdd.forEach(function(file) {
      if (!VALID_TYPES.includes(file.type)) {
        errorMsg = 'Some files were skipped. Please upload only JPG, PNG, or WebP images.';
      } else if (file.size > MAX_FILE_SIZE) {
        errorMsg = 'Some files were too large. Max size is 10MB per image.';
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      validFiles.forEach(function(file) {
        files.push(file);
        previewUrls.push(URL.createObjectURL(file));
      });
      result = null;
      updateUI();
    }

    if (errorMsg) {
      showError(errorMsg);
    } else {
      hideError();
    }
  }

  function removeFile(index) {
    URL.revokeObjectURL(previewUrls[index]);
    files.splice(index, 1);
    previewUrls.splice(index, 1);
    result = null;
    updateUI();
  }

  function resetAudit() {
    previewUrls.forEach(function(url) { URL.revokeObjectURL(url); });
    files = [];
    previewUrls = [];
    result = null;
    isAnalyzing = false;
    hideError();
    updateUI();
  }

  // ============================================================
  // API CALL
  // ============================================================
  async function analyzeRoof() {
    if (files.length === 0 || isAnalyzing) return;

    isAnalyzing = true;
    hideError();
    updateUI();

    try {
      // Convert all files to base64
      const images = await Promise.all(files.map(function(file) {
        return new Promise(function(resolve, reject) {
          var reader = new FileReader();
          reader.onload = function() {
            var base64Data = reader.result.split(',')[1];
            resolve({ data: base64Data, mimeType: file.type });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }));

      // Call Cloudflare Worker
      var response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: images,
          prompt: 'Analyze these ' + images.length + ' roof photos and provide a comprehensive Roof Health Audit based on all angles provided.'
        })
      });

      if (!response.ok) {
        var errData = await response.json().catch(function() { return {}; });
        throw new Error(errData.error || 'Server error: ' + response.status);
      }

      var data = await response.json();
      result = data;
      isAnalyzing = false;
      updateUI();

    } catch (err) {
      console.error('Roof analysis error:', err);
      isAnalyzing = false;
      showError('Failed to analyze the images. Please try again. (' + err.message + ')');
      updateUI();
    }
  }

  // ============================================================
  // UI RENDERING
  // ============================================================
  function updateUI() {
    // Hide all sections first
    uploadSection.classList.add('hidden');
    previewSection.classList.add('hidden');
    analyzingSection.classList.add('hidden');
    resultsSection.classList.add('hidden');

    if (isAnalyzing) {
      // Show analyzing spinner
      previewSection.classList.remove('hidden');
      analyzingSection.classList.remove('hidden');
      renderPhotoGrid();
      addMoreSection.classList.add('hidden');
      analyzeBtn.parentElement.classList.add('hidden');
      document.getElementById('analyzing-count').textContent = files.length;
      return;
    }

    if (result) {
      // Show results
      previewSection.classList.remove('hidden');
      resultsSection.classList.remove('hidden');
      renderPhotoGrid();
      addMoreSection.classList.add('hidden');
      analyzeBtn.parentElement.classList.add('hidden');
      renderResults();
      return;
    }

    if (files.length === 0) {
      // Show upload landing
      uploadSection.classList.remove('hidden');
    } else {
      // Show preview with photos
      previewSection.classList.remove('hidden');
      renderPhotoGrid();
      addMoreSection.classList.remove('hidden');
      analyzeBtn.parentElement.classList.remove('hidden');
      if (files.length >= MAX_FILES) {
        addMoreSection.classList.add('hidden');
      }
    }

    photoCount.textContent = files.length + '/' + MAX_FILES;
  }

  function renderPhotoGrid() {
    photoGrid.innerHTML = '';
    photoCount.textContent = files.length + '/' + MAX_FILES;

    previewUrls.forEach(function(url, index) {
      var div = document.createElement('div');
      div.className = 'relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group';

      var img = document.createElement('img');
      img.src = url;
      img.alt = 'Roof photo ' + (index + 1);
      img.className = 'w-full h-full object-cover';
      div.appendChild(img);

      // Photo number badge
      var badge = document.createElement('div');
      badge.className = 'absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded';
      badge.textContent = '#' + (index + 1);
      div.appendChild(badge);

      if (!isAnalyzing && !result) {
        var btn = document.createElement('button');
        btn.className = 'absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors';
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        btn.title = 'Remove photo';
        btn.onclick = (function(i) { return function() { removeFile(i); }; })(index);
        div.appendChild(btn);
      }

      photoGrid.appendChild(div);
    });
  }

  function renderResults() {
    if (!result) return;

    // Score
    var scoreEl = document.getElementById('result-score');
    var verdictEl = document.getElementById('result-verdict');
    var scoreCard = document.getElementById('score-card');

    scoreEl.textContent = result.conditionScore;
    verdictEl.textContent = result.insuranceVerdict;

    // Score colors
    scoreEl.className = 'text-6xl md:text-7xl font-black tracking-tighter mb-4';
    scoreCard.className = 'rounded-2xl border-2 p-6 md:p-8 flex flex-col items-center justify-center text-center';
    if (result.conditionScore >= 80) {
      scoreEl.classList.add('text-emerald-600');
      scoreCard.classList.add('bg-emerald-50', 'border-emerald-200');
    } else if (result.conditionScore >= 60) {
      scoreEl.classList.add('text-amber-600');
      scoreCard.classList.add('bg-amber-50', 'border-amber-200');
    } else {
      scoreEl.classList.add('text-rose-600');
      scoreCard.classList.add('bg-rose-50', 'border-rose-200');
    }

    // Details
    document.getElementById('result-age').textContent = result.estimatedAgeRange;
    document.getElementById('result-material').textContent = result.roofMaterial;

    var confEl = document.getElementById('result-confidence');
    confEl.textContent = result.confidenceLevel;
    confEl.className = 'px-2 py-0.5 rounded-md text-[10px] uppercase font-bold';
    if (result.confidenceLevel === 'High') {
      confEl.classList.add('bg-emerald-100', 'text-emerald-700');
    } else if (result.confidenceLevel === 'Medium') {
      confEl.classList.add('bg-amber-100', 'text-amber-700');
    } else {
      confEl.classList.add('bg-rose-100', 'text-rose-700');
    }

    // Top Findings
    var findingsList = document.getElementById('result-findings');
    findingsList.innerHTML = '';
    (result.topFindings || []).forEach(function(finding) {
      var li = document.createElement('li');
      li.className = 'flex items-start gap-3 text-slate-700';
      li.innerHTML = '<div class="mt-1 bg-blue-50 p-1 rounded-full shrink-0"><svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><span class="leading-relaxed">' + escapeHtml(finding) + '</span>';
      findingsList.appendChild(li);
    });

    // Visual Evidence
    var evidenceList = document.getElementById('result-evidence');
    var evidenceCount = document.getElementById('result-photos-count');
    evidenceCount.textContent = result.photosAnalyzed + ' Photos Analyzed';
    evidenceList.innerHTML = '';
    (result.visualEvidence || []).forEach(function(ev) {
      var li = document.createElement('li');
      li.className = 'flex items-start gap-2 text-sm text-slate-600 italic';
      li.innerHTML = '<svg class="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span>' + escapeHtml(ev) + '</span>';
      evidenceList.appendChild(li);
    });

    // Limitations
    document.getElementById('result-limitations').textContent = result.limitationsNoted;

    // Next Best Action
    document.getElementById('result-action').textContent = result.nextBestAction;
  }

  function showError(msg) {
    errorBox.classList.remove('hidden');
    errorText.textContent = msg;
  }

  function hideError() {
    errorBox.classList.add('hidden');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================================
  // EVENT BINDING
  // ============================================================
  function init() {
    // All file inputs (initial + add more) use the same handler
    document.querySelectorAll('.roof-file-input').forEach(function(input) {
      input.addEventListener('change', handleFileSelect);
    });

    // Drop zone
    if (dropZone) {
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('dragleave', handleDragLeave);
      dropZone.addEventListener('drop', handleDrop);
    }

    // Analyze button
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', analyzeRoof);
    }

    // Reset buttons
    document.querySelectorAll('.reset-btn').forEach(function(btn) {
      btn.addEventListener('click', resetAudit);
    });

    // Dismiss error
    var dismissBtn = document.getElementById('dismiss-error');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', hideError);
    }

    // Initial UI state
    updateUI();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose reset for inline onclick if needed
  window.resetRoofAudit = resetAudit;
})();
