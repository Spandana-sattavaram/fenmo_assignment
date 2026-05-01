const express = require("express");
const cors = require("cors");

const expenseRoutes = require("./routes/expenses");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
app.use("/expenses", expenseRoutes);
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    res.status(503).json({ error: "Timeout" });
  });
  next();
});

app.use(errorHandler);

module.exports = app;