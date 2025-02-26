const pool = require("../db/db");
const express = require("express");
const router = express.Router();
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: "gmail", // You can change this to another email provider
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email app password
    },
});

// API to send budget overrun notification
router.post("/notify", async (req, res) => {
    const { user_id, category } = req.body;

    try {
        // Fetch user email from database (Assuming you have a PostgreSQL pool)
        const user = await pool.query("SELECT email FROM users WHERE id = $1", [user_id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userEmail = user.rows[0].email;

        // Email details
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Budget Overrun Alert 🚨",
            text: `Warning! You have exceeded your budget for "${category}". Please check your expenses.`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        console.log("Budget overrun notification sent to:", userEmail);
        res.json({ message: "Notification sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send notification" });
    }
});

router.post("/notify", async (req, res) => {
    const { user_id, category } = req.body;

    try {
        // Fetch user email from the database
        const user = await pool.query("SELECT email FROM users WHERE id = $1", [user_id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userEmail = user.rows[0].email;

        // Send an email notification
        const msg = {
            to: userEmail,
            from: "sanghavisoham02@gmail.com", // Use your verified SendGrid email
            subject: "Budget Overrun Alert",
            text: `Alert! You have exceeded your budget for ${category}. Please review your expenses.`,
        };

        await sgMail.send(msg);
        console.log("Budget overrun notification sent to:", userEmail);

        res.json({ message: "Notification sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send notification" });
    }
});

router.post("/", async (req, res) => {
    const { user_id, category, amount } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO budgets (user_id, category, amount)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, category) 
            DO UPDATE SET amount = EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP 
            RETURNING *`,
            [user_id, category, amount]
        );
        res.json({ success: true, budget: result.rows[0] });
    } catch (error) {
        console.error("Error setting budget:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}); // Set/Update Budget
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const budgets = await pool.query(
            `SELECT b.category, 
       b.amount AS budget_amount, 
       COALESCE(SUM(t.amount), 0) AS spent
FROM budgets b
LEFT JOIN transactions t 
    ON b.user_id = t.user_id 
    AND t.transaction_type = 'expense'
LEFT JOIN expense_sources es
    ON t.expense_source_id = es.id
WHERE b.user_id = $1 
AND b.category = es.name
GROUP BY b.category, b.amount;
`,
            [user_id]
        );
        res.json({ success: true, budgets: budgets.rows });
    } catch (error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}); // Get Budget & Spending Progress

module.exports = router;

