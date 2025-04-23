// MVGatekeeper.js - Simplified Version
console.log('MVGatekeeper.js loaded - YT available:', typeof YT !== 'undefined');

const videoPlayers = {
    players: [],
    status: [],
    readyCount: 0,
    apiLoaded: false,
    initialized: false
};

// Debug state function
function debugState() {
    return {
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

function extractVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function onPlayerStateChange(event, index) {
    console.log(`Player ${index} state changed:`, event.data);
    if (event.data === YT.PlayerState.ENDED) {
        markVideoAsComplete(index);
    }
}

function initializeVideoTracking() {
    if (videoPlayers.initialized) return;
    
    console.log('Initializing video tracking', debugState());
    
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.error('YouTube API not available', debugState());
        showFallbackUI();
        return;
    }

    videoPlayers.initialized = true;
    initYouTubePlayers();
}

function initYouTubePlayers() {
    console.log('Initializing players', debugState());
    const videoContainers = document.querySelectorAll('.embed-container');
    
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.error('YouTube API not properly loaded');
        showFallbackUI();
        return;
    }

    videoContainers.forEach((container, index) => {
        const iframe = container.querySelector('iframe');
        if (!iframe) {
            console.error('No iframe found in container', {index, container});
            handlePlayerError(index);
            return;
        }

        if (!iframe.hasAttribute('allow')) {
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        }

        const videoId = extractVideoId(iframe.src);
        if (!videoId) {
            console.error('Could not extract video ID from iframe', {index, src: iframe.src});
            handlePlayerError(index);
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
            
            videoPlayers.players[index] = new YT.Player(iframe, {
                videoId: videoId,
                height: iframe.height || '100%',
                width: iframe.width || '100%',
                playerVars: {
                    'enablejsapi': 1,
                    'origin': window.location.origin,
                    'controls': 1,
                    'rel': 0,
                    'autoplay': 0,
                    'html5': 1
                },
                events: {
                    'onReady': (event) => onPlayerReady(event, index),
                    'onStateChange': (event) => onPlayerStateChange(event, index),
                    'onError': (event) => onPlayerError(event, index)
                }
            });
        } catch (e) {
            console.error(`Failed to initialize player ${index}`, e);
            handlePlayerError(index);
        }
    });
}

// Enhanced player ready handler with full video information
function onPlayerReady(event, index) {
    const player = event.target;
    videoPlayers.readyCount++;

    try {
        // Get all available video information
        const videoInfo = {
            duration: player.getDuration(),
            url: player.getVideoUrl(),
            embedCode: player.getVideoEmbedCode(),
            state: player.getPlayerState()
        };

        console.log(`Player ${index} ready with video info:`, {
            videoId: videoPlayers.status[index].videoId,
            ...videoInfo,
            timestamp: new Date().toISOString()
        });

        // Update our tracking object
        if (videoInfo.duration > 0) {
            videoPlayers.status[index] = {
                ...videoPlayers.status[index],
                ...videoInfo,
                state: 'ready',
                lastUpdated: new Date().toISOString()
            };

            // Start progress tracking
            startProgressTracking(player, index);
            
            // Enable the corresponding checkbox
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) {
                checkbox.disabled = false;
                checkbox.dataset.videoDuration = videoInfo.duration;
            }
        } else {
            console.warn(`Player ${index} returned 0 duration - may be live stream`);
            handleLiveStream(player, index);
        }
    } catch (e) {
        console.error(`Error getting video info for player ${index}:`, e);
        handlePlayerError(index);
    }
}

// Special handling for live streams
function handleLiveStream(player, index) {
    // For live streams, we'll track viewing time instead
    const startTime = Date.now();
    const updateInterval = setInterval(() => {
        try {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            videoPlayers.status[index].watchedSeconds = elapsedSeconds;
            
            // Consider live stream "completed" after 5 minutes (adjust as needed)
            if (elapsedSeconds >= 300) { // 5 minutes
                markVideoAsComplete(index);
                clearInterval(updateInterval);
            }
        } catch (e) {
            console.error(`Live stream tracking error:`, e);
            clearInterval(updateInterval);
        }
    }, 1000);

    videoPlayers.status[index].liveStreamInterval = updateInterval;
}

