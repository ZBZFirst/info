console.log('[FFT-Display] Module loading...');

let animationId = null;
let ctx = null;
let canvas = null;

export function init(visualizer) {
    console.log('[FFT-Display] Initializing with visualizer:', visualizer);
    
    if (!visualizer?.canvas) {
        console.error('[FFT-Display] No canvas provided in visualizer!');
        return;
    }

    canvas = visualizer.canvas;
    ctx = canvas.getContext('2d');
    
    console.log('[FFT-Display] Canvas context created:', ctx);

    function drawBars(dataArray, bufferLength) {
        console.debug('[FFT-Display] Drawing bars with buffer length:', bufferLength);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i];
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, `hsl(${200 + (i/bufferLength)*160}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${200 + (i/bufferLength)*160}, 100%, 20%)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    function drawWaveform(dataArray, bufferLength) {
        console.debug('[FFT-Display] Drawing waveform with buffer length:', bufferLength);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `hsl(200, 100%, 50%)`;
        ctx.beginPath();
        
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }

    function visualize(fftCalc, visualizer) {
        console.log('[FFT-Display] Starting visualization loop');
        
        function draw() {
            animationId = requestAnimationFrame(draw);
            
            const data = fftCalc.getProcessedData();
            if (!data) {
                console.warn('[FFT-Display] No audio data available');
                return;
            }
            
            // Clear canvas
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            console.debug(`[FFT-Display] Rendering mode: ${visualizer.settings.visualMode}`);
            switch(visualizer.settings.visualMode) {
                case 'bars':
                    drawBars(data.frequencyData, data.bufferLength);
                    break;
                case 'wave':
                    drawWaveform(data.timeData, data.bufferLength);
                    break;
                default:
                    console.warn(`[FFT-Display] Unknown visual mode: ${visualizer.settings.visualMode}`);
            }
        }
        
        draw();
    }

    return {
        start(fftCalc, visualizer) {
            console.log('[FFT-Display] Starting visualization');
            if (!fftCalc) {
                console.error('[FFT-Display] No FFT calculator provided');
                return;
            }
            visualize(fftCalc, visualizer);
        },
        
        stop() {
            console.log('[FFT-Display] Stopping visualization');
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            if (ctx && canvas) {
                ctx.fillStyle = 'rgb(0, 0, 0)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };
}
