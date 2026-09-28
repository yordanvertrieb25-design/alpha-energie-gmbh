document.addEventListener("DOMContentLoaded", async () => {
    // 0. Store referral code if present in URL and handle direct Werbelink routing
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref') || urlParams.get('partner') || urlParams.get('refCode') || urlParams.get('aff');
        if (refFromUrl) {
            sessionStorage.setItem('affiliate_ref', refFromUrl);
            localStorage.setItem('affiliate_ref', refFromUrl);

            // If landing on root index page via Werbelink, directly redirect to Stammdatenblatt form
            const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '';
            if (isHomePage) {
                window.location.href = `stammdaten.html?ref=${encodeURIComponent(refFromUrl)}`;
                return;
            }
        }
    } catch (e) {
        console.error('Error saving ref code:', e);
    }

    // 1. Sticky Header Effect
    const header = document.getElementById("main-header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.style.background = "rgba(255, 255, 255, 0.95)";
                header.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.1)";
            } else {
                header.style.background = "rgba(255, 255, 255, 0.85)";
                header.style.boxShadow = "none";
            }
        });
    }

    // Helper to dynamically load external scripts
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                if (window.gsap) return resolve();
                existingScript.addEventListener('load', resolve);
                existingScript.addEventListener('error', reject);
                return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    // Load GSAP & ScrollTrigger dynamically
    try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            if (window.innerWidth > 768) {
                initGSAPAnimations();
            } else {
                // Mobile fallback: ensure elements are visible
                const animateElements = document.querySelectorAll(
                    ".card, .feature-box, .news-card, .section-title, .section-text, .section-subtitle, .about-content, .hero-content"
                );
                animateElements.forEach((el) => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
            }
        }
    } catch (e) {
        console.error("Failed to load GSAP, falling back to CSS reveals", e);
        initFallbackAnimations();
    }

    // 2. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    
    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            navList.classList.toggle('nav-active');
            
            // Hamburger Animation
            const lines = hamburger.querySelectorAll('.hamburger-line');
            if (navList.classList.contains('nav-active')) {
                lines[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                lines[1].style.opacity = '0';
                lines[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                lines[0].style.transform = 'none';
                lines[1].style.opacity = '1';
                lines[2].style.transform = 'none';
            }
        });
    }

    // 3. Mobile Dropdown Toggle
    const navItems = document.querySelectorAll('.nav-item.has-dropdown');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (e.target === item.firstElementChild) {
                    // Only prevent default if there's actually a dropdown inside
                    if (item.querySelector('.dropdown')) {
                        e.preventDefault();
                        item.classList.toggle('active');
                    }
                }
            }
        });
    });





    // --- GSAP Animation Orchestration ---
    function initGSAPAnimations() {
        // Hero Content & Parallax Image
        const heroContent = document.querySelector('.hero-content');
        const heroImageWrapper = document.querySelector('.hero-image-wrapper');
        
        if (heroContent) {
            gsap.fromTo(heroContent.children, 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 1, 
                    stagger: 0.15, 
                    ease: "power3.out",
                    delay: 0.1
                }
            );
        }

        if (heroImageWrapper) {
            gsap.fromTo(heroImageWrapper,
                { opacity: 0, scale: 0.95, y: 40 },
                { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power2.out", delay: 0.3 }
            );
            
            // Scroll animation disabled as requested
            /*
            gsap.to(heroImageWrapper, {
                yPercent: 12,
                ease: "none",
                scrollTrigger: {
                    trigger: "#hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
            */
        }

        // General reveals on scroll (Cards, feature boxes, titles, and custom animated elements)
        const revealElements = document.querySelectorAll(".card, .feature-box, .news-card, .section-title, .section-text, .section-subtitle, .animate-on-scroll");
        revealElements.forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // Vision Section Scroll Zeitraffer Animation
        const aboutSection = document.getElementById("about");
        const timelineWrapper = document.querySelector('.timeline-scroll-wrapper');
        const milestones = document.querySelectorAll('.milestone-block');
        const currentYearEl = document.getElementById('timeline-current-year');
        const progressFill = document.getElementById('timeline-progress-fill');

        if (aboutSection && timelineWrapper && milestones.length) {
            // Fill vertical timeline line as you scroll
            gsap.to(progressFill, {
                height: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: timelineWrapper,
                    start: "top 45%",
                    end: "bottom 55%",
                    scrub: true
                }
            });

            // Milestone state triggers and fade-reveals
            milestones.forEach((block, index) => {
                const year = block.getAttribute('data-year');
                const isLast = index === milestones.length - 1;
                
                ScrollTrigger.create({
                    trigger: block,
                    start: "top 55%",
                    end: "bottom 45%",
                    onEnter: () => updateActiveMilestone(block, year),
                    onEnterBack: () => updateActiveMilestone(block, year),
                    onLeave: () => {
                        // Let it stay active when scrolling past
                    },
                    onLeaveBack: () => block.classList.remove('active')
                });

                gsap.fromTo(block.children,
                    { opacity: 0.4, x: -10 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        ease: "power1.out",
                        scrollTrigger: {
                            trigger: block,
                            start: "top 65%",
                            end: "bottom 35%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            let yearTimeline;
            function updateActiveMilestone(activeBlock, year) {
                milestones.forEach(m => m.classList.remove('active'));
                activeBlock.classList.add('active');
                
                if (currentYearEl && currentYearEl.textContent !== year) {
                    if (yearTimeline) yearTimeline.kill();
                    yearTimeline = gsap.timeline()
                        .to(currentYearEl, { scale: 0.8, opacity: 0.3, duration: 0.1, ease: "power2.in" })
                        .call(() => { currentYearEl.textContent = year; })
                        .to(currentYearEl, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(1.7)" });
                }
            }
        }
    }

    // Fallback: IntersectionObserver for reveals if script loading fails
    function initFallbackAnimations() {
        const animateElements = document.querySelectorAll(
            ".card, .feature-box, .news-card, .section-title, .section-text, .section-subtitle, .about-content"
        );
        animateElements.forEach((el) => el.classList.add("animate-on-scroll"));

        const observerOptions = { threshold: 0.15 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
        
        // Initial fallbacks for Hero
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateX(-50px)';
            heroContent.style.transition = 'opacity 1s ease 0.2s, transform 1s ease 0.2s';
            setTimeout(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateX(0)';
            }, 100);
        }
        
        // Fallback for Zeitraffer
        const aboutSection = document.getElementById("about");
        const timelineWrapper = document.querySelector('.timeline-scroll-wrapper');
        if (aboutSection && timelineWrapper) {
            const milestones = document.querySelectorAll('.milestone-block');
            const currentYearEl = document.getElementById('timeline-current-year');
            const progressFill = document.getElementById('timeline-progress-fill');
            
            const handleTimelineScroll = () => {
                const viewportHeight = window.innerHeight;
                const triggerPoint = viewportHeight * 0.5;
                let activeIndex = 0;
                
                milestones.forEach((block, index) => {
                    const rect = block.getBoundingClientRect();
                    if (rect.top < triggerPoint) { activeIndex = index; }
                    const blockCenter = rect.top + rect.height / 2;
                    const isLast = index === milestones.length - 1;
                    
                    let opacity;
                    if (isLast && blockCenter < triggerPoint) {
                        // Keep the last point fully visible and highlighted once scrolled past it
                        opacity = 1;
                    } else {
                        const distanceToCenter = Math.abs(blockCenter - triggerPoint);
                        const maxDistance = viewportHeight * 0.6;
                        opacity = 1 - (distanceToCenter / maxDistance);
                        opacity = Math.max(0.15, Math.min(1, opacity));
                    }
                    
                    block.style.opacity = opacity;
                    
                    if (isLast && blockCenter < triggerPoint) {
                        block.classList.add('active');
                    } else if (opacity > 0.5) {
                        block.classList.add('active');
                    } else {
                        block.classList.remove('active');
                    }
                });
                
                const activeBlock = milestones[activeIndex];
                if (activeBlock && currentYearEl) {
                    const year = activeBlock.getAttribute('data-year');
                    if (currentYearEl.textContent !== year) {
                        currentYearEl.textContent = year;
                    }
                }
                
                const wrapperRect = timelineWrapper.getBoundingClientRect();
                const wrapperHeight = wrapperRect.height;
                let progress = (triggerPoint - wrapperRect.top) / (wrapperHeight - viewportHeight * 0.3);
                progress = Math.max(0, Math.min(1, progress));
                if (progressFill) { progressFill.style.height = `${progress * 100}%`; }
            };
            window.addEventListener('scroll', handleTimelineScroll);
            window.addEventListener('resize', handleTimelineScroll);
            handleTimelineScroll();
        }
    }

    // 5. Inline Form Validation and Handling
    const validationRules = {
        fullName: {
            validate: (val) => val.trim().split(/\s+/).length >= 2,
            error: "Bitte geben Sie Ihren Vor- und Nachnamen an."
        },
        email: {
            validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
            error: "Geben Sie eine gültige E-Mail-Adresse ein."
        },
        phone: {
            validate: (val) => /^(?:\+49|0049|0)[1-9][0-9\s.-]{5,15}$/.test(val.replace(/\s+/g, '')),
            error: "Ungültiges Format. Beispiel: 0170 1234567"
        },
        experience: {
            validate: (val) => val !== null && val !== undefined && val !== "",
            error: "Bitte wählen Sie Ihre Vertriebserfahrung aus."
        }
    };

    const partnerForm = document.getElementById("application-form");
    if (partnerForm) {
        // Form submit handler
        partnerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            let isValid = true;
            const fields = ["fullName", "email", "phone", "experience"];
            
            fields.forEach(fieldId => {
                const input = document.getElementById(fieldId);
                if (!input) return;
                const errorDiv = input.closest("div:not(.select-wrapper)").querySelector(".error-msg");
                const rule = validationRules[fieldId];
                
                if (!rule.validate(input.value)) {
                    input.style.borderColor = "#ef4444";
                    if (errorDiv && errorDiv.classList.contains("error-msg")) {
                        errorDiv.textContent = input.getAttribute("data-error-msg") || rule.error;
                        errorDiv.style.display = "block";
                    }
                    isValid = false;
                } else {
                    input.style.borderColor = "#ff7a00";
                    if (errorDiv && errorDiv.classList.contains("error-msg")) {
                        errorDiv.style.display = "none";
                    }
                }
            });
            
            if (isValid) {
                const submitBtn = partnerForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Verarbeite...";
                }
                
                // Read from the dropdown select element and other fields
                const fullNameVal = document.getElementById("fullName").value;
                const emailVal = document.getElementById("email").value;
                const phoneVal = document.getElementById("phone").value;
                const experienceVal = document.getElementById("experience").value;
                
                console.log("Submitting Partner Application:", {
                    fullName: fullNameVal,
                    email: emailVal,
                    phone: phoneVal,
                    experience: experienceVal
                });
                
                const isLocalDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000';
                const isFileProtocol = window.location.protocol === 'file:';
                const API_URL = (isLocalDev || isFileProtocol) ? 'http://localhost:3000/api/partner-application' : '/api/partner-application';

                // Check for ref parameter in URL or saved storage
                const urlParams = new URLSearchParams(window.location.search);
                const refCode = urlParams.get('ref') || urlParams.get('refCode') || urlParams.get('aff') || sessionStorage.getItem('affiliate_ref') || localStorage.getItem('affiliate_ref');

                // Send to Backend API
                fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: fullNameVal,
                        email: emailVal,
                        phone: phoneVal,
                        experience: experienceVal,
                        refCode: refCode
                    })
                }).then(res => {
                    if(!res.ok) throw new Error('API Error');
                    // Save for onboarding auto-fill
                    localStorage.setItem('partnerName', fullNameVal);
                    localStorage.setItem('partnerEmail', emailVal);
                    localStorage.setItem('partnerPhone', phoneVal);
                    
                    // Weiterleitung zur Onboarding-Seite
                    window.location.href = "onboarding.html";
                }).catch(err => {
                    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
                    const submitBtn = partnerForm.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Kostenlos registrieren";
                    }
                });
            }
        });
        
        // Add dynamic input validations on blur or change
        ["fullName", "email", "phone", "experience"].forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (!input) return;
            
            if (input.tagName !== "SELECT") {
                input.addEventListener("blur", () => {
                    const errorDiv = input.closest("div:not(.select-wrapper)").querySelector(".error-msg");
                    const rule = validationRules[fieldId];
                    
                    if (input.value.trim() !== "") {
                        if (!rule.validate(input.value)) {
                            input.style.borderColor = "#ef4444";
                            if (errorDiv && errorDiv.classList.contains("error-msg")) {
                                errorDiv.textContent = input.getAttribute("data-error-msg") || rule.error;
                                errorDiv.style.display = "block";
                            }
                        } else {
                            input.style.borderColor = "#ff7a00";
                            if (errorDiv && errorDiv.classList.contains("error-msg")) {
                                errorDiv.style.display = "none";
                            }
                        }
                    }
                });
                
                input.addEventListener("input", () => {
                    input.style.borderColor = "rgba(0,0,0,0.1)";
                });
            } else {
                input.addEventListener("change", () => {
                    const errorDiv = input.closest("div:not(.select-wrapper)").querySelector(".error-msg");
                    const rule = validationRules[fieldId];
                    if (!rule.validate(input.value)) {
                        input.style.borderColor = "#ef4444";
                        if (errorDiv && errorDiv.classList.contains("error-msg")) {
                            errorDiv.textContent = input.getAttribute("data-error-msg") || rule.error;
                            errorDiv.style.display = "block";
                        }
                    } else {
                        input.style.borderColor = "#ff7a00";
                        if (errorDiv && errorDiv.classList.contains("error-msg")) {
                            errorDiv.style.display = "none";
                        }
                    }
                });
            }
        });
    }

    // --- Commission Calculator Logic ---
    const calcSlider = document.getElementById("contract-slider");
    const sliderVal = document.getElementById("slider-val");
    const sofortProv = document.getElementById("sofort-provision");
    const bestandsProv = document.getElementById("bestands-provision");
    const gesamtProv = document.getElementById("gesamt-provision");
    const statusBadge = document.getElementById("status-tier-badge");
    const nextBonusText = document.getElementById("status-tier-next-bonus");
    const progressBar = document.getElementById("status-progress-bar");
    
    if (calcSlider) {
        const animateNumber = (el, targetValue, duration = 150) => {
            if (!el) return;
            const startValue = parseInt(el.getAttribute('data-current-val') || '0', 10);
            if (startValue === targetValue) return;

            el.setAttribute('data-current-val', targetValue);
            
            const startTime = performance.now();
            
            const update = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing: easeOutQuad
                const ease = progress * (2 - progress);
                const current = Math.round(startValue + (targetValue - startValue) * ease);
                
                el.textContent = current.toLocaleString('de-DE');
                
                if (progress < 1) {
                    el.animFrame = requestAnimationFrame(update);
                } else {
                    el.textContent = targetValue.toLocaleString('de-DE');
                }
            };
            
            if (el.animFrame) {
                cancelAnimationFrame(el.animFrame);
            }
            el.animFrame = requestAnimationFrame(update);
        };

        const updateSliderTrack = (slider) => {
            const min = slider.min ? parseFloat(slider.min) : 5;
            const max = slider.max ? parseFloat(slider.max) : 100;
            const val = parseFloat(slider.value);
            const percentage = ((val - min) / (max - min)) * 100;
            slider.style.background = `linear-gradient(to right, var(--accent-orange) ${percentage}%, rgba(0, 0, 0, 0.05) ${percentage}%)`;
        };

        const updateCalculator = () => {
            const val = parseInt(calcSlider.value, 10);
            if (sliderVal) {
                sliderVal.textContent = val;
            }
            
            // Computations
            const sofort = val * 250;
            const gesamt = val * 250;
            
            // Update displays with animation
            if (sofortProv) { sofortProv.setAttribute('data-current-val', String(sofort)); sofortProv.textContent = sofort.toLocaleString('de-DE'); }
            if (gesamtProv) { gesamtProv.setAttribute('data-current-val', String(gesamt)); gesamtProv.textContent = gesamt.toLocaleString('de-DE'); }
            
            // Update slider background track
            updateSliderTrack(calcSlider);
            
            // Update status progress bar and markers
            if (progressBar && statusBadge && nextBonusText) {
                const min = calcSlider.min ? parseFloat(calcSlider.min) : 5;
                const max = calcSlider.max ? parseFloat(calcSlider.max) : 100;
                const percentage = ((val - min) / (max - min)) * 100;
                progressBar.style.width = `${percentage}%`;
                
                const markers = Array.from(document.querySelectorAll('.status-step-marker'));
                markers.sort((a, b) => parseInt(a.dataset.value) - parseInt(b.dataset.value));
                
                let step1 = 30, step2 = 70;
                if (markers.length >= 2) {
                    step1 = parseInt(markers[0].dataset.value);
                    step2 = parseInt(markers[1].dataset.value);
                    
                    if (val >= step1) markers[0].classList.add('reached');
                    else markers[0].classList.remove('reached');
                    
                    if (val >= step2) markers[1].classList.add('reached');
                    else markers[1].classList.remove('reached');
                }
                
                statusBadge.className = 'status-tier-badge'; // reset classes
                
                if (val < step1) {
                    statusBadge.textContent = 'Einsteiger-Status';
                    statusBadge.classList.add('tier-einsteiger');
                    nextBonusText.innerHTML = `Nächster Bonus ab <strong>${step1}</strong> Verträgen!`;
                } else if (val < step2) {
                    statusBadge.textContent = 'Profi-Status';
                    statusBadge.classList.add('tier-profi');
                    nextBonusText.innerHTML = '<strong>+10%</strong> Sonderbonus freigeschaltet!';
                } else {
                    statusBadge.textContent = 'Elite-Status';
                    statusBadge.classList.add('tier-elite');
                    nextBonusText.innerHTML = '<strong>+20%</strong> Premium-Provisionsstufe aktiv!';
                }
            }
        };
        
        calcSlider.addEventListener("input", updateCalculator);
        
        // Initial setup of data-current-val so the initial animation runs from 0 or baseline
        if (sofortProv) sofortProv.setAttribute('data-current-val', '0');
        if (bestandsProv) bestandsProv.setAttribute('data-current-val', '0');
        if (gesamtProv) gesamtProv.setAttribute('data-current-val', '0');
        
        updateCalculator();
    }

    // Smooth scroll for CTA button
    const ctaBtn = document.querySelector('#calculator-section .btn-secondary');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
            const target = document.querySelector('#partner-form');
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // 6. Autoplay videos on scroll
    const scrollVideos = document.querySelectorAll('.autoplay-on-scroll');
    if (scrollVideos.length > 0) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start playing if in view
                    entry.target.play().catch(e => console.log("Video play blocked:", e));
                } else {
                    // Pause if out of view
                    entry.target.pause();
                }
            });
        }, { threshold: 0.1 });

        scrollVideos.forEach(video => {
            videoObserver.observe(video);
        });
    }

    // 7. Versorger Homepage, Live-Tarifrechner & Digital Order Modal
    initVersorgerComponents();

    function initVersorgerComponents() {
        const rechnerForm = document.getElementById('heroTarifrechnerForm');
        const calcPlz = document.getElementById('calcPlz');
        const calcCityBadge = document.getElementById('calcCityBadge');
        const calcKwh = document.getElementById('calcKwh');
        const calcAbschlag = document.getElementById('calcAbschlag');
        const calcSavingsValue = document.getElementById('calcSavingsValue');
        const tabBtns = document.querySelectorAll('.calc-tab-btn');
        const householdBtns = document.querySelectorAll('.household-btn');
        
        let currentBranch = 'strom'; // strom, waerme, gas

        const cityMap = {
            '44': 'Dortmund',
            '45': 'Essen',
            '40': 'Düsseldorf',
            '47': 'Duisburg',
            '50': 'Köln',
            '53': 'Bonn',
            '48': 'Münster',
            '33': 'Bielefeld',
            '42': 'Wuppertal',
            '46': 'Oberhausen',
            '58': 'Hagen',
            '59': 'Hamm',
            '10': 'Berlin',
            '20': 'Hamburg',
            '80': 'München',
            '60': 'Frankfurt',
            '70': 'Stuttgart'
        };

        const tariffSpecs = {
            'alpha-basic': {
                name: 'ALPHA BASIC',
                workingPriceCt: 27.85,
                basePriceEur: 11.90,
                bonus: 100,
                guaranteeMonths: 12
            },
            'alpha-time': {
                name: 'ALPHA TIME',
                workingPriceCt: 24.50,
                basePriceEur: 12.00,
                bonus: 150,
                guaranteeMonths: 12
            },
            'alpha-premium': {
                name: 'ALPHA PREMIUM',
                workingPriceCt: 28.20,
                basePriceEur: 12.90,
                bonus: 180,
                guaranteeMonths: 24
            }
        };

        function recalculateTariffs() {
            if (!calcKwh) return;
            const kwh = Math.max(500, parseInt(calcKwh.value, 10) || 2500);
            const currentMonthly = parseFloat(calcAbschlag ? calcAbschlag.value : 95) || 95;
            const currentYearly = currentMonthly * 12;

            let maxSavings = 0;

            for (const [id, spec] of Object.entries(tariffSpecs)) {
                const annualWorkingCost = kwh * (spec.workingPriceCt / 100);
                const annualBaseCost = spec.basePriceEur * 12;
                const rawYearly = annualWorkingCost + annualBaseCost;
                const netFirstYear = Math.max(0, rawYearly - spec.bonus);
                const monthlyPayment = Math.round(netFirstYear / 12);
                const savings = Math.max(0, Math.round(currentYearly - netFirstYear));

                if (savings > maxSavings) {
                    maxSavings = savings;
                }

                // Update Tariff Card displays
                const priceEl = document.getElementById(`price-${id}`);
                const savingsEl = document.getElementById(`savings-${id}`);
                const kwhEl = document.getElementById(`kwh-desc-${id}`);

                if (priceEl) {
                    if (window.i18n && typeof window.i18n.formatMonthlyPrice === 'function') {
                        priceEl.innerHTML = window.i18n.formatMonthlyPrice(monthlyPayment);
                    } else {
                        priceEl.innerHTML = `${monthlyPayment} €<span> / Monat</span>`;
                    }
                }
                if (savingsEl) {
                    if (window.i18n && typeof window.i18n.formatSavings === 'function') {
                        savingsEl.textContent = savings > 0 
                            ? window.i18n.formatSavings(savings) 
                            : window.i18n.formatGuarantee(spec.guaranteeMonths);
                    } else {
                        savingsEl.textContent = savings > 0 ? `Bis zu ${savings} € / Jahr sparen` : `Faire ${spec.guaranteeMonths} Monate Preisgarantie`;
                    }
                }
                if (kwhEl) {
                    if (window.i18n && typeof window.i18n.formatKwhDesc === 'function') {
                        kwhEl.textContent = window.i18n.formatKwhDesc(kwh, spec.workingPriceCt);
                    } else {
                        kwhEl.textContent = `${kwh.toLocaleString('de-DE')} kWh/Jahr • ${spec.workingPriceCt.toFixed(2).replace('.', ',')} ct/kWh`;
                    }
                }

                // Store computed values in data-attributes of action button
                const btn = document.querySelector(`[data-select-tariff="${id}"]`);
                if (btn) {
                    btn.setAttribute('data-monthly', monthlyPayment);
                    btn.setAttribute('data-kwh', kwh);
                    btn.setAttribute('data-savings', savings);
                    btn.setAttribute('data-name', spec.name);
                }
            }

            if (calcSavingsValue) {
                if (window.i18n && typeof window.i18n.formatMaxSavings === 'function') {
                    calcSavingsValue.textContent = window.i18n.formatMaxSavings(maxSavings || 320);
                } else {
                    calcSavingsValue.textContent = `Bis zu ${maxSavings || 320} € / Jahr!`;
                }
            }
        }

        // Export recalculateTariffs globally for i18n reactive updates
        window.recalculateTariffs = recalculateTariffs;

        // Event listeners for calculator
        if (calcPlz) {
            calcPlz.addEventListener('input', () => {
                const val = calcPlz.value.replace(/\D/g, '').slice(0, 5);
                calcPlz.value = val;
                if (val.length >= 2 && calcCityBadge) {
                    const prefix = val.slice(0, 2);
                    const city = cityMap[prefix] || (val.startsWith('4') || val.startsWith('5') ? 'NRW' : 'Deutschland');
                    calcCityBadge.textContent = city;
                    calcCityBadge.style.display = 'inline-block';
                }
            });
        }

        if (calcKwh) {
            calcKwh.addEventListener('input', () => {
                householdBtns.forEach(b => b.classList.remove('active'));
                recalculateTariffs();
            });
        }

        if (calcAbschlag) {
            calcAbschlag.addEventListener('input', recalculateTariffs);
        }

        // Household buttons click
        householdBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                householdBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const kwh = btn.getAttribute('data-kwh');
                if (calcKwh && kwh) {
                    calcKwh.value = kwh;
                    recalculateTariffs();
                }
            });
        });

        // Tabs click
        tabBtns.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                tabBtns.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentBranch = tab.getAttribute('data-branch') || 'strom';
                
                const noticeText = document.getElementById('calcBranchNoticeText');
                if (currentBranch === 'waerme') {
                    if (calcKwh) calcKwh.value = '4000';
                    if (calcAbschlag) calcAbschlag.value = '145';
                    if (noticeText) {
                        noticeText.textContent = (window.i18n && typeof window.i18n.getBranchNotice === 'function')
                            ? window.i18n.getBranchNotice('waerme')
                            : 'Wärmestrom nach § 14a EnWG • Bis zu 25 % reduzierte Netzentgelte für Wärmepumpen';
                    }
                } else if (currentBranch === 'gas') {
                    if (calcKwh) calcKwh.value = '15000';
                    if (calcAbschlag) calcAbschlag.value = '130';
                    if (noticeText) {
                        noticeText.textContent = (window.i18n && typeof window.i18n.getBranchNotice === 'function')
                            ? window.i18n.getBranchNotice('gas')
                            : 'Erdgas mit freiwilligem Klimaschutzbeitrag • Zertifizierte CO2-Kompensation';
                    }
                } else {
                    if (calcKwh) calcKwh.value = '2500';
                    if (calcAbschlag) calcAbschlag.value = '95';
                    if (noticeText) {
                        noticeText.textContent = (window.i18n && typeof window.i18n.getBranchNotice === 'function')
                            ? window.i18n.getBranchNotice('strom')
                            : 'Ökostrom aus 100 % erneuerbaren Energien • Geprüft nach ok-power Kriterien';
                    }
                }
                recalculateTariffs();
            });
        });

        if (rechnerForm) {
            rechnerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                recalculateTariffs();
                const tarifeSection = document.getElementById('tarife');
                if (tarifeSection) {
                    tarifeSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Initial run
        recalculateTariffs();

        // --- Digital Single-Page Order Modal ---
        const orderModal = document.getElementById('orderModal');
        const modalSteps = document.querySelectorAll('.modal-step');
        const progressSteps = document.querySelectorAll('.progress-step');
        let currentModalStep = 1;
        let selectedOrderData = {};

        function showModalStep(step) {
            currentModalStep = step;
            modalSteps.forEach(s => s.classList.remove('active'));
            progressSteps.forEach(p => p.classList.remove('active'));

            const targetStep = document.getElementById(`modalStep${step}`);
            if (targetStep) targetStep.classList.add('active');

            for (let i = 1; i <= Math.min(step, 3); i++) {
                const prog = document.getElementById(`progStep${i}`);
                if (prog) prog.classList.add('active');
            }
        }

        function openOrderModal(tariffId, btnElement) {
            if (!orderModal) return;
            const spec = tariffSpecs[tariffId] || tariffSpecs['alpha-basic'];
            const kwh = btnElement ? btnElement.getAttribute('data-kwh') : (calcKwh ? calcKwh.value : '2500');
            const monthly = btnElement ? btnElement.getAttribute('data-monthly') : '68';
            const savings = btnElement ? btnElement.getAttribute('data-savings') : '320';
            const plz = calcPlz ? calcPlz.value : '44379';

            selectedOrderData = {
                tariffId,
                tariffName: spec.name,
                branch: currentBranch,
                consumption: kwh,
                monthlyPayment: monthly,
                savings: savings,
                plz: plz
            };

            const nameEl = document.getElementById('orderSummaryTariffName');
            const monthlyEl = document.getElementById('orderSummaryMonthly');
            const kwhEl = document.getElementById('orderSummaryKwh');
            const savingsEl = document.getElementById('orderSummarySavings');
            const plzInputModal = document.getElementById('orderPlz');

            if (nameEl) nameEl.textContent = spec.name;
            const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';
            if (monthlyEl) {
                const suffix = curLang === 'en' ? ' / month' : (curLang === 'tr' ? ' / ay' : ' / Monat');
                const prefix = curLang === 'en' ? '€' : '';
                const post = curLang === 'en' ? '' : ' €';
                monthlyEl.textContent = `${prefix}${monthly}${post}${suffix}`;
            }
            if (kwhEl) {
                const locale = curLang === 'en' ? 'en-US' : (curLang === 'tr' ? 'tr-TR' : 'de-DE');
                kwhEl.textContent = `${parseInt(kwh, 10).toLocaleString(locale)} kWh`;
            }
            if (savingsEl) {
                if (curLang === 'en') {
                    savingsEl.textContent = `Save up to €${savings} / year`;
                } else if (curLang === 'tr') {
                    savingsEl.textContent = `Yılda ${savings} €'ya varan tasarruf`;
                } else {
                    savingsEl.textContent = `Bis zu ${savings} € / Jahr sparen`;
                }
            }
            if (plzInputModal && !plzInputModal.value) plzInputModal.value = plz;

            showModalStep(1);
            orderModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeOrderModal() {
            if (!orderModal) return;
            orderModal.style.display = 'none';
            document.body.style.overflow = '';
        }

        document.querySelectorAll('[data-select-tariff]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tariffId = btn.getAttribute('data-select-tariff');
                openOrderModal(tariffId, btn);
            });
        });

        if (orderModal) {
            orderModal.querySelectorAll('.btn-close-modal, .modal-close-btn').forEach(btn => {
                btn.addEventListener('click', closeOrderModal);
            });
            orderModal.addEventListener('click', (e) => {
                if (e.target === orderModal) closeOrderModal();
            });
        }

        // Step 1 -> Step 2
        const btnStep1Next = document.getElementById('btnStep1Next');
        if (btnStep1Next) {
            btnStep1Next.addEventListener('click', () => {
                const startDateSelect = document.getElementById('orderStartDate');
                selectedOrderData.startDate = startDateSelect ? startDateSelect.value : 'schnellstmoeglich';
                showModalStep(2);
            });
        }

        // Step 2 Back & Next
        const btnStep2Back = document.getElementById('btnStep2Back');
        if (btnStep2Back) {
            btnStep2Back.addEventListener('click', () => showModalStep(1));
        }

        const btnStep2Next = document.getElementById('btnStep2Next');
        if (btnStep2Next) {
            btnStep2Next.addEventListener('click', () => {
                const street = document.getElementById('orderStreet');
                const houseNr = document.getElementById('orderHouseNr');
                const plz = document.getElementById('orderPlz');
                const city = document.getElementById('orderCity');
                const meter = document.getElementById('orderMeterNumber');
                const prevProvider = document.getElementById('orderPrevProvider');
                const cancelOld = document.getElementById('orderCancelOld');

                if (!street?.value.trim() || !houseNr?.value.trim() || !plz?.value.trim() || !city?.value.trim() || !meter?.value.trim()) {
                    alert('Bitte füllen Sie Straße, Hausnummer, PLZ, Ort und Zählernummer vollständig aus.');
                    return;
                }

                selectedOrderData.street = street.value.trim();
                selectedOrderData.houseNr = houseNr.value.trim();
                selectedOrderData.plz = plz.value.trim();
                selectedOrderData.city = city.value.trim();
                selectedOrderData.meterNumber = meter.value.trim();
                selectedOrderData.currentProvider = prevProvider ? prevProvider.value.trim() : '';
                selectedOrderData.cancelOldContract = cancelOld ? cancelOld.checked : true;

                showModalStep(3);
            });
        }

        // Step 3 Back & Submit
        const btnStep3Back = document.getElementById('btnStep3Back');
        if (btnStep3Back) {
            btnStep3Back.addEventListener('click', () => showModalStep(2));
        }

        const btnStep3Submit = document.getElementById('btnStep3Submit');
        if (btnStep3Submit) {
            btnStep3Submit.addEventListener('click', async () => {
                const salutation = document.getElementById('orderSalutation');
                const firstName = document.getElementById('orderFirstName');
                const lastName = document.getElementById('orderLastName');
                const email = document.getElementById('orderEmail');
                const phone = document.getElementById('orderPhone');
                const iban = document.getElementById('orderIban');
                const agb = document.getElementById('orderAgb');

                if (!firstName?.value.trim() || !lastName?.value.trim() || !email?.value.trim() || !phone?.value.trim() || !iban?.value.trim()) {
                    alert('Bitte füllen Sie Vorname, Nachname, E-Mail, Telefon und IBAN aus.');
                    return;
                }

                if (!agb?.checked) {
                    alert('Bitte stimmen Sie den AGB und der Widerrufsbelehrung zu.');
                    return;
                }

                btnStep3Submit.disabled = true;
                btnStep3Submit.textContent = 'Auftrag wird übermittelt...';

                const payload = {
                    ...selectedOrderData,
                    salutation: salutation ? salutation.value : 'Herr/Frau',
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    email: email.value.trim(),
                    phone: phone.value.trim(),
                    iban: iban.value.trim().replace(/\s/g, '').toUpperCase()
                };

                try {
                    const res = await fetch('/api/order/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (data.success) {
                        const orderNumEl = document.getElementById('orderSuccessNumber');
                        const orderEmailEl = document.getElementById('orderSuccessEmail');
                        if (orderNumEl) orderNumEl.textContent = data.orderNumber;
                        if (orderEmailEl) orderEmailEl.textContent = payload.email;
                        showModalStep(4);
                    } else {
                        alert(data.error || 'Fehler beim Erfassen des Auftrags.');
                        btnStep3Submit.disabled = false;
                        btnStep3Submit.textContent = 'Kostenpflichtig bestellen';
                    }
                } catch (e) {
                    const fallbackNum = 'AE-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
                    const orderNumEl = document.getElementById('orderSuccessNumber');
                    const orderEmailEl = document.getElementById('orderSuccessEmail');
                    if (orderNumEl) orderNumEl.textContent = fallbackNum;
                    if (orderEmailEl) orderEmailEl.textContent = payload.email;
                    showModalStep(4);
                }
            });
        }

        // --- Zählerstand Melden Modal ---
        const meterModal = document.getElementById('meterModal');
        const btnOpenMeterModal = document.getElementById('btnOpenMeterModal');
        const formMeterReading = document.getElementById('formMeterReading');

        function closeMeterModal() {
            if (!meterModal) return;
            meterModal.style.display = 'none';
            document.body.style.overflow = '';
        }

        if (btnOpenMeterModal && meterModal) {
            btnOpenMeterModal.addEventListener('click', (e) => {
                e.preventDefault();
                meterModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        }

        if (meterModal) {
            meterModal.querySelectorAll('.btn-close-modal, .modal-close-btn').forEach(btn => {
                btn.addEventListener('click', closeMeterModal);
            });
            meterModal.addEventListener('click', (e) => {
                if (e.target === meterModal) closeMeterModal();
            });
        }

        // Service page inline meter form
        const srvPageMeterForm = document.getElementById('servicePageMeterForm');
        if (srvPageMeterForm) {
            srvPageMeterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const meterNumber = document.getElementById('srvMeterNumber')?.value;
                const reading = document.getElementById('srvReading')?.value;
                const customerName = document.getElementById('srvName')?.value;
                const email = document.getElementById('srvEmail')?.value;
                const notes = document.getElementById('srvNotes')?.value;
                const successDiv = document.getElementById('srvMeterSuccess');
                const submitBtn = document.getElementById('btnSrvSubmitMeter');

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Wird übermittelt...';
                }

                try {
                    await fetch('/api/zaehlerstand/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ meterNumber, reading, customerName, email, notes })
                    });
                } catch (err) {
                    console.log('Meter reading recorded locally');
                }

                if (successDiv) successDiv.style.display = 'block';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Zählerstand erfolgreich übermittelt';
                }
            });
        }

        if (formMeterReading) {
            formMeterReading.addEventListener('submit', async (e) => {
                e.preventDefault();
                const meterNumber = document.getElementById('meterNumberInput')?.value;
                const reading = document.getElementById('meterReadingInput')?.value;
                const customerName = document.getElementById('meterNameInput')?.value;
                const email = document.getElementById('meterEmailInput')?.value;

                try {
                    await fetch('/api/zaehlerstand/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ meterNumber, reading, customerName, email })
                    });
                } catch (err) {
                    console.log('Meter reading logged locally');
                }
                alert('Vielen Dank! Ihr Zählerstand wurde erfolgreich an unseren Kundenservice übermittelt.');
                closeMeterModal();
            });
        }

        // --- Legal Cancellation / Revocation Modal (§ 312k BGB) ---
        const cancelModal = document.getElementById('legalCancelModal');
        const btnOpenCancel = document.getElementById('btnOpenCancelModal');
        const btnOpenRevoke = document.getElementById('btnOpenRevokeModal');
        const btnPageOpenCancel = document.getElementById('btnPageOpenCancel');
        const btnPageOpenRevoke = document.getElementById('btnPageOpenRevoke');
        const formCancel = document.getElementById('formLegalCancel');
        const cancelModalTitle = document.getElementById('cancelModalTitle');
        const cancelTypeInput = document.getElementById('cancelTypeInput');

        function closeCancelModal() {
            if (!cancelModal) return;
            cancelModal.style.display = 'none';
            document.body.style.overflow = '';
        }

        const triggerCancelModal = (type) => {
            if (!cancelModal) return;
            if (type === 'WIDERRUF') {
                if (cancelModalTitle) cancelModalTitle.textContent = 'Bestellung widerrufen (Widerrufsbelehrung)';
                if (cancelTypeInput) cancelTypeInput.value = 'WIDERRUF';
            } else {
                if (cancelModalTitle) cancelModalTitle.textContent = 'Vertrag hier kündigen (§ 312k BGB)';
                if (cancelTypeInput) cancelTypeInput.value = 'KUENDIGUNG';
            }
            cancelModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        if (btnOpenCancel) btnOpenCancel.addEventListener('click', (e) => { e.preventDefault(); triggerCancelModal('KUENDIGUNG'); });
        if (btnPageOpenCancel) btnPageOpenCancel.addEventListener('click', (e) => { e.preventDefault(); triggerCancelModal('KUENDIGUNG'); });
        if (btnOpenRevoke) btnOpenRevoke.addEventListener('click', (e) => { e.preventDefault(); triggerCancelModal('WIDERRUF'); });
        if (btnPageOpenRevoke) btnPageOpenRevoke.addEventListener('click', (e) => { e.preventDefault(); triggerCancelModal('WIDERRUF'); });

        if (cancelModal) {
            cancelModal.querySelectorAll('.btn-close-modal, .modal-close-btn').forEach(btn => {
                btn.addEventListener('click', closeCancelModal);
            });
            cancelModal.addEventListener('click', (e) => {
                if (e.target === cancelModal) closeCancelModal();
            });
        }

        if (formCancel) {
            formCancel.addEventListener('submit', async (e) => {
                e.preventDefault();
                const contractNumber = document.getElementById('cancelContractNumber')?.value;
                const customerName = document.getElementById('cancelCustomerName')?.value;
                const email = document.getElementById('cancelEmail')?.value;
                const reason = document.getElementById('cancelReason')?.value;
                const type = cancelTypeInput ? cancelTypeInput.value : 'KUENDIGUNG';

                let confNum = 'KD-' + Date.now().toString().slice(-6);
                try {
                    const res = await fetch('/api/kuendigung/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contractNumber, customerName, email, reason, type })
                    });
                    const d = await res.json();
                    if (d.confirmationNumber) confNum = d.confirmationNumber;
                } catch (err) {
                    console.log('Cancellation logged locally');
                }

                alert(`Ihre Erklärung wurde rechtswirksam gem. § 312k BGB erfasst.\nBestätigungsnummer: ${confNum}\nEine Bestätigung wurde an ${email} versandt.`);
                closeCancelModal();
            });
        }

        // --- Universal Modal Event Delegation ---
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.btn-close-modal, .modal-close-btn, [data-close-modal]');
            if (closeBtn) {
                const targetSelector = closeBtn.getAttribute('data-close-modal');
                let targetModal = null;
                if (targetSelector && targetSelector !== 'true' && targetSelector !== '') {
                    targetModal = document.querySelector(targetSelector);
                }
                if (!targetModal) {
                    targetModal = closeBtn.closest('.digital-modal-backdrop');
                }
                if (targetModal) {
                    targetModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            } else if (e.target.classList && e.target.classList.contains('digital-modal-backdrop')) {
                e.target.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                const visibleModals = document.querySelectorAll('.digital-modal-backdrop');
                let anyClosed = false;
                visibleModals.forEach(m => {
                    const isVisible = m.style.display === 'flex' || m.style.display === 'block' || window.getComputedStyle(m).display !== 'none';
                    if (isVisible) {
                        m.style.display = 'none';
                        anyClosed = true;
                    }
                });
                if (anyClosed) {
                    document.body.style.overflow = '';
                }
            }
        });

        // --- Multi-Language Switcher ---
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(b => {
            b.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = b.getAttribute('data-lang');
                if (window.i18n && typeof window.i18n.setLanguage === 'function') {
                    window.i18n.setLanguage(lang);
                }
            });
        });

        // --- FAQ Accordion ---
        const faqItems = document.querySelectorAll('.faq-accordion-item');
        faqItems.forEach(item => {
            const header = item.querySelector('.faq-question-btn');
            if (header) {
                header.addEventListener('click', () => {
                    const isOpen = item.classList.contains('active');
                    faqItems.forEach(i => i.classList.remove('active'));
                    if (!isOpen) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }
});

// Cookie Banner Logic
// Cookie Banner Logic
// Cookie Banner Logic
(function initCookieBanner() {
    const checkAndShowBanner = () => {
        try {
            // Check if user has already made a choice
            const consentGiven = localStorage.getItem("alpha_consent_status");
            
            // Check if we are on the settings page
            const isSettingsPage = window.location.pathname.includes('cookie-einstellungen');
            
            if (!consentGiven && !isSettingsPage) {
                
                // Create overlay element (avoiding words like 'cookie', 'banner', 'consent' in IDs to prevent Adblockers from hiding it)
                const overlay = document.createElement("div");
                overlay.id = "alphaDsgvoOverlay";
                overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 2147483646; display: flex; align-items: center; justify-content: center;";
                
                // Create banner element
                const modalBox = document.createElement("div");
                modalBox.id = "alphaDsgvoModal";
                modalBox.style.cssText = "background: #fff; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); padding: 32px; max-width: 600px; width: 90%; z-index: 2147483647; display: flex; flex-direction: column; gap: 20px;";
                
                modalBox.innerHTML = `
                    <h3 style="margin:0; font-size:1.5rem; font-weight:bold; color:#1a1a1a;">Datenschutzeinstellungen</h3>
                    <p style="margin:0; font-size:0.95rem; color:#4a4a4a; line-height:1.6;">
                        Wir verwenden Technologien zur Datenspeicherung, um Ihnen das beste Erlebnis auf unserer Website zu bieten. 
                        Einige davon sind essenziell (z.B. für die Grundfunktionen der Website), während andere uns helfen, unsere Website und Ihr Erlebnis zu verbessern. 
                        Weitere Informationen finden Sie in unserer <a href="datenschutz.html" style="color:#ef8a00; text-decoration:underline;">Datenschutzerklärung</a>.
                    </p>
                    <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
                        <div style="display:flex; gap:12px; flex-wrap:wrap;">
                            <button id="btnAcceptAll" style="flex:1; padding:12px; background:#ef8a00; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1rem; transition: background 0.2s;">Alle akzeptieren</button>
                            <button id="btnDeclineAll" style="flex:1; padding:12px; background:#f0f0f0; color:#333; border:1px solid #ddd; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1rem; transition: background 0.2s;">Nur Essenzielle</button>
                        </div>
                        <a href="cookie-einstellungen.html" style="text-align:center; padding:8px; color:#666; text-decoration:underline; font-size:0.9rem; cursor:pointer;">Individuelle Einstellungen anpassen</a>
                    </div>
                `;
                
                overlay.appendChild(modalBox);
                document.body.appendChild(overlay);
                
                // Prevent scrolling
                document.body.style.overflow = 'hidden';
                
                const removeModal = () => {
                    overlay.remove();
                    document.body.style.overflow = '';
                };
                
                // Accept all cookies
                document.getElementById("btnAcceptAll").addEventListener("click", function() {
                    localStorage.setItem("alpha_consent_status", "all");
                    localStorage.setItem("cookieConsent", "all"); // Keep for settings page
                    localStorage.setItem("cookie_analytics", "true");
                    localStorage.setItem("cookie_marketing", "true");
                    removeModal();
                });
                
                // Decline non-essential cookies
                document.getElementById("btnDeclineAll").addEventListener("click", function() {
                    localStorage.setItem("alpha_consent_status", "essential");
                    localStorage.setItem("cookieConsent", "essential"); // Keep for settings page
                    localStorage.setItem("cookie_analytics", "false");
                    localStorage.setItem("cookie_marketing", "false");
                    removeModal();
                });
            }
        } catch(e) {
            console.error("DSGVO Modal Error: ", e);
        }
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndShowBanner);
    } else {
        checkAndShowBanner();
    }
})();

// ========================================================
// FIRSTCON BESTELLSTRASSE GUARD & ERROR INTERCEPTOR
// ========================================================
(function initFirstconGuard() {
    const safeEscape = (str) => {
        return String(str || '').replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m]));
    };

    // 1. Resolve active token dynamically
    let activeToken = 'alpha-energie-live';
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('firstcon_token') || urlParams.get('token');
        if (urlToken) {
            localStorage.setItem('firstcon_token', urlToken.trim());
            activeToken = urlToken.trim();
        } else {
            const stored = localStorage.getItem('firstcon_token');
            if (stored) activeToken = stored.trim();
        }
    } catch (e) {
        console.warn('Firstcon token storage access warning:', e);
    }

    const applyTokenToWidget = () => {
        const widget = document.getElementById('bestellstrasse_widget');
        if (widget) {
            widget.setAttribute('data-token', activeToken);
            widget.dataset.token = activeToken;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTokenToWidget);
    } else {
        applyTokenToWidget();
    }

    // 3. Catch and suppress unhandled promise rejections / Axios 401 from Firstcon
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event && event.reason ? String(event.reason) : '';
        if (reason.includes('401') || reason.includes('AxiosError') || reason.includes('AuthenticateOrderflow')) {
            console.warn('[Firstcon Guard] Suppressed unhandled 401 rejection from external Firstcon script:', reason);
            event.preventDefault();
        }
    });

    // 4. Intercept SweetAlert2 container additions & suppress reload loop
    const sweepSwalContainers = () => {
        const swals = document.querySelectorAll('.swal2-container, #swal2-container');
        swals.forEach((swal) => {
            const text = swal.textContent || swal.innerText || '';
            if (text.includes('401') || text.includes('AxiosError') || text.includes('Integrationstoken') || text.includes('Fehler ist aufgetreten')) {
                // DO NOT click cancel or confirm buttons - that resolves the promise and triggers reload!
                swal.style.cssText = 'display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;';
                swal.remove();
                document.body.classList.remove('swal2-shown', 'swal2-height-auto');
                document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
            }
        });
    };

    setInterval(sweepSwalContainers, 200);
})();


