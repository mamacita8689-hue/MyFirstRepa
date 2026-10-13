import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('threeScene');
const colorButton = document.getElementById('colorButton');
const rotationButton = document.getElementById('rotationButton');
const button = document.getElementById('button');
const reset = document.getElementById('reset');
const count = document.getElementById('count');
const status = document.getElementById('status');

let clicks = 0;
let autoRotate = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(3.2, 2.4, 4.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 2.4;
controls.maxDistance = 8;
controls.target.set(0, 0.25, 0);

const ambientLight = new THREE.HemisphereLight(0xffffff, 0x223344, 1.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(4, 5, 3);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x60a5fa, 10, 12, 2);
fillLight.position.set(-3, 1.5, 2);
scene.add(fillLight);

const geometry = new THREE.BoxGeometry(1.7, 1.7, 1.7);
const material = new THREE.MeshStandardMaterial({
  color: 0x3b82f6,
  metalness: 0.22,
  roughness: 0.32
});

const cube = new THREE.Mesh(geometry, material);
cube.position.y = 0.95;
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

const edgeGeometry = new THREE.EdgesGeometry(geometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
cube.add(edges);

const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x1f2937,
  roughness: 0.85,
  metalness: 0.05
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(9, 18, 0x64748b, 0x334155);
grid.position.y = 0.002;
scene.add(grid);

const materials = [
  { color: 0x3b82f6, metalness: 0.22, roughness: 0.32 },
  { color: 0x10b981, metalness: 0.05, roughness: 0.5 },
  { color: 0xf43f5e, metalness: 0.1, roughness: 0.38 },
  { color: 0xa855f7, metalness: 0.45, roughness: 0.2 },
  { color: 0xf59e0b, metalness: 0.2, roughness: 0.42 }
];
let materialIndex = 0;

function resizeRenderer() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(container);
resizeRenderer();

colorButton.addEventListener('click', () => {
  materialIndex = (materialIndex + 1) % materials.length;
  const preset = materials[materialIndex];
  material.color.setHex(preset.color);
  material.metalness = preset.metalness;
  material.roughness = preset.roughness;
  material.needsUpdate = true;
  status.textContent = `Материал куба изменён (${materialIndex + 1}/${materials.length}).`;
});

rotationButton.addEventListener('click', () => {
  autoRotate = !autoRotate;
  rotationButton.textContent = autoRotate ? 'Остановить вращение' : 'Запустить вращение';
  status.textContent = autoRotate ? 'Автовращение включено.' : 'Автовращение остановлено.';
});

button.addEventListener('click', () => {
  clicks += 1;
  count.textContent = clicks;
  status.textContent = clicks === 1
    ? 'JavaScript и Three.js работают.'
    : `Всё работает. Нажатий: ${clicks}.`;
});

reset.addEventListener('click', () => {
  clicks = 0;
  count.textContent = '0';
  camera.position.set(3.2, 2.4, 4.2);
  controls.target.set(0, 0.25, 0);
  controls.update();
  status.textContent = 'Счётчик и камера сброшены.';
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  if (autoRotate) {
    cube.rotation.y += delta * 0.65;
    cube.rotation.x += delta * 0.18;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
