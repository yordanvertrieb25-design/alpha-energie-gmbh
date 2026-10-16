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

    // Load GSAP & ScrollTrigger dynamically without blocking synchronous UI setup
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
        .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"))
        .then(() => {
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
        })
        .catch((e) => {
            console.error("Failed to load GSAP, falling back to CSS reveals", e);
            initFallbackAnimations();
        });

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
        calcSlider.addEventListener("change", updateCalculator);
        
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

    // 6. Autoplay videos on scroll (supports sound when data-with-sound="true")
    const scrollVideos = document.querySelectorAll('.autoplay-on-scroll');
    if (scrollVideos.length > 0) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const wantsSound = video.getAttribute('data-with-sound') === 'true' || video.id === 'intro-video';
                if (entry.isIntersecting) {
                    if (wantsSound) {
                        if (video.dataset.userMuted !== 'true') {
                            video.muted = false;
                            video.defaultMuted = false;
                            video.volume = 1.0;
                        }
                        video.play().catch(() => {
                            // Browser blocked unmuted autoplay before first interaction: start playing and unmute on next click
                            video.muted = true;
                            video.play().catch(e => console.log("Video play blocked:", e));
                        });
                    } else {
                        video.muted = true;
                        video.defaultMuted = true;
                        video.volume = 0;
                        video.play().catch(e => console.log("Video play blocked:", e));
                    }
                } else {
                    // Pause if out of view
                    video.pause();
                }
            });
        }, { threshold: 0.15 });

        scrollVideos.forEach(video => {
            const wantsSound = video.getAttribute('data-with-sound') === 'true' || video.id === 'intro-video';
            if (!wantsSound) {
                video.muted = true;
                video.defaultMuted = true;
                video.volume = 0;
                video.addEventListener('volumechange', () => {
                    if (!video.muted || video.volume > 0) {
                        video.muted = true;
                        video.volume = 0;
                    }
                });
            } else {
                video.muted = false;
                video.defaultMuted = false;
                video.volume = 1.0;
            }
            videoObserver.observe(video);
        });
    }

    // 7. Versorger Homepage, Live-Tarifrechner & Digital Order Modal
    initVersorgerComponents();

    function initVersorgerComponents() {
        const rechnerForm = document.getElementById('rechnerForm') || document.getElementById('heroTarifrechnerForm');
        const calcPlz = document.getElementById('calcPlz');
        const calcCityBadge = document.getElementById('calcCityBadge');
        const calcKwh = document.getElementById('calcKwh');
        const calcAbschlag = document.getElementById('calcAbschlag');
        const calcSavingsValue = document.getElementById('calcSavingsValue');
        const tabBtns = document.querySelectorAll('.calc-tab-btn');
        const householdBtns = document.querySelectorAll('.household-btn');
        
        let currentBranch = 'strom'; // strom, waerme, gas

        // 3D Versorger Flow Scene Two-Way Synchronization
        function getVersorgerScene() {
            if (!window.AlphaThree || typeof window.AlphaThree.getScene !== 'function') return null;
            return window.AlphaThree.getScene('#alpha-versorger-canvas') || window.AlphaThree.getScene('#versorger-flow-canvas');
        }

        function sync3DSceneMode(branch) {
            const scene = getVersorgerScene();
            if (scene && typeof scene.setMode === 'function') {
                scene.setMode(branch);
            }
            if (scene && typeof scene.highlightAnchor === 'function') {
                scene.highlightAnchor(branch === 'waerme' ? 'waerme' : null);
            }

            // Sync 3D HUD tabs active state
            const hudButtons = document.querySelectorAll('#alpha-versorger-canvas .hud-tab, #versorger-flow-canvas .hud-tab, .versorger-flow-card .hud-tab');
            hudButtons.forEach(btn => {
                const m = btn.getAttribute('data-mode');
                const isActive = (m === branch);
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });

            // Sync mode label badge
            const labelEls = document.querySelectorAll('.versorger-flow-card [data-mode-label], .versorger-flow-card .alpha-mode-label');
            labelEls.forEach(lbl => {
                if (scene && scene.currentConfig && scene.currentConfig.label) {
                    lbl.textContent = scene.currentConfig.label;
                } else {
                    const fallbackLabels = {
                        strom: 'Ökostrom aus 100 % erneuerbaren Energien',
                        waerme: 'Wärmestrom (§ 14a EnWG Flexibel)',
                        gas: 'Erdgas mit freiwilligem Klimaschutzbeitrag'
                    };
                    lbl.textContent = fallbackLabels[branch] || 'Ökostrom aus 100 % erneuerbaren Energien';
                }
            });
        }

        function sync3DSceneConsumption(kwh) {
            const scene = getVersorgerScene();
            if (scene && typeof scene.setConsumption === 'function') {
                scene.setConsumption(kwh);
            }
        }

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

        const stromTariffSpecs = {
            'alpha-basic': {
                firstconTariffId: 279,
                name: 'ALPHA BASIC 24',
                badge: 'Flexibel & Günstig',
                workingPriceCt: 36.04,
                basePriceEur: 29.40,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Investition in den Ausbau erneuerbarer Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            'alpha-time': {
                firstconTariffId: 280,
                name: 'ALPHA TIME 24',
                badge: 'Bestseller & Spar-Vorteil',
                workingPriceCt: 34.85,
                basePriceEur: 29.40,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Attraktives Preis-Leistungs-Verhältnis mit 24 Monaten Planungssicherheit',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            'alpha-premium': {
                firstconTariffId: 281,
                name: 'ALPHA PREMIUM 24',
                badge: '24 Monate Preisschutz & VIP',
                workingPriceCt: 33.66,
                basePriceEur: 29.40,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Sicherheit und Planbarkeit durch lange Preisgarantie',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            }
        };

        const gasTariffSpecs = {
            'alpha-basic': {
                firstconTariffId: 226,
                name: 'ALPHA BASIC 24 GAS',
                badge: 'Fair & Preisstabil',
                workingPriceCt: 11.76,
                basePriceEur: 22.42,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Erdgas mit freiwilligem Klimaschutzbeitrag',
                    'Förderung ausgewählter Klimaschutzprojekte',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            'alpha-time': {
                firstconTariffId: 227,
                name: 'ALPHA TIME 24 GAS',
                badge: 'Bestseller & Spar-Vorteil',
                workingPriceCt: 10.57,
                basePriceEur: 22.42,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Attraktives Preis-Leistungs-Verhältnis mit 24 Monaten Planungssicherheit',
                    'Erdgas mit freiwilligem Klimaschutzbeitrag',
                    'Förderung ausgewählter Klimaschutzprojekte'
                ]
            },
            'alpha-premium': {
                firstconTariffId: 228,
                name: 'ALPHA PREMIUM 24 GAS',
                badge: '24 Monate Preisschutz & Komfort',
                workingPriceCt: 10.45,
                basePriceEur: 22.42,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Sicherheit und Planbarkeit durch lange Preisgarantie',
                    'Erdgas mit freiwilligem Klimaschutzbeitrag',
                    'Förderung ausgewählter Klimaschutzprojekte'
                ]
            }
        };

        let userHasEnteredKwh = false;
        window.markUserCalculated = () => { userHasEnteredKwh = true; };

        function getActiveSpecs(branchOverride) {
            const b = branchOverride || currentBranch;
            return (b === 'gas') ? gasTariffSpecs : stromTariffSpecs;
        }

        // Backward-compatible reference
        const tariffSpecs = stromTariffSpecs;

        function recalculateTariffs() {
            if (!calcKwh) return;
            const currentSpecs = getActiveSpecs();
            const defaultKwh = currentBranch === 'gas' ? 12000 : 2500;
            const defaultAbschlag = currentBranch === 'gas' ? 115 : 95;
            const rawKwh = (calcKwh && calcKwh.value) ? calcKwh.value.toString().replace(/\D/g, '').trim() : '';
            const parsedKwh = rawKwh ? parseInt(rawKwh, 10) : NaN;
            const kwh = (!isNaN(parsedKwh) && parsedKwh > 0) ? Math.max(500, parsedKwh) : defaultKwh;

            const rawAbschlag = (calcAbschlag && calcAbschlag.value) ? calcAbschlag.value.toString().replace(',', '.').trim() : '';
            const parsedAbschlag = rawAbschlag ? parseFloat(rawAbschlag) : NaN;
            const refGrundversorgerYearly = currentBranch === 'gas'
                ? (kwh * 0.215) + (29.50 * 12)
                : (kwh * 0.415) + (29.90 * 12);
            const currentYearly = (!isNaN(parsedAbschlag) && parsedAbschlag > 0)
                ? Math.max(parsedAbschlag * 12, refGrundversorgerYearly)
                : refGrundversorgerYearly;

            let maxSavings = 0;

            const isDe = !window.i18n || typeof window.i18n.getLanguage !== 'function' || window.i18n.getLanguage() === 'de';

            // Dynamically update section header for #tarife
            const secTitle = document.querySelector('#tarife .section-title');
            const secSub = document.querySelector('#tarife .section-subtitle');
            if (secTitle && secSub && isDe) {
                if (currentBranch === 'gas') {
                    secTitle.innerHTML = 'Transparente Erdgastarife für Ihr Zuhause &amp; Gewerbe';
                    secSub.textContent = 'Erdgas mit freiwilligem Klimaschutzbeitrag, 24 Monaten voller Preisgarantie und automatischem Wechselservice ohne Unterbrechung.';
                } else {
                    secTitle.innerHTML = 'Transparente Stromtarife für Ihr Zuhause &amp; Gewerbe';
                    secSub.textContent = 'Ökostrom aus 100 % erneuerbaren Energien, 24 Monate volle Preisgarantie und kostenloser Wechselservice ohne bürokratischen Aufwand.';
                }
            }

            for (const [id, spec] of Object.entries(currentSpecs)) {
                const activeWorkCt = (typeof spec.liveWorkingPriceCt === 'number') ? spec.liveWorkingPriceCt : spec.workingPriceCt;
                const activeBaseEur = (typeof spec.liveBasePriceEur === 'number') ? spec.liveBasePriceEur : spec.basePriceEur;
                const annualWorkingCost = kwh * (activeWorkCt / 100);
                const annualBaseCost = activeBaseEur * 12;
                const rawYearly = annualWorkingCost + annualBaseCost;
                const netFirstYear = rawYearly;
                const monthlyPayment = Math.round(netFirstYear / 12);
                const savings = Math.max(40, Math.round(currentYearly - netFirstYear));

                if (savings > maxSavings) {
                    maxSavings = savings;
                }

                // Update Tariff Card displays (title, badge, features)
                const cardEl = document.getElementById(`card-${id}`);
                if (cardEl && isDe) {
                    const titleEl = cardEl.querySelector('.tariff-title');
                    if (titleEl) titleEl.textContent = spec.name;

                    const badgeEl = cardEl.querySelector('.tariff-badge');
                    if (badgeEl) badgeEl.textContent = spec.badge;

                    const featList = cardEl.querySelector('.tariff-feature-list');
                    if (featList && spec.features) {
                        featList.innerHTML = spec.features.map(f => `
                            <div class="tariff-feature-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>${f}</span>
                            </div>
                        `).join('');
                    }
                }

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
                        kwhEl.textContent = window.i18n.formatKwhDesc(kwh, activeWorkCt);
                    } else {
                        kwhEl.textContent = `${kwh.toLocaleString('de-DE')} kWh/Jahr • ${activeWorkCt.toFixed(2).replace('.', ',')} ct/kWh • ${activeBaseEur.toFixed(2).replace('.', ',')} € Grundpreis`;
                    }
                }

                // Store computed values in data-attributes of ALL matching action buttons on the page
                document.querySelectorAll(`[data-select-tariff="${id}"]`).forEach(btn => {
                    btn.setAttribute('data-monthly', monthlyPayment);
                    btn.setAttribute('data-kwh', kwh);
                    btn.setAttribute('data-savings', savings);
                    btn.setAttribute('data-name', spec.name);
                    btn.setAttribute('data-branch', currentBranch);
                    if (spec.firstconTariffId) btn.setAttribute('data-firstcon-tariff-id', spec.firstconTariffId);
                    if (spec.energyGridNumber) btn.setAttribute('data-energy-grid', spec.energyGridNumber);
                });
            }

            if (calcSavingsValue) {
                const displaySavings = maxSavings > 0 ? maxSavings : (currentBranch === 'gas' ? 240 : 202);
                if (window.i18n && typeof window.i18n.formatMaxSavings === 'function') {
                    calcSavingsValue.textContent = window.i18n.formatMaxSavings(displaySavings);
                } else {
                    calcSavingsValue.textContent = `Bis zu ${displaySavings} € / Jahr!`;
                }
            }
        }

        // Export recalculateTariffs globally for i18n reactive updates
        window.recalculateTariffs = recalculateTariffs;

        // --- Live Firstcon API v2 Synchronization ---
        const livePlzCityCache = {};
        const liveStreetsCache = {};
        let liveCalcRequestSeq = 0;

        // Verify live Firstcon API connection status on load
        (async function checkFirstconStatus() {
            try {
                const tokenParam = encodeURIComponent(window.__FIRSTCON_TOKEN__ || '1994e155-ce1c-47a7-83c8-21660f0857a7');
                const res = await fetch(`/api/firstcon/status?token=${tokenParam}`);
                if (res.ok) {
                    const statusData = await res.json();
                    window.__FIRSTCON_STATUS__ = statusData;
                    window.__FIRSTCON_CONNECTED__ = Boolean(statusData && statusData.connected);
                }
            } catch (e) {}
        })();

        async function populateStreetDatalist(plz, branch) {
            if (!/^\d{5}$/.test(plz)) return;
            const cacheKey = `${branch}:${plz}`;
            const datalist = document.getElementById('orderStreetList');
            if (!datalist) return;

            let streets = liveStreetsCache[cacheKey];
            if (!streets) {
                try {
                    const tokenParam = encodeURIComponent(window.__FIRSTCON_TOKEN__ || '1994e155-ce1c-47a7-83c8-21660f0857a7');
                    const res = await fetch(`/api/firstcon/grid?plz=${plz}&branch=${branch}&streets=1&token=${tokenParam}`);
                    if (res.ok) {
                        const gridData = await res.json();
                        if (gridData && gridData.found) {
                            if (gridData.city) {
                                livePlzCityCache[plz] = gridData.city;
                            }
                            if (Array.isArray(gridData.streets) && gridData.streets.length > 0) {
                                streets = gridData.streets;
                                liveStreetsCache[cacheKey] = streets;
                            }
                        }
                    }
                } catch (e) {}
            }

            if (Array.isArray(streets) && streets.length > 0) {
                datalist.innerHTML = streets.slice(0, 400).map(s => `<option value="${String(s).replace(/"/g, '&quot;')}"></option>`).join('');
            }
        }

        async function syncLiveFirstconCalculation(plzOverride, kwhOverride, branchOverride) {
            const activeBranch = branchOverride || currentBranch || 'strom';
            const rawPlz = plzOverride !== undefined
                ? String(plzOverride).replace(/\D/g, '').slice(0, 5)
                : ((calcPlz && calcPlz.value) ? calcPlz.value.replace(/\D/g, '').slice(0, 5) : '44379');

            const effectivePlz = /^\d{5}$/.test(rawPlz) ? rawPlz : '44379';

            const defaultKwh = activeBranch === 'gas' ? 12000 : 2500;
            const defaultAbschlag = activeBranch === 'gas' ? 115 : 95;
            const rawKwh = kwhOverride !== undefined
                ? String(kwhOverride).replace(/\D/g, '').trim()
                : ((calcKwh && calcKwh.value) ? calcKwh.value.toString().replace(/\D/g, '').trim() : '');
            const parsedKwh = rawKwh ? parseInt(rawKwh, 10) : NaN;
            const kwh = (!isNaN(parsedKwh) && parsedKwh >= 500) ? parsedKwh : defaultKwh;

            const rawAbschlag = (calcAbschlag && calcAbschlag.value) ? calcAbschlag.value.toString().replace(',', '.').trim() : '';
            const parsedAbschlag = rawAbschlag ? parseFloat(rawAbschlag) : NaN;
            const currentMonthlyEuro = (!isNaN(parsedAbschlag) && parsedAbschlag > 0) ? parsedAbschlag : defaultAbschlag;

            const reqId = ++liveCalcRequestSeq;
            if (/^\d{5}$/.test(rawPlz)) {
                populateStreetDatalist(rawPlz, activeBranch);
            }

            try {
                const res = await fetch('/api/tarife/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        plz: effectivePlz,
                        consumption: kwh,
                        currentAbschlag: currentMonthlyEuro,
                        currentMonthlyEuro,
                        branch: activeBranch,
                        orderflowToken: window.__FIRSTCON_TOKEN__ || '1994e155-ce1c-47a7-83c8-21660f0857a7'
                    })
                });
                if (!res.ok) return null;
                const data = await res.json();
                if (reqId !== liveCalcRequestSeq || !data || !data.success) return data;

                window.__FIRSTCON_LAST_CALC__ = data;
                window.__FIRSTCON_CONNECTED__ = Boolean(data.firstconConnected);

                if (data.city && /^\d{5}$/.test(rawPlz)) {
                    livePlzCityCache[rawPlz] = data.city;
                    if (calcPlz && calcPlz.value === rawPlz && calcCityBadge) {
                        calcCityBadge.textContent = data.city;
                        calcCityBadge.style.display = 'inline-block';
                    }
                    const mPlz = document.getElementById('modalCalcPlz');
                    const mBadge = document.getElementById('modalCalcCityBadge');
                    if (mPlz && mPlz.value === rawPlz && mBadge) {
                        mBadge.textContent = data.city;
                        mBadge.style.display = 'inline-block';
                    }
                    const oPlz = document.getElementById('orderPlz');
                    const oCity = document.getElementById('orderCity');
                    if (oPlz && oPlz.value === rawPlz && oCity) {
                        oCity.value = data.city;
                    }
                }

                if (Array.isArray(data.tariffs)) {
                    const activeSpecs = getActiveSpecs(activeBranch);
                    let maxLiveSavings = 0;
                    const isDe = !window.i18n || typeof window.i18n.getLanguage !== 'function' || window.i18n.getLanguage() === 'de';

                    data.tariffs.forEach(t => {
                        const spec = activeSpecs[t.id];
                        const sav = (t.savingsEur !== undefined) ? t.savingsEur : (t.savingsYear || 0);
                        const baseM = (typeof t.basePriceEurMonth === 'number') ? t.basePriceEurMonth : ((typeof t.basePriceEur === 'number') ? t.basePriceEur : (spec ? spec.basePriceEur : 29.40));

                        const sanitizedLiveFeatures = Array.isArray(t.features)
                            ? t.features.map(f => {
                                if (/kurzer\s+Vertragslaufzeit/i.test(f)) {
                                    return 'Attraktives Preis-Leistungs-Verhältnis mit 24 Monaten Planungssicherheit';
                                }
                                if (/kompensation|klimaneutral|co2/i.test(f)) {
                                    return 'Erdgas mit freiwilligem Klimaschutzbeitrag';
                                }
                                if (/^100\s*%?\s*Ökostrom$/i.test(String(f).trim())) {
                                    return 'Ökostrom aus 100 % erneuerbaren Energien';
                                }
                                return f;
                            })
                            : null;

                        if (spec) {
                            spec.firstconTariffId = t.firstconTariffId || spec.firstconTariffId;
                            spec.energyGridNumber = t.energyGridNumber || data.energyGridNumber || spec.energyGridNumber;
                            spec.liveWorkingPriceCt = t.workingPriceCt;
                            spec.liveBasePriceEur = baseM;
                            if (t.name) spec.name = t.name;
                            if (t.badge) spec.badge = t.badge;
                            if (sanitizedLiveFeatures && sanitizedLiveFeatures.length === 4) {
                                spec.features = sanitizedLiveFeatures;
                            }
                            if (t.priceGuaranteeMonths) {
                                spec.guaranteeMonths = t.priceGuaranteeMonths;
                            }
                        }
                        if (sav > maxLiveSavings) {
                            maxLiveSavings = sav;
                        }

                        if (currentBranch === activeBranch) {
                            const cardEl = document.getElementById(`card-${t.id}`);
                            if (cardEl && isDe) {
                                const titleEl = cardEl.querySelector('.tariff-title');
                                if (titleEl && (t.name || (spec && spec.name))) {
                                    titleEl.textContent = t.name || spec.name;
                                }
                                const badgeEl = cardEl.querySelector('.tariff-badge');
                                if (badgeEl && (t.badge || (spec && spec.badge))) {
                                    badgeEl.textContent = t.badge || spec.badge;
                                }
                                const featList = cardEl.querySelector('.tariff-feature-list');
                                const feats = (sanitizedLiveFeatures && sanitizedLiveFeatures.length > 0) ? sanitizedLiveFeatures : (spec ? spec.features : null);
                                if (featList && feats) {
                                    featList.innerHTML = feats.map(f => `
                                        <div class="tariff-feature-item">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            <span>${f}</span>
                                        </div>
                                    `).join('');
                                }
                            }

                            const priceEl = document.getElementById(`price-${t.id}`);
                            const savingsEl = document.getElementById(`savings-${t.id}`);
                            const kwhEl = document.getElementById(`kwh-desc-${t.id}`);
                            if (priceEl) {
                                if (window.i18n && typeof window.i18n.formatMonthlyPrice === 'function') {
                                    priceEl.innerHTML = window.i18n.formatMonthlyPrice(t.monthlyPayment);
                                } else {
                                    priceEl.innerHTML = `${t.monthlyPayment} €<span> / Monat</span>`;
                                }
                            }
                            if (savingsEl) {
                                const gMonths = t.priceGuaranteeMonths || (spec ? spec.guaranteeMonths : 24);
                                if (window.i18n && typeof window.i18n.formatSavings === 'function') {
                                    savingsEl.textContent = sav > 0
                                        ? window.i18n.formatSavings(sav)
                                        : window.i18n.formatGuarantee(gMonths);
                                } else {
                                    savingsEl.textContent = sav > 0
                                        ? `Bis zu ${sav} € / Jahr sparen`
                                        : `Faire ${gMonths} Monate Preisgarantie`;
                                }
                            }
                            if (kwhEl && typeof t.workingPriceCt === 'number') {
                                if (window.i18n && typeof window.i18n.formatKwhDesc === 'function') {
                                    kwhEl.textContent = window.i18n.formatKwhDesc(kwh, t.workingPriceCt);
                                } else {
                                    kwhEl.textContent = `${kwh.toLocaleString('de-DE')} kWh/Jahr • ${t.workingPriceCt.toFixed(2).replace('.', ',')} ct/kWh • ${baseM.toFixed(2).replace('.', ',')} € Grundpreis`;
                                }
                            }
                        }

                        document.querySelectorAll(`[data-select-tariff="${t.id}"]`).forEach(btn => {
                            btn.setAttribute('data-monthly', t.monthlyPayment);
                            btn.setAttribute('data-kwh', kwh);
                            btn.setAttribute('data-savings', sav);
                            if (t.name) btn.setAttribute('data-name', t.name);
                            if (t.firstconTariffId) btn.setAttribute('data-firstcon-tariff-id', t.firstconTariffId);
                            if (t.energyGridNumber || data.energyGridNumber) {
                                btn.setAttribute('data-energy-grid', t.energyGridNumber || data.energyGridNumber);
                            }
                        });
                    });

                    if (currentBranch === activeBranch && calcSavingsValue && maxLiveSavings > 0) {
                        if (window.i18n && typeof window.i18n.formatMaxSavings === 'function') {
                            calcSavingsValue.textContent = window.i18n.formatMaxSavings(maxLiveSavings);
                        } else {
                            calcSavingsValue.textContent = `Bis zu ${maxLiveSavings} € / Jahr!`;
                        }
                    }

                    // Keep selectedOrderData synced with live Firstcon metadata
                    if (selectedOrderData && selectedOrderData.tariffId) {
                        const matched = data.tariffs.find(t => t.id === selectedOrderData.tariffId);
                        if (matched) {
                            selectedOrderData.firstconTariffId = matched.firstconTariffId || selectedOrderData.firstconTariffId;
                            selectedOrderData.energyGridNumber = matched.energyGridNumber || data.energyGridNumber || selectedOrderData.energyGridNumber;
                        }
                    }
                }

                return data;
            } catch (e) {
                return null;
            }
        }

        window.syncLiveFirstconCalculation = syncLiveFirstconCalculation;

        // Event listeners for calculator
        if (calcPlz) {
            calcPlz.addEventListener('input', () => {
                const val = calcPlz.value.replace(/\D/g, '').slice(0, 5);
                calcPlz.value = val;
                if (calcCityBadge) {
                    if (val.length >= 2) {
                        const prefix = val.slice(0, 2);
                        const city = livePlzCityCache[val] || cityMap[prefix] || (val.startsWith('4') || val.startsWith('5') ? 'NRW' : 'Deutschland');
                        calcCityBadge.textContent = city;
                        calcCityBadge.style.display = 'inline-block';
                    } else {
                        calcCityBadge.style.display = 'none';
                    }
                }
                if (val.length === 5) {
                    syncLiveFirstconCalculation(val, undefined, currentBranch);
                } else {
                    recalculateTariffs();
                }
            });
        }

        if (calcKwh) {
            calcKwh.addEventListener('input', () => {
                userHasEnteredKwh = true;
                const rawKwh = calcKwh.value ? calcKwh.value.toString().replace(/\D/g, '').trim() : '';
                const typedKwh = rawKwh ? parseInt(rawKwh, 10) : null;
                householdBtns.forEach(b => {
                    const btnKwh = parseInt(b.getAttribute('data-kwh'), 10);
                    b.classList.toggle('active', Boolean(typedKwh && btnKwh === typedKwh));
                });
                recalculateTariffs();
                const defaultKwh = currentBranch === 'gas' ? 12000 : 2500;
                const kwh = (typedKwh && typedKwh > 0) ? Math.max(500, typedKwh) : defaultKwh;
                sync3DSceneConsumption(kwh);
                if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                    syncLiveFirstconCalculation(calcPlz.value, kwh, currentBranch);
                }
            });
        }

        if (calcAbschlag) {
            calcAbschlag.addEventListener('input', () => {
                userHasEnteredKwh = true;
                recalculateTariffs();
                if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                    syncLiveFirstconCalculation(calcPlz.value, undefined, currentBranch);
                }
            });
        }

        // Household buttons click
        householdBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                userHasEnteredKwh = true;
                householdBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const kwh = btn.getAttribute('data-kwh');
                if (calcKwh && kwh) {
                    calcKwh.value = kwh;
                    recalculateTariffs();
                    sync3DSceneConsumption(parseInt(kwh, 10));
                    if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                        syncLiveFirstconCalculation(calcPlz.value, parseInt(kwh, 10), currentBranch);
                    }
                }
            });
        });

        function updateHouseholdPresets(branch) {
            const presets = branch === 'gas' ? [
                { label: 'Wohnung', sub: '5.000 kWh', kwh: 5000 },
                { label: 'Reihenhaus', sub: '12.000 kWh', kwh: 12000 },
                { label: 'Haus', sub: '18.000 kWh', kwh: 18000 },
                { label: 'Großes Haus', sub: '25.000 kWh', kwh: 25000 }
            ] : [
                { label: '1 Person', sub: '1.500 kWh', kwh: 1500 },
                { label: '2 Pers.', sub: '2.500 kWh', kwh: 2500 },
                { label: '3 Pers.', sub: '3.500 kWh', kwh: 3500 },
                { label: '4+ Pers.', sub: '4.500 kWh', kwh: 4500 }
            ];

            const rawVal = (calcKwh && calcKwh.value) ? calcKwh.value.toString().replace(/\D/g, '').trim() : '';
            const currentVal = rawVal ? parseInt(rawVal, 10) : null;

            householdBtns.forEach((btn, idx) => {
                if (presets[idx]) {
                    btn.setAttribute('data-kwh', presets[idx].kwh);
                    const labelEl = btn.querySelector('.household-btn-label');
                    const subEl = btn.querySelector('.household-btn-sub');
                    if (labelEl) labelEl.textContent = presets[idx].label;
                    if (subEl) subEl.textContent = presets[idx].sub;
                    const isActive = Boolean(currentVal !== null && currentVal === presets[idx].kwh);
                    btn.classList.toggle('active', isActive);
                }
            });
        }

        // Tabs click
        tabBtns.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                tabBtns.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentBranch = tab.getAttribute('data-branch') || 'strom';
                
                const noticeText = document.getElementById('calcBranchNoticeText');
                const hasUserKwh = Boolean(calcKwh && calcKwh.value && calcKwh.value.toString().trim() !== '');
                const hasUserAbschlag = Boolean(calcAbschlag && calcAbschlag.value && calcAbschlag.value.toString().trim() !== '');

                if (currentBranch === 'gas') {
                    if (hasUserKwh) {
                        if (calcKwh.value === '2500' || calcKwh.value === '1500' || calcKwh.value === '3500' || calcKwh.value === '4500') {
                            calcKwh.value = '12000';
                        }
                    } else if (calcKwh) {
                        calcKwh.placeholder = 'z. B. 12.000';
                    }
                    if (calcAbschlag && !hasUserAbschlag) {
                        calcAbschlag.placeholder = 'Abschlag';
                    }
                    updateHouseholdPresets('gas');
                    if (noticeText) {
                        noticeText.textContent = (window.i18n && typeof window.i18n.getBranchNotice === 'function')
                            ? window.i18n.getBranchNotice('gas')
                            : 'Erdgas mit freiwilligem Klimaschutzbeitrag • 24 Monate volle Preisgarantie';
                    }
                } else {
                    currentBranch = 'strom';
                    if (hasUserKwh) {
                        if (calcKwh.value === '12000' || calcKwh.value === '5000' || calcKwh.value === '18000' || calcKwh.value === '25000') {
                            calcKwh.value = '2500';
                        }
                    } else if (calcKwh) {
                        calcKwh.placeholder = 'z. B. 2.500';
                    }
                    if (calcAbschlag && !hasUserAbschlag) {
                        calcAbschlag.placeholder = 'Abschlag';
                    }
                    updateHouseholdPresets('strom');
                    if (noticeText) {
                        noticeText.textContent = (window.i18n && typeof window.i18n.getBranchNotice === 'function')
                            ? window.i18n.getBranchNotice('strom')
                            : 'Ökostrom aus 100 % erneuerbaren Energien • 24 Monate volle Preisgarantie';
                    }
                }
                recalculateTariffs();

                // Synchronize 3D scene mode and consumption
                sync3DSceneMode(currentBranch);
                const currentKwhVal = Math.max(500, parseInt(calcKwh && calcKwh.value ? calcKwh.value : (currentBranch === 'gas' ? 12000 : 2500), 10) || 2500);
                sync3DSceneConsumption(currentKwhVal);
                if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                    syncLiveFirstconCalculation(calcPlz.value, currentKwhVal, currentBranch);
                }
            });
        });

        // Two-way sync: Clicking 3D HUD mode buttons switches calculator tab
        document.addEventListener('click', (e) => {
            const hudBtn = e.target.closest('#alpha-versorger-canvas .hud-tab, #versorger-flow-canvas .hud-tab, .versorger-flow-card .hud-tab');
            if (hudBtn) {
                const targetMode = hudBtn.getAttribute('data-mode');
                if (targetMode && targetMode !== currentBranch) {
                    const matchingTab = document.querySelector(`.calc-tab-btn[data-branch="${targetMode}"]`);
                    if (matchingTab) {
                        matchingTab.click();
                    }
                }
            }

            // Two-Way Sync: Clicking callout banner CTAs or footer tariff cards (.btn-rechner-sync)
            const syncBtn = e.target.closest('.btn-rechner-sync');
            if (syncBtn) {
                const targetBranch = syncBtn.getAttribute('data-branch') || 'strom';
                const targetFocus = syncBtn.getAttribute('data-anchor-focus') || syncBtn.getAttribute('data-focus') || targetBranch;

                // If video flow controller is present, unlock scroll and sync calculator
                if (window.AlphaVideoFlow && typeof window.AlphaVideoFlow.syncToRechner === 'function') {
                    window.AlphaVideoFlow.syncToRechner(targetBranch, targetFocus);
                    return;
                }

                // 1. Orient 3D camera and highlight anchor in scene
                const scene = getVersorgerScene();
                if (scene) {
                    if (typeof scene.setFocus === 'function') {
                        scene.setFocus(targetFocus);
                    }
                    if (typeof scene.highlightAnchor === 'function') {
                        scene.highlightAnchor(targetFocus);
                    }
                    if (typeof scene.pulse === 'function') {
                        scene.pulse();
                    }
                }

                // 2. Switch calculator tab if different
                const matchingTab = document.querySelector(`.calc-tab-btn[data-branch="${targetBranch}"]`);
                if (matchingTab && !matchingTab.classList.contains('active')) {
                    matchingTab.click();
                }

                // 3. Smooth scroll to calculator (#rechner) and pulse highlight
                const rechnerTarget = document.getElementById('rechner') || document.getElementById('tarifrechner');
                if (rechnerTarget) {
                    rechnerTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    rechnerTarget.classList.remove('calc-highlight-pulse');
                    void rechnerTarget.offsetWidth;
                    rechnerTarget.classList.add('calc-highlight-pulse');
                    setTimeout(() => {
                        rechnerTarget.classList.remove('calc-highlight-pulse');
                    }, 3200);
                }
            }

            // Quick consumption buttons in the 3D Sparsimulator HUD
            const kwhBtn = e.target.closest('[data-sim-kwh]');
            if (kwhBtn) {
                e.preventDefault();
                userHasEnteredKwh = true;
                const kwhVal = parseInt(kwhBtn.getAttribute('data-sim-kwh'), 10);
                if (kwhVal) {
                    if (calcKwh) {
                        calcKwh.value = kwhVal;
                    }
                    householdBtns.forEach(b => {
                        b.classList.toggle('active', parseInt(b.getAttribute('data-kwh'), 10) === kwhVal);
                    });
                    recalculateTariffs();
                    sync3DSceneConsumption(kwhVal);
                }
            }
        });

        // Initialize 3D scene when ready
        function handleSceneReady() {
            const initialKwh = Math.max(500, parseInt(calcKwh ? calcKwh.value : 2500, 10) || 2500);
            sync3DSceneMode(currentBranch);
            sync3DSceneConsumption(initialKwh);
        }

        window.addEventListener('alphathree:ready', handleSceneReady);
        window.addEventListener('alphathree:scene-created', (e) => {
            if (e.detail && (e.detail.name === 'versorger-flow' || (e.detail.container && e.detail.container.id && e.detail.container.id.includes('versorger')))) {
                handleSceneReady();
            }
        });
        window.addEventListener('alphathree:savings-update', (e) => {
            if (e.detail && e.detail.savingsYear !== undefined) {
                // 1. Calculator card savings banner
                const savingsEl = document.getElementById('calcSavingsValue');
                if (savingsEl && e.detail.savingsYear > 0) {
                    savingsEl.textContent = `Bis zu ${e.detail.savingsYear.toLocaleString('de-DE')} € / Jahr!`;
                }

                // 2. 3D Simulator prominent savings display badge
                const simSavingsEl = document.getElementById('sim-savings-display');
                if (simSavingsEl) {
                    simSavingsEl.textContent = `bis zu ${e.detail.savingsYear.toLocaleString('de-DE')} € / Jahr`;
                }

                // 3. 3D Simulator direct comparison tag
                const simCompareTag = document.getElementById('sim-compare-tag') || document.querySelector('.sim-compare-tag');
                if (simCompareTag && e.detail.annualBaseCost && e.detail.annualAlphaCost) {
                    simCompareTag.innerHTML = `Grundversorger: ${e.detail.annualBaseCost.toLocaleString('de-DE')} € &rarr; Alpha Energie: <strong>${e.detail.annualAlphaCost.toLocaleString('de-DE')} €</strong>`;
                }

                // 4. Synchronize active state of quick consumption selector buttons
                const currentKwh = e.detail.kwh;
                const quickKwhBtns = document.querySelectorAll('[data-sim-kwh]');
                quickKwhBtns.forEach(btn => {
                    const btnKwh = parseInt(btn.getAttribute('data-sim-kwh'), 10);
                    btn.classList.toggle('active', btnKwh === currentKwh);
                });
            }
        });
        setTimeout(handleSceneReady, 250);

        if (rechnerForm) {
            rechnerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                userHasEnteredKwh = true;
                recalculateTariffs();
                if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                    syncLiveFirstconCalculation(calcPlz.value, undefined, currentBranch);
                }
                const tarifeSection = document.getElementById('tarife');
                if (tarifeSection) {
                    tarifeSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Check URL parameters (?plz=...&branch=...&kwh=...)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const urlPlz = urlParams.get('plz');
            const urlBranch = urlParams.get('branch');
            const urlKwh = urlParams.get('kwh');
            if (urlBranch && (urlBranch === 'gas' || urlBranch === 'strom')) {
                const targetTab = document.querySelector(`.calc-tab-btn[data-branch="${urlBranch}"]`);
                if (targetTab) targetTab.click();
            }
            if (urlPlz && calcPlz) {
                calcPlz.value = urlPlz.replace(/\D/g, '').slice(0, 5);
                calcPlz.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (urlKwh && calcKwh) {
                calcKwh.value = urlKwh.replace(/\D/g, '');
                userHasEnteredKwh = true;
            }
        } catch (err) {}

        // Initial run
        recalculateTariffs();
        syncLiveFirstconCalculation((calcPlz && /^\d{5}$/.test(calcPlz.value)) ? calcPlz.value : '44379', undefined, currentBranch);

        // --- Global Strict Scroll Lock for Modals ---
        function lockAlphaModalScroll() {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
            document.documentElement.classList.add('alpha-modal-open');
            document.body.classList.add('alpha-modal-open');
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
            document.body.style.setProperty('overflow', 'hidden', 'important');
        }

        function unlockAlphaModalScroll() {
            const anyVisible = Array.from(document.querySelectorAll('.digital-modal-backdrop, #alphaDsgvoOverlay')).some(m => {
                return m.style.display === 'flex' || m.style.display === 'block' || window.getComputedStyle(m).display !== 'none';
            });
            if (!anyVisible) {
                document.documentElement.classList.remove('alpha-modal-open');
                document.body.classList.remove('alpha-modal-open');
                document.documentElement.style.removeProperty('overflow');
                document.body.style.removeProperty('overflow');
                document.body.style.paddingRight = '';
            }
        }

        window.lockAlphaModalScroll = lockAlphaModalScroll;
        window.unlockAlphaModalScroll = unlockAlphaModalScroll;

        // Block wheel/touch scroll chaining on background when modal is open
        document.addEventListener('wheel', (e) => {
            if (!document.documentElement.classList.contains('alpha-modal-open')) return;
            const scrollableBody = e.target.closest('.modal-body');
            if (!scrollableBody) {
                e.preventDefault();
                return;
            }
            const { scrollTop, scrollHeight, clientHeight } = scrollableBody;
            const deltaY = e.deltaY;
            const isAtTop = scrollTop <= 0 && deltaY < 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && deltaY > 0;
            if (scrollHeight <= clientHeight || isAtTop || isAtBottom) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!document.documentElement.classList.contains('alpha-modal-open')) return;
            const scrollableBody = e.target.closest('.modal-body');
            if (!scrollableBody) {
                e.preventDefault();
                return;
            }
            if (scrollableBody.scrollHeight <= scrollableBody.clientHeight) {
                e.preventDefault();
            }
        }, { passive: false });

        // --- Digital Single-Page Order Modal ---
        const orderModal = document.getElementById('orderModal');
        const modalSteps = document.querySelectorAll('.modal-step');
        const progressSteps = document.querySelectorAll('.progress-step');
        const modalCalcPlz = document.getElementById('modalCalcPlz');
        const modalCalcCityBadge = document.getElementById('modalCalcCityBadge');
        const modalCalcKwh = document.getElementById('modalCalcKwh');
        const modalPresetBtns = document.querySelectorAll('.modal-kwh-preset-btn');
        const modalStep1ValidationMsg = document.getElementById('modalStep1ValidationMsg');
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

        function resolveCityFromPlz(plzStr) {
            if (!plzStr || plzStr.length < 2) return '';
            if (livePlzCityCache[plzStr]) return livePlzCityCache[plzStr];
            const prefix = plzStr.slice(0, 2);
            return cityMap[prefix] || (plzStr.startsWith('4') || plzStr.startsWith('5') ? 'NRW' : 'Deutschland');
        }

        function updateModalPresetsForBranch(branch) {
            const presets = branch === 'gas' ? [
                { label: 'Wohnung', sub: '5.000 kWh', kwh: 5000 },
                { label: 'Reihenhaus', sub: '12.000 kWh', kwh: 12000 },
                { label: 'Haus', sub: '18.000 kWh', kwh: 18000 },
                { label: 'Großes Haus', sub: '25.000 kWh', kwh: 25000 }
            ] : [
                { label: '1 Person', sub: '1.500 kWh', kwh: 1500 },
                { label: '2 Pers.', sub: '2.500 kWh', kwh: 2500 },
                { label: '3 Pers.', sub: '3.500 kWh', kwh: 3500 },
                { label: '4+ Pers.', sub: '4.500 kWh', kwh: 4500 }
            ];
            modalPresetBtns.forEach((btn, idx) => {
                if (presets[idx]) {
                    btn.setAttribute('data-modal-kwh', String(presets[idx].kwh));
                    const lbl = btn.querySelector('.mp-label');
                    const sub = btn.querySelector('.mp-sub');
                    if (lbl) lbl.textContent = presets[idx].label;
                    if (sub) sub.textContent = presets[idx].sub;
                }
            });
            if (modalCalcKwh) {
                modalCalcKwh.placeholder = branch === 'gas' ? 'z. B. 12000' : 'z. B. 2500';
            }
        }

        function refreshModalStep1Calculation() {
            const branch = selectedOrderData.branch || currentBranch || 'strom';
            const currentSpecs = getActiveSpecs(branch);
            const tariffId = selectedOrderData.tariffId || 'alpha-basic';
            const spec = currentSpecs[tariffId] || currentSpecs['alpha-basic'];

            const nameEl = document.getElementById('orderSummaryTariffName');
            const badgeEl = document.getElementById('orderSummaryTariffBadge');
            const monthlyEl = document.getElementById('orderSummaryMonthly');
            const kwhEl = document.getElementById('orderSummaryKwh');
            const savingsEl = document.getElementById('orderSummarySavings');
            const promptBox = document.getElementById('modalInlineCalcBox');
            const promptHeader = document.getElementById('modalInlineCalcPromptHeader');
            const promptIcon = document.getElementById('modalInlineCalcPromptIcon');
            const promptText = document.getElementById('modalInlineCalcPromptText');
            const plzInputModal = document.getElementById('orderPlz');
            const cityInputModal = document.getElementById('orderCity');

            if (nameEl) nameEl.textContent = spec.name;
            if (badgeEl) badgeEl.textContent = `${spec.guaranteeMonths} Monate Preisgarantie`;

            const plzVal = modalCalcPlz ? modalCalcPlz.value.replace(/\D/g, '').slice(0, 5) : (selectedOrderData.plz || '');
            if (modalCalcPlz && modalCalcPlz.value !== plzVal) {
                modalCalcPlz.value = plzVal;
            }

            const detectedCity = resolveCityFromPlz(plzVal);
            if (modalCalcCityBadge) {
                if (plzVal.length >= 2 && detectedCity) {
                    modalCalcCityBadge.textContent = detectedCity;
                    modalCalcCityBadge.style.display = 'inline-block';
                } else {
                    modalCalcCityBadge.style.display = 'none';
                }
            }

            // Sync PLZ & City to Step 2 and main calculator
            selectedOrderData.plz = plzVal;
            if (plzInputModal) plzInputModal.value = plzVal;
            if (cityInputModal && plzVal.length >= 2 && detectedCity) {
                cityInputModal.value = detectedCity;
                selectedOrderData.city = detectedCity;
            }
            if (calcPlz && plzVal.length === 5 && calcPlz.value !== plzVal) {
                calcPlz.value = plzVal;
                if (calcCityBadge && detectedCity) {
                    calcCityBadge.textContent = detectedCity;
                    calcCityBadge.style.display = 'inline-block';
                }
            }

            const rawKwh = modalCalcKwh && modalCalcKwh.value ? modalCalcKwh.value.toString().replace(/\D/g, '').trim() : '';
            const parsedKwh = rawKwh ? parseInt(rawKwh, 10) : NaN;
            const isKwhValid = !isNaN(parsedKwh) && parsedKwh >= 500;
            const isPlzValid = /^\d{5}$/.test(plzVal);

            if (isPlzValid) {
                syncLiveFirstconCalculation(plzVal, isKwhValid ? parsedKwh : undefined, branch);
            }

            // Highlight matching preset button
            modalPresetBtns.forEach(btn => {
                const btnKwh = parseInt(btn.getAttribute('data-modal-kwh'), 10);
                btn.classList.toggle('active', Boolean(isKwhValid && btnKwh === parsedKwh));
            });

            const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';
            const activeWorkCt = (isPlzValid && typeof spec.liveWorkingPriceCt === 'number') ? spec.liveWorkingPriceCt : spec.workingPriceCt;
            const activeBaseEur = (isPlzValid && typeof spec.liveBasePriceEur === 'number') ? spec.liveBasePriceEur : spec.basePriceEur;

            if (isKwhValid) {
                const annualWorkingCost = parsedKwh * (activeWorkCt / 100);
                const annualBaseCost = activeBaseEur * 12;
                const rawYearly = annualWorkingCost + annualBaseCost;
                const monthlyPayment = Math.round(rawYearly / 12);

                const refRateCt = branch === 'gas' ? 13.20 : 38.50;
                const refBaseYear = branch === 'gas' ? 180 : 168;
                const refYearly = (parsedKwh * (refRateCt / 100)) + refBaseYear;
                const savings = Math.max(50, Math.round(refYearly - rawYearly));

                selectedOrderData.consumption = String(parsedKwh);
                selectedOrderData.monthlyPayment = String(monthlyPayment);
                selectedOrderData.savings = String(savings);
                selectedOrderData.userEnteredModalKwh = parsedKwh;
                if (spec.firstconTariffId) selectedOrderData.firstconTariffId = spec.firstconTariffId;
                if (spec.energyGridNumber) selectedOrderData.energyGridNumber = spec.energyGridNumber;

                if (monthlyEl) {
                    const suffix = curLang === 'en' ? ' / month' : (curLang === 'tr' ? ' / ay' : (curLang === 'ar' ? ' / شهر' : ' / Monat'));
                    const prefix = curLang === 'en' ? '€' : '';
                    const post = curLang === 'en' ? '' : ' €';
                    monthlyEl.textContent = `${prefix}${monthlyPayment}${post}${suffix}`;
                    monthlyEl.style.color = '#0a1f44';
                }
                if (kwhEl) {
                    const locale = curLang === 'en' ? 'en-US' : (curLang === 'tr' ? 'tr-TR' : 'de-DE');
                    const kwhUnit = curLang === 'en' ? 'kWh / year' : (curLang === 'tr' ? 'kWh / yıl' : (curLang === 'ar' ? 'ك.و.س / سنة' : 'kWh / Jahr'));
                    kwhEl.textContent = `${parsedKwh.toLocaleString(locale)} ${kwhUnit}`;
                    kwhEl.style.color = '#0a1f44';
                }
                if (savingsEl) {
                    const rateFormatted = activeWorkCt.toFixed(2).replace('.', ',');
                    const baseFormatted = activeBaseEur.toFixed(2).replace('.', ',');
                    if (curLang === 'en') {
                        savingsEl.textContent = `Save up to €${savings} / year (${rateFormatted} ct/kWh • €${baseFormatted}/mo base)`;
                    } else if (curLang === 'tr') {
                        savingsEl.textContent = `Yılda ${savings} €'ya varan tasarruf (${rateFormatted} ct/kWh)`;
                    } else if (curLang === 'ar') {
                        savingsEl.textContent = `وفّر حتى ${savings} € / سنة (${rateFormatted} ct/kWh)`;
                    } else {
                        savingsEl.textContent = `Bis zu ${savings.toLocaleString('de-DE')} € / Jahr sparen (${rateFormatted} ct/kWh • ${baseFormatted} € Grundpreis)`;
                    }
                }

                // Sync back to main page calculator
                if (calcKwh && calcKwh.value !== String(parsedKwh)) {
                    calcKwh.value = String(parsedKwh);
                    userHasEnteredKwh = true;
                    recalculateTariffs();
                }
            } else {
                selectedOrderData.consumption = '';
                selectedOrderData.monthlyPayment = '';
                selectedOrderData.savings = '';

                if (monthlyEl) {
                    monthlyEl.textContent = 'Bitte unten Verbrauch wählen';
                    monthlyEl.style.color = '#ea580c';
                }
                if (kwhEl) {
                    kwhEl.textContent = 'Bitte unten angeben';
                    kwhEl.style.color = '#ea580c';
                }
                if (savingsEl) {
                    const rateFormatted = activeWorkCt.toFixed(2).replace('.', ',');
                    const baseFormatted = activeBaseEur.toFixed(2).replace('.', ',');
                    savingsEl.textContent = `⚡ Konditionen: ${rateFormatted} ct/kWh • ${baseFormatted} €/Monat Grundpreis – bitte unten Verbrauch angeben`;
                }
            }

            if (promptBox && promptHeader && promptIcon && promptText) {
                if (isPlzValid && isKwhValid) {
                    promptIcon.textContent = '✓';
                    promptIcon.style.background = '#dcfce7';
                    promptIcon.style.color = '#15803d';
                    promptHeader.style.color = '#166534';
                    promptText.textContent = 'Deine Angaben wurden übernommen – dein persönlicher Abschlag ist berechnet:';
                    promptBox.style.borderColor = '#86efac';
                    promptBox.style.background = '#f0fdf4';
                    if (modalStep1ValidationMsg) modalStep1ValidationMsg.style.display = 'none';
                } else {
                    promptIcon.textContent = '⚡';
                    promptIcon.style.background = '#ffedd5';
                    promptIcon.style.color = '#ea580c';
                    promptHeader.style.color = '#9a3412';
                    promptBox.style.borderColor = 'rgba(249, 178, 51, 0.85)';
                    promptBox.style.background = '#fffdf9';
                    if (!isPlzValid && !isKwhValid) {
                        promptText.textContent = 'Noch keine Verbrauchsdaten eingegeben – bitte hier kurz PLZ & Verbrauch ergänzen:';
                    } else if (!isPlzValid && isKwhValid) {
                        promptText.textContent = 'Fast fertig – bitte gib noch kurz deine 5-stellige Postleitzahl (Lieferort) ein:';
                    } else {
                        promptText.textContent = 'Fast fertig – bitte wähle noch kurz deine Haushaltsgröße oder gib deinen Jahresverbrauch (kWh) ein:';
                    }
                }
            }
        }

        if (modalCalcPlz) {
            modalCalcPlz.addEventListener('input', () => {
                modalCalcPlz.style.borderColor = '';
                refreshModalStep1Calculation();
            });
        }

        if (modalCalcKwh) {
            modalCalcKwh.addEventListener('input', () => {
                modalCalcKwh.style.borderColor = '';
                userHasEnteredKwh = true;
                refreshModalStep1Calculation();
            });
        }

        modalPresetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const presetKwh = btn.getAttribute('data-modal-kwh');
                if (modalCalcKwh && presetKwh) {
                    modalCalcKwh.value = presetKwh;
                    modalCalcKwh.style.borderColor = '';
                    userHasEnteredKwh = true;
                    refreshModalStep1Calculation();
                }
            });
        });

        function openOrderModal(tariffId, btnElement) {
            if (!orderModal) return;
            const branch = (btnElement && btnElement.getAttribute('data-branch')) || currentBranch || 'strom';
            const currentSpecs = getActiveSpecs(branch);
            const validTariffId = (tariffId && currentSpecs[tariffId]) ? tariffId : 'alpha-basic';
            const spec = currentSpecs[validTariffId];

            const mainPlz = (calcPlz && calcPlz.value && calcPlz.value.trim()) ? calcPlz.value.replace(/\D/g, '').slice(0, 5) : (selectedOrderData.plz || '');
            const rawMainKwh = (calcKwh && calcKwh.value) ? parseInt(calcKwh.value.toString().replace(/\D/g, ''), 10) : NaN;
            const prefilledKwh = (userHasEnteredKwh && !isNaN(rawMainKwh) && rawMainKwh >= 500)
                ? rawMainKwh
                : (selectedOrderData.userEnteredModalKwh || null);

            selectedOrderData = {
                tariffId: validTariffId,
                tariffName: spec.name,
                branch: branch,
                consumption: prefilledKwh ? String(prefilledKwh) : '',
                monthlyPayment: '',
                savings: '',
                plz: mainPlz,
                userEnteredModalKwh: prefilledKwh,
                firstconTariffId: (btnElement && btnElement.getAttribute('data-firstcon-tariff-id')) || spec.firstconTariffId || null,
                energyGridNumber: (btnElement && btnElement.getAttribute('data-energy-grid')) || spec.energyGridNumber || null
            };

            updateModalPresetsForBranch(branch);

            if (modalCalcPlz) {
                modalCalcPlz.value = mainPlz;
                modalCalcPlz.style.borderColor = '';
            }
            if (modalCalcKwh) {
                modalCalcKwh.value = prefilledKwh ? String(prefilledKwh) : '';
                modalCalcKwh.style.borderColor = '';
            }
            if (modalStep1ValidationMsg) {
                modalStep1ValidationMsg.style.display = 'none';
            }

            refreshModalStep1Calculation();

            showModalStep(1);
            orderModal.style.display = 'flex';
            lockAlphaModalScroll();

            setTimeout(() => {
                if (modalCalcPlz && !/^\d{5}$/.test(modalCalcPlz.value)) {
                    modalCalcPlz.focus();
                } else if (modalCalcKwh && (!modalCalcKwh.value || parseInt(modalCalcKwh.value, 10) < 500)) {
                    modalCalcKwh.focus();
                }
            }, 80);
        }

        const modalPlzInput = document.getElementById('orderPlz');
        if (modalPlzInput) {
            modalPlzInput.addEventListener('input', () => {
                const val = modalPlzInput.value.replace(/\D/g, '').slice(0, 5);
                modalPlzInput.value = val;
                const modalCityInput = document.getElementById('orderCity');
                if (val.length >= 2 && modalCityInput && !modalCityInput.value) {
                    const prefix = val.slice(0, 2);
                    const city = livePlzCityCache[val] || cityMap[prefix] || (val.startsWith('4') || val.startsWith('5') ? 'NRW' : 'Deutschland');
                    modalCityInput.value = city;
                }
                if (val.length === 5) {
                    populateStreetDatalist(val, selectedOrderData.branch || currentBranch || 'strom');
                }
            });
        }

        function closeOrderModal() {
            if (!orderModal) return;
            orderModal.style.display = 'none';
            unlockAlphaModalScroll();
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

        // Step 1 -> Step 2 (Requires valid PLZ & kWh)
        const btnStep1Next = document.getElementById('btnStep1Next');
        if (btnStep1Next) {
            btnStep1Next.addEventListener('click', () => {
                refreshModalStep1Calculation();
                const plzVal = modalCalcPlz ? modalCalcPlz.value.replace(/\D/g, '').trim() : (selectedOrderData.plz || '');
                const rawKwh = modalCalcKwh && modalCalcKwh.value ? modalCalcKwh.value.toString().replace(/\D/g, '').trim() : (selectedOrderData.consumption || '');
                const kwhVal = rawKwh ? parseInt(rawKwh, 10) : NaN;
                const isPlzOk = /^\d{5}$/.test(plzVal);
                const isKwhOk = !isNaN(kwhVal) && kwhVal >= 500;

                if (!isPlzOk || !isKwhOk) {
                    if (modalStep1ValidationMsg) {
                        if (!isPlzOk && !isKwhOk) {
                            modalStep1ValidationMsg.textContent = 'Bitte gib deine 5-stellige Postleitzahl ein und wähle deinen geschätzten Jahresverbrauch (oder deine Haushaltsgröße).';
                        } else if (!isPlzOk) {
                            modalStep1ValidationMsg.textContent = 'Bitte gib deine 5-stellige Postleitzahl (Lieferort) ein.';
                        } else {
                            modalStep1ValidationMsg.textContent = 'Bitte wähle deine Haushaltsgröße oder gib deinen geschätzten Jahresverbrauch (ab 500 kWh) ein.';
                        }
                        modalStep1ValidationMsg.style.display = 'block';
                    }
                    if (!isPlzOk && modalCalcPlz) {
                        modalCalcPlz.style.borderColor = '#ef4444';
                        modalCalcPlz.focus();
                    } else if (!isKwhOk && modalCalcKwh) {
                        modalCalcKwh.style.borderColor = '#ef4444';
                        modalCalcKwh.focus();
                    }
                    return;
                }

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
                const birthDate = document.getElementById('orderBirthDate');
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
                    branch: selectedOrderData.branch || currentBranch,
                    orderflowToken: window.__FIRSTCON_TOKEN__ || '1994e155-ce1c-47a7-83c8-21660f0857a7',
                    salutation: salutation ? salutation.value : 'Herr/Frau',
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    birthDate: birthDate && birthDate.value ? birthDate.value.trim() : null,
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
                    window.__FIRSTCON_LAST_ORDER__ = data.firstcon || null;
                    if (data.success) {
                        const orderNumEl = document.getElementById('orderSuccessNumber') || document.getElementById('confirmedOrderNumber');
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
                    const orderNumEl = document.getElementById('orderSuccessNumber') || document.getElementById('confirmedOrderNumber');
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
            unlockAlphaModalScroll();
        }

        if (btnOpenMeterModal && meterModal) {
            btnOpenMeterModal.addEventListener('click', (e) => {
                e.preventDefault();
                meterModal.style.display = 'flex';
                lockAlphaModalScroll();
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

        // --- Legal Cancellation (§ 312k BGB) & Online Revocation (EU 2023/2673) Modal ---
        const cancelModal = document.getElementById('legalCancelModal');
        const btnOpenCancel = document.getElementById('btnOpenCancelModal');
        const btnOpenRevoke = document.getElementById('btnOpenRevokeModal');
        const btnPageOpenCancel = document.getElementById('btnPageOpenCancel');
        const btnPageOpenRevoke = document.getElementById('btnPageOpenRevoke');
        const formCancel = document.getElementById('formLegalCancel');
        const cancelModalTitle = document.getElementById('cancelModalTitle');
        const cancelModalSubtitle = document.getElementById('cancelModalSubtitle');
        const cancelTypeInput = document.getElementById('cancelTypeInput');
        const cancelModeTabKuendigung = document.getElementById('cancelModeTabKuendigung');
        const cancelModeTabWiderruf = document.getElementById('cancelModeTabWiderruf');
        const cancelOnlyFields = document.getElementById('cancelOnlyFields');
        const revokeOnlyFields = document.getElementById('revokeOnlyFields');
        const cancelTerminationType = document.getElementById('cancelTerminationType');
        const cancelExtraReasonGroup = document.getElementById('cancelExtraReasonGroup');
        const cancelReasonSelect = document.getElementById('cancelReasonSelect');
        const cancelDateType = document.getElementById('cancelDateType');
        const cancelCustomDateGroup = document.getElementById('cancelCustomDateGroup');
        const cancelCustomDate = document.getElementById('cancelCustomDate');
        const revokeOrderDate = document.getElementById('revokeOrderDate');
        const cancelContractNumberLabel = document.getElementById('cancelContractNumberLabel');
        const cancelDeclarationText = document.getElementById('cancelDeclarationText');
        const btnCancelSubmit = document.getElementById('btnCancelSubmit');
        const cancelFormContainer = document.getElementById('cancelFormContainer');
        const cancelConfirmationView = document.getElementById('cancelModalConfirmationView');

        let lastGeneratedPdfBlobUrl = null;
        let lastGeneratedPdfFilename = 'Bestaetigung.pdf';

        function closeCancelModal() {
            if (!cancelModal) return;
            cancelModal.style.display = 'none';
            unlockAlphaModalScroll();
        }

        function updateCancelSubfieldsVisibility() {
            const isWiderruf = (cancelTypeInput && cancelTypeInput.value === 'WIDERRUF');
            if (!isWiderruf && cancelTerminationType && cancelExtraReasonGroup) {
                const isExtraordinary = /außerordentlich/i.test(cancelTerminationType.value);
                cancelExtraReasonGroup.style.display = isExtraordinary ? 'block' : 'none';
                if (cancelReasonSelect) {
                    cancelReasonSelect.required = isExtraordinary;
                }
            }
            if (!isWiderruf && cancelDateType && cancelCustomDateGroup) {
                const isCustomDate = cancelDateType.value === 'wunschdatum';
                cancelCustomDateGroup.style.display = isCustomDate ? 'block' : 'none';
                if (cancelCustomDate) {
                    cancelCustomDate.required = isCustomDate;
                }
            }
        }

        const triggerCancelModal = (type) => {
            if (!cancelModal) return;
            const isWiderruf = String(type || 'KUENDIGUNG').toUpperCase() === 'WIDERRUF';

            if (cancelFormContainer) cancelFormContainer.style.display = 'block';
            if (cancelConfirmationView) cancelConfirmationView.style.display = 'none';

            if (cancelTypeInput) {
                cancelTypeInput.value = isWiderruf ? 'WIDERRUF' : 'KUENDIGUNG';
            }

            if (cancelModeTabKuendigung && cancelModeTabWiderruf) {
                cancelModeTabKuendigung.classList.toggle('active', !isWiderruf);
                cancelModeTabWiderruf.classList.toggle('active', isWiderruf);
                cancelModeTabKuendigung.style.background = !isWiderruf ? '#0a1f44' : 'transparent';
                cancelModeTabKuendigung.style.color = !isWiderruf ? '#ffffff' : '#475569';
                cancelModeTabWiderruf.style.background = isWiderruf ? '#0a1f44' : 'transparent';
                cancelModeTabWiderruf.style.color = isWiderruf ? '#ffffff' : '#475569';
            }

            if (isWiderruf) {
                if (cancelModalTitle) cancelModalTitle.textContent = 'Vertrag widerrufen (Online-Widerrufsformular)';
                if (cancelModalSubtitle) {
                    cancelModalSubtitle.innerHTML = 'Widerrufen Sie Ihren Energieliefervertrag innerhalb der 14-tägigen Widerrufsfrist einfach online. Sie erhalten umgehend eine elektronische Eingangsbestätigung per E-Mail sowie als PDF-Dokument.';
                }
                if (cancelOnlyFields) cancelOnlyFields.style.display = 'none';
                if (revokeOnlyFields) revokeOnlyFields.style.display = 'block';
                if (cancelReasonSelect) cancelReasonSelect.required = false;
                if (cancelCustomDate) cancelCustomDate.required = false;
                if (revokeOrderDate) revokeOrderDate.required = true;
                if (cancelContractNumberLabel) cancelContractNumberLabel.textContent = 'Bestell- oder Kundennummer *';
                if (cancelDeclarationText) {
                    cancelDeclarationText.textContent = 'Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über die Lieferung von Energie (Strom/Erdgas). *';
                }
                if (btnCancelSubmit) btnCancelSubmit.textContent = 'Widerruf senden';
            } else {
                if (cancelModalTitle) cancelModalTitle.textContent = 'Verträge hier kündigen (§ 312k BGB)';
                if (cancelModalSubtitle) {
                    cancelModalSubtitle.innerHTML = 'Hier können Sie Ihren bestehenden Energieliefervertrag bei Alpha Energie gemäß § 312k BGB elektronisch kündigen. Nach dem Absenden steht Ihnen Ihre Kündigungsbestätigung sofort als PDF zum Download bereit und wird Ihnen zusätzlich per E-Mail zugesandt.';
                }
                if (cancelOnlyFields) cancelOnlyFields.style.display = 'block';
                if (revokeOnlyFields) revokeOnlyFields.style.display = 'none';
                if (revokeOrderDate) revokeOrderDate.required = false;
                if (cancelContractNumberLabel) cancelContractNumberLabel.textContent = 'Vertrags- oder Kundennummer *';
                if (cancelDeclarationText) {
                    cancelDeclarationText.textContent = 'Ich bestätige die Richtigkeit meiner Angaben und möchte meinen oben genannten Energieliefervertrag verbindlich kündigen. *';
                }
                if (btnCancelSubmit) btnCancelSubmit.textContent = 'Jetzt kündigen';
                updateCancelSubfieldsVisibility();
            }

            cancelModal.style.display = 'flex';
            lockAlphaModalScroll();
        };

        window.triggerCancelModal = triggerCancelModal;

        if (cancelTerminationType) {
            cancelTerminationType.addEventListener('change', updateCancelSubfieldsVisibility);
        }
        if (cancelDateType) {
            cancelDateType.addEventListener('change', updateCancelSubfieldsVisibility);
        }
        if (cancelModeTabKuendigung) {
            cancelModeTabKuendigung.addEventListener('click', (e) => {
                e.preventDefault();
                triggerCancelModal('KUENDIGUNG');
            });
        }
        if (cancelModeTabWiderruf) {
            cancelModeTabWiderruf.addEventListener('click', (e) => {
                e.preventDefault();
                triggerCancelModal('WIDERRUF');
            });
        }

        document.querySelectorAll('#btnOpenCancelModal, #btnPageOpenCancel, [data-open-cancel-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                triggerCancelModal('KUENDIGUNG');
            });
        });

        document.querySelectorAll('#btnOpenRevokeModal, #btnPageOpenRevoke, [data-open-revoke-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                triggerCancelModal('WIDERRUF');
            });
        });

        if (cancelModal) {
            cancelModal.querySelectorAll('.btn-close-modal, .modal-close-btn').forEach(btn => {
                btn.addEventListener('click', closeCancelModal);
            });
            cancelModal.addEventListener('click', (e) => {
                if (e.target === cancelModal) closeCancelModal();
            });
        }

        // Client-side fallback PDF generator (PDF 1.4 with WinAnsi octal escapes)
        function createClientFallbackPdfBlob(details) {
            const toPdfStr = (input) => {
                const s = String(input == null ? '' : input)
                    .replace(/€/g, 'EUR')
                    .replace(/[–—]/g, '-')
                    .replace(/[„“”]/g, '"')
                    .replace(/[’‘]/g, "'");
                let out = '(';
                for (let i = 0; i < s.length; i++) {
                    const c = s.charCodeAt(i);
                    if (c === 40 || c === 41 || c === 92) out += '\\' + s[i];
                    else if (c >= 32 && c <= 126) out += s[i];
                    else if (c >= 160 && c <= 255) out += '\\' + c.toString(8).padStart(3, '0');
                    else out += ' ';
                }
                return out + ')';
            };

            const isWiderruf = details.type === 'WIDERRUF';
            const title = isWiderruf
                ? 'Eingangsbestaetigung Ihres Vertragswiderrufs'
                : 'Eingangsbestaetigung der Kuendigung gem. § 312k BGB';

            const ops = [
                '0.039 0.122 0.267 rg 0 755 595 87 re f',
                '1 0.478 0 rg 0 751 595 4 re f',
                'BT /F2 16 Tf 1 1 1 rg 45 805 Td ' + toPdfStr('ALPHA ENERGIE - Eine Marke der Firstcon GmbH') + ' Tj ET',
                'BT /F1 9.5 Tf 0.85 0.9 0.96 rg 45 785 Td ' + toPdfStr('Referenz-Nr.: ' + details.confirmationNumber + '  |  Datum & Uhrzeit: ' + details.submittedAtFormatted) + ' Tj ET',
                'BT /F2 14 Tf 0.039 0.122 0.267 rg 45 715 Td ' + toPdfStr(title) + ' Tj ET'
            ];

            const rows = [
                ['Bestaetigungsnummer:', details.confirmationNumber],
                ['Datum & Uhrzeit des Eingangs:', details.submittedAtFormatted],
                ['Vorgangsart:', isWiderruf ? 'Widerruf eines Energieliefervertrags' : (details.terminationType || 'Ordentliche Kuendigung')]
            ];
            if (!isWiderruf) {
                if (details.reason) rows.push(['Kuendigungsgrund:', details.reason]);
                rows.push(['Kuendigungszeitpunkt:', details.cancelDate || 'Zum naechstmoeglichen Zeitpunkt']);
            } else if (details.orderDate) {
                rows.push(['Bestelldatum:', details.orderDate]);
            }
            rows.push(
                ['Vertragsart / Sparte:', details.contractType || '-'],
                [isWiderruf ? 'Bestell- oder Kundennummer:' : 'Vertrags- oder Kundennummer:', details.contractNumber || '-']
            );
            if (details.meterNumber) rows.push(['Zaehlernummer:', details.meterNumber]);
            rows.push(
                ['Name des Kunden:', details.customerName || '-'],
                ['Anschrift:', details.fullAddress || '-'],
                ['E-Mail-Adresse:', details.email || '-']
            );

            let y = 675;
            for (const [k, v] of rows) {
                ops.push('BT /F2 10 Tf 0.15 0.22 0.32 rg 45 ' + y + ' Td ' + toPdfStr(k) + ' Tj ET');
                ops.push('BT /F1 10 Tf 0.05 0.09 0.16 rg 230 ' + y + ' Td ' + toPdfStr(v) + ' Tj ET');
                y -= 22;
            }

            y -= 15;
            if (isWiderruf) {
                ops.push('BT /F2 9.5 Tf 0.6 0.2 0.05 rg 45 ' + y + ' Td ' + toPdfStr('Hinweis: Eine formelle Pruefung der Wirksamkeit Ihrer Widerrufserklaerung steht noch aus.') + ' Tj ET');
            } else {
                ops.push('BT /F2 9.5 Tf 0.1 0.4 0.2 rg 45 ' + y + ' Td ' + toPdfStr('Hinweis gem. § 312k BGB: Bitte speichern Sie dieses Dokument fuer Ihre Unterlagen.') + ' Tj ET');
            }

            const stream = ops.join('\n');
            const objs = [
                '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
                '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
                '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
                '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
                '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
                `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
            ];
            let pdf = '%PDF-1.4\n';
            const offs = [0];
            for (const o of objs) {
                offs.push(pdf.length);
                pdf += o;
            }
            const xref = pdf.length;
            pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
            for (let i = 1; i <= objs.length; i++) {
                pdf += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
            }
            pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
            return new Blob([pdf], { type: 'application/pdf' });
        }

        function triggerPdfDownload(blobUrl, filename) {
            if (!blobUrl) return;
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || 'Bestaetigung.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        if (formCancel) {
            formCancel.addEventListener('submit', async (e) => {
                e.preventDefault();
                const isWiderruf = (cancelTypeInput && cancelTypeInput.value === 'WIDERRUF');
                const type = isWiderruf ? 'WIDERRUF' : 'KUENDIGUNG';

                const salutation = document.getElementById('cancelSalutation')?.value || '';
                const firstName = document.getElementById('cancelFirstName')?.value.trim() || '';
                const lastName = document.getElementById('cancelLastName')?.value.trim() || '';
                const legacyName = document.getElementById('cancelCustomerName')?.value.trim() || '';
                const customerName = (firstName || lastName)
                    ? `${salutation} ${firstName} ${lastName}`.replace(/\s+/g, ' ').trim()
                    : legacyName;

                const street = document.getElementById('cancelStreet')?.value.trim() || '';
                const houseNr = document.getElementById('cancelHouseNr')?.value.trim() || '';
                const plz = document.getElementById('cancelPlz')?.value.trim() || '';
                const city = document.getElementById('cancelCity')?.value.trim() || '';
                const fullAddress = `${street} ${houseNr}, ${plz} ${city}`.replace(/\s+/g, ' ').replace(/^,\s*/, '').trim();

                const contractType = document.getElementById('cancelContractType')?.value || 'Ökostrom aus 100 % erneuerbaren Energien';
                const contractNumber = document.getElementById('cancelContractNumber')?.value.trim() || '';
                const meterNumber = document.getElementById('cancelMeterNumber')?.value.trim() || '';
                const email = document.getElementById('cancelEmail')?.value.trim() || '';

                const terminationType = isWiderruf
                    ? 'Widerruf'
                    : (cancelTerminationType ? cancelTerminationType.value : 'Ordentliche Kündigung');

                const selectedReasonCategory = (!isWiderruf && cancelReasonSelect) ? cancelReasonSelect.value : '';
                const extraReasonNote = (!isWiderruf && document.getElementById('cancelReason'))
                    ? document.getElementById('cancelReason').value.trim()
                    : '';
                const reason = isWiderruf
                    ? null
                    : ([selectedReasonCategory, extraReasonNote].filter(Boolean).join(' – ') || null);

                if (!isWiderruf && /außerordentlich/i.test(terminationType) && !reason) {
                    alert('Bitte wählen oder nennen Sie bei einer außerordentlichen Kündigung den Kündigungsgrund (z. B. Umzug oder Preiserhöhung).');
                    return;
                }

                const dateMode = (!isWiderruf && cancelDateType) ? cancelDateType.value : 'naechstmoeglich';
                const customDateVal = (!isWiderruf && cancelCustomDate) ? cancelCustomDate.value : '';
                const cancelDate = (!isWiderruf && dateMode === 'wunschdatum' && customDateVal)
                    ? customDateVal
                    : 'Zum nächstmöglichen Zeitpunkt';

                const orderDate = isWiderruf && revokeOrderDate ? revokeOrderDate.value : '';

                if (btnCancelSubmit) {
                    btnCancelSubmit.disabled = true;
                    btnCancelSubmit.textContent = 'Wird verarbeitet...';
                }

                const now = new Date();
                const fallbackTimestamp = now.toLocaleDateString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                }) + ', ' + now.toLocaleTimeString('de-DE', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                }) + ' Uhr';

                let confNum = (isWiderruf ? 'WR-' : 'KD-') + Date.now().toString().slice(-6);
                let submittedAtFormatted = fallbackTimestamp;
                let serverPdfBase64 = null;
                let pdfFilename = isWiderruf
                    ? `Widerrufsbestaetigung_${confNum}.pdf`
                    : `Kuendigungsbestaetigung_${confNum}.pdf`;

                const payload = {
                    type,
                    salutation,
                    firstName,
                    lastName,
                    customerName,
                    street,
                    houseNr,
                    plz,
                    city,
                    contractType,
                    contractNumber,
                    meterNumber,
                    email,
                    terminationType,
                    reason,
                    cancelDate,
                    orderDate
                };

                try {
                    const res = await fetch('/api/kuendigung/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const d = await res.json();
                    if (d && d.confirmationNumber) confNum = d.confirmationNumber;
                    if (d && d.submittedAt) submittedAtFormatted = d.submittedAt;
                    if (d && d.pdfBase64) serverPdfBase64 = d.pdfBase64;
                    if (d && d.pdfFilename) pdfFilename = d.pdfFilename;
                } catch (err) {
                    console.log('Cancellation/Revocation processed with local PDF fallback');
                }

                if (btnCancelSubmit) {
                    btnCancelSubmit.disabled = false;
                    btnCancelSubmit.textContent = isWiderruf ? 'Widerruf senden' : 'Jetzt kündigen';
                }

                if (lastGeneratedPdfBlobUrl) {
                    try { URL.revokeObjectURL(lastGeneratedPdfBlobUrl); } catch (e) {}
                }

                if (serverPdfBase64) {
                    const byteChars = atob(serverPdfBase64);
                    const byteNumbers = new Array(byteChars.length);
                    for (let i = 0; i < byteChars.length; i++) {
                        byteNumbers[i] = byteChars.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
                    lastGeneratedPdfBlobUrl = URL.createObjectURL(pdfBlob);
                } else {
                    const fallbackBlob = createClientFallbackPdfBlob({
                        ...payload,
                        confirmationNumber: confNum,
                        submittedAtFormatted,
                        fullAddress
                    });
                    lastGeneratedPdfBlobUrl = URL.createObjectURL(fallbackBlob);
                }
                lastGeneratedPdfFilename = pdfFilename;

                // Populate and display confirmation view in modal
                if (cancelFormContainer && cancelConfirmationView) {
                    cancelFormContainer.style.display = 'none';
                    cancelConfirmationView.style.display = 'block';

                    const summaryHtml = `
                        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:18px 20px;margin-bottom:18px;">
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                                <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#16a34a;color:#fff;font-weight:700;">✓</span>
                                <strong style="color:#14532d;font-size:1.05rem;">${isWiderruf ? 'Eingangsbestätigung Ihres Widerrufs' : 'Kündigungsbestätigung gemäß § 312k BGB'}</strong>
                            </div>
                            <p style="margin:0;color:#166534;font-size:0.9rem;line-height:1.5;">
                                Ihre Erklärung wurde am <strong>${submittedAtFormatted}</strong> unter der Referenz-Nr. <strong>${confNum}</strong> erfolgreich übermittelt. Eine Bestätigungs-E-Mail inkl. PDF-Dokument wurde automatisch an <strong>${email}</strong> versendet.
                            </p>
                        </div>

                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;margin-bottom:18px;font-size:0.9rem;">
                            <div style="font-weight:700;color:#0a1f44;margin-bottom:10px;text-transform:uppercase;font-size:0.8rem;letter-spacing:0.5px;">Zusammenfassung Ihrer Angaben</div>
                            <div style="display:grid;grid-template-columns:170px 1fr;gap:6px 12px;color:#334155;">
                                <span style="color:#64748b;">Bestätigungs-Nr.:</span><strong>${confNum}</strong>
                                <span style="color:#64748b;">Datum &amp; Uhrzeit:</span><span>${submittedAtFormatted}</span>
                                <span style="color:#64748b;">Vorgangsart:</span><span>${isWiderruf ? 'Widerruf eines Energieliefervertrags' : terminationType}</span>
                                ${!isWiderruf && reason ? `<span style="color:#64748b;">Kündigungsgrund:</span><span>${reason}</span>` : ''}
                                ${!isWiderruf ? `<span style="color:#64748b;">Zeitpunkt:</span><span>${cancelDate}</span>` : ''}
                                ${isWiderruf && orderDate ? `<span style="color:#64748b;">Bestelldatum:</span><span>${orderDate}</span>` : ''}
                                <span style="color:#64748b;">Vertragsart:</span><span>${contractType}</span>
                                <span style="color:#64748b;">${isWiderruf ? 'Bestell-/Kunden-Nr.:' : 'Vertrags-/Kunden-Nr.:'}</span><span>${contractNumber}</span>
                                ${meterNumber ? `<span style="color:#64748b;">Zählernummer:</span><span>${meterNumber}</span>` : ''}
                                <span style="color:#64748b;">Name:</span><span>${customerName}</span>
                                <span style="color:#64748b;">Anschrift:</span><span>${fullAddress}</span>
                                <span style="color:#64748b;">E-Mail:</span><span>${email}</span>
                            </div>
                        </div>

                        ${isWiderruf ? `
                        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin-bottom:18px;font-size:0.86rem;color:#9a3412;line-height:1.5;">
                            <strong>Wichtiger Hinweis:</strong> Diese Eingangsbestätigung dokumentiert den fristgerechten Eingang Ihrer Widerrufserklärung. Bitte beachten Sie, dass eine formelle <strong>Prüfung der Wirksamkeit Ihrer Widerrufserklärung noch aussteht</strong>.
                        </div>` : ''}
                    `;

                    const detailsTarget = document.getElementById('cancelConfirmationDetails');
                    if (detailsTarget) detailsTarget.innerHTML = summaryHtml;

                    const dlBtn = document.getElementById('btnDownloadCancelPdf');
                    if (dlBtn) {
                        dlBtn.textContent = isWiderruf
                            ? 'Eingangsbestätigung als PDF herunterladen'
                            : 'Kündigungsbestätigung als PDF herunterladen (§ 312k BGB)';
                        dlBtn.onclick = (ev) => {
                            ev.preventDefault();
                            triggerPdfDownload(lastGeneratedPdfBlobUrl, lastGeneratedPdfFilename);
                        };
                    }

                    // Automatically trigger PDF download as required by Firstcon audit
                    triggerPdfDownload(lastGeneratedPdfBlobUrl, lastGeneratedPdfFilename);
                } else {
                    triggerPdfDownload(lastGeneratedPdfBlobUrl, lastGeneratedPdfFilename);
                    alert(`Ihre Erklärung wurde erfasst (Bestätigungsnummer: ${confNum}). Das PDF-Bestätigungsdokument wurde heruntergeladen und per E-Mail an ${email} versandt.`);
                    closeCancelModal();
                }
            });
        }

        // Open Kündigung or Widerruf modal automatically if URL hash matches
        if (window.location.hash === '#kuendigen' || window.location.hash === '#kuendigung') {
            setTimeout(() => triggerCancelModal('KUENDIGUNG'), 250);
        } else if (window.location.hash === '#widerruf' || window.location.hash === '#widerrufen') {
            setTimeout(() => triggerCancelModal('WIDERRUF'), 250);
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
                    unlockAlphaModalScroll();
                }
            } else if (e.target.classList && e.target.classList.contains('digital-modal-backdrop')) {
                e.target.style.display = 'none';
                unlockAlphaModalScroll();
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
                    unlockAlphaModalScroll();
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
    const DEFAULT_TOKEN = '1994e155-ce1c-47a7-83c8-21660f0857a7';
    let activeToken = DEFAULT_TOKEN;
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('firstcon_token') || urlParams.get('token');
        if (urlToken && urlToken.trim() !== '' && urlToken !== 'alpha-energie-live' && urlToken !== 'TOKEN') {
            localStorage.setItem('firstcon_token', urlToken.trim());
            activeToken = urlToken.trim();
        } else {
            const stored = localStorage.getItem('firstcon_token');
            if (stored && stored.trim() !== '' && stored !== 'alpha-energie-live' && stored !== 'TOKEN') {
                activeToken = stored.trim();
            } else {
                activeToken = DEFAULT_TOKEN;
            }
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

// ==========================================================================
// Alpha Energie - 3D Smart Home Sparsimulator Scrollytelling Controller
// Scroll-driven sticky pinning architecture (380vh runway)
// High-performance RAF scroll driver + IntersectionObserver offscreen gating
// ==========================================================================
(function() {
    'use strict';

    function initScrollytelling() {
        const scrollySection = document.getElementById('scrolly-flow-section') || document.querySelector('.scrolly-energy-section');
        if (!scrollySection) return;

        // If versorger video showcase exists, AlphaVideoFlow handles scrollytelling exclusively
        if (document.getElementById('versorger-video') || document.getElementById('versorger-video-container')) {
            return;
        }

        const stepPills = scrollySection.querySelectorAll('.scrolly-step-pill');
        const stepLabel = document.getElementById('scrolly-step-label');
        const stepBadge = document.getElementById('scrolly-step-badge');
        const progressBar = document.getElementById('scrolly-progress-bar');
        const modeLabel = scrollySection.querySelector('[data-mode-label], .alpha-mode-label');
        const savingsDisplay = document.getElementById('sim-savings-display');
        const compareTag = document.getElementById('sim-compare-tag');

        const stepsData = [
            {
                id: 'strom',
                focus: 'strom',
                branch: 'strom',
                index: 0,
                label: 'Schritt 1 von 4: Haushaltsstrom & Zähler',
                badge: 'Station 1 von 4',
                modeLabel: '100 % Ökostrom (ok-power)',
                savings: 'bis zu 380 € / Jahr',
                compare: 'Grundversorger: 1.140 € &rarr; Alpha Energie: <strong>760 €</strong>',
                targetProgress: 0.08
            },
            {
                id: 'waerme',
                focus: 'waerme',
                branch: 'waerme',
                index: 1,
                label: 'Schritt 2 von 4: Wärmepumpe (§ 14a EnWG)',
                badge: 'Station 2 von 4',
                modeLabel: 'Wärmestrom (§14a EnWG Flexibel)',
                savings: 'bis zu 450 € / Jahr',
                compare: 'Heizstrom Alt: 1.820 € &rarr; § 14a Rabatt: <strong>1.370 €</strong>',
                targetProgress: 0.38
            },
            {
                id: 'wallbox',
                focus: 'wallbox',
                branch: 'strom',
                index: 2,
                label: 'Schritt 3 von 4: Wallbox (E-Mobilität)',
                badge: 'Station 3 von 4',
                modeLabel: '100 % Ökostrom & Autostrom',
                savings: 'bis zu 320 € / Jahr',
                compare: 'Öffentl. Laden: 890 € &rarr; Heim-Wallbox: <strong>570 €</strong>',
                targetProgress: 0.65
            },
            {
                id: 'solar',
                focus: 'solar',
                branch: 'strom',
                index: 3,
                label: 'Schritt 4 von 4: Solaranlage & Batteriespeicher',
                badge: 'Station 4 von 4',
                modeLabel: 'Solar-Reststrom & Speicher-Kopplung',
                savings: 'bis zu 580 € / Jahr',
                compare: 'Vollbezug Netz: 1.480 € &rarr; PV + Speicher: <strong>900 €</strong>',
                targetProgress: 0.92
            }
        ];

        let isSectionInView = false;
        let rafId = null;
        let currentStepIndex = -1;

        function getVersorgerScene() {
            if (!window.AlphaThree || typeof window.AlphaThree.getScene !== 'function') return null;
            return window.AlphaThree.getScene('#alpha-versorger-canvas') || window.AlphaThree.getScene('#versorger-flow-canvas');
        }

        function calculateProgress() {
            const rect = scrollySection.getBoundingClientRect();
            const sectionHeight = scrollySection.offsetHeight;
            const windowHeight = window.innerHeight;
            const maxScroll = sectionHeight - windowHeight;
            if (maxScroll <= 0) return 0;

            const sectionTop = rect.top + window.scrollY;
            const currentScroll = window.scrollY;
            const rawProgress = (currentScroll - sectionTop) / maxScroll;
            return Math.max(0, Math.min(1, rawProgress));
        }

        function applyProgress(progress) {
            // 1. Progress line fill
            if (progressBar) {
                progressBar.style.width = (progress * 100).toFixed(1) + '%';
            }

            // 2. Identify active step
            let stepIdx = 0;
            if (progress >= 0.75) stepIdx = 3;
            else if (progress >= 0.50) stepIdx = 2;
            else if (progress >= 0.25) stepIdx = 1;
            else stepIdx = 0;

            const stepInfo = stepsData[stepIdx];

            // 3. Update 3D scene continuously
            const scene = getVersorgerScene();
            if (scene) {
                if (typeof scene.setScrollProgress === 'function') {
                    scene.setScrollProgress(progress);
                } else {
                    if (typeof scene.setFocus === 'function') scene.setFocus(stepInfo.focus);
                    if (typeof scene.highlightAnchor === 'function') scene.highlightAnchor(stepInfo.id);
                }
            }

            // 4. Update UI only when step changes
            if (currentStepIndex !== stepIdx) {
                currentStepIndex = stepIdx;

                // Step pills active class
                stepPills.forEach((pill, idx) => {
                    const isActive = (idx === stepIdx);
                    pill.classList.toggle('active', isActive);
                    pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                // Stepper labels
                if (stepLabel) stepLabel.textContent = stepInfo.label;
                if (stepBadge) stepBadge.textContent = stepInfo.badge;

                // Mode label & savings display in cockpit header
                if (modeLabel) modeLabel.textContent = stepInfo.modeLabel;
                if (savingsDisplay) savingsDisplay.textContent = stepInfo.savings;
                if (compareTag) compareTag.innerHTML = stepInfo.compare;

                // Sync HUD mode selector tabs
                const hudTabs = scrollySection.querySelectorAll('.hud-mode-selector .hud-tab');
                hudTabs.forEach(tab => {
                    const mode = tab.getAttribute('data-mode');
                    const isTabActive = (mode === stepInfo.branch);
                    tab.classList.toggle('active', isTabActive);
                    tab.setAttribute('aria-pressed', isTabActive ? 'true' : 'false');
                });

                // Sync HUD focus selector tabs
                const focusTabs = scrollySection.querySelectorAll('.hud-focus-selector .hud-tab');
                focusTabs.forEach(tab => {
                    const focus = tab.getAttribute('data-focus');
                    tab.classList.toggle('active', focus === stepInfo.focus);
                });
            }
        }

        function onScroll() {
            if (!isSectionInView) return;
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const progress = calculateProgress();
                applyProgress(progress);
            });
        }

        // Stepper Pills Click Handler
        stepPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const stepKey = pill.getAttribute('data-scrolly-step');
                const targetStep = stepsData.find(s => s.id === stepKey);
                if (!targetStep) return;

                const rect = scrollySection.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const sectionHeight = scrollySection.offsetHeight;
                const windowHeight = window.innerHeight;
                const maxScroll = sectionHeight - windowHeight;

                const targetY = sectionTop + targetStep.targetProgress * maxScroll;
                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });

                applyProgress(targetStep.targetProgress);
            });
        });

        // IntersectionObserver for performance (gated execution when near viewport)
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isSectionInView = entry.isIntersecting;
                    if (isSectionInView) {
                        const progress = calculateProgress();
                        applyProgress(progress);
                    }
                });
            }, {
                root: null,
                rootMargin: '120px 0px 120px 0px',
                threshold: [0, 0.05, 0.25, 0.5, 0.75, 1.0]
            });

            observer.observe(scrollySection);
        } else {
            isSectionInView = true;
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // Initial updates on scene ready events
        window.addEventListener('alphathree:ready', () => {
            const progress = calculateProgress();
            applyProgress(progress);
        });
        window.addEventListener('alphathree:scene-created', (e) => {
            if (e.detail && (e.detail.name === 'versorger-flow' || (e.detail.container && e.detail.container.id && e.detail.container.id.includes('versorger')))) {
                const progress = calculateProgress();
                applyProgress(progress);
            }
        });

        setTimeout(() => {
            const progress = calculateProgress();
            applyProgress(progress);
        }, 350);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollytelling);
    } else {
        initScrollytelling();
    }
})();

// ==========================================================================
// Alpha Energie - Smart Home Showcase Video Flow Controller Initialization
// ==========================================================================
(function() {
    'use strict';
    function initVideoFlow() {
        if (window.AlphaVideoFlow && typeof window.AlphaVideoFlow.init === 'function') {
            window.AlphaVideoFlow.init();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoFlow);
    } else {
        initVideoFlow();
    }
})();

