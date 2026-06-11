(function () {
  const LIGHT_THEME_COLOR = '#f0f2f5';
  const DARK_THEME_COLOR = '#141414';
  const STORAGE_KEY = 'theme';
  const VIEWPORT_REFRESH_TOKEN = 'interactive-widget=resizes-content';

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

  function getThemeColor(theme) {
    return theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
  }

  function getStatusBarStyle(theme) {
    return theme === 'dark' ? 'black-translucent' : 'default';
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function insertEarly(meta) {
    if (document.currentScript && document.currentScript.parentNode) {
      document.currentScript.parentNode.insertBefore(meta, document.currentScript.nextSibling);
    } else if (document.head.firstChild) {
      document.head.insertBefore(meta, document.head.firstChild);
    } else {
      document.head.appendChild(meta);
    }
  }

  function ensureMeta(name, selector) {
    let meta = document.querySelector(selector || 'meta[name="' + name + '"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      insertEarly(meta);
    }
    return meta;
  }

  function setColorScheme(theme) {
    document.documentElement.style.colorScheme = theme;
    const meta = ensureMeta('color-scheme', 'meta[name="color-scheme"]');
    meta.setAttribute('content', theme);
  }

  function setAppleStatusBar(theme) {
    const meta = ensureMeta('apple-mobile-web-app-status-bar-style', 'meta[name="apple-mobile-web-app-status-bar-style"]');
    meta.setAttribute('content', getStatusBarStyle(theme));
  }

  function getThemeColorMeta() {
    let meta = document.querySelector('meta[name="theme-color"][data-theme-color-active]');
    if (meta) {
      return meta;
    }

    meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      insertEarly(meta);
    }

    meta.setAttribute('data-theme-color-active', '');
    meta.removeAttribute('media');
    return meta;
  }

  function setThemeColor(theme) {
    const color = getThemeColor(theme);
    const meta = getThemeColorMeta();

    meta.removeAttribute('media');
    meta.setAttribute('content', color);
    meta.content = color;

    requestAnimationFrame(function () {
      meta.setAttribute('content', color);
      meta.content = color;
    });

    setTimeout(function () {
      meta.setAttribute('content', color);
      meta.content = color;
    }, 120);
  }

  function forceBrowserChromeRefresh() {
    if (!isIOS()) {
      return;
    }

    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      return;
    }

    const originalContent = viewport.getAttribute('content') || '';
    const nudgedContent = originalContent.includes(VIEWPORT_REFRESH_TOKEN)
      ? originalContent.replace(', ' + VIEWPORT_REFRESH_TOKEN, '').replace(VIEWPORT_REFRESH_TOKEN, '')
      : originalContent + ', ' + VIEWPORT_REFRESH_TOKEN;

    viewport.setAttribute('content', nudgedContent);

    requestAnimationFrame(function () {
      viewport.setAttribute('content', originalContent);
    });
  }

  function setToggleIcon(theme) {
    const icon = document.getElementById('toggleIcon');
    if (icon) {
      icon.textContent = theme === 'dark' ? String.fromCodePoint(0x1F319) : String.fromCodePoint(0x2600, 0xFE0F);
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
    setColorScheme(theme);
    setAppleStatusBar(theme);
    setThemeColor(theme);

    if (shouldSave) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {
        // Ignore storage failures so the theme toggle still works.
      }
      forceBrowserChromeRefresh();
    }
  }

  applyTheme(getInitialTheme(), false);

  function initTheme() {
    const toggle = document.getElementById('themeToggle');

    applyTheme(getInitialTheme(), false);

    if (toggle) {
      toggle.addEventListener('click', function () {
        const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
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
