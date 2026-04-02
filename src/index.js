const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Fake account data
const accounts = [
  { id: 'acct-001', name: 'Checking Account', balance: 4250.75, currency: 'USD' },
  { id: 'acct-002', name: 'Savings Account', balance: 18420.00, currency: 'USD' },
  { id: 'acct-003', name: 'Credit Card', balance: -1230.50, currency: 'USD' }
];

// Fake transaction data
const transactions = [
  { id: 'txn-001', accountId: 'acct-001', amount: -45.00, merchant: 'Coffee House', date: '2026-04-01' },
  { id: 'txn-002', accountId: 'acct-001', amount: -120.00, merchant: 'Grocery Mart', date: '2026-03-31' },
  { id: 'txn-003', accountId: 'acct-001', amount: 3200.00, merchant: 'Direct Deposit', date: '2026-03-28' },
  { id: 'txn-004', accountId: 'acct-002', amount: 500.00, merchant: 'Transfer In', date: '2026-03-25' }
];

// GET /api/accounts
app.get('/api/accounts', (req, res) => {
  res.json({ accounts });
});

// GET /api/transactions
app.get('/api/transactions', (req, res) => {
  const { accountId } = req.query;
  if (accountId) {
    return res.json({ transactions: transactions.filter(t => t.accountId === accountId) });
  }
  res.json({ transactions });
});

// POST /api/payments
app.post('/api/payments', (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;
  if (!fromAccount || !toAccount || !amount) {
    return res.status(400).json({ error: 'fromAccount, toAccount, and amount are required' });
  }
  const payment = {
    id: 'pay-' + Date.now(),
    fromAccount,
    toAccount,
    amount,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
  res.status(201).json({ payment });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Acme Bank API running on port ${PORT}`);
});
