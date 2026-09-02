/* Homepage behaviour moved out of index.html on 2026-09-02 (SEO blueprint: HTML diet).
   Two former inline scripts, both DOMContentLoaded-wrapped, so this file is loaded
   with `defer`. The lead tracker stays inline in index.html on purpose. */
document.addEventListener("DOMContentLoaded", () => {
                const CONFIG = {
                    cta: {
                        quote: "get-quote.html",
                        learn: "tel:3368351993"
                    }
                };

                const DATA = {
                    home: {
                        label: "Home",
                        icon: "fas fa-home",
                        bgClass: "bg-home",
                        title: "Home Insurance",
                        subtitle: "Plain-English examples from common NC home coverage conversations.",
                        hotspots: [
                            { x: 50, y: 45, icon: "fas fa-home", title: "Dwelling Coverage", text: "Pays to rebuild the house after covered damage such as fire, wind, or hail.", gap: "The limit should reflect rebuild cost, not what the home might sell for. Older estimates can leave a family short after a major claim.", example: "Example: A kitchen fire damages walls, cabinets, flooring, and smoke cleanup. The dwelling limit is what pays to repair the structure.", cta: "Check My Limit" },
                            { x: 25, y: 65, icon: "fas fa-shield-alt", title: "Liability Protection", text: "Protects your savings if someone is hurt on your property or you are legally responsible for injury or damage.", gap: "Many households carry basic limits that may not fit their assets, pets, pool, trampoline, or teen-driver exposure.", example: "Example: A guest falls on icy steps and needs surgery. Liability coverage can help with legal defense and settlement costs.", cta: "Review Liability" },
                            { x: 75, y: 30, icon: "fas fa-cloud-showers-heavy", title: "Roof & Storms", text: "Helps with covered wind or hail roof damage, depending on the deductible and roof settlement terms.", gap: "In NC, wind/hail deductibles and older-roof ACV rules can surprise people. A roof claim may not pay like a full replacement check.", example: "Example: A hailstorm damages shingles. The difference between replacement cost and ACV can change what you pay out of pocket.", cta: "Roof Check" },
                            { x: 85, y: 55, icon: "fas fa-warehouse", title: "Detached Garages & Sheds", text: "Covers structures not attached to the home, such as detached garages, sheds, fences, and some outbuildings.", gap: "The automatic limit may be too low for a large garage, pole barn, workshop, or building with equipment inside.", example: "Example: A tree falls on a detached garage. Other Structures coverage is the bucket that may respond.", cta: "Check Detached" },
                            { x: 40, y: 65, icon: "fas fa-couch", title: "Personal Property", text: "Covers belongings such as furniture, clothes, electronics, tools, and household items.", gap: "Replacement cost, special limits, receipts, and a home inventory matter. Jewelry, guns, tools, and collectibles may need extra scheduling.", example: "Example: Smoke ruins furniture and electronics. A room-by-room inventory helps prove what you owned.", cta: "Protect Stuff" }
                        ]
                    },
                    auto: {
                        label: "Auto",
                        icon: "fas fa-car",
                        bgClass: "bg-auto",
                        title: "Auto Insurance",
                        subtitle: "Common auto coverage choices that affect NC drivers after a claim.",
                        hotspots: [
                            { x: 30, y: 55, icon: "fas fa-user-shield", title: "Liability Limits", text: "Pays others when you cause injury or property damage in an accident.", gap: "Minimum liability can be quickly exhausted in a serious crash. Higher limits and umbrella coverage may be worth reviewing.", example: "Example: You rear-end a vehicle with multiple passengers. Liability limits determine how much protection you have before personal assets are exposed.", cta: "Check Limits" },
                            { x: 65, y: 60, icon: "fas fa-car-crash", title: "Collision", text: "Helps repair your vehicle when you hit another car or object, subject to your deductible.", gap: "Deductible choice changes both monthly premium and claim-day cost. Some older vehicles may not justify full coverage.", example: "Example: You slide into a guardrail. Collision is the coverage that can help repair your own car.", cta: "Compare Deductibles" },
                            { x: 70, y: 35, icon: "fas fa-tree", title: "Comprehensive", text: "Covers non-collision losses such as deer, theft, vandalism, falling objects, fire, and glass.", gap: "Rural NC drivers often think only about collision, but deer and falling limbs are common comprehensive losses.", example: "Example: A deer runs into the front of your car on a dark road. Comprehensive is usually the coverage involved.", cta: "Add Deer Coverage" },
                            { x: 20, y: 40, icon: "fas fa-key", title: "Rental Reimbursement", text: "Helps pay for a rental while your car is repaired after a covered claim.", gap: "It is easy to skip because it looks small on the quote, but being without a car for two weeks can be expensive.", example: "Example: Your car sits at the body shop waiting on parts. Rental coverage can keep you driving.", cta: "Add Rental" },
                            { x: 85, y: 70, icon: "fas fa-truck-pickup", title: "Towing & Labor", text: "Helps with towing, jump starts, lockouts, and roadside service depending on the carrier.", gap: "It is not the same with every company. Mileage limits and service rules matter.", example: "Example: Your car will not start after work. Towing and labor can help avoid a large unexpected tow bill.", cta: "Add Roadside" }
                        ]
                    },
                    business: {
                        label: "Business",
                        icon: "fas fa-briefcase",
                        bgClass: "bg-business",
                        title: "Business Owners",
                        subtitle: "Simple coverage examples for local shops, contractors, offices, and service businesses.",
                        hotspots: [
                            { x: 35, y: 60, icon: "fas fa-balance-scale", title: "General Liability", text: "Helps protect against injury or property-damage claims tied to your business operations.", gap: "A certificate requirement is not the same as having the right limits or endorsements for your actual work.", example: "Example: A customer trips in your office or you damage a client's property while working. General liability is the starting point.", cta: "Get Liability Quote" },
                            { x: 60, y: 50, icon: "fas fa-tools", title: "Property, Tools & Inventory", text: "Helps cover business property such as equipment, tools, stock, furniture, and sometimes the building.", gap: "Tools in transit, rented equipment, outdoor signs, and stock at a jobsite may need special attention.", example: "Example: A fire damages inventory and shop equipment. Property coverage helps keep one loss from wiping out years of work.", cta: "Protect Assets" },
                            { x: 75, y: 25, icon: "fas fa-laptop-code", title: "Cyber & Data Risk", text: "Helps when a business is hit by a data breach, ransomware, phishing, or payment-card problem.", gap: "Small businesses are targets too. Taking cards, storing client info, or using email invoices creates exposure.", example: "Example: An employee clicks a phishing email and customer data is exposed. Cyber coverage can help with response costs.", cta: "Ask About Cyber" }
                        ]
                    }
                };

                const mount = document.getElementById("blCoverageWidget");
                const mobileMount = document.getElementById("blCoverageMobile");
                let activeTab = "home";
                let selectedHotspot = null;
                let activeMobileTab = "home";
                let openMobileIndex = 0;

                function trackCoverageGuide(action, params = {}) {
                    if (typeof gtag === "function") {
                        gtag("event", "homepage_coverage_guide_" + action, {
                            event_category: "homepage",
                            ...params
                        });
                    }
                }

                function render() {
                    if (!mount) return;
                    const topic = DATA[activeTab];
                    const displayData = selectedHotspot || { title: topic.title, text: topic.subtitle, cta: "Start Quote" };

                    let hotspotsHtml = topic.hotspots.map((h, i) => `
                        <button class="bl-hotspot${selectedHotspot === h ? ' bl-hotspot-active' : ''}" style="left:${h.x}%; top:${h.y}%;" onclick="window.selectHotspot(${i})" aria-label="${h.title}">
                            <i class="${h.icon}"></i>
                        </button>
                    `).join('');

                    let tabsHtml = Object.keys(DATA).map(key => `
                        <button class="bl-tab" aria-pressed="${activeTab === key}" onclick="window.selectTab('${key}')"><i class="${DATA[key].icon}" style="margin-right:6px;" aria-hidden="true"></i>${DATA[key].label}</button>
                    `).join('');

                    mount.innerHTML = `
                        <div class="bl-widget">
                            <div class="bl-graphic-card">
                                <div class="bl-graphic-topbar">
                                    <div class="bl-tabs">${tabsHtml}</div>
                                </div>
                                <div class="bl-graphic-wrap">
                                    <div class="bl-graphic-bg ${topic.bgClass}"></div>
                                    <div class="bl-overlay"></div>
                                    ${hotspotsHtml}
                                </div>
                            </div>
                            <div class="bl-panel">
                                <div class="bl-panel-header">
                                    <h3>${displayData.title}</h3>
                                    <p>${selectedHotspot ? "Coverage Details" : "Overview"}</p>
                                </div>
                                <div class="bl-panel-body">
                                    <div class="bl-info-row">
                                        <div class="bl-label">${selectedHotspot ? "What it covers" : "How to use it"}</div>
                                        <div class="bl-value">${displayData.text}</div>
                                    </div>
                                    ${selectedHotspot ? `<div class="bl-info-row"><div class="bl-label">Common gap</div><div class="bl-value">${displayData.gap}</div></div>` : ''}
                                    ${selectedHotspot ? `<div class="bl-info-row"><div class="bl-label">Example claim</div><div class="bl-value">${displayData.example}</div></div>` : ''}

                                    <div class="bl-btn-group">
                                        <a href="${CONFIG.cta.quote}" class="bl-action-btn bl-btn-solid">${selectedHotspot ? displayData.cta : "Compare My Coverage"}</a>
                                        <a href="${CONFIG.cta.learn}" class="bl-action-btn bl-btn-outline">Call Agent (336) 835-1993</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                function renderMobile() {
                    if (!mobileMount) return;
                    const topic = DATA[activeMobileTab];
                    const tabsHtml = Object.keys(DATA).map(key => `
                        <button class="bl-mobile-tab" type="button" aria-pressed="${activeMobileTab === key}" onclick="window.selectMobileCoverageTab('${key}')">
                            <i class="${DATA[key].icon}" aria-hidden="true"></i>${DATA[key].label}
                        </button>
                    `).join('');

                    const cardsHtml = topic.hotspots.map((h, i) => {
                        const isOpen = openMobileIndex === i;
                        return `
                            <div class="bl-mobile-card">
                                <button class="bl-mobile-toggle" type="button" aria-expanded="${isOpen}" onclick="window.toggleMobileCoverage(${i})">
                                    <span><i class="${h.icon}" aria-hidden="true"></i>${h.title}</span>
                                    <i class="fas fa-chevron-down bl-mobile-chevron" aria-hidden="true"></i>
                                </button>
                                <div class="bl-mobile-content">
                                    <div class="bl-mobile-row"><strong>What it covers</strong><p>${h.text}</p></div>
                                    <div class="bl-mobile-row"><strong>Common gap</strong><p>${h.gap}</p></div>
                                    <div class="bl-mobile-row"><strong>Example claim</strong><p>${h.example}</p></div>
                                    <div class="bl-mobile-actions">
                                        <a href="${CONFIG.cta.quote}" class="bl-action-btn bl-btn-solid">${h.cta}</a>
                                        <a href="${CONFIG.cta.learn}" class="bl-action-btn bl-btn-outline">Call Us</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    const visualChips = topic.hotspots.slice(0, 3).map(h => `
                        <span class="bl-mobile-visual-chip"><i class="${h.icon}" aria-hidden="true"></i>${h.title}</span>
                    `).join('');

                    mobileMount.innerHTML = `
                        <div class="bl-mobile-guide">
                            <div class="bl-mobile-tabs">${tabsHtml}</div>
                            <div class="bl-mobile-body">
                                <div class="bl-mobile-visual" role="img" aria-label="${topic.title} coverage illustration">
                                    <div class="bl-mobile-visual-bg ${topic.bgClass}"></div>
                                    <div class="bl-mobile-visual-content">
                                        <span class="bl-mobile-visual-kicker"><i class="${topic.icon}" aria-hidden="true"></i> Coverage snapshot</span>
                                        <h3>${topic.title}</h3>
                                        <div class="bl-mobile-visual-chips">${visualChips}</div>
                                    </div>
                                </div>
                                <div class="bl-mobile-intro">
                                    <h3>${topic.title}</h3>
                                    <p>${topic.subtitle}</p>
                                </div>
                                ${cardsHtml}
                            </div>
                        </div>
                    `;
                }

                window.selectTab = (key) => {
                    activeTab = key;
                    selectedHotspot = null;
                    render();
                    trackCoverageGuide("tab", { coverage_type: key, viewport: "desktop" });
                };

                window.selectHotspot = (index) => {
                    selectedHotspot = DATA[activeTab].hotspots[index];
                    render();
                    trackCoverageGuide("hotspot", { coverage_type: activeTab, hotspot: selectedHotspot.title, viewport: "desktop" });
                };

                window.selectMobileCoverageTab = (key) => {
                    activeMobileTab = key;
                    openMobileIndex = 0;
                    renderMobile();
                    trackCoverageGuide("tab", { coverage_type: key, viewport: "mobile" });
                };

                window.toggleMobileCoverage = (index) => {
                    const topic = DATA[activeMobileTab];
                    openMobileIndex = openMobileIndex === index ? -1 : index;
                    renderMobile();
                    if (openMobileIndex >= 0) {
                        trackCoverageGuide("accordion", { coverage_type: activeMobileTab, hotspot: topic.hotspots[index].title, viewport: "mobile" });
                    }
                };

                render();
                renderMobile();
            });

