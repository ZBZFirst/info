// MvGraph.js - Complete 3D Visualization Solution
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // 1. Initialize Three.js
  const container = document.getElementById('graph3d');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  // 2. Set up camera
  const camera = new THREE.PerspectiveCamera(
    75, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
  );
  camera.position.set(30, 30, 30);
  
  // 3. Configure renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // 4. Process all data points
  const containers = document.querySelectorAll('.container');
  const positions = new Float32Array(containers.length * 3);
  const colors = new Float32Array(containers.length * 3);
  
  // Find data ranges for normalization
  let yMin = Infinity, yMax = -Infinity;
  containers.forEach(container => {
    const y = parseFloat(container.style.getPropertyValue('--y'));
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  });

  // Create geometry
  containers.forEach((container, i) => {
    // Positions
    positions[i*3] = parseFloat(container.style.getPropertyValue('--x'));
    positions[i*3+1] = parseFloat(container.style.getPropertyValue('--y'));
    positions[i*3+2] = parseFloat(container.style.getPropertyValue('--z'));
    
    // Color mapping (blue to red)
    const normalizedY = (parseFloat(container.style.getPropertyValue('--y')) - yMin) / (yMax - yMin);
    const hue = 0.6 * (1 - normalizedY); // 0.6 = blue to red
    const color = new THREE.Color().setHSL(hue, 0.9, 0.5);
    colors[i*3] = color.r;
    colors[i*3+1] = color.g;
    colors[i*3+2] = color.b;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // 5. Create point cloud
  const material = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  const pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);

  // 6. Add coordinate axes
  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);

  // 7. Add orbit controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 8. Handle window resize
  window.addEventListener('resize', function() {
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
});
