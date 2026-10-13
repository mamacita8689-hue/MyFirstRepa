import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('threeScene');
const paletteButton = document.getElementById('paletteButton');
const rotationButton = document.getElementById('rotationButton');
const resetButton = document.getElementById('resetButton');
const status = document.getElementById('status');

let autoMotion = true;
let paletteIndex = 0;

const palettes = [
  {
    name: 'Ледяная туманность',
    background: 0x02040a,
    planet: 0x4f7cff,
    atmosphere: 0x7dd3fc,
    ring: 0xa5b4fc,
    nebulaA: 0x4338ca,
    nebulaB: 0x0891b2,
    light: 0xbfe7ff,
  },
  {
    name: 'Пурпурный рассвет',
    background: 0x08030d,
    planet: 0x8b5cf6,
    atmosphere: 0xf0abfc,
    ring: 0xf5d0fe,
    nebulaA: 0x7e22ce,
    nebulaB: 0xdb2777,
    light: 0xffd7f5,
  },
  {
    name: 'Изумрудный шторм',
    background: 0x020806,
    planet: 0x0f766e,
    atmosphere: 0x5eead4,
    ring: 0xa7f3d0,
    nebulaA: 0x065f46,
    nebulaB: 0x0e7490,
    light: 0xb7fff2,
  },
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(palettes[0].background);
scene.fog = new THREE.FogExp2(0x02040a, 0.018);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 300);
camera.position.set(7.6, 3.6, 10.6);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 5.8;
controls.maxDistance = 20;
controls.target.set(0, 0.2, 0);
controls.autoRotate = false;

const world = new THREE.Group();
scene.add(world);

const starTexture = makeGlowTexture();

const keyLight = new THREE.DirectionalLight(palettes[0].light, 3.2);
keyLight.position.set(6, 4, 7);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x7dd3fc, 70, 20, 2);
rimLight.position.set(-6, -1, 2);
scene.add(rimLight);

scene.add(new THREE.AmbientLight(0x1f2a44, 0.5));

const planetMaterial = new THREE.MeshStandardMaterial({
  color: palettes[0].planet,
  roughness: 0.82,
  metalness: 0.05,
  map: makePlanetTexture(),
});

const planet = new THREE.Mesh(new THREE.SphereGeometry(2.15, 96, 96), planetMaterial);
planet.rotation.z = THREE.MathUtils.degToRad(-14);
world.add(planet);

const atmosphereMaterial = new THREE.MeshBasicMaterial({
  color: palettes[0].atmosphere,
  transparent: true,
  opacity: 0.13,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.28, 72, 72), atmosphereMaterial);
world.add(atmosphere);

const ringMaterial = new THREE.MeshBasicMaterial({
  map: makeRingTexture(),
  transparent: true,
  opacity: 0.86,
  color: palettes[0].ring,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const rings = new THREE.Mesh(new THREE.RingGeometry(2.75, 4.5, 192), ringMaterial);
rings.rotation.x = THREE.MathUtils.degToRad(68);
rings.rotation.z = THREE.MathUtils.degToRad(8);
world.add(rings);

const ringHalo = new THREE.Mesh(
  new THREE.RingGeometry(2.62, 4.62, 192),
  new THREE.MeshBasicMaterial({
    color: palettes[0].ring,
    transparent: true,
    opacity: 0.07,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
ringHalo.rotation.copy(rings.rotation);
world.add(ringHalo);

const moonPivot = new THREE.Group();
world.add(moonPivot);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.42, 48, 48),
  new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9, metalness: 0.02 })
);
moon.position.set(4.9, 0.7, 0.25);
moonPivot.add(moon);

const moonGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: starTexture, color: 0xb8dfff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
);
moonGlow.scale.set(1.35, 1.35, 1.35);
moon.add(moonGlow);

const stars = createStarField(3400, 42, 105, 0.055, 0.19);
scene.add(stars);

const nearStars = createStarField(520, 14, 34, 0.07, 0.28);
scene.add(nearStars);

const nebula = createNebulaField(420);
scene.add(nebula.group);

const dust = createDustBelt(780);
world.add(dust);

const lensGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: starTexture,
    color: palettes[0].light,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
