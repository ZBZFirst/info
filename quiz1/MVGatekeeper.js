// MVGatekeeper.js - YouTube Video Tracking
document.addEventListener('DOMContentLoaded', function() {
    console.log('MVGatekeeper.js initialized');
    
    // Global state object
    const videoTracker = {
        players: [],
        videoData: [],
        apiReady: false,
        initialized: false,
        
        // Debugging function
        debug: function() {
            return {
                apiReady: this.apiReady,
                initialized: this.initialized,
                players: this.players.map(p => p ? 'loaded' : 'null'),
                videoData: this.videoData
            };
        }
    };

    // Extract YouTube video ID from URL
    function extractVideoId(url) {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Initialize all YouTube players
    function initializePlayers() {
        if (videoTracker.initialized) return;
        
        console.log('Initializing YouTube players', videoTracker.debug());
        
        const videoContainers = document.querySelectorAll('.embed-container');
        videoContainers.forEach((container, index) => {
            const iframe = container.querySelector('iframe');
            if (!iframe) {
                console.error(`No iframe found in container ${index}`);
                return;
            }

            const videoId = extractVideoId(iframe.src);
            if (!videoId) {
                console.error(`Could not extract video ID from iframe ${index}`);
                return;
            }

            // Store initial video data
            videoTracker.videoData[index] = {
                id: videoId,
                duration: 0,
                watched: 0,
                completed: false,
                container: container
            };

            // Create YouTube player
            try {
                videoTracker.players[index] = new YT.Player(iframe, {
                    events: {
                        'onReady': (event) => onPlayerReady(event, index),
                        'onStateChange': (event) => onPlayerStateChange(event, index),
                        'onError': (event) => onPlayerError(event, index)
                    }
                });
            } catch (e) {
                console.error(`Error creating player ${index}:`, e);
            }
        });

        videoTracker.initialized = true;
    }

    // Player ready handler
    function onPlayerReady(event, index) {
        const player = event.target;
        console.log(`Player ${index} ready`);
        
        try {
            const duration = player.getDuration();
            videoTracker.videoData[index].duration = duration;
            
            // Enable the corresponding checkbox
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) {
                checkbox.disabled = false;
                checkbox.dataset.videoDuration = duration;
            }
            
            // Start tracking progress
            startProgressTracking(player, index);
        } catch (e) {
            console.error(`Error getting video info for player ${index}:`, e);
        }
    }

    // Player state change handler
    function onPlayerStateChange(event, index) {
        console.log(`Player ${index} state changed:`, event.data);
        
        if (event.data === YT.PlayerState.ENDED) {
            markVideoComplete(index);
        }
    }

    // Player error handler
    function onPlayerError(event, index) {
        console.error(`Player ${index} error:`, event.data);
        
        // Enable checkbox manually in case of error
        const checkbox = document.getElementById(`video-check-${index+1}`);
        if (checkbox) checkbox.disabled = false;
    }

    // Mark video as complete
    function markVideoComplete(index) {
        if (index >= 0 && index < videoTracker.videoData.length) {
            videoTracker.videoData[index].completed = true;
            
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) checkbox.checked = true;
            
            updateQuizButton();
        }
    }

    // Update quiz button state based on completion
    function updateQuizButton() {
        const allCompleted = videoTracker.videoData.every(video => video.completed);
        const quizButton = document.querySelector('.quiz-link[href="testquiz.html"]');
        
        if (quizButton) {
            quizButton.classList.toggle('disabled', !allCompleted);
            quizButton.style.pointerEvents = allCompleted ? 'auto' : 'none';
        }
    }

    // Start tracking video progress
    function startProgressTracking(player, index) {
        const container = videoTracker.videoData[index].container;
        if (!container) return;

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'video-progress';
        
        const progressBarInner = document.createElement('div');
        progressBarInner.className = 'video-progress-bar';
        progressBar.appendChild(progressBarInner);
        container.appendChild(progressBar);

        // Update progress periodically
        const progressInterval = setInterval(() => {
            try {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                const percentWatched = (currentTime / duration) * 100;
                
                // Update progress bar
                progressBarInner.style.width = `${percentWatched}%`;
                videoTracker.videoData[index].watched = currentTime;
                
                // Check for completion (90% watched)
                if (!videoTracker.videoData[index].completed && percentWatched >= 90) {
                    markVideoComplete(index);
                    clearInterval(progressInterval);
                }
            } catch (e) {
                console.error(`Progress tracking error for player ${index}:`, e);
                clearInterval(progressInterval);
            }
        }, 1000);

        // Store interval ID for cleanup
        videoTracker.videoData[index].progressInterval = progressInterval;
    }

    // Fallback UI if YouTube API fails
    function showFallbackUI() {
        console.log('Showing fallback UI');
        
        // Enable all checkboxes
        document.querySelectorAll('.video-completion input').forEach(checkbox => {
            checkbox.disabled = false;
        });
        
        // Show message
        const fallbackMessage = document.createElement('div');
        fallbackMessage.className = 'yt-fallback-message';
        fallbackMessage.textContent = 'YouTube integration not available. Please mark videos manually.';
        document.body.prepend(fallbackMessage);
    }

    // Check if YouTube API is loaded
    function checkYouTubeAPI() {
        if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
            videoTracker.apiReady = true;
            initializePlayers();
        } else {
            // If not loaded after timeout, show fallback
            setTimeout(() => {
                if (!videoTracker.apiReady) {
                    console.warn('YouTube API not loaded after timeout');
                    showFallbackUI();
                }
            }, 5000);
        }
    }

    // YouTube API callback
    window.onYouTubeIframeAPIReady = function() {
        console.log('YouTube API ready');
        videoTracker.apiReady = true;
        initializePlayers();
    };

    // Start the process
    checkYouTubeAPI();
});
