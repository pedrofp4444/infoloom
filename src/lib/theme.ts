function initTheme() {
    if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
        return localStorage.getItem("theme") === "dark" ? "dark" : "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme() {
    const theme = initTheme();
    document.documentElement.classList.toggle("dark", theme === "dark");
}

applyTheme();

export { initTheme, applyTheme };
