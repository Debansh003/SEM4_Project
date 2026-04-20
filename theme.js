// Instant apply before first paint
(function () {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeBtn');

  if (localStorage.getItem('theme') === 'light') {
    document.body.setAttribute('data-theme', 'light');
    if (btn) btn.innerText = '☀️';
  }

  window.toggleTheme = function () {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.body.removeAttribute('data-theme');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      if (btn) btn.innerText = '🌙';
    } else {
      document.body.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      if (btn) btn.innerText = '☀️';
    }
  };
});