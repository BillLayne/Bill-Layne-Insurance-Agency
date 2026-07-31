(function () {
    'use strict';

    if (window.__bliConversionTrackingLoaded) return;
    window.__bliConversionTrackingLoaded = true;

    function pageType() {
        var path = window.location.pathname.toLowerCase();
        if (path.indexOf('/auto-center') === 0) return 'auto';
        if (path.indexOf('/home-insurance') === 0) return 'home';
        if (path.indexOf('/claims-center') === 0) return 'claims';
        if (path.indexOf('/clients') === 0) return 'client_hub';
        if (path.indexOf('/contact-us') === 0) return 'contact';
        if (path.indexOf('service-center') > -1) return 'service';
        if (path.indexOf('quote') > -1) return 'quote';
        return 'general';
    }

    function safeLinkPath(link) {
        var rawHref = (link.getAttribute('href') || '').trim().toLowerCase();
        if (rawHref.indexOf('tel:') === 0) return 'tel:';
        if (rawHref.indexOf('mailto:') === 0) return 'mailto:';

        try {
            var url = new URL(link.href, window.location.origin);
            return url.origin === window.location.origin
                ? url.pathname
                : url.origin + url.pathname;
        } catch (error) {
            return '';
        }
    }

    function sourceFor(link) {
        if (link.dataset.source) return link.dataset.source;
        if (link.id) return link.id;

        var section = link.closest('section[id], main[id], footer[id], nav[id]');
        if (section && section.id) return section.id;
        if (link.closest('.mobile-dock')) return 'mobile_dock';
        if (link.closest('footer')) return 'footer';
        if (link.closest('nav')) return 'navigation';
        return 'page_content';
    }

    function classify(link) {
        var href = (link.getAttribute('href') || '').trim().toLowerCase();
        if (!href) return null;
        if (href.indexOf('tel:') === 0) return { eventName: 'phone_click', leadType: 'phone' };
        if (href.indexOf('mailto:') === 0) return { eventName: 'email_click', leadType: 'email' };
        if (href.indexOf('maps.google.') > -1 || href.indexOf('google.com/maps') > -1) {
            return { eventName: 'directions_click', leadType: 'directions' };
        }
        if (
            href.indexOf('get-quote') > -1 ||
            href.indexOf('auto-quote') > -1 ||
            href.indexOf('home-quote') > -1
        ) {
            return { eventName: 'quote_click', leadType: 'quote' };
        }
        if (href.indexOf('upload-policy') > -1) {
            return { eventName: 'policy_upload_click', leadType: 'policy_upload' };
        }
        if (href.indexOf('contact-us') > -1) {
            return { eventName: 'contact_click', leadType: 'contact' };
        }
        return null;
    }

    window.bliTrackConversion = function (eventName, params) {
        var payload = Object.assign({
            event_category: 'lead',
            page_path: window.location.pathname,
            page_type: pageType()
        }, params || {});

        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, payload);
        }
        if (typeof window.clarity === 'function') {
            window.clarity('event', eventName);
        }
    };

    document.addEventListener('click', function (event) {
        var link = event.target.closest('a[href]');
        if (!link || link.dataset.bliTrack === 'false') return;

        var action = classify(link);
        if (!action) return;

        window.bliTrackConversion(action.eventName, {
            lead_type: action.leadType,
            cta_source: sourceFor(link),
            link_text: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
            link_path: safeLinkPath(link)
        });
    }, true);
})();
