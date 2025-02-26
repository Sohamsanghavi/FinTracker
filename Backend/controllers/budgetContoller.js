const pool = require("../db/db");
const express = require("express");
const router = express.Router();

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
router.get("/:user_id", async(req, res) => {
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
    } catch(error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}); // Get Budget & Spending Progress

module.exports = router;

