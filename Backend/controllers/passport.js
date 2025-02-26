const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../db/db"); // PostgreSQL connection
const jwt = require("jsonwebtoken");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await pool.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);

        if (!user.rows.length) {
            const newUser = await pool.query(
                "INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *",
                [profile.id, profile.emails[0].value, profile.displayName]
            );
            user = newUser;
        }

        return done(null, user.rows[0]);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, user.rows[0]);
});