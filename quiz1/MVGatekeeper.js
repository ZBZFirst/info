document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Track video completion status
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false, element: null, checkbox: null, duration: 0 },
        { id: 'PnH4ExmrIV4', completed: false, element: null, checkbox: null, duration: 0 },
        { id: 'ytD4F0awEKc', completed: false, element: null, checkbox: null, duration: 0 },
        { id: 'phbpRBO9Rkk', completed: false, element: null, checkbox: null, duration: 0 }
    ];
    
    let scrolledToBottom = false;
    let videoCheckIntervals = [];
    let players = [];
    
    // Debug function to log video states
    function logVideoStates() {
        console.log('Current video states:');
        videos.forEach((video, index) => {
            console.log(`Video ${index + 1} (${video.id}): 
                Completed: ${video.completed}, 
                Duration: ${video.duration} seconds`);
        });
    }
    
    // Check if YouTube API is already loaded
    if (window.YT && YT.loaded) {
        console.log('YouTube API already loaded');
        initializePlayers();
    } else {
        console.log('Loading YouTube API');
        // Create the YouTube API script tag
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = function() {
            console.log('YouTube API ready');
            initializePlayers();
        };
    }
    
    function initializePlayers() {
        console.log('Initializing players');
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach((iframe, index) => {
            videos[index].element = iframe;
            videos[index].checkbox = document.getElementById(`video-check-${index+1}`);
            
            try {
                const player = new YT.Player(iframe, {
                    events: {
                        'onReady': (event) => onPlayerReady(event, index),
                        'onStateChange': (event) => onPlayerStateChange(event, index)
                    }
                });
                players[index] = player;
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
        
        // Start tracking play time
        videoCheckIntervals[index] = setInterval(() => {
            trackVideoProgress(index);
        }, 1000);
    }
    
    // Track player state changes
    function onPlayerStateChange(event, index) {
        const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
        console.log(`Player ${index + 1} state changed to: ${states[event.data]}`);
        
        if (event.data === YT.PlayerState.ENDED) {
            console.log(`Video ${index + 1} ended`);
            completeVideo(index);
        }
    }
    
    // Track video progress
    function trackVideoProgress(index) {
        try {
            const player = players[index];
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            videos[index].duration = duration;
            
            // Log progress every 10 seconds for debugging
            if (Math.floor(currentTime) % 10 === 0) {
                console.log(`Video ${index + 1} progress: ${currentTime.toFixed(1)}/${duration.toFixed(1)} seconds`);
            }
            
            // Mark as completed if watched at least 90% of the video
            if (duration > 0 && currentTime / duration >= 0.9) {
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
    
    // Initial state log
    logVideoStates();
});
