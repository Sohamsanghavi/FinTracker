import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "./HomePage";

const Income = () => {
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [updatedAmount, setUpdatedAmount] = useState("");
    const [user, setUser] = useState(localStorage.getItem("user"));
    const navigate = useNavigate();

    useEffect(() => {
        fetchIncomeTransactions();
        setUser(localStorage.getItem("user"))
    }, []);

    const fetchIncomeTransactions = async () => {
        try {
            const res = await axios.get("/api/transactions", { params: { user: user, type: "income" } });
            setIncomeTransactions(res.data);
        } catch (error) {
            console.error("Error fetching income transactions:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            try {
                await axios.delete(`/api/transactions/${id}`);
                setIncomeTransactions(incomeTransactions.filter(txn => txn.id !== id));
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
            setIncomeTransactions(incomeTransactions.map(txn => txn.id === editingTransaction.id ? { ...txn, amount: updatedAmount } : txn));
            setEditingTransaction(null);
        } catch (error) {
            console.error("Error updating transaction:", error);
        }
    };

    return (
        <Layout>
            <div>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Income Transactions</h1>

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Amount</th>
                            <th className="border p-2">Source</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incomeTransactions.map(txn => (
                            <tr key={txn.id} className="border">
                                <td className="border p-2">{txn.date}</td>
                                <td className="border p-2">${txn.amount}</td>
                                <td className="border p-2">{txn.source_name}</td>
                                <td className="border p-2">
                                    <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2" onClick={() => handleEdit(txn)}>Edit</button>
                                    <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(txn.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Edit Modal */}
                {editingTransaction && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
                            <input
                                type="number"
                                value={updatedAmount}
                                onChange={(e) => setUpdatedAmount(e.target.value)}
                                className="border p-2 w-full mb-4"
                            />
                            <div className="flex justify-end">
                                <button className="px-4 py-2 bg-green-500 text-white rounded mr-2" onClick={handleUpdate}>Save</button>
                                <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={() => setEditingTransaction(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </Layout>
    );
};

export default Income;
