// Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import Layout from "./HomePage";
// Configure axios defaults
// axios.defaults.baseURL = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://fj-be-r2-soham-sanghavi-iiitp-1.onrender.com";
axios.defaults.baseURL = "https://fj-be-r2-soham-sanghavi-iiitp-1.onrender.com";
// 
const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [income, setIncome] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [graphData, setGraphData] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [user, setUser] = useState(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        description: '',
        sourceId: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        user: user,
    });

    const [incomeSources, setIncomeSources] = useState([]);
    const [expenseSources, setExpenseSources] = useState([]);
    const [category, setCategory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingSource, setIsAddingSource] = useState(false);
    const [newSource, setNewSource] = useState("");
    const [timePeriod, setTimePeriod] = useState('daily');
    // const [graphData, setGraphData] = useState([]);

    // Function to group data by time period
    useEffect(() => {
        // console.log(rawData);
        let aggregatedData = [];

        if (timePeriod === 'daily') {
            // Daily data - use raw data
            aggregatedData = rawData;
        }
        else if (timePeriod === 'weekly') {
            // Group by week
            const weeklyData = {};

            rawData.forEach(item => {
                // console.log("items:",item);
                const date = new Date(item.date);
                const weekStart = new Date(date);

                weekStart.setDate(date.getDate() - date.getDay());
                const weekKey = weekStart.toISOString().split('T')[0];
                // console.log("date:",date,"weekStart:",weekStart,"weekKey:",weekKey);
                if (!weeklyData[weekKey]) {
                    weeklyData[weekKey] = { date: `Week of ${weekKey}`, income: 0, expense: 0 };
                }

                weeklyData[weekKey].income += parseFloat(item.income);
                weeklyData[weekKey].expense += parseFloat(item.expense);
            });
            // console.log("Weekly data:", weeklyData);
            aggregatedData = Object.values(weeklyData);
        }
        else if (timePeriod === 'monthly') {
            // Group by month
            const monthlyData = {};

            rawData.forEach(item => {
                const yearMonth = item.date.substring(0, 7);

                if (!monthlyData[yearMonth]) {
                    const date = new Date(item.date);
                    const monthName = date.toLocaleString('default', { month: 'long' });
                    monthlyData[yearMonth] = {
                        date: `${monthName} ${date.getFullYear()}`,
                        income: 0,
                        expense: 0
                    };
                }

                monthlyData[yearMonth].income += parseFloat(item.income);
                monthlyData[yearMonth].expense += parseFloat(item.expense);
            });

            aggregatedData = Object.values(monthlyData);
        }
        else if (timePeriod === 'yearly') {
            // Group by year
            const yearlyData = {};

            rawData.forEach(item => {
                const year = item.date.substring(0, 4);

                if (!yearlyData[year]) {
                    yearlyData[year] = { date: year, income: 0, expense: 0 };
                }

                yearlyData[year].income += parseFloat(item.income);
                yearlyData[year].expense += parseFloat(item.expense);
            });

            aggregatedData = Object.values(yearlyData);
        }

        setGraphData(aggregatedData);
    }, [timePeriod, rawData]);

    useEffect(() => {
        // Fetch transactions from backend API
        setUser(localStorage.getItem("user"))
        fetchTransactions();

        // Fetch graph data
        axios.get("/api/summary/graph-data", { params: { user: user } })
            .then((response) => setRawData(response.data))
            .catch((err) => console.error("Error fetching graph data:", err));

        // Fetch income and expense sources
        axios.get("/api/source/income-sources", { params: { user: user } })
            .then((response) => setIncomeSources(response.data))
            .catch((err) => console.error("Error fetching income sources:", err));

        axios.get("/api/source/expense-sources", { params: { user: user } })
            .then((response) => setExpenseSources(response.data))
            .catch((err) => console.error("Error fetching expense sources:", err));
    }, []);

    const handleAddSource = async () => {
        if (!newSource.trim()) return alert("Source name cannot be empty!");

        try {
            const endpoint = formData.type === "income" ? "/api/source/income-sources" : "/api/source/expense-sources";
            const response = await axios.post(endpoint, { name: newSource, user: user, category: category });

            if (formData.type === "income") {
                setIncomeSources([...incomeSources, response.data]);
            } else {
                setExpenseSources([...expenseSources, response.data]);
            }

            setNewSource("");
            setIsAddingSource(false);
        } catch (error) {
            console.error("Error adding source:", error);
            alert("Failed to add source. Please try again.");
        }
    };

    const fetchTransactions = () => {
        axios.get("/api/transactions", { params: { user: user } })
            .then((response) => {
                setTransactions(response.data);
                calculateTotals(response.data);
            })
            .catch((err) => console.error("Error fetching transactions:", err));
    };

    const calculateTotals = (data) => {
        let totalIncome = 0;
        let totalExpenses = 0;

        data.forEach((transaction) => {
            if (transaction.type === "income") {
                totalIncome += parseFloat(transaction.amount);
            } else {
                totalExpenses += parseFloat(transaction.amount);
            }
        });

        setIncome(totalIncome);
        setExpenses(totalExpenses);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Create transaction object
            const transactionData = {
                amount: parseFloat(formData.amount),
                transaction_type: formData.type,
                description: formData.description,
                transaction_date: formData.date,
                payment_method: formData.paymentMethod,
                ...(formData.type === 'income'
                    ? { income_source_id: parseInt(formData.sourceId) }
                    : { expense_source_id: parseInt(formData.sourceId) }),
                user: user,
            };

            // Send transaction to backend using axios
            const response = await axios.post("/api/transactions", transactionData);

            // Reset form and refresh data
            setFormData({
                amount: '',
                type: 'expense',
                description: '',
                sourceId: '',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'cash',
                user: user
            });

            setIsFormOpen(false);
            fetchTransactions();

            // Fetch updated graph data
            axios.get("/api/summary/graph-data", { params: { user: user } })
                .then((response) => setRawData(response.data))
                .catch((err) => console.error("Error fetching updated graph data:", err));

        } catch (error) {
            console.error("Error adding transaction:", error);
            alert("Failed to add transaction. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setIsFormOpen(!isFormOpen)}
                    >
                        {isFormOpen ? "Cancel" : "Add Transaction"}
                    </button>
                </div>

                {isFormOpen && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4">
                            Add New Transaction
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    >
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0.01"
                                        className="w-full p-2 border rounded"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.type === 'income' ? 'Income Source' : 'Expense Category'}
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            name="sourceId"
                                            value={formData.sourceId}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded"
                                            required
                                        >
                                            <option value="">Select {formData.type === 'income' ? 'source' : 'category'}</option>
                                            {formData.type === 'income'
                                                ? incomeSources.map(source => (
                                                    <option key={source.id} value={source.id}>{source.name}</option>
                                                ))
                                                : expenseSources.map(source => (
                                                    <option key={source.id} value={source.id}>{source.name}</option>
                                                ))
                                            }
                                        </select>
                                        <button
                                            type="button"
                                            className="bg-green-500 text-white px-3 py-2 rounded"
                                            onClick={() => setIsAddingSource(true)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                {isAddingSource && (
                                    <div className="bg-gray-100 p-4 rounded mt-2">
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded mb-2"
                                            placeholder={`Enter new ${formData.type === 'income' ? 'income source' : 'expense category'}`}
                                            value={newSource}
                                            onChange={(e) => setNewSource(e.target.value)}
                                        />



                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="bg-gray-400 text-white px-3 py-2 rounded"
                                                onClick={() => setIsAddingSource(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="bg-blue-500 text-white px-3 py-2 rounded"
                                                onClick={handleAddSource}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        placeholder="Transaction description"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="debit_card">Debit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Saving..." : "Save Transaction"}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-100 rounded-lg shadow-md cursor-pointer"
                        onClick={() => navigate("/income")}>
                        <h2 className="text-lg font-semibold">Total Income</h2>
                        <p className="text-xl font-bold">${income}</p>
                    </div>
                    <div className="p-4 bg-red-100 rounded-lg shadow-md cursor-pointer"
                        onClick={() => navigate("/expenses")}>
                        <h2 className="text-lg font-semibold">Total Expenses</h2>
                        <p className="text-xl font-bold">${expenses}</p>
                    </div>
                </div>

                <h2 className="text-xl font-bold mt-6">Income vs. Expenditure</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graphData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" fill="#4CAF50" name="Income" />
                        <Bar dataKey="expense" fill="#F44336" name="Expenses" />
                    </BarChart>
                </ResponsiveContainer>
                <div className="mb-4">
                    <label className="mr-2 font-medium">Time Period:</label>
                    <div className="inline-flex rounded-md shadow-sm">
                        <button
                            onClick={() => setTimePeriod('daily')}
                            className={`px-4 py-2 text-sm font-medium border ${timePeriod === 'daily'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                } rounded-l-lg`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setTimePeriod('weekly')}
                            className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${timePeriod === 'weekly'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setTimePeriod('monthly')}
                            className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${timePeriod === 'monthly'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setTimePeriod('yearly')}
                            className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${timePeriod === 'yearly'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                } rounded-r-lg`}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                <h2 className="text-xl font-bold mt-6">Latest Transactions</h2>
                <ul className="mt-3">
                    {transactions.length > 0 ? (
                        transactions.slice(0, 5).map((transaction) => (
                            <li key={transaction.id} className="p-2 border-b">
                                <span className={transaction.type === "income" ? "text-green-500" : "text-red-500"}>
                                    {transaction.type.toUpperCase()}:
                                </span>
                                ${transaction.amount} - {transaction.description}
                            </li>
                        ))
                    ) : (
                        <li className="p-2 text-gray-500">No transactions found</li>
                    )}
                </ul>
            </div>
        </Layout>
    );
};

export default Dashboard;