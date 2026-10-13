import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('threeScene');
const paletteButton = document.getElementById('paletteButton');
const rotationButton = document.getElementById('rotationButton');
const resetButton = document.getElementById('resetButton');
const status = document.getElementById('status');

let autoMotion = true;
let paletteIndex = 0;
let ship = null;

const palettes = [
  { name: 'Ледяная туманность', bg: 0x02040a, planet: 0x4f7cff, atmosphere: 0x7dd3fc, ring: 0xa5b4fc, light: 0xbfe7ff },
  { name: 'Пурпурный рассвет', bg: 0x08030d, planet: 0x8b5cf6, atmosphere: 0xf0abfc, ring: 0xf5d0fe, light: 0xffd7f5 },
  { name: 'Изумрудный шторм', bg: 0x020806, planet: 0x0f766e, atmosphere: 0x5eead4, ring: 0xa7f3d0, light: 0xb7fff2 },
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(palettes[0].bg);
scene.fog = new THREE.FogExp2(palettes[0].bg, 0.018);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 300);
camera.position.set(8.2, 4.2, 11.8);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 5.8;
controls.maxDistance = 22;
controls.target.set(0, 0.2, 0);

const world = new THREE.Group();
scene.add(world);

const glowTexture = makeGlowTexture();
scene.add(new THREE.AmbientLight(0x1f2a44, 0.7));

const keyLight = new THREE.DirectionalLight(palettes[0].light, 3.4);
keyLight.position.set(7, 5, 8);
scene.add(keyLight);

const rimLight = new THREE.PointLight(palettes[0].atmosphere, 80, 25, 2);
rimLight.position.set(-6, -1, 3);
scene.add(rimLight);

const planetMaterial = new THREE.MeshStandardMaterial({
  color: palettes[0].planet,
  roughness: 0.8,
  metalness: 0.04,
  map: makePlanetTexture(),
});
const planet = new THREE.Mesh(new THREE.SphereGeometry(2.15, 80, 80), planetMaterial);
planet.rotation.z = THREE.MathUtils.degToRad(-14);
world.add(planet);

const atmosphereMaterial = new THREE.MeshBasicMaterial({
  color: palettes[0].atmosphere,
  transparent: true,
  opacity: 0.13,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.29, 64, 64), atmosphereMaterial);
world.add(atmosphere);

const ringMaterial = new THREE.MeshBasicMaterial({
  color: palettes[0].ring,
  transparent: true,
  opacity: 0.65,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const rings = new THREE.Mesh(new THREE.RingGeometry(2.8, 4.55, 160), ringMaterial);
rings.rotation.x = THREE.MathUtils.degToRad(68);
rings.rotation.z = THREE.MathUtils.degToRad(8);
world.add(rings);

const moonPivot = new THREE.Group();
world.add(moonPivot);
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.42, 40, 40),
  new THREE.MeshStandardMaterial({ color: 0xd7e3f2, roughness: 0.92 })
);
moon.position.set(4.9, 0.8, 0.3);
moonPivot.add(moon);

const stars = createStarField(3600, 38, 105, 0.08);
scene.add(stars);
const dust = createDustBelt(900);
world.add(dust);

const distantGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: glowTexture, color: palettes[0].light, transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending, depthWrite: false })
);
distantGlow.position.set(7, 4.5, -5);
distantGlow.scale.set(8, 8, 8);
scene.add(distantGlow);

const shipPivot = new THREE.Group();
shipPivot.rotation.x = THREE.MathUtils.degToRad(-8);
world.add(shipPivot);

const loader = new GLTFLoader();
loader.load(
  'models/spaceship.gltf',
  (gltf) => {
    ship = gltf.scene;
    ship.scale.setScalar(0.58);
    ship.position.set(6.3, 1.35, 0);
    ship.rotation.set(0.12, Math.PI * 0.55, -0.12);
    ship.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    shipPivot.add(ship);
    status.textContent = 'Корабль GLTF загружен. Потяни сцену мышью и осмотри его.';
  },
  undefined,
  (error) => {
    console.error(error);
    status.textContent = 'Не удалось загрузить models/spaceship.gltf';
  }
);

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.18, 'rgba(255,255,255,.8)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,.15)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makePlanetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#a7c9ff');
  gradient.addColorStop(0.42, '#4e76c8');
  gradient.addColorStop(0.72, '#233f7a');
  gradient.addColorStop(1, '#142443');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 70; i += 1) {
    const y = Math.random() * 512;
    const h = 5 + Math.random() * 22;
    ctx.fillStyle = `rgba(235,245,255,${0.025 + Math.random() * 0.08})`;
    ctx.fillRect(0, y, 1024, h);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function createStarField(count, minRadius, maxRadius, size) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = THREE.MathUtils.lerp(minRadius, maxRadius, Math.pow(Math.random(), 0.7));
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0xf2f7ff,
    size,
    map: glowTexture,
    transparent: true,
    opacity: 0.95,
    alphaTest: 0.02,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
}

function createDustBelt(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.randFloat(5.2, 8.7);
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(1.1);
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xc7d2fe, size: 0.055, transparent: true, opacity: 0.36, depthWrite: false }));
  points.rotation.x = THREE.MathUtils.degToRad(16);
  return points;
}

function applyPalette() {
  const p = palettes[paletteIndex];
  scene.background.setHex(p.bg);
  scene.fog.color.setHex(p.bg);
  planetMaterial.color.setHex(p.planet);
  atmosphereMaterial.color.setHex(p.atmosphere);
  ringMaterial.color.setHex(p.ring);
  keyLight.color.setHex(p.light);
  rimLight.color.setHex(p.atmosphere);
  distantGlow.material.color.setHex(p.light);
  status.textContent = p.name;
}

function resetCamera() {
  camera.position.set(8.2, 4.2, 11.8);
  controls.target.set(0, 0.2, 0);
  controls.update();
  status.textContent = 'Камера возвращена в исходную точку.';
}

function resizeRenderer() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

new ResizeObserver(resizeRenderer).observe(container);
resizeRenderer();

paletteButton.addEventListener('click', () => {
  paletteIndex = (paletteIndex + 1) % palettes.length;
  applyPalette();
});

rotationButton.addEventListener('click', () => {
  autoMotion = !autoMotion;
  rotationButton.textContent = autoMotion ? 'Остановить движение' : 'Запустить движение';
  status.textContent = autoMotion ? 'Движение сцены включено.' : 'Движение сцены остановлено.';
});

resetButton.addEventListener('click', resetCamera);

const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;

  if (autoMotion) {
    planet.rotation.y += delta * 0.07;
    rings.rotation.z += delta * 0.018;
    moonPivot.rotation.y += delta * 0.15;
    dust.rotation.y -= delta * 0.018;
    stars.rotation.y += delta * 0.0018;
    shipPivot.rotation.y += delta * 0.095;
    world.position.y = Math.sin(elapsed * 0.45) * 0.05;
  }

  if (ship) {
    ship.position.y = 1.35 + Math.sin(elapsed * 1.35) * 0.12;
    ship.rotation.z = -0.12 + Math.sin(elapsed * 0.9) * 0.08;
  }

  atmosphere.scale.setScalar(1 + Math.sin(elapsed * 0.9) * 0.006);
  distantGlow.material.opacity = 0.2 + Math.sin(elapsed * 0.8) * 0.035;

  controls.update();
  renderer.render(scene, camera);
}

applyPalette();
animate();
