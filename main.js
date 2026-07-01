document.addEventListener("DOMContentLoaded", () => {
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
    
    // 5. Typewriter Effect (HTML-Aware)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        // Split the original HTML content by <br> tags to type line-by-line
        const lines = heroTitle.innerHTML.split(/<br\s*\/?>/i);
        heroTitle.innerHTML = '';
        
        const cursor = document.createElement('span');
        cursor.textContent = '|';
        cursor.style.animation = 'blink 1s step-end infinite';
        cursor.style.fontWeight = '300';
        cursor.style.opacity = '0.7';
        cursor.style.marginLeft = '2px';
        
        let currentLine = 0;
        let currentChar = 0;
        
        function typeWriter() {
            if (currentLine < lines.length) {
                const lineText = lines[currentLine];
                if (currentChar < lineText.length) {
                    if (cursor.parentNode) {
                        cursor.remove();
                    }
                    
                    // Rebuild typed content with line breaks
                    let typedHTML = '';
                    for (let l = 0; l < currentLine; l++) {
                        typedHTML += lines[l] + '<br>';
                    }
                    typedHTML += lineText.substring(0, currentChar + 1);
                    heroTitle.innerHTML = typedHTML;
                    
                    heroTitle.appendChild(cursor);
                    currentChar++;
                    setTimeout(typeWriter, 50); // Speed of typing characters
                } else {
                    currentLine++;
                    currentChar = 0;
                    setTimeout(typeWriter, 120); // Pause between lines
                }
            } else {
                // Done typing, fade out cursor
                setTimeout(() => {
                    cursor.style.transition = 'opacity 1s ease';
                    cursor.style.opacity = '0';
                }, 2000);
            }
        }
        
        // Start typing after initial fade-in
        setTimeout(typeWriter, 400);
    }

    // 6. Mobile Menu Toggle
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

    // 7. Mobile Dropdown Toggle
    const navItems = document.querySelectorAll('.nav-item.has-dropdown');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                // Prevent link follow if clicking on the main item to open dropdown
                if (e.target === item.firstElementChild) {
                    e.preventDefault();
                    item.classList.toggle('active');
                }
            }
        });
    });
});
