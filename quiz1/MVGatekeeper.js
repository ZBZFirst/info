document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Find all YouTube iframes
    const youtubeIframes = Array.from(document.querySelectorAll('iframe'))
        .filter(iframe => iframe.src.includes('youtube.com/embed/') || iframe.src.includes('youtu.be/'));
    
    console.log(`Found ${youtubeIframes.length} YouTube video embeds`);

    youtubeIframes.forEach((iframe, index) => {
        console.groupCollapsed(`YouTube Video #${index + 1}`);
        
        // Extract video ID
        const videoId = iframe.src.split('/embed/')[1]?.split('?')[0] || 
                       iframe.src.split('youtu.be/')[1]?.split('?')[0];
        console.log('Video ID:', videoId);
        
        // Get URL parameters
        const urlParams = new URL(iframe.src).searchParams;
        console.log('URL Parameters:', Object.fromEntries(urlParams.entries()));
        
        // Get computed dimensions
        const computedStyle = window.getComputedStyle(iframe);
        console.log('Computed dimensions:', {
            width: computedStyle.width,
            height: computedStyle.height,
            aspectRatio: parseFloat(computedStyle.width) / parseFloat(computedStyle.height) || 'N/A'
        });
        
        // Attempt to detect player state via indirect methods
        detectPlayerState(iframe, videoId);
        
        console.groupEnd();
    });

function detectPlayerState(iframe, videoId) {
    console.log(`Setting up debugger for video: ${videoId}`);
    
    // Track previous values for comparison
    let previousValues = {
        currentTime: 0,
        duration: 0,
        percentage: 0
    };

    // Method 1: Poll for YTP progress bar changes
    const progressChecker = setInterval(() => {
        try {
            // Access the iframe's document (may be blocked by CORS)
            const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            const progressBar = innerDoc.querySelector('.ytp-progress-bar');
            
            if (progressBar) {
                const currentTime = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
                const duration = parseInt(progressBar.getAttribute('aria-valuemax') || '0');
                const percentage = duration > 0 ? (currentTime / duration * 100).toFixed(2) : 0;
                
                // Only log if values have changed
                if (currentTime !== previousValues.currentTime || 
                    duration !== previousValues.duration) {
                    
                    console.group(`Video ${videoId} Progress Update`);
                    console.log('Current Time:', `${currentTime}s (was ${previousValues.currentTime}s)`);
                    console.log('Duration:', `${duration}s (was ${previousValues.duration}s)`);
                    console.log('Completion:', `${percentage}%`);
                    
                    // Detect significant events
                    if (previousValues.duration === 0 && duration > 0) {
                        console.log('EVENT: Video loaded');
                    }
                    if (currentTime > previousValues.currentTime) {
                        console.log('EVENT: Video playing');
                    }
                    if (currentTime === duration && duration > 0) {
                        console.log('EVENT: Video completed');
                    }
                    
                    console.groupEnd();
                    
                    // Update previous values
                    previousValues = { currentTime, duration, percentage };
                }
            }
        } catch (e) {
            // Fallback to postMessage if direct access fails
            if (!window.ytDebugFallback) {
                console.log('CORS blocked direct access, attempting postMessage fallback...');
                setupPostMessageFallback(iframe, videoId);
                window.ytDebugFallback = true;
            }
        }
    }, 1000); // Check every second

    // Method 2: PostMessage fallback
    function setupPostMessageFallback(iframe, videoId) {
        window.addEventListener('message', function(event) {
            if (event.source === iframe.contentWindow) {
                try {
                    const data = JSON.parse(event.data);
                    if (data && data.info && data.info.currentTime !== undefined) {
                        console.log(`Video ${videoId} postMessage Update:`, data.info);
                    }
                } catch (e) {
                    // Not a progress update message
                }
            }
        });

        // Regularly request progress updates
        setInterval(() => {
            try {
                iframe.contentWindow.postMessage(
                    '{"event":"command","func":"getCurrentTime","args":""}',
                    '*'
                );
            } catch (e) {
                console.warn('postMessage failed:', e);
            }
        }, 1500);
    }

    // Clean up when iframe is removed
    const cleanupObserver = new MutationObserver(() => {
        if (!document.contains(iframe)) {
            clearInterval(progressChecker);
            cleanupObserver.disconnect();
            console.log(`Cleanup complete for video ${videoId}`);
        }
    });
    cleanupObserver.observe(document.body, { childList: true, subtree: true });
}
});
