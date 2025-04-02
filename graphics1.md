---
layout: default
title: Interactive Draggable Graphics
---

<style>
    .shape-container {
        margin: 0;
        overflow: hidden;
        height: 100vh;
        position: relative;
        background: url('image.png') no-repeat center center;
        background-size: contain;
        background-color: #f0f0f0; /* Fallback if image doesn't load */
        cursor: grab;
    }

    .shape {
        position: absolute;
        cursor: grab;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        font-weight: bold;
        user-select: none;
    }

    .shape-label {
        background-color: white;
        color: black;
        padding: 2px 6px;
        border-radius: 3px;
        pointer-events: none;
        z-index: 10; /* Ensure label stays above everything */
    }

    /* Shape outlines with proper sizing */
    #moving-circle {
        width: 88px; /* Original width + border */
        height: 88px;
        border: 4px solid #FF6B6B;
        border-radius: 50%;
        background-color: transparent;
        z-index: 4;
    }

    #triangle {
        width: 108px; /* Adjusted for border */
        height: 94px;
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        background-color: transparent;
        border: 4px solid #4ECDC4;
        top: 100px;
        left: 100px;
        z-index: 2;
    }

    #square {
        width: 128px; /* Original + border */
        height: 128px;
        border: 4px solid #FFE66D;
        background-color: transparent;
        top: 200px;
        left: 200px;
        z-index: 1;
    }

    #pentagon {
        width: 108px; /* Adjusted for border */
        height: 108px;
        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        background-color: transparent;
        border: 4px solid #7D70BA;
        top: 150px;
        left: 300px;
        z-index: 3;
    }

    /* Ensure shapes are properly layered */
    .shape > * {
        position: relative;
    }
</style>

<div class="shape-container">
    <div id="moving-circle" class="shape">
        <div class="shape-label" contenteditable="true">Circle</div>
    </div>
    <div id="triangle" class="shape">
        <div class="shape-label" contenteditable="true">Triangle</div>
    </div>
    <div id="square" class="shape">
        <div class="shape-label" contenteditable="true">Square</div>
    </div>
    <div id="pentagon" class="shape">
        <div class="shape-label" contenteditable="true">Pentagon</div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const shapes = document.querySelectorAll('.shape');
        let activeShape = null;
        let offsetX, offsetY;
        let isEditingText = false;

        // Make all shapes draggable
        shapes.forEach(shape => {
            shape.addEventListener('mousedown', startDrag);
            
            const label = shape.querySelector('.shape-label');
            label.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                isEditingText = true;
                label.contentEditable = true;
                label.focus();
            });
            
            label.addEventListener('blur', () => {
                isEditingText = false;
                label.contentEditable = false;
            });
        });

        function startDrag(e) {
            if (isEditingText || e.target.classList.contains('shape-label')) return;
            
            activeShape = e.target.closest('.shape');
            if (!activeShape) return;
            
            const rect = activeShape.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            activeShape.style.cursor = 'grabbing';
            document.addEventListener('mousemove', dragShape);
            document.addEventListener('mouseup', stopDrag);
            e.preventDefault();
        }

        function dragShape(e) {
            if (!activeShape) return;
            
            activeShape.style.left = `${e.clientX - offsetX}px`;
            activeShape.style.top = `${e.clientY - offsetY}px`;
        }

        function stopDrag() {
            if (activeShape) {
                activeShape.style.cursor = 'grab';
                activeShape = null;
            }
            document.removeEventListener('mousemove', dragShape);
            document.removeEventListener('mouseup', stopDrag);
        }

        // Handle window resize to maintain background
        window.addEventListener('resize', function() {
            const container = document.querySelector('.shape-container');
            container.style.backgroundSize = 'contain';
        });
    });
</script>
