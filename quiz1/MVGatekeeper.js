// MVGatekeeper.js - Enhanced YouTube Video Tracking with Detailed Logging
document.addEventListener('DOMContentLoaded', function() {
    console.log('[MVGatekeeper] DOM Content Loaded - Initializing');
    
    // 1. First define storage helper functions
    const storage = {
        saveState: function(data) {
            try {
                localStorage.setItem('videoTracker', JSON.stringify(data));
                console.log('[MVGatekeeper] State saved to localStorage');
            } catch (e) {
                console.error('[MVGatekeeper] Error saving to localStorage:', e);
            }
        },
        loadState: function() {
            try {
                const data = localStorage.getItem('videoTracker');
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('[MVGatekeeper] Error loading from localStorage:', e);
                return null;
            }
        },
        clearState: function() {
            localStorage.removeItem('videoTracker');
        }
    };

    // 2. Then load saved state
    const savedState = storage.loadState();
    
    // 3. Now define videoTracker with initial data
    const videoTracker = {
        players: [],
        videoData: [],
        apiReady: false,
        initialized: false,
        
        // Enhanced debug function
        debug: function() {
            const playerStates = this.players.map((p, i) => {
                if (!p) return 'null';
                try {
                    return {
                        id: this.videoData[i]?.id || 'unknown',
                        state: p.getPlayerState ? getStateName(p.getPlayerState()) : 'unknown',
                        currentTime: p.getCurrentTime ? p.getCurrentTime() : 'unknown',
                        duration: p.getDuration ? p.getDuration() : 'unknown'
                    };
                } catch (e) {
                    return 'error:' + e.message;
                }
            });
            
            return {
                apiReady: this.apiReady,
                initialized: this.initialized,
                players: playerStates,
                videoData: this.videoData
            };
        }
    };

    // 4. Merge saved state after videoTracker is created
    if (savedState) {
        console.log('[MVGatekeeper] Loading saved state');
        // Initialize videoData with correct length first
        const videoContainers = document.querySelectorAll('.embed-container');
        videoTracker.videoData = Array(videoContainers.length).fill().map((_, index) => ({
            id: null,
            duration: 0,
            watched: 0,
            completed: false,
            container: null,
            firstReady: null,
            lastStateChange: null,
            stateHistory: []
        }));
        
        // Merge saved completed states
        savedState.forEach((savedVideo, index) => {
            if (index < videoTracker.videoData.length) {
                videoTracker.videoData[index].completed = savedVideo.completed;
                videoTracker.videoData[index].watched = savedVideo.watched || 0;
            }
        });
    
        // Initialize UI immediately with saved state
        initializeUIFromSavedState();
    }


    // Helper function to get state name
    function getStateName(stateCode) {
        const states = {
            [-1]: 'UNSTARTED',
            0: 'ENDED',
            1: 'PLAYING',
            2: 'PAUSED',
            3: 'BUFFERING',
            5: 'CUED'
        };
        return states[stateCode] || 'UNKNOWN';
    }

    // Update UI based on saved state
    function initializeUIFromSavedState() {
        console.log('[MVGatekeeper] Initializing UI from saved state');
        
        videoTracker.videoData.forEach((video, index) => {
            // Update checkboxes
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) {
                checkbox.checked = video.completed;
                checkbox.disabled = !video.completed;
            }
    
            // Find the progress container - updated selector
            const videoPlayer = document.querySelectorAll('.video-player')[index];
            if (!videoPlayer) return;
    
            const progressBar = videoPlayer.querySelector('.video-progress-bar');
            const progressText = videoPlayer.querySelector('.video-progress-text');
            const percentDisplay = videoPlayer.querySelector('.video-progress-percent');
            
            if (progressBar && progressText) {
                const percent = video.duration > 0 ? 
                    Math.min(100, (video.watched / video.duration) * 100) : 
                    (video.completed ? 100 : 0);
                
                progressBar.style.width = `${percent}%`;
                progressText.textContent = `${Math.round(percent)}% watched`;
                if (percentDisplay) {
                    percentDisplay.textContent = `${Math.round(percent)}%`;
                }
                
                if (video.completed) {
                    progressBar.classList.add('complete');
                }
            }
    
            // Update card styling
            if (video.completed) {
                videoPlayer.closest('.resource-card')?.classList.add('completed');
            }
        });
    
        updateQuizButton();
    }

    
    // Extract YouTube video ID from URL
    function extractVideoId(url) {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Initialize all YouTube players with enhanced logging
    function initializePlayers() {
        if (videoTracker.initialized) {
            console.log('[MVGatekeeper] Players already initialized');
            return;
        }
        
        console.log('[MVGatekeeper] Initializing YouTube players', videoTracker.debug());
        
        const videoContainers = document.querySelectorAll('.embed-container');
        console.log(`[MVGatekeeper] Found ${videoContainers.length} video containers`);
        
        videoContainers.forEach((container, index) => {
            const iframe = container.querySelector('iframe');
            if (!iframe) {
                console.error(`[MVGatekeeper] No iframe found in container ${index}`);
                return;
            }

            const videoId = extractVideoId(iframe.src);
            if (!videoId) {
                console.error(`[MVGatekeeper] Could not extract video ID from iframe ${index} with src: ${iframe.src}`);
                return;
            }

            // Store initial video data with timestamps
            videoTracker.videoData[index] = {
                id: videoId,
                duration: 0,
                watched: 0,
                completed: false,
                container: container,
                firstReady: null,
                lastStateChange: null,
                stateHistory: []
            };

            console.log(`[MVGatekeeper] Creating player ${index} for video ${videoId}`);
            
            // Create YouTube player with all event handlers
            try {
                videoTracker.players[index] = new YT.Player(iframe, {
                    events: {
                        'onReady': (event) => onPlayerReady(event, index),
                        'onStateChange': (event) => onPlayerStateChange(event, index),
                        'onError': (event) => onPlayerError(event, index),
                        'onPlaybackQualityChange': (event) => onPlaybackQualityChange(event, index),
                        'onPlaybackRateChange': (event) => onPlaybackRateChange(event, index),
                        'onApiChange': (event) => onApiChange(event, index)
                    }
                });
                
                // Additional event listeners using addEventListener
                setTimeout(() => {
                    if (videoTracker.players[index] && videoTracker.players[index].addEventListener) {
                        videoTracker.players[index].addEventListener('onStateChange', (event) => {
                            console.log(`[MVGatekeeper][Player ${index}] Additional State Change: ${getStateName(event.data)}`);
                        });
                    }
                }, 1000);
                
            } catch (e) {
                console.error(`[MVGatekeeper] Error creating player ${index}:`, e);
                videoTracker.videoData[index].error = e.message;
            }
        });

        videoTracker.initialized = true;
        console.log('[MVGatekeeper] Players initialization complete', videoTracker.debug());
    }

    // Enhanced player ready handler
    function onPlayerReady(event, index) {
        console.log(`[MVGatekeeper][Player ${index}] Ready event received`);
        const player = event.target;
        const now = new Date().toISOString();
        
        try {
            const duration = player.getDuration();
            const videoUrl = player.getVideoUrl();
            const embedCode = player.getVideoEmbedCode();
            
            console.log(`[MVGatekeeper][Player ${index}] Video details - Duration: ${duration}s, URL: ${videoUrl}`);
            
            // Update video data
            videoTracker.videoData[index].duration = duration;
            videoTracker.videoData[index].firstReady = now;
            videoTracker.videoData[index].lastStateChange = now;
            videoTracker.videoData[index].embedCode = embedCode;
            
            // Enable the corresponding checkbox
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) {
                checkbox.disabled = false;
                checkbox.dataset.videoDuration = duration;
                console.log(`[MVGatekeeper][Player ${index}] Enabled checkbox #${index+1}`);
            }
            
            // Start tracking progress
            startProgressTracking(player, index);
            
            console.log(`[MVGatekeeper][Player ${index}] Current player state: ${getStateName(player.getPlayerState())}`);
            
        } catch (e) {
            console.error(`[MVGatekeeper][Player ${index}] Error getting video info:`, e);
            videoTracker.videoData[index].error = e.message;
        }
    }

    // Enhanced state change handler with full logging
    function onPlayerStateChange(event, index) {
        const stateName = getStateName(event.data);
        const now = new Date().toISOString();
        
        // Record state change
        videoTracker.videoData[index].lastStateChange = now;
        videoTracker.videoData[index].stateHistory.push({
            time: now,
            state: stateName,
            data: event.data
        });
        
        console.log(`[MVGatekeeper][Player ${index}] State changed to: ${stateName} (${event.data})`);
        
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                console.log(`[MVGatekeeper][Player ${index}] Video started playing`);
                break;
            case YT.PlayerState.PAUSED:
                console.log(`[MVGatekeeper][Player ${index}] Video paused`);
                break;
            case YT.PlayerState.ENDED:
                console.log(`[MVGatekeeper][Player ${index}] Video ended`);
                markVideoComplete(index);
                break;
            case YT.PlayerState.BUFFERING:
                console.log(`[MVGatekeeper][Player ${index}] Video buffering`);
                break;
            case YT.PlayerState.CUED:
                console.log(`[MVGatekeeper][Player ${index}] Video cued`);
                break;
        }
    }

    // Enhanced error handler
    function onPlayerError(event, index) {
        const errorCodes = {
            2: 'Invalid parameter',
            5: 'HTML5 player error',
            100: 'Video not found',
            101: 'Embedding not allowed',
            150: 'Embedding not allowed (disguised)'
        };
        
        const errorMessage = errorCodes[event.data] || `Unknown error (${event.data})`;
        console.error(`[MVGatekeeper][Player ${index}] Player error: ${errorMessage}`);
        
        videoTracker.videoData[index].error = errorMessage;
        
        // Enable checkbox manually in case of error
        const checkbox = document.getElementById(`video-check-${index+1}`);
        if (checkbox) {
            checkbox.disabled = false;
            console.log(`[MVGatekeeper][Player ${index}] Enabled checkbox due to error`);
        }
    }

    // Additional event handlers with logging
    function onPlaybackQualityChange(event, index) {
        console.log(`[MVGatekeeper][Player ${index}] Playback quality changed to: ${event.data}`);
        videoTracker.videoData[index].lastQualityChange = {
            time: new Date().toISOString(),
            quality: event.data
        };
    }

    function onPlaybackRateChange(event, index) {
        console.log(`[MVGatekeeper][Player ${index}] Playback rate changed to: ${event.data}`);
        videoTracker.videoData[index].lastRateChange = {
            time: new Date().toISOString(),
            rate: event.data
        };
    }

    function onApiChange(event, index) {
        console.log(`[MVGatekeeper][Player ${index}] API change detected`);
        videoTracker.videoData[index].lastApiChange = new Date().toISOString();
    }

    // Mark video as complete with logging
    function markVideoComplete(index) {
        console.log(`[MVGatekeeper][Player ${index}] Marking video as complete`);
        
        if (index >= 0 && index < videoTracker.videoData.length) {
            videoTracker.videoData[index].completed = true;
            videoTracker.videoData[index].completedAt = new Date().toISOString();
            
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) {
                checkbox.checked = true;
                console.log(`[MVGatekeeper][Player ${index}] Checkbox #${index+1} checked`);
            }
            
            // Save the updated state
            storage.saveState(videoTracker.videoData.map(video => ({
                completed: video.completed,
                watched: video.watched
            })));
            
            updateQuizButton();
        }
    }

    // Update quiz button state based on completion
    function updateQuizButton() {
        const allCompleted = videoTracker.videoData.every(video => video.completed);
        const quizButtons = document.querySelectorAll('a[href="testquiz.html"], a[href="MVInteractive.html"]');
        
        console.log(`[MVGatekeeper] Updating ${quizButtons.length} quiz buttons. All videos completed: ${allCompleted}`);
        
        quizButtons.forEach(button => {
            button.classList.toggle('disabled', !allCompleted);
            button.style.pointerEvents = allCompleted ? 'auto' : 'none';
            console.log(`[MVGatekeeper] ${button.textContent.trim()} button state: ${allCompleted ? 'ENABLED' : 'DISABLED'}`);
        });
    }

    // Enhanced progress tracking with logging
    // Update the startProgressTracking function:
    function startProgressTracking(player, index) {
        console.log(`[MVGatekeeper][Player ${index}] Starting progress tracking`);
        
        const videoData = videoTracker.videoData[index];
        if (!videoData || !videoData.container) {
            console.error(`[MVGatekeeper][Player ${index}] No container found for progress tracking`);
            return;
        }
    
        // Find the progress container - updated selector
        const progressContainer = videoData.container.closest('.video-player')?.querySelector('.video-progress-container');
        if (!progressContainer) {
            console.error(`[MVGatekeeper][Player ${index}] No progress container found`);
            return;
        }
    
        const progressBar = progressContainer.querySelector('.video-progress-bar');
        const progressText = progressContainer.querySelector('.video-progress-text');
        const percentDisplay = progressContainer.querySelector('.video-progress-percent');
        
        if (!progressBar || !progressText) {
            console.error(`[MVGatekeeper][Player ${index}] Progress elements not found`);
            return;
        }
    
        console.log(`[MVGatekeeper][Player ${index}] Found progress elements`, {
            progressBar, progressText, percentDisplay
        });
    
        // Clear any existing interval
        if (videoData.progressInterval) {
            clearInterval(videoData.progressInterval);
        }
    
        // Update progress periodically
        videoData.progressInterval = setInterval(() => {
            try {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                const percentWatched = (currentTime / duration) * 100;
                
                // Update all progress elements
                progressBar.style.width = `${percentWatched}%`;
                progressText.textContent = `${Math.round(percentWatched)}% watched`;
                if (percentDisplay) {
                    percentDisplay.textContent = `${Math.round(percentWatched)}%`;
                }
                
                videoData.watched = currentTime;
                
                // Log progress every 10% or when significant changes occur
                if (percentWatched % 10 < 0.5 || 
                    (percentWatched > 85 && percentWatched % 5 < 0.5)) {
                    console.log(`[MVGatekeeper][Player ${index}] Progress: ${percentWatched.toFixed(1)}%`);
                }
                
                // Check for completion (90% watched)
                if (!videoData.completed && percentWatched >= 90) {
                    console.log(`[MVGatekeeper][Player ${index}] Reached 90% watched - marking complete`);
                    markVideoComplete(index);
                    clearInterval(videoData.progressInterval);
                }
            } catch (e) {
                console.error(`[MVGatekeeper][Player ${index}] Progress tracking error:`, e);
                clearInterval(videoData.progressInterval);
            }
        }, 1000);
    }

    // Fallback UI if YouTube API fails
    function showFallbackUI() {
        console.log('[MVGatekeeper] Showing fallback UI');
        
        // Enable all checkboxes
        document.querySelectorAll('.video-completion input').forEach(checkbox => {
            checkbox.disabled = false;
        });
        
        // Show message
        const fallbackMessage = document.createElement('div');
        fallbackMessage.className = 'yt-fallback-message';
        fallbackMessage.textContent = 'YouTube integration not available. Please mark videos manually.';
        document.body.prepend(fallbackMessage);
        
        console.log('[MVGatekeeper] Fallback UI activated');
    }

    // Check if YouTube API is loaded with timeout
    function checkYouTubeAPI() {
        console.log('[MVGatekeeper] Checking for YouTube API');
        
        if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
            console.log('[MVGatekeeper] YouTube API already loaded');
            videoTracker.apiReady = true;
            initializePlayers();
        } else {
            console.log('[MVGatekeeper] YouTube API not yet loaded - waiting');
            
            // If not loaded after timeout, show fallback
            setTimeout(() => {
                if (!videoTracker.apiReady) {
                    console.warn('[MVGatekeeper] YouTube API not loaded after timeout - activating fallback');
                    showFallbackUI();
                }
            }, 5000);
        }
    }

    // YouTube API callback with logging
    window.onYouTubeIframeAPIReady = function() {
        console.log('[MVGatekeeper] YouTube API ready callback received');
        videoTracker.apiReady = true;
        initializePlayers();
    };

    // Start the process
    console.log('[MVGatekeeper] Starting initialization process');
    checkYouTubeAPI();
});
