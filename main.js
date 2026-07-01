document.addEventListener("DOMContentLoaded", () => {
    // 1. Sticky Header Effect
    const header = document.getElementById("main-header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.style.background = "rgba(255, 255, 255, 0.95)";
            header.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.1)";
        } else {
            header.style.background = "rgba(255, 255, 255, 0.85)";
            header.style.boxShadow = "none";
        }
    });

    // 2. Prepare elements for scroll animation
    const animateElements = document.querySelectorAll(
        ".card, .feature-box, .news-card, .section-title, .section-text, .section-subtitle, .about-content"
    );
    
    animateElements.forEach((el) => {
        el.classList.add("animate-on-scroll");
    });

    // 3. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve after animating to only animate once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Start observing elements
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => observer.observe(el));
    
    // 4. Hero Content initial animation (slide from left to right)
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
    
    // 5. Typewriter Effect for Hero Title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        const cursor = document.createElement('span');
        cursor.textContent = '|';
        cursor.style.animation = 'blink 1s step-end infinite';
        cursor.style.fontWeight = '300';
        cursor.style.opacity = '0.7';
        
        let i = 0;
        
        // Wait for the hero fade-in to complete
        setTimeout(() => {
            const typeWriter = setInterval(() => {
                if (i < text.length) {
                    heroTitle.textContent = text.substring(0, i + 1);
                    heroTitle.appendChild(cursor);
                    i++;
                } else {
                    clearInterval(typeWriter);
                    // Fade out cursor after done
                    setTimeout(() => {
                        cursor.style.transition = 'opacity 1s ease';
                        cursor.style.opacity = '0';
                    }, 3000);
                }
            }, 60);
        }, 600);
    }
});
