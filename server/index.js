const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/orbit_erp";

app.use(cors());
app.use(express.json());

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, required: true }
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  initials: String,
  name: String,
  role: String,
  department: String,
  status: String
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: String,
  date: String,
  amount: Number,
  status: String
});

const Product = mongoose.model("Product", productSchema);
const Employee = mongoose.model("Employee", employeeSchema);
const Invoice = mongoose.model("Invoice", invoiceSchema);

const seedProducts = [
  { sku: "SKU-1001", name: "Wireless Headphones", category: "Electronics", stock: 42, price: 89.99, status: "In stock" },
  { sku: "SKU-1002", name: "Ergonomic Chair", category: "Furniture", stock: 8, price: 249, status: "Low stock" },
  { sku: "SKU-1003", name: "Standing Desk", category: "Furniture", stock: 0, price: 449, status: "Out of stock" },
  { sku: "SKU-1004", name: "USB-C Dock", category: "Electronics", stock: 27, price: 129.5, status: "In stock" },
  { sku: "SKU-1005", name: "Monitor Light Bar", category: "Accessories", stock: 15, price: 64.99, status: "In stock" }
];

const seedEmployees = [
  { initials: "AK", name: "Amara Khan", role: "Operations Manager", department: "Operations", status: "Active" },
  { initials: "JS", name: "James Smith", role: "Sales Executive", department: "Sales", status: "Active" },
  { initials: "ML", name: "Maya Lee", role: "Finance Analyst", department: "Finance", status: "Active" },
  { initials: "DR", name: "Daniel Ruiz", role: "Warehouse Lead", department: "Operations", status: "On leave" }
];

const seedInvoices = [
  { invoiceNumber: "INV-1048", customer: "Northstar Labs", date: "2024-06-18", amount: 2480, status: "Paid" },
  { invoiceNumber: "INV-1047", customer: "Brightline Co.", date: "2024-06-17", amount: 1260.5, status: "Pending" },
  { invoiceNumber: "INV-1046", customer: "Apex Retail", date: "2024-06-15", amount: 3890, status: "Paid" },
  { invoiceNumber: "INV-1045", customer: "Greenfield Studio", date: "2024-06-12", amount: 920.25, status: "Overdue" }
];

function withId(document) {
  const value = document.toObject();
  return { ...value, id: value._id.toString(), _id: undefined };
}

async function seedDatabase() {
  if (await Product.countDocuments() === 0) await Product.insertMany(seedProducts);
  if (await Employee.countDocuments() === 0) await Employee.insertMany(seedEmployees);
  if (await Invoice.countDocuments() === 0) await Invoice.insertMany(seedInvoices);
}

app.get("/api/health", (_req, res) => res.json({
  status: "ok",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
}));

app.get("/api/dashboard", async (_req, res, next) => {
  try {
    const lowStock = await Product.countDocuments({ stock: { $lt: 10 } });
    res.json({
      revenue: 124680, revenueChange: 12.5, orders: 348, ordersChange: 8.2,
      customers: 1248, customersChange: 5.7, lowStock,
      revenueByMonth: [62, 70, 66, 78, 92, 85, 104, 96, 112, 121, 108, 124]
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (_req, res, next) => {
  try {
    res.json((await Product.find().sort({ createdAt: 1 })).map(withId));
  } catch (error) {
    next(error);
  }
});

app.get("/api/employees", async (_req, res, next) => {
  try {
    res.json((await Employee.find().sort({ name: 1 })).map(withId));
  } catch (error) {
    next(error);
  }
});

app.get("/api/invoices", async (_req, res, next) => {
  try {
    res.json((await Invoice.find().sort({ date: -1 })).map((invoice) => ({
      ...withId(invoice),
      id: invoice.invoiceNumber
    })));
  } catch (error) {
    next(error);
  }
});

app.post("/api/products", async (req, res, next) => {
  const { sku, name, category, stock, price } = req.body;
  if (!sku || !name || !category || Number.isNaN(Number(stock)) || Number.isNaN(Number(price))) {
    return res.status(400).json({ error: "sku, name, category, stock, and price are required" });
  }
  try {
    const numericStock = Number(stock);
    const product = await Product.create({
      sku, name, category, stock: numericStock, price: Number(price),
      status: numericStock === 0 ? "Out of stock" : numericStock < 10 ? "Low stock" : "In stock"
    });
    return res.status(201).json(withId(product));
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "A product with this SKU already exists" });
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected server error occurred" });
});

async function start() {
  await mongoose.connect(mongoUri);
  await seedDatabase();
  app.listen(port, () => console.log(`ERP API listening on http://localhost:${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`MongoDB connection failed for ${mongoUri}`);
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
