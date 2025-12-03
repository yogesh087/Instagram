const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require("mongoose");
const USER = mongoose.model("USER");

const { googleClientID, googleClientSecret } = require("./keys");

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    USER.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: "/auth/google/callback",
        proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await USER.findOne({ googleId: profile.id });

            console.log("Google profile:",existingUser);
            
            if (existingUser) {
                return done(null, existingUser);
            }
            
            // Check if user with this email already exists
            const userByEmail = await USER.findOne({ email: profile.emails[0].value });
            console.log("User by email:",userByEmail);
            if (userByEmail) {
                // Merge Google auth with existing account
                userByEmail.googleId = profile.id;
                await userByEmail.save();
                return done(null, userByEmail);
            }
            
            // Create new user
            const user = await new USER({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                userName: profile.emails[0].value.split('@')[0],
                Photo: profile.photos[0].value
            }).save();
            
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    })
);