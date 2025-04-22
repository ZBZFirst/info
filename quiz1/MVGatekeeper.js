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
        
        // Start tracking progress bar attributes
        trackProgressBar(iframe, videoId);
        
        console.groupEnd();
    });
});

function trackProgressBar(iframe, videoId) {
    console.log(`Starting progress tracker for video: ${videoId}`);
    
    let previousValues = {
        valuemin: 0,
        valuemax: 0,
        valuenow: 0
    };

    // Create a MutationObserver to watch for attribute changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName.includes('aria-valuenow')) {
                const progressBar = mutation.target;
                const currentValues = {
                    valuemin: parseInt(progressBar.getAttribute('aria-valuemin') || '0'),
                    valuemax: parseInt(progressBar.getAttribute('aria-valuemax') || '0'),
                    valuenow: parseInt(progressBar.getAttribute('aria-valuenow') || '0')
                };
                
                // Only log if values changed
                if (currentValues.valuenow !== previousValues.valuenow ||
                    currentValues.valuemax !== previousValues.valuemax) {
                    
                    console.group(`Video ${videoId} Progress Update`);
                    console.log('Current Time (aria-valuenow):', currentValues.valuenow);
                    console.log('Duration (aria-valuemax):', currentValues.valuemax);
                    console.log('Minimum (aria-valuemin):', currentValues.valuemin);
                    console.log('Progress:', 
                        currentValues.valuemax > 0 
                            ? `${(currentValues.valuenow / currentValues.valuemax * 100).toFixed(1)}%`
                            : '0%');
                    
                    // Detect important events
                    if (previousValues.valuemax === 0 && currentValues.valuemax > 0) {
                        console.log('EVENT: Video duration loaded');
                    }
                    if (currentValues.valuenow === currentValues.valuemax && currentValues.valuemax > 0) {
                        console.log('EVENT: Video completed');
                    }
                    
                    console.groupEnd();
                    
                    previousValues = currentValues;
                }
            }
        });
    });

    // Try to set up the observer immediately
    try {
        const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        const progressBar = innerDoc.querySelector('.ytp-progress-bar');
        
        if (progressBar) {
            observer.observe(progressBar, {
                attributes: true,
                attributeFilter: ['aria-valuenow', 'aria-valuemax', 'aria-valuemin'],
                subtree: false
            });
            console.log('Direct progress bar observer established');
            return;
        }
    } catch (e) {
        console.log('CORS prevented direct access, falling back to polling...');
    }

    // Fallback to polling if direct observation fails
    const pollInterval = setInterval(() => {
        try {
            const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            const progressBar = innerDoc.querySelector('.ytp-progress-bar');
            
            if (progressBar) {
                const currentValues = {
                    valuemin: parseInt(progressBar.getAttribute('aria-valuemin') || '0'),
                    valuemax: parseInt(progressBar.getAttribute('aria-valuemax') || '0'),
                    valuenow: parseInt(progressBar.getAttribute('aria-valuenow') || '0')
                };
                
                if (currentValues.valuenow !== previousValues.valuenow ||
                    currentValues.valuemax !== previousValues.valuemax) {
                    
                    console.group(`Video ${videoId} Polled Update`);
                    console.log('Current Time:', currentValues.valuenow);
                    console.log('Duration:', currentValues.valuemax);
                    console.log('Progress:', 
                        currentValues.valuemax > 0 
                            ? `${(currentValues.valuenow / currentValues.valuemax * 100).toFixed(1)}%`
                            : '0%');
                    console.groupEnd();
                    
                    previousValues = currentValues;
                }
            }
        } catch (e) {
            console.log(`Polling attempt failed for ${videoId}`);
        }
    }, 1000);

    // Clean up when iframe is removed
    const cleanupObserver = new MutationObserver(() => {
        if (!document.contains(iframe)) {
            observer.disconnect();
            clearInterval(pollInterval);
            cleanupObserver.disconnect();
            console.log(`Cleanup complete for video ${videoId}`);
        }
    });
    cleanupObserver.observe(document.body, { childList: true, subtree: true });
}