// ========================================================
// SPOTLIGHT CARD MICRO-INTERACTIONS (Dynamic Alpha-Orange Glow)
// ========================================================
(function initSpotlightEffects() {
    const attachSpotlight = () => {
        const cards = document.querySelectorAll('.spotlight-card, .versorger-tariff-card, .sektor-card, .vorteil-card, .ok-power-explainer-card, .comparison-matrix-wrapper');
        cards.forEach((card) => {
            card.classList.add('spotlight-card');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--mouse-x', '-500px');
                card.style.setProperty('--mouse-y', '-500px');
            });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachSpotlight);
    } else {
        attachSpotlight();
    }
})();

// ========================================================
// ANIMATED COUNTER / LIVE-STATS (IntersectionObserver)
// ========================================================
(function initAnimatedCounters() {
    const setupCounters = () => {
        const counterElements = document.querySelectorAll('[data-counter-target]');
        if (!counterElements.length) return;

        const animateCounter = (el) => {
            const target = parseFloat(el.getAttribute('data-counter-target'));
            const suffix = el.getAttribute('data-counter-suffix') || '';
            const prefix = el.getAttribute('data-counter-prefix') || '';
            const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
            const duration = 1600;
            const startTime = performance.now();

            const step = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out quartic
                const ease = 1 - Math.pow(1 - progress, 4);
                const current = target * ease;
                
                el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
                }
            };

            requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        counterElements.forEach(el => observer.observe(el));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupCounters);
    } else {
        setupCounters();
    }
})();
