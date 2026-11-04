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
MONGODB_URI=mongodb://127.0.0.1:27017/orbit_erp npm run dev
```

The React app runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

The API persists products, employees, and invoices in MongoDB. If the collections are empty, the API seeds the sample records on first startup.

For MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string before starting the API:

```bash
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/orbit_erp" npm run server
```

Copy `.env.example` to `.env` if you prefer to keep the connection string in a local environment file.
