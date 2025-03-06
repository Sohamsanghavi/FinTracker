import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "./HomePage";

const Expenses = () => {
    const [expenseTransactions, setExpenseTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [updatedAmount, setUpdatedAmount] = useState("");
    const navigate = useNavigate();
    const [user, setUser] = useState(localStorage.getItem("user"));

    useEffect(() => {
        fetchExpenseTransactions();
        setUser(localStorage.getItem("user"))
    }, []);

    const fetchExpenseTransactions = async () => {
        try {
            const res = await axios.get("/api/transactions", { params: { user: user, type: "expense" } });
            setExpenseTransactions(res.data);
        } catch (error) {
            console.error("Error fetching expense transactions:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            try {
                await axios.delete(`/api/transactions/${id}`);
                setExpenseTransactions(expenseTransactions.filter(txn => txn.id !== id));
            } catch (error) {
                console.error("Error deleting transaction:", error);
            }
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setUpdatedAmount(transaction.amount);
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`/api/transactions/${editingTransaction.id}`, { amount: updatedAmount });
            setExpenseTransactions(expenseTransactions.map(txn => txn.id === editingTransaction.id ? { ...txn, amount: updatedAmount } : txn));
            setEditingTransaction(null);
        } catch (error) {
            console.error("Error updating transaction:", error);
        }
    };

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Expense Transactions</h1>

                {/* Responsive table wrapper */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2 text-sm md:text-base">Date</th>
                                <th className="border p-2 text-sm md:text-base">Amount</th>
                                <th className="border p-2 text-sm md:text-base">Source</th>
                                <th className="border p-2 text-sm md:text-base">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenseTransactions.map(txn => (
                                <tr key={txn.id} className="border">
                                    <td className="border p-2 text-sm md:text-base">{txn.date}</td>
                                    <td className="border p-2 text-sm md:text-base">${txn.amount}</td>
                                    <td className="border p-2 text-sm md:text-base">{txn.source_name}</td>
                                    <td className="border p-2">
                                        <div className="flex flex-col md:flex-row gap-2">
                                            <button
                                                className="px-2 py-1 bg-yellow-500 text-white rounded text-sm md:text-base"
                                                onClick={() => handleEdit(txn)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="px-2 py-1 bg-red-500 text-white rounded text-sm md:text-base"
                                                onClick={() => handleDelete(txn.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Edit Modal */}
                {editingTransaction && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
                            <input
                                type="number"
                                value={updatedAmount}
                                onChange={(e) => setUpdatedAmount(e.target.value)}
                                className="border p-2 w-full mb-4 text-sm md:text-base"
                            />
                            <div className="flex flex-col md:flex-row gap-2">
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded text-sm md:text-base"
                                    onClick={handleUpdate}
                                >
                                    Save
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded text-sm md:text-base"
                                    onClick={() => setEditingTransaction(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </Layout>
    );
};

export default Expenses;
