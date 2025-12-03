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
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'your_session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(mongoUrl);
mongoose.connection.on("connected", () => {
    console.log("Successfully connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
    console.log("Not connected to MongoDB:", err);
});

// Import routes
require('./models/model');
require('./models/post');
// Passport config
require("./passport");
app.use(require("./routes/auth"));
app.use(require("./routes/createPost"));
app.use(require("./routes/user"));

// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/signin',
    session: false,
  }),
  (req, res) => {
    const jwt = require("jsonwebtoken");
    const { Jwt_secret } = require("./keys");

    const token = jwt.sign({ _id: req.user.id }, Jwt_secret);
    const { _id, name, email, userName, Photo } = req.user;

    // RESPONSE TO POPUP (NO REDIRECT TO FRONTEND)
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage(
              {
                type: "GOOGLE_OAUTH_SUCCESS",
                token: "${token}",
                user: ${JSON.stringify({ _id, name, email, userName, Photo })}
              },
              "http://localhost:3000"
            );
            window.close();
          </script>
        </body>
      </html>
    `);
  }
);


// Serve frontend
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