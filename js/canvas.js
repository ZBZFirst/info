console.log('[Canvas] Module loading...');

export function init(visualizer) {
    console.log('[Canvas] Initializing with visualizer:', visualizer);
    
    const canvas = document.getElementById('visualizer');
    if (!canvas) {
        console.error('[Canvas] Could not find canvas element!');
        return null;
    }

    console.log('[Canvas] Found canvas element:', canvas);

    function resizeCanvas() {
        console.log('[Canvas] Resizing canvas');
        const width = Math.min(800, window.innerWidth - 40);
        canvas.width = width;
        canvas.height = width * 0.5;
        console.debug(`[Canvas] New dimensions: ${canvas.width}x${canvas.height}`);
    }

    function handleFullscreenChange() {
        const isFullscreen = !!document.fullscreenElement;
        console.log(`[Canvas] Fullscreen change: ${isFullscreen}`);
        
        visualizer.settings.isFullscreen = isFullscreen;
        if (isFullscreen) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            resizeCanvas();
        }
    }

    // Initial setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    console.log('[Canvas] Setup complete');

    return {
        toggleFullscreen() {
            console.log('[Canvas] Toggling fullscreen');
            if (!document.fullscreenElement) {
                console.log('[Canvas] Entering fullscreen');
                canvas.requestFullscreen().catch(err => {
                    console.error('[Canvas] Fullscreen error:', err);
                });
            } else {
                console.log('[Canvas] Exiting fullscreen');
                document.exitFullscreen();
            }
        },
        
        getCanvas() {
            return canvas;
        }
    };
}
