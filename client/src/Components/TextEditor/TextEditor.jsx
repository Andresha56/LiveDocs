import React, { useEffect, useState, useRef } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { socket } from "../../Socket";
import { useLocation } from "react-router-dom";
import "./TextEditor.css";
import User from "../Drawer/Users";

function TextEditor() {
    const [editorValue, setEditorValue] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);

    const [readOnly, setReadOnly] = useState(true);
    const location = useLocation();
    const editorRef = useRef(null);
    // ----handle---changes----in--editor---
    const handleEditorChange = (content, delta, source) => {
        if (source === "user") {
            socket.emit("text-change", delta);
        }
        setEditorValue(content);
    };

    useEffect(() => {
        const handleActiveUsers = (users) => {
            setActiveUsers(users);
        };

        socket.on("active-users", handleActiveUsers);

        return () => {
            socket.off("active-users", handleActiveUsers);
        };
    }, []);

    // -----on--document---load---
    useEffect(() => {
        if (!location.state) return;
        const { username, DocumentID, newDocument } = location.state;
        if (!username || !DocumentID) return;
        socket.once("load-doc", (docString) => {
            const editor = editorRef.current?.getEditor();
            if (editor) {
                setReadOnly(false);
                // Parse the docString back into an object
                if (docString) {
                    editor.setContents(JSON.parse(docString));
                }
            }
        });

        socket.emit("joinRoom", {
            username,
            DocumentID,
            newDocument,
        });
    }, [location.state]);

    // -------receive--and---share---changes-------
    useEffect(() => {
        const handleReceiveChanges = (delta) => {
            const editor = editorRef.current?.getEditor();
            if (editor) {
                editor.updateContents(delta);
            }
        };
        socket.on("receive-changes", handleReceiveChanges);

        return () => {
            socket.off("receive-changes", handleReceiveChanges);
        };
    }, []);
    // ----save---document--on---change----
    useEffect(() => {
        const intervel = setInterval(() => {
            const editor = editorRef.current?.getEditor();
            if (editor) {
                JSON.stringify(editor.getContents());
                socket.emit(
                    "save-document",
                    JSON.stringify(editor.getContents())
                );
            }
        }, [1000]);
        return () => {
            clearInterval(intervel);
        };
    }, []);

    return (
        <div className="textEditor-container">
            <User users={ activeUsers } />
            <ReactQuill
                ref={editorRef}
                className="textEditor"
                value={editorValue}
                onChange={handleEditorChange}
                modules={{
                    toolbar: [
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        [{ font: [] }],
                        ["bold", "italic", "underline", "strike"],
                        ["image", "code-block"],
                        [
                            { list: "ordered" },
                            { list: "bullet" },
                            { list: "check" },
                        ],
                        [{ color: [] }, { background: [] }],
                        [{ script: "sub" }, { script: "super" }],
                        [{ align: [] }],
                        [{ indent: "-1" }, { indent: "+1" }],
                    ],
                }}
                theme="snow"
                readOnly={readOnly}
            />
        </div>
    );
}

export default TextEditor;
