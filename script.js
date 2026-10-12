const button = document.getElementById('button');
const reset = document.getElementById('reset');
const count = document.getElementById('count');
const status = document.getElementById('status');

let clicks = 0;

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
