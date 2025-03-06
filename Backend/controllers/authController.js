const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/db');
const passport = require("passport");
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
// const url = process.env.NODE_ENV == 'development' ? "http://localhost:5000" : "https://fj-be-r2-soham-sanghavi-iiitp-1.onrender.com";
const url = process.env.URL;

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token, user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.post("/google", async (req, res) => {
    const { google_id, name, email } = req.body;

    try {
        // Check if user already exists in the database
        let user = await pool.query("SELECT * FROM users WHERE google_id = $1", [google_id]);

        if (user.rows.length === 0) {
            // Insert new user if not found
            user = await pool.query(
                "INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *",
                [google_id, email, name]
            );
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: user.rows[0].id });
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Google OAuth callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`${url}/dashboard?token=${token}`);
    }
);

module.exports = router;
