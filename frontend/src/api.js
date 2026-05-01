import {
  getLocalExpenses,
  cacheExpenses,
  addLocalExpense,
} from "./utils/localDB";
import { addToQueue } from "./utils/offlineQueue";

// CREATE
export async function createExpense(data, key) {
  // 🔥 convert ONCE here for local consistency
  const payload = {
    ...data,
    amount: Math.round(Number(data.amount) * 100), // paise
  };

  const localExpense = {
    id: key,
    ...payload,
    created_at: new Date().toISOString(),
  };

  // 🔥 always store paise locally
  addLocalExpense(localExpense);

  // OFFLINE → queue ORIGINAL rupees (backend expects rupees)
  if (!navigator.onLine) {
    addToQueue({ data, key });
    return localExpense;
  }

  try {
    const res = await fetch(import.meta.env.VITE_API_URL + "/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": key,
      },
      body: JSON.stringify(data), // send rupees to backend
    });

    if (!res.ok) throw new Error();

    const result = await res.json();
    // 🔥 remove temp entry (same key)
const existing = getLocalExpenses();
const filtered = existing.filter((e) => e.id !== key);
saveLocalExpenses(filtered);

// then cache real server data
cacheExpenses([result]);

    // 🔥 backend returns paise → overwrite local copy
    cacheExpenses([result]);

    return result;

  } catch {
    // fallback → queue original rupees
    addToQueue({ data, key });
    return localExpense;
  }
}

// GET (SAFE + OFFLINE SUPPORT)
export async function getExpenses(category, sort) {
  try {
    if (!navigator.onLine) throw new Error();

    let url = import.meta.env.VITE_API_URL + "/expenses?";

    if (category) url += `category=${category}&`;
    if (sort) url += `sort=${sort}`;

    const res = await fetch(url);

    if (!res.ok) throw new Error();

    const data = await res.json();

    // 🔥 cache server data (paise)
    localStorage.setItem("expenses_local", JSON.stringify(data));

    return data || [];

  } catch {
    let data = [];

    try {
      data = getLocalExpenses();
    } catch {
      data = [];
    }

    if (!Array.isArray(data)) data = [];

    // FILTER
    if (category) {
      data = data.filter(
        (e) =>
          e.category &&
          e.category.toLowerCase() === category.toLowerCase()
      );
    }

    // SORT
    if (sort === "date_desc") {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (sort === "date_asc") {
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return data;
  }
}