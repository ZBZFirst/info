import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';

// Rest of your Three.js code remains the same
const container = document.getElementById('graph3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// 2. Extract data from DOM elements
const containers = document.querySelectorAll('.container');
const points = [];

containers.forEach(container => {
  points.push({
    x: parseFloat(container.style.getPropertyValue('--x')),
    y: parseFloat(container.style.getPropertyValue('--y')),
    z: parseFloat(container.style.getPropertyValue('--z')),
    element: container  // Reference to original DOM element
  });
});

// 3. Create 3D points
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(points.length * 3);
const colors = new Float32Array(points.length * 3);

points.forEach((point, i) => {
  positions[i * 3] = point.x;
  positions[i * 3 + 1] = point.y;
  positions[i * 3 + 2] = point.z;
  
  // Color by Y-value (normalized 0-1)
  const hue = point.y * 0.6; // 0-0.6 (red to green)
  const color = new THREE.Color().setHSL(hue, 0.9, 0.5);
  colors[i * 3] = color.r;
  colors[i * 3 + 1] = color.g;
  colors[i * 3 + 2] = color.b;
});

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.2,
  vertexColors: true,
  transparent: true,
  opacity: 0.8
});

const pointCloud = new THREE.Points(geometry, material);
scene.add(pointCloud);

// 4. Add axes helper
scene.add(new THREE.AxesHelper(20));

// 5. Camera positioning
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// 6. Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 7. Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// 8. Add orbit controls (for mouse interaction)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
