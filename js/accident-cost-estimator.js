/**
 * Accident Cost Estimator — Homepage Lead Magnet
 * Bill Layne Insurance Agency
 * Vanilla JS, no dependencies
 */
(function() {
    'use strict';

    // Cost data based on NC averages
    const VEHICLE_COSTS = {
        '10000': 10000,
        '20000': 20000,
        '30000': 30000,
        '40000': 40000,
        '50000': 55000
    };

    const INJURY_COSTS = {
        'minor':    { low: 5000,   high: 15000,  label: 'Minor (sprains, bruises)' },
        'moderate': { low: 15000,  high: 50000,  label: 'Moderate (fractures, concussion)' },
        'serious':  { low: 50000,  high: 150000, label: 'Serious (surgery required)' },
        'severe':   { low: 150000, high: 500000, label: 'Severe (ICU, long-term care)' }
    };

    const PROPERTY_COSTS = {
        'none':  0,
        'minor': 5000,
        'major': 25000
    };

    function calculate() {
        var vehicleVal  = document.getElementById('ace-vehicle').value;
        var injuryVal   = document.getElementById('ace-injury').value;
        var propertyVal = document.getElementById('ace-property').value;
        var resultEl    = document.getElementById('ace-result');
        var resultNum   = document.getElementById('ace-result-number');
        var resultNote  = document.getElementById('ace-result-note');
        var ctaWrap     = document.getElementById('ace-cta-wrap');

        if (!vehicleVal || !injuryVal || !propertyVal) {
            resultEl.style.display = 'none';
            ctaWrap.style.display = 'none';
            return;
        }

        var vehicleCost  = VEHICLE_COSTS[vehicleVal] || 0;
        var injury       = INJURY_COSTS[injuryVal];
        var injuryCost   = Math.round((injury.low + injury.high) / 2);
        var propertyCost = PROPERTY_COSTS[propertyVal] || 0;
        var total        = vehicleCost + injuryCost + propertyCost;

        // Animate the number
        resultEl.style.display = 'block';
        ctaWrap.style.display = 'block';
        animateNumber(resultNum, total);

        // Context note
        var low  = vehicleCost + injury.low + propertyCost;
        var high = vehicleCost + injury.high + propertyCost;
        resultNote.textContent = 'Range: $' + low.toLocaleString() + ' – $' + high.toLocaleString() + ' depending on circumstances';
    }

    function animateNumber(el, target) {
        var start = 0;
        var duration = 600;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(eased * target);
            el.textContent = '$' + current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    // Attach listeners once DOM is ready
    function init() {
        var selects = document.querySelectorAll('.ace-select');
        for (var i = 0; i < selects.length; i++) {
            selects[i].addEventListener('change', calculate);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
