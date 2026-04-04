import React, { useMemo } from "react";
import Home from "./pages/home/Home";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
    ThemeProvider as MuiThemeProvider,
    createTheme,
} from "@mui/material/styles";
import { ThemeProvider, useTheme } from "../src/context/theme";
import Room from "./pages/Room/Room";

function AppWithMuiTheme() {
    const { theme } = useTheme();
    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: theme,
                    primary: { main: theme === "dark" ? "#2e8ff7" : "#1976d2" },
                    background: {
                        default: theme === "dark" ? "#1c1c1e" : "#f5f5f7",
                        paper: theme === "dark" ? "#1e1e1e" : "#ffffff",
                    },
                },
            }),
        [theme]
    );
    return (
        <MuiThemeProvider theme={muiTheme}>
            <div className={`app theme-${theme}`}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Room />} />
                        <Route path="/text/editor/:id" element={<Home />} />
                    </Routes>
                </Router>
            </div>
        </MuiThemeProvider>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppWithMuiTheme />
        </ThemeProvider>
    );
}

export default App;
