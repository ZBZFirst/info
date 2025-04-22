document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Load YouTube API if not already loaded
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Find all YouTube iframes
    const youtubeIframes = Array.from(document.querySelectorAll('iframe'))
        .filter(iframe => iframe.src.includes('youtube.com/embed/') || iframe.src.includes('youtu.be/'));
    
    console.log(`Found ${youtubeIframes.length} YouTube video embeds`);

    // Store player instances and tracking data
    const players = [];
    const videoData = [];

    // This function will be called when YouTube API is ready
    window.onYouTubeIframeAPIReady = function() {
        youtubeIframes.forEach((iframe, index) => {
            try {
                const videoId = iframe.src.split('/embed/')[1]?.split('?')[0] || 
                               iframe.src.split('youtu.be/')[1]?.split('?')[0];
                
                videoData[index] = {
                    id: videoId,
                    duration: 0,
                    currentTime: 0,
                    percentWatched: 0
                };

                players[index] = new YT.Player(iframe, {
                    events: {
                        'onReady': (event) => onPlayerReady(event, index),
                        'onStateChange': (event) => onPlayerStateChange(event, index)
                    }
                });
            } catch (e) {
                console.error(`Failed to initialize player ${index + 1}:`, e);
            }
        });
    };

    function onPlayerReady(event, index) {
        const player = event.target;
        const duration = player.getDuration();
        videoData[index].duration = duration;
        
        console.log(`Player ${index + 1} ready (Video ID: ${videoData[index].id}, Duration: ${duration}s)`);
        
        // Start progress tracking
        videoData[index].interval = setInterval(() => updateProgress(player, index), 1000);
    }

    function onPlayerStateChange(event, index) {
        const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
        console.log(`Player ${index + 1} state: ${states[event.data]}`);
        
        if (event.data === YT.PlayerState.ENDED) {
            console.log(`Video ${index + 1} completed`);
        }
    }

    function updateProgress(player, index) {
        try {
            const currentTime = player.getCurrentTime();
            const duration = videoData[index].duration || player.getDuration();
            const percentWatched = (currentTime / duration * 100).toFixed(2);
            
            // Only log if progress changed significantly
            if (Math.abs(videoData[index].percentWatched - percentWatched) > 0.5) {
                videoData[index].currentTime = currentTime;
                videoData[index].percentWatched = percentWatched;
                
                console.group(`Video ${index + 1} Progress`);
                console.log('Current Time:', currentTime.toFixed(1) + 's');
                console.log('Duration:', duration.toFixed(1) + 's');
                console.log('Percent Watched:', percentWatched + '%');
                console.groupEnd();
                
                // You can add additional logic here when certain thresholds are reached
                if (percentWatched >= 90) {
                    console.log(`Video ${index + 1} nearly completed (${percentWatched}%)`);
                }
            }
        } catch (e) {
            console.warn(`Error updating progress for player ${index + 1}:`, e);
        }
    }

    // Clean up when page unloads
    window.addEventListener('beforeunload', function() {
        videoData.forEach((data, index) => {
            if (data.interval) {
                clearInterval(data.interval);
            }
        });
    });
});
