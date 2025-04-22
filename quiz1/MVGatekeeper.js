document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false, element: null },
        { id: 'PnH4ExmrIV4', completed: false, element: null },
        { id: 'ytD4F0awEKc', completed: false, element: null },
        { id: 'phbpRBO9Rkk', completed: false, element: null }
    ];
    
    let scrolledToBottom = false;
    let checkIntervals = [];

    function setupVideoTracking() {
        document.querySelectorAll('.embed-container iframe').forEach((iframe, index) => {
            if (index >= videos.length) return;
            
            videos[index].element = iframe;
            videos[index].checkbox = document.getElementById(`video-check-${index+1}`);
            
            // Set up interval to check progress
            checkIntervals[index] = setInterval(() => {
                if (videos[index].completed) return;
                
                try {
                    const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const progressBar = innerDoc.querySelector('.ytp-progress-bar');
                    
                    if (progressBar) {
                        const current = parseInt(progressBar.getAttribute('aria-valuenow'));
                        const total = parseInt(progressBar.getAttribute('aria-valuemax'));
                        
                        console.log(`Video ${index+1} progress: ${current}/${total} seconds`);
                        
                        // Completion condition: current time equals or exceeds duration
                        if (current >= total) {
                            console.log(`Video ${index+1} completed (${current}/${total})`);
                            completeVideo(index);
                        }
                    }
                } catch (e) {
                    console.warn(`Couldn't check progress for video ${index+1}:`, e.message);
                }
            }, 1000); // Check every second
            
            console.log(`Tracking setup for video ${index+1}`);
        });
    }

    function completeVideo(index) {
        if (videos[index].completed) return;
        
        console.log(`Marking video ${index+1} as complete`);
        videos[index].completed = true;
        
        // Clear the checking interval
        if (checkIntervals[index]) {
            clearInterval(checkIntervals[index]);
        }
        
        // Update UI
        if (videos[index].checkbox) {
            videos[index].checkbox.checked = true;
        }
        
        const card = videos[index].element.closest('.resource-card');
        if (card) {
            card.classList.add('video-completed');
        }
        
        checkAllCompleted();
    }

    // Scroll tracking
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            scrolledToBottom = true;
            checkAllCompleted();
        }
    });

    function checkAllCompleted() {
        const allVideosCompleted = videos.every(v => v.completed);
        console.log(`Videos completed: ${allVideosCompleted}, Scrolled to bottom: ${scrolledToBottom}`);
        
        if (allVideosCompleted && scrolledToBottom) {
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

    // Initialize with delay to allow iframes to load
    setTimeout(setupVideoTracking, 2000);
});
