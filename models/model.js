const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        // Make password optional for OAuth users
    },
    Photo: {
        type: String,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows null values
    },
    followers: [{ type: ObjectId, ref: "USER" }],
    following: [{ type: ObjectId, ref: "USER" }]
});

mongoose.model("USER", userSchema)