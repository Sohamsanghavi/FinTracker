const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables from .env file

const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database: process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT
});

// pool.on('connect', () => {
//     console.log('Connected to the PostgreSQL database on Render');
// });
const createUserTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    try {
        await pool.query(query);
        console.log("✅ User table created successfully!");
    } catch (error) {
        console.error("❌ Error creating User table:", error);
    }
};

// Create Income Source Table
const createIncomeSourceTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS income_sources (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    try {
        await pool.query(query);
        console.log("✅ Income Source table created successfully!");
    } catch (error) {
        console.error("❌ Error creating Income Source table:", error);
    }
};

// Create Expense Source Table
const createExpenseSourceTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS expense_sources (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      category VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    try {
        await pool.query(query);
        console.log("✅ Expense Source table created successfully!");
    } catch (error) {
        console.error("❌ Error creating Expense Source table:", error);
    }
};
const createBudgetTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category VARCHAR(100) NOT NULL,
      amount DECIMAL(12,2) NOT NULL, -- Budget amount for the category
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, category) -- Ensure unique budget per category per user
    );
  `;

    try {
        await pool.query(query);
        console.log("✅ Budget table created successfully!");
    } catch (error) {
        console.error("❌ Error creating Budget table:", error);
    }
};


// Create Transaction Table
const createTransactionTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(12,2) NOT NULL,
      transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
      income_source_id INTEGER REFERENCES income_sources(id),
      expense_source_id INTEGER REFERENCES expense_sources(id),
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      description TEXT,
      payment_method VARCHAR(50),
      is_recurring BOOLEAN DEFAULT FALSE,
      receipt_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHECK (
        (transaction_type = 'income' AND income_source_id IS NOT NULL AND expense_source_id IS NULL) OR
        (transaction_type = 'expense' AND expense_source_id IS NOT NULL AND income_source_id IS NULL)
      )
    );
  `;

    try {
        await pool.query(query);
        console.log("✅ Transaction table created successfully!");
    } catch (error) {
        console.error("❌ Error creating Transaction table:", error);
    }
};


createUserTable();
createIncomeSourceTable();
createExpenseSourceTable();
createTransactionTable();
createTransactionTable();
createBudgetTable();

module.exports = pool;
