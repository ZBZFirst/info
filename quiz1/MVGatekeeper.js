// MVGatekeeper.js - Enhanced Video Tracking
document.addEventListener('DOMContentLoaded', function() {
    console.log('[MVGatekeeper] Initializing...');
    
    // Configuration
    const config = {
        completionThreshold: 0.9, // 90% watched required
        progressUpdateInterval: 1000, // ms
        debugMode: true
    };

    // Enhanced state management
    const videoTracker = {
        players: [],
        videos: [],
        apiReady: false,
        
        // New: Track watched seconds precisely
        initVideoData: function(index, videoId) {
            this.videos[index] = {
                id: videoId,
                duration: 0,
                watchedSeconds: new Set(), // Track unique seconds watched
                state: 'uninitialized',
                completed: false,
                container: null,
                lastUpdate: null
            };
        },
        
        // New: Consolidated debug output
        getStatus: function() {
            return this.videos.map((video, index) => ({
                id: video.id,
                duration: video.duration,
                watched: video.watchedSeconds.size,
                completion: video.completed ? 'COMPLETE' : 'INCOMPLETE',
                state: video.state,
                progress: video.duration > 0 ? 
                    (video.watchedSeconds.size / video.duration * 100).toFixed(1) + '%' : '0%'
            }));
        }
    };

    // Initialize YouTube players
    function initializePlayers() {
        const containers = document.querySelectorAll('.embed-container');
        
        containers.forEach((container, index) => {
            const iframe = container.querySelector('iframe');
            if (!iframe) return;

            const videoId = extractVideoId(iframe.src);
            if (!videoId) return;

            // Initialize video tracking data
            videoTracker.initVideoData(index, videoId);
            videoTracker.videos[index].container = container;

            try {
                videoTracker.players[index] = new YT.Player(iframe, {
                    events: {
                        'onReady': (e) => onPlayerReady(e, index),
                        'onStateChange': (e) => onPlayerStateChange(e, index),
                        'onError': (e) => onPlayerError(e, index)
                    }
                });
            } catch (e) {
                console.error(`[Player ${index}] Initialization error:`, e);
            }
        });
    }

    // Enhanced player ready handler
    function onPlayerReady(event, index) {
        const player = event.target;
        const video = videoTracker.videos[index];
        
        try {
            video.duration = player.getDuration();
            video.state = getStateName(player.getPlayerState());
            video.lastUpdate = new Date().toISOString();
            
            // Disable user interaction with checkboxes
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) {
                checkbox.disabled = true; // Keep disabled until video starts
                checkbox.onclick = (e) => e.preventDefault(); // Prevent manual checking
            }
            
            startPreciseTracking(player, index);
            
            if (config.debugMode) {
                console.log(`[Player ${index}] Ready | Duration: ${video.duration}s`);
                console.table(videoTracker.getStatus());
            }
            
        } catch (e) {
            console.error(`[Player ${index}] Ready error:`, e);
        }
    }

    // New: Precise second-by-second tracking
    function startPreciseTracking(player, index) {
        const video = videoTracker.videos[index];
        let lastLoggedPercent = -1;
        
        const trackingInterval = setInterval(() => {
            try {
                const currentTime = Math.floor(player.getCurrentTime());
                const duration = video.duration;
                
                // Track each second only once
                if (currentTime > 0 && !video.watchedSeconds.has(currentTime)) {
                    video.watchedSeconds.add(currentTime);
                    video.lastUpdate = new Date().toISOString();
                    
                    // Calculate completion percentage
                    const percentWatched = video.watchedSeconds.size / duration;
                    const displayPercent = Math.floor(percentWatched * 100);
                    
                    // Update progress bar if exists
                    updateProgressBar(index, percentWatched);
                    
                    // Less frequent logging
                    if (displayPercent !== lastLoggedPercent && displayPercent % 10 === 0) {
                        console.log(`[Player ${index}] Progress: ${displayPercent}%`);
                        lastLoggedPercent = displayPercent;
                    }
                    
                    // Check for completion
                    if (!video.completed && percentWatched >= config.completionThreshold) {
                        markVideoComplete(index);
                        clearInterval(trackingInterval);
                    }
                }
                
            } catch (e) {
                console.error(`[Player ${index}] Tracking error:`, e);
                clearInterval(trackingInterval);
            }
        }, config.progressUpdateInterval);
        
        // Store interval for cleanup
        video.trackingInterval = trackingInterval;
    }

    // Improved completion handler
    function markVideoComplete(index) {
        const video = videoTracker.videos[index];
        video.completed = true;
        video.state = 'completed';
        
        const checkbox = document.getElementById(`video-check-${index+1}`);
        if (checkbox) {
            checkbox.checked = true;
            checkbox.disabled = true; // Keep disabled after completion
        }
        
        updateQuizButton();
        
        if (config.debugMode) {
            console.log(`[Player ${index}] Marked complete at ${video.watchedSeconds.size}/${video.duration}s`);
            console.table(videoTracker.getStatus());
        }
    }

    // State change handler
    function onPlayerStateChange(event, index) {
        const video = videoTracker.videos[index];
        video.state = getStateName(event.data);
        video.lastUpdate = new Date().toISOString();
        
        // Enable checkbox only when video starts playing
        if (event.data === YT.PlayerState.PLAYING) {
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) checkbox.disabled = false;
        }
        
        // Handle video ended
        if (event.data === YT.PlayerState.ENDED) {
            markVideoComplete(index);
        }
    }

    // Helper functions
    function updateProgressBar(index, percent) {
        const container = videoTracker.videos[index].container;
        if (!container) return;
        
        let progressBar = container.querySelector('.video-progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'video-progress-bar';
            container.appendChild(progressBar);
        }
        
        progressBar.style.width = `${percent * 100}%`;
    }

    function updateQuizButton() {
        const allCompleted = videoTracker.videos.every(v => v.completed);
        const quizButton = document.querySelector('.quiz-link[href="testquiz.html"]');
        
        if (quizButton) {
            quizButton.classList.toggle('disabled', !allCompleted);
            quizButton.style.pointerEvents = allCompleted ? 'auto' : 'none';
        }
    }

    // Initialize the tracker
    function checkYouTubeAPI() {
        if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
            videoTracker.apiReady = true;
            initializePlayers();
        } else {
            setTimeout(checkYouTubeAPI, 100);
        }
    }

    window.onYouTubeIframeAPIReady = function() {
        videoTracker.apiReady = true;
        initializePlayers();
    };

    // Start the tracking system
    checkYouTubeAPI();
});
