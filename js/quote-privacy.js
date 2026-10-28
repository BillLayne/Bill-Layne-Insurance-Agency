(() => {
  function initPrivacy() {
    'use strict';

    if (document.getElementById('quote-privacy-dialog')) return;
    const lockIcon = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z"/></svg>`;
    const noteMarkup = `${lockIcon}<strong>Private · Never sold</strong><button type="button" class="quote-privacy-trigger" data-quote-privacy-open aria-haspopup="dialog" aria-controls="quote-privacy-dialog">Privacy<span class="quote-privacy-sr-only"> policy</span></button>`;

    // These two forms render their steps before DOMContentLoaded.
    document.querySelectorAll('[data-quote-privacy-dynamic]').forEach(root => {
        const steps = root.querySelectorAll('.form-step');
        if (!steps.length) return;
        const first = document.createElement('p');
        first.className = 'quote-privacy-note';
        first.setAttribute('data-quote-privacy-note', '');
        steps[0].insertBefore(first, steps[0].querySelector('.required-note') || steps[0].children[1]);
        const last = first.cloneNode();
        last.classList.add('quote-privacy-reminder');
        steps[steps.length - 1].append(last);
    });
    document.querySelectorAll('[data-quote-privacy-note]').forEach(note => {
        note.setAttribute('role', 'note');
        note.innerHTML = noteMarkup;
    });

    // Turn existing footer/FAQ policy links into controls for the same overlay.
    document.querySelectorAll('a[href]').forEach(link => {
        const url = new URL(link.href, location.href);
        if (!['www.billlayneinsurance.com', 'billlayneinsurance.com', location.hostname].includes(url.hostname) || !/^\/privacy-policy\/?$/.test(url.pathname)) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `${link.className} quote-privacy-trigger`.trim();
        button.textContent = link.textContent;
        button.setAttribute('data-quote-privacy-open', '');
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', 'quote-privacy-dialog');
        link.replaceWith(button);
    });
    const template = document.createElement('template');
    template.innerHTML = `<dialog id="quote-privacy-dialog" class="quote-privacy-dialog" aria-labelledby="quote-privacy-heading" aria-describedby="quote-privacy-summary">
        <header class="quote-privacy-dialog-header">
            <div class="quote-privacy-dialog-title"><span class="quote-privacy-icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z"/></svg></span><h2 id="quote-privacy-heading">Your privacy</h2></div>
            <button type="button" class="quote-privacy-close" data-quote-privacy-close aria-label="Close privacy information" autofocus><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
        </header>
        <div class="quote-privacy-dialog-body">
            <p class="quote-privacy-summary" id="quote-privacy-summary">We don’t sell your personal information or post it publicly.</p>
            <p>Our team uses your details to prepare your quote and answer your questions. We share information with the insurance companies we represent and service providers that help us process your request, or when required by law.</p>
            <p>You can ask us about your information or request corrections. Please don’t enter Social Security numbers, bank details, or payment card numbers in this form.</p>
            <details class="quote-privacy-full-policy" id="quote-privacy-full-policy">
                <summary>Read the full privacy policy</summary>
                <div id="quote-privacy-policy-content"></div>
            </details>
        </div>
        <footer class="quote-privacy-dialog-footer">
            <p>Your answers stay in the form.</p>
            <button type="button" class="quote-privacy-return" data-quote-privacy-close>Back to my quote</button>
        </footer>
    </dialog>`;
    document.body.append(template.content);
    const dialog = document.getElementById('quote-privacy-dialog');
    const isPolicyReview = document.body.dataset.privacyContext === 'policy-review';
    if (isPolicyReview) {
        dialog.querySelector('.quote-privacy-dialog-body > p:nth-of-type(2)').textContent = 'Our team uses your details and documents to review your coverage and answer your questions. We may share information with the insurance companies we represent and service providers as needed for your insurance request, or when required by law.';
        dialog.querySelector('.quote-privacy-return').textContent = 'Back to my policy review';
        dialog.querySelector('.quote-privacy-dialog-footer p').textContent = 'Your details and selected files stay in the form.';
    }


    let opener = null;
    let savedScrollY = 0;
    let policyLoaded = false;
    let policyLoading = false;
    const policyDetails = document.getElementById('quote-privacy-full-policy');
    const policyContent = document.getElementById('quote-privacy-policy-content');

    document.querySelectorAll('[data-quote-privacy-open]').forEach(button => {
        button.addEventListener('click', () => {
            if (dialog.open) return;
            opener = button;
            savedScrollY = window.scrollY;
            dialog.showModal();
            document.documentElement.classList.add('quote-privacy-open');
        });
    });

    dialog.querySelectorAll('[data-quote-privacy-close]').forEach(button => {
        button.addEventListener('click', () => dialog.close());
    });

    // Native dialog behavior handles Escape and makes the quote form inert.
    dialog.addEventListener('keydown', event => {
        if (event.key === 'Escape') event.stopPropagation();
        if (event.key !== 'Tab') return;
        const controls = [...dialog.querySelectorAll('button:not([disabled]), summary, [tabindex="0"]')]
            .filter(control => control.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('quote-privacy-open');
        opener?.focus({ preventScroll: true });
        window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    });

    // Reuse the current published policy without its navigation, scripts or links.
    // Only text and basic semantic markup are copied into the overlay.
    const allowedTags = new Set(['SECTION', 'DIV', 'H2', 'H3', 'P', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'BR']);
    function copyPolicyNode(node) {
        if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
        if (node.nodeType !== Node.ELEMENT_NODE || ['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'].includes(node.tagName)) return document.createDocumentFragment();
        if (!allowedTags.has(node.tagName)) return document.createTextNode(node.textContent);
        const tag = node.tagName === 'H2' ? 'h3' : node.tagName === 'H3' ? 'h4' : node.tagName.toLowerCase();
        const copy = document.createElement(tag);
        node.childNodes.forEach(child => copy.append(copyPolicyNode(child)));
        return copy;
    }

    async function loadPolicy() {
        if (policyLoaded || policyLoading) return;
        policyLoading = true;
        const status = document.createElement('p');
        status.setAttribute('role', 'status');
        status.textContent = 'Loading privacy policy…';
        policyContent.replaceChildren(status);
        try {
            const response = await fetch('/privacy-policy/', { credentials: 'omit', signal: AbortSignal.timeout(10000) });
            if (!response.ok) throw new Error('Policy unavailable');
            const source = new DOMParser().parseFromString(await response.text(), 'text/html').querySelector('main');
            if (!source || !source.querySelector('h2')) throw new Error('Policy unavailable');
            const content = document.createDocumentFragment();
            source.childNodes.forEach(node => content.append(copyPolicyNode(node)));
            policyContent.replaceChildren(content);
            policyLoaded = true;
        } catch {
            status.textContent = 'The full policy couldn’t load. You can try again or return to your quote; your answers are still here.';
            const retry = document.createElement('button');
            retry.type = 'button';
            retry.className = 'quote-privacy-policy-retry';
            retry.textContent = 'Try again';
            retry.addEventListener('click', loadPolicy);
            policyContent.append(retry);
        } finally {
            policyLoading = false;
        }
    }

    policyDetails.addEventListener('toggle', () => {
        if (policyDetails.open) loadPolicy();
    });
  }
  if (document.readyState === 'complete') initPrivacy();
  else document.addEventListener('DOMContentLoaded', initPrivacy, { once: true });
})();
