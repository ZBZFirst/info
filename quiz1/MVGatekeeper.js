document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Find all YouTube iframes on the page
    const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
    
    console.log(`Found ${youtubeIframes.length} YouTube video(s) on this page`);
    
    // Analyze each YouTube iframe
    youtubeIframes.forEach((iframe, index) => {
        console.groupCollapsed(`YouTube Video #${index + 1}`);
        
        // Extract video ID from URL
        const videoId = extractVideoId(iframe.src);
        console.log('Video ID:', videoId);
        
        // Basic iframe information
        console.log('iframe dimensions:', {
            width: iframe.width,
            height: iframe.height,
            aspectRatio: iframe.width / iframe.height
        });
        
        // Attempt to access internal YouTube player elements
        try {
            const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Get player container
            const player = innerDoc.querySelector('.html5-video-player');
            console.log('Player element:', player ? 'Found' : 'Not found');
            
            // Get video title
            const titleElement = innerDoc.querySelector('.ytp-title-link');
            const videoTitle = titleElement ? titleElement.textContent : 'Unknown';
            console.log('Video title:', videoTitle);
            
            // Get progress information
            const progressBar = innerDoc.querySelector('.ytp-progress-bar');
            if (progressBar) {
                console.log('Progress bar:', {
                    currentTime: progressBar.getAttribute('aria-valuenow'),
                    duration: progressBar.getAttribute('aria-valuemax'),
                    percentage: (progressBar.getAttribute('aria-valuenow') / progressBar.getAttribute('aria-valuemax') * 100).toFixed(1) + '%'
                });
            }
            
            // Check player state
            const playButton = innerDoc.querySelector('.ytp-play-button');
            console.log('Player state:', playButton ? playButton.getAttribute('aria-label') : 'Unknown');
            
        } catch (e) {
            console.log('Could not access iframe internals due to CORS policy:', e.message);
            console.log('Try these alternative approaches:');
            console.log('- Use the YouTube Iframe API for authorized access');
            console.log('- Look for postMessage communication from the iframe');
            console.log('- Check for changes in the iframe URL parameters');
        }
        
        console.groupEnd();
    });
    
    // Helper function to extract YouTube video ID
    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
});
