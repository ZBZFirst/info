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
        background-size: cover;
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
        pointer-events: none; /* Allows clicks to pass through to shape */
    }

    #moving-circle {
        width: 80px;
        height: 80px;
        border: 4px solid #FF6B6B;
        border-radius: 50%;
        background-color: transparent;
        z-index: 4;
    }

    #triangle {
        width: 100px;
        height: 86px; /* height = width * √3/2 */
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        background-color: transparent;
        border: 4px solid #4ECDC4;
        top: 100px;
        left: 100px;
        z-index: 2;
    }

    #square {
        width: 120px;
        height: 120px;
        border: 4px solid #FFE66D;
        background-color: transparent;
        top: 200px;
        left: 200px;
        z-index: 1;
    }

    #pentagon {
        width: 100px;
        height: 100px;
        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        background-color: transparent;
        border: 4px solid #7D70BA;
        top: 150px;
        left: 300px;
        z-index: 3;
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
            
            // Handle double-click for text editing
            const label = shape.querySelector('.shape-label');
            label.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                isEditingText = true;
                label.focus();
            });
            
            label.addEventListener('blur', () => {
                isEditingText = false;
            });
        });

        function startDrag(e) {
            if (isEditingText) return;
            
            activeShape = e.target.closest('.shape');
            if (!activeShape) return;
            
            // Calculate offset between mouse and shape's top-left corner
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
    });
</script>
