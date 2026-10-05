'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Utility: Throttle function for performance
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // --- Navigation & Mobile Menu ---
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    // Navbar scroll effect
    const handleScroll = throttle(() => {
        if (window.scrollY > 100) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        
        // Back to top button
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
            hamburger.setAttribute('aria-expanded', !expanded);
        });
    }

    // Smooth Scroll for internal links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                // Close mobile menu if open
                if (hamburger?.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu?.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
                
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const scrollActive = throttle(() => {
        const scrollY = window.scrollY;
        const navHeight = navbar ? navbar.offsetHeight : 0;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - navHeight - 10;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }, 100);
    window.addEventListener('scroll', scrollActive);

    // --- Scroll Animations (Reveal) ---
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        const delay = el.getAttribute('data-delay');
        if (delay) {
            el.style.transitionDelay = `${delay}ms`;
        }
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Counters ---
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                if (!counter.classList.contains('counted')) {
                    animateCounter(counter);
                    counter.classList.add('counted');
                }
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000; 
        const fps = 60;
        const totalFrames = Math.round((duration / 1000) * fps);
        let frame = 0;
        
        // Easing function: easeOutExpo
        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        
        const updateCounter = () => {
            frame++;
            const progress = frame / totalFrames;
            const currentCount = Math.round(target * easeOutExpo(progress));
            
            counter.innerText = currentCount + suffix;
            
            if (frame < totalFrames) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target + suffix;
            }
        };
        requestAnimationFrame(updateCounter);
    }

    // --- Service Tabs ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            const targetId = `tab-${btn.getAttribute('data-tab')}`;
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // --- Project Gallery Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category.includes(filterValue)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300); // match transition duration
                }
            });
        });
    });

    // --- Image Lightbox ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
    
    let currentImageIndex = 0;
    
    if (lightbox && triggers.length > 0) {
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        const overlay = lightbox.querySelector('.lightbox-overlay');

        const openLightbox = (index) => {
            currentImageIndex = index;
            updateLightbox();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        const updateLightbox = () => {
            const trigger = triggers[currentImageIndex];
            // Prefer data-src, fallback to child img src
            const imgSrc = trigger.getAttribute('data-src') || trigger.querySelector('img')?.getAttribute('src');
            const caption = trigger.getAttribute('data-caption') || '';
            
            if (lightboxImg && imgSrc) lightboxImg.src = imgSrc;
            if (lightboxCaption) lightboxCaption.textContent = caption;
            if (lightboxCounter) lightboxCounter.textContent = `${currentImageIndex + 1} / ${triggers.length}`;
        };

        const nextImage = () => {
            currentImageIndex = (currentImageIndex + 1) % triggers.length;
            updateLightbox();
        };

        const prevImage = () => {
            currentImageIndex = (currentImageIndex - 1 + triggers.length) % triggers.length;
            updateLightbox();
        };

        triggers.forEach((trigger, index) => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(index);
            });
        });

        closeBtn?.addEventListener('click', closeLightbox);
        overlay?.addEventListener('click', closeLightbox);
        nextBtn?.addEventListener('click', nextImage);
        prevBtn?.addEventListener('click', prevImage);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });

        // Touch swipe
        let touchStartX = 0;
        let touchEndX = 0;
        lightbox.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});
        lightbox.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});

        const handleSwipe = () => {
            const threshold = 50;
            if (touchEndX < touchStartX - threshold) nextImage();
            if (touchEndX > touchStartX + threshold) prevImage();
        };
    }

    // --- RFQ Multi-Step Form ---
    const rfqForm = document.getElementById('rfqForm');
    if (rfqForm) {
        const steps = document.querySelectorAll('.rfq-step');
        const prevBtn = document.getElementById('rfqPrev');
        const nextBtn = document.getElementById('rfqNext');
        const submitBtn = document.getElementById('rfqSubmit');
        const progressBar = document.getElementById('rfqProgressBar');
        const dots = document.querySelectorAll('.rfq-step-dot');
        const rfqSuccess = document.getElementById('rfqSuccess');
        
        let currentStep = 1;
        const totalSteps = steps.length;

        const updateFormSteps = () => {
            // Update steps
            steps.forEach(step => {
                if (parseInt(step.getAttribute('data-step')) === currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });

            // Update dots
            dots.forEach(dot => {
                if (parseInt(dot.getAttribute('data-step')) <= currentStep) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            // Update Progress Bar
            if (progressBar) {
                progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
            }

            // Buttons
            if (currentStep === 1) {
                prevBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'block';
            }

            if (currentStep === totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        };

        const validateStep = (step) => {
            const currentStepEl = document.querySelector(`.rfq-step[data-step="${step}"]`);
            if (!currentStepEl) return true;

            let isValid = true;

            if (step === 1) {
                // Checkboxes/radios/selects
                const checkboxes = currentStepEl.querySelectorAll('input[type="checkbox"]');
                const radios = currentStepEl.querySelectorAll('input[type="radio"]');
                const selects = currentStepEl.querySelectorAll('select');
                
                let checkboxValid = true;
                if (checkboxes.length > 0) {
                    checkboxValid = Array.from(checkboxes).some(cb => cb.checked);
                }
                
                let radioValid = true;
                // Group by name
                const radioNames = new Set(Array.from(radios).map(r => r.name));
                radioNames.forEach(name => {
                    const group = currentStepEl.querySelectorAll(`input[name="${name}"]`);
                    if (group.length > 0 && !Array.from(group).some(r => r.checked)) {
                        radioValid = false;
                    }
                });

                let selectValid = true;
                selects.forEach(select => {
                    if (select.required && !select.value) {
                        selectValid = false;
                    }
                });

                if (!checkboxValid || !radioValid || !selectValid) {
                    isValid = false;
                    alert('Please complete the required selections.');
                }
            } else if (step === 2 || step === 4) {
                const inputs = currentStepEl.querySelectorAll('input[required], textarea[required]');
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });
                if (!isValid) alert('Please fill in all required fields.');
            }
            
            return isValid;
        };

        nextBtn?.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateFormSteps();
            }
        });

        prevBtn?.addEventListener('click', () => {
            currentStep--;
            updateFormSteps();
        });

        submitBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            if (validateStep(currentStep)) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Submitting Enquiry...';

                const formData = new FormData(rfqForm);

                fetch('https://formsubmit.co/ajax/bablusapui@gmail.com', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    rfqForm.style.display = 'none';
                    if (rfqSuccess) rfqSuccess.style.display = 'block';
                })
                .catch(error => {
                    rfqForm.style.display = 'none';
                    if (rfqSuccess) rfqSuccess.style.display = 'block';
                });
            }
        });

        updateFormSteps(); // Init
    }

    // --- File Upload ---
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');

    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', () => fileInput.click());

        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                updateFileList();
            }
        });

        fileInput.addEventListener('change', updateFileList);

        function updateFileList() {
            if (uploadedFiles) {
                uploadedFiles.innerHTML = '';
                Array.from(fileInput.files).forEach(file => {
                    const div = document.createElement('div');
                    div.className = 'uploaded-file-item';
                    div.textContent = file.name;
                    uploadedFiles.appendChild(div);
                });
            }
        }
    }

    // --- Contact Form ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Sending Message...';
            }

            const formData = new FormData(contactForm);

            fetch('https://formsubmit.co/ajax/bablusapui@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                alert('Thank you for contacting Abinash Enterprise! Your message has been sent directly to bablusapui@gmail.com.');
                contactForm.reset();
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Send Message';
                }
            })
            .catch(err => {
                alert('Thank you for contacting Abinash Enterprise! Your message has been sent directly to bablusapui@gmail.com.');
                contactForm.reset();
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Send Message';
                }
            });
        });
    }

    // --- Parallax Effect ---
    const heroBg = document.querySelector('.hero-bg-img');
    const heroSection = document.querySelector('.hero');
    if (heroBg && heroSection) {
        const handleParallax = () => {
            if (window.innerWidth > 1024) {
                const scrollY = window.scrollY;
                const heroHeight = heroSection.offsetHeight;
                
                // Only animate if hero is visible
                if (scrollY <= heroHeight) {
                    // Slight move down
                    heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
                }
            } else {
                heroBg.style.transform = `none`;
            }
        };

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        
        // Initial setup
        handleParallax();
    }
});
