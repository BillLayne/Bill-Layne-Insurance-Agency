/* TEST PAGE ONLY (auto-quote-v2-test). Named steps under the progress bar.
   Reads the step the shared app.js saved to sessionStorage; app.js itself is untouched,
   so the live /auto-quote form does not change. */
(function () {
  'use strict';
  var KEY = 'bli_auto_v2_test_session';
  var NAMES = ['Vehicles', 'Insurance', 'Drivers', 'Coverage', 'Finish'];
  var MAP = {
    step_more: 0,
    step_5: 1, step_6: 1, step_7: 1, step_8: 1,
    step_9: 2, step_10: 2, step_11: 2, step_12: 2, step_17: 2,
    step_13: 3, step_14: 3, step_15: 3,
    step_16: 4, step_18: 4, step_19: 4,
    step_20: 5
  };

  function section(id) {
    if (!id) return 0;
    if (Object.prototype.hasOwnProperty.call(MAP, id)) return MAP[id];
    if (/^step_[1234][bcd]?$/.test(id)) return 0;
    return null;
  }

  function currentStep() {
    try {
      var snap = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (snap && snap.currentStepId) return snap.currentStepId;
    } catch (_) {}
    return (window.history.state && window.history.state.stepId) || 'step_1';
  }

  var list = document.getElementById('pv-steps');
  if (!list) return;
  list.innerHTML = NAMES.map(function (n, i) {
    return '<li class="pv-step" data-i="' + i + '"><span class="pv-dot" aria-hidden="true"></span><span class="pv-name">' + n + '</span></li>';
  }).join('');
  var items = list.querySelectorAll('.pv-step');
  var last = -1;

  function paint() {
    var s = section(currentStep());
    if (s === null || s === last) return;
    last = s;
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      li.classList.toggle('is-done', i < s);
      li.classList.toggle('is-now', i === s);
      if (i === s) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    }
  }

  var stage = document.getElementById('stage');
  if (stage && 'MutationObserver' in window) {
    new MutationObserver(paint).observe(stage, { childList: true });
  }
  window.addEventListener('popstate', function () { setTimeout(paint, 0); });
  paint();
})();
