import express from "express";
import { createServer } from "node:http";
import { ConnectToDB } from "./connection/DB.js";
import { Server } from "socket.io";
import { findOrCreateDoc } from "./Controller/Document.js";
import { findAndUpdate } from "./Controller/Document.js";
import { checkIsDocument } from "./Controller/Document.js";

const app = express();
const server = createServer(app);

ConnectToDB();
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("user connected successfully!");

    socket.on("joinRoom", async ({ username, DocumentID, newDocument }) => {
        socket.join(DocumentID);

        // store user info on socket
        socket.username = username;
        socket.documentId = DocumentID;

        const docs = await findOrCreateDoc(DocumentID, newDocument);

        socket.emit("load-doc", docs.data);

        // emit active users list
        const clients = await io.in(DocumentID).fetchSockets();
        const users = clients.map((s) => s.username).filter(Boolean);

        io.to(DocumentID).emit("active-users", users);

        socket.on("text-change", (delta) => {
            socket.broadcast.to(DocumentID).emit("receive-changes", delta);
        });

        socket.on("save-document", async (newData) => {
            await findAndUpdate(DocumentID, newData);
        });
    });

    socket.on("disconnect", async () => {
        const { documentId } = socket;
        if (!documentId) return;

        const clients = await io.in(documentId).fetchSockets();
        const users = clients.map((s) => s.username).filter(Boolean);

        io.to(documentId).emit("active-users", users);
    });

    socket.on("checkIsDocument", async (documentId) => {
        try {
            const isDocument = await checkIsDocument(documentId);
            socket.emit("is-document", { isDocument });
        } catch (error) {
            console.error("Error checking document:", error);
            socket.emit("is-document", {
                exists: false,
                error: "Error checking document",
            });
        }
    });
});

server.listen(4000, () => {
    console.log("server running at http://localhost:4000");
});
