document.addEventListener('DOMContentLoaded', function() {
    console.debug('[YT-Loader] DOM fully loaded - initializing YouTube tracking system');

    // Load YouTube API if not already loaded
    if (!window.YT) {
        console.debug('[YT-Loader] Loading YouTube IFrame API');
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onerror = () => console.error('[YT-Loader] Failed to load YouTube API script');
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        console.debug('[YT-Loader] YouTube API already loaded');
    }

    // Global players array with status tracking
    const videoPlayers = {
        players: [],
        status: [],
        initAttempts: 0,
        maxInitAttempts: 3
    };

    // Called when YouTube API is ready
    window.onYouTubeIframeAPIReady = function() {
        console.debug('[YT-Loader] YouTube API ready - initializing players');
        initializeAllPlayers();
    };

    function initializeAllPlayers() {
        const videoContainers = document.querySelectorAll('.embed-container');
        console.debug(`[YT-Loader] Found ${videoContainers.length} video containers`);

        videoContainers.forEach((container, index) => {
            try {
                console.debug(`[YT-Player ${index}] Initializing...`);
                const iframe = container.querySelector('iframe');
                
                if (!iframe) {
                    console.error(`[YT-Player ${index}] No iframe found in container`);
                    return;
                }

                const videoId = extractVideoId(iframe.src);
                if (!videoId) {
                    console.error(`[YT-Player ${index}] Could not extract video ID from URL: ${iframe.src}`);
                    return;
                }

                console.debug(`[YT-Player ${index}] Creating player for video ID: ${videoId}`);
                videoPlayers.status[index] = {
                    state: 'initializing',
                    videoId: videoId,
                    metadata: null,
                    errors: []
                };

                new YT.Player(iframe, {
                    videoId: videoId,
                    events: {
                        'onReady': (event) => onPlayerReady(event, index),
                        'onStateChange': (event) => onPlayerStateChange(event, index),
                        'onError': (event) => onPlayerError(event, index)
                    }
                });
            } catch (e) {
                console.error(`[YT-Player ${index}] Initialization error:`, e);
                recordError(index, 'initialization', e);
            }
        });
    }

    function extractVideoId(url) {
        try {
            const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        } catch (e) {
            console.error('[YT-Loader] URL parsing error:', e);
            return null;
        }
    }

    function onPlayerReady(event, index) {
        console.debug(`[YT-Player ${index}] Player ready`);
        const player = event.target;
        videoPlayers.players[index] = player;
        videoPlayers.status[index].state = 'ready';

        try {
            // Mute to help with autoplay restrictions
            player.mute();
            console.debug(`[YT-Player ${index}] Attempting play/pause to load metadata`);
            player.playVideo();
        } catch (e) {
            console.error(`[YT-Player ${index}] Play command failed:`, e);
            recordError(index, 'play_command', e);
            // Fallback to direct metadata load
            loadMetadataDirectly(player, index);
        }
    }

    function onPlayerStateChange(event, index) {
        const states = ['UNSTARTED', 'ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'];
        const player = event.target;
        const currentState = states[event.data];
        
        console.debug(`[YT-Player ${index}] State changed to: ${currentState}`);
        videoPlayers.status[index].lastState = currentState;

        try {
            switch (event.data) {
                case YT.PlayerState.PLAYING:
                    console.debug(`[YT-Player ${index}] Pausing to capture metadata`);
                    player.pauseVideo();
                    break;
                    
                case YT.PlayerState.PAUSED:
                    if (!videoPlayers.status[index].metadata) {
                        loadMetadataDirectly(player, index);
                    }
                    break;
                    
                case YT.PlayerState.ENDED:
                case YT.PlayerState.BUFFERING:
                    // Handle additional states if needed
                    break;
            }
        } catch (e) {
            console.error(`[YT-Player ${index}] State change handling error:`, e);
            recordError(index, 'state_change', e);
        }
    }

    function loadMetadataDirectly(player, index) {
        console.debug(`[YT-Player ${index}] Loading metadata directly`);
        try {
            const metadata = {
                duration: player.getDuration(),
                videoUrl: player.getVideoUrl(),
                availableQualityLevels: player.getAvailableQualityLevels(),
                videoEmbedCode: player.getVideoEmbedCode(),
                loadedAt: new Date().toISOString()
            };
            
            videoPlayers.status[index].metadata = metadata;
            videoPlayers.status[index].state = 'metadata_loaded';
            
            console.debug(`[YT-Player ${index}] Metadata loaded:`, metadata);
            initializeTrackingSystem(index, metadata.duration);
            
        } catch (e) {
            console.error(`[YT-Player ${index}] Metadata load failed:`, e);
            recordError(index, 'metadata_load', e);
            attemptRetry(index);
        }
    }

    function initializeTrackingSystem(index, duration) {
        console.debug(`[YT-Player ${index}] Initializing tracking system for duration: ${duration}s`);
        try {
            const durationSeconds = Math.ceil(duration);
            const trackingArray = new Array(durationSeconds).fill(0);
            
            videoPlayers.status[index].tracking = {
                array: trackingArray,
                lastUpdated: new Date().toISOString(),
                percentComplete: 0
            };
            
            console.debug(`[YT-Player ${index}] Tracking initialized with ${durationSeconds} second array`);
            console.table({
                'Player Index': index,
                'Video ID': videoPlayers.status[index].videoId,
                'Duration': duration,
                'Status': 'READY_FOR_TRACKING'
            });
            
        } catch (e) {
            console.error(`[YT-Player ${index}] Tracking init failed:`, e);
            recordError(index, 'tracking_init', e);
        }
    }

    function onPlayerError(event, index) {
        const errorCodes = {
            2: 'INVALID_PARAMETER',
            5: 'HTML5_ERROR',
            100: 'VIDEO_NOT_FOUND',
            101: 'EMBED_NOT_ALLOWED'
        };
        const errorMsg = errorCodes[event.data] || `UNKNOWN_ERROR (${event.data})`;
        console.error(`[YT-Player ${index}] Player error: ${errorMsg}`);
        recordError(index, 'player_error', errorMsg);
        attemptRetry(index);
    }

    function recordError(index, errorType, error) {
        if (!videoPlayers.status[index]) return;
        
        if (!videoPlayers.status[index].errors) {
            videoPlayers.status[index].errors = [];
        }
        
        videoPlayers.status[index].errors.push({
            type: errorType,
            error: error instanceof Error ? error.message : error,
            timestamp: new Date().toISOString()
        });
    }

    function attemptRetry(index) {
        videoPlayers.initAttempts++;
        if (videoPlayers.initAttempts <= videoPlayers.maxInitAttempts) {
            console.debug(`[YT-Player ${index}] Attempting retry (${videoPlayers.initAttempts}/${videoPlayers.maxInitAttempts})`);
            setTimeout(() => {
                if (videoPlayers.players[index]) {
                    videoPlayers.players[index].playVideo();
                }
            }, 2000 * videoPlayers.initAttempts);
        } else {
            console.error(`[YT-Player ${index}] Max retry attempts reached`);
        }
    }

    // Debugging utility
    window.getVideoStatus = function() {
        console.groupCollapsed('[YT-Loader] Current System Status');
        console.debug('Players initialized:', videoPlayers.players.length);
        console.table(videoPlayers.status.map((s, i) => ({
            'Player': i,
            'Video ID': s?.videoId || 'N/A',
            'State': s?.state || 'uninitialized',
            'Errors': s?.errors?.length || 0,
            'Duration': s?.metadata?.duration || 'N/A'
        })));
        console.groupEnd();
    };

    // Initial debug status
    setTimeout(() => {
        console.debug('[YT-Loader] Initialization complete');
        window.getVideoStatus();
    }, 3000);
});
