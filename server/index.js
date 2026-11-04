const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const products = [
  { id: 1, sku: "SKU-1001", name: "Wireless Headphones", category: "Electronics", stock: 42, price: 89.99, status: "In stock" },
  { id: 2, sku: "SKU-1002", name: "Ergonomic Chair", category: "Furniture", stock: 8, price: 249.0, status: "Low stock" },
  { id: 3, sku: "SKU-1003", name: "Standing Desk", category: "Furniture", stock: 0, price: 449.0, status: "Out of stock" },
  { id: 4, sku: "SKU-1004", name: "USB-C Dock", category: "Electronics", stock: 27, price: 129.5, status: "In stock" },
  { id: 5, sku: "SKU-1005", name: "Monitor Light Bar", category: "Accessories", stock: 15, price: 64.99, status: "In stock" }
];

const employees = [
  { id: 1, initials: "AK", name: "Amara Khan", role: "Operations Manager", department: "Operations", status: "Active" },
  { id: 2, initials: "JS", name: "James Smith", role: "Sales Executive", department: "Sales", status: "Active" },
  { id: 3, initials: "ML", name: "Maya Lee", role: "Finance Analyst", department: "Finance", status: "Active" },
  { id: 4, initials: "DR", name: "Daniel Ruiz", role: "Warehouse Lead", department: "Operations", status: "On leave" }
];

const invoices = [
  { id: "INV-1048", customer: "Northstar Labs", date: "2024-06-18", amount: 2480.0, status: "Paid" },
  { id: "INV-1047", customer: "Brightline Co.", date: "2024-06-17", amount: 1260.5, status: "Pending" },
  { id: "INV-1046", customer: "Apex Retail", date: "2024-06-15", amount: 3890.0, status: "Paid" },
  { id: "INV-1045", customer: "Greenfield Studio", date: "2024-06-12", amount: 920.25, status: "Overdue" }
];

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/dashboard", (_req, res) => {
  res.json({
    revenue: 124680,
    revenueChange: 12.5,
    orders: 348,
    ordersChange: 8.2,
    customers: 1248,
    customersChange: 5.7,
    lowStock: products.filter((product) => product.stock < 10).length,
    revenueByMonth: [62, 70, 66, 78, 92, 85, 104, 96, 112, 121, 108, 124]
  });
});

app.get("/api/products", (_req, res) => res.json(products));
app.get("/api/employees", (_req, res) => res.json(employees));
app.get("/api/invoices", (_req, res) => res.json(invoices));

app.post("/api/products", (req, res) => {
  const { sku, name, category, stock, price } = req.body;
  if (!sku || !name || !category || Number.isNaN(Number(stock)) || Number.isNaN(Number(price))) {
    return res.status(400).json({ error: "sku, name, category, stock, and price are required" });
  }
  const product = {
    id: products.length + 1,
    sku,
    name,
    category,
    stock: Number(stock),
    price: Number(price),
    status: Number(stock) === 0 ? "Out of stock" : Number(stock) < 10 ? "Low stock" : "In stock"
  };
  products.push(product);
  return res.status(201).json(product);
});

app.listen(port, () => {
  console.log(`ERP API listening on http://localhost:${port}`);
});
