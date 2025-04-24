// MVGatekeeper.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('MVGatekeeper.js initialized');

    // Initialize YouTube API
    initYouTubeAPI();

    // Disable quiz links initially
    disableQuizLinks();

    // Find all video containers on the page
    const videoContainers = document.querySelectorAll('.resource-card');
    console.log(`Found ${videoContainers.length} video containers`);

    // Store all YouTube players and their states
    const videoPlayers = {};
    let playersReady = 0;
    const totalVideos = videoContainers.length;

    // Function to initialize YouTube API
    function initYouTubeAPI() {
        console.log('Initializing YouTube API');
        
        // Check if YouTube API is already loaded
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            console.error('YouTube API not loaded');
            showYouTubeFallback();
            return;
        }

        console.log('YouTube API is available');
    }

    // Function to show fallback message if YouTube API fails
    function showYouTubeFallback() {
        const fallbackMessage = document.createElement('div');
        fallbackMessage.className = 'yt-fallback-message';
        fallbackMessage.innerHTML = `
            <strong>YouTube Player Error:</strong> 
            The YouTube player failed to load. Please ensure you have JavaScript enabled 
            and try refreshing the page. If the problem persists, you may need to 
            check your network connection or browser settings.
        `;
        document.body.insertBefore(fallbackMessage, document.body.firstChild);
    }

    // Function to disable all quiz links initially
    function disableQuizLinks() {
        const quizLinks = document.querySelectorAll('.quiz-link');
        quizLinks.forEach(link => {
            if (!link.href.includes('stripe.com')) { // Don't disable the access code link
                link.classList.add('disabled');
                link.addEventListener('click', function(e) {
                    if (this.classList.contains('disabled')) {
                        e.preventDefault();
                        console.log('Quiz link blocked - videos not completed');
                    }
                });
            }
        });
        console.log('Quiz links disabled');
    }

    // Function to enable quiz links when all videos are watched
    function enableQuizLinks() {
        const quizLinks = document.querySelectorAll('.quiz-link');
        quizLinks.forEach(link => {
            link.classList.remove('disabled');
        });
        console.log('Quiz links enabled');
    }

    // Function to check if all videos are completed
    function checkAllVideosCompleted() {
        const checkboxes = document.querySelectorAll('.video-completion input[type="checkbox"]');
        let allCompleted = true;
        
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allCompleted = false;
            }
        });

        if (allCompleted) {
            console.log('All videos completed!');
            enableQuizLinks();
            
            // Add celebration effect
            const cards = document.querySelectorAll('.resource-card');
            cards.forEach(card => {
                card.classList.add('completed');
            });
        }
        
        return allCompleted;
    }

    // Function to create YouTube player for each video container
    function createYouTubePlayers() {
        videoContainers.forEach((container, index) => {
            const iframe = container.querySelector('iframe');
            if (!iframe) return;

            const videoId = iframe.id;
            const videoCheckbox = container.querySelector('.video-completion input[type="checkbox"]');
            const progressBar = container.querySelector('.video-progress-bar');
            const progressText = container.querySelector('.video-progress-text');
            const videoDuration = videoCheckbox ? parseInt(videoCheckbox.dataset.videoDuration) : 0;

            console.log(`Setting up player for video ${index + 1} with ID: ${videoId}`);

            // Create YouTube player
            videoPlayers[videoId] = new YT.Player(videoId, {
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });

            function onPlayerReady(event) {
                playersReady++;
                console.log(`Player ${videoId} ready (${playersReady}/${totalVideos})`);
                
                if (playersReady === totalVideos) {
                    console.log('All YouTube players are ready');
                }
            }

            function onPlayerStateChange(event) {
                const currentTime = event.target.getCurrentTime();
                const duration = event.target.getDuration();
                const percentWatched = (currentTime / duration) * 100;

                // Update progress bar
                if (progressBar) {
                    progressBar.style.width = `${percentWatched}%`;
                }
                
                // Update progress text
                if (progressText) {
                    progressText.textContent = `${Math.round(percentWatched)}% watched`;
                }

                // Check if video is completed (watched at least 95%)
                if (percentWatched >= 95 && videoCheckbox) {
                    videoCheckbox.checked = true;
                    container.classList.add('completed');
                    progressBar.classList.add('complete');
                    console.log(`Video ${index + 1} completed`);
                    
                    // Check if all videos are now completed
                    checkAllVideosCompleted();
                }

                // Log player state changes
                const stateMap = {
                    [-1]: 'unstarted',
                    [0]: 'ended',
                    [1]: 'playing',
                    [2]: 'paused',
                    [3]: 'buffering',
                    [5]: 'video cued'
                };
                
                console.log(`Video ${index + 1} state: ${stateMap[event.data] || 'unknown'} (${Math.round(currentTime)}s/${Math.round(duration)}s)`);
            }
        });
    }

    // Wait for YouTube API to be ready
    function onYouTubeIframeAPIReady() {
        console.log('YouTube iframe API ready');
        createYouTubePlayers();
    }

    // Fallback in case onYouTubeIframeAPIReady isn't called
    setTimeout(() => {
        if (playersReady === 0 && typeof YT !== 'undefined') {
            console.log('Fallback: Initializing players after timeout');
            createYouTubePlayers();
        }
    }, 3000);

    // Expose the function to the global scope
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    // Manual completion fallback (for testing/demo purposes)
    document.querySelectorAll('.video-completion input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const container = this.closest('.resource-card');
            const progressBar = container.querySelector('.video-progress-bar');
            
            if (this.checked) {
                container.classList.add('completed');
                if (progressBar) {
                    progressBar.style.width = '100%';
                    progressBar.classList.add('complete');
                }
                console.log('Video manually marked as completed');
            } else {
                container.classList.remove('completed');
                if (progressBar) {
                    progressBar.classList.remove('complete');
                }
                console.log('Video completion unchecked');
            }
            
            checkAllVideosCompleted();
        });
    });

    // Add manual complete buttons for testing
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        document.querySelectorAll('.video-completion').forEach(container => {
            const button = document.createElement('button');
            button.className = 'manual-complete-btn';
            button.textContent = 'Mark as Complete (Dev)';
            button.addEventListener('click', function() {
                const checkbox = container.querySelector('input[type="checkbox"]');
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            });
            container.appendChild(button);
        });
        console.log('Added development controls');
    }
});
