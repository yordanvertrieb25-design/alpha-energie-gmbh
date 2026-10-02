/**
 * Alpha Energie GmbH - Smart Scrollytelling Experience Controller
 * Ultra-smooth, 60fps scrollytelling runway with interactive stepper tabs & calculator sync.
 */
(function() {
    'use strict';

    class SmartScrollyController {
        constructor() {
            this.section = document.getElementById('smart-energy-flow');
            if (!this.section) return;

            this.sticky = this.section.querySelector('.smart-scrolly-sticky');
            this.stages = Array.from(this.section.querySelectorAll('.smart-scrolly-stage'));
            this.tabs = Array.from(this.section.querySelectorAll('.smart-scrolly-tab'));
            this.progressFill = document.getElementById('smartScrollyProgressFill');
            
            this.activeStage = 0;
            this.isIntersecting = false;
            this.isTicking = false;
            this.isManualScrolling = false;
            this.touchStartX = 0;
            this.touchStartY = 0;

            this.init();
        }

        init() {
            this.setupIntersectionObserver();
            this.setupScrollListener();
            this.setupTabControls();
            this.setupCtaButtons();
            this.setupTouchGestures();
            this.setStage(0, false);
        }

        setupIntersectionObserver() {
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        this.isIntersecting = entry.isIntersecting;
                        if (this.isIntersecting && !this.isManualScrolling) {
                            this.updateOnScroll();
                        }
                    });
                }, {
                    root: null,
                    rootMargin: '250px 0px',
                    threshold: [0, 0.05, 0.25, 0.5, 0.75, 1.0]
                });
                this.observer.observe(this.section);
            } else {
                this.isIntersecting = true;
            }
        }

        setupScrollListener() {
            window.addEventListener('scroll', () => {
                if (!this.isTicking && this.isIntersecting && !this.isManualScrolling) {
                    this.isTicking = true;
                    window.requestAnimationFrame(() => {
                        this.updateOnScroll();
                        this.isTicking = false;
                    });
                }
            }, { passive: true });

            window.addEventListener('resize', () => {
                this.updateOnScroll();
            }, { passive: true });
        }

        updateOnScroll() {
            if (!this.section || window.innerWidth <= 768) return;

            const rect = this.section.getBoundingClientRect();
            const totalScrollable = this.section.offsetHeight - window.innerHeight;

            if (totalScrollable <= 0) return;

            // Compute normalized progress [0.0, 1.0]
            const scrolled = -rect.top;
            let progress = scrolled / totalScrollable;
            progress = Math.max(0, Math.min(1, progress));

            // Update visual progress fill bar
            if (this.progressFill) {
                this.progressFill.style.width = `${Math.round(progress * 100)}%`;
            }

            // Determine active stage based on runway zones:
            // Stage 0 (Wallbox): 0.00 - 0.33
            // Stage 1 (Wärmepumpe): 0.33 - 0.67
            // Stage 2 (Smart Home): 0.67 - 1.00
            let targetStage = 0;
            if (progress >= 0.67) {
                targetStage = 2;
            } else if (progress >= 0.33) {
                targetStage = 1;
            } else {
                targetStage = 0;
            }

            if (targetStage !== this.activeStage) {
                this.setStage(targetStage, false);
            }
        }

        setStage(index, shouldScroll = false) {
            if (index < 0 || index >= this.stages.length) return;

            this.activeStage = index;

            // Update stage classes and accessibility
            this.stages.forEach((stage, i) => {
                const isActive = (i === index);
                stage.classList.toggle('active', isActive);
                stage.classList.toggle('exited-top', i < index);
                stage.classList.toggle('exited-bottom', i > index);
                stage.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            });

            // Update interactive stepper tabs
            this.tabs.forEach((tab, i) => {
                const isActive = (i === index);
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            // Update progress fill if triggered programmatically
            if (this.progressFill && (window.innerWidth <= 768 || shouldScroll)) {
                const pct = index === 0 ? 15 : (index === 1 ? 50 : 100);
                this.progressFill.style.width = `${pct}%`;
            }

            // Smooth scroll runway into place if user clicked a stepper tab
            if (shouldScroll) {
                this.scrollToStage(index);
            }
        }

        scrollToStage(index) {
            if (!this.section) return;

            if (window.innerWidth <= 768) {
                // Mobile: smoothly center section
                this.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            if (this.manualScrollTimeout) {
                clearTimeout(this.manualScrollTimeout);
            }
            this.isManualScrolling = true;
            const totalScrollable = this.section.offsetHeight - window.innerHeight;
            const targetProg = index === 0 ? 0.08 : (index === 1 ? 0.50 : 0.92);
            const sectionTop = window.pageYOffset + this.section.getBoundingClientRect().top;
            const targetY = sectionTop + (targetProg * totalScrollable);

            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });

            this.manualScrollTimeout = setTimeout(() => {
                this.isManualScrolling = false;
                this.updateOnScroll();
            }, 800);
        }

        setupTabControls() {
            this.tabs.forEach((tab, index) => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setStage(index, true);
                });
            });
        }

        setupCtaButtons() {
            const ctaButtons = this.section.querySelectorAll('.smart-stage-cta, .btn-rechner-sync');
            ctaButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const branch = btn.getAttribute('data-branch') || 'strom';
                    const focus = btn.getAttribute('data-focus') || branch;
                    this.syncToCalculator(branch, focus);
                });
            });
        }

        syncToCalculator(branch, focus) {
            // 1. Switch calculator branch tab
            const matchingTab = document.querySelector(`.calc-tab-btn[data-branch="${branch}"]`);
            if (matchingTab) {
                matchingTab.click();
            }

            // 2. Smoothly scroll to Live-Tarifrechner
            const rechner = document.getElementById('rechner') || document.getElementById('tarifrechner');
            if (rechner) {
                const headerOffset = 90;
                const elementPosition = rechner.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // 3. Highlight pulse animation
                rechner.classList.remove('calc-highlight-pulse');
                void rechner.offsetWidth;
                rechner.classList.add('calc-highlight-pulse');
                setTimeout(() => {
                    rechner.classList.remove('calc-highlight-pulse');
                }, 3200);
            }
        }

        setupTouchGestures() {
            const viewport = this.section.querySelector('.smart-stages-viewport') || this.section;
            if (!viewport) return;

            viewport.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    this.touchStartX = e.touches[0].clientX;
                    this.touchStartY = e.touches[0].clientY;
                }
            }, { passive: true });

            viewport.addEventListener('touchend', (e) => {
                if (e.changedTouches.length === 1) {
                    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
                    const deltaY = e.changedTouches[0].clientY - this.touchStartY;

                    // Detect horizontal swipe if deltaX > deltaY
                    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
                        if (deltaX < 0 && this.activeStage < this.stages.length - 1) {
                            // Swipe Left -> Next
                            this.setStage(this.activeStage + 1, false);
                        } else if (deltaX > 0 && this.activeStage > 0) {
                            // Swipe Right -> Prev
                            this.setStage(this.activeStage - 1, false);
                        }
                    }
                }
            }, { passive: true });
        }
    }

    // Expose instance globally
    window.AlphaSmartScrolly = {
        controller: null,
        init: function() {
            if (!this.controller) {
                this.controller = new SmartScrollyController();
            }
            return this.controller;
        },
        setStage: function(index) {
            if (this.controller) {
                this.controller.setStage(index, true);
            }
        },
        syncToRechner: function(branch, focus) {
            if (this.controller) {
                this.controller.syncToCalculator(branch, focus);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.AlphaSmartScrolly.init());
    } else {
        window.AlphaSmartScrolly.init();
    }
})();
