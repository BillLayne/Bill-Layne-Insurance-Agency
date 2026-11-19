/* Auto Quote V2 — coverage help panels.
   EDIT THE WORDING HERE. Each entry has a title, one plain-language explanation, and one example.
   Keep the careful wording ("may pay", "may help"). No prices, no savings claims.
   Loaded before app.js. A tap on any element with data-help="<key>" opens the matching panel. */
(function () {
  'use strict';

  var HELP = {
    coverage_type: {
      title: 'State minimum or full coverage?',
      body: 'State minimum is liability only. It may pay for injuries and damage you cause to other people. It does not pay to fix your own car. Full coverage adds comprehensive and collision, which may pay to repair or replace your own car.',
      example: 'You slide off the road and hit a fence. Liability may pay for the fence. Only full coverage may pay to repair your car.'
    },
    liability_limits: {
      title: 'What the three numbers mean',
      body: 'They are the most your policy may pay, in thousands of dollars, when you cause a crash. First number: one injured person. Second: everyone injured in that crash. Third: damage to other people’s property. 50/100/50 is the North Carolina minimum.',
      example: 'With 100/300/100, the policy may pay up to $100,000 for one person’s injuries, up to $300,000 for everyone hurt, and up to $100,000 for the other driver’s car and property.'
    },
    deductible: {
      title: 'Deductible',
      body: 'The part of a covered repair bill you pay yourself before your coverage pays. You choose the amount. A higher deductible means you pay more out of pocket when you have a claim.',
      example: 'With a $500 deductible and a $3,000 covered repair, you pay $500 and the policy may pay the remaining $2,500.'
    },
    comprehensive: {
      title: 'Comprehensive',
      body: 'May pay to fix or replace your car when the damage is not from a crash with another vehicle: theft, hail, a falling tree, fire, flood, broken glass, or hitting a deer.',
      example: 'A deer runs out on US-21 and damages your front end. You pay your deductible and the policy may pay the rest of the repair.'
    },
    collision: {
      title: 'Collision',
      body: 'May pay to fix or replace your car after it hits another vehicle or an object, or rolls over, no matter who was at fault.',
      example: 'You slide into a guardrail on an icy morning. You pay your deductible and the policy may pay the rest of the repair.'
    },
    rental_reimbursement: {
      title: 'Rental car (loss of use)',
      body: 'May pay toward a rental car while yours is being repaired after a covered claim, up to a daily amount and a total limit set by the policy.',
      example: 'Your car is in the body shop for nine days after a covered crash. This may cover a rental car for those days, up to the policy limits.'
    },
    roadside_assistance: {
      title: 'Towing and roadside',
      body: 'May pay for a tow, a jump start, a flat tire change, fuel delivery or a lockout, up to the limit on your policy.',
      example: 'Your battery dies in a parking lot in Elkin and you need a jump start or a tow to the shop.'
    },
    medical_payments: {
      title: 'Medical payments',
      body: 'May help pay medical bills for you and your passengers after a crash, no matter who was at fault, up to the limit you choose.',
      example: 'You and a passenger go to the emergency room after a crash. This may help with those bills while fault is still being sorted out.'
    }
  };

  var overlay = null, lastTrigger = null, isOpen = false, pushedState = false, skipNextPop = false;

  function build() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'v2-help-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="v2-help-title" tabindex="-1">' +
        '<div class="v2-help-grip" aria-hidden="true"></div>' +
        '<div class="v2-help-head">' +
          '<h2 class="v2-help-title" id="v2-help-title"></h2>' +
          '<button type="button" class="v2-help-x" aria-label="Close">×</button>' +
        '</div>' +
        '<p class="v2-help-body" id="v2-help-body"></p>' +
        '<div class="v2-help-example"><strong>Example</strong><p id="v2-help-example"></p></div>' +
        '<p class="v2-help-fine">General information only. Your policy sets the exact coverage, limits and exclusions. Ask the team if you have a question.</p>' +
        '<button type="button" class="v2-btn-gold v2-help-ok">Got it</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('.v2-help-x') || e.target.closest('.v2-help-ok')) close();
    });
  }

  function open(key, trigger) {
    var h = HELP[key];
    if (!h) return;
    build();
    lastTrigger = trigger || null;
    document.getElementById('v2-help-title').textContent = h.title;
    document.getElementById('v2-help-body').textContent = h.body;
    document.getElementById('v2-help-example').textContent = h.example;
    overlay.hidden = false;
    document.body.classList.add('v2-help-open');
    isOpen = true;
    // One extra history entry so the phone's Back button closes the panel instead of leaving the question.
    try {
      var st = Object.assign({}, window.history.state || {}, { v2help: true });
      window.history.pushState(st, '');
      pushedState = true;
    } catch (_) { pushedState = false; }
    var sheet = overlay.querySelector('.v2-help-sheet');
    requestAnimationFrame(function () {
      overlay.classList.add('is-in');
      try { sheet.focus({ preventScroll: true }); } catch (_) {}
    });
  }

  function hide() {
    if (!overlay || !isOpen) return;
    isOpen = false;
    overlay.classList.remove('is-in');
    overlay.hidden = true;
    document.body.classList.remove('v2-help-open');
    if (lastTrigger && document.contains(lastTrigger)) {
      try { lastTrigger.focus({ preventScroll: true }); } catch (_) {}
    }
    lastTrigger = null;
  }

  function close() {
    if (!isOpen) return;
    hide();
    if (pushedState) {
      pushedState = false;
      skipNextPop = true;      // the history.back() below must not move the form to another question
      try { window.history.back(); } catch (_) { skipNextPop = false; }
    }
  }

  // Called first thing by app.js's popstate handler. Returns true when the event was only about the help panel.
  function handlePopstate() {
    if (skipNextPop) { skipNextPop = false; return true; }
    if (isOpen) { pushedState = false; hide(); return true; }
    return false;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-help]');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    open(t.getAttribute('data-help'), t);
  }, true);

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {            // keep keyboard focus inside the panel
      var f = overlay.querySelectorAll('button');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === overlay.querySelector('.v2-help-sheet'))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.BLICoverageHelp = {
    has: function (key) { return !!HELP[key]; },
    title: function (key) { return HELP[key] ? HELP[key].title : ''; },
    open: open,
    close: close,
    isOpen: function () { return isOpen; },
    handlePopstate: handlePopstate
  };
})();
