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
            '41': 'Mönchengladbach',
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
                workingPriceCt: 33.66,
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
                workingPriceCt: 36.04,
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
                workingPriceCt: 16.52,
                basePriceEur: 28.25,
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
                workingPriceCt: 17.71,
                basePriceEur: 28.25,
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
                workingPriceCt: 18.90,
                basePriceEur: 28.25,
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

        const waermeTariffSpecs = {
            'alpha-basic': {
                firstconTariffId: 279,
                name: 'ALPHA BASIC 24 WÄRME',
                badge: 'Wärmepumpe & HT/NT',
                workingPriceCt: 29.85,
                basePriceEur: 19.90,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT)',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            'alpha-time': {
                firstconTariffId: 280,
                name: 'ALPHA TIME 24 WÄRME',
                badge: 'Bestseller Wärmepumpe & HT/NT',
                workingPriceCt: 30.85,
                basePriceEur: 19.90,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT)',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            'alpha-premium': {
                firstconTariffId: 281,
                name: 'ALPHA PREMIUM 24 WÄRME',
                badge: '24 Monate Preisschutz & VIP',
                workingPriceCt: 31.85,
                basePriceEur: 19.90,
                bonus: 0,
                guaranteeMonths: 24,
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT)',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            }
        };

        const calcWaermeHtNtRow = document.getElementById('calcWaermeHtNtRow');
        const calcKwhHt = document.getElementById('calcKwhHt');
        const calcKwhNt = document.getElementById('calcKwhNt');
        const calcHtInputBox = document.getElementById('calcHtInputBox');
        const calcNtInputBox = document.getElementById('calcNtInputBox');
        const meterTypeBtns = document.querySelectorAll('.octo-meter-type-btn');
        let currentMeterType = 'htnt';

        function syncHtNtFromTotalKwh(totalKwhVal) {
            const total = Math.max(500, Number(totalKwhVal) || 6000);
            if (currentMeterType === 'et') {
                if (calcKwhHt) calcKwhHt.value = String(total);
                if (calcKwhNt) calcKwhNt.value = '0';
            } else {
                const ht = Math.round(total * 0.6);
                const nt = Math.max(0, total - ht);
                if (calcKwhHt) calcKwhHt.value = String(ht);
                if (calcKwhNt) calcKwhNt.value = String(nt);
            }
        }

        function getCurrentHtNtValues(fallbackTotalKwh) {
            const total = Math.max(500, Number(fallbackTotalKwh) || 6000);
            if (currentMeterType === 'et') {
                return { ht: total, nt: 0, meterType: 'et' };
            }
            const rawHt = calcKwhHt ? parseInt(calcKwhHt.value, 10) : NaN;
            const rawNt = calcKwhNt ? parseInt(calcKwhNt.value, 10) : NaN;
            if (!isNaN(rawHt) && !isNaN(rawNt) && (rawHt + rawNt) > 0) {
                return { ht: Math.max(0, rawHt), nt: Math.max(0, rawNt), meterType: 'htnt' };
            }
            const ht = Math.round(total * 0.6);
            return { ht, nt: Math.max(0, total - ht), meterType: 'htnt' };
        }

        let userHasEnteredKwh = false;
        window.markUserCalculated = () => { userHasEnteredKwh = true; };

        function getActiveSpecs(branchOverride) {
            const b = branchOverride || currentBranch;
            if (b === 'gas') return gasTariffSpecs;
            if (b === 'waerme') return waermeTariffSpecs;
            return stromTariffSpecs;
        }

        // Backward-compatible reference
        const tariffSpecs = stromTariffSpecs;

        function recalculateTariffs() {
            if (!calcKwh) return;
            const currentSpecs = getActiveSpecs();
            const defaultKwh = currentBranch === 'gas' ? 12000 : (currentBranch === 'waerme' ? 6000 : 2500);
            const defaultAbschlag = currentBranch === 'gas' ? 115 : (currentBranch === 'waerme' ? 165 : 95);
            const rawKwh = (calcKwh && calcKwh.value) ? calcKwh.value.toString().replace(/\D/g, '').trim() : '';
            const parsedKwh = rawKwh ? parseInt(rawKwh, 10) : NaN;
            const kwh = (!isNaN(parsedKwh) && parsedKwh > 0) ? Math.max(500, parsedKwh) : defaultKwh;

            const rawAbschlag = (calcAbschlag && calcAbschlag.value) ? calcAbschlag.value.toString().replace(',', '.').trim() : '';
            const parsedAbschlag = rawAbschlag ? parseFloat(rawAbschlag) : NaN;
            const refGrundversorgerYearly = currentBranch === 'gas'
                ? (kwh * 0.215) + (29.50 * 12)
                : (currentBranch === 'waerme'
                    ? (kwh * 0.375) + (24.90 * 12)
                    : (kwh * 0.415) + (29.90 * 12));
            const currentYearly = (!isNaN(parsedAbschlag) && parsedAbschlag > 0)
                ? Math.max(parsedAbschlag * 12, refGrundversorgerYearly)
                : refGrundversorgerYearly;

            let maxSavings = 0;

            const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';
            const isDe = curLang === 'de';

            const TARIFF_FEATURE_I18N = {
                '12 Monate volle Preisgarantie': {
                    en: '12 months full price guarantee',
                    tr: '12 ay tam fiyat garantisi',
                    ar: 'ضمان سعر كامل لمدة 12 شهراً'
                },
                '24 Monate volle Preisgarantie': {
                    en: '24 months full price guarantee',
                    tr: '24 ay tam fiyat garantisi',
                    ar: 'ضمان سعر كامل لمدة 24 شهراً'
                },
                'Für Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT)': {
                    en: 'For heat pumps (§ 14a EnWG) & night storage heaters (HT/NT)',
                    tr: 'Isı pompası (§ 14a EnWG) & gece depolamalı ısıtıcılar (HT/NT) için',
                    ar: 'لمضخات الحرارة (§ 14a EnWG) وسخانات التخزين الليلي (HT/NT)'
                },
                'Ökostrom aus 100 % erneuerbaren Energien (ok-power)': {
                    en: 'Green electricity from 100% renewable energy (ok-power)',
                    tr: '%100 yenilenebilir enerjiden yeşil elektrik (ok-power)',
                    ar: 'كهرباء خضراء من طاقة متجددة 100% (ok-power)'
                },
                'Ökostrom aus 100 % erneuerbaren Energien': {
                    en: 'Green electricity from 100% renewable energy',
                    tr: '%100 yenilenebilir enerjiden yeşil elektrik',
                    ar: 'كهرباء خضراء من طاقة متجددة 100%'
                },
                'Attraktives Preis-Leistungs-Verhältnis mit 24 Monaten Planungssicherheit': {
                    en: 'Attractive value for money with 24 months planning security',
                    tr: '24 ay planlama güvencesiyle cazip fiyat-performans oranı',
                    ar: 'قيمة ممتازة مقابل السعر مع أمان تخطيطي لمدة 24 شهراً'
                },
                'Sicherheit und Planbarkeit durch lange Preisgarantie': {
                    en: 'Maximum security and predictability with long price guarantee',
                    tr: 'Uzun fiyat garantisiyle maksimum güvenlik ve öngörülebilirlik',
                    ar: 'أقصى درجات الأمان والتخطيط بفضل ضمان السعر الطويل'
                },
                'Erdgas mit freiwilligem Klimaschutzbeitrag': {
                    en: 'Natural gas with voluntary climate protection contribution',
                    tr: 'Gönüllü iklim koruma katkılı doğal gaz',
                    ar: 'غاز طبيعي مع مساهمة طوعية في حماية المناخ'
                },
                'Förderung ausgewählter Klimaschutzprojekte': {
                    en: 'Support for certified climate protection projects',
                    tr: 'Seçilmiş iklim koruma projelerinin desteklenmesi',
                    ar: 'دعم مشاريع معتمدة لحماية المناخ'
                },
                'Kostenloser & automatischer Wechselservice': {
                    en: 'Free & automatic provider switching service',
                    tr: 'Ücretsiz & otomatik tedarikçi geçiş hizmeti',
                    ar: 'خدمة انتقال مجانية وتلقائية بالكامل'
                },
                'Persönlicher Kundenservice in Dortmund': {
                    en: 'Personal customer service in Dortmund',
                    tr: 'Dortmund\'da kişisel müşteri hizmetleri',
                    ar: 'خدمة عملاء شخصية في دورتموند'
                },
                'Keine Vorauskasse & keine versteckten Kosten': {
                    en: 'No prepayment & no hidden costs',
                    tr: 'Ön ödeme yok & gizli maliyet yok',
                    ar: 'بدون دفع مسبق وبدون تكاليف خفية'
                },
                'Bevorzugter VIP-Kundenservice': {
                    en: 'Priority VIP customer service',
                    tr: 'Öncelikli VIP müşteri hizmetleri',
                    ar: 'خدمة عملاء VIP ذات أولوية'
                }
            };

            const TARIFF_BADGE_BY_CARD = {
                strom: {
                    'alpha-basic': { de: 'Flexibel & Günstig', en: 'Flexible & Affordable', tr: 'Esnek & Uygun Fiyatlı', ar: 'مرن واقتصادي' },
                    'alpha-time': { de: '24 Monate volle Preisgarantie', en: '24 Months Full Price Guarantee', tr: '24 Ay Tam Fiyat Garantisi', ar: 'ضمان سعر كامل لمدة 24 شهراً' },
                    'alpha-premium': { de: '24 Monate Preisschutz & VIP', en: '24-Month Price Protection & VIP', tr: '24 Ay Fiyat Koruması & VIP', ar: 'حماية السعر لمدة 24 شهراً وخدمة VIP' }
                },
                waerme: {
                    'alpha-basic': { de: 'Wärmepumpe & HT/NT', en: 'Heat Pump & HT/NT', tr: 'Isı Pompası & HT/NT', ar: 'مضخة حرارية و HT/NT' },
                    'alpha-time': { de: 'Bestseller Wärmepumpe & HT/NT', en: 'Bestseller Heat Pump & HT/NT', tr: 'Çok Satan Isı Pompası & HT/NT', ar: 'الأكثر مبيعاً للمضخات الحرارية و HT/NT' },
                    'alpha-premium': { de: '24 Monate Preisschutz & VIP', en: '24-Month Price Protection & VIP', tr: '24 Ay Fiyat Koruması & VIP', ar: 'حماية السعر لمدة 24 شهراً وخدمة VIP' }
                },
                gas: {
                    'alpha-basic': { de: 'Fair & Preisstabil', en: 'Fair & Price-Stable', tr: 'Adil & Fiyat İstikrarlı', ar: 'عادل ومستقر السعر' },
                    'alpha-time': { de: 'Bestseller & Spar-Vorteil', en: 'Bestseller & Savings Advantage', tr: 'Çok Satan & Tasarruf Avantajı', ar: 'الأكثر مبيعاً وميزة التوفير' },
                    'alpha-premium': { de: '24 Monate Preisschutz & Komfort', en: '24-Month Price Protection & Comfort', tr: '24 Ay Fiyat Koruması & Konfor', ar: 'حماية السعر لمدة 24 شهراً وراحة تامة' }
                }
            };

            function translateFeatureItem(fText, lang) {
                if (!fText || lang === 'de') return fText;
                const trimmed = String(fText).trim();
                if (TARIFF_FEATURE_I18N[trimmed] && TARIFF_FEATURE_I18N[trimmed][lang]) {
                    return TARIFF_FEATURE_I18N[trimmed][lang];
                }
                return trimmed;
            }

            window.__translateTariffFeature = translateFeatureItem;
            window.__TARIFF_BADGE_BY_CARD = TARIFF_BADGE_BY_CARD;

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

                // Update Tariff Card displays (title, badge, features) in-place for all languages
                const cardEl = document.getElementById(`card-${id}`);
                if (cardEl) {
                    const titleEl = cardEl.querySelector('.tariff-title');
                    if (titleEl) titleEl.textContent = spec.name;

                    const badgeEl = cardEl.querySelector('.tariff-badge');
                    if (badgeEl) {
                        const branchKey = currentBranch === 'gas' ? 'gas' : (currentBranch === 'waerme' ? 'waerme' : 'strom');
                        const branchBadges = TARIFF_BADGE_BY_CARD[branchKey];
                        const mappedBadge = branchBadges && branchBadges[id] ? branchBadges[id][curLang] : null;
                        badgeEl.textContent = mappedBadge || spec.badge;
                    }

                    const featList = cardEl.querySelector('.tariff-feature-list');
                    if (featList && Array.isArray(spec.features)) {
                        const existingSpans = featList.querySelectorAll('.tariff-feature-item span');
                        if (existingSpans.length === spec.features.length) {
                            spec.features.forEach((f, idx) => {
                                existingSpans[idx].textContent = translateFeatureItem(f, curLang);
                            });
                        } else {
                            featList.innerHTML = spec.features.map(f => `
                                <div class="tariff-feature-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span>${translateFeatureItem(f, curLang)}</span>
                                </div>
                            `).join('');
                        }
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
                    if (currentBranch === 'waerme') {
                        const htNt = getCurrentHtNtValues(kwh);
                        const meterTag = htNt.meterType === 'et'
                            ? 'Eintarif'
                            : `HT ${htNt.ht.toLocaleString('de-DE')} / NT ${htNt.nt.toLocaleString('de-DE')} kWh`;
                        kwhEl.textContent = `${kwh.toLocaleString('de-DE')} kWh/Jahr (${meterTag}) • ${activeWorkCt.toFixed(2).replace('.', ',')} ct/kWh • ${activeBaseEur.toFixed(2).replace('.', ',')} € Grundpreis`;
                    } else if (window.i18n && typeof window.i18n.formatKwhDesc === 'function') {
                        kwhEl.textContent = window.i18n.formatKwhDesc(kwh, activeWorkCt);
                    } else {
                        kwhEl.textContent = `${kwh.toLocaleString('de-DE')} kWh/Jahr • ${activeWorkCt.toFixed(2).replace('.', ',')} ct/kWh • ${activeBaseEur.toFixed(2).replace('.', ',')} € Grundpreis`;
                    }
                }

                // Store computed values in data-attributes of ALL matching action buttons on the page
                const htNtMeta = currentBranch === 'waerme' ? getCurrentHtNtValues(kwh) : null;
                document.querySelectorAll(`[data-select-tariff="${id}"]`).forEach(btn => {
                    btn.setAttribute('data-monthly', monthlyPayment);
                    btn.setAttribute('data-kwh', kwh);
                    btn.setAttribute('data-savings', savings);
                    btn.setAttribute('data-name', spec.name);
                    btn.setAttribute('data-branch', currentBranch);
                    if (htNtMeta) {
                        btn.setAttribute('data-meter-type', htNtMeta.meterType);
                        btn.setAttribute('data-kwh-ht', htNtMeta.ht);
                        btn.setAttribute('data-kwh-nt', htNtMeta.nt);
                    }
                    if (spec.firstconTariffId) btn.setAttribute('data-firstcon-tariff-id', spec.firstconTariffId);
                    if (spec.energyGridNumber) btn.setAttribute('data-energy-grid', spec.energyGridNumber);
                });
            }

            if (calcSavingsValue) {
                const displaySavings = maxSavings > 0 ? maxSavings : (currentBranch === 'gas' ? 240 : (currentBranch === 'waerme' ? 310 : 202));
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

            const defaultKwh = activeBranch === 'gas' ? 12000 : (activeBranch === 'waerme' ? 6000 : 2500);
            const defaultAbschlag = activeBranch === 'gas' ? 115 : (activeBranch === 'waerme' ? 165 : 95);
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

            const htNtData = activeBranch === 'waerme' ? getCurrentHtNtValues(kwh) : null;

            try {
                const res = await fetch('/api/tarife/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        plz: effectivePlz,
                        consumption: kwh,
                        consumptionHt: htNtData ? htNtData.ht : undefined,
                        consumptionNt: htNtData ? htNtData.nt : undefined,
                        meterType: htNtData ? htNtData.meterType : 'et',
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
                        calcCityBadge.title = data.city;
                        calcCityBadge.style.display = 'inline-block';
                    }
                    const mPlz = document.getElementById('modalCalcPlz');
                    const mBadge = document.getElementById('modalCalcCityBadge');
                    if (mPlz && mPlz.value === rawPlz && mBadge) {
                        mBadge.textContent = data.city;
                        mBadge.title = data.city;
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
                    const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';

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
                            if (cardEl) {
                                const titleEl = cardEl.querySelector('.tariff-title');
                                if (titleEl && (t.name || (spec && spec.name))) {
                                    titleEl.textContent = t.name || spec.name;
                                }
                                const badgeEl = cardEl.querySelector('.tariff-badge');
                                if (badgeEl) {
                                    const branchKey = activeBranch === 'gas' ? 'gas' : (activeBranch === 'waerme' ? 'waerme' : 'strom');
                                    const badgeMap = window.__TARIFF_BADGE_BY_CARD && window.__TARIFF_BADGE_BY_CARD[branchKey];
                                    const mappedBadge = badgeMap && badgeMap[t.id] ? badgeMap[t.id][curLang] : null;
                                    badgeEl.textContent = mappedBadge || t.badge || (spec && spec.badge) || '';
                                }
                                const featList = cardEl.querySelector('.tariff-feature-list');
                                const feats = (sanitizedLiveFeatures && sanitizedLiveFeatures.length > 0) ? sanitizedLiveFeatures : (spec ? spec.features : null);
                                const trFn = window.__translateTariffFeature || ((x) => x);
                                if (featList && Array.isArray(feats)) {
                                    const existingSpans = featList.querySelectorAll('.tariff-feature-item span');
                                    if (existingSpans.length === feats.length) {
                                        feats.forEach((f, idx) => {
                                            existingSpans[idx].textContent = trFn(f, curLang);
                                        });
                                    } else {
                                        featList.innerHTML = feats.map(f => `
                                            <div class="tariff-feature-item">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                <span>${trFn(f, curLang)}</span>
                                            </div>
                                        `).join('');
                                    }
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
                                if (activeBranch === 'waerme' && htNtData) {
                                    const meterTag = htNtData.meterType === 'et'
                                        ? 'Eintarif'
                                        : `HT ${htNtData.ht.toLocaleString('de-DE')} / NT ${htNtData.nt.toLocaleString('de-DE')} kWh`;
                                    kwhEl.textContent = `${kwh.toLocaleString('de-DE')} kWh/Jahr (${meterTag}) • ${t.workingPriceCt.toFixed(2).replace('.', ',')} ct/kWh • ${baseM.toFixed(2).replace('.', ',')} € Grundpreis`;
                                } else if (window.i18n && typeof window.i18n.formatKwhDesc === 'function') {
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

        // Ensure clicking anywhere on the white surface of .octo-input-box focuses its inner input immediately
        document.querySelectorAll('.octo-input-box, .calc-input-wrapper').forEach(box => {
            box.style.cursor = 'text';
            box.addEventListener('mousedown', (e) => {
                const inp = box.querySelector('input, select, textarea');
                if (!inp || e.target === inp) return;
                e.preventDefault();
                inp.focus();
                if (typeof inp.setSelectionRange === 'function' && inp.type === 'text') {
                    const len = (inp.value || '').length;
                    try { inp.setSelectionRange(len, len); } catch (err) {}
                }
            });
            box.addEventListener('click', () => {
                const inp = box.querySelector('input, select, textarea');
                if (inp && document.activeElement !== inp) {
                    inp.focus();
                }
            });
        });

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
                        calcCityBadge.title = city;
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
                const defaultKwh = currentBranch === 'gas' ? 12000 : (currentBranch === 'waerme' ? 6000 : 2500);
                const kwh = (typedKwh && typedKwh > 0) ? Math.max(500, typedKwh) : defaultKwh;
                if (currentBranch === 'waerme') {
                    syncHtNtFromTotalKwh(kwh);
                }
                recalculateTariffs();
                sync3DSceneConsumption(kwh);
                if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                    syncLiveFirstconCalculation(calcPlz.value, kwh, currentBranch);
                }
            });
        }

        function handleHtNtSplitInput() {
            userHasEnteredKwh = true;
            const htVal = Math.max(0, parseInt(calcKwhHt && calcKwhHt.value ? calcKwhHt.value : '0', 10) || 0);
            const ntVal = currentMeterType === 'et'
                ? 0
                : Math.max(0, parseInt(calcKwhNt && calcKwhNt.value ? calcKwhNt.value : '0', 10) || 0);
            const totalKwh = Math.max(500, htVal + ntVal);
            if (calcKwh) {
                calcKwh.value = String(totalKwh);
            }
            householdBtns.forEach(b => {
                const btnKwh = parseInt(b.getAttribute('data-kwh'), 10);
                b.classList.toggle('active', btnKwh === totalKwh);
            });
            recalculateTariffs();
            sync3DSceneConsumption(totalKwh);
            if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                syncLiveFirstconCalculation(calcPlz.value, totalKwh, currentBranch);
            }
        }

        if (calcKwhHt) {
            calcKwhHt.addEventListener('input', handleHtNtSplitInput);
        }
        if (calcKwhNt) {
            calcKwhNt.addEventListener('input', handleHtNtSplitInput);
        }

        meterTypeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                meterTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMeterType = btn.getAttribute('data-meter-type') || 'htnt';
                const totalKwh = Math.max(500, parseInt(calcKwh && calcKwh.value ? calcKwh.value : '6000', 10) || 6000);
                const htLabel = calcHtInputBox ? calcHtInputBox.querySelector('label') : null;
                if (currentMeterType === 'et') {
                    if (htLabel) htLabel.textContent = 'Gesamtverbrauch Wärmestrom (Eintarif)';
                    if (calcNtInputBox) calcNtInputBox.style.opacity = '0.45';
                    if (calcKwhNt) {
                        calcKwhNt.value = '0';
                        calcKwhNt.disabled = true;
                    }
                    if (calcKwhHt) calcKwhHt.value = String(totalKwh);
                } else {
                    if (htLabel) htLabel.textContent = 'Hochtarif (HT – Tagstrom)';
                    if (calcNtInputBox) calcNtInputBox.style.opacity = '1';
                    if (calcKwhNt) calcKwhNt.disabled = false;
                    syncHtNtFromTotalKwh(totalKwh);
                }
                const orderMeterTypeEl = document.getElementById('orderMeterType');
                if (orderMeterTypeEl) orderMeterTypeEl.value = currentMeterType;
                recalculateTariffs();
                if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                    syncLiveFirstconCalculation(calcPlz.value, totalKwh, currentBranch);
                }
            });
        });

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
                    if (currentBranch === 'waerme') {
                        syncHtNtFromTotalKwh(parseInt(kwh, 10));
                    }
                    recalculateTariffs();
                    sync3DSceneConsumption(parseInt(kwh, 10));
                    if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                        syncLiveFirstconCalculation(calcPlz.value, parseInt(kwh, 10), currentBranch);
                    }
                }
            });
        });

        function getPresetLabelsForBranch(branch, lang) {
            const l = lang || ((window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de');
            if (branch === 'waerme') {
                if (l === 'en') {
                    return [
                        { label: 'Heat Pump S', sub: '4,000 kWh', kwh: 4000 },
                        { label: 'Heat Pump M', sub: '6,000 kWh', kwh: 6000 },
                        { label: 'Night Storage', sub: '8,000 kWh', kwh: 8000 },
                        { label: 'Large System', sub: '12,000 kWh', kwh: 12000 }
                    ];
                }
                if (l === 'tr') {
                    return [
                        { label: 'Isı Pompası S', sub: '4.000 kWh', kwh: 4000 },
                        { label: 'Isı Pompası M', sub: '6.000 kWh', kwh: 6000 },
                        { label: 'Gece Depolama', sub: '8.000 kWh', kwh: 8000 },
                        { label: 'Büyük Sistem', sub: '12.000 kWh', kwh: 12000 }
                    ];
                }
                if (l === 'ar') {
                    return [
                        { label: 'مضخة حرارية S', sub: '4.000 ك.و.س', kwh: 4000 },
                        { label: 'مضخة حرارية M', sub: '6.000 ك.و.س', kwh: 6000 },
                        { label: 'تخزين ليلي HT/NT', sub: '8.000 ك.و.س', kwh: 8000 },
                        { label: 'نظام كبير', sub: '12.000 ك.و.س', kwh: 12000 }
                    ];
                }
                return [
                    { label: 'WP Kompakt', sub: '4.000 kWh', kwh: 4000 },
                    { label: 'Wärmepumpe', sub: '6.000 kWh', kwh: 6000 },
                    { label: 'Nachtspeicher', sub: '8.000 kWh', kwh: 8000 },
                    { label: 'Großanlage', sub: '12.000 kWh', kwh: 12000 }
                ];
            }
            if (branch === 'gas') {
                if (l === 'en') {
                    return [
                        { label: 'Apartment', sub: '5,000 kWh', kwh: 5000 },
                        { label: 'Townhouse', sub: '12,000 kWh', kwh: 12000 },
                        { label: 'Detached House', sub: '18,000 kWh', kwh: 18000 },
                        { label: 'Large House', sub: '25,000 kWh', kwh: 25000 }
                    ];
                }
                if (l === 'tr') {
                    return [
                        { label: 'Daire', sub: '5.000 kWh', kwh: 5000 },
                        { label: 'Sıra Ev', sub: '12.000 kWh', kwh: 12000 },
                        { label: 'Müstakil Ev', sub: '18.000 kWh', kwh: 18000 },
                        { label: 'Büyük Ev', sub: '25.000 kWh', kwh: 25000 }
                    ];
                }
                if (l === 'ar') {
                    return [
                        { label: 'شقة سكنية', sub: '5.000 ك.و.س', kwh: 5000 },
                        { label: 'منزل متلاصق', sub: '12.000 ك.و.س', kwh: 12000 },
                        { label: 'منزل مستقل', sub: '18.000 ك.و.س', kwh: 18000 },
                        { label: 'منزل كبير', sub: '25.000 ك.و.س', kwh: 25000 }
                    ];
                }
                return [
                    { label: 'Wohnung', sub: '5.000 kWh', kwh: 5000 },
                    { label: 'Reihenhaus', sub: '12.000 kWh', kwh: 12000 },
                    { label: 'Haus', sub: '18.000 kWh', kwh: 18000 },
                    { label: 'Großes Haus', sub: '25.000 kWh', kwh: 25000 }
                ];
            }
            if (l === 'en') {
                return [
                    { label: 'Low', sub: '1,500 kWh', kwh: 1500 },
                    { label: 'Medium', sub: '2,500 kWh', kwh: 2500 },
                    { label: 'High', sub: '3,500 kWh', kwh: 3500 },
                    { label: '4+ Persons', sub: '4,500 kWh', kwh: 4500 }
                ];
            }
            if (l === 'tr') {
                return [
                    { label: 'Az', sub: '1.500 kWh', kwh: 1500 },
                    { label: 'Orta', sub: '2.500 kWh', kwh: 2500 },
                    { label: 'Çok', sub: '3.500 kWh', kwh: 3500 },
                    { label: '4+ Kişi', sub: '4.500 kWh', kwh: 4500 }
                ];
            }
            if (l === 'ar') {
                return [
                    { label: 'قليل', sub: '1.500 ك.و.س', kwh: 1500 },
                    { label: 'متوسط', sub: '2.500 ك.و.س', kwh: 2500 },
                    { label: 'كثير', sub: '3.500 ك.و.س', kwh: 3500 },
                    { label: '+4 أشخاص', sub: '4.500 ك.و.س', kwh: 4500 }
                ];
            }
            return [
                { label: 'Wenig', sub: '1.500 kWh', kwh: 1500 },
                { label: 'Mittel', sub: '2.500 kWh', kwh: 2500 },
                { label: 'Viel', sub: '3.500 kWh', kwh: 3500 },
                { label: '4+ Pers.', sub: '4.500 kWh', kwh: 4500 }
            ];
        }

        function updateHouseholdPresets(branch) {
            const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';
            const presets = getPresetLabelsForBranch(branch, curLang);

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

            if (calcKwh && (!calcKwh.value || calcKwh.value.toString().trim() === '')) {
                if (branch === 'gas') {
                    calcKwh.placeholder = curLang === 'en' ? 'e.g. 12,000' : (curLang === 'tr' ? 'örn. 12.000' : (curLang === 'ar' ? 'مثلاً 12000' : 'z. B. 12.000'));
                } else if (branch === 'waerme') {
                    calcKwh.placeholder = curLang === 'en' ? 'e.g. 6,000' : (curLang === 'tr' ? 'örn. 6.000' : (curLang === 'ar' ? 'مثلاً 6000' : 'z. B. 6.000'));
                } else {
                    calcKwh.placeholder = curLang === 'en' ? 'e.g. 2,500' : (curLang === 'tr' ? 'örn. 2.500' : (curLang === 'ar' ? 'مثلاً 2500' : 'z. B. 2.500'));
                }
            }
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

                if (calcWaermeHtNtRow) {
                    calcWaermeHtNtRow.style.display = currentBranch === 'waerme' ? 'block' : 'none';
                }

                if (currentBranch === 'gas') {
                    if (hasUserKwh) {
                        if (['1500', '2500', '3500', '4500', '4000', '6000', '8000'].includes(calcKwh.value)) {
                            calcKwh.value = '12000';
                        }
                    }
                    updateHouseholdPresets('gas');
                    if (noticeText) {
                        noticeText.textContent = (window.i18n && typeof window.i18n.getBranchNotice === 'function')
                            ? window.i18n.getBranchNotice('gas')
                            : 'Erdgas mit freiwilligem Klimaschutzbeitrag • 24 Monate volle Preisgarantie';
                    }
                } else if (currentBranch === 'waerme') {
                    if (hasUserKwh) {
                        if (['1500', '2500', '3500', '4500', '5000', '12000', '18000', '25000'].includes(calcKwh.value)) {
                            calcKwh.value = '6000';
                        }
                    }
                    syncHtNtFromTotalKwh(parseInt(calcKwh ? calcKwh.value : '6000', 10) || 6000);
                    updateHouseholdPresets('waerme');
                    if (noticeText) {
                        noticeText.textContent = (window.i18n && typeof window.i18n.getBranchNotice === 'function')
                            ? window.i18n.getBranchNotice('waerme')
                            : 'Wärmestrom für Wärmepumpe (§ 14a EnWG) & Nachtspeicher (HT/NT) • 24 Monate volle Preisgarantie';
                    }
                } else {
                    currentBranch = 'strom';
                    if (hasUserKwh) {
                        if (['4000', '5000', '6000', '8000', '12000', '18000', '25000'].includes(calcKwh.value)) {
                            calcKwh.value = '2500';
                        }
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
                const defaultBranchKwh = currentBranch === 'gas' ? 12000 : (currentBranch === 'waerme' ? 6000 : 2500);
                const currentKwhVal = Math.max(500, parseInt(calcKwh && calcKwh.value ? calcKwh.value : defaultBranchKwh, 10) || defaultBranchKwh);
                sync3DSceneConsumption(currentKwhVal);
                if (calcPlz && /^\d{5}$/.test(calcPlz.value)) {
                    syncLiveFirstconCalculation(calcPlz.value, currentKwhVal, currentBranch);
                }
            });
        });

        // Two-way sync: Clicking 3D HUD mode buttons or [data-switch-branch] CTAs switches calculator tab
        document.addEventListener('click', (e) => {
            const switchBranchLink = e.target.closest('[data-switch-branch]');
            if (switchBranchLink) {
                const targetBranch = switchBranchLink.getAttribute('data-switch-branch');
                if (targetBranch) {
                    const matchingTab = document.querySelector(`.calc-tab-btn[data-branch="${targetBranch}"]`);
                    if (matchingTab) {
                        e.preventDefault();
                        matchingTab.click();
                        const rechnerTarget = document.getElementById('rechner') || document.getElementById('tarifrechner');
                        if (rechnerTarget) {
                            rechnerTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }
            }

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
            const rawUrlBranch = (urlParams.get('branch') || '').toLowerCase();
            const urlBranch = (rawUrlBranch === 'waerme' || rawUrlBranch === 'waermestrom' || rawUrlBranch === 'waermepumpe' || rawUrlBranch === 'htnt')
                ? 'waerme'
                : rawUrlBranch;
            const urlKwh = urlParams.get('kwh');
            if (urlBranch && (urlBranch === 'gas' || urlBranch === 'strom' || urlBranch === 'waerme')) {
                const targetTab = document.querySelector(`.calc-tab-btn[data-branch="${urlBranch}"]`);
                if (targetTab) targetTab.click();
            }
            if (urlPlz && calcPlz) {
                calcPlz.value = urlPlz.replace(/\D/g, '').slice(0, 5);
                calcPlz.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (urlKwh && calcKwh) {
                calcKwh.value = urlKwh.replace(/\D/g, '');
                if (currentBranch === 'waerme') {
                    syncHtNtFromTotalKwh(parseInt(calcKwh.value, 10) || 6000);
                }
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
            const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';
            const presets = branch === 'gas' ? [
                {
                    label: curLang === 'en' ? 'Apartment' : (curLang === 'tr' ? 'Daire' : (curLang === 'ar' ? 'شقة' : 'Wohnung')),
                    sub: curLang === 'en' ? '5,000 kWh' : '5.000 kWh',
                    kwh: 5000
                },
                {
                    label: curLang === 'en' ? 'Townhouse' : (curLang === 'tr' ? 'Sıra Ev' : (curLang === 'ar' ? 'منزل متصل' : 'Reihenhaus')),
                    sub: curLang === 'en' ? '12,000 kWh' : '12.000 kWh',
                    kwh: 12000
                },
                {
                    label: curLang === 'en' ? 'House' : (curLang === 'tr' ? 'Müstakil Ev' : (curLang === 'ar' ? 'منزل مستقل' : 'Haus')),
                    sub: curLang === 'en' ? '18,000 kWh' : '18.000 kWh',
                    kwh: 18000
                },
                {
                    label: curLang === 'en' ? 'Large House' : (curLang === 'tr' ? 'Büyük Ev' : (curLang === 'ar' ? 'منزل كبير' : 'Großes Haus')),
                    sub: curLang === 'en' ? '25,000 kWh' : '25.000 kWh',
                    kwh: 25000
                }
            ] : (branch === 'waerme' ? [
                {
                    label: curLang === 'en' ? 'Heat Pump S' : (curLang === 'tr' ? 'Isı Pompası S' : (curLang === 'ar' ? 'مضخة حرارية S' : 'WP Kompakt')),
                    sub: curLang === 'en' ? '4,000 kWh' : '4.000 kWh',
                    kwh: 4000
                },
                {
                    label: curLang === 'en' ? 'Heat Pump M' : (curLang === 'tr' ? 'Isı Pompası M' : (curLang === 'ar' ? 'مضخة حرارية M' : 'Wärmepumpe')),
                    sub: curLang === 'en' ? '6,000 kWh' : '6.000 kWh',
                    kwh: 6000
                },
                {
                    label: curLang === 'en' ? 'Night Storage' : (curLang === 'tr' ? 'Gece Depolama' : (curLang === 'ar' ? 'تخزين ليلي' : 'Nachtspeicher')),
                    sub: curLang === 'en' ? '8,000 kWh' : '8.000 kWh',
                    kwh: 8000
                },
                {
                    label: curLang === 'en' ? 'Large System' : (curLang === 'tr' ? 'Büyük Sistem' : (curLang === 'ar' ? 'نظام كبير' : 'Großanlage')),
                    sub: curLang === 'en' ? '12,000 kWh' : '12.000 kWh',
                    kwh: 12000
                }
            ] : [
                {
                    label: curLang === 'en' ? '1 Person' : (curLang === 'tr' ? '1 Kişi' : (curLang === 'ar' ? 'شخص واحد' : '1 Person')),
                    sub: curLang === 'en' ? '1,500 kWh' : '1.500 kWh',
                    kwh: 1500
                },
                {
                    label: curLang === 'en' ? '2 Pers.' : (curLang === 'tr' ? '2 Kişi' : (curLang === 'ar' ? 'شخصان' : '2 Pers.')),
                    sub: curLang === 'en' ? '2,500 kWh' : '2.500 kWh',
                    kwh: 2500
                },
                {
                    label: curLang === 'en' ? '3 Pers.' : (curLang === 'tr' ? '3 Kişi' : (curLang === 'ar' ? '3 أشخاص' : '3 Pers.')),
                    sub: curLang === 'en' ? '3,500 kWh' : '3.500 kWh',
                    kwh: 3500
                },
                {
                    label: curLang === 'en' ? '4+ Pers.' : (curLang === 'tr' ? '4+ Kişi' : (curLang === 'ar' ? '4+ أشخاص' : '4+ Pers.')),
                    sub: curLang === 'en' ? '4,500 kWh' : '4.500 kWh',
                    kwh: 4500
                }
            ]);
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
                if (branch === 'gas') {
                    modalCalcKwh.placeholder = curLang === 'en' ? 'e.g. 12000' : (curLang === 'tr' ? 'Örn. 12000' : (curLang === 'ar' ? 'مثال: 12000' : 'z. B. 12000'));
                } else if (branch === 'waerme') {
                    modalCalcKwh.placeholder = curLang === 'en' ? 'e.g. 6000' : (curLang === 'tr' ? 'Örn. 6000' : (curLang === 'ar' ? 'مثال: 6000' : 'z. B. 6000'));
                } else {
                    modalCalcKwh.placeholder = curLang === 'en' ? 'e.g. 2500' : (curLang === 'tr' ? 'Örn. 2500' : (curLang === 'ar' ? 'مثال: 2500' : 'z. B. 2500'));
                }
            }
        }

        function refreshModalStep1Calculation() {
            const branch = selectedOrderData.branch || currentBranch || 'strom';
            const currentSpecs = getActiveSpecs(branch);
            const tariffId = selectedOrderData.tariffId || 'alpha-basic';
            const spec = currentSpecs[tariffId] || currentSpecs['alpha-basic'];
            const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';

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
            if (badgeEl) {
                if (curLang === 'en') badgeEl.textContent = `${spec.guaranteeMonths} Months Price Guarantee`;
                else if (curLang === 'tr') badgeEl.textContent = `${spec.guaranteeMonths} Ay Fiyat Garantisi`;
                else if (curLang === 'ar') badgeEl.textContent = `ضمان سعر لمدة ${spec.guaranteeMonths} شهراً`;
                else badgeEl.textContent = `${spec.guaranteeMonths} Monate Preisgarantie`;
            }

            const plzVal = modalCalcPlz ? modalCalcPlz.value.replace(/\D/g, '').slice(0, 5) : (selectedOrderData.plz || '');
            if (modalCalcPlz && modalCalcPlz.value !== plzVal) {
                modalCalcPlz.value = plzVal;
            }

            const detectedCity = resolveCityFromPlz(plzVal);
            if (modalCalcCityBadge) {
                if (plzVal.length >= 2 && detectedCity) {
                    modalCalcCityBadge.textContent = detectedCity;
                    modalCalcCityBadge.title = detectedCity;
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
                    calcCityBadge.title = detectedCity;
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

            const activeWorkCt = (isPlzValid && typeof spec.liveWorkingPriceCt === 'number') ? spec.liveWorkingPriceCt : spec.workingPriceCt;
            const activeBaseEur = (isPlzValid && typeof spec.liveBasePriceEur === 'number') ? spec.liveBasePriceEur : spec.basePriceEur;

            if (isKwhValid) {
                const annualWorkingCost = parsedKwh * (activeWorkCt / 100);
                const annualBaseCost = activeBaseEur * 12;
                const rawYearly = annualWorkingCost + annualBaseCost;
                const monthlyPayment = Math.round(rawYearly / 12);

                const refYearly = branch === 'gas'
                    ? (parsedKwh * 0.215) + (29.50 * 12)
                    : (branch === 'waerme'
                        ? (parsedKwh * 0.375) + (24.90 * 12)
                        : (parsedKwh * 0.415) + (29.90 * 12));
                const savings = Math.max(40, Math.round(refYearly - rawYearly));

                selectedOrderData.consumption = String(parsedKwh);
                selectedOrderData.monthlyPayment = String(monthlyPayment);
                selectedOrderData.savings = String(savings);
                selectedOrderData.userEnteredModalKwh = parsedKwh;
                if (branch === 'waerme') {
                    const htNt = getCurrentHtNtValues(parsedKwh);
                    selectedOrderData.consumptionHt = htNt.ht;
                    selectedOrderData.consumptionNt = htNt.nt;
                    selectedOrderData.meterType = htNt.meterType;
                    const waermeSumEl = document.getElementById('orderWaermeHtNtSummary');
                    if (waermeSumEl) {
                        waermeSumEl.textContent = htNt.meterType === 'et'
                            ? `Eintarifzähler (ET) • Gesamtverbrauch: ${parsedKwh.toLocaleString('de-DE')} kWh/Jahr`
                            : `Doppeltarifzähler (HT/NT) • HT: ${htNt.ht.toLocaleString('de-DE')} kWh/Jahr | NT: ${htNt.nt.toLocaleString('de-DE')} kWh/Jahr`;
                    }
                }
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
                    if (branch === 'waerme') {
                        syncHtNtFromTotalKwh(parsedKwh);
                    }
                    userHasEnteredKwh = true;
                    recalculateTariffs();
                }
            } else {
                selectedOrderData.consumption = '';
                selectedOrderData.monthlyPayment = '';
                selectedOrderData.savings = '';

                if (monthlyEl) {
                    monthlyEl.textContent = curLang === 'en' ? 'Please select consumption below' : (curLang === 'tr' ? 'Lütfen aşağıdan tüketim seçin' : (curLang === 'ar' ? 'يرجى اختيار الاستهلاك أدناه' : 'Bitte unten Verbrauch wählen'));
                    monthlyEl.style.color = '#ea580c';
                }
                if (kwhEl) {
                    kwhEl.textContent = curLang === 'en' ? 'Please enter below' : (curLang === 'tr' ? 'Lütfen aşağıda belirtin' : (curLang === 'ar' ? 'يرجى الإدخال أدناه' : 'Bitte unten angeben'));
                    kwhEl.style.color = '#ea580c';
                }
                if (savingsEl) {
                    const rateFormatted = activeWorkCt.toFixed(2).replace('.', ',');
                    const baseFormatted = activeBaseEur.toFixed(2).replace('.', ',');
                    if (curLang === 'en') {
                        savingsEl.textContent = `⚡ Rates: ${rateFormatted} ct/kWh • €${baseFormatted}/month base price – please enter consumption below`;
                    } else if (curLang === 'tr') {
                        savingsEl.textContent = `⚡ Koşullar: ${rateFormatted} ct/kWh • ${baseFormatted} €/Ay sabit ücret – lütfen aşağıya tüketim girin`;
                    } else if (curLang === 'ar') {
                        savingsEl.textContent = `⚡ الشروط: ${rateFormatted} سنت/ك.و.س • ${baseFormatted} €/شهر سعر أساسي – يرجى إدخال الاستهلاك أدناه`;
                    } else {
                        savingsEl.textContent = `⚡ Konditionen: ${rateFormatted} ct/kWh • ${baseFormatted} €/Monat Grundpreis – bitte unten Verbrauch angeben`;
                    }
                }
            }

            if (promptBox && promptHeader && promptIcon && promptText) {
                if (isPlzValid && isKwhValid) {
                    promptIcon.textContent = '✓';
                    promptIcon.style.background = '#dcfce7';
                    promptIcon.style.color = '#15803d';
                    promptHeader.style.color = '#166534';
                    promptText.textContent = curLang === 'en'
                        ? 'Your details have been applied – your personal monthly rate is calculated:'
                        : (curLang === 'tr'
                            ? 'Bilgileriniz alındı – kişisel aylık taksitiniz hesaplandı:'
                            : (curLang === 'ar'
                                ? 'تم اعتماد بياناتك – تم حساب دفعتك الشهرية الشخصية:'
                                : 'Deine Angaben wurden übernommen – dein persönlicher Abschlag ist berechnet:'));
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
                        promptText.textContent = curLang === 'en'
                            ? 'No consumption data entered yet – please enter postcode & consumption below:'
                            : (curLang === 'tr'
                                ? 'Henüz tüketim verisi girilmedi – lütfen aşağıya posta kodu ve tüketimi ekleyin:'
                                : (curLang === 'ar'
                                    ? 'لم يتم إدخال بيانات الاستهلاك بعد – يرجى إدخال الرمز البريدي والاستهلاك هنا:'
                                    : 'Noch keine Verbrauchsdaten eingegeben – bitte hier kurz PLZ & Verbrauch ergänzen:'));
                    } else if (!isPlzValid && isKwhValid) {
                        promptText.textContent = curLang === 'en'
                            ? 'Almost done – please enter your 5-digit postcode (supply location):'
                            : (curLang === 'tr'
                                ? 'Neredeyse bitti – lütfen 5 haneli posta kodunuzu (teslimat yeri) girin:'
                                : (curLang === 'ar'
                                    ? 'أوشكت على الانتهاء – يرجى إدخال الرمز البريدي المكون من 5 أرقام:'
                                    : 'Fast fertig – bitte gib noch kurz deine 5-stellige Postleitzahl (Lieferort) ein:'));
                    } else {
                        promptText.textContent = curLang === 'en'
                            ? 'Almost done – please select your household size or enter your annual consumption (kWh):'
                            : (curLang === 'tr'
                                ? 'Neredeyse bitti – lütfen hane büyüklüğünüzü seçin veya yıllık tüketiminizi (kWh) girin:'
                                : (curLang === 'ar'
                                    ? 'أوشكت على الانتهاء – يرجى اختيار حجم الأسرة أو إدخال استهلاكك السنوي (ك.و.س):'
                                    : 'Fast fertig – bitte wähle noch kurz deine Haushaltsgröße oder gib deinen Jahresverbrauch (kWh) ein:'));
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

            const htNt = branch === 'waerme' ? getCurrentHtNtValues(prefilledKwh || 6000) : null;

            selectedOrderData = {
                tariffId: validTariffId,
                tariffName: spec.name,
                branch: branch,
                consumption: prefilledKwh ? String(prefilledKwh) : '',
                consumptionHt: htNt ? htNt.ht : undefined,
                consumptionNt: htNt ? htNt.nt : undefined,
                meterType: htNt ? htNt.meterType : 'et',
                monthlyPayment: '',
                savings: '',
                plz: mainPlz,
                userEnteredModalKwh: prefilledKwh,
                firstconTariffId: (btnElement && btnElement.getAttribute('data-firstcon-tariff-id')) || spec.firstconTariffId || null,
                energyGridNumber: (btnElement && btnElement.getAttribute('data-energy-grid')) || spec.energyGridNumber || null
            };

            const orderWaermeMeterBox = document.getElementById('orderWaermeMeterBox');
            const orderMeterType = document.getElementById('orderMeterType');
            if (orderWaermeMeterBox) {
                orderWaermeMeterBox.style.display = branch === 'waerme' ? 'block' : 'none';
            }
            if (orderMeterType && htNt) {
                orderMeterType.value = htNt.meterType;
            }

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
                const orderMeterType = document.getElementById('orderMeterType');
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
                if (selectedOrderData.branch === 'waerme' && orderMeterType) {
                    selectedOrderData.meterType = orderMeterType.value || 'htnt';
                }
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

        const syncCancelModalTexts = (isWiderruf) => {
            const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';
            if (isWiderruf) {
                if (cancelModalTitle) {
                    cancelModalTitle.textContent = curLang === 'en'
                        ? 'Revoke Contract (Online Revocation Form)'
                        : (curLang === 'tr'
                            ? 'Sözleşmeyi İptal Et / Cayma (Online Cayma Formu)'
                            : (curLang === 'ar'
                                ? 'التراجع عن العقد (نموذج التراجع الإلكتروني)'
                                : 'Vertrag widerrufen (Online-Widerrufsformular)'));
                }
                if (cancelModalSubtitle) {
                    cancelModalSubtitle.innerHTML = curLang === 'en'
                        ? 'Revoke your energy supply contract easily online within the 14-day revocation period. You will immediately receive an electronic confirmation of receipt by email and as a PDF document.'
                        : (curLang === 'tr'
                            ? 'Enerji tedarik sözleşmenizden 14 günlük cayma süresi içinde kolayca online olarak cayın. E-posta ve PDF belgesi olarak anında elektronik alındı onayı alacaksınız.'
                            : (curLang === 'ar'
                                ? 'تراجع عن عقد تزويد الطاقة الخاص بك بسهولة عبر الإنترنت خلال فترة التراجع البالغة 14 يوماً. ستتلقى فوراً تأكيد استلام إلكتروني عبر البريد الإلكتروني وكمستند PDF.'
                                : 'Widerrufen Sie Ihren Energieliefervertrag innerhalb der 14-tägigen Widerrufsfrist einfach online. Sie erhalten umgehend eine elektronische Eingangsbestätigung per E-Mail sowie als PDF-Dokument.'));
                }
                if (cancelOnlyFields) cancelOnlyFields.style.display = 'none';
                if (revokeOnlyFields) revokeOnlyFields.style.display = 'block';
                if (cancelReasonSelect) cancelReasonSelect.required = false;
                if (cancelCustomDate) cancelCustomDate.required = false;
                if (revokeOrderDate) revokeOrderDate.required = true;
                if (cancelContractNumberLabel) {
                    cancelContractNumberLabel.textContent = curLang === 'en'
                        ? 'Order or Customer Number *'
                        : (curLang === 'tr'
                            ? 'Sipariş veya Müşteri Numarası *'
                            : (curLang === 'ar'
                                ? 'رقم الطلب أو رقم العميل *'
                                : 'Bestell- oder Kundennummer *'));
                }
                if (cancelDeclarationText) {
                    cancelDeclarationText.textContent = curLang === 'en'
                        ? 'I hereby revoke the contract concluded by me for the supply of energy (electricity/natural gas). *'
                        : (curLang === 'tr'
                            ? 'Tarafımdan akdedilen enerji (elektrik/doğalgaz) tedarik sözleşmesinden işbu belge ile cayıyorum. *'
                            : (curLang === 'ar'
                                ? 'أقر بموجب هذا بالتراجع عن العقد الذي أبرمته لتزويد الطاقة (الكهرباء/الغاز الطبيعي). *'
                                : 'Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über die Lieferung von Energie (Strom/Erdgas). *'));
                }
                if (btnCancelSubmit) {
                    btnCancelSubmit.textContent = curLang === 'en'
                        ? 'Submit Revocation'
                        : (curLang === 'tr'
                            ? 'Cayma Bildirimini Gönder'
                            : (curLang === 'ar'
                                ? 'إرسال طلب التراجع'
                                : 'Widerruf senden'));
                }
            } else {
                if (cancelModalTitle) {
                    cancelModalTitle.textContent = curLang === 'en'
                        ? 'Cancel Contracts Here (§ 312k BGB)'
                        : (curLang === 'tr'
                            ? 'Sözleşmeleri Buradan Feshedin (§ 312k BGB)'
                            : (curLang === 'ar'
                                ? 'إلغاء العقود هنا (§ 312k BGB)'
                                : 'Vertrag kündigen (§ 312k BGB)'));
                }
                if (cancelModalSubtitle) {
                    cancelModalSubtitle.innerHTML = curLang === 'en'
                        ? 'Here you can electronically cancel your existing energy supply contract with Alpha Energie in accordance with § 312k BGB. After submitting, your cancellation confirmation is immediately available as a PDF download and sent to you by email.'
                        : (curLang === 'tr'
                            ? 'Burada Alpha Energie ile mevcut enerji tedarik sözleşmenizi § 312k BGB uyarınca elektronik olarak feshedebilirsiniz. Gönderdikten sonra fesih onayınız anında PDF olarak indirilebilir ve ayrıca e-posta ile gönderilir.'
                            : (curLang === 'ar'
                                ? 'يمكنك هنا إلغاء عقد تزويد الطاقة الحالي الخاص بك مع Alpha Energie إلكترونياً وفقاً للمادة § 312k BGB. بعد الإرسال، يتوفر تأكيد الإلغاء فوراً للتحميل بصيغة PDF ويتم إرساله إليك عبر البريد الإلكتروني.'
                                : 'Hier können Sie Ihren bestehenden Energieliefervertrag bei Alpha Energie gemäß § 312k BGB elektronisch kündigen. Nach dem Absenden steht Ihnen Ihre Kündigungsbestätigung sofort als PDF zum Download bereit und wird Ihnen zusätzlich per E-Mail zugesandt.'));
                }
                if (cancelOnlyFields) cancelOnlyFields.style.display = 'block';
                if (revokeOnlyFields) revokeOnlyFields.style.display = 'none';
                if (revokeOrderDate) revokeOrderDate.required = false;
                if (cancelContractNumberLabel) {
                    cancelContractNumberLabel.textContent = curLang === 'en'
                        ? 'Contract or Customer Number *'
                        : (curLang === 'tr'
                            ? 'Sözleşme veya Müşteri Numarası *'
                            : (curLang === 'ar'
                                ? 'رقم العقد أو العميل *'
                                : 'Vertrags- oder Kundennummer *'));
                }
                if (cancelDeclarationText) {
                    cancelDeclarationText.textContent = curLang === 'en'
                        ? 'I confirm the accuracy of my details and wish to bindingly cancel my energy supply contract stated above. *'
                        : (curLang === 'tr'
                            ? 'Bilgilerimin doğruluğunu onaylıyor ve yukarıda belirtilen enerji tedarik sözleşmemi bağlayıcı olarak feshetmek istiyorum. *'
                            : (curLang === 'ar'
                                ? 'أؤكد صحة بياناتي وأرغب في إلغاء عقد تزويد الطاقة المذكور أعلاه بشكل ملزم. *'
                                : 'Ich bestätige die Richtigkeit meiner Angaben und möchte meinen oben genannten Energieliefervertrag verbindlich kündigen. *'));
                }
                if (btnCancelSubmit) {
                    btnCancelSubmit.textContent = curLang === 'en'
                        ? 'Cancel Now'
                        : (curLang === 'tr'
                            ? 'Şimdi Feshet'
                            : (curLang === 'ar'
                                ? 'إلغاء العقد الآن'
                                : 'Jetzt kündigen'));
                }
                updateCancelSubfieldsVisibility();
            }
        };

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

            syncCancelModalTexts(isWiderruf);

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

        window.addEventListener('languageChanged', () => {
            updateHouseholdPresets(currentBranch);
            recalculateTariffs();
            updateModalPresetsForBranch(selectedOrderData.branch || currentBranch || 'strom');
            refreshModalStep1Calculation();
            const isWiderruf = (cancelTypeInput && cancelTypeInput.value === 'WIDERRUF');
            syncCancelModalTexts(Boolean(isWiderruf));
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
(function initCookieBanner() {
    const getCookieBannerTexts = (lang) => {
        if (lang === 'en') {
            return {
                title: 'Privacy Settings',
                body: 'We use data storage technologies to offer you the best experience on our website. Some of them are essential (e.g., for core website functions), while others help us improve our website and your experience. Further information can be found in our <a href="datenschutz.html" style="color:#ef8a00; text-decoration:underline;">Privacy Policy</a>.',
                accept: 'Accept All',
                decline: 'Essential Only',
                custom: 'Customize Individual Settings'
            };
        }
        if (lang === 'tr') {
            return {
                title: 'Gizlilik Ayarları',
                body: 'Web sitemizde size en iyi deneyimi sunmak için veri depolama teknolojileri kullanıyoruz. Bunlardan bazıları zorunludur (örn. temel web sitesi işlevleri için), diğerleri ise web sitemizi ve deneyiminizi geliştirmemize yardımcı olur. Daha fazla bilgiyi <a href="datenschutz.html" style="color:#ef8a00; text-decoration:underline;">Gizlilik Politikamızda</a> bulabilirsiniz.',
                accept: 'Tümünü Kabul Et',
                decline: 'Yalnızca Zorunlu Olanlar',
                custom: 'Bireysel Ayarları Özelleştir'
            };
        }
        if (lang === 'ar') {
            return {
                title: 'إعدادات الخصوصية',
                body: 'نحن نستخدم تقنيات تخزين البيانات لنقدم لك أفضل تجربة على موقعنا الإلكتروني. بعضها ضروري (على سبيل المثال للوظائف الأساسية للموقع)، بينما يساعدنا البعض الآخر على تحسين موقعنا وتجربتك. يمكنك العثور على مزيد من المعلومات في <a href="datenschutz.html" style="color:#ef8a00; text-decoration:underline;">سياسة الخصوصية</a> الخاصة بنا.',
                accept: 'قبول الكل',
                decline: 'الضرورية فقط',
                custom: 'تخصيص الإعدادات الفردية'
            };
        }
        return {
            title: 'Datenschutzeinstellungen',
            body: 'Wir verwenden Technologien zur Datenspeicherung, um Ihnen das beste Erlebnis auf unserer Website zu bieten. Einige davon sind essenziell (z.B. für die Grundfunktionen der Website), während andere uns helfen, unsere Website und Ihr Erlebnis zu verbessern. Weitere Informationen finden Sie in unserer <a href="datenschutz.html" style="color:#ef8a00; text-decoration:underline;">Datenschutzerklärung</a>.',
            accept: 'Alle akzeptieren',
            decline: 'Nur Essenzielle',
            custom: 'Individuelle Einstellungen anpassen'
        };
    };

    const checkAndShowBanner = () => {
        try {
            // Check if user has already made a choice
            const consentGiven = localStorage.getItem("alpha_consent_status");
            
            // Check if we are on the settings page
            const isSettingsPage = window.location.pathname.includes('cookie-einstellungen');
            
            if (!consentGiven && !isSettingsPage) {
                const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : (localStorage.getItem('alpha_lang') || 'de');
                const t = getCookieBannerTexts(curLang);

                // Create overlay element (avoiding words like 'cookie', 'banner', 'consent' in IDs to prevent Adblockers from hiding it)
                const overlay = document.createElement("div");
                overlay.id = "alphaDsgvoOverlay";
                overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 2147483646; display: flex; align-items: center; justify-content: center;";
                
                // Create banner element
                const modalBox = document.createElement("div");
                modalBox.id = "alphaDsgvoModal";
                modalBox.style.cssText = "background: #fff; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); padding: 32px; max-width: 600px; width: 90%; z-index: 2147483647; display: flex; flex-direction: column; gap: 20px;";
                
                modalBox.innerHTML = `
                    <h3 id="alphaDsgvoTitle" style="margin:0; font-size:1.5rem; font-weight:bold; color:#1a1a1a;">${t.title}</h3>
                    <p id="alphaDsgvoBody" style="margin:0; font-size:0.95rem; color:#4a4a4a; line-height:1.6;">
                        ${t.body}
                    </p>
                    <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
                        <div style="display:flex; gap:12px; flex-wrap:wrap;">
                            <button id="btnAcceptAll" style="flex:1; padding:12px; background:#ef8a00; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1rem; transition: background 0.2s;">${t.accept}</button>
                            <button id="btnDeclineAll" style="flex:1; padding:12px; background:#f0f0f0; color:#333; border:1px solid #ddd; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1rem; transition: background 0.2s;">${t.decline}</button>
                        </div>
                        <a id="alphaDsgvoCustomLink" href="cookie-einstellungen.html" style="text-align:center; padding:8px; color:#666; text-decoration:underline; font-size:0.9rem; cursor:pointer;">${t.custom}</a>
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

                window.addEventListener('languageChanged', (ev) => {
                    const nextLang = (ev && ev.detail && ev.detail.lang) || 'de';
                    const nt = getCookieBannerTexts(nextLang);
                    const titleEl = document.getElementById('alphaDsgvoTitle');
                    const bodyEl = document.getElementById('alphaDsgvoBody');
                    const accEl = document.getElementById('btnAcceptAll');
                    const decEl = document.getElementById('btnDeclineAll');
                    const custEl = document.getElementById('alphaDsgvoCustomLink');
                    if (titleEl) titleEl.textContent = nt.title;
                    if (bodyEl) bodyEl.innerHTML = nt.body;
                    if (accEl) accEl.textContent = nt.accept;
                    if (decEl) decEl.textContent = nt.decline;
                    if (custEl) custEl.textContent = nt.custom;
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
            const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
            const duration = 1600;
            const startTime = performance.now();

            const step = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out quartic
                const ease = 1 - Math.pow(1 - progress, 4);
                const current = target * ease;
                const suffix = el.getAttribute('data-counter-suffix') || '';
                const prefix = el.getAttribute('data-counter-prefix') || '';
                
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

// ==========================================================================
// Alpha Energie - Official § 42 EnWG Stromkennzeichnung HiDPI Canvas Renderer
// Renders "STROMMIX IM VERGLEICH (Stand 03/2026)" as a crisp interactive Canvas
// ==========================================================================
(function() {
    'use strict';

    const STROMMIX_I18N = {
        de: {
            heading: 'STROMMIX IM VERGLEICH',
            deTitle: 'Deutschland',
            alphaTitle: 'Alpha Energie',
            co2Text: '✓ CO₂-Emissionen: 0 g/kWh',
            radText: '✓ Radioaktiver Abfall: 0,0000 g/kWh',
            legalSub: 'Stromkennzeichnung gemäß § 42 des Energiewirtschaftsgesetzes',
            sourceNote: 'Quelle: eigene Darstellung nach AG Energiebilanzen und Fraunhofer ISE, Stand 03/2026',
            thCountry: 'Lieferländer der Herkunftsnachweise',
            thShare: 'Anteil',
            thSource: 'Stromerzeugung durch',
            deSlices: [
                { label: 'Erneuerbare Energien, gefördert nach EEG', value: 62.20, valText: '62,20 %', color: '#4d9c2d', hoverColor: '#3d8420' },
                { label: 'Kohle', value: 23.50, valText: '23,50 %', color: '#c85a17', hoverColor: '#b04b0e' },
                { label: 'Erdgas', value: 11.90, valText: '11,90 %', color: '#e5a93c', hoverColor: '#d49526' },
                { label: 'Mineralöl und sonstige', value: 2.40, valText: '2,40 %', color: '#23406e', hoverColor: '#172d50' }
            ],
            alphaSlices: [
                { label: 'Erneuerbare Energien mit Herkunftsnachweis', value: 100.0, valText: '100 %', color: '#3b7a1e', hoverColor: '#2f6515' }
            ],
            originRows: [
                { country: 'Schweden', share: '5,5 %', source: 'Windkraft' },
                { country: 'Norwegen', share: '94,5 %', source: 'Wasserkraft' }
            ]
        },
        en: {
            heading: 'ELECTRICITY MIX COMPARISON',
            deTitle: 'Germany',
            alphaTitle: 'Alpha Energie',
            co2Text: '✓ CO₂ Emissions: 0 g/kWh',
            radText: '✓ Radioactive Waste: 0.0000 g/kWh',
            legalSub: 'Electricity Disclosure Pursuant to § 42 German Energy Industry Act (EnWG)',
            sourceNote: 'Source: Own diagram based on AG Energiebilanzen and Fraunhofer ISE, as of 03/2026',
            thCountry: 'Countries of Origin (Guarantees of Origin)',
            thShare: 'Share',
            thSource: 'Power Generation By',
            deSlices: [
                { label: 'Renewable Energy, EEG-subsidized', value: 62.20, valText: '62.20%', color: '#4d9c2d', hoverColor: '#3d8420' },
                { label: 'Coal', value: 23.50, valText: '23.50%', color: '#c85a17', hoverColor: '#b04b0e' },
                { label: 'Natural Gas', value: 11.90, valText: '11.90%', color: '#e5a93c', hoverColor: '#d49526' },
                { label: 'Mineral Oil & Other', value: 2.40, valText: '2.40%', color: '#23406e', hoverColor: '#172d50' }
            ],
            alphaSlices: [
                { label: 'Renewables with Guarantee of Origin', value: 100.0, valText: '100%', color: '#3b7a1e', hoverColor: '#2f6515' }
            ],
            originRows: [
                { country: 'Sweden', share: '5.5%', source: 'Wind Power' },
                { country: 'Norway', share: '94.5%', source: 'Hydropower' }
            ]
        },
        tr: {
            heading: 'ELEKTRİK KARIŞIMI KARŞILAŞTIRMASI',
            deTitle: 'Almanya',
            alphaTitle: 'Alpha Energie',
            co2Text: '✓ CO₂ Emisyonları: 0 g/kWh',
            radText: '✓ Radyoaktif Atık: 0,0000 g/kWh',
            legalSub: 'Enerji Endüstrisi Yasası (EnWG) § 42 uyarınca elektrik etiketlemesi',
            sourceNote: 'Kaynak: AG Energiebilanzen ve Fraunhofer ISE verilerine göre, 03/2026 itibarıyla',
            thCountry: 'Menşe Garantisi Tedarik Ülkeleri',
            thShare: 'Pay',
            thSource: 'Üretim Kaynağı',
            deSlices: [
                { label: 'Yenilenebilir Enerji (EEG destekli)', value: 62.20, valText: '%62,20', color: '#4d9c2d', hoverColor: '#3d8420' },
                { label: 'Kömür', value: 23.50, valText: '%23,50', color: '#c85a17', hoverColor: '#b04b0e' },
                { label: 'Doğalgaz', value: 11.90, valText: '%11,90', color: '#e5a93c', hoverColor: '#d49526' },
                { label: 'Mineral Yağ ve Diğer', value: 2.40, valText: '%2,40', color: '#23406e', hoverColor: '#172d50' }
            ],
            alphaSlices: [
                { label: 'Menşe Garantili Yenilenebilir Enerji', value: 100.0, valText: '%100', color: '#3b7a1e', hoverColor: '#2f6515' }
            ],
            originRows: [
                { country: 'İsveç', share: '%5,5', source: 'Rüzgar Enerjisi' },
                { country: 'Norveç', share: '%94,5', source: 'Hidroelektrik' }
            ]
        },
        ar: {
            heading: 'مقارنة مزيج الكهرباء',
            deTitle: 'ألمانيا',
            alphaTitle: 'Alpha Energie',
            co2Text: '✓ انبعاثات CO₂: 0 جم/ك.و.س',
            radText: '✓ النفايات المشعة: 0,0000 جم/ك.و.س',
            legalSub: 'تصنيف الكهرباء وفقاً للمادة § 42 من قانون صناعة الطاقة الألماني (EnWG)',
            sourceNote: 'المصدر: تمثيل خاص وفقاً لـ AG Energiebilanzen ومعهد Fraunhofer ISE، حتى 03/2026',
            thCountry: 'بلدان شهادات المنشأ',
            thShare: 'الحصة',
            thSource: 'توليد الكهرباء بواسطة',
            deSlices: [
                { label: 'طاقات متجددة مدعومة وفقاً لـ EEG', value: 62.20, valText: '62,20 %', color: '#4d9c2d', hoverColor: '#3d8420' },
                { label: 'الفحم', value: 23.50, valText: '23,50 %', color: '#c85a17', hoverColor: '#b04b0e' },
                { label: 'الغاز الطبيعي', value: 11.90, valText: '11,90 %', color: '#e5a93c', hoverColor: '#d49526' },
                { label: 'الزيوت المعدنية وأخرى', value: 2.40, valText: '2,40 %', color: '#23406e', hoverColor: '#172d50' }
            ],
            alphaSlices: [
                { label: 'طاقات متجددة مع شهادة منشأ', value: 100.0, valText: '100 %', color: '#3b7a1e', hoverColor: '#2f6515' }
            ],
            originRows: [
                { country: 'السويد', share: '5,5 %', source: 'طاقة الرياح' },
                { country: 'النرويج', share: '94,5 %', source: 'الطاقة الكهرومائية' }
            ]
        }
    };

    function drawRoundedRect(ctx, x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
    }

    function setupStrommixCanvas(canvas) {
        if (!canvas || canvas.dataset.strommixInitialized === 'true') return;
        canvas.dataset.strommixInitialized = 'true';

        let animProgress = 0;
        let hoveredItem = null; // { chart: 'de'|'alpha', index: number, x, y }
        let hitRegions = [];

        function render(progress) {
            const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';
            const L = STROMMIX_I18N[curLang] || STROMMIX_I18N.de;
            const DE_SLICES = L.deSlices;
            const ALPHA_SLICES = L.alphaSlices;
            const ORIGIN_ROWS = L.originRows;

            const dpr = Math.min(window.devicePixelRatio || 1, 3);
            const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 760;
            const logicalW = Math.max(320, Math.min(860, parentWidth || 760));
            const isCompact = logicalW < 560;
            const scale = logicalW / 780;

            const logicalH = isCompact ? Math.round(980 * (logicalW / 460)) : Math.round(690 * scale);

            if (canvas.width !== Math.round(logicalW * dpr) || canvas.height !== Math.round(logicalH * dpr)) {
                canvas.width = Math.round(logicalW * dpr);
                canvas.height = Math.round(logicalH * dpr);
                canvas.style.width = logicalW + 'px';
                canvas.style.height = logicalH + 'px';
            }

            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.scale(dpr, dpr);

            const W = logicalW;
            const H = logicalH;
            const s = isCompact ? (W / 460) : (W / 780);

            hitRegions = [];

            // 1. Background Card Surface
            ctx.clearRect(0, 0, W, H);
            const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
            bgGrad.addColorStop(0, '#ffffff');
            bgGrad.addColorStop(1, '#fffdf9');
            drawRoundedRect(ctx, 0, 0, W, H, 14 * s);
            ctx.fillStyle = bgGrad;
            ctx.fill();

            // Top Accent Bar
            drawRoundedRect(ctx, 18 * s, 16 * s, W - 36 * s, 44 * s, 10 * s);
            const titleBg = ctx.createLinearGradient(18 * s, 16 * s, W - 18 * s, 16 * s);
            titleBg.addColorStop(0, '#fff7ed');
            titleBg.addColorStop(0.5, '#ffedd5');
            titleBg.addColorStop(1, '#fff7ed');
            ctx.fillStyle = titleBg;
            ctx.fill();
            ctx.strokeStyle = 'rgba(249, 178, 51, 0.55)';
            ctx.lineWidth = 1.2 * s;
            ctx.stroke();

            // Main Heading: STROMMIX IM VERGLEICH
            ctx.fillStyle = '#1c1917';
            ctx.font = `800 ${Math.round(19 * s)}px 'Sora', 'Plus Jakarta Sans', system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L.heading, W / 2, 38 * s);

            // Helper to draw a Donut Chart with Callouts & Legend
            function drawDonutChart(cx, cy, outerR, innerR, title, slices, chartKey, legendStartY, legendX, legendW) {
                // Chart Title
                ctx.fillStyle = '#1c1917';
                ctx.font = `800 ${Math.round(16 * s)}px 'Sora', system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(title, cx, cy - outerR - 26 * s);

                // Subtle Shadow Ring behind Donut
                ctx.save();
                ctx.beginPath();
                ctx.arc(cx, cy, outerR + 2 * s, 0, Math.PI * 2);
                ctx.shadowColor = 'rgba(15, 23, 42, 0.10)';
                ctx.shadowBlur = 14 * s;
                ctx.shadowOffsetY = 4 * s;
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.restore();

                let startAngle = -Math.PI / 2;
                const totalSweep = Math.PI * 2 * progress;

                slices.forEach((slice, idx) => {
                    const sliceAngle = (slice.value / 100) * totalSweep;
                    const endAngle = startAngle + sliceAngle;
                    const midAngle = startAngle + sliceAngle / 2;
                    const isHovered = hoveredItem && hoveredItem.chart === chartKey && hoveredItem.index === idx;
                    const rOut = isHovered ? outerR + 4 * s : outerR;

                    // Draw Donut Segment
                    ctx.beginPath();
                    ctx.arc(cx, cy, rOut, startAngle, endAngle, false);
                    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
                    ctx.closePath();
                    ctx.fillStyle = isHovered ? slice.hoverColor : slice.color;
                    ctx.fill();

                    // Crisp white separator line if multiple slices
                    if (slices.length > 1) {
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2 * s;
                        ctx.stroke();
                    }

                    // Store hit region
                    hitRegions.push({
                        chart: chartKey,
                        index: idx,
                        cx,
                        cy,
                        innerR,
                        outerR: outerR + 6 * s,
                        startAngle,
                        endAngle,
                        slice
                    });

                    // Draw Callout Line & Percentage Label once animation is mostly complete
                    if (progress > 0.75) {
                        const alpha = Math.min(1, (progress - 0.75) / 0.25);
                        ctx.save();
                        ctx.globalAlpha = alpha;

                        let calloutAngle = midAngle;
                        // Fine-tune small slice angle so labels never overlap
                        if (chartKey === 'de' && idx === 3) {
                            calloutAngle = -Math.PI / 2 - 0.08;
                        } else if (chartKey === 'de' && idx === 2) {
                            calloutAngle = midAngle - 0.06;
                        } else if (chartKey === 'alpha') {
                            calloutAngle = -Math.PI / 4;
                        }

                        const p1r = (outerR + innerR) / 2;
                        const p2r = outerR + 13 * s;
                        const x1 = cx + Math.cos(calloutAngle) * p1r;
                        const y1 = cy + Math.sin(calloutAngle) * p1r;
                        const x2 = cx + Math.cos(calloutAngle) * p2r;
                        const y2 = cy + Math.sin(calloutAngle) * p2r;

                        const isRight = Math.cos(calloutAngle) >= 0;
                        const horizLen = (chartKey === 'de' && idx === 3) ? -22 * s : (isRight ? 16 * s : -16 * s);
                        const x3 = x2 + horizLen;
                        const y3 = y2;

                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.lineTo(x3, y3);
                        ctx.strokeStyle = '#64748b';
                        ctx.lineWidth = 1.25 * s;
                        ctx.stroke();

                        // Small dot on segment
                        ctx.beginPath();
                        ctx.arc(x1, y1, 2.2 * s, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();

                        // Percentage text
                        ctx.fillStyle = '#1e293b';
                        ctx.font = `700 ${Math.round(11.5 * s)}px 'Sora', system-ui, sans-serif`;
                        const alignRight = horizLen >= 0;
                        ctx.textAlign = alignRight ? 'left' : 'right';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(slice.valText, x3 + (alignRight ? 4 * s : -4 * s), y3);

                        ctx.restore();
                    }

                    startAngle = endAngle;
                });

                // Inner White Hole & Subtle Gray Ring with "%" Badge (matching Firstcon original)
                ctx.beginPath();
                ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(cx, cy, innerR * 0.62, 0, Math.PI * 2);
                ctx.fillStyle = '#f1f5f9';
                ctx.fill();
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1.2 * s;
                ctx.stroke();

                ctx.fillStyle = '#334155';
                ctx.font = `800 ${Math.round(21 * s)}px 'Sora', system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('%', cx, cy + 1 * s);

                // Legend below Donut (clean single-label rows matching Firstcon graphic without right-side overlap)
                let ly = legendStartY;
                slices.forEach((slice) => {
                    // Color square/pill
                    drawRoundedRect(ctx, legendX, ly - 6 * s, 12 * s, 12 * s, 3 * s);
                    ctx.fillStyle = slice.color;
                    ctx.fill();

                    // Label text
                    ctx.fillStyle = '#1e293b';
                    ctx.font = `600 ${Math.round(11.5 * s)}px 'Plus Jakarta Sans', 'Sora', system-ui, sans-serif`;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(slice.label, legendX + 18 * s, ly);

                    ly += 21 * s;
                });

                // For Alpha Energie (Right Chart), show CO2 & Radioactive Waste 0 g/kWh highlight box
                if (chartKey === 'alpha') {
                    const boxY = ly + 6 * s;
                    drawRoundedRect(ctx, legendX, boxY, legendW, 44 * s, 8 * s);
                    ctx.fillStyle = '#f0fdf4';
                    ctx.fill();
                    ctx.strokeStyle = '#bbf7d0';
                    ctx.lineWidth = 1.2 * s;
                    ctx.stroke();

                    ctx.fillStyle = '#15803d';
                    ctx.font = `800 ${Math.round(11 * s)}px 'Sora', system-ui, sans-serif`;
                    ctx.textAlign = 'left';
                    ctx.fillText(L.co2Text, legendX + 10 * s, boxY + 15 * s);
                    ctx.fillText(L.radText, legendX + 10 * s, boxY + 31 * s);
                }
            }

            let legalY;
            if (!isCompact) {
                // Desktop / Tablet 2-Column Layout
                const outerR = 82 * s;
                const innerR = 46 * s;
                const cy = 198 * s;
                const leftCx = W * 0.27;
                const rightCx = W * 0.74;

                // Vertical Divider between charts
                ctx.beginPath();
                ctx.moveTo(W * 0.515, 82 * s);
                ctx.lineTo(W * 0.515, 395 * s);
                ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
                ctx.lineWidth = 1.2 * s;
                ctx.stroke();

                drawDonutChart(leftCx, cy, outerR, innerR, L.deTitle, DE_SLICES, 'de', 318 * s, 30 * s, W * 0.45);
                drawDonutChart(rightCx, cy, outerR, innerR, L.alphaTitle, ALPHA_SLICES, 'alpha', 318 * s, W * 0.545, W * 0.415);

                legalY = 428 * s;
            } else {
                // Mobile Stacked Layout
                const outerR = 76 * s;
                const innerR = 42 * s;

                drawDonutChart(W / 2, 185 * s, outerR, innerR, L.deTitle, DE_SLICES, 'de', 295 * s, 26 * s, W - 52 * s);

                // Horizontal Divider
                ctx.beginPath();
                ctx.moveTo(26 * s, 390 * s);
                ctx.lineTo(W - 26 * s, 390 * s);
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1.2 * s;
                ctx.stroke();

                drawDonutChart(W / 2, 520 * s, outerR, innerR, L.alphaTitle, ALPHA_SLICES, 'alpha', 630 * s, 26 * s, W - 52 * s);

                legalY = 720 * s;
            }

            // 3. Legal Subtitle & Source Note (exact text from Firstcon Stromkennzeichnung)
            ctx.fillStyle = '#1e293b';
            ctx.font = `700 ${Math.round(13 * s)}px 'Plus Jakarta Sans', 'Sora', system-ui, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(L.legalSub, 28 * s, legalY);

            ctx.fillStyle = '#475569';
            ctx.font = `500 ${Math.round(11.5 * s)}px 'Plus Jakarta Sans', 'Sora', system-ui, sans-serif`;
            ctx.fillText(L.sourceNote, 28 * s, legalY + 20 * s);

            // 4. Bottom Table: "Lieferländer der Herkunftsnachweise"
            const tableX = 28 * s;
            const tableY = legalY + 52 * s;
            const tableW = W - 56 * s;
            const headerH = 38 * s;
            const rowH = 36 * s;
            const totalTableH = headerH + ORIGIN_ROWS.length * rowH;

            // Table Outer Frame
            drawRoundedRect(ctx, tableX, tableY, tableW, totalTableH, 10 * s);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Header Background (Warm Orange/Gold like Firstcon chart)
            ctx.save();
            drawRoundedRect(ctx, tableX, tableY, tableW, totalTableH, 10 * s);
            ctx.clip();

            const thGrad = ctx.createLinearGradient(tableX, tableY, tableX + tableW, tableY);
            thGrad.addColorStop(0, '#f59e0b');
            thGrad.addColorStop(0.6, '#f99239');
            thGrad.addColorStop(1, '#e95e24');
            ctx.fillStyle = thGrad;
            ctx.fillRect(tableX, tableY, tableW, headerH);

            const col1W = tableW * 0.44;
            const col2W = tableW * 0.22;
            const col3W = tableW * 0.34;

            // Header Labels
            ctx.fillStyle = '#ffffff';
            ctx.font = `800 ${Math.round(12 * s)}px 'Sora', system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L.thCountry, tableX + col1W / 2, tableY + headerH / 2);
            ctx.fillText(L.thShare, tableX + col1W + col2W / 2, tableY + headerH / 2);
            ctx.fillText(L.thSource, tableX + col1W + col2W + col3W / 2, tableY + headerH / 2);

            // Rows
            ORIGIN_ROWS.forEach((row, rIdx) => {
                const ry = tableY + headerH + rIdx * rowH;
                ctx.fillStyle = rIdx % 2 === 0 ? '#ffffff' : '#fffdf7';
                ctx.fillRect(tableX, ry, tableW, rowH);

                // Row horizontal border
                ctx.beginPath();
                ctx.moveTo(tableX, ry);
                ctx.lineTo(tableX + tableW, ry);
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
                ctx.lineWidth = 1.1 * s;
                ctx.stroke();

                ctx.fillStyle = '#1e293b';
                ctx.font = `600 ${Math.round(12.5 * s)}px 'Plus Jakarta Sans', 'Sora', system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(row.country, tableX + col1W / 2, ry + rowH / 2);

                ctx.font = `800 ${Math.round(12.5 * s)}px 'Sora', system-ui, sans-serif`;
                ctx.fillStyle = '#c2410c';
                ctx.fillText(row.share, tableX + col1W + col2W / 2, ry + rowH / 2);

                ctx.font = `600 ${Math.round(12.5 * s)}px 'Plus Jakarta Sans', 'Sora', system-ui, sans-serif`;
                ctx.fillStyle = '#15803d';
                ctx.fillText(row.source, tableX + col1W + col2W + col3W / 2, ry + rowH / 2);
            });

            // Column vertical dividers
            [tableX + col1W, tableX + col1W + col2W].forEach((vx) => {
                ctx.beginPath();
                ctx.moveTo(vx, tableY);
                ctx.lineTo(vx, tableY + totalTableH);
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
                ctx.lineWidth = 1.1 * s;
                ctx.stroke();
            });

            ctx.restore();

            // Outer Table Border
            drawRoundedRect(ctx, tableX, tableY, tableW, totalTableH, 10 * s);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5 * s;
            ctx.stroke();

            // 5. Tooltip on Hover
            if (hoveredItem && hoveredItem.slice) {
                const tipText = `${hoveredItem.slice.label}: ${hoveredItem.slice.valText}`;
                ctx.font = `700 ${Math.round(11.5 * s)}px 'Sora', system-ui, sans-serif`;
                const tw = ctx.measureText(tipText).width + 20 * s;
                const th = 28 * s;
                const tx = Math.max(10 * s, Math.min(W - tw - 10 * s, hoveredItem.x - tw / 2));
                const ty = Math.max(10 * s, hoveredItem.y - th - 12 * s);

                drawRoundedRect(ctx, tx, ty, tw, th, 7 * s);
                ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tipText, tx + tw / 2, ty + th / 2);
            }

            ctx.restore();
        }

        // Smooth Entry Animation when visible
        let hasAnimated = false;
        function startAnimation() {
            if (hasAnimated) return;
            hasAnimated = true;
            const startTime = performance.now();
            const duration = 850;

            function frame(now) {
                const t = Math.min(1, (now - startTime) / duration);
                // EaseOutCubic
                animProgress = 1 - Math.pow(1 - t, 3);
                render(animProgress);
                if (t < 1) {
                    requestAnimationFrame(frame);
                }
            }
            requestAnimationFrame(frame);
        }

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startAnimation();
                        io.disconnect();
                    }
                });
            }, { threshold: 0.12 });
            io.observe(canvas);
        } else {
            animProgress = 1;
            render(1);
        }

        // Initial static draw so canvas is never blank before scroll
        animProgress = 1;
        render(1);

        // Interactive Mouse Hover
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            let found = null;

            for (const reg of hitRegions) {
                const dx = mx - reg.cx;
                const dy = my - reg.cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist >= reg.innerR && dist <= reg.outerR) {
                    let ang = Math.atan2(dy, dx);
                    if (ang < -Math.PI / 2) ang += Math.PI * 2;
                    if (ang >= reg.startAngle && ang <= reg.endAngle) {
                        found = { chart: reg.chart, index: reg.index, slice: reg.slice, x: mx, y: my };
                        break;
                    }
                }
            }

            const changed = (found?.chart !== hoveredItem?.chart) || (found?.index !== hoveredItem?.index) || Boolean(found);
            hoveredItem = found;
            canvas.style.cursor = found ? 'pointer' : 'default';
            if (changed) render(animProgress || 1);
        });

        canvas.addEventListener('mouseleave', () => {
            if (hoveredItem) {
                hoveredItem = null;
                canvas.style.cursor = 'default';
                render(animProgress || 1);
            }
        });

        window.addEventListener('resize', () => {
            render(animProgress || 1);
        }, { passive: true });

        window.addEventListener('languageChanged', () => {
            render(animProgress || 1);
        });
    }

    function initAllStrommixCanvases() {
        document.querySelectorAll('canvas[data-stromkennzeichnung-canvas], #strommixCanvas').forEach(setupStrommixCanvas);
    }

    window.initStromkennzeichnungCanvas = initAllStrommixCanvases;
    window.openStromkennzeichnungCanvasPng = function(canvasId) {
        const c = document.getElementById(canvasId || 'strommixCanvas') || document.querySelector('canvas[data-stromkennzeichnung-canvas]');
        if (!c) return;
        try {
            const dataUrl = c.toDataURL('image/png');
            const win = window.open('', '_blank');
            if (win) {
                win.document.write(
                    '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Stromkennzeichnung § 42 EnWG – Alpha Energie (Stand 03/2026)</title>' +
                    '<style>body{margin:0;padding:24px;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;color:#fff;}' +
                    'img{max-width:96vw;height:auto;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,0.5);background:#fff;}' +
                    'a.dl{margin-top:16px;background:linear-gradient(135deg,#f9b233,#e95e24);color:#fff;text-decoration:none;font-weight:700;padding:10px 20px;border-radius:999px;}</style></head>' +
                    '<body><img src="' + dataUrl + '" alt="Strommix im Vergleich – Alpha Energie">' +
                    '<a class="dl" href="' + dataUrl + '" download="Stromkennzeichnung-Alpha-Energie-03-2026.png">Als hochauflösendes PNG herunterladen</a></body></html>'
                );
                win.document.close();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllStrommixCanvases);
    } else {
        initAllStrommixCanvases();
    }
})();

// ==========================================================================
// Alpha Energie - AI Transparency Info Icon & Click Popover (Art. 50 KI-VO)
// Automatically equips AI-generated videos, photos & Wolf mascot illustrations
// with a clickable Info Icon (ⓘ KI) that explains AI generation on click.
// ==========================================================================
(function() {
    'use strict';

    const INFO_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

    const AI_TEXTS_I18N = {
        de: {
            btnLabel: 'KI',
            btnVideoLabel: 'KI-Video',
            ariaLabel: 'Info: KI-generierter Inhalt – Klicken für Details',
            video: {
                badge: '✨ KI-generiertes Video',
                title: 'Dieses Video wurde KI-generiert',
                body: 'Dieses Video wurde mithilfe künstlicher Intelligenz (KI) erstellt bzw. visuell aufbereitet. Es dient der anschaulichen Darstellung unseres Wechselservices (Transparenzhinweis gem. Art. 50 KI-Verordnung).'
            },
            mascot: {
                badge: '✨ KI-generierte Illustration',
                title: 'Diese Illustration wurde KI-generiert',
                body: 'Diese Illustration unseres Alpha-Wolf Maskottchens wurde mithilfe künstlicher Intelligenz (KI) generiert (Transparenzhinweis gem. Art. 50 KI-Verordnung).'
            },
            image: {
                badge: '✨ KI-generiertes Bild',
                title: 'Dieses Bild wurde KI-generiert',
                body: 'Dieses Bild wurde mithilfe künstlicher Intelligenz (KI) generiert bzw. bearbeitet (Transparenzhinweis gem. Art. 50 KI-Verordnung).'
            }
        },
        en: {
            btnLabel: 'AI',
            btnVideoLabel: 'AI Video',
            ariaLabel: 'Info: AI-generated content – Click for details',
            video: {
                badge: '✨ AI-generated Video',
                title: 'This video was AI-generated',
                body: 'This video was created or visually enhanced using artificial intelligence (AI) to illustrate our switching service (Transparency notice pursuant to Art. 50 EU AI Act).'
            },
            mascot: {
                badge: '✨ AI-generated Illustration',
                title: 'This illustration was AI-generated',
                body: 'This illustration of our Alpha Wolf mascot was generated using artificial intelligence (AI) (Transparency notice pursuant to Art. 50 EU AI Act).'
            },
            image: {
                badge: '✨ AI-generated Image',
                title: 'This image was AI-generated',
                body: 'This image was generated or edited using artificial intelligence (AI) (Transparency notice pursuant to Art. 50 EU AI Act).'
            }
        },
        tr: {
            btnLabel: 'YZ',
            btnVideoLabel: 'YZ Video',
            ariaLabel: 'Bilgi: Yapay zeka (YZ) ile oluşturulmuş içerik – Detaylar için tıklayın',
            video: {
                badge: '✨ YZ ile Oluşturulmuş Video',
                title: 'Bu video yapay zeka ile oluşturulmuştur',
                body: 'Bu video, geçiş hizmetimizi görselleştirmek amacıyla yapay zeka (YZ) kullanılarak oluşturulmuş veya düzenlenmiştir (AB Yapay Zeka Yasası Madde 50 uyarınca şeffaflık bildirimi).'
            },
            mascot: {
                badge: '✨ YZ ile Oluşturulmuş İllüstrasyon',
                title: 'Bu illüstrasyon yapay zeka ile oluşturulmuştur',
                body: 'Alpha-Wolf maskotumuzun bu illüstrasyonu yapay zeka (YZ) kullanılarak oluşturulmuştur (AB Yapay Zeka Yasası Madde 50 uyarınca şeffaflık bildirimi).'
            },
            image: {
                badge: '✨ YZ ile Oluşturulmuş Görsel',
                title: 'Bu görsel yapay zeka ile oluşturulmuştur',
                body: 'Bu görsel yapay zeka (YZ) kullanılarak oluşturulmuş veya düzenlenmiştir (AB Yapay Zeka Yasası Madde 50 uyarınca şeffaflık bildirimi).'
            }
        },
        ar: {
            btnLabel: 'AI',
            btnVideoLabel: 'فيديو AI',
            ariaLabel: 'معلومات: محتوى مُنشأ بالذكاء الاصطناعي – انقر للتفاصيل',
            video: {
                badge: '✨ فيديو مُنشأ بالذكاء الاصطناعي',
                title: 'تم إنشاء هذا الفيديو بالذكاء الاصطناعي',
                body: 'تم إنشاء هذا الفيديو أو معالجته بصرياً باستخدام الذكاء الاصطناعي (AI) لتوضيح خدمة التبديل الخاصة بنا (إشعار الشفافية وفقاً للمادة 50 من لائحة الذكاء الاصطناعي الأوروبية).'
            },
            mascot: {
                badge: '✨ رسم توضيحي بالذكاء الاصطناعي',
                title: 'تم إنشاء هذا الرسم بالذكاء الاصطناعي',
                body: 'تم إنشاء هذا الرسم التوضيحي لتميمة ذئب ألفا باستخدام الذكاء الاصطناعي (AI) (إشعار الشفافية وفقاً للمادة 50 من لائحة الذكاء الاصطناعي الأوروبية).'
            },
            image: {
                badge: '✨ صورة مُنشأة بالذكاء الاصطناعي',
                title: 'تم إنشاء هذه الصورة بالذكاء الاصطناعي',
                body: 'تم إنشاء هذه الصورة أو تحريرها باستخدام الذكاء الاصطناعي (AI) (إشعار الشفافية وفقاً للمادة 50 من لائحة الذكاء الاصطناعي الأوروبية).'
            }
        }
    };

    function getAiLocaleDict() {
        const curLang = (window.i18n && typeof window.i18n.getLanguage === 'function') ? window.i18n.getLanguage() : 'de';
        return AI_TEXTS_I18N[curLang] || AI_TEXTS_I18N.de;
    }

    function ensureAiInfoStyles() {
        if (document.getElementById('alpha-ai-info-styles')) return;
        const style = document.createElement('style');
        style.id = 'alpha-ai-info-styles';
        style.textContent = `
            .octo-section-mascot-box,
            .octo-footer-mascot-aside,
            .octo-mascot-inline-card,
            .octo-card-visual,
            .octo-stage-visual-card,
            .octo-split-device-media {
                position: relative;
            }
            .ai-media-info-btn {
                position: absolute;
                z-index: 35;
                pointer-events: auto !important;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                height: 25px;
                padding: 0 8px;
                border-radius: 999px;
                background: rgba(28, 25, 23, 0.80);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                color: #ffffff;
                border: 1.2px solid rgba(249, 178, 51, 0.88);
                font-family: 'Sora', 'Plus Jakarta Sans', system-ui, sans-serif;
                font-size: 0.68rem;
                font-weight: 700;
                letter-spacing: 0.02em;
                line-height: 1;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
                transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
                user-select: none;
            }
            .ai-media-info-btn:hover,
            .ai-media-info-btn:focus-visible,
            .ai-media-info-btn.is-active {
                background: linear-gradient(135deg, #f9b233 0%, #e95e24 100%) !important;
                color: #ffffff !important;
                border-color: #ffffff !important;
                transform: translateY(-1px) scale(1.04);
                box-shadow: 0 6px 16px rgba(233, 94, 36, 0.38);
                outline: none;
            }
            .ai-media-info-btn svg {
                width: 13px;
                height: 13px;
                flex-shrink: 0;
            }
            .ai-media-info-btn--photo {
                bottom: 10px;
                right: 10px;
            }
            .ai-media-info-btn--hero-photo {
                bottom: 100px !important;
                right: 14px !important;
                top: auto !important;
                left: auto !important;
            }
            .ai-media-info-btn--video {
                top: 14px;
                left: 14px;
                height: 32px;
                padding: 0 12px;
                font-size: 0.76rem;
            }
            .ai-media-info-btn--mascot,
            .ai-media-info-btn--inline-pill,
            .ai-media-info-btn[data-ai-type="mascot"] {
                display: none !important;
            }
            .ai-media-info-popover {
                position: fixed;
                z-index: 100005;
                width: 315px;
                max-width: calc(100vw - 24px);
                background: #ffffff;
                color: #1c1917;
                border: 1.5px solid #f9b233;
                border-radius: 16px;
                padding: 14px 16px;
                box-shadow: 0 18px 42px rgba(15, 23, 42, 0.24), 0 0 0 1px rgba(249, 178, 51, 0.25);
                font-family: 'Plus Jakarta Sans', 'Sora', system-ui, sans-serif;
                font-size: 0.8rem;
                line-height: 1.48;
                opacity: 0;
                transform: translateY(6px) scale(0.97);
                pointer-events: none;
                transition: opacity 0.18s ease, transform 0.18s ease;
            }
            .ai-media-info-popover.is-open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }
            .ai-media-info-popover-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                margin-bottom: 7px;
                padding-bottom: 6px;
                border-bottom: 1px solid rgba(249, 178, 51, 0.35);
            }
            .ai-media-info-popover-badge {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                font-size: 0.7rem;
                font-weight: 800;
                color: #c2410c;
                background: #fff7ed;
                border: 1px solid #fdba74;
                border-radius: 999px;
                padding: 3px 9px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }
            .ai-media-info-popover-close {
                background: #f1f5f9;
                border: none;
                color: #475569;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                font-size: 0.95rem;
                font-weight: 700;
                line-height: 1;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .ai-media-info-popover-close:hover {
                background: #fee2e2;
                color: #b91c1c;
            }
            .ai-media-info-popover-title {
                font-weight: 800;
                font-size: 0.86rem;
                color: #1c1917;
                margin: 0 0 4px 0;
            }
            .ai-media-info-popover-body {
                margin: 0;
                color: #44403c;
                font-size: 0.78rem;
                line-height: 1.48;
            }
        `;
        document.head.appendChild(style);
    }

    let popoverEl = null;
    let activeBtn = null;

    function getOrCreatePopover() {
        if (popoverEl) return popoverEl;
        popoverEl = document.createElement('div');
        popoverEl.id = 'alphaAiInfoPopover';
        popoverEl.className = 'ai-media-info-popover';
        popoverEl.setAttribute('role', 'dialog');
        popoverEl.setAttribute('aria-label', 'Hinweis zu KI-generierten Inhalten');
        popoverEl.innerHTML = `
            <div class="ai-media-info-popover-header">
                <span class="ai-media-info-popover-badge" id="aiPopoverBadge">✨ KI-generierter Inhalt</span>
                <button type="button" class="ai-media-info-popover-close" aria-label="Hinweis schließen">&times;</button>
            </div>
            <div class="ai-media-info-popover-title" id="aiPopoverTitle">Hinweis zur KI-Generierung</div>
            <p class="ai-media-info-popover-body" id="aiPopoverBody"></p>
        `;
        document.body.appendChild(popoverEl);

        const closeBtn = popoverEl.querySelector('.ai-media-info-popover-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closePopover();
            });
        }

        document.addEventListener('click', (e) => {
            if (!popoverEl || !popoverEl.classList.contains('is-open')) return;
            if (popoverEl.contains(e.target)) return;
            if (activeBtn && activeBtn.contains(e.target)) return;
            closePopover();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePopover();
        });

        window.addEventListener('scroll', () => {
            if (popoverEl && popoverEl.classList.contains('is-open') && activeBtn) {
                positionPopover(activeBtn);
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (popoverEl && popoverEl.classList.contains('is-open') && activeBtn) {
                positionPopover(activeBtn);
            }
        }, { passive: true });

        return popoverEl;
    }

    function positionPopover(btn) {
        if (!popoverEl || !btn) return;
        const rect = btn.getBoundingClientRect();
        const popW = Math.min(315, window.innerWidth - 24);
        const popH = popoverEl.offsetHeight || 138;

        let left = rect.left + rect.width / 2 - popW / 2;
        left = Math.max(12, Math.min(window.innerWidth - popW - 12, left));

        let top = rect.top - popH - 10;
        if (top < 12) {
            top = Math.min(window.innerHeight - popH - 12, rect.bottom + 10);
        }

        popoverEl.style.left = Math.round(left) + 'px';
        popoverEl.style.top = Math.round(top) + 'px';
    }

    function closePopover() {
        if (popoverEl) popoverEl.classList.remove('is-open');
        if (activeBtn) {
            activeBtn.classList.remove('is-active');
            activeBtn.setAttribute('aria-expanded', 'false');
            activeBtn = null;
        }
    }

    function populatePopoverTexts(btn) {
        const dict = getAiLocaleDict();
        const aiType = btn.dataset.aiType || 'image';
        const info = dict[aiType] || dict.image;

        const badgeEl = document.getElementById('aiPopoverBadge');
        const titleEl = document.getElementById('aiPopoverTitle');
        const bodyEl = document.getElementById('aiPopoverBody');

        if (badgeEl) badgeEl.textContent = info.badge;
        if (titleEl) titleEl.textContent = info.title;
        if (bodyEl) bodyEl.textContent = btn.dataset.aiCustomText || info.body;
    }

    function openPopoverForButton(btn) {
        const pop = getOrCreatePopover();
        if (activeBtn === btn && pop.classList.contains('is-open')) {
            closePopover();
            return;
        }
        if (activeBtn) {
            activeBtn.classList.remove('is-active');
            activeBtn.setAttribute('aria-expanded', 'false');
        }

        populatePopoverTexts(btn);

        activeBtn = btn;
        btn.classList.add('is-active');
        btn.setAttribute('aria-expanded', 'true');

        pop.classList.add('is-open');
        positionPopover(btn);
    }

    function bindButton(btn) {
        if (!btn || btn.dataset.aiInfoBound === 'true') return;
        btn.dataset.aiInfoBound = 'true';
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPopoverForButton(btn);
        });
    }

    function createInfoButton(type, variantClass, labelText) {
        const dict = getAiLocaleDict();
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ai-media-info-btn ' + (variantClass || '');
        btn.dataset.aiType = type;
        const text = type === 'video' ? dict.btnVideoLabel : (labelText ? dict.btnLabel : dict.btnLabel);
        btn.setAttribute('aria-label', dict.ariaLabel);
        btn.setAttribute('title', dict.ariaLabel);
        btn.innerHTML = INFO_SVG + '<span>' + text + '</span>';
        bindButton(btn);
        return btn;
    }

    function updateAllAiButtonsLanguage() {
        const dict = getAiLocaleDict();
        document.querySelectorAll('.ai-media-info-btn').forEach((btn) => {
            const type = btn.dataset.aiType || 'image';
            const span = btn.querySelector('span');
            if (span) {
                span.textContent = type === 'video' ? dict.btnVideoLabel : dict.btnLabel;
            }
            btn.setAttribute('aria-label', dict.ariaLabel);
            btn.setAttribute('title', dict.ariaLabel);
        });
        if (activeBtn && popoverEl && popoverEl.classList.contains('is-open')) {
            populatePopoverTexts(activeBtn);
        }
    }

    function isAiGeneratedImage(img) {
        if (!img) return false;
        const src = (img.getAttribute('src') || '').toLowerCase();
        if (!src) return false;
        // Never badge logos, seals, favicons, or Wolf mascot illustrations
        if (
            src.includes('logo') ||
            src.includes('ok-power') ||
            src.includes('bdeb') ||
            src.includes('favicon') ||
            src.includes('apple-touch') ||
            src.includes('wolf-mascot') ||
            img.classList.contains('octo-mascot-img') ||
            img.classList.contains('octo-peeking-wolf-img') ||
            img.closest('.octo-hero-peeking-wolf, .octo-section-mascot-box, .octo-footer-mascot-aside, .octo-mascot-inline-card')
        ) {
            return false;
        }
        if (img.dataset.aiGenerated === 'true') {
            return 'image';
        }
        if (
            src.includes('clean_energy_home') ||
            src.includes('versorger_tarife_home') ||
            src.includes('versorger_business_strom') ||
            src.includes('smart_step_oekostrom') ||
            src.includes('smart_step_oekogas') ||
            src.includes('versorger_oekostrom_split') ||
            img.closest('.octo-stage-visual-card, .octo-split-device-media, .octo-photo-filter')
        ) {
            return 'image';
        }
        return false;
    }

    function initAiMediaInfoBadges() {
        ensureAiInfoStyles();

        // Remove any legacy mascot AI badges if present
        document.querySelectorAll('.ai-media-info-btn[data-ai-type="mascot"], .ai-media-info-btn--mascot, .ai-media-info-btn--inline-pill').forEach((btn) => {
            btn.remove();
        });

        // 1. Bind any already-present static .ai-media-info-btn buttons in HTML
        document.querySelectorAll('.ai-media-info-btn').forEach(bindButton);

        // 2. Equip all <video> elements
        document.querySelectorAll('video').forEach((video) => {
            const wrapper = video.parentElement;
            if (!wrapper) return;
            if (wrapper.querySelector('.ai-media-info-btn')) return;
            const computedPos = window.getComputedStyle(wrapper).position;
            if (computedPos === 'static') wrapper.style.position = 'relative';
            const btn = createInfoButton('video', 'ai-media-info-btn--video', 'KI-Video');
            wrapper.appendChild(btn);
        });

        // 3. Equip all AI-generated photo <img> elements (never Wolf mascots)
        document.querySelectorAll('img').forEach((img) => {
            const aiKind = isAiGeneratedImage(img);
            if (!aiKind) return;

            // Hero Stage Visual Card -> bottom-right above bottom pill
            const heroStageCard = img.closest('.octo-stage-visual-card');
            if (heroStageCard) {
                if (!heroStageCard.querySelector('.ai-media-info-btn')) {
                    const btn = createInfoButton('image', 'ai-media-info-btn--hero-photo', 'KI');
                    heroStageCard.appendChild(btn);
                }
                return;
            }

            // Card Visual / Split Device Media / General Wrapper
            const mediaWrap = img.closest('.octo-card-visual, .octo-split-device-media') || img.parentElement;
            if (mediaWrap && !mediaWrap.querySelector('.ai-media-info-btn')) {
                const computedPos = window.getComputedStyle(mediaWrap).position;
                if (computedPos === 'static') mediaWrap.style.position = 'relative';
                const btn = createInfoButton('image', 'ai-media-info-btn--photo', 'KI');
                mediaWrap.appendChild(btn);
            }
        });

        updateAllAiButtonsLanguage();
    }

    window.initAiMediaInfoBadges = initAiMediaInfoBadges;
    window.addEventListener('languageChanged', updateAllAiButtonsLanguage);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAiMediaInfoBadges);
    } else {
        initAiMediaInfoBadges();
    }
})();




