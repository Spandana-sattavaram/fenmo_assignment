const KEY = "expenses_local";

export function getLocalExpenses() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveLocalExpenses(expenses) {
   localStorage.setItem("expenses_local", JSON.stringify(expenses));
}

// 🔥 IMPORTANT: replace duplicates
export function cacheExpenses(expenses) {
  const existing = getLocalExpenses();
  const map = new Map();

  // first existing
  existing.forEach((e) => {
    if (e && e.id) {
      map.set(e.id, e);
    }
  });

  // then overwrite with server data
  expenses.forEach((e) => {
    if (e && e.id) {
      map.set(e.id, e);
    }
  });

  saveLocalExpenses(Array.from(map.values()));

}

export function addLocalExpense(expense) {
  const existing = getLocalExpenses();

  const exists = existing.find((e) => e.id === expense.id);
  if (exists) return; // 🔥 prevent duplicates

  saveLocalExpenses([expense, ...existing]);
}