/**
 * Accident Cost Estimator - Homepage Lead Magnet
 * Bill Layne Insurance Agency
 * Vanilla JS, no dependencies
 */
(function() {
    'use strict';

    // Sample cost bands for educational estimates only.
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

    const LIABILITY_LIMITS = {
        'min': {
            label: 'NC Minimum 50/100/50',
            bodilyInjuryAccident: 100000,
            propertyDamage: 50000,
            note: 'NC minimum liability can be outgrown quickly by a serious injury or multi-vehicle accident.'
        },
        '100300100': {
            label: '100/300/100',
            bodilyInjuryAccident: 300000,
            propertyDamage: 100000,
            note: 'A stronger middle layer, but a severe injury claim can still exceed it.'
        },
        '250500100': {
            label: '250/500/100',
            bodilyInjuryAccident: 500000,
            propertyDamage: 100000,
            note: 'Often a better fit for homeowners, higher-income households, and drivers with more assets to protect.'
        },
        'not_sure': {
            label: 'Not sure - compared to NC minimum',
            bodilyInjuryAccident: 100000,
            propertyDamage: 50000,
            note: 'If you are not sure, we can review your declarations page and show your real limits.'
        }
    };

    function calculate() {
        var vehicleVal  = document.getElementById('ace-vehicle').value;
        var injuryVal   = document.getElementById('ace-injury').value;
        var propertyVal = document.getElementById('ace-property').value;
        var limitsVal   = document.getElementById('ace-limits').value;
        var resultEl    = document.getElementById('ace-result');
        var resultNum   = document.getElementById('ace-result-number');
        var resultNote  = document.getElementById('ace-result-note');
        var ctaWrap     = document.getElementById('ace-cta-wrap');
        var limitNote   = document.getElementById('ace-limit-note');
        var sdipNote    = document.getElementById('ace-sdip-note');

        if (!vehicleVal || !injuryVal || !propertyVal || !limitsVal) {
            resultEl.style.display = 'none';
            ctaWrap.style.display = 'none';
            return;
        }

        var vehicleCost  = VEHICLE_COSTS[vehicleVal] || 0;
        var injury       = INJURY_COSTS[injuryVal];
        var injuryCost   = Math.round((injury.low + injury.high) / 2);
        var propertyCost = PROPERTY_COSTS[propertyVal] || 0;
        var limits       = LIABILITY_LIMITS[limitsVal] || LIABILITY_LIMITS.min;
        var propertyDamageTotal = vehicleCost + propertyCost;
        var total        = propertyDamageTotal + injuryCost;
        var injuryGap    = Math.max(0, injuryCost - limits.bodilyInjuryAccident);
        var propertyGap  = Math.max(0, propertyDamageTotal - limits.propertyDamage);
        var possibleGap  = injuryGap + propertyGap;

        var wasHidden = resultEl.style.display === 'none' || window.getComputedStyle(resultEl).display === 'none';

        resultEl.style.display = 'block';
        ctaWrap.style.display = 'block';
        animateNumber(resultNum, total);
        setMoney('ace-injury-cost', injuryCost);
        setMoney('ace-property-cost', propertyDamageTotal);
        setMoney('ace-gap-cost', possibleGap);

        var low  = propertyDamageTotal + injury.low;
        var high = propertyDamageTotal + injury.high;
        resultNote.textContent = 'Range: $' + low.toLocaleString() + ' - $' + high.toLocaleString() + ' before policy limits, deductibles, and claim details.';
        limitNote.textContent = 'Selected limit: ' + limits.label + '. This compares bodily injury against per-accident BI and vehicle/property damage against property damage liability. ' + limits.note;
        sdipNote.textContent = possibleGap > 0
            ? 'This sample shows a possible liability gap. NC at-fault accidents can also trigger SDIP insurance points and surcharges.'
            : 'This sample may fit within the selected limits, but NC at-fault accidents can still trigger SDIP insurance points and surcharges.';

        trackEstimate(total, possibleGap, limitsVal, injuryVal);

        if (wasHidden && window.matchMedia('(max-width: 767px)').matches) {
            window.setTimeout(function() {
                resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 75);
        }
    }

    function setMoney(id, amount) {
        var el = document.getElementById(id);
        if (el) {
            el.textContent = '$' + amount.toLocaleString();
        }
    }

    function animateNumber(el, target) {
        var start = 0;
        var duration = 600;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(start + (target - start) * eased);
            el.textContent = '$' + current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function trackEstimate(total, possibleGap, limitsVal, injuryVal) {
        var payload = {
            value: total,
            coverage_gap: possibleGap,
            liability_limits: limitsVal,
            injury_severity: injuryVal
        };

        if (typeof window.bliTrackLead === 'function') {
            window.bliTrackLead('accident_cost_estimator_calculate', payload);
        } else if (typeof window.gtag === 'function') {
            window.gtag('event', 'accident_cost_estimator_calculate', payload);
        }
    }

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
