console.log("[Canvas] Initializing canvas module");

export const init = (visualizer) => {
    console.log("[Canvas] Initializing canvas");
    
    const canvas = document.getElementById('visualizer-canvas');
    if (!canvas) {
        console.error("[Canvas] Canvas element not found");
        throw new Error("Canvas element with ID 'visualizer-canvas' not found");
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("[Canvas] Could not get 2D context");
        throw new Error("Could not get 2D rendering context");
    }
    
    // Store references
    visualizer.canvas = {
        element: canvas,
        ctx: ctx,
        width: canvas.width,
        height: canvas.height
    };
    
    // Handle window resize
    const handleResize = () => {
        if (!visualizer.settings.isFullscreen) {
            canvas.width = window.innerWidth * 0.8;
            canvas.height = window.innerHeight * 0.6;
        }
        visualizer.canvas.width = canvas.width;
        visualizer.canvas.height = canvas.height;
        console.log(`[Canvas] Resized to ${canvas.width}x${canvas.height}`);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing
    
    // Animation loop
    const animate = () => {
        if (!visualizer.isRunning) {
            requestAnimationFrame(animate);
            return;
        }
        
        const data = visualizer.fftCalc.getProcessedData();
        if (!data) {
            requestAnimationFrame(animate);
            return;
        }
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw based on visual mode
        switch (visualizer.settings.visualMode) {
            case 'bars':
                drawBars(visualizer, ctx, data);
                break;
            case 'wave':
                drawWave(visualizer, ctx, data);
                break;
            case 'circle':
                drawCircle(visualizer, ctx, data);
                break;
            default:
                drawBars(visualizer, ctx, data);
        }
        
        requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animate();
    
    return {
        element: canvas,
        ctx: ctx,
        toggleFullscreen: () => toggleFullscreen(visualizer)
    };
};

export const toggleFullscreen = (visualizer) => {
    const canvas = visualizer.canvas.element;
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            console.error("[Canvas] Fullscreen error:", err);
        });
        visualizer.settings.isFullscreen = true;
        canvas.width = window.screen.width;
        canvas.height = window.screen.height;
    } else {
        document.exitFullscreen();
        visualizer.settings.isFullscreen = false;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.6;
    }
    visualizer.canvas.width = canvas.width;
    visualizer.canvas.height = canvas.height;
};

// Visualization drawing functions
function drawBars(visualizer, ctx, data) {
    const { frequencyData, bufferLength } = data;
    const barWidth = visualizer.canvas.width / bufferLength * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (frequencyData[i] / 255) * visualizer.canvas.height * 
                         visualizer.settings.baseSensitivity;
        
        const hue = i / bufferLength * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(
            x,
            visualizer.canvas.height - barHeight,
            barWidth,
            barHeight
        );
        
        x += barWidth + 1;
    }
}

function drawWave(visualizer, ctx, data) {
    const { timeData, bufferLength } = data;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    
    const sliceWidth = visualizer.canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = v * visualizer.canvas.height / 2;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.lineTo(visualizer.canvas.width, visualizer.canvas.height / 2);
    ctx.stroke();
}

function drawCircle(visualizer, ctx, data) {
    const { frequencyData, bufferLength } = data;
    const centerX = visualizer.canvas.width / 2;
    const centerY = visualizer.canvas.height / 2;
    const radius = Math.min(visualizer.canvas.width, visualizer.canvas.height) * 0.4;
    
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const value = (frequencyData[i] / 255) * radius * visualizer.settings.baseSensitivity;
        
        const x = centerX + Math.cos(angle) * (radius + value);
        const y = centerY + Math.sin(angle) * (radius + value);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.strokeStyle = `hsl(${Date.now() / 20 % 360}, 100%, 50%)`;
    ctx.stroke();
}
