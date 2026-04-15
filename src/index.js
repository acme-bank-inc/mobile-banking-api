require("dotenv").config();

const express = require("express");
const { auth } = require("express-oauth2-jwt-bearer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Security: Explicitly reject JWT tokens with "none" algorithm
// This is a defense-in-depth measure against algorithm confusion attacks
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const header = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString());
      if (header.alg === "none" || !header.alg) {
        return res.status(401).json({
          error: "invalid_token",
          error_description: "Algorithm \"none\" is not allowed"
        });
      }
    } catch (e) {
      // Token parsing failed, let the JWT middleware handle it
    }
  }
  next();
});

// Auth0 JWT validation middleware with explicit algorithm enforcement
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

// Protect all /api routes with JWT validation
app.use("/api", jwtCheck);

// ... rest of the original code remains unchanged
const accounts = [
  { id: "acct-001", name: "Checking Account", balance: 4250.75, currency: "USD" },
  { id: "acct-002", name: "Savings Account", balance: 18420.0, currency: "USD" },
  { id: "acct-003", name: "Credit Card", balance: -1230.5, currency: "USD" },
];

const transactions = [
  { id: "txn-001", accountId: "acct-001", amount: -45.0, merchant: "Coffee House", date: "2026-04-01" },
  { id: "txn-002", accountId: "acct-001", amount: -120.0, merchant: "Grocery Mart", date: "2026-03-31" },
  { id: "txn-003", accountId: "acct-001", amount: 3200.0, merchant: "Direct Deposit", date: "2026-03-28" },
  { id: "txn-004", accountId: "acct-002", amount: 500.0, merchant: "Transfer In", date: "2026-03-25" },
];

app.get("/api/accounts", (req, res) => {
  res.json({ accounts });
});

app.get("/api/transactions", (req, res) => {
  const { accountId } = req.query;
  if (accountId) {
    return res.json({ transactions: transactions.filter((t) => t.accountId === accountId) });
  }
  res.json({ transactions });
});

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

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Acme Bank API running on port ${PORT}`);
});