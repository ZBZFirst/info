document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false, element: null, tracker: null },
        { id: 'PnH4ExmrIV4', completed: false, element: null, tracker: null },
        { id: 'ytD4F0awEKc', completed: false, element: null, tracker: null },
        { id: 'phbpRBO9Rkk', completed: false, element: null, tracker: null }
    ];
    
    let scrolledToBottom = false;

    // Create unique tracker for each video
    function createVideoTracker(iframe, index) {
        return setInterval(() => {
            if (videos[index].completed) return;
            
            try {
                // Access the iframe's document (may be blocked by CORS)
                const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                const progressBar = innerDoc.querySelector('.ytp-progress-bar');
                
                if (progressBar) {
                    const currentTime = parseInt(progressBar.getAttribute('aria-valuenow'));
                    const duration = parseInt(progressBar.getAttribute('aria-valuemax'));
                    
                    console.log(`Video ${index+1} (${videos[index].id}): ${currentTime}/${duration} seconds`);
                    
                    // Check for completion (currentTime equals or exceeds duration)
                    if (currentTime >= duration) {
                        console.log(`Video ${index+1} completed!`);
                        completeVideo(index);
                    }
                }
            } catch (e) {
                // Fallback method using postMessage
                iframe.contentWindow.postMessage('{"event":"command","func":"getCurrentTime","args":""}', '*');
            }
        }, 1000); // Check every second
    }

    // Listen for postMessage responses from YouTube
    window.addEventListener('message', function(event) {
        try {
            const data = JSON.parse(event.data);
            if (data && data.info && data.info.currentTime && data.info.duration) {
                const index = videos.findIndex(v => 
                    v.element && v.element.contentWindow === event.source);
                if (index !== -1 && !videos[index].completed) {
                    console.log(`Video ${index+1} postMessage update: ${data.info.currentTime}/${data.info.duration}`);
                    if (data.info.currentTime >= data.info.duration * 0.95) {
                        completeVideo(index);
                    }
                }
            }
        } catch (e) {
            // Not a YouTube message we care about
        }
    });

    function setupVideoTracking() {
        document.querySelectorAll('.embed-container iframe').forEach((iframe, index) => {
            if (index >= videos.length) return;
            
            videos[index].element = iframe;
            videos[index].checkbox = document.getElementById(`video-check-${index+1}`);
            
            // Start individual tracker for this video
            videos[index].tracker = createVideoTracker(iframe, index);
            
            console.log(`Tracking initialized for Video ${index+1} (${videos[index].id})`);
        });
    }

    function completeVideo(index) {
        if (videos[index].completed) return;
        
        console.log(`Completing Video ${index+1}`);
        videos[index].completed = true;
        
        // Clear the tracker interval
        if (videos[index].tracker) {
            clearInterval(videos[index].tracker);
        }
        
        // Update the checkbox
        if (videos[index].checkbox) {
            videos[index].checkbox.checked = true;
        }
        
        // Highlight the completed card
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
        console.log(`All videos completed: ${allVideosCompleted}, Scrolled to bottom: ${scrolledToBottom}`);
        
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

    // Initialize tracking after a delay
    setTimeout(setupVideoTracking, 2000);
});
