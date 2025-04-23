//MVGatekeeper.js file start

console.log('MVGatekeeper.js loaded - YT available:', typeof YT !== 'undefined');

const videoPlayers = {
    players: [],
    status: [],
    readyCount: 0,
    apiLoaded: false,
    initialized: false

};

let fallbackTimeout;

function initializeVideoTracking() {
    if (videoPlayers.initialized) return;
    
    console.log('Initializing video tracking - YT state:', {
        YT_available: typeof YT !== 'undefined',
        YT_loaded: window.YT?.loaded
    });
    
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.error('YouTube API not available after callback');
        showFallbackMessage();
        enableManualCompletion();
        return;
    }

    videoPlayers.initialized = true;
    initYouTubePlayers();
}

function initYouTubePlayers() {
    const videoContainers = document.querySelectorAll('.embed-container');
    console.log(`Found ${videoContainers.length} video containers`);

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
            console.log(`Initializing player ${index} for video ${videoId}`);
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
        } catch (e) {
            console.error(`Failed to initialize player ${index}:`, e);
            handlePlayerError(index);
        }
    });
}


function extractVideoId(url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function onPlayerReady(event, index) {
    console.log(`Player ${index} ready event received`);
    const player = event.target;
    videoPlayers.readyCount++;
    
    // Reset the fallback timeout since we got a ready event
    clearTimeout(fallbackTimeout);
    
    try {
        const duration = player.getDuration();
        if (duration) {
            videoPlayers.status[index].duration = duration;
            videoPlayers.status[index].state = 'ready';
            console.log(`Player ${index} ready (${duration}s)`);
            
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) checkbox.disabled = false;
            
            startProgressTracking(player, index);
            return;
        }
    } catch (e) {
        console.error(`Error getting duration for player ${index}:`, e);
    }
    
    videoPlayers.status[index].state = 'ready';
    console.log(`Player ${index} ready (duration unknown)`);
}

function markVideoAsComplete(index) {
    videoPlayers.status[index].completed = true;
    const checkbox = document.getElementById(`video-check-${index+1}`);
    if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
    }
    
    updateQuizButtonState();
}

function handlePlayerError(index) {
    videoPlayers.status[index].state = 'error';
    videoPlayers.status[index].container.classList.add('error');
    
    const checkbox = document.getElementById(`video-check-${index+1}`);
    if (checkbox) {
        checkbox.disabled = false;
        checkbox.addEventListener('change', function() {
            videoPlayers.status[index].completed = this.checked;
            updateQuizButtonState();
        });
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

function onPlayerError(event, index) {
    console.error(`Player ${index} error:`, event.data);
    handlePlayerError(index);
}

function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready - initializing players');
    initYouTubePlayers();
}

setTimeout(() => {
    if (!window.YT || videoPlayers.readyCount === 0) {
        console.warn('YouTube API not loaded - enabling manual completion');
        enableManualCompletion();
    }
}, 5000);

function enableManualCompletion() {
    document.querySelectorAll('.video-completion input').forEach(checkbox => {
        checkbox.disabled = false;
        checkbox.addEventListener('change', function() {
            const index = parseInt(this.id.replace('video-check-', '')) - 1;
            videoPlayers.status[index].completed = this.checked;
            updateQuizButtonState();
        });
    });
}

function startProgressTracking(player, index) {
    const progressBar = document.createElement('div');
    progressBar.className = 'video-progress';
    progressBar.innerHTML = '<div class="video-progress-bar"></div>';
    videoPlayers.status[index].container.appendChild(progressBar);
    
    const updateInterval = setInterval(() => {
        try {
            const currentTime = player.getCurrentTime();
            const duration = videoPlayers.status[index].duration;
            const percentWatched = (currentTime / duration) * 100;
            
            progressBar.querySelector('.video-progress-bar').style.width = `${percentWatched}%`;
            
            if (currentTime > videoPlayers.status[index].watchedSeconds) {
                videoPlayers.status[index].watchedSeconds = currentTime;
            }
            
            if (!videoPlayers.status[index].completed && percentWatched >= 90) {
                markVideoAsComplete(index);
                clearInterval(updateInterval);
            }
        } catch (e) {
            console.error(`Error tracking progress for player ${index}:`, e);
        }
    }, 1000);
}

function showFallbackMessage() {
    const fallbackHtml = `
        <div class="yt-fallback-message">
            <p>YouTube integration not available. Please mark videos manually.</p>
            <p>For full functionality, ensure you're not blocking YouTube scripts.</p>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', fallbackHtml);
}

// Modified API ready handler
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API ready callback - YT state:', {
        YT: typeof YT,
        Player: typeof YT?.Player,
        loaded: YT?.loaded
    });
    
    videoPlayers.apiLoaded = true;
    
    // Only initialize if DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeVideoTracking();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - YT state:', {
        YT_available: typeof YT !== 'undefined',
        YT_loaded: window.YT?.loaded
    });
    
    // Set up the fallback timeout
    fallbackTimeout = setTimeout(() => {
        if (!videoPlayers.initialized && videoPlayers.readyCount === 0) {
            console.warn('YouTube API timeout - using fallback');
            showFallbackMessage();
            enableManualCompletion();
        }
    }, 10000);
    
    // If API is already loaded when DOM is ready
    if (window.YT?.loaded) {
        console.log('API was loaded before DOM ready');
        initializeVideoTracking();
    }
});












//MVGatekeeper.js file end