document.addEventListener('DOMContentLoaded', () => {
            // Dynamic Date
            const dateEl = document.getElementById('current-date-display');
            if(dateEl) {
                const now = new Date();
                const month = now.toLocaleString('default', { month: 'long' });
                const year = now.getFullYear();
                dateEl.textContent = `${month} ${year}`;
            }

            const navbar = document.getElementById('navbar');
            const menuBtn = document.getElementById('menu-btn');
            const menuClose = document.getElementById('menu-close');
            const menuDrawer = document.getElementById('menu-drawer');
            const menuOverlay = document.getElementById('menu-overlay');

            // Scroll Effects - Handle Sticky Header Appearance
            window.addEventListener('scroll', () => {
                const scrolled = window.scrollY > 50;

                // Add glass background
                navbar.classList.toggle('glass-nav', scrolled);
                navbar.classList.toggle('bg-transparent', !scrolled);

                // Adjust height
                navbar.classList.toggle('h-16', scrolled);
                navbar.classList.toggle('h-20', !scrolled);

                // Change text colors for contrast on white background
                const logoText = document.getElementById('nav-logo-text');
                const logoAccent = document.getElementById('nav-logo-accent');
                const tagline = document.getElementById('nav-tagline');
                const phoneBtn = document.getElementById('nav-phone-btn');
                const hamburgerLines = document.querySelectorAll('.nav-hamburger-line');

                if (logoText) {
                    logoText.classList.toggle('text-white', !scrolled);
                    logoText.classList.toggle('text-slate-900', scrolled);
                }
                if (logoAccent) {
                    logoAccent.classList.toggle('text-accent-400', !scrolled);
                    logoAccent.classList.toggle('text-primary-600', scrolled);
                }
                if (tagline) {
                    tagline.classList.toggle('text-indigo-200', !scrolled);
                    tagline.classList.toggle('text-slate-500', scrolled);
                }

                if (phoneBtn) {
                    phoneBtn.classList.toggle('border-slate-100', !scrolled);
                    phoneBtn.classList.toggle('border-slate-200', scrolled);
                }

                // Hamburger lines color
                hamburgerLines.forEach(line => {
                    line.classList.toggle('bg-white', !scrolled);
                    line.classList.toggle('bg-slate-900', scrolled);
                });

                // Desktop nav links color
                const navLinks = document.querySelectorAll('.nav-link-item');
                navLinks.forEach(link => {
                    link.classList.toggle('text-white', !scrolled);
                    link.classList.toggle('hover:text-accent-300', !scrolled);
                    link.classList.toggle('text-slate-700', scrolled);
                    link.classList.toggle('hover:text-primary-600', scrolled);
                    link.classList.toggle('scrolled', scrolled);
                });
            });

            // Mobile Menu Logic
            const toggleMenu = (show) => {
                menuDrawer.classList.toggle('translate-x-full', !show);
                menuOverlay.classList.toggle('opacity-0', !show);
                menuOverlay.classList.toggle('pointer-events-none', !show);
                document.body.style.overflow = show ? 'hidden' : '';
            };
            if(menuBtn) menuBtn.addEventListener('click', () => toggleMenu(true));
            if(menuClose) menuClose.addEventListener('click', () => toggleMenu(false));
            if(menuOverlay) menuOverlay.addEventListener('click', () => toggleMenu(false));

            // Auto-close menu when any link inside drawer is clicked
            if(menuDrawer) {
                menuDrawer.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => toggleMenu(false));
                });
            }

            // Accordion Logic
            document.querySelectorAll('.accordion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const content = btn.nextElementSibling;
                    const icon = btn.querySelector('.fa-chevron-down');
                    const isOpen = content.classList.contains('open');

                    content.classList.toggle('open');
                    content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
                    content.style.opacity = isOpen ? '0' : '1';
                    if(icon) icon.style.transform = isOpen ? 'rotate(0)' : 'rotate(180deg)';
                });
            });

            // Reveal animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
            }, { threshold: 0.05, rootMargin: '0px 0px 200px 0px' });
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

            // Load heavier below-fold images only when a visitor is close to them.
            const deferredImageObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, imageObserver) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const image = entry.target;
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        image.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(image);
                });
            }, { rootMargin: '500px 0px' }) : null;
            document.querySelectorAll('img[data-src]').forEach(image => {
                if (deferredImageObserver) {
                    deferredImageObserver.observe(image);
                } else {
                    image.src = image.dataset.src;
                    image.removeAttribute('data-src');
                }
            });

            // Testimonial Auto-Rotation (mobile only)
            if (window.innerWidth < 768) {
                const carousel = document.getElementById('testimonial-carousel');
                const dots = document.querySelectorAll('.testimonial-dot');
                if (carousel && dots.length === 3) {
                    const cards = carousel.querySelectorAll(':scope > div');
                    let currentIndex = 0;
                    let autoTimer = null;
                    let pauseTimer = null;

                    const updateDots = (activeIdx) => {
                        dots.forEach((dot, i) => {
                            dot.className = i === activeIdx
                                ? 'testimonial-dot w-8 h-1.5 rounded-full bg-white/40'
                                : 'testimonial-dot w-2 h-1.5 rounded-full bg-white/20';
                        });
                    };

                    const cardObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const idx = Array.from(cards).indexOf(entry.target);
                                if (idx !== -1) { currentIndex = idx; updateDots(idx); }
                            }
                        });
                    }, { root: carousel, threshold: 0.6 });
                    cards.forEach(card => cardObserver.observe(card));

                    const scrollToCard = (idx) => {
                        if (cards[idx]) carousel.scrollTo({ left: cards[idx].offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
                    };
                    const startAuto = () => { stopAuto(); autoTimer = setInterval(() => { currentIndex = (currentIndex + 1) % cards.length; scrollToCard(currentIndex); }, 5000); };
                    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
                    const pauseAndResume = () => { stopAuto(); if (pauseTimer) clearTimeout(pauseTimer); pauseTimer = setTimeout(startAuto, 10000); };

                    carousel.addEventListener('touchstart', pauseAndResume, { passive: true });
                    carousel.addEventListener('pointerdown', pauseAndResume);
                    startAuto();
                }
            }

            // Blog Preview Cards — load after the hero is settled so mobile LCP stays clean.
            const blogGrid = document.getElementById('blog-preview-grid');
            if (blogGrid) {
                const loadBlogPreview = () => {
                    if (blogGrid.dataset.loaded === 'true') return;
                    blogGrid.dataset.loaded = 'true';
                    fetch('blog/data/blogs.json', { cache: 'no-cache' })
                        .then(r => r.json())
                        .then(posts => {
                            // Homepage authority slot: insurance-expertise posts only.
                            // Community/lifestyle posts still live on the blog index + social.
                            const lifestyleCats = ['Community Life', 'Community Safety'];
                            const lifestyleIds = ['hwy-21-road-market-2026', 'surry-county-july-4th-events-2026',
                                                  '2025-07-surry-fall-festivals', '2025-07-highway-21-treasure-hunt'];
                            const featuredHomepageId = 'how-to-insure-street-legal-side-by-side-north-carolina';
                            const eligiblePosts = posts.filter(p => !lifestyleCats.includes(p.category) && !lifestyleIds.includes(p.id));
                            const featuredPost = eligiblePosts.find(p => p.id === featuredHomepageId);
                            const latest = featuredPost
                                ? [featuredPost, ...eligiblePosts.filter(p => p.id !== featuredHomepageId).slice(0, 2)]
                                : eligiblePosts.slice(0, 3);
                            blogGrid.innerHTML = latest.map(post => {
                                const d = new Date(post.date + 'T12:00:00');
                                const dateStr = post.id === featuredHomepageId
                                    ? 'Updated Aug 3, 2026'
                                    : d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
                                const href = post.url.replace('./', '/blog/').replace(/\.html$/, '');
                                return `<a href="${href}" class="group block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all reveal">
                                    <div class="aspect-video overflow-hidden" style="background:linear-gradient(135deg,#1e3a5f,#f59e0b)">
                                        <img src="${post.imageUrl}" alt="${post.title}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" fetchpriority="low" width="400" height="225">
                                    </div>
                                    <div class="p-5">
                                        <div class="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                            <span>${dateStr}</span>
                                            <span>&bull;</span>
                                            <span>${post.readTime}</span>
                                        </div>
                                        <h3 class="font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">${post.title}</h3>
                                        <p class="text-sm text-slate-500 line-clamp-2">${post.summary}</p>
                                    </div>
                                </a>`;
                            }).join('');
                            blogGrid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
                            const viewAll = document.getElementById('blog-view-all');
                            if (viewAll) viewAll.innerHTML = 'View All ' + posts.length + ' Articles <i class="fas fa-arrow-right text-sm"></i>';
                        })
                        .catch(() => {});
                };
                const blogObserver = new IntersectionObserver((entries) => {
                    if (entries.some(entry => entry.isIntersecting)) {
                        loadBlogPreview();
                        blogObserver.disconnect();
                    }
                }, { rootMargin: '600px 0px' });
                blogObserver.observe(blogGrid);
                window.addEventListener('load', () => setTimeout(loadBlogPreview, 5000), { once: true });
            }

            // Business Hours Indicator
            const checkHours = () => {
                const now = new Date();
                const est = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
                const day = est.getDay();
                const hour = est.getHours();
                const isOpen = (day >= 1 && day <= 5) && (hour >= 9 && hour < 17);
                const dot = document.getElementById('status-dot');
                if(dot) dot.classList.toggle('hidden', !isOpen);
            };
            checkHours(); setInterval(checkHours, 60000);

        });

        // Zero-Weight Video Loader
        const YOUTUBE_VIDEO_ID = "4hJT_wMCcCg";

        window.loadYoutubeVideo = (container) => {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`;
            iframe.title = "YouTube video player";
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            iframe.className = "w-full h-full absolute top-0 left-0";

            // Clear container and append iframe
            container.innerHTML = '';
            container.appendChild(iframe);
        };
