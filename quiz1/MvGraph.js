// MvGraph.js - Complete 3D Visualization Solution
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Three.js scene
  const container = document.getElementById('graph3d');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  // 2. Set up camera
  const camera = new THREE.PerspectiveCamera(
    60, // Wider field of view
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(40, 40, 40);
  camera.lookAt(0, 0, 0);

  // 3. Configure renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // 4. Process data points
  const containers = document.querySelectorAll('.container');
  const positions = new Float32Array(containers.length * 3);
  const colors = new Float32Array(containers.length * 3);
  
  // Find data ranges for normalization
  let yMin = Infinity, yMax = -Infinity;
  containers.forEach((container, i) => {
    const y = parseFloat(container.style.getPropertyValue('--y'));
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  });

  // Create geometry
  containers.forEach((container, i) => {
    // Positions
    positions[i * 3] = parseFloat(container.style.getPropertyValue('--x'));
    positions[i * 3 + 1] = parseFloat(container.style.getPropertyValue('--y'));
    positions[i * 3 + 2] = parseFloat(container.style.getPropertyValue('--z'));
    
    // Normalized colors (0-1 range)
    const normalizedY = (parseFloat(container.style.getPropertyValue('--y')) - yMin) / (yMax - yMin);
    const color = new THREE.Color().setHSL(
      0.6 * (1 - normalizedY), // Blue to red gradient
      0.9,
      0.4 + normalizedY * 0.4
    );
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // 5. Create point cloud
  const material = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // 6. Add coordinate system
  const axesHelper = new THREE.AxesHelper(25);
  scene.add(axesHelper);

  // 7. Add interactive controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI; // Allow full 3D rotation

  // 8. Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 9. Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // 10. Add point highlighting (optional)
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(points);
    
    if (intersects.length > 0) {
      // Highlight logic here
    }
  }
  window.addEventListener('mousemove', onMouseMove);
});
