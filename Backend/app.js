const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./controllers/authController');
const transactionRoutes = require('./controllers/transactionController');
const sourceRoutes = require('./controllers/sourceController');
const summaryRoutes = require('./controllers/summaryController');
const budgetRoutes=require('./controllers/budgetContoller')

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/source', sourceRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/budget',budgetRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
