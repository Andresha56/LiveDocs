import React, { createContext, useContext, useState, useMemo } from "react";

const STORAGE_KEY = "docunity-theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) || "dark";
        } catch {
            return "dark";
        }
    });

    const setTheme = (mode) => {
        setThemeState(mode);
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (_) {}
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
