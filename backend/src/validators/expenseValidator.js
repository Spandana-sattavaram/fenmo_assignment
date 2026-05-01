const { z } = require("zod");

exports.expenseSchema = z.object({
  amount: z
    .number()
    .positive({ message: "Amount must be greater than 0" })
    .max(10000000, { message: "Amount too large" }),

  category: z
    .string()
    .trim()
    .min(1, { message: "Category is required" }),

  description: z.string().optional(),

  date: z.string().refine((val) => {
    const inputDate = new Date(val);

    // 🔥 invalid date check
    if (isNaN(inputDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate <= today;
  }, {
    message: "Invalid or future date not allowed",
  }),
});