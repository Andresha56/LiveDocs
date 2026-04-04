import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
} from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { socket } from "../../Socket";
import { useLocation } from "react-router-dom";
import "./TextEditor.css";
import User from "../Drawer/Users";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

import {
    Box,
    CircularProgress,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    Menu,
    MenuItem,
} from "@mui/material";

import { useTheme } from "../../../src/context/theme";

// ── Quill format registration (module-level, runs once) ──────────────────────
const Font = Quill.import("formats/font");
Font.whitelist = ["inter", "roboto", "poppins", "serif", "monospace"];
Quill.register(Font, true);

const quillFormats = [
    "font",
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "code-block",
];

// ── Static modules config (outside component avoids re-creation on every render)
const quillModules = {
    toolbar: [
        [{ font: Font.whitelist }], // FIX 1: font picker now visible
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "code-block"],
        ["clean"],
    ],
};

function TextEditor() {
    const { theme, toggleTheme } = useTheme();

    // ── All useState hooks first ──────────────────────────────────────────────
    const [editorValue, setEditorValue] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [downloadAnchor, setDownloadAnchor] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [readOnly, setReadOnly] = useState(true);
    const [saving, setSaving] = useState(false);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const location = useLocation();
    const editorRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const lastSavedContentRef = useRef("");

    // ── Callbacks ─────────────────────────────────────────────────────────────
    const handleEditorChange = useCallback((content, delta, source) => {
        if (source === "user") {
            socket.emit("text-change", delta);
        }
        setEditorValue(content);
    }, []);

    // ── Effects ───────────────────────────────────────────────────────────────

    /* Active users */
    useEffect(() => {
        const handleActiveUsers = (users) => setActiveUsers(users);
        socket.on("active-users", handleActiveUsers);
        return () => socket.off("active-users", handleActiveUsers);
    }, []);

    /* Document load */
    useEffect(() => {
        if (!location.state) return;

        const { username, DocumentID, newDocument } = location.state;
        if (!username || !DocumentID) return;

        socket.once("load-doc", (docString) => {
            const editor = editorRef.current?.getEditor();
            if (!editor) return;

            if (docString) {
                editor.setContents(JSON.parse(docString));
                lastSavedContentRef.current = docString;
            }

            setReadOnly(false);
        });

        socket.emit("joinRoom", { username, DocumentID, newDocument });

        return () => {
            socket.emit("leaveRoom", { DocumentID });
        };
    }, [location.state]);

    /* Receive remote changes */
    useEffect(() => {
        const handleReceiveChanges = (delta) => {
            const editor = editorRef.current?.getEditor();
            if (editor) editor.updateContents(delta);
        };

        socket.on("receive-changes", handleReceiveChanges);
        return () => socket.off("receive-changes", handleReceiveChanges);
    }, []);

    /* Auto-save */
    useEffect(() => {
        const interval = setInterval(() => {
            const editor = editorRef.current?.getEditor();
            if (!editor) return;

            const content = JSON.stringify(editor.getContents());
            if (content === lastSavedContentRef.current) return;

            setSaving(true);
            socket.emit("save-document", content);
            lastSavedContentRef.current = content;

            setTimeout(() => setSaving(false), 500);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // ── Download handler ──────────────────────────────────────────────────────
    const handleDownload = useCallback(async (format) => {
        setDownloadAnchor(null);

        const editor = editorRef.current?.getEditor();
        if (!editor) return;

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `docunity-document-${timestamp}`;

        if (format === "txt") {
            const blob = new Blob([editor.getText()], {
                type: "text/plain;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            return;
        }

        if (format === "pdf") {
            try {
                const jsPDF = (await import("jspdf")).default;
                const pdf = new jsPDF("p", "mm", "a4");

                await pdf.html(editor.root.innerHTML, {
                    margin: [20, 20, 20, 20],
                    autoPaging: "text",
                    html2canvas: { scale: 0.6 },
                });

                pdf.save(`${filename}.pdf`);
            } catch (err) {
                console.error("PDF export failed:", err);
            }
        }
    }, []);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        // FIX 2: pass theme class here so --toolbar-icon-color CSS var is in scope
        <div className={`textEditor-container theme-${theme}`}>
            <header className="editor-header">
                <div className="editor-header-left">
                    <Tooltip title="Back to home">
                        <IconButton size="small" className="header-icon-btn">
                            <ArrowBackIosNewRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Typography variant="body2" className="editor-header-brand">
                        DocUnity
                    </Typography>
                </div>

                <div className="editor-header-right">
                    {saving ? (
                        <Chip
                            size="small"
                            icon={
                                <CloudQueueRoundedIcon sx={{ fontSize: 14 }} />
                            }
                            label="Saving..."
                            className="status-chip saving"
                        />
                    ) : (
                        <Chip
                            size="small"
                            icon={
                                <CheckCircleOutlineRoundedIcon
                                    sx={{ fontSize: 14 }}
                                />
                            }
                            label="Saved"
                            className="status-chip saved"
                        />
                    )}

                    <Tooltip title="Download">
                        <IconButton
                            size="small"
                            onClick={(e) => setDownloadAnchor(e.currentTarget)}
                            className="header-icon-btn"
                        >
                            <FileDownloadRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={downloadAnchor}
                        open={Boolean(downloadAnchor)}
                        onClose={() => setDownloadAnchor(null)}
                    >
                        <MenuItem onClick={() => handleDownload("txt")}>
                            Download as TXT
                        </MenuItem>
                        <MenuItem onClick={() => handleDownload("pdf")}>
                            Download as PDF
                        </MenuItem>
                    </Menu>

                    <Tooltip
                        title={theme === "dark" ? "Light mode" : "Dark mode"}
                    >
                        <IconButton
                            size="small"
                            onClick={toggleTheme}
                            className="header-icon-btn"
                        >
                            {theme === "dark" ? (
                                <LightModeRoundedIcon fontSize="small" />
                            ) : (
                                <DarkModeRoundedIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Collaborators">
                        <IconButton
                            size="small"
                            onClick={() => setDrawerOpen(true)}
                            className="header-icon-btn collaborators-btn"
                        >
                            <GroupRoundedIcon fontSize="small" />
                            <span className="collaborators-count">
                                {activeUsers.length}
                            </span>
                        </IconButton>
                    </Tooltip>
                </div>
            </header>

            <User
                users={activeUsers}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />

            <div className="editor-paper">
                <div className="editor-box">
                    <ReactQuill
                        ref={editorRef}
                        className="textEditor"
                        value={editorValue}
                        onChange={handleEditorChange}
                        theme="snow"
                        readOnly={readOnly}
                        modules={quillModules}
                        formats={quillFormats}
                    />
                </div>
            </div>
        </div>
    );
}

export default TextEditor;
