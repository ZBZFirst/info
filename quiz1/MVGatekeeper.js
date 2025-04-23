document.addEventListener('DOMContentLoaded', function() {
    // Load YouTube API if not already loaded
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // This will store all player instances
    const players = [];
    
    // Called when YouTube API is ready
    window.onYouTubeIframeAPIReady = function() {
        const videoContainers = document.querySelectorAll('.embed-container');
        
        videoContainers.forEach((container, index) => {
            const iframe = container.querySelector('iframe');
            const videoId = extractVideoId(iframe.src);
            
            if (!videoId) {
                console.error(`Could not extract video ID from iframe ${index + 1}`);
                return;
            }

            players[index] = new YT.Player(iframe, {
                videoId: videoId,
                events: {
                    'onReady': (event) => onPlayerReady(event, index),
                    'onStateChange': (event) => onPlayerStateChange(event, index)
                }
            });
        });
    };

    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function onPlayerReady(event, index) {
        const player = event.target;
        console.log(`Player ${index + 1} ready`);
        
        // Attempt to play then immediately pause to load metadata
        player.playVideo();
        
        // Store player reference
        players[index] = player;
    }

    function onPlayerStateChange(event, index) {
        const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
        console.log(`Player ${index + 1} state: ${states[event.data]}`);
        
        if (event.data === YT.PlayerState.PLAYING) {
            // Immediately pause after play starts to get metadata
            event.target.pauseVideo();
            logVideoMetadata(event.target, index);
        }
    }

    function logVideoMetadata(player, index) {
        // Get all available metadata
        const metadata = {
            duration: player.getDuration(),
            videoUrl: player.getVideoUrl(),
            availableQualityLevels: player.getAvailableQualityLevels(),
            videoEmbedCode: player.getVideoEmbedCode()
        };
        
        console.log(`Player ${index + 1} Metadata:`, metadata);
        
        // Now we can initialize our tracking array
        initializeTrackingArray(index, metadata.duration);
    }

    function initializeTrackingArray(index, duration) {
        const durationSeconds = Math.ceil(duration);
        console.log(`Initializing tracking array for video ${index + 1} with ${durationSeconds} seconds`);
        
        // Here you would store this in your tracking system
        // For now we'll just log it
        const trackingArray = new Array(durationSeconds).fill(0);
        console.log(`Tracking array for video ${index + 1}:`, trackingArray);
    }
});
