# Orbit ERP

A simple, responsive ERP dashboard built with Express and React. It includes:

- Dashboard metrics and revenue chart
- Inventory catalog with stock status
- Add-product workflow backed by the Express API
- Employee directory
- Orders and invoice tracking

## Run locally

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

The React app runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

The sample data is held in memory for simplicity. Restarting the API resets changes.
