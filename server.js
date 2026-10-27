/**
 * Kopi Senja — Server Backend (Node.js + Express)
 * Fitur: menerima order dari web, menyimpan ke file data/orders.json,
 *            dan menyediakan API untuk lihat daftar pesanan (admin).
 *
 * Cara jalanin:
 *   1. npm install        (tepat saat pertama kali)
 *   2. npm start          (atau: node server.js)
 *   3. Buka http://localhost:3000
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Path ke folder data
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "orders.json");

// Buat folder data kalau belum ada
fs.mkdirSync(DATA_DIR, { recursive: true });

// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.static(__dirname));

// ---------- API: ambil semua pesanan ----------
app.get("/api/orders", (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      res.json(JSON.parse(raw));
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error("Gagal baca orders:", err);
    res.status(500).json({ error: "Gagal membaca data pesanan." });
  }
});

// ---------- API: simpan pesanan baru ----------
app.post("/api/orders", (req, res) => {
  try {
    const order = req.body;

    // Validasi minimal (harus ada field wajib)
    const required = ["name", "minuman", "price"];
    const missing = required.filter((f) => !order[f]);
    if (missing.length > 0) {
      return res
        .status(400)
        .json({ error: `Data incomplete: field(s) ${missing.join(", ")} diperlukan.` });
    }

    const orderRecord = {
      id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
      name: String(order.name).trim(),
      number: String(order.number || "").trim(),
      email: String(order.email || "").trim(),
      minuman: String(order.minuman).trim(),
      quantity: parseInt(order.quantity, 10) || 1,
      price: parseFloat(order.price),
      total: parseFloat(order.price) * (parseInt(order.quantity, 10) || 1),
      notes: String(order.notes || "").trim(),
      status: "waiting",
      tanggal: new Date().toISOString(),
    };

    let orders = [];
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) orders = parsed;
      } catch (e) {
        // file korup / kosong -> mulai dari nol
      }
    }

    orders.push(orderRecord);

    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");

    res
      .status(201)
      .json({ message: "Pesanan berhasil dikirim.", order: orderRecord });
  } catch (err) {
    console.error("Gagal simpan order:", err);
    res.status(500).json({ error: "Gagal menyimpan pesanan." });
  }
});

// ---------- Server ----------
app.listen(PORT, () => {
  console.log(`✅ Kopi Senja API berjalan di http://localhost:${PORT}`);
  console.log(`✅ API orders: http://localhost:${PORT}/api/orders`);
});
