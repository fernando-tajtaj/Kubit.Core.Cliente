document.addEventListener('DOMContentLoaded', function () {
    var toastElList = [].slice.call(document.querySelectorAll('.toast'));
    toastElList.forEach(function (toastEl) {
        var toast = new bootstrap.Toast(toastEl);
        toast.show();
    });
});

function changeThemeGrid(theme) {
    const grids = document.querySelectorAll('[class*="ag-theme-params-"]');

    grids.forEach(gridEl => {
        gridEl.classList.forEach(cls => {
            if (cls.startsWith('ag-theme-params-')) {
                gridEl.classList.remove(cls);
            }
        });

        gridEl.classList.add(`ag-theme-params-${theme}`);
    });
}

(() => {
    'use strict';

    const getStoredTheme = () => localStorage.getItem('theme');
    const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

    const getStoredNavigationPosition = () => localStorage.getItem('navigationPosition');
    const setStoredNavigationPosition = (navigationPosition) => localStorage.setItem('navigationPosition', navigationPosition);

    const getStoredSidenavSizing = () => localStorage.getItem('sidenavSizing');
    const setStoredSidenavSizing = (sidenavSizing) => localStorage.setItem('sidenavSizing', sidenavSizing);

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const getPreferredNavigationPosition = () => {
        const storedNavigationPosition = getStoredNavigationPosition();
        if (storedNavigationPosition) {
            return storedNavigationPosition;
        }
        return 'sidenav';
    };

    const getPreferredSidenavSizing = () => {
        const storedSidenavSizing = getStoredSidenavSizing();
        if (storedSidenavSizing) {
            return storedSidenavSizing;
        }
        return 'base';
    };

    const setTheme = (theme) => {
        if (theme === 'auto') {
            const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
            changeThemeGrid(darkMode ? 4 : 1);
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme);
            changeThemeGrid(theme === 'dark' ? 4 : 1);
        }
    };

    const setNavigationPosition = (navigationPosition) => {
        document.documentElement.setAttribute('data-bs-navigation-position', navigationPosition);
    };

    const setSidenavSizing = (sidenavSizing) => {
        document.documentElement.setAttribute('data-bs-sidenav-sizing', sidenavSizing);
    };

    setTheme(getPreferredTheme());
    setNavigationPosition(getPreferredNavigationPosition());
    setSidenavSizing(getPreferredSidenavSizing());

    const showActiveTheme = (theme, settingsSwitcher) => {
        document.querySelectorAll('[data-bs-theme-value]').forEach((element) => {
            element.classList.remove('active');
            element.setAttribute('aria-pressed', 'false');

            if (element.getAttribute('data-bs-theme-value') === theme) {
                element.classList.add('active');
                element.setAttribute('aria-pressed', 'true');
            }
        });

        if (settingsSwitcher) {
            settingsSwitcher.focus();
        }
    };

    const showActiveNavigationPosition = (navigationPosition, settingsSwitcher) => {
        document.querySelectorAll('[data-bs-navigation-position-value]').forEach((element) => {
            element.classList.remove('active');
            element.setAttribute('aria-pressed', 'false');

            if (element.getAttribute('data-bs-navigation-position-value') === navigationPosition) {
                element.classList.add('active');
                element.setAttribute('aria-pressed', 'true');
            }
        });

        if (settingsSwitcher) {
            settingsSwitcher.focus();
        }
    };

    const showActiveSidenavSizing = (sidenavSizing, settingsSwitcher) => {
        document.querySelectorAll('[data-bs-sidenav-sizing-value]').forEach((element) => {
            element.classList.remove('active');
            element.setAttribute('aria-pressed', 'false');

            if (element.getAttribute('data-bs-sidenav-sizing-value') === sidenavSizing) {
                element.classList.add('active');
                element.setAttribute('aria-pressed', 'true');
            }
        });

        if (settingsSwitcher) {
            settingsSwitcher.focus();
        }
    };

    const refreshCharts = () => {
        const charts = document.querySelectorAll('.chart-canvas');

        charts.forEach((chart) => {
            const chartId = chart.getAttribute('id');
            const instance = Chart.getChart(chartId);

            if (!instance) {
                return;
            }

            if (instance.options.scales.y) {
                instance.options.scales.y.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--bs-border-color');
                instance.options.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--bs-secondary-color');
            }

            if (instance.options.scales.x) {
                instance.options.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--bs-secondary-color');
            }

            if (instance.options.elements.arc) {
                instance.options.elements.arc.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--bs-body-bg');
                instance.options.elements.arc.hoverBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--bs-body-bg');
            }

            instance.update();
        });
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme());
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme());
        showActiveNavigationPosition(getPreferredNavigationPosition());
        showActiveSidenavSizing(getPreferredSidenavSizing());

        document.querySelectorAll('[data-bs-theme-value]').forEach((toggle) => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = toggle.getAttribute('data-bs-theme-value');
                const settingsSwitcher = toggle.closest('.nav-item').querySelector('[data-bs-settings-switcher]');
                setStoredTheme(theme);
                setTheme(theme);
                showActiveTheme(theme, settingsSwitcher);
                refreshCharts();
            });
        });

        document.querySelectorAll('[data-bs-navigation-position-value]').forEach((toggle) => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const navigationPosition = toggle.getAttribute('data-bs-navigation-position-value');
                const settingsSwitcher = toggle.closest('.nav-item').querySelector('[data-bs-settings-switcher]');
                setStoredNavigationPosition(navigationPosition);
                setNavigationPosition(navigationPosition);
                showActiveNavigationPosition(navigationPosition, settingsSwitcher);
            });
        });

        document.querySelectorAll('[data-bs-sidenav-sizing-value]').forEach((toggle) => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const sidenavSizing = toggle.getAttribute('data-bs-sidenav-sizing-value');
                const settingsSwitcher = toggle.closest('.nav-item').querySelector('[data-bs-settings-switcher]');
                setStoredSidenavSizing(sidenavSizing);
                setSidenavSizing(sidenavSizing);
                showActiveSidenavSizing(sidenavSizing, settingsSwitcher);
            });
        });
    });
})();