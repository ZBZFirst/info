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
                
                // Get the corresponding checkbox
                const checkbox = document.getElementById(`video-check-${index+1}`);
                
                videoData[index] = {
                    id: videoId,
                    duration: 0,
                    currentTime: 0,
                    percentWatched: 0,
                    completed: false,
                    checkbox: checkbox
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
        
        // Enable the checkbox now that player is ready
        if (videoData[index].checkbox) {
            videoData[index].checkbox.disabled = false;
        }
        
        // Start progress tracking
        videoData[index].interval = setInterval(() => updateProgress(player, index), 1000);
    }

    function onPlayerStateChange(event, index) {
        const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
        console.log(`Player ${index + 1} state: ${states[event.data]}`);
        
        // Mark as completed when video ends
        if (event.data === YT.PlayerState.ENDED) {
            markVideoAsComplete(index);
        }
    }

    function updateProgress(player, index) {
        try {
            const currentTime = player.getCurrentTime();
            const duration = videoData[index].duration || player.getDuration();
            const percentWatched = (currentTime / duration * 100).toFixed(2);
            
            // Update tracking data
            videoData[index].currentTime = currentTime;
            videoData[index].percentWatched = percentWatched;
            
            // Check if video is effectively complete (watched at least 90%)
            if (percentWatched >= 90 && !videoData[index].completed) {
                markVideoAsComplete(index);
            }
        } catch (e) {
            console.warn(`Error updating progress for player ${index + 1}:`, e);
        }
    }

    function markVideoAsComplete(index) {
        if (!videoData[index].completed && videoData[index].checkbox) {
            videoData[index].completed = true;
            videoData[index].checkbox.checked = true;
            console.log(`Video ${index + 1} marked as complete`);
            
            // Dispatch change event in case you have form validation
            const event = new Event('change');
            videoData[index].checkbox.dispatchEvent(event);
            
            // Clear the interval
            if (videoData[index].interval) {
                clearInterval(videoData[index].interval);
            }
        }
    }

    // Clean up when page unloads
    window.addEventListener('beforeunload', function() {
        videoData.forEach((data) => {
            if (data.interval) {
                clearInterval(data.interval);
            }
        });
    });
});
