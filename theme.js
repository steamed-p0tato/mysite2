/* Dark-mode toggle.
   The site always starts in light mode on a fresh open. The choice is kept in
   sessionStorage, so it persists while navigating within a visit but resets to
   light whenever a new tab/window/session is opened. */
(function () {
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle');

    function syncButton() {
        if (!btn) return;
        const dark = root.dataset.theme === 'dark';
        btn.textContent = dark ? '☀' : '☾';
        btn.setAttribute('aria-pressed', String(dark));
        btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }

    syncButton();

    if (btn) {
        btn.addEventListener('click', function () {
            const dark = root.dataset.theme === 'dark';
            if (dark) {
                delete root.dataset.theme;
                sessionStorage.removeItem('theme');
            } else {
                root.dataset.theme = 'dark';
                sessionStorage.setItem('theme', 'dark');
            }
            syncButton();
        });
    }
})();
