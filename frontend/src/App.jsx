import { useEffect, useState } from "react";
import { getExpenses, createExpense } from "./api";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import { getQueue, saveQueue } from "./utils/offlineQueue";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  // 🔥 LOAD FILTERED DATA
  const load = async () => {
    setLoading(true);
    const data = await getExpenses(category, sort);
    setExpenses(data);
    setLoading(false);
  };

  // 🔥 LOAD ALL DATA (for category dropdown)
  const loadAll = async () => {
    const data = await getExpenses();
    setAllExpenses(data);
  };

  // INITIAL LOAD
  useEffect(() => {
    load();
    loadAll();
  }, []);

  // FILTER / SORT CHANGE
  useEffect(() => {
    load();
  }, [category, sort]);

  // 🔥 OFFLINE SYNC
 // 🔥 OFFLINE SYNC (FIXED)
useEffect(() => {
  const sync = async () => {
    const queue = getQueue();
    const remaining = [];

    for (const item of queue) {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + "/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": item.key,
          },
          body: JSON.stringify(item.data),
        });

        if (!res.ok) throw new Error();

        const serverExpense = await res.json();

        // 🔥 replace temp local entry with server entry
        const local = JSON.parse(localStorage.getItem("expenses_local")) || [];

        const map = new Map();

local.forEach((e) => {
  if (e && e.id !== item.key) {
    map.set(e.id, e);
  }
});

map.set(serverExpense.id, serverExpense);

localStorage.setItem(
  "expenses_local",
  JSON.stringify(Array.from(map.values()))
);

      } catch {
        remaining.push(item);
      }
    }

    // 🔥 keep only failed items
    saveQueue(remaining);

    load();
    loadAll();
  };

  window.addEventListener("online", sync);

  // run once on mount
  sync();

  return () => window.removeEventListener("online", sync);
}, []);

  // 🔥 CATEGORY LIST (always from full data)
  const categories = [...new Set(allExpenses.map((e) => e.category))];

  // 🔥 INSTANT UI UPDATE AFTER ADD
  const handleAdd = (newExpense) => {
    if (newExpense) {
      setExpenses((prev) => [newExpense, ...prev]);
      setAllExpenses((prev) => [newExpense, ...prev]);
    } else {
      load();
      loadAll();
    }
  };

  return (
    <div>
      <h1>Expense Tracker</h1>

      {/* FILTER + SORT */}
      <div className="controls">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Default</option>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
        </select>
      </div>

      {/* FORM */}
      <ExpenseForm onAdd={handleAdd} />

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ExpenseList expenses={expenses} />
      )}
    </div>
  );
}

export default App;