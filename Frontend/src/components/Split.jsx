import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/SplitExpense.css';
import Layout from './HomePage';

const SplitExpenseManager = () => {
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [owedSplits, setOwedSplits] = useState([]);
    const [madeSplits, setMadeSplits] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [settleId, setSettleId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentUserId, setCurrentUserId] = useState(localStorage.getItem("user"));
    // Assume currentUserId is retrieved from authentication context
    // Replace with actual user ID from auth

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Fetch all required data in parallel
                const [usersRes, categoriesRes, owedRes, madeRes] = await Promise.all([
                    axios.get('/api/splits/users'),
                    axios.get(`/api/splits/categories?userId=${currentUserId}`),
                    axios.get(`/api/splits/owed?userId=${currentUserId}`),
                    axios.get(`/api/splits/made?userId=${currentUserId}`)
                ]);

                // Filter out current user from users list
                console.log(usersRes);
                setUsers(usersRes.data.filter(user => user.id !== currentUserId));
                setCategories(categoriesRes.data);
                setOwedSplits(owedRes.data);
                setMadeSplits(madeRes.data);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching initial data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [currentUserId]);

    const refreshSplits = async () => {
        try {
            const [owedRes, madeRes] = await Promise.all([
                axios.get(`/api/splits/owed?userId=${currentUserId}`),
                axios.get(`/api/splits/made?userId=${currentUserId}`)
            ]);
            setOwedSplits(owedRes.data);
            setMadeSplits(madeRes.data);
        } catch (err) {
            setError('Failed to refresh splits. Please try again.');
            console.error('Error refreshing splits:', err);
        }
    };

    const handleAddSplit = async (e) => {
        e.preventDefault();
        if (!selectedUser || !amount) return;

        setIsLoading(true);
        try {
            await axios.post(`/api/splits/split-expense?fromUserId=${currentUserId}&toUserId=${selectedUser}&amount=${amount}`);
            setSelectedUser('');
            setAmount('');
            await refreshSplits();
        } catch (err) {
            setError('Failed to add split. Please try again.');
            console.error('Error adding split:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettle = async (splitId) => {
        if (!selectedCategory) {
            setError('Please select a category');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`/api/splits/settle-expense?splitId=${splitId}&category=${selectedCategory}`);
            setSettleId(null);
            setSelectedCategory('');
            await refreshSplits();
        } catch (err) {
            setError('Failed to settle expense. Please try again.');
            console.error('Error settling expense:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const openSettleModal = (id) => {
        setSettleId(id);
    };

    const closeSettleModal = () => {
        setSettleId(null);
        setSelectedCategory('');
    };

    // Helper function to find user name by ID
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : `User ${userId}`;
    };

    if (isLoading && !users.length) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <Layout>
            <div className="split-expense-container">
                <h1>Split Expenses</h1>

                {error && <div className="error-message">{error}</div>}

                <div className="add-split-section">
                    <h2>Add New Split</h2>
                    <form onSubmit={handleAddSplit}>
                        <div className="form-group">
                            <label>Split With:</label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                required
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Amount:</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Split'}
                        </button>
                    </form>
                </div>

                <div className="splits-section">
                    <div className="owed-splits">
                        <h2>Splits Owed to Me</h2>
                        {madeSplits.length === 0 ? (
                            <p>No splits owed to you.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>From</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {madeSplits.map(split => (
                                        <tr key={split.split_id} className={split.is_settled ? 'settled' : ''}>
                                            <td>{getUserName(split.split_to_user_id)}</td>
                                            <td>${parseFloat(split.amount).toFixed(2)}</td>
                                            <td>{split.is_settled ? 'Paid' : 'Unpaid'}</td>
                                            <td>
                                                {!split.is_settled && (
                                                    <button
                                                        className="remind-btn"
                                                        onClick={() => alert(`Reminder functionality would go here`)}
                                                    >
                                                        Remind
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="made-splits">
                        <h2>Splits I Owe</h2>
                        {owedSplits.length === 0 ? (
                            <p>No splits owed by you.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>To</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {owedSplits.map(split => (
                                        <tr key={split.split_id} className={split.is_settled ? 'settled' : ''}>
                                            <td>{getUserName(split.split_from_user_id)}</td>
                                            <td>${parseFloat(split.amount).toFixed(2)}</td>
                                            <td>{split.is_settled ? 'Paid' : 'Unpaid'}</td>
                                            <td>
                                                {!split.is_settled && (
                                                    <button
                                                        className="settle-btn"
                                                        onClick={() => openSettleModal(split.split_id)}
                                                    >
                                                        Settle
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {settleId && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Settle Expense</h2>
                            <p>Select a category for this expense:</p>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <div className="modal-buttons">
                                <button onClick={closeSettleModal}>Cancel</button>
                                <button
                                    onClick={() => handleSettle(settleId)}
                                    disabled={isLoading || !selectedCategory}
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Settlement'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SplitExpenseManager;