document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    const videos = [
        { id: 'g38HMU4Pjlk', completed: false },
        { id: 'PnH4ExmrIV4', completed: false },
        { id: 'ytD4F0awEKc', completed: false },
        { id: 'phbpRBO9Rkk', completed: false }
    ];
    
    let scrolledToBottom = false;
    let trackers = [];

    // 1. DOM-based Progress Tracking (no API)
    function trackVideoProgress(index) {
        const iframe = document.querySelector(`iframe[src*="${videos[index].id}"]`);
        if (!iframe) return;
        
        videos[index].iframe = iframe;
        videos[index].checkbox = document.getElementById(`video-check-${index+1}`);
        
        trackers[index] = setInterval(() => {
            if (videos[index].completed) return;
            
            try {
                // Access iframe's DOM (may be blocked by CORS)
                const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                // Method A: Check progress bar attributes
                const progressBar = innerDoc.querySelector('.ytp-progress-bar');
                if (progressBar) {
                    const current = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
                    const total = parseInt(progressBar.getAttribute('aria-valuemax') || '1');
                    
                    console.log(`Video ${index+1}: ${current}/${total} seconds`);
                    
                    if (current >= total) {
                        completeVideo(index);
                        return;
                    }
                }
                
                // Method B: Check for replay button
                const replayButton = innerDoc.querySelector('.ytp-replay-button');
                if (replayButton && getComputedStyle(replayButton).display !== 'none') {
                    completeVideo(index);
                    return;
                }
                
            } catch (e) {
                // Fallback to postMessage if DOM access fails
                if (!videos[index].postMessageSetup) {
                    setupPostMessageTracking(index);
                }
            }
        }, 1000);
    }

    // 2. postMessage Fallback
    function setupPostMessageTracking(index) {
        videos[index].postMessageSetup = true;
        const iframe = videos[index].iframe;
        
        window.addEventListener('message', function handler(event) {
            if (event.source !== iframe.contentWindow) return;
            
            try {
                const data = JSON.parse(event.data);
                if (data?.info?.currentTime && data?.info?.duration) {
                    const progress = data.info.currentTime / data.info.duration;
                    if (progress >= 0.95) {
                        completeVideo(index);
                        window.removeEventListener('message', handler);
                    }
                }
            } catch (e) {
                // Invalid message format
            }
        });
        
        // Request progress updates
        setInterval(() => {
            try {
                iframe.contentWindow.postMessage(
                    '{"event":"command","func":"getCurrentTime","args":""}',
                    '*'
                );
            } catch (e) {
                console.warn(`postMessage failed for video ${index+1}`);
            }
        }, 1500);
    }

    function completeVideo(index) {
        if (videos[index].completed) return;
        
        console.log(`Video ${index+1} completed`);
        videos[index].completed = true;
        
        clearInterval(trackers[index]);
        
        // Update UI
        if (videos[index].checkbox) {
            videos[index].checkbox.checked = true;
        }
        
        const card = videos[index].iframe.closest('.resource-card');
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
        const allCompleted = videos.every(v => v.completed);
        if (allCompleted && scrolledToBottom) {
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

    // Initialize tracking after delay
    setTimeout(() => {
        videos.forEach((_, index) => trackVideoProgress(index));
    }, 2000);
});
