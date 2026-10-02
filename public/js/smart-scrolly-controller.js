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
            this.hasInitialized = false;
            this.isIntersecting = false;
            this.isTicking = false;
            this.isManualScrolling = false;
            this.touchStartX = 0;
            this.touchStartY = 0;

            this.cachedSectionTop = 0;
            this.cachedTotalScrollable = 0;

            this.init();
        }

        init() {
            if (this.progressFill) {
                this.progressFill.style.transformOrigin = 'left';
                this.progressFill.style.willChange = 'transform';
            }
            this.updateGeometry();
            this.setupIntersectionObserver();
            this.setupScrollListener();
            this.setupTabControls();
            this.setupCtaButtons();
            this.setupTouchGestures();
            this.setStage(0, false);

            if (typeof window !== 'undefined') {
                window.addEventListener('load', () => this.updateGeometry(), { passive: true });
            }
        }

        updateGeometry() {
            if (!this.section) return;
            const rect = this.section.getBoundingClientRect();
            this.cachedSectionTop = window.scrollY + rect.top;
            this.cachedTotalScrollable = this.section.offsetHeight - window.innerHeight;
        }

        setupIntersectionObserver() {
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        this.isIntersecting = entry.isIntersecting;
                        if (this.isIntersecting) {
                            this.updateGeometry();
                            if (!this.isManualScrolling) {
                                this.updateOnScroll();
                            }
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
                this.updateGeometry();
                this.updateOnScroll();
            }, { passive: true });

            window.addEventListener('orientationchange', () => {
                this.updateGeometry();
                this.updateOnScroll();
            }, { passive: true });
        }

        updateOnScroll() {
            if (!this.section || window.innerWidth <= 768) return;

            if (this.cachedTotalScrollable <= 0) {
                this.updateGeometry();
            }

            const totalScrollable = this.cachedTotalScrollable;
            if (totalScrollable <= 0) return;

            // Compute normalized progress [0.0, 1.0] using cached geometry without forced reflow
            const scrolled = window.scrollY - this.cachedSectionTop;
            let progress = scrolled / totalScrollable;
            progress = Math.max(0, Math.min(1, progress));

            // Update visual progress fill bar with hardware-accelerated transform
            if (this.progressFill) {
                this.progressFill.style.transform = `scaleX(${progress})`;
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
            if (index === this.activeStage && !shouldScroll && this.hasInitialized) return;

            this.hasInitialized = true;
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
                const fraction = index === 0 ? 0.15 : (index === 1 ? 0.50 : 1.0);
                this.progressFill.style.transform = `scaleX(${fraction})`;
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
            this.updateGeometry();
            const totalScrollable = this.cachedTotalScrollable;
            const targetProg = index === 0 ? 0.08 : (index === 1 ? 0.50 : 0.92);
            const targetY = this.cachedSectionTop + (targetProg * totalScrollable);

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
            if (this.manualScrollTimeout) {
                clearTimeout(this.manualScrollTimeout);
                this.manualScrollTimeout = null;
            }
            this.isManualScrolling = false;

            // 1. Switch calculator branch tab
            const matchingTab = document.querySelector(`.calc-tab-btn[data-branch="${branch}"]`);
            if (matchingTab) {
                matchingTab.click();
            }

            // 2. Scroll to Live-Tarifrechner
            const rechner = document.getElementById('rechner') || document.getElementById('tarifrechner');
            if (rechner) {
                const headerOffset = 90;
                const elementPosition = rechner.getBoundingClientRect().top;
                const offsetPosition = Math.max(0, elementPosition + window.pageYOffset - headerOffset);

                try {
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'instant'
                    });
                } catch (e) {
                    window.scrollTo(0, offsetPosition);
                }

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
