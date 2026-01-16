// --- NEW PRELOADER LOGIC ---
const preloader = document.getElementById('preloader');

window.onload = function () {
    // Explicitly preload the heavy background image
    const bgImage = new Image();
    bgImage.src = 'Assets/hand.avif';

    bgImage.onload = function () {
        // Hide loader only after this specific image is ready (in addition to window.onload)
        preloader.classList.add('hidden');
    };

    bgImage.onerror = function () {
        console.warn("Background image failed to load, hiding preloader anyway.");
        preloader.classList.add('hidden');
    };

    // Safety timeout in case image loading hangs
    setTimeout(() => {
        if (!preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
        }
    }, 5000);
}
// --- END PRELOADER LOGIC ---

// --- CONFIGURATION ---
let isMusicMuted = false;

// --- ELEMENTS ---
const body = document.body;
const entranceScreen = document.getElementById('entrance-screen');
const videoScreen = document.getElementById('video-screen');
const mainContent = document.getElementById('main-content');
const weddingVideo = document.getElementById('wedding-video');
const backgroundMusic = document.getElementById('background-music');
const sections = document.querySelectorAll('section');

// Buttons
const startButton = document.getElementById('start-button');
const muteVideoScreenButton = document.getElementById('mute-unmute-video-screen');
const muteMainContentButton = document.getElementById('mute-unmute-main-content');
const exitMainContentButton = document.getElementById('exit-button-main');

// --- INITIAL SETUP ---
body.classList.add('no-scroll');

// --- CORE NAVIGATION FUNCTIONS ---

// P1 -> P2 (MODIFIED with NEW exit animation)
function navigateToVideoPage() {
    // --- NEW: Auto Fullscreen ---
    enterFullScreen();

    // --- NEW ANIMATION PART ---
    const elementsToAnimate = [
        entranceScreen.querySelector('h1'),
        entranceScreen.querySelector('p'),
        startButton,
        entranceScreen.querySelector('img[src="Assets/front.gif"]')
    ];
    elementsToAnimate.forEach(el => el && el.classList.add('exiting'));
    // --- END NEW PART ---

    // Delay the original navigation to let the new animation play
    setTimeout(() => {
        entranceScreen.classList.add('hidden');
        videoScreen.style.display = 'flex';

        setTimeout(() => {
            videoScreen.classList.add('active');
            mainContent.classList.remove('visible');
            mainContent.style.position = 'absolute';
        }, 100);

        setTimeout(() => {
            weddingVideo.style.display = 'block';
            backgroundMusic.muted = isMusicMuted;
            weddingVideo.muted = true;
            weddingVideo.currentTime = 0;

            backgroundMusic.play().catch(error => console.log("Music autoplay failed:", error));
            weddingVideo.play().catch(error => console.log("Video autoplay failed:", error));
        }, 100);
    }, 500); // 500ms matches the animation duration
}

// P2 -> P3
function navigateToMainPage() {
    weddingVideo.pause();
    videoScreen.classList.remove('active');

    setTimeout(() => {
        videoScreen.style.display = 'none';
        mainContent.style.position = 'static';
        mainContent.classList.add('visible');
        body.classList.remove('no-scroll');

        window.scrollTo(0, 0);
        initializeMainPage();
    }, 1000);
}




// --- MUSIC CONTROL FUNCTION ---
// --- MUSIC CONTROL FUNCTION ---
function toggleMusicMute() {
    isMusicMuted = !isMusicMuted;
    backgroundMusic.muted = isMusicMuted;

    const iconHTML = isMusicMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    const title = isMusicMuted ? "Unmute Music" : "Mute Music";

    muteVideoScreenButton.innerHTML = iconHTML;
    muteVideoScreenButton.title = title;

    muteMainContentButton.innerHTML = iconHTML;
    muteMainContentButton.title = title;
}

// --- EXIT FUNCTION ---
function exitExperience() {
    // 1. Exit Fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }

    // 2. Reload to go back to Home state
    window.location.reload();
}

// --- EVENT LISTENERS ---
const devSkipButton = document.getElementById('dev-skip-button'); // DEV SKIP
if (devSkipButton) devSkipButton.addEventListener('click', navigateToMainPage);

startButton.addEventListener('click', navigateToVideoPage);
weddingVideo.addEventListener('ended', navigateToMainPage); // ADDED: Auto-navigate when video ends
muteVideoScreenButton.addEventListener('click', toggleMusicMute);
muteMainContentButton.addEventListener('click', toggleMusicMute);
if (exitMainContentButton) exitMainContentButton.addEventListener('click', exitExperience);

if (muteVideoScreenButton) {
    muteVideoScreenButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    muteVideoScreenButton.title = "Mute Music";
}

