const prisma = require("../db");
const { expenseSchema } = require("../validators/expenseValidator");

// CREATE
exports.createExpense = async (req, res, next) => {
  try {
    const idemKey = req.headers["idempotency-key"];

    if (!idemKey) {
      return res.status(400).json({ error: "Idempotency-Key required" });
    }

    // ✅ VALIDATION
    const parsed = expenseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    let { amount, category, description, date } = parsed.data;

    // 🔥 normalize category
    category = category.toLowerCase().trim();

    // 🔥 duplicate guard (same data spam)
    const existingSimilar = await prisma.expense.findFirst({
      where: {
        amount: Math.round(amount * 100),
        category,
        date: new Date(date),
      },
    });

    if (existingSimilar) {
      return res.status(409).json({ error: "Duplicate expense detected" });
    }

    try {
      const expense = await prisma.expense.create({
        data: {
          amount: Math.round(amount * 100),
          category,
          description,
          date: new Date(date),
          idemKey,
        },
      });

      return res.status(201).json(expense);

    } catch (err) {
      // 🔥 idempotency fallback
      if (err.code === "P2002") {
        const existing = await prisma.expense.findUnique({
          where: { idemKey },
        });

        return res.json(existing);
      }

      throw err;
    }

  } catch (err) {
    next(err);
  }
};

// GET
exports.getExpenses = async (req, res, next) => {
  try {
    const { category, sort } = req.query;

    const where = category
      ? { category: category.toLowerCase().trim() }
      : {};

    const orderBy =
      sort === "date_desc"
        ? { date: "desc" }
        : sort === "date_asc"
        ? { date: "asc" }
        : { created_at: "desc" };

    const expenses = await prisma.expense.findMany({
      where,
      orderBy,
    });

    res.json(expenses);

  } catch (err) {
    next(err);
  }
};