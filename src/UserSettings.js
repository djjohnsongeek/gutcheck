class UserSettings {
    themeKey = "appTheme";
    defaultTheme = "dark";
    themeToggleBtn = null;

    constructor(themeToggleBtn) {
        this.themeToggleBtn = themeToggleBtn;
        this.loadTheme();
        if ( this.themeToggleBtn) {
             this.themeToggleBtn.addEventListener("click", () => {
                const currentTheme = this.getTheme();
                const newTheme = currentTheme === "dark" ? "light" : "dark";
                this.setTheme(newTheme);
            });
        }
    }

    loadTheme() {
        let themeValue = this.getTheme();
        this.setTheme(themeValue);
    }

    getTheme() {
        return localStorage.getItem(this.themeKey) || this.defaultTheme;
    }

    setTheme(themeValue) {
        document.documentElement.dataset.theme = themeValue;
        localStorage.setItem(this.themeKey, themeValue);
        
        if (this.themeToggleBtn) {
            this.themeToggleBtn.textContent = themeValue === "dark" ? "☀️" : "🌙";
        }
    }
}