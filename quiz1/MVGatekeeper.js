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


// Enhanced player initialization
function initYouTubePlayers() {
    console.log('Initializing players', debugState());
    const videoContainers = document.querySelectorAll('.embed-container');
    
    videoContainers.forEach((container, index) => {
        const iframe = container.querySelector('iframe');
        if (!iframe) {
            console.error('No iframe found', {index, container});
            return;
        }

        const videoId = extractVideoId(iframe.src);
        if (!videoId) {
            console.error('Invalid video ID', {index, src: iframe.src});
            return;
        }

        if (!iframe.id) iframe.id = `yt-player-${index}`;

        videoPlayers.status[index] = {
            videoId: videoId,
            state: 'initializing',
            duration: 0,
            watchedSeconds: 0,
            completed: false,
            container: container
        };

        try {
            console.log(`Creating player ${index}`, {videoId, iframeId: iframe.id});
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
                    'onReady': (event) => {
                        console.log(`Player ${index} onReady event`, event);
                        onPlayerReady(event, index);
                    },
                    'onStateChange': (event) => onPlayerStateChange(event, index),
                    'onError': (event) => {
                        console.error(`Player ${index} error`, event);
                        onPlayerError(event, index);
                    }
                }
            });
        } catch (e) {
            console.error(`Player ${index} creation failed`, e, debugState());
            handlePlayerError(index);
        }
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




