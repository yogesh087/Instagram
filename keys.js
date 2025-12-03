const { session } = require("passport");

require("dotenv").config();

module.exports = {
     mongoUrl: process.env.MONGO_URL,
    Jwt_secret: process.env.JWT_SECRET,
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    sessionSecret: process.env.SESSION_SECRET
}