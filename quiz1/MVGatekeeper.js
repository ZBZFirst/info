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

// Add debug state function
function debugState() {
    return {
        time: new Date().toISOString(),
        players: videoPlayers.players.map((p, i) => ({
            index: i,
            ready: !!p?.getDuration,
            state: videoPlayers.status[i]?.state,
            videoId: videoPlayers.status[i]?.videoId
        })),
        readyCount: videoPlayers.readyCount,
        initialized: videoPlayers.initialized,
        apiLoaded: videoPlayers.apiLoaded
    };
}

// 1. First add the missing extractVideoId function
function extractVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// 2. Add the missing onPlayerStateChange handler
function onPlayerStateChange(event, index) {
    console.log(`Player ${index} state changed:`, event.data);
    // States: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=video cued
    if (event.data === YT.PlayerState.ENDED) {
        markVideoAsComplete(index);
    }
}

// Enhanced initialization with debug
function initializeVideoTracking() {
    if (videoPlayers.initialized) return;
    
    console.log('Initializing video tracking', debugState());
    
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.error('YouTube API not available', debugState());
        showFallbackMessage();
        enableManualCompletion();
        return;
    }

    videoPlayers.initialized = true;
    initYouTubePlayers();
}


function initYouTubePlayers() {
    console.log('Initializing players', debugState());
    const videoContainers = document.querySelectorAll('.embed-container');
    
    // Check if YouTube API is properly loaded
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.error('YouTube API not properly loaded', {
            YT: typeof YT,
            Player: typeof YT?.Player,
            loaded: YT?.loaded
        });
        showFallbackMessage();
        enableManualCompletion();
        return;
    }

    videoContainers.forEach((container, index) => {
        const iframe = container.querySelector('iframe');
        if (!iframe) {
            console.error('No iframe found in container', {
                index: index,
                container: container,
                html: container.innerHTML
            });
            handlePlayerError(index);
            return;
        }

        // Ensure iframe has proper attributes
        if (!iframe.hasAttribute('allow')) {
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        }

        const videoId = extractVideoId(iframe.src);
        if (!videoId) {
            console.error('Could not extract video ID from iframe', {
                index: index,
                src: iframe.src,
                iframe: iframe.outerHTML
            });
            handlePlayerError(index);
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
            container: container,
            lastUpdate: new Date().toISOString()
        };

        try {
            console.log(`Creating player ${index}`, {
                videoId: videoId,
                iframeId: iframe.id,
                iframeSrc: iframe.src,
                container: container
            });

            // Create new player with enhanced parameters
            videoPlayers.players[index] = new YT.Player(iframe, {  // Pass iframe element directly
                videoId: videoId,
                height: iframe.height || '100%',
                width: iframe.width || '100%',
                playerVars: {
                    'enablejsapi': 1,
                    'origin': window.location.origin,
                    'controls': 1,
                    'rel': 0,
                    'autoplay': 0,
                    'html5': 1,
                    'fs': 1,
                    'playsinline': 1
                },
                events: {
                    'onReady': (event) => {
                        console.log(`Player ${index} onReady event received`, {
                            event: event,
                            playerState: event.target.getPlayerState(),
                            videoUrl: event.target.getVideoUrl(),
                            timestamp: new Date().toISOString()
                        });
                        onPlayerReady(event, index);
                    },
                    'onStateChange': (event) => {
                        console.log(`Player ${index} state changed to ${event.data}`, {
                            event: event,
                            timestamp: new Date().toISOString()
                        });
                        onPlayerStateChange(event, index);
                    },
                    'onError': (event) => {
                        console.error(`Player ${index} encountered error ${event.data}`, {
                            event: event,
                            errorCode: event.data,
                            timestamp: new Date().toISOString()
                        });
                        onPlayerError(event, index);
                    }
                }
            });

            // Add diagnostic checks
            const diagnosticInterval = setInterval(() => {
                try {
                    const player = videoPlayers.players[index];
                    if (player && typeof player.getPlayerState === 'function') {
                        const state = player.getPlayerState();
                        console.log(`Player ${index} diagnostic check`, {
                            state: state,
                            ready: !!player.getDuration,
                            timestamp: new Date().toISOString()
                        });
                        
                        // Clear interval if player becomes ready
                        if (state !== YT.PlayerState.UNSTARTED) {
                            clearInterval(diagnosticInterval);
                        }
                    }
                } catch (e) {
                    console.error(`Player ${index} diagnostic check failed`, e);
                    clearInterval(diagnosticInterval);
                }
            }, 2000);

            // Store interval for cleanup
            videoPlayers.status[index].diagnosticInterval = diagnosticInterval;

        } catch (e) {
            console.error(`Failed to initialize player ${index}`, {
                error: e,
                stack: e.stack,
                iframe: iframe.outerHTML,
                videoId: videoId,
                timestamp: new Date().toISOString()
            });
            handlePlayerError(index);
        }
    });

    // Add global error listener
    window.addEventListener('error', (event) => {
        console.error('Global error occurred', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
    });
}


// Enhanced player ready handler
function onPlayerReady(event, index) {
    console.log(`Player ${index} ready`, debugState());
    const player = event.target;
    videoPlayers.readyCount++;
    clearTimeout(fallbackTimeout);

    try {
        const duration = player.getDuration();
        console.log(`Player ${index} duration: ${duration}s`);
        
        if (duration > 0) {
            videoPlayers.status[index].duration = duration;
            videoPlayers.status[index].state = 'ready';
            startProgressTracking(player, index);
        }
    } catch (e) {
        console.error(`Duration check failed for player ${index}`, e);
    }
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

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded', debugState());
    
    fallbackTimeout = setTimeout(() => {
        console.warn('Fallback triggered', debugState());
        if (!videoPlayers.initialized || videoPlayers.readyCount === 0) {
            console.error('Activating fallback mode', debugState());
            showFallbackMessage();
            enableManualCompletion();
        }
    }, 10000);
    
    if (window.YT?.loaded) {
        initializeVideoTracking();
    }
});

window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API ready', debugState());
    videoPlayers.apiLoaded = true;
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeVideoTracking();
    }
};




