import React, { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import "./Form.css";
import Btn from "./Button/Button";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { CopyToClipboard } from "react-copy-to-clipboard";
import SnackBar from "./SnackBar/SnakBar";
import { useNavigate } from "react-router-dom";
import { socket } from "../../Socket";
const InitialValues = {
    username: "",
    Id: "",
};

function Form() {
    const [newDocument, setnewDocument] = useState(false);
    const [DocumentID, setDocumentID] = useState("");
    const [textToCopy, setTextToCopy] = useState("");
    const [copyStatus, setCopyStatus] = useState(false);
    const [inputValues, setInputValues] = useState(InitialValues);
    const [formErrors, setFormErrors] = useState({});
    const [isDocument, setIsDocument] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        if (isDocument) {
            socket.emit("checkIsDocument", inputValues.Id);
            socket.once("is-document", (response) => {
                if (response.isDocument !== null) {
                    const { username, Id } = inputValues;
                    navigate(`/text/editor/${inputValues.Id}`, {
                        state: {
                            username,
                            DocumentID: Id,
                            newDocument: false,
                        },
                    });
                } else {
                    setCopyStatus(true);
                }
            });
        }
    }, [isDocument, inputValues.Id, inputValues, navigate]);
    // ----handle-form-inputs---
    const handleUserInputs = (e) => {
        const { name, value } = e.target;
        setInputValues({
            ...inputValues,
            [name]: value,
        });
    };
    // ----hanlde--form--submit---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        //form submit
        if (!newDocument) {
            if (inputValues.username && inputValues.Id) {
                setIsDocument(true);
            }
        } else {
            if (inputValues.username) {
                const { username } = inputValues;
                navigate(`/text/editor/${DocumentID}`, {
                    state: {
                        username,
                        DocumentID,
                        newDocument: true,
                    },
                });
            }
        }

        //handle errors
        const errors = {};
        if (!inputValues.username) errors.username = "Username is required!";
        if (!inputValues.Id) errors.Id = "Document ID is required!";
        setFormErrors(errors);
    };
    // ----create---new-------
    const handleNewDocument = () => {
        setnewDocument(!newDocument);
        setFormErrors("");
        uuidFromUuidV4();
    };

    // ----generate---uuid---for---the---newDocument
    const uuidFromUuidV4 = () => {
        const newUuid = uuid();
        setDocumentID(newUuid);
        setTextToCopy(newUuid);
    };

    // -----copy---to---clipBoard----
    const onCopyText = () => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    return (
        <Box height={"100vh"} bgcolor={"inherit"} className="form-wrapper">
            <Stack
                justifyContent={"center"}
                alignItems={"center"}
                height={"100%"}
            >
                <form onSubmit={handleFormSubmit}>
                    {newDocument ? (
                        <Box key="new-document" className="form-container">
                            <Typography color="initial">
                                Share Document ID to join more people
                            </Typography>
                            <Stack flexDirection={"column"} gap={2} my={2}>
                                <Stack flexDirection={"row"} gap={2}>
                                    <input
                                        onChange={handleUserInputs}
                                        type="text"
                                        placeholder="Document ID"
                                        value={DocumentID}
                                        readOnly
                                        name="Id"
                                    />
                                    <CopyToClipboard
                                        text={textToCopy}
                                        onCopy={onCopyText}
                                    >
                                        <button
                                            type="button"
                                            className="copy-to-clipboard"
                                        >
                                            Copy to Clipboard
                                        </button>
                                    </CopyToClipboard>
                                </Stack>
                                {copyStatus && (
                                    <SnackBar
                                        openSnackBar={copyStatus}
                                        message={"Copied Successfully!"}
                                    />
                                )}
                                <input
                                    onChange={handleUserInputs}
                                    type="text"
                                    placeholder="USERNAME"
                                    name="username"
                                />
                                {formErrors.username && (
                                    <p>{formErrors.username}</p>
                                )}
                            </Stack>
                            <Btn value={"JOIN"} />
                            <span>
                                Have invite &nbsp;
                                <Link to="/" onClick={handleNewDocument}>
                                    join here
                                </Link>
                            </span>
                        </Box>
                    ) : (
                        <Stack key="join-document" className="form-container">
                            <Typography color="initial">
                                Paste Document ID
                            </Typography>
                            <Stack flexDirection={"column"} gap={2} my={2}>
                                <input
                                    onChange={handleUserInputs}
                                    type="text"
                                    placeholder="Document ID"
                                    name="Id"
                                />
                                {copyStatus && (
                                    <SnackBar
                                        openSnackBar={copyStatus}
                                        message={"Docuemnt ID is invalid!"}
                                    />
                                )}
                                {formErrors?.Id && <p>{formErrors?.Id}</p>}
                                <input
                                    onChange={handleUserInputs}
                                    type="text"
                                    placeholder="USERNAME"
                                    name="username"
                                />
                                {formErrors?.username && (
                                    <p>{formErrors?.username}</p>
                                )}
                            </Stack>
                            <Btn value={"JOIN"} mb={1} />
                            <span>
                                If you didn't have ID create &nbsp;
                                <Link to="/" onClick={handleNewDocument}>
                                    new document
                                </Link>
                            </span>
                        </Stack>
                    )}
                </form>
            </Stack>
        </Box>
    );
}
export default Form;
