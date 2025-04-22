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
        
        // Setup postMessage listener for this iframe
        setupPostMessageListener(iframe, videoId);
        
        console.groupEnd();
    });
});

function setupPostMessageListener(iframe, videoId) {
    console.log(`Setting up postMessage listener for video: ${videoId}`);
    
    let lastUpdate = 0;
    
    const messageHandler = function(event) {
        // Only process messages from our iframe
        if (event.source !== iframe.contentWindow) return;
        
        try {
            const data = JSON.parse(event.data);
            if (data && data.info) {
                const now = Date.now();
                
                // Throttle updates to once per second
                if (now - lastUpdate > 1000) {
                    console.group(`Video ${videoId} Update`);
                    console.log('Player info:', data.info);
                    
                    if (data.info.currentTime !== undefined && data.info.duration !== undefined) {
                        const percentage = (data.info.currentTime / data.info.duration * 100).toFixed(2);
                        console.log(`Progress: ${percentage}%`);
                        
                        if (data.info.currentTime >= data.info.duration * 0.99) {
                            console.log('EVENT: Video nearly completed');
                        }
                    }
                    
                    console.groupEnd();
                    lastUpdate = now;
                }
            }
        } catch (e) {
            // Not a JSON message we care about
        }
    };

    window.addEventListener('message', messageHandler);
    
    // Periodically request player state
    const requestInterval = setInterval(() => {
        try {
            iframe.contentWindow.postMessage(
                '{"event":"command","func":"getPlayerState","args":""}',
                '*'
            );
            iframe.contentWindow.postMessage(
                '{"event":"command","func":"getCurrentTime","args":""}',
                '*'
            );
            iframe.contentWindow.postMessage(
                '{"event":"command","func":"getDuration","args":""}',
                '*'
            );
        } catch (e) {
            console.warn('postMessage failed:', e);
        }
    }, 1500);

    // Clean up when iframe is removed
    const cleanupObserver = new MutationObserver(() => {
        if (!document.contains(iframe)) {
            clearInterval(requestInterval);
            window.removeEventListener('message', messageHandler);
            cleanupObserver.disconnect();
            console.log(`Cleanup complete for video ${videoId}`);
        }
    });
    cleanupObserver.observe(document.body, { childList: true, subtree: true });
}
