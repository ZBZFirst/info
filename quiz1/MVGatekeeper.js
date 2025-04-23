// MVGatekeeper.js - Final Debugged Version
console.log('MVGatekeeper.js loaded - YT available:', typeof YT !== 'undefined');

const videoPlayers = {
    players: [],
    status: [],
    readyCount: 0,
    apiLoaded: false,
    initialized: false
};

let fallbackTimeout;

// Enhanced initialization with debug
function initializeVideoTracking() {
    if (videoPlayers.initialized) return;
    
    console.log('Initializing video tracking - YT state:', {
        YT_available: typeof YT !== 'undefined',
        YT_loaded: window.YT?.loaded,
        playersInitialized: videoPlayers.players.length,
        playersReady: videoPlayers.readyCount
    });
    
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.error('YouTube API not available after callback', {
            YT: typeof YT,
            Player: typeof YT?.Player
        });
        showFallbackMessage();
        enableManualCompletion();
        return;
    }

    videoPlayers.initialized = true;
    initYouTubePlayers();
}

// Enhanced player initialization
function initYouTubePlayers() {
    try {
        const videoContainers = document.querySelectorAll('.embed-container');
        console.log(`Found ${videoContainers.length} video containers`, videoContainers);
        
        if (videoContainers.length === 0) {
            console.error('No video containers found - check your HTML structure');
            showFallbackMessage();
            enableManualCompletion();
            return;
        }

        videoContainers.forEach((container, index) => {
            const iframe = container.querySelector('iframe');
            if (!iframe) {
                console.error(`No iframe found in container ${index}`, container);
                return;
            }

            const videoId = extractVideoId(iframe.src);
            if (!videoId) {
                console.error(`Could not extract video ID from iframe ${index}`, iframe.src);
                return;
            }

            if (!iframe.id) {
                iframe.id = `yt-player-${index}`;
            }

            videoPlayers.status[index] = {
                videoId: videoId,
                state: 'initializing',
                duration: 0,
                watchedSeconds: 0,
                completed: false,
                container: container
            };

            try {
                console.log(`Initializing player ${index} for video ${videoId}`, {
                    iframeId: iframe.id,
                    iframeSrc: iframe.src
                });
                
                videoPlayers.players[index] = new YT.Player(iframe.id, {
                    videoId: videoId,
                    playerVars: {
                        'enablejsapi': 1,
                        'origin': window.location.origin,
                        'controls': 1,
                        'rel': 0,
                        'autoplay': 0
                    },
                    events: {
                        'onReady': (event) => onPlayerReady(event, index),
                        'onStateChange': (event) => onPlayerStateChange(event, index),
                        'onError': (event) => onPlayerError(event, index)
                    }
                });
                
                console.log(`Player ${index} initialization attempted`);
            } catch (e) {
                console.error(`Failed to initialize player ${index}:`, e, {
                    iframe: iframe,
                    playerVars: {
                        'enablejsapi': 1,
                        'origin': window.location.origin
                    }
                });
                handlePlayerError(index);
            }
        });
    } catch (e) {
        console.error('Fatal error in initYouTubePlayers:', e);
        showFallbackMessage();
        enableManualCompletion();
    }
}

// Enhanced player ready handler
function onPlayerReady(event, index) {
    console.log(`Player ${index} ready event received`, event);
    const player = event.target;
    videoPlayers.readyCount++;
    
    clearTimeout(fallbackTimeout);
    console.log(`Cleared fallback timeout after player ${index} ready`);
    
    try {
        console.log(`Attempting to get duration for player ${index}`);
        const duration = player.getDuration();
        
        if (duration && duration > 0) {
            videoPlayers.status[index].duration = duration;
            videoPlayers.status[index].state = 'ready';
            console.log(`Player ${index} ready (${duration}s)`, {
                playerState: player.getPlayerState(),
                videoUrl: player.getVideoUrl()
            });
            
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) {
                checkbox.disabled = false;
                console.log(`Enabled checkbox for player ${index}`);
            }
            
            startProgressTracking(player, index);
            return;
        } else {
            console.warn(`Invalid duration (${duration}) for player ${index}`);
        }
    } catch (e) {
        console.error(`Error getting duration for player ${index}:`, e, {
            player: player,
            playerState: player?.getPlayerState?.()
        });
    }
    
    videoPlayers.status[index].state = 'ready';
    console.log(`Player ${index} ready (duration unknown)`);
}

// Enhanced fallback system
function setupFallback() {
    // Clear any existing timeout
    clearTimeout(fallbackTimeout);
    
    // Set new timeout with detailed debug
    fallbackTimeout = setTimeout(() => {
        console.warn('Fallback timeout reached - checking system state', {
            apiLoaded: videoPlayers.apiLoaded,
            initialized: videoPlayers.initialized,
            readyCount: videoPlayers.readyCount,
            players: videoPlayers.players.length,
            status: videoPlayers.status
        });
        
        if (!videoPlayers.initialized || videoPlayers.readyCount === 0) {
            console.warn('YouTube API not fully loaded - enabling manual completion', {
                YT: window.YT,
                players: videoPlayers.players,
                status: videoPlayers.status
            });
            showFallbackMessage();
            enableManualCompletion();
        }
    }, 10000); // Increased to 10s to allow more time for slow connections
    
    console.log('Fallback timeout set for 10 seconds');
}

// Modified API ready handler
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API ready callback - YT state:', {
        YT: typeof YT,
        Player: typeof YT?.Player,
        loaded: YT?.loaded,
        version: YT?.getApiVersion?.()
    });
    
    videoPlayers.apiLoaded = true;
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('DOM is ready - initializing video tracking');
        initializeVideoTracking();
    } else {
        console.log('Waiting for DOM to be ready');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - YT state:', {
        YT_available: typeof YT !== 'undefined',
        YT_loaded: window.YT?.loaded,
        YT_version: window.YT?.getApiVersion?.()
    });
    
    setupFallback();
    
    if (window.YT?.loaded) {
        console.log('API was loaded before DOM ready - initializing');
        initializeVideoTracking();
    }
});

// Add cleanup for page unload
window.addEventListener('beforeunload', () => {
    console.log('Page unloading - cleaning up');
    clearTimeout(fallbackTimeout);
    videoPlayers.status.forEach(status => {
        if (status.progressInterval) {
            clearInterval(status.progressInterval);
        }
    });
});
