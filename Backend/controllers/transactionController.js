const express = require('express');
const pool = require('../db/db');

const router = express.Router();

// Get Transactions
router.get('/', async (req, res) => {
    try {
        const { user, type } = req.query;
        if (!user) {
            return res.status(400).json({ error: "User ID is required" });
        }

        let query = `
            SELECT t.id, t.amount, t.transaction_type AS type, t.transaction_date AS date, 
                   t.description, t.payment_method,
                   CASE 
                       WHEN t.transaction_type = 'income' THEN income_sources.name 
                       WHEN t.transaction_type = 'expense' THEN expense_sources.name 
                   END AS source_name
            FROM transactions t
            LEFT JOIN income_sources ON t.income_source_id = income_sources.id
            LEFT JOIN expense_sources ON t.expense_source_id = expense_sources.id
            WHERE t.user_id = $1
        `;

        let values = [user];

        if (type) {
            query += ` AND t.transaction_type = $2 ORDER BY t.created_at DESC`;
            values.push(type);
        } else {
            query += ` ORDER BY t.created_at DESC`;
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

// Add Transaction
router.post('/', async (req, res) => {
    try {
        await pool.query('BEGIN');

        const userId = req.body.user;
        const {
            amount, transaction_type, description, transaction_date,
            payment_method, income_source_id, expense_source_id
        } = req.body;

        if (!amount || !transaction_type || !transaction_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const query = `
            INSERT INTO transactions (user_id, amount, transaction_type, income_source_id, 
                                     expense_source_id, transaction_date, description, payment_method)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;

        const values = [
            userId, amount, transaction_type,
            transaction_type === 'income' ? income_source_id : null,
            transaction_type === 'expense' ? expense_source_id : null,
            transaction_date, description, payment_method
        ];

        const result = await pool.query(query, values);
        await pool.query('COMMIT');

        res.status(201).json({ id: result.rows[0].id, message: 'Transaction created successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

// Delete Transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM transactions WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ error: "Failed to delete transaction" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        const query = "UPDATE transactions SET amount = $1 WHERE id = $2 RETURNING *";
        const result = await pool.query(query, [amount, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.json({ message: "Transaction updated successfully", transaction: result.rows[0] });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ error: "Failed to update transaction" });
    }
});

module.exports = router;
