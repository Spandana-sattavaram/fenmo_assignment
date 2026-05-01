export default function ExpenseList({ expenses }) {
  if (!Array.isArray(expenses)) return <p>Loading...</p>;

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="expense-list">
      <h3>Total: ₹{(total / 100).toFixed(2)}</h3>

      {expenses.length === 0 && <p>No expenses yet</p>}

      {expenses.map((e) => {
        const formattedDate = e.date
          ? new Date(e.date).toLocaleDateString("en-IN")
          : "";

        return (
          <div className="expense-item" key={e.id}>
            <div>
              <strong>{e.category || "N/A"}</strong>
              <span style={{ marginLeft: "10px", fontSize: "12px" }}>
                ({formattedDate})
              </span>
            </div>

            <div>
              ₹{((e.amount || 0) / 100).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}