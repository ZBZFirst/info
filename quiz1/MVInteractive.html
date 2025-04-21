<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D RR-VT-MV Visualization</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            font-family: Arial, sans-serif;
        }
        #container {
            position: absolute;
            width: 100%;
            height: 100%;
        }
        #controls {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.8);
            padding: 10px;
            border-radius: 5px;
            z-index: 100;
        }
        #data-table {
            position: absolute;
            bottom: 10px;
            left: 10px;
            right: 10px;
            height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ccc;
            display: none;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #f2f2f2;
            position: sticky;
            top: 0;
        }
        .color-dot {
            height: 10px;
            width: 10px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
        }
        button {
            margin: 5px;
            padding: 5px 10px;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <div id="controls">
        <button id="toggleTable">Show Data Table</button>
        <button id="resetView">Reset View</button>
        <div>
            <label for="vtSlider">VT Value: </label>
            <input type="range" id="vtSlider" min="0" max="20" value="0" step="1">
            <span id="vtValue">0.00</span>
        </div>
    </div>
    <div id="data-table">
        <table id="resultsTable">
            <thead>
                <tr>
                    <th>RR</th>
                    <th>VT</th>
                    <th>MV</th>
                    <th>RR Zone</th>
                    <th>VT Zone</th>
                    <th>MV Zone</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.min.js"></script>
    <script>
        // Configuration
        const config = {
            RR: {
                min: 0,
                max: 40,
                zones: [
                    { max: 8, color: 0xff0000 },    // Red
                    { max: 12, color: 0xffff00 },   // Yellow
                    { max: 20, color: 0x00ff00 },   // Green
                    { max: 30, color: 0xffff00 },   // Yellow
                    { max: 40, color: 0xff0000 }    // Red
                ]
            },
            VT: {
                min: 0,
                max: 1,
                step: 0.05,
                zones: [
                    { max: 0.15, color: 0xff0000 }, // Red
                    { max: 0.3, color: 0xffff00 },  // Yellow
                    { max: 0.65, color: 0x00ff00 }, // Green
                    { max: 0.75, color: 0xffff00 }, // Yellow
                    { max: 1, color: 0xff0000 }     // Red
                ]
            },
            MV: {
                zones: [
                    { max: 2, color: 0xff0000 },    // Red
                    { max: 4, color: 0xffff00 },   // Yellow
                    { max: 8, color: 0x00ff00 },   // Green
                    { max: 12, color: 0xffff00 },  // Yellow
                    { max: Infinity, color: 0xff0000 } // Red
                ]
            }
        };

        // Three.js variables
        let scene, camera, renderer, controls;
        let points = [];
        let currentVT = 0;
        let dataset = [];

        // Initialize the application
        init();

        function init() {
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0);

            // Create camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(40, 40, 40);

            // Create renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.getElementById('container').appendChild(renderer.domElement);

            // Add orbit controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;

            // Add axes helper
            const axesHelper = new THREE.AxesHelper(20);
            scene.add(axesHelper);

            // Add grid helper
            const gridHelper = new THREE.GridHelper(40, 40);
            scene.add(gridHelper);

            // Generate initial dataset
            generateDataset(currentVT);
            create3DGraph();

            // Event listeners
            window.addEventListener('resize', onWindowResize);
            document.getElementById('toggleTable').addEventListener('click', toggleDataTable);
            document.getElementById('resetView').addEventListener('click', resetView);
            document.getElementById('vtSlider').addEventListener('input', updateVTValue);

            // Start animation loop
            animate();
        }

        function generateDataset(vtValue) {
            dataset = [];
            for (let rr = config.RR.min; rr <= config.RR.max; rr++) {
                const mv = rr * vtValue;
                const mvRounded = parseFloat(mv.toFixed(2));
                
                dataset.push({
                    rr,
                    vt: vtValue,
                    mv: mvRounded,
                    rrColor: getColor(rr, config.RR.zones),
                    vtColor: getColor(vtValue, config.VT.zones),
                    mvColor: getColor(mvRounded, config.MV.zones)
                });
            }
            updateDataTable();
        }

        function getColor(value, zones) {
            for (const zone of zones) {
                if (value <= zone.max) {
                    return zone.color;
                }
            }
            return 0x888888; // Gray fallback
        }

        function create3DGraph() {
            // Clear existing points
            points.forEach(point => scene.remove(point));
            points = [];

            // Create points for each data entry
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            const colors = [];
            const sizes = [];

            dataset.forEach(data => {
                positions.push(data.rr, data.mv, 0);
                colors.push(
                    (data.mvColor >> 16 & 255) / 255,
                    (data.mvColor >> 8 & 255) / 255,
                    (data.mvColor & 255) / 255
                );
                sizes.push(5);
            });

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

            const material = new THREE.PointsMaterial({
                size: 5,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });

            const pointsMesh = new THREE.Points(geometry, material);
            scene.add(pointsMesh);
            points.push(pointsMesh);

            // Add labels
            addAxisLabels();
        }

        function addAxisLabels() {
            // X-axis (RR)
            for (let rr = 0; rr <= config.RR.max; rr += 5) {
                addLabel(rr, -2, 0, rr.toString(), 0x000000);
            }

            // Y-axis (MV)
            const maxMV = Math.max(...dataset.map(d => d.mv));
            for (let mv = 0; mv <= maxMV; mv += 2) {
                addLabel(-2, mv, 0, mv.toString(), 0x000000);
            }

            // Z-axis (VT)
            addLabel(-2, -2, 0, `VT: ${currentVT.toFixed(2)}`, 0x0000ff);
        }

        function addLabel(x, y, z, text, color) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 64;
            const context = canvas.getContext('2d');
            context.fillStyle = 'rgba(255, 255, 255, 0.7)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.font = '24px Arial';
            context.fillStyle = `rgb(${color >> 16}, ${color >> 8 & 255}, ${color & 255})`;
            context.textAlign = 'center';
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.position.set(x, y, z);
            sprite.scale.set(5, 2.5, 1);
            scene.add(sprite);
            points.push(sprite);
        }

        function updateDataTable() {
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = '';

            dataset.forEach(data => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${data.rr}</td>
                    <td>${data.vt.toFixed(3)}</td>
                    <td>${data.mv.toFixed(2)}</td>
                    <td><span class="color-dot" style="background-color: #${data.rrColor.toString(16).padStart(6, '0')}"></span>${getZoneName(data.rr, config.RR.zones)}</td>
                    <td><span class="color-dot" style="background-color: #${data.vtColor.toString(16).padStart(6, '0')}"></span>${getZoneName(data.vt, config.VT.zones)}</td>
                    <td><span class="color-dot" style="background-color: #${data.mvColor.toString(16).padStart(6, '0')}"></span>${getZoneName(data.mv, config.MV.zones)}</td>
                `;
                
                tableBody.appendChild(row);
            });
        }

        function getZoneName(value, zones) {
            for (const zone of zones) {
                if (value <= zone.max) {
                    if (zone.color === 0xff0000) return 'Red';
                    if (zone.color === 0xffff00) return 'Yellow';
                    if (zone.color === 0x00ff00) return 'Green';
                }
            }
            return 'Unknown';
        }

        function updateVTValue() {
            const slider = document.getElementById('vtSlider');
            currentVT = parseInt(slider.value) * 0.05;
            document.getElementById('vtValue').textContent = currentVT.toFixed(2);
            
            generateDataset(currentVT);
            create3DGraph();
        }

        function toggleDataTable() {
            const table = document.getElementById('data-table');
            table.style.display = table.style.display === 'none' ? 'block' : 'none';
        }

        function resetView() {
            controls.reset();
            camera.position.set(40, 40, 40);
            camera.lookAt(0, 0, 0);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
    </script>
</body>
</html>
