require("dotenv").config();

const express = require("express");
const { auth } = require("express-oauth2-jwt-bearer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// JWT Algorithm Validation Middleware - Prevents alg:none attacks
const jwtAlgorithmValidator = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return next();
  }

  const token = parts[1];
  const tokenParts = token.split(".");

  if (tokenParts.length !== 3) {
    return res.status(401).json({ error: "Invalid JWT format" });
  }

  try {
    // Decode header to check algorithm
    const headerJson = Buffer.from(tokenParts[0], "base64").toString("utf8");
    const header = JSON.parse(headerJson);

    // Explicitly reject alg:none and non-RS256 algorithms
    if (!header.alg) {
      return res.status(401).json({ error: "JWT algorithm missing" });
    }

    if (header.alg.toLowerCase() === "none") {
      return res.status(401).json({ error: "JWT alg:none is not allowed" });
    }

    if (header.alg !== "RS256") {
      return res.status(401).json({ error: "JWT algorithm not allowed" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid JWT header" });
  }
};

// Auth0 JWT validation middleware
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

// Apply algorithm validation before JWT check
app.use("/api", jwtAlgorithmValidator, jwtCheck);

// Fake account data
const accounts = [
  { id: "acct-001", name: "Checking Account", balance: 4250.75, currency: "USD" },
  { id: "acct-002", name: "Savings Account", balance: 18420.0, currency: "USD" },
  { id: "acct-003", name: "Credit Card", balance: -1230.5, currency: "USD" },
];

// Fake transaction data
const transactions = [
  { id: "txn-001", accountId: "acct-001", amount: -45.0, merchant: "Coffee House", date: "2026-04-01" },
  { id: "txn-002", accountId: "acct-001", amount: -120.0, merchant: "Grocery Mart", date: "2026-03-31" },
  { id: "txn-003", accountId: "acct-001", amount: 3200.0, merchant: "Direct Deposit", date: "2026-03-28" },
  { id: "txn-004", accountId: "acct-002", amount: 500.0, merchant: "Transfer In", date: "2026-03-25" },
];

// GET /api/accounts
app.get("/api/accounts", (req, res) => {
  res.json({ accounts });
});

// GET /api/transactions
app.get("/api/transactions", (req, res) => {
  const { accountId } = req.query;
  if (accountId) {
    return res.json({ transactions: transactions.filter((t) => t.accountId === accountId) });
  }
  res.json({ transactions });
});

// POST /api/payments
app.post("/api/payments", (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;
  if (!fromAccount || !toAccount || !amount) {
    return res.status(400).json({ error: "fromAccount, toAccount, and amount are required" });
  }
  const payment = {
    id: "pay-" + Date.now(),
    fromAccount,
    toAccount,
    amount,
    status: "completed",
    timestamp: new Date().toISOString(),
  };
  res.status(201).json({ payment });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Acme Bank API running on port ${PORT}`);
});