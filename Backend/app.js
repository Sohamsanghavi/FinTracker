const express = require('express');
const cors = require('cors');
const passport = require("passport");
const session = require("express-session");
require('dotenv').config();
require("./controllers/passport");

const authRoutes = require('./controllers/authController');
const transactionRoutes = require('./controllers/transactionController');
const sourceRoutes = require('./controllers/sourceController');
const summaryRoutes = require('./controllers/summaryController');
const budgetRoutes = require('./controllers/budgetContoller')

const app = express();
app.use(
    cors({
        origin: "http://localhost:5173", // Allow your frontend origin
        methods: "GET, POST, PUT, DELETE",
        credentials: true, // Allow cookies/session sharing
    })
);
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
const PORT = process.env.PORT;

app.use(express.json());
// app.use(cors({ origin: "http://localhost:5173" }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/source', sourceRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/budget', budgetRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
