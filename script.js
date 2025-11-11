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
const nextButton = document.getElementById('next-page-button');
const backToVideoButton = document.getElementById('back-to-video-button');
const muteVideoScreenButton = document.getElementById('mute-unmute-video-screen');
const muteMainContentButton = document.getElementById('mute-unmute-main-content');
const backToEntranceButton = document.getElementById('back-to-entrance-button');

// --- INITIAL SETUP ---
body.classList.add('no-scroll');
if (backToEntranceButton) {
    backToEntranceButton.title = "Go Back"; 
}

// --- CORE NAVIGATION FUNCTIONS ---

// P1 -> P2 (FIXED VERSION)
function navigateToVideoPage() {
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

// P3 -> P2
function navigateBackToVideo() {
    body.classList.add('no-scroll');
    mainContent.classList.remove('visible');
    mainContent.style.position = 'absolute';
    videoScreen.style.display = 'flex';

    setTimeout(() => {
        videoScreen.classList.add('active');
        weddingVideo.currentTime = 0;
        weddingVideo.play().catch(error => console.log("Video autoplay failed:", error));
    }, 100);
}

// P2 -> P1
function navigateBackToEntrance() {
    backgroundMusic.pause();
    weddingVideo.pause();
    videoScreen.classList.remove('active');

    setTimeout(() => {
        videoScreen.style.display = 'none';
        entranceScreen.classList.remove('hidden');
        body.classList.add('no-scroll');
    }, 1000); 
}


// --- MUSIC CONTROL FUNCTION ---
function toggleMusicMute() {
    isMusicMuted = !isMusicMuted;
    backgroundMusic.muted = isMusicMuted;

    const icon = isMusicMuted ? "🔇" : "🔊";
    const title = isMusicMuted ? "Unmute Music" : "Mute Music";

    muteVideoScreenButton.textContent = icon;
    muteVideoScreenButton.title = title;
    
    muteMainContentButton.textContent = icon;
    muteMainContentButton.title = title;
}

// --- EVENT LISTENERS ---
startButton.addEventListener('click', navigateToVideoPage);
nextButton.addEventListener('click', navigateToMainPage);
backToVideoButton.addEventListener('click', navigateBackToVideo);
muteVideoScreenButton.addEventListener('click', toggleMusicMute);
muteMainContentButton.addEventListener('click', toggleMusicMute);
backToEntranceButton.addEventListener('click', navigateBackToEntrance);

if (muteVideoScreenButton) {
    muteVideoScreenButton.textContent = "🔊";
    muteVideoScreenButton.title = "Mute Music";
}

// --- MAIN INITIALIZATION FUNCTION (Called when P3 becomes visible) ---
function initializeMainPage() {
    
    // 1. COUNTDOWN LOGIC ---
    // This is handled by the external Logwork script. (Unchanged)

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
}