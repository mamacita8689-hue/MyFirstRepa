const button = document.getElementById('button');
const reset = document.getElementById('reset');
const count = document.getElementById('count');
const status = document.getElementById('status');
const scene = document.getElementById('scene');
const cube = document.getElementById('cube');
const colorButton = document.getElementById('colorButton');

let clicks = 0;
let rotX = -20;
let rotY = 30;
let dragging = false;
let lastX = 0;
let lastY = 0;

const cubeColors = [
  'rgba(59, 130, 246, 0.72)',
  'rgba(16, 185, 129, 0.72)',
  'rgba(244, 63, 94, 0.72)',
  'rgba(168, 85, 247, 0.72)',
  'rgba(245, 158, 11, 0.72)'
];
let colorIndex = 0;

function updateCubeRotation() {
  cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}

button.addEventListener('click', () => {
  clicks += 1;
  count.textContent = clicks;
  status.textContent = clicks === 1
    ? 'Отлично — JavaScript тоже работает.'
    : `Всё работает. Нажатий: ${clicks}.`;
});

reset.addEventListener('click', () => {
  clicks = 0;
  count.textContent = '0';
  status.textContent = 'Счётчик сброшен. Проект готов к новым экспериментам.';
});

scene.addEventListener('pointerdown', (event) => {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  scene.classList.add('dragging');
  scene.setPointerCapture(event.pointerId);
});

scene.addEventListener('pointermove', (event) => {
  if (!dragging) return;

  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;

  rotY += dx * 0.7;
  rotX -= dy * 0.7;

  lastX = event.clientX;
  lastY = event.clientY;
  updateCubeRotation();
});

function stopDragging(event) {
  dragging = false;
  scene.classList.remove('dragging');
  if (event.pointerId !== undefined && scene.hasPointerCapture(event.pointerId)) {
    scene.releasePointerCapture(event.pointerId);
  }
}

scene.addEventListener('pointerup', stopDragging);
scene.addEventListener('pointercancel', stopDragging);

colorButton.addEventListener('click', () => {
  colorIndex = (colorIndex + 1) % cubeColors.length;
  document.documentElement.style.setProperty('--cube-color', cubeColors[colorIndex]);
  status.textContent = 'Цвет куба изменён.';
});

updateCubeRotation();