// --- MAIN INITIALIZATION FUNCTION (Called when P3 becomes visible) ---
function initializeMainPage() {

    // 1. COUNTDOWN LOGIC (CUSTOM) ---
    const targetDate = new Date("April 15, 2026 00:00:00").getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById("countdown-timer").innerHTML = "<h3>The Big Day is Here!</h3>";
            return;
        }

        const daysStr = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const hoursStr = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutesStr = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const secondsStr = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');

        // Update Split Digits
        updateFlipCard("day-ten", daysStr[0]);
        updateFlipCard("day-one", daysStr[1]);

        updateFlipCard("hour-ten", hoursStr[0]);
        updateFlipCard("hour-one", hoursStr[1]);

        updateFlipCard("min-ten", minutesStr[0]);
        updateFlipCard("min-one", minutesStr[1]);

        updateFlipCard("sec-ten", secondsStr[0]);
        updateFlipCard("sec-one", secondsStr[1]);
    }

    function updateFlipCard(id, value) {
        const el = document.getElementById(id);
        if (el && el.innerText !== value) {
            el.innerText = value;
        }
    }

    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 2. SECTION ANIMATION (Intersection Observer)
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        // Reset styles for re-animation
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        sectionObserver.observe(section);
    });

    // 3. SCROLL HINT LOGIC
    const scrollHint = document.getElementById('scroll-hint-popup');
    if (scrollHint) {
        // Show immediately
        scrollHint.classList.add('visible');

        // Hide after 3 seconds
        setTimeout(() => {
            scrollHint.classList.remove('visible');
        }, 3000);
    }

    // 4. TIMELINE SCROLL ANIMATION (Re-triggers on scroll)
    const timelineItems = document.querySelectorAll('.timeline-item');

    const timelineObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% visible
    };

    const timelineObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                // Remove class when out of view to re-trigger animation
                entry.target.classList.remove('in-view');
            }
        });
    }, timelineObserverOptions);

    timelineItems.forEach(item => {
        timelineObserver.observe(item);
    });

    // 5. PROFILE ANIMATION (Same logic)
    const profileElements = document.querySelectorAll('.profile-name, .profile-hashtags, .name-slide-left, .name-slide-right');
    profileElements.forEach(el => {
        timelineObserver.observe(el);
    });

    // 5.1 FOOTER ANIMATION
    const footerText = document.querySelector('.thank-you-text');
    if (footerText) {
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    // Remove class to reset animation so it plays again next time
                    entry.target.classList.remove('visible');
                }
            });
        }, { threshold: 0.1 }); // Reduced threshold for easier triggering
        footerObserver.observe(footerText);
    }


    // 6. SWIPER INITIALIZATION (3D Carousel)
    var swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        loop: true,
        coverflowEffect: {
            rotate: 20,
            stretch: 0,
            depth: 350,
            modifier: 1,
            slideShadows: true,
            scale: 1,
        },
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
    });

    // 7. VIDEO SWIPER INITIALIZATION
    var videoSwiper = new Swiper(".videoSwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        rewind: true, // Use rewind instead of loop for video simplicity
        coverflowEffect: {
            rotate: 20,
            stretch: 0,
            depth: 350,
            modifier: 1,
            slideShadows: true,
            scale: 1,
        },
        // No autoplay for videos
    });

    // 8. VIDEO AUDIO MANAGEMENT (UPDATED)
    const videoWrappers = document.querySelectorAll('.video-wrapper');

    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        const overlay = wrapper.querySelector('.play-overlay');

        if (!video || !overlay) return;

        // Play Video on Overlay Click
        overlay.addEventListener('click', () => {
            // Pause all other videos first
            document.querySelectorAll('.videoSwiper video').forEach(v => {
                if (v !== video && !v.paused) {
                    v.pause();
                }
            });

            // Play this video
            video.controls = true; // Show native controls
            video.play().then(() => {
                overlay.classList.add('hidden'); // Hide overlay
            }).catch(e => console.log("Play failed", e));
        });

        // Video Events
        video.addEventListener('play', () => {
            // Mute Background Music
            if (!backgroundMusic.paused) {
                backgroundMusic.pause();
            }
            overlay.classList.add('hidden'); // Ensure hidden
        });

        video.addEventListener('pause', () => {
            video.controls = false; // Hide native controls
            overlay.classList.remove('hidden'); // Show overlay

            // Resume Music if all videos paused
            const allPaused = Array.from(document.querySelectorAll('.videoSwiper video')).every(v => v.paused);
            if (allPaused && !isMusicMuted) {
                backgroundMusic.play().catch(e => console.log("Bg music resume failed", e));
            }
        });

        video.addEventListener('ended', () => {
            video.controls = false;
            overlay.classList.remove('hidden');
            // Music resume handled by pause event usually, but redundancy is fine
        });
    });

    // 9. HEADER SCROLL LOGIC (Mute Button Visibility)
    const page3Controls = document.querySelector('.page3-controls');
    if (page3Controls) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                // If scrolled down more than 50px, fade out
                page3Controls.style.opacity = '0';
                page3Controls.style.transition = 'opacity 0.3s ease';
                // Also ensure buttons aren't clickable
                Array.from(page3Controls.children).forEach(child => child.style.pointerEvents = 'none');
            } else {
                // If at top, fade in
                page3Controls.style.opacity = '1';
                Array.from(page3Controls.children).forEach(child => child.style.pointerEvents = 'auto');
            }
        });
    }
}

// --- FULLSCREEN HELPER ---
function enterFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

// --- PARTICLE ANIMATION ---
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 1;
            this.speed = Math.random() * 0.5 + 0.2;
            this.alpha = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.y -= this.speed;
            if (this.y < 0) {
                this.y = h;
                this.x = Math.random() * w; // Re-randomize x to avoid streams
            }
        }
        draw() {
            // Darker theme color (Burgundy) for visibility on light background
            ctx.fillStyle = `rgba(140, 15, 95, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}