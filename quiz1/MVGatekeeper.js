document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false, element: null },
        { id: 'PnH4ExmrIV4', completed: false, element: null },
        { id: 'ytD4F0awEKc', completed: false, element: null },
        { id: 'phbpRBO9Rkk', completed: false, element: null }
    ];
    
    let scrolledToBottom = false;
    let trackers = [];

    // Method 1: YouTube Iframe API
    function initializeYouTubeAPI() {
        window.onYouTubeIframeAPIReady = function() {
            console.log('YouTube API ready');
            
            videos.forEach((video, index) => {
                if (!video.element) return;
                
                try {
                    const player = new YT.Player(video.element, {
                        events: {
                            'onReady': (event) => onPlayerReady(event, index),
                            'onStateChange': (event) => onPlayerStateChange(event, index)
                        }
                    });
                    video.player = player;
                    console.log(`YouTube API player initialized for Video ${index+1}`);
                } catch (e) {
                    console.error(`Error initializing YouTube API player for Video ${index+1}:`, e);
                    setupFallbackTracking(index);
                }
            });
        };
        
        // Load YouTube API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }

    function onPlayerReady(event, index) {
        console.log(`Player ${index+1} ready`);
        videos[index].duration = event.target.getDuration();
        trackers[index] = setInterval(() => trackProgress(index), 1000);
    }

    function onPlayerStateChange(event, index) {
        const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
        console.log(`Player ${index+1} state: ${states[event.data]}`);
        
        if (event.data === YT.PlayerState.ENDED) {
            completeVideo(index);
        }
    }

    function trackProgress(index) {
        try {
            const currentTime = videos[index].player.getCurrentTime();
            const duration = videos[index].duration || videos[index].player.getDuration();
            
            console.log(`Video ${index+1} progress: ${currentTime.toFixed(1)}/${duration.toFixed(1)}`);
            
            if (currentTime / duration >= 0.95) {
                completeVideo(index);
            }
        } catch (e) {
            console.error(`Error tracking progress for Video ${index+1}:`, e);
            setupFallbackTracking(index);
        }
    }

    // Method 2: Fallback DOM observation
    function setupFallbackTracking(index) {
        if (videos[index].fallbackSetup) return;
        videos[index].fallbackSetup = true;
        
        console.log(`Setting up fallback tracking for Video ${index+1}`);
        
        trackers[index] = setInterval(() => {
            if (videos[index].completed) return;
            
            try {
                const iframe = videos[index].element;
                const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                // Check 1: Replay button visible
                const replayButton = innerDoc.querySelector('.ytp-replay-button');
                if (replayButton && getComputedStyle(replayButton).display !== 'none') {
                    console.log(`Video ${index+1} completed (replay button visible)`);
                    completeVideo(index);
                    return;
                }
                
                // Check 2: Progress bar completion
                const progressBar = innerDoc.querySelector('.ytp-progress-bar');
                if (progressBar) {
                    const current = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
                    const total = parseInt(progressBar.getAttribute('aria-valuemax') || '1');
                    
                    if (current >= total) {
                        console.log(`Video ${index+1} completed (progress bar)`);
                        completeVideo(index);
                        return;
                    }
                }
            } catch (e) {
                // CORS error, try next method
                setupPostMessageTracking(index);
            }
        }, 2000);
    }

    // Method 3: PostMessage communication
    function setupPostMessageTracking(index) {
        if (videos[index].postMessageSetup) return;
        videos[index].postMessageSetup = true;
        
        console.log(`Setting up postMessage tracking for Video ${index+1}`);
        
        window.addEventListener('message', function onMessage(event) {
            try {
                if (event.source !== videos[index].element.contentWindow) return;
                
                const data = JSON.parse(event.data);
                if (data && data.info && data.info.currentTime && data.info.duration) {
                    const progress = data.info.currentTime / data.info.duration;
                    if (progress >= 0.95) {
                        console.log(`Video ${index+1} completed (postMessage)`);
                        completeVideo(index);
                        window.removeEventListener('message', onMessage);
                    }
                }
            } catch (e) {
                // Invalid message
            }
        });
        
        // Regularly send requests for progress updates
        trackers[index] = setInterval(() => {
            try {
                videos[index].element.contentWindow.postMessage(
                    '{"event":"command","func":"getCurrentTime","args":""}', 
                    '*'
                );
            } catch (e) {
                console.error(`Error with postMessage for Video ${index+1}:`, e);
            }
        }, 1500);
    }

    function completeVideo(index) {
        if (videos[index].completed) return;
        
        console.log(`Completing Video ${index+1}`);
        videos[index].completed = true;
        
        // Clear any tracking interval
        if (trackers[index]) {
            clearInterval(trackers[index]);
        }
        
        // Update UI
        const checkbox = document.getElementById(`video-check-${index+1}`);
        if (checkbox) {
            checkbox.checked = true;
        }
        
        const card = videos[index].element.closest('.resource-card');
        if (card) {
            card.classList.add('video-completed');
        }
        
        checkAllCompleted();
    }

    // Scroll tracking
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            scrolledToBottom = true;
            checkAllCompleted();
        }
    });

    function checkAllCompleted() {
        const allVideosCompleted = videos.every(v => v.completed);
        console.log(`All videos completed: ${allVideosCompleted}, Scrolled to bottom: ${scrolledToBottom}`);
        
        if (allVideosCompleted && scrolledToBottom) {
            enableQuizLinks();
        }
    }

    function enableQuizLinks() {
        console.log('Enabling quiz links');
        document.querySelectorAll('.quiz-link').forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
            link.style.cursor = 'pointer';
        });
    }

    // Initialize
    function initialize() {
        // Get all video iframes
        document.querySelectorAll('.embed-container iframe').forEach((iframe, index) => {
            if (index >= videos.length) return;
            
            videos[index].element = iframe;
            videos[index].checkbox = document.getElementById(`video-check-${index+1}`);
            
            console.log(`Initialized tracking for Video ${index+1}`);
        });
        
        // Try YouTube API first
        initializeYouTubeAPI();
        
        // Fallback to other methods if API fails
        setTimeout(() => {
            videos.forEach((video, index) => {
                if (!video.player) {
                    setupFallbackTracking(index);
                }
            });
        }, 3000);
    }

    // Start initialization after short delay
    setTimeout(initialize, 1000);
});
