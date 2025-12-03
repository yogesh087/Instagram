const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys");
const passport = require("passport"); // <-- Import Passport

// -------------------- Signup --------------------
router.post("/signup", (req, res) => {
    const { name, userName, email, password } = req.body;

    if (!name || !email || !userName || !password) {
        return res.status(422).json({ error: "Please add all the fields" });
    }

    USER.findOne({ $or: [{ email }, { userName }] }).then(savedUser => {
        if (savedUser) return res.status(422).json({ error: "User already exist" });

        bcrypt.hash(password, 12).then(hashedPassword => {
            const newUser = new USER({
                name,
                email,
                userName,
                password: hashedPassword
            });

            newUser.save()
                .then(() => res.json({ message: "Registered successfully" }))
                .catch(err => console.log(err));
        });
    });
});

// -------------------- Signin --------------------
router.post("/signin", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(422).json({ error: "Please add email and password" });

    USER.findOne({ email }).then(savedUser => {
        if (!savedUser) return res.status(422).json({ error: "Invalid email" });

        bcrypt.compare(password, savedUser.password).then(match => {
            if (!match) return res.status(422).json({ error: "Invalid password" });

            const token = jwt.sign({ _id: savedUser._id }, Jwt_secret);
            const { _id, name, email, userName } = savedUser;
            res.json({ token, user: { _id, name, email, userName } });
        });
    });
});

// -------------------- Google Auth Routes --------------------
router.get("/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    })
);

router.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/signin", session: false }),
    (req, res) => {
        const token = jwt.sign({ _id: req.user._id }, Jwt_secret);

        const { _id, name, email, userName, Photo } = req.user;

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

module.exports = router;
