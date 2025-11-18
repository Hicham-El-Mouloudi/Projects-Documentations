document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 0. POPULATE BRIEF PROFILE
    // ==========================================
    if (typeof briefProfile !== 'undefined') {
        // Populate full profile content where present
        const fullProfileEl = document.getElementById('profile-content');
        if (fullProfileEl) fullProfileEl.textContent = briefProfile.content;
        const fullProfileLink = document.getElementById('profile-link');
        if (fullProfileLink) fullProfileLink.href = briefProfile.fullProfileLink;

        // Populate compact banner with full text (no truncation or toggle)
        const snippetEl = document.getElementById('profile-snippet');
        if (snippetEl) snippetEl.textContent = briefProfile.content;
    }

    // ==========================================
    // 1. POPULATE CURRENT STATUS
    // ==========================================
    if (typeof currentStatus !== 'undefined') {
        document.getElementById('status-text').textContent = currentStatus.title;
        document.getElementById('status-focus').innerHTML = `<strong>Focus:</strong> ${currentStatus.focus}`;
        document.getElementById('status-location').innerHTML = `<strong>Location:</strong> ${currentStatus.location}`;
    }

    // ==========================================
    // 2. POPULATE CERTIFICATIONS
    // ==========================================
    if (typeof certifications !== 'undefined') {
        const certificationsGrid = document.getElementById('certifications-grid');
        certificationsGrid.innerHTML = '';
        certifications.forEach(cert => {
            const badgeButton = cert.badge_url ? `<a href="${cert.badge_url}" target="_blank" class="btn-badge">View Badge</a>` : '';
            const certHtml = `
                <div class="certification-card">
                    <div class="cert-header">
                        <i class="fas fa-certificate"></i>
                        <h3>${cert.name}</h3>
                    </div>
                    <p class="cert-issuer">${cert.issuer}</p>
                    <p class="cert-date">${cert.date}</p>
                    ${badgeButton}
                </div>
            `;
            certificationsGrid.innerHTML += certHtml;
        });
    }

    // ==========================================
    // 3. THEME TOGGLE LOGIC
    // ==========================================
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('i');
    const body = document.body;

    // Check for saved user preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'dark') {
        body.classList.replace('light-theme', 'dark-theme');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeBtn.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.replace('light-theme', 'dark-theme');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('portfolio-theme', 'dark');
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('portfolio-theme', 'light');
        }
    });

    // ==========================================
    // 2. LANGUAGE REDIRECTION (Placeholder)
    // ==========================================
    const langLinks = document.querySelectorAll('.language-selector .control-btn');
    
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.textContent;
            console.log(`Language switched to: ${lang} (Redirection logic placeholder)`);
            // In a real app, you would redirect: window.location.href = `/${lang.toLowerCase()}/index.html`;
        });
    });


    // ==========================================
    // 5. CAROUSEL & SIDE VIEW LOGIC
    // ==========================================
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselTrack = document.getElementById('carousel-track');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    const sideViewContainer = document.getElementById('side-view-container');
    const timerDisplay = document.getElementById('timer');
    
    let currentIndex = 0;
    let totalSlides = 0;
    const SLIDE_DURATION = 5; // seconds
    let timeLeft = SLIDE_DURATION;
    let autoScrollInterval;
    let timerInterval;
    let isPaused = false;

    // Get the first 10 projects from the projects array
    let displayProjects = projects.slice(0, 10);
    totalSlides = displayProjects.length;

    // Dynamically generate carousel slides
    const generateCarouselSlides = () => {
        carouselTrack.innerHTML = '';
        displayProjects.forEach((project, index) => {
            const isActive = index === 0 ? 'active' : '';
            const slideHtml = `
                <div class="carousel-slide ${isActive}" data-id="${project.id}" style="background-image: url('${project.background}'); background-size: cover; background-position: right center;">
                    <div class="project-card background-style">
                        <div class="project-info overlay-content">
                            <h3>${project.title}</h3>
                            <p class="small-text">${project.description}</p>
                            <div class="tags small-tags">
                                ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                            </div>
                            <a href="${project.details_url}" class="btn-primary small-btn">View Details</a> 
                        </div>
                    </div>
                </div>
            `;
            carouselTrack.innerHTML += slideHtml;
        });
    };

    // Initialize Indicators
    const createIndicators = () => {
        indicatorsContainer.innerHTML = '';
        displayProjects.forEach((_, index) => {
            const indicator = document.createElement('span');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.dataset.index = index;
            indicator.addEventListener('click', () => {
                goToSlide(index);
                resetTimer();
            });
            indicatorsContainer.appendChild(indicator);
        });
    };
    
    // Core Navigation Logic
    const goToSlide = (index) => {
        // Handle wrapping around
        if (index < 0) {
            index = totalSlides - 1;
        } else if (index >= totalSlides) {
            index = 0;
        }

        currentIndex = index;
        const offset = -currentIndex * 100;
        carouselTrack.style.transform = `translateX(${offset}%)`;

        updateIndicators();
        updateSideView(); 
    };

    const updateIndicators = () => {
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    };

    // Update Side View Cards
    const updateSideView = () => {
        const sideViewProjects = [];
        
        // Find the next 3 projects to display in the side panel
        for (let i = 1; i <= 3; i++) {
            // Calculate the index of the next project, wrapping around
            const nextIndex = (currentIndex + i) % totalSlides;
            sideViewProjects.push(displayProjects[nextIndex]);
        }

        sideViewContainer.innerHTML = ''; // Clear previous content

        sideViewProjects.forEach(project => {
            // Use project background for the small card and add a bg-image class
            const bgStyle = project.background ? `background-image: url('${project.background}'); background-size: cover; background-position: center;` : '';
            const hasBgClass = project.background ? 'bg-image' : '';
            const cardHtml = `
                <div class="small-view-card ${hasBgClass}" data-id="${project.id}" style="${bgStyle}">
                    <div class="small-icon">
                        <i class="fas fa-image"></i>
                    </div>
                    <div class="small-content">
                        <h4>${project.title}</h4>
                        <a href="${project.details_url}" class="btn-text-sm">View Details <i class="fas fa-arrow-right" style="font-size: 0.7em;"></i></a>
                    </div>
                </div>
            `;
            sideViewContainer.innerHTML += cardHtml;
        });
    };
    
    // Auto-scroll and Timer Logic
    const startAutoScroll = () => {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            if (!isPaused) {
                goToSlide(currentIndex + 1);
                resetTimer();
            }
        }, SLIDE_DURATION * 1000);
    };

    const startTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isPaused) {
                timeLeft--;
                timerDisplay.textContent = `${timeLeft}s`;

                if (timeLeft <= 0) {
                    // goToSlide is handled by the autoScrollInterval when it fires
                    // We only need to reset the timer here
                    resetTimer(); 
                }
            }
        }, 1000); // Update every second
    };

    const resetTimer = () => {
        timeLeft = SLIDE_DURATION;
        timerDisplay.textContent = `${timeLeft}s`;
    };

    // Event Listeners for Buttons
    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        resetTimer();
    });

    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        resetTimer();
    });

    // Pause on Hover (Mouse Enter / Leave)
    carouselContainer.addEventListener('mouseenter', () => {
        isPaused = true;
        timerDisplay.textContent = "Paused"; // Optional visual feedback
    });

    carouselContainer.addEventListener('mouseleave', () => {
        isPaused = false;
        timerDisplay.textContent = `${timeLeft}s`; // Restore time display
    });
    
    // Add click listener to small side cards to jump to that slide
    sideViewContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.small-view-card');
        if (card) {
            // Prevent navigating if the 'View Details' link was clicked
            if (e.target.closest('.btn-text-sm')) return; 

            // Otherwise, jump to the project slide
            const projectId = parseInt(card.dataset.id);
            const index = displayProjects.findIndex(p => p.id === projectId);
            if (index !== -1) {
                goToSlide(index);
                resetTimer();
            }
        }
    });

    // Initialization
    generateCarouselSlides();
    createIndicators();
    goToSlide(0); // Initial display
    startAutoScroll();
    startTimer();
});