document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Track video completion status
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false, element: null, checkbox: null, duration: 0, player: null },
        { id: 'PnH4ExmrIV4', completed: false, element: null, checkbox: null, duration: 0, player: null },
        { id: 'ytD4F0awEKc', completed: false, element: null, checkbox: null, duration: 0, player: null },
        { id: 'phbpRBO9Rkk', completed: false, element: null, checkbox: null, duration: 0, player: null }
    ];
    
    let scrolledToBottom = false;
    let videoCheckIntervals = [];
    
    // Debug function to log video states
    function logVideoStates() {
        console.log('Current video states:');
        videos.forEach((video, index) => {
            console.log(`Video ${index + 1} (${video.id}): 
                Completed: ${video.completed}, 
                Duration: ${video.duration} seconds,
                Player State: ${video.player ? getPlayerState(video.player.getPlayerState()) : 'Not loaded'}`);
        });
    }
    
    function getPlayerState(stateCode) {
        const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
        return states[stateCode] || 'UNKNOWN';
    }
    
    // Initialize YouTube players
    function initializePlayers() {
        console.log('Initializing players');
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach((iframe, index) => {
            videos[index].element = iframe;
            videos[index].checkbox = document.getElementById(`video-check-${index+1}`);
            
            try {
                videos[index].player = new YT.Player(iframe, {
                    events: {
                        'onReady': (event) => onPlayerReady(event, index),
                        'onStateChange': (event) => onPlayerStateChange(event, index),
                        'onError': (event) => console.error(`Player ${index+1} error:`, event.data)
                    }
                });
                console.log(`Player ${index + 1} initialized for video ${videos[index].id}`);
            } catch (e) {
                console.error(`Error initializing player ${index + 1}:`, e);
            }
        });
    }
    
    // When a player is ready, set up tracking
    function onPlayerReady(event, index) {
        console.log(`Player ${index + 1} ready`);
        const player = event.target;
        
        // Get video duration once player is ready
        videos[index].duration = player.getDuration();
        console.log(`Video ${index + 1} duration: ${videos[index].duration} seconds`);
        
        // Start tracking play time
        videoCheckIntervals[index] = setInterval(() => {
            trackVideoProgress(index);
        }, 1000);
        
        logVideoStates();
    }
    
    // Track player state changes
    function onPlayerStateChange(event, index) {
        console.log(`Player ${index + 1} state changed to: ${getPlayerState(event.data)}`);
        
        if (event.data === YT.PlayerState.ENDED) {
            console.log(`Video ${index + 1} ended`);
            completeVideo(index);
        }
    }
    
    // Track video progress
    function trackVideoProgress(index) {
        try {
            const player = videos[index].player;
            const currentTime = player.getCurrentTime();
            
            // Log progress every 10 seconds for debugging
            if (Math.floor(currentTime) % 10 === 0) {
                console.log(`Video ${index + 1} progress: ${currentTime.toFixed(1)}/${videos[index].duration.toFixed(1)} seconds (${(currentTime/videos[index].duration*100).toFixed(1)}%)`);
            }
            
            // Mark as completed if watched at least 90% of the video
            if (videos[index].duration > 0 && currentTime / videos[index].duration >= 0.9) {
                console.log(`Video ${index + 1} reached 90% completion`);
                completeVideo(index);
            }
        } catch (e) {
            console.error(`Error tracking video ${index + 1} progress:`, e);
        }
    }
    
    function completeVideo(index) {
        if (videos[index].completed) return;
        
        console.log(`Completing video ${index + 1}`);
        videos[index].completed = true;
        
        if (videoCheckIntervals[index]) {
            clearInterval(videoCheckIntervals[index]);
        }
        
        if (videos[index].checkbox) {
            videos[index].checkbox.checked = true;
        }
        
        // Add completed class to resource card
        const card = videos[index].element.closest('.resource-card');
        if (card) {
            card.classList.add('video-completed');
        }
        
        checkAllCompleted();
        logVideoStates();
    }
    
    // Set up scroll tracking
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            if (!scrolledToBottom) {
                console.log('User scrolled to bottom');
                scrolledToBottom = true;
                checkAllCompleted();
            }
        }
    });
    
    function checkAllCompleted() {
        const allVideosCompleted = videos.every(v => v.completed);
        console.log(`All videos completed: ${allVideosCompleted}, Scrolled to bottom: ${scrolledToBottom}`);
        
        if (allVideosCompleted && scrolledToBottom) {
            console.log('All requirements met, enabling quiz links');
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
    
    // Initially disable quiz links
    document.querySelectorAll('.quiz-link').forEach(link => {
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.5';
        link.style.cursor = 'not-allowed';
    });
    
    // Initialize players after a short delay to ensure YT API is ready
    setTimeout(() => {
        if (window.YT && YT.loaded) {
            initializePlayers();
        } else {
            console.log('Waiting for YouTube API to load...');
            window.onYouTubeIframeAPIReady = initializePlayers;
        }
    }, 500);
});
