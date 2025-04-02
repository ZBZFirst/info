<style>
    .shape-container {
        margin: 0;
        overflow: hidden;
        height: 100vh;
        position: relative;
        background-color: #f0f0f0;
        cursor: grab;
    }

    .shape {
        position: absolute;
        cursor: grab;
}

    #moving-circle {
        width: 80px;
        height: 80px;
        background-color: #FF6B6B;
        border-radius: 50%;
        z-index: 4;
    }

    #triangle {
        width: 0;
        height: 0;
        border-left: 50px solid transparent;
        border-right: 50px solid transparent;
        border-bottom: 100px solid #4ECDC4;
        top: 100px;
        left: 100px;
        z-index: 2;
    }

    #square {
        width: 120px;
        height: 120px;
        background-color: #FFE66D;
        top: 200px;
        left: 200px;
        z-index: 1;
    }

    #pentagon {
        width: 100px;
        height: 100px;
        background-color: #7D70BA;
        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        top: 150px;
        left: 300px;
        z-index: 3;
    }
</style>

<div class="shape-container">
    <div id="moving-circle" class="shape"></div>
    <div id="triangle" class="shape"></div>
    <div id="square" class="shape"></div>
    <div id="pentagon" class="shape"></div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const shapes = document.querySelectorAll('.shape');
        let activeShape = null;
        let offsetX, offsetY;

        // Make all shapes draggable
        shapes.forEach(shape => {
            shape.addEventListener('mousedown', startDrag);
        });

        function startDrag(e) {
            activeShape = e.target;
            // Calculate offset between mouse and shape's top-left corner
            offsetX = e.clientX - activeShape.getBoundingClientRect().left;
            offsetY = e.clientY - activeShape.getBoundingClientRect().top;
            
            activeShape.style.cursor = 'grabbing';
            document.addEventListener('mousemove', dragShape);
            document.addEventListener('mouseup', stopDrag);
            e.preventDefault(); // Prevent text selection while dragging
        }

        function dragShape(e) {
            if (!activeShape) return;
            
            // Update shape position (subtract offset to center drag)
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
