

module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.code === "P2002") {
    return res.status(200).json({ message: "Duplicate handled" });
  }

  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
};