const express = require('express');
const pool = require('../db/db');

const router = express.Router();

router.post("/split-expense", async (req, res) => {
    try {
        const { fromUserId, toUserId, amount } = req.query;
        console.log(req)
        if (!fromUserId || !toUserId || !amount) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const result = await pool.query(
            `INSERT INTO split_expenses (split_from_user_id, split_to_user_id, amount, is_settled) 
       VALUES ($1, $2, $3, FALSE) RETURNING *`,
            [fromUserId, toUserId, amount]
        );

        res.json({ message: "Split expense added", split: result.rows[0] });
        console.log("Added");
    } catch (error) {
        console.error("Error adding split expense:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/settle-expense", async (req, res) => {
    try {
        const { splitId, category } = req.query;
        if (!splitId) {
            return res.status(400).json({ error: "Split ID is required" });
        }

        const split = await pool.query(
            "SELECT * FROM split_expenses WHERE split_id = $1",
            [splitId]
        );

        if (split.rows.length === 0) {
            return res.status(404).json({ error: "Split expense not found" });
        }

        const { split_from_user_id, split_to_user_id, amount } =
            split.rows[0];

        await pool.query("UPDATE split_expenses SET is_settled = TRUE WHERE split_id = $1", [splitId]);

        const expenseSource = await pool.query(
            "SELECT id FROM expense_sources WHERE name = $1",
            [category]
        );

        const expenseSourceId = expenseSource.rows[0]?.id;
        if (!expenseSourceId) {
            return res.status(400).json({ error: "Invalid expense category" });
        }

        await pool.query(
            `INSERT INTO transactions (user_id, amount, transaction_type, expense_source_id, transaction_date, description) 
       VALUES ($1, $2, 'expense', $3, NOW(), $4)`,
            [split_to_user_id, amount, expenseSourceId, `Settled with User ${split_from_user_id}`]
        );

        await pool.query(
            `INSERT INTO transactions (user_id, amount, transaction_type, transaction_date, description) 
       VALUES ($1, $2, 'income', NOW(), $3)`,
            [split_from_user_id, amount, `Settled amount recived from User ${split_to_user_id}`]
        );

        res.json({ message: "Expense settled successfully" });
    } catch (error) {
        console.error("Error settling expense:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get splits owed by a user
router.get("/owed", async (req, res) => {
    try {
        const { userId } = req.query;
        const result = await pool.query(
            "SELECT * FROM split_expenses WHERE split_to_user_id = $1",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching owed splits:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get splits made by a user
router.get("/made", async (req, res) => {
    try {
        const { userId } = req.query;
        // console.log(userId)
        const result = await pool.query(
            "SELECT * FROM split_expenses WHERE split_from_user_id = $1",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching made splits:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/categories", async (req, res) => {
    try {
        const { userId } = req.query;
        const result = await pool.query("SELECT * FROM expense_sources WHERE user_id = $1",[userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
