document.addEventListener('DOMContentLoaded', function() {
    // Track video completion status
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false, element: null },
        { id: 'PnH4ExmrIV4', completed: false, element: null },
        { id: 'ytD4F0awEKc', completed: false, element: null },
        { id: 'phbpRBO9Rkk', completed: false, element: null }
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
    
    // Find all video iframes and set up completion tracking
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
        videos[index].element = iframe;
        
        // Add event listener to detect when video is played
        iframe.addEventListener('load', function() {
            const player = iframe.contentWindow;
            
            // Poll for video completion (since YouTube API requires additional setup)
            const checkComplete = setInterval(() => {
                try {
                    // This is a simplified approach - for full implementation you'd need YouTube API
                    // For now, we'll just track if user interacted with each video
                    iframe.addEventListener('click', () => {
                        videos[index].completed = true;
                        checkAllCompleted();
                    });
                } catch (e) {
                    console.log("YouTube API not loaded yet");
                }
            }, 1000);
        });
    });
    
    // Create interaction elements (add these to your HTML)
    const interactionContainer = document.createElement('div');
    interactionContainer.className = 'interaction-container';
    interactionContainer.innerHTML = `
        <div class="interaction-item" id="interact-1">✓ Video 1 Watched</div>
        <div class="interaction-item" id="interact-2">✓ Video 2 Watched</div>
        <div class="interaction-item" id="interact-3">✓ Video 3 Watched</div>
        <div class="interaction-item" id="interact-4">✓ Video 4 Watched</div>
        <button id="unlock-button" disabled>Unlock Quiz</button>
    `;
    document.body.appendChild(interactionContainer);
    
    // Set up interaction handlers
    interactionElements.forEach(item => {
        const element = document.getElementById(item.id);
        element.addEventListener('click', () => {
            if (videos[parseInt(item.id.split('-')[1]) - 1].completed) {
                item.interacted = true;
                element.classList.add('completed');
                checkAllInteractions();
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
        enableQuizLinks();
    });
    
    function checkAllCompleted() {
        const allVideosCompleted = videos.every(v => v.completed);
        if (allVideosCompleted && scrolledToBottom) {
            document.getElementById('unlock-button').disabled = false;
        }
    }
    
    function checkAllInteractions() {
        const allInteracted = interactionElements.every(i => i.interacted);
        if (allInteracted && unlockButtonClicked) {
            enableQuizLinks();
        }
    }
    
    function enableQuizLinks() {
        document.querySelectorAll('.quiz-link').forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        });
    }
    
    // Initially disable quiz links
    document.querySelectorAll('.quiz-link').forEach(link => {
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.5';
    });
});
