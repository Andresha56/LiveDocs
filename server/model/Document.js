import mongoose from "mongoose";
const { Schema } = mongoose;
const DocumentSchema = new Schema({
    _id: String,
    data: String,
    users: {
        type: [String],
        default: [],
    },
});
export const Document = mongoose.model("Document", DocumentSchema);
