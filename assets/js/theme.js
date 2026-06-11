(function () {
  const LIGHT_THEME_COLOR = '#f0f2f5';
  const DARK_THEME_COLOR = '#141414';
  const STORAGE_KEY = 'theme';

  function getThemeColorMeta() {
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }

    return meta;
  }

  function getSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : null;
    } catch (error) {
      return null;
    }
  }

  function getActiveTheme() {
    const body = document.body;
    const root = document.documentElement;

    if (
      (body && body.classList.contains('dark')) ||
      root.classList.contains('dark') ||
      (body && body.dataset.theme === 'dark') ||
      root.dataset.theme === 'dark'
    ) {
      return 'dark';
    }

    if (
      (body && body.dataset.theme === 'light') ||
      root.dataset.theme === 'light'
    ) {
      return 'light';
    }

    return null;
  }

  function getPreferredTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getInitialTheme() {
    return getSavedTheme() || getActiveTheme() || getPreferredTheme();
  }

  function setThemeColor(theme) {
    getThemeColorMeta().setAttribute(
      'content',
      theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR
    );
  }

  function setToggleIcon(theme) {
    const icon = document.getElementById('toggleIcon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  function setRootTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  function applyTheme(theme, shouldSave) {
    setRootTheme(theme);

    if (document.body) {
      document.body.classList.toggle('dark', theme === 'dark');
    }

    setToggleIcon(theme);
    setThemeColor(theme);

    if (shouldSave) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {
        // Ignore storage failures so the theme toggle still works.
      }
    }
  }

  applyTheme(getInitialTheme(), false);

  function initTheme() {
    const toggle = document.getElementById('themeToggle');

    applyTheme(getInitialTheme(), false);

    if (toggle) {
      toggle.addEventListener('click', function () {
        const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(nextTheme, true);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
}());
