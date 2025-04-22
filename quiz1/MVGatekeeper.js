document.addEventListener('DOMContentLoaded', function() {
    // Track video completion status
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false, element: null, checkbox: null },
        { id: 'PnH4ExmrIV4', completed: false, element: null, checkbox: null },
        { id: 'ytD4F0awEKc', completed: false, element: null, checkbox: null },
        { id: 'phbpRBO9Rkk', completed: false, element: null, checkbox: null }
    ];
    
    let scrolledToBottom = false;
    let videoCheckIntervals = [];
    
    // Create the YouTube API script tag
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // This function creates an <iframe> (and YouTube player) for each video
    let players = [];
    window.onYouTubeIframeAPIReady = function() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe, index) => {
            videos[index].element = iframe;
            videos[index].checkbox = document.getElementById(`video-check-${index+1}`);
            
            const player = new YT.Player(iframe, {
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
            players[index] = player;
        });
    };
    
    // When a player is ready, set up tracking
    function onPlayerReady(event) {
        const player = event.target;
        const index = players.indexOf(player);
        
        // Start tracking play time
        videoCheckIntervals[index] = setInterval(() => {
            trackVideoProgress(index);
        }, 1000);
    }
    
    // Track player state changes
    function onPlayerStateChange(event) {
        const player = event.target;
        const index = players.indexOf(player);
        
        if (event.data === YT.PlayerState.ENDED) {
            completeVideo(index);
        }
    }
    
    // Track video progress
    function trackVideoProgress(index) {
        const player = players[index];
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        // Mark as completed if watched at least 90% of the video
        if (currentTime / duration >= 0.9) {
            completeVideo(index);
        }
    }
    
    function completeVideo(index) {
        videos[index].completed = true;
        videos[index].checkbox.checked = true;
        clearInterval(videoCheckIntervals[index]);
        
        // Add completed class to resource card
        videos[index].element.closest('.resource-card').classList.add('video-completed');
        
        checkAllCompleted();
    }
    
    // Set up scroll tracking
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            scrolledToBottom = true;
            checkAllCompleted();
        }
    });
    
    function checkAllCompleted() {
        const allVideosCompleted = videos.every(v => v.completed);
        if (allVideosCompleted && scrolledToBottom) {
            enableQuizLinks();
        }
    }
    
    function enableQuizLinks() {
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
});