// UI Functions
function showFallbackUI() {
    const fallbackHtml = `
        <div class="yt-fallback-message">
            <p>YouTube integration not available. Please mark videos manually.</p>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', fallbackHtml);
    
    // Enable all checkboxes
    document.querySelectorAll('.video-completion input').forEach(checkbox => {
        checkbox.disabled = false;
    });
}

function handlePlayerError(index) {
    if (index >= 0 && index < videoPlayers.status.length) {
        videoPlayers.status[index].state = 'error';
        const checkbox = document.getElementById(`video-check-${index+1}`);
        if (checkbox) checkbox.disabled = false;
    }
}

function markVideoAsComplete(index) {
    if (index >= 0 && index < videoPlayers.status.length) {
        videoPlayers.status[index].completed = true;
        const checkbox = document.getElementById(`video-check-${index+1}`);
        if (checkbox) {
            checkbox.checked = true;
            updateQuizButtonState();
        }
    }
}

function updateQuizButtonState() {
    const allCompleted = videoPlayers.status.every(s => s.completed);
    const quizButton = document.querySelector('.quiz-link[href="testquiz.html"]');
    if (quizButton) {
        quizButton.classList.toggle('disabled', !allCompleted);
        quizButton.style.pointerEvents = allCompleted ? 'auto' : 'none';
    }
}

// Helper function to format time (seconds to HH:MM:SS)
function formatTime(seconds) {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
}

function startProgressTracking(player, index) {
    const container = videoPlayers.status[index].container;
    if (!container) return;

    // Create progress bar using your CSS classes
    const progressBar = document.createElement('div');
    progressBar.className = 'video-progress';
    
    const progressBarInner = document.createElement('div');
    progressBarInner.className = 'video-progress-bar';
    
    progressBar.appendChild(progressBarInner);
    container.appendChild(progressBar);

    // Add video info display
    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-status text-muted mt-1';
    videoInfo.innerHTML = `
        <span class="video-duration"></span>
        <a href="#" class="video-link" target="_blank">View on YouTube</a>
    `;
    container.appendChild(videoInfo);

    // Update video info
    try {
        videoInfo.querySelector('.video-duration').textContent = 
            `Duration: ${formatTime(player.getDuration())} • `;
        videoInfo.querySelector('.video-link').href = player.getVideoUrl();
    } catch (e) {
        console.error('Error setting video info:', e);
    }

    const updateInterval = setInterval(() => {
        try {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            const percentWatched = (currentTime / duration) * 100;
            
            // Update progress bar
            progressBarInner.style.width = `${percentWatched}%`;
            videoPlayers.status[index].watchedSeconds = currentTime;
            
            // Check for completion
            if (!videoPlayers.status[index].completed && percentWatched >= 90) {
                markVideoAsComplete(index);
                clearInterval(updateInterval);
                
                // Add completed styling
                container.classList.add('completed');
                const checkbox = container.querySelector('.video-completion input');
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.parentElement.classList.add('completed');
                }
            }
        } catch (e) {
            console.error(`Progress tracking error for player ${index}:`, e);
            clearInterval(updateInterval);
        }
    }, 1000);

    videoPlayers.status[index].progressInterval = updateInterval;
}


// Initialize when everything is ready
function checkInitialization() {
    if (typeof YT !== 'undefined' && YT.loaded && 
        (document.readyState === 'complete' || document.readyState === 'interactive')) {
        initializeVideoTracking();
    }
}

window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API ready');
    videoPlayers.apiLoaded = true;
    checkInitialization();
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    checkInitialization();
});

// Fallback check in case API never loads
window.addEventListener('load', () => {
    if (typeof YT === 'undefined') {
        console.warn('YouTube API failed to load');
        showFallbackUI();
    }
});
