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
        gsap.registerPlugin(ScrollTrigger);
        initGSAPAnimations();
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
                    e.preventDefault();
                    item.classList.toggle('active');
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
                        // The last point remains active and highlighted when scrolling further down
                        if (!isLast) {
                            block.classList.remove('active');
                        }
                    },
                    onLeaveBack: () => block.classList.remove('active')
                });

                gsap.fromTo(block.children,
                    { opacity: 0.15, x: -10 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        ease: "power1.out",
                        scrollTrigger: {
                            trigger: block,
                            start: "top 65%",
                            end: "bottom 35%",
                            toggleActions: isLast ? "play none none reverse" : "play reverse play reverse"
                        }
                    }
                );
            });

            function updateActiveMilestone(activeBlock, year) {
                milestones.forEach(m => m.classList.remove('active'));
                activeBlock.classList.add('active');
                
                if (currentYearEl && currentYearEl.textContent !== year) {
                    gsap.timeline()
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
                        errorDiv.textContent = rule.error;
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
                
                // Simulate AJAX submission with smooth success transition
                setTimeout(() => {
                    const successContainer = document.getElementById("form-success-container");
                    const successPhone = document.getElementById("success-phone");
                    const phoneInput = document.getElementById("phone");
                    
                    if (successPhone && phoneInput) {
                        successPhone.textContent = phoneInput.value;
                    }
                    
                    // Fade out form and fade in success container
                    partnerForm.style.transition = "opacity 0.3s ease";
                    partnerForm.style.opacity = "0";
                    setTimeout(() => {
                        partnerForm.style.display = "none";
                        if (successContainer) {
                            successContainer.style.display = "block";
                            successContainer.style.opacity = "0";
                            successContainer.style.transition = "opacity 0.3s ease";
                            setTimeout(() => {
                                successContainer.style.opacity = "1";
                            }, 50);
                        }
                    }, 300);
                }, 1000);
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
                                errorDiv.textContent = rule.error;
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
                            errorDiv.textContent = rule.error;
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
            const sofort = val * 150;
            const bestand = val * 12;
            const gesamt = Math.round(val * 24.50); // (val * 150 / 12) + (val * 12) = val * 24.5
            
            // Update displays with animation
            animateNumber(sofortProv, sofort);
            animateNumber(bestandsProv, bestand);
            animateNumber(gesamtProv, gesamt);
            
            // Update slider background track
            updateSliderTrack(calcSlider);
            
            // Update status progress bar and markers
            if (progressBar && statusBadge && nextBonusText) {
                const percentage = ((val - 5) / 95) * 100;
                progressBar.style.width = `${percentage}%`;
                
                const marker30 = document.querySelector('.status-step-marker.step-30');
                const marker70 = document.querySelector('.status-step-marker.step-70');
                
                if (marker30) {
                    if (val >= 30) marker30.classList.add('reached');
                    else marker30.classList.remove('reached');
                }
                
                if (marker70) {
                    if (val >= 70) marker70.classList.add('reached');
                    else marker70.classList.remove('reached');
                }
                
                statusBadge.className = 'status-tier-badge'; // reset classes
                
                if (val < 30) {
                    statusBadge.textContent = 'Einsteiger-Status';
                    statusBadge.classList.add('tier-einsteiger');
                    nextBonusText.innerHTML = 'Nächster Bonus ab <strong>30</strong> Verträgen!';
                } else if (val < 70) {
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
