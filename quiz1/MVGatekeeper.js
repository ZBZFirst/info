document.addEventListener('DOMContentLoaded', function() {
    console.log('[Video Tracker] DOM fully loaded - initializing video tracking');
    
    // Load YouTube API if not already loaded
    if (!window.YT) {
        console.log('[Video Tracker] Loading YouTube IFrame API');
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        console.log('[Video Tracker] YouTube IFrame API already loaded');
    }

    // Find all YouTube iframes
    const youtubeIframes = Array.from(document.querySelectorAll('iframe'))
        .filter(iframe => iframe.src.includes('youtube.com/embed/') || iframe.src.includes('youtu.be/'));
    
    if (youtubeIframes.length === 0) {
        console.warn('[Video Tracker] No YouTube iframes found on page');
        return;
    }
    
    console.log(`[Video Tracker] Found ${youtubeIframes.length} YouTube video embeds`);

    // Store player instances and tracking data
    const players = [];
    const videoData = [];

    // This function will be called when YouTube API is ready
    window.onYouTubeIframeAPIReady = function() {
        console.log('[Video Tracker] YouTube IFrame API ready - initializing players');
        
        youtubeIframes.forEach((iframe, index) => {
            try {
                const videoId = iframe.src.split('/embed/')[1]?.split('?')[0] || 
                               iframe.src.split('youtu.be/')[1]?.split('?')[0];
                
                if (!videoId) {
                    console.error(`[Video Tracker] Could not extract video ID from iframe ${index + 1}`);
                    return;
                }
                
                // Get the corresponding checkbox
                const checkbox = document.getElementById(`video-check-${index+1}`);
                
                if (!checkbox) {
                    console.error(`[Video Tracker] Could not find checkbox for video ${index + 1}`);
                    return;
                }
                
                console.log(`[Video Tracker] Initializing player ${index + 1} for video ID: ${videoId}`);
                
                videoData[index] = {
                    id: videoId,
                    duration: 0,
                    currentTime: 0,
                    percentWatched: 0,
                    completed: false,
                    checkbox: checkbox,
                    lastLogTime: 0 // Track last progress log time
                };

                players[index] = new YT.Player(iframe, {
                    events: {
                        'onReady': (event) => onPlayerReady(event, index),
                        'onStateChange': (event) => onPlayerStateChange(event, index)
                    }
                });
            } catch (e) {
                console.error(`[Video Tracker] Failed to initialize player ${index + 1}:`, e);
            }
        });
    };

    function onPlayerReady(event, index) {
        try {
            const player = event.target;
            const duration = player.getDuration();
            videoData[index].duration = duration;
            
            console.log(`[Video Tracker] Player ${index + 1} ready (Video ID: ${videoData[index].id}, Duration: ${duration}s)`);
            
            // Enable the checkbox now that player is ready
            if (videoData[index].checkbox) {
                videoData[index].checkbox.disabled = false;
                console.log(`[Video Tracker] Enabled checkbox for video ${index + 1}`);
            }
            
            // Start progress tracking with less frequent updates
            videoData[index].interval = setInterval(() => updateProgress(player, index), 2000);
        } catch (e) {
            console.error(`[Video Tracker] Error in onPlayerReady for player ${index + 1}:`, e);
        }
    }

    function onPlayerStateChange(event, index) {
        try {
            const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
            const stateName = states[event.data] || 'UNKNOWN';
            
            console.log(`[Video Tracker] Player ${index + 1} state changed to: ${stateName}`);
            
            // Mark as completed when video ends
            if (event.data === YT.PlayerState.ENDED) {
                console.log(`[Video Tracker] Video ${index + 1} reached ENDED state`);
                markVideoAsComplete(index);
            }
        } catch (e) {
            console.error(`[Video Tracker] Error in onPlayerStateChange for player ${index + 1}:`, e);
        }
    }

    function updateProgress(player, index) {
        try {
            const currentTime = player.getCurrentTime();
            const duration = videoData[index].duration || player.getDuration();
            const percentWatched = (currentTime / duration * 100).toFixed(2);
            
            // Only log progress every 10% or when significant change occurs
            const now = Date.now();
            if (percentWatched % 10 === 0 || 
                Math.abs(videoData[index].percentWatched - percentWatched) > 5 || 
                now - videoData[index].lastLogTime > 30000) {
                
                console.log(`[Video Tracker] Video ${index + 1} progress: ${percentWatched}% (${currentTime.toFixed(1)}s/${duration.toFixed(1)}s)`);
                videoData[index].lastLogTime = now;
            }
            
            // Update tracking data
            videoData[index].currentTime = currentTime;
            videoData[index].percentWatched = percentWatched;
            
            // Check if video is effectively complete (watched at least 90%)
            if (percentWatched >= 90 && !videoData[index].completed) {
                console.log(`[Video Tracker] Video ${index + 1} reached 90% completion threshold`);
                markVideoAsComplete(index);
            }
        } catch (e) {
            console.error(`[Video Tracker] Error updating progress for player ${index + 1}:`, e);
        }
    }

    function markVideoAsComplete(index) {
        try {
            if (!videoData[index].completed && videoData[index].checkbox) {
                videoData[index].completed = true;
                videoData[index].checkbox.checked = true;
                console.log(`[Video Tracker] ✔ Video ${index + 1} marked as complete`);
                
                // Dispatch change event in case you have form validation
                const event = new Event('change');
                videoData[index].checkbox.dispatchEvent(event);
                
                // Clear the interval
                if (videoData[index].interval) {
                    clearInterval(videoData[index].interval);
                    console.log(`[Video Tracker] Stopped tracking for completed video ${index + 1}`);
                }
                
                // Add visual feedback to the card
                const card = videoData[index].checkbox.closest('.resource-card');
                if (card) {
                    card.classList.add('completed');
                    console.log(`[Video Tracker] Added visual completion indicator for video ${index + 1}`);
                }
            }
        } catch (e) {
            console.error(`[Video Tracker] Error marking video ${index + 1} as complete:`, e);
        }
    }

    // Clean up when page unloads
    window.addEventListener('beforeunload', function() {
        console.log('[Video Tracker] Page unloading - cleaning up intervals');
        videoData.forEach((data, index) => {
            if (data.interval) {
                clearInterval(data.interval);
                console.log(`[Video Tracker] Cleaned up interval for video ${index + 1}`);
            }
        });
    });
});

