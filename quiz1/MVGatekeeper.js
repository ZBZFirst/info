// Track all players and their states
const videoPlayers = {
    players: [],
    status: [],
    readyCount: 0
};

// Main initialization
function initYouTubePlayers() {
    const videoContainers = document.querySelectorAll('.embed-container');
    
    videoContainers.forEach((container, index) => {
        const iframe = container.querySelector('iframe');
        if (!iframe) return;

        // Extract video ID from iframe src
        const videoId = extractVideoId(iframe.src);
        if (!videoId) return;

        // Create unique ID for the iframe if it doesn't have one
        if (!iframe.id) {
            iframe.id = `yt-player-${index}`;
        }

        // Initialize player status
        videoPlayers.status[index] = {
            videoId: videoId,
            state: 'uninitialized',
            duration: 0,
            watchedSeconds: 0,
            completed: false
        };

        // Create the player
        videoPlayers.players[index] = new YT.Player(iframe.id, {
            videoId: videoId,
            playerVars: {
                'enablejsapi': 1,
                'origin': window.location.origin,
                'controls': 1,
                'rel': 0
            },
            events: {
                'onReady': (event) => onPlayerReady(event, index),
                'onStateChange': (event) => onPlayerStateChange(event, index),
                'onError': (event) => onPlayerError(event, index)
            }
        });
    });
}

// Extract video ID from URL
function extractVideoId(url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Player ready handler
function onPlayerReady(event, index) {
    const player = event.target;
    videoPlayers.readyCount++;
    
    try {
        // Get duration immediately
        const duration = player.getDuration();
        if (duration) {
            videoPlayers.status[index].duration = duration;
            videoPlayers.status[index].state = 'ready';
            console.log(`Player ${index} ready (${duration}s)`);
            
            // Enable the checkbox
            const checkbox = document.getElementById(`video-check-${index+1}`);
            if (checkbox) checkbox.disabled = false;
            
            // Start tracking progress
            startProgressTracking(player, index);
            return;
        }
    } catch (e) {
        console.error(`Error getting duration for player ${index}:`, e);
    }
    
    // Fallback if we couldn't get duration
    videoPlayers.status[index].state = 'ready';
    console.log(`Player ${index} ready (duration unknown)`);
}

// Progress tracking
function startProgressTracking(player, index) {
    const updateInterval = setInterval(() => {
        try {
            const currentTime = player.getCurrentTime();
            const duration = videoPlayers.status[index].duration;
            
            // Update watched seconds
            if (currentTime > videoPlayers.status[index].watchedSeconds) {
                videoPlayers.status[index].watchedSeconds = currentTime;
            }
            
            // Check for completion (watched at least 90%)
            if (!videoPlayers.status[index].completed && 
                videoPlayers.status[index].watchedSeconds >= duration * 0.9) {
                markVideoAsComplete(index);
                clearInterval(updateInterval);
            }
        } catch (e) {
            console.error(`Error tracking progress for player ${index}:`, e);
        }
    }, 1000); // Update every second
}

// Mark video as completed
function markVideoAsComplete(index) {
    videoPlayers.status[index].completed = true;
    const checkbox = document.getElementById(`video-check-${index+1}`);
    if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
    }
    
    // Update quiz button state
    updateQuizButtonState();
}

// Update quiz button based on completion
function updateQuizButtonState() {
    const allCompleted = videoPlayers.status.every(s => s.completed);
    const quizButton = document.querySelector('.quiz-link[href="testquiz.html"]');
    
    if (quizButton) {
        quizButton.classList.toggle('disabled', !allCompleted);
        quizButton.style.pointerEvents = allCompleted ? 'auto' : 'none';
    }
}

// Error handling
function onPlayerError(event, index) {
    console.error(`Player ${index} error:`, event.data);
    videoPlayers.status[index].state = 'error';
}

// Initialize when YouTube API is ready
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready - initializing players');
    initYouTubePlayers();
}

// Fallback in case API doesn't load
setTimeout(() => {
    if (!window.YT || videoPlayers.readyCount === 0) {
        console.warn('YouTube API not loaded - enabling manual completion');
        enableManualCompletion();
    }
}, 5000);

// Manual completion fallback
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
