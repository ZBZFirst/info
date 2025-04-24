// abg-background.js
document.addEventListener('DOMContentLoaded', function() {
    // Get the classification element to observe
    const classificationElement = document.getElementById('classification');
    
    // Create a MutationObserver to watch for changes in the classification
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                updateBackgroundColor();
            }
        });
    });
    
    // Start observing the classification element
    observer.observe(classificationElement, {
        characterData: true,
        childList: true,
        subtree: true
    });
    
    // Also observe the style changes (color)
    observer.observe(classificationElement, {
        attributes: true,
        attributeFilter: ['style']
    });
    
    // Initial update
    updateBackgroundColor();
    
    function updateBackgroundColor() {
        // Get the current classification color
        const color = classificationElement.style.color;
        
        if (color) {
            // Apply the color to the body background with reduced opacity
            document.body.style.background = `linear-gradient(to bottom, rgba(${hexToRgb(color)}, 0.1), #fafafa)`;
            
            // Optional: Add a subtle animation
            document.body.style.transition = 'background 1s ease';
        }
    }
    
    // Helper function to convert hex color to rgb
    function hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Convert shorthand hex to full form
        if (hex.length === 3) {
            hex = hex.split('').map(function(hexPart) {
                return hexPart + hexPart;
            }).join('');
        }
        
        // Parse to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }
});
