document.addEventListener('DOMContentLoaded', function() {
    // Track video completion status with timers
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false, duration: 0, requiredDuration: 60, element: null },
        { id: 'PnH4ExmrIV4', completed: false, duration: 0, requiredDuration: 120, element: null },
        { id: 'ytD4F0awEKc', completed: false, duration: 0, requiredDuration: 90, element: null },
        { id: 'phbpRBO9Rkk', completed: false, duration: 0, requiredDuration: 75, element: null }
    ];
    
    // Track interaction elements
    const interactionElements = [
        { id: 'interact-1', interacted: false },
        { id: 'interact-2', interacted: false },
        { id: 'interact-3', interacted: false },
        { id: 'interact-4', interacted: false }
    ];
    
    let scrolledToBottom = false;
    let unlockButtonClicked = false;
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
            videos[index].completed = true;
            clearInterval(videoCheckIntervals[index]);
            checkAllCompleted();
        }
    }
    
    // Track video progress
    function trackVideoProgress(index) {
        const player = players[index];
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        videos[index].duration = currentTime;
        
        // Mark as completed if watched at least 90% of the video
        if (currentTime / duration >= 0.9) {
            videos[index].completed = true;
            clearInterval(videoCheckIntervals[index]);
            checkAllCompleted();
        }
    }
    
    // Create interaction elements
    const interactionContainer = document.createElement('div');
    interactionContainer.className = 'interaction-container';
    interactionContainer.innerHTML = `
        <div class="interaction-item" id="interact-1">✓ Confirm Video 1 Watched</div>
        <div class="interaction-item" id="interact-2">✓ Confirm Video 2 Watched</div>
        <div class="interaction-item" id="interact-3">✓ Confirm Video 3 Watched</div>
        <div class="interaction-item" id="interact-4">✓ Confirm Video 4 Watched</div>
        <button id="unlock-button" disabled>Unlock Quiz</button>
        <div id="progress-message"></div>
    `;
    document.body.appendChild(interactionContainer);
    
    // Set up interaction handlers
    interactionElements.forEach(item => {
        const element = document.getElementById(item.id);
        element.addEventListener('click', () => {
            const videoIndex = parseInt(item.id.split('-')[1]) - 1;
            if (videos[videoIndex].completed) {
                item.interacted = true;
                element.classList.add('completed');
                checkAllInteractions();
            } else {
                document.getElementById('progress-message').textContent = 
                    `Please watch Video ${videoIndex + 1} completely before confirming.`;
                setTimeout(() => {
                    document.getElementById('progress-message').textContent = '';
                }, 3000);
            }
        });
    });
    
    // Set up scroll tracking
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            scrolledToBottom = true;
            checkAllCompleted();
        }
    });
    
    // Set up unlock button
    document.getElementById('unlock-button').addEventListener('click', function() {
        unlockButtonClicked = true;
        checkAllInteractions();
    });
    
    function checkAllCompleted() {
        const allVideosCompleted = videos.every(v => v.completed);
        if (allVideosCompleted && scrolledToBottom) {
            document.getElementById('unlock-button').disabled = false;
            document.getElementById('progress-message').textContent = 
                'All videos watched! Please confirm each one above.';
        }
    }
    
    function checkAllInteractions() {
        const allInteracted = interactionElements.every(i => i.interacted);
        if (allInteracted && unlockButtonClicked) {
            enableQuizLinks();
            document.getElementById('progress-message').textContent = 
                'Quiz unlocked! You may now proceed.';
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
    
    // Show initial instructions
    document.getElementById('progress-message').textContent = 
        'Please watch all videos and scroll to the bottom to unlock the quiz.';
});
