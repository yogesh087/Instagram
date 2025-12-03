require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const { mongoUrl } = require("./keys");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const session = require("express-session");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session config (required if using passport session based login)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Models
require('./models/model');
require('./models/post');

// Passport config
require("./passport");

// Routes
app.use(require("./routes/auth"));   // Google login also comes from here now!
app.use(require("./routes/createPost"));
app.use(require("./routes/user"));

// Database Connection
mongoose.connect(mongoUrl);
mongoose.connection.on("connected", () => {
    console.log("Successfully connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
    console.log("Not connected to MongoDB:", err);
});

// Serve frontend (build folder)
app.use(express.static(path.join(__dirname, "./frontend/build")));
app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "./frontend/build/index.html"),
        function (err) {
            res.status(500).send(err);
        }
    );
});

app.listen(port, () => {
    console.log("Server is running on port " + port);
});