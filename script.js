// --- PRELOADER LOGIC ---
const preloader = document.getElementById('preloader');

function hidePreloader() {
    if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
    }
}

window.addEventListener('load', hidePreloader);
// Safety timeout in case any external widget delays load event
setTimeout(hidePreloader, 1500);
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

    // Stop background particle loop to free CPU & GPU
    if (typeof stopParticleAnimation === 'function') {
        stopParticleAnimation();
    }

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
const skipVideoBtn = document.getElementById('skip-video-btn');
if (skipVideoBtn) skipVideoBtn.addEventListener('click', navigateToMainPage);

startButton.addEventListener('click', navigateToVideoPage);
weddingVideo.addEventListener('ended', navigateToMainPage); // Auto-navigate when video ends
weddingVideo.addEventListener('click', navigateToMainPage); // Tap video to proceed
muteVideoScreenButton.addEventListener('click', toggleMusicMute);
muteMainContentButton.addEventListener('click', toggleMusicMute);
if (exitMainContentButton) exitMainContentButton.addEventListener('click', exitExperience);

if (muteVideoScreenButton) {
    muteVideoScreenButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    muteVideoScreenButton.title = "Mute Music";
}

// --- MAIN INITIALIZATION FUNCTION (Called when P3 becomes visible) ---
let isMainPageInitialized = false;
function initializeMainPage() {
    if (isMainPageInitialized) return;
    isMainPageInitialized = true;

    // 0. COUPLE NAMES ENTRANCE SLIDE (Plays dynamically when entering invitation)
    const brideEl = document.querySelector('.main-couple-title .name-slide-left');
    const groomEl = document.querySelector('.main-couple-title .name-slide-right');
    if (brideEl) {
        brideEl.style.animation = 'none';
        void brideEl.offsetWidth;
        brideEl.style.animation = 'slideInBride 1.2s cubic-bezier(0.25, 1, 0.5, 1) both, gradient-move 3.5s linear infinite';
    }
    if (groomEl) {
        groomEl.style.animation = 'none';
        void groomEl.offsetWidth;
        groomEl.style.animation = 'slideInGroom 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.15s both, gradient-move 3.5s linear infinite';
    }

    // 1. COUNTDOWN LOGIC (LogWork Widget handles countdown automatically)

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

    // 3. SCROLL HINT LOGIC: Show after 5 seconds only if user hasn't scrolled
    const scrollHint = document.getElementById('scroll-hint-popup');
    if (scrollHint) {
        let hasUserScrolled = false;
        let hintTimer = null;

        const onUserScroll = () => {
            if (window.scrollY > 20) {
                hasUserScrolled = true;
                if (hintTimer) {
                    clearTimeout(hintTimer);
                    hintTimer = null;
                }
                scrollHint.classList.remove('visible');
                window.removeEventListener('scroll', onUserScroll);
            }
        };

        // Listen for user scrolling
        window.addEventListener('scroll', onUserScroll, { passive: true });

        // Show after 5 seconds ONLY if user has not scrolled yet
        hintTimer = setTimeout(() => {
            if (!hasUserScrolled && window.scrollY <= 20) {
                scrollHint.classList.add('visible');

                // Auto-fade out after 4 seconds if user still remains idle
                setTimeout(() => {
                    scrollHint.classList.remove('visible');
                }, 4000);
            }
        }, 5000);
    }



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
    if (document.querySelector('.videoSwiper')) {
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
    }

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
        let isControlsHidden = false;
        window.addEventListener('scroll', () => {
            const shouldHide = window.scrollY > 50;
            if (shouldHide !== isControlsHidden) {
                isControlsHidden = shouldHide;
                page3Controls.style.opacity = shouldHide ? '0' : '1';
                page3Controls.style.pointerEvents = shouldHide ? 'none' : 'auto';
            }
        }, { passive: true });
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

    let isParticleAnimating = true;
    let animationFrameId = null;

    function animate() {
        if (!isParticleAnimating) return;
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    window.stopParticleAnimation = function () {
        isParticleAnimating = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    };
}