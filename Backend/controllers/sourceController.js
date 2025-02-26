const express = require('express');
const pool = require('../db/db');

const router = express.Router();

router.get('/income-sources', async (req, res) => {
    try {
        const userId = req.query.user; // Assuming you have authentication middleware
        const query = `
            SELECT id, name, description
      FROM income_sources
      WHERE user_id = $1 AND is_active = true
      ORDER BY name`
            ;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching income sources:', error);
        res.status(500).json({ error: 'Failed to fetch income sources' });
    }
});

// Get all expense sources
router.get('/expense-sources', async (req, res) => {
    try {
        const userId = req.query.user; // Assuming you have authentication middleware
        const query = `
            SELECT id, name, description, category
      FROM expense_sources
      WHERE user_id = $1 AND is_active = true
      ORDER BY category, name`
            ;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching expense sources:', error);
        res.status(500).json({ error: 'Failed to fetch expense sources' });
    }
});


router.post('/income-sources', async (req, res) => {
    try {
        const userId = req.body.user
        const { name, description } = req.body;
        console.log(userId, name, description);

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const query =
            `INSERT INTO income_sources (user_id, name, description)
        VALUES($1, $2, $3)
      RETURNING id, name, description`
            ;

        const result = await pool.query(query, [userId, name, description]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding income source:', error);
        res.status(500).json({ error: 'Failed to add income source' });
    }
});

router.post('/expense-sources', async (req, res) => {
    try {
        const userId = req.body.user;
        const { name, description, category } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const query =
            `INSERT INTO expense_sources (user_id, name, description, category)
        VALUES($1, $2, $3, $4)
      RETURNING id, name, description, category`
            ;

        const result = await pool.query(query, [userId, name, description, category]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding expense source:', error);
        res.status(500).json({ error: 'Failed to add expense source' });
    }
});


module.exports = router;
