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
        // Method 1: Check for title attribute changes
        const titleObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'title') {
                    console.log('Player state changed (title):', iframe.title);
                }
            });
        });
        titleObserver.observe(iframe, { attributes: true });
        
        // Method 2: Check for class changes
        const classObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    console.log('Player class changed:', iframe.className);
                }
            });
        });
        classObserver.observe(iframe, { attributes: true });
        
        // Method 3: PostMessage listener (for potential communication)
        window.addEventListener('message', function(event) {
            if (event.source === iframe.contentWindow) {
                console.log('Received message from player:', event.data);
            }
        });

        console.log('Setting up state detection observers...');
    }
});
