import { useState } from "react";
import { createExpense } from "../api";
import { addToQueue } from "../utils/offlineQueue";

export default function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      amount: "",
      category: "",
      description: "",
      date: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // VALIDATION
    if (!form.amount || !form.category.trim() || !form.date) {
      alert("Amount, category and date are required");
      return;
    }

    if (Number(form.amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (form.date > today) {
      alert("Date cannot be in the future");
      return;
    }

    setLoading(true);

    const key = crypto.randomUUID();

    const payload = {
      ...form,
      category: form.category.trim(),
      amount: Number(form.amount),
    };

    // 🔥 instant UI update object
    const tempExpense = {
      id: key,
      ...payload,
      amount: Math.round(payload.amount * 100),
      created_at: new Date().toISOString(),
    };

    // 🔥 immediate refresh (offline + online)
    onAdd(tempExpense);

    try {
      await createExpense(payload, key);
    } catch {
      addToQueue({ data: payload, key });
    } finally {
      resetForm();   // 🔥 form reset every time
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Expense</h3>

      <input
        type="number"
        name="amount"
        min="1"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
      />

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
      />

      <input
        type="text"
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <input
        type="date"
        name="date"
        max={new Date().toISOString().split("T")[0]}
        value={form.date}
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Expense"}
      </button>
    </form>
  );
}