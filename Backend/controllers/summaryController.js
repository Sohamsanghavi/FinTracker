const express = require("express");
const pool = require("../db/db");

const router = express.Router();

// Get total income and total expenses for the current month
router.get('/graph-data', async (req, res) => {
    try {
        const userId = req.query.user; // Assuming you have authentication middleware that sets req.user

        const query = `
            SELECT
        TO_CHAR(transaction_date, 'YYYY-MM-DD') as date,
            SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = $1
      AND transaction_date >= NOW() - INTERVAL '24 months'
      GROUP BY TO_CHAR(transaction_date, 'YYYY-MM-DD')
      ORDER BY date`
            ;

        const result = await pool.query(query, [userId]);
        console.log(result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching graph data:', error);
        res.status(500).json({ error: 'Failed to fetch graph data' });
    }
});
router.get("/monthly-summary", async (req, res) => {
    try {
        const userId = req.body.user;

        const query = `
            SELECT
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as monthly_income,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as monthly_expenses
            FROM transactions
            WHERE user_id = $1
            AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
            AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        `;

        const result = await pool.query(query, [userId]);

        res.json({
            monthly_income: parseFloat(result.rows[0].monthly_income) || 0,
            monthly_expenses: parseFloat(result.rows[0].monthly_expenses) || 0,
            balance: parseFloat(result.rows[0].monthly_income || 0) - parseFloat(result.rows[0].monthly_expenses || 0),
        });
    } catch (error) {
        console.error("Error fetching monthly summary:", error);
        res.status(500).json({ error: "Failed to fetch monthly summary" });
    }
});

module.exports = router;
