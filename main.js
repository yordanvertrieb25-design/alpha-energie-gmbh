document.addEventListener("DOMContentLoaded", async () => {
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


    // 4. Video Mute Toggle Logic
    const muteToggleBtn = document.getElementById('mute-toggle-btn');
    const introVideo = document.getElementById('intro-video');
    
    const svgUnmuted = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill="white" d="M11 5L6 9H2v6h4l5 4V5z"/><path stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15.54 8.46a5 5 0 0 1 0 7.07 M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    const svgMuted = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill="white" d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="3" y1="3" x2="21" y2="21" stroke="#ff3b30" stroke-width="2.5" stroke-linecap="round"/></svg>`;
    
    if (muteToggleBtn && introVideo) {
        muteToggleBtn.addEventListener('click', () => {
            if (introVideo.muted) {
                introVideo.muted = false;
                document.getElementById('mute-icon').innerHTML = svgUnmuted;
            } else {
                introVideo.muted = true;
                document.getElementById('mute-icon').innerHTML = svgMuted;
            }
        });
    }


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
                    input.style.borderColor = "#10b981";
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

                // Send to Backend API
                fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: fullNameVal,
                        email: emailVal,
                        phone: phoneVal,
                        experience: experienceVal
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
                            input.style.borderColor = "#10b981";
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
                        input.style.borderColor = "#10b981";
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
            animateNumber(sofortProv, sofort);
            animateNumber(gesamtProv, gesamt);
            
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
