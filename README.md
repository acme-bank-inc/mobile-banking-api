# Mobile Banking API

A minimal REST API backend for Acme Bank Inc mobile banking. This is a test application used for ETM ASMP testing and returns hardcoded sample data.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/accounts | List all bank accounts |
| GET | /api/transactions | List transactions (optional query: accountId) |
| POST | /api/payments | Submit a payment (body: fromAccount, toAccount, amount) |
| GET | /health | Health check |

## Getting Started

Prerequisites: Node.js 18 or later.

```bash
make install
make start
```

The server starts on port 3000 by default. Set the PORT environment variable to override.

## Development

```bash
make dev
```

This uses Node.js watch mode to restart on file changes.

## Makefile Targets

| Target | Description |
|--------|-------------|
| install | Install npm dependencies |
| start | Run the server |
| dev | Run the server with auto restart on changes |
| clean | Remove node_modules |