lensGlow.position.set(6.6, 3.8, -4.5);
lensGlow.scale.set(7.5, 7.5, 7.5);
scene.add(lensGlow);

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.15, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.2)');
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

  const base = ctx.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#9fc7ff');
  base.addColorStop(0.4, '#4e76c8');
  base.addColorStop(0.7, '#233f7a');
  base.addColorStop(1, '#16294f');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 512);

  for (let i = 0; i < 55; i += 1) {
    const y = Math.random() * 512;
    const h = 6 + Math.random() * 26;
    const alpha = 0.035 + Math.random() * 0.085;
    ctx.fillStyle = `rgba(220,235,255,${alpha})`;
    ctx.fillRect(0, y, 1024, h);
  }

  for (let i = 0; i < 26; i += 1) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const rx = 45 + Math.random() * 120;
    const ry = 10 + Math.random() * 32;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.018 + Math.random() * 0.05})`;
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function makeRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.1, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(0.22, 'rgba(255,255,255,0.58)');
  gradient.addColorStop(0.31, 'rgba(255,255,255,0.16)');
  gradient.addColorStop(0.48, 'rgba(255,255,255,0.72)');
  gradient.addColorStop(0.61, 'rgba(255,255,255,0.24)');
  gradient.addColorStop(0.78, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStarField(count, minRadius, maxRadius, minSize, maxSize) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const r = THREE.MathUtils.lerp(minRadius, maxRadius, Math.pow(Math.random(), 0.7));
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    sizes[i] = THREE.MathUtils.randFloat(minSize, maxSize);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xeaf4ff,
    size: (minSize + maxSize) * 0.5,
    sizeAttenuation: true,
    map: starTexture,
    transparent: true,
    opacity: 0.95,
    alphaTest: 0.02,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createNebulaField(count) {
  const group = new THREE.Group();
  const materials = [
    new THREE.SpriteMaterial({ map: starTexture, color: palettes[0].nebulaA, transparent: true, opacity: 0.055, blending: THREE.AdditiveBlending, depthWrite: false }),
    new THREE.SpriteMaterial({ map: starTexture, color: palettes[0].nebulaB, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false }),
  ];

  for (let i = 0; i < count; i += 1) {
    const sprite = new THREE.Sprite(materials[i % 2]);
    const arm = i % 2 === 0 ? -1 : 1;
    sprite.position.set(
      arm * (5 + Math.random() * 18) + THREE.MathUtils.randFloatSpread(6),
      THREE.MathUtils.randFloatSpread(13),
      -8 - Math.random() * 28
    );
    const scale = 4 + Math.random() * 11;
    sprite.scale.set(scale, scale, scale);
    group.add(sprite);
  }

  return { group, materials };
}

function createDustBelt(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.randFloat(5.2, 8.7);
    const y = THREE.MathUtils.randFloatSpread(1.15);
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xc7d2fe,
    size: 0.055,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.rotation.x = THREE.MathUtils.degToRad(16);
  return points;
}

function applyPalette(index) {
  const palette = palettes[index];
  scene.background.setHex(palette.background);
  scene.fog.color.setHex(palette.background);
  planetMaterial.color.setHex(palette.planet);
  atmosphereMaterial.color.setHex(palette.atmosphere);
  ringMaterial.color.setHex(palette.ring);
  ringHalo.material.color.setHex(palette.ring);
  rimLight.color.setHex(palette.atmosphere);
  keyLight.color.setHex(palette.light);
  lensGlow.material.color.setHex(palette.light);
  nebula.materials[0].color.setHex(palette.nebulaA);
  nebula.materials[1].color.setHex(palette.nebulaB);
  status.textContent = palette.name;
}

function resetCamera() {
  camera.position.set(7.6, 3.6, 10.6);
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

const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(container);
resizeRenderer();

paletteButton.addEventListener('click', () => {
  paletteIndex = (paletteIndex + 1) % palettes.length;
  applyPalette(paletteIndex);
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
    ringHalo.rotation.z = rings.rotation.z;
    moonPivot.rotation.y += delta * 0.15;
    dust.rotation.y -= delta * 0.018;
    stars.rotation.y += delta * 0.0018;
    nearStars.rotation.y -= delta * 0.003;
    world.position.y = Math.sin(elapsed * 0.45) * 0.05;
  }

  moon.rotation.y += delta * 0.18;
  atmosphere.scale.setScalar(1 + Math.sin(elapsed * 0.9) * 0.006);
  lensGlow.material.opacity = 0.2 + Math.sin(elapsed * 0.8) * 0.035;

  controls.update();
  renderer.render(scene, camera);
}

applyPalette(0);
animate();
