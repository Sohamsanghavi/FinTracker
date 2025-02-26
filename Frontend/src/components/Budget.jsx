import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./HomePage";

export default function BudgetPage({ userId }) {
    const [budgets, setBudgets] = useState([]);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [user, setUser] = useState(localStorage.getItem("user"));
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        fetchBudgets();
    }, []);

    useEffect(() => {
        checkBudgetOverrun();
    }, [budgets]);

    const fetchBudgets = async () => {
        try {
            const response = await axios.get(`/api/budget/${user}`);
            console.log(response.data.budgets);
            setBudgets(response.data.budgets);
        } catch (error) {
            console.error("Error fetching budgets:", error);
        }
    };

    const handleSetBudget = async () => {
        if (!category || !amount) return;
        try {
            await axios.post("/api/budget", { user_id: user, category, amount });
            fetchBudgets();
            setCategory("");
            setAmount("");
        } catch (error) {
            console.error("Error setting budget:", error);
        }
    };

    const checkBudgetOverrun = async () => {
        if (emailSent) return; // Prevent multiple emails

        const overBudget = budgets.find((b) => parseFloat(b.spent) > parseFloat(b.budget_amount));
        console.log("over", overBudget);
        if (overBudget) {
            try {
                await axios.post("/api/budget/notify", { user_id: user, category: overBudget.category });
                setEmailSent(true);
                console.log("Budget overrun email sent!");
            } catch (error) {
                console.error("Error sending budget notification:", error);
            }
        }
    };

    return (
        <Layout>
            <div className="p-4 max-w-lg mx-auto">
                <h2 className="text-xl font-bold mb-4">Budget Tracker</h2>

                {/* Set Budget Form */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <button onClick={handleSetBudget} className="bg-blue-500 text-white px-4 py-2">
                        Set Budget
                    </button>
                </div>

                {/* Budget Progress */}
                <ul>
                    {budgets.map((b, index) => {
                        const progress = ((b.spent / b.budget_amount) * 100).toFixed(1);
                        return (
                            <li key={index} className="mb-4">
                                <div className="flex justify-between">
                                    <span className="font-semibold">{b.category}</span>
                                    <span className="text-sm">{b.spent} / {b.budget_amount}</span>
                                </div>
                                <div className="w-full bg-gray-200 h-4 rounded-lg mt-1">
                                    {progress > 100 ? <div
                                        className="h-4 bg-red-500 rounded-lg"
                                        style={{ width: `100%` }}
                                    ></div> : <div
                                        className="h-4 bg-green-500 rounded-lg"
                                        style={{ width: `${progress}%` }}
                                    ></div>}

                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Layout>
    );
}
