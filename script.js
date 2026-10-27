(function () {
  "use strict";

  const API_URL = "http://localhost:3000/api/orders"; // URL backend
const PRICES = {
  Espresso: 15000,
  Americano: 18000,
  Cappuccino: 20000,
  Latte: 21000,
  Mocha: 22000,
  "Matcha Latte": 20000,
};

// ---------- 2. Harga otomatis saat pilih minuman ----------
const minumanSelect = document.getElementById("minuman");
const priceInput = document.getElementById("price");

if (minumanSelect && priceInput) {
  function updatePrice() {
    const value = PRICES[minumanSelect.value] || 0;
    priceInput.value = "Rp " + value.toLocaleString("id-ID");
  }
  minumanSelect.addEventListener("change", updatePrice);
  updatePrice();
}

// ---------- 3. Kirim form order via API ----------
const orderForm = document.getElementById("orderForm");
const formStatus = document.getElementById("formStatus");

if (orderForm) {
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    formStatus.textContent = "";
    formStatus.className = "order-form__status";

    const formData = new FormData(orderForm);
    const payload = {
      name: formData.get("name"),
      number: formData.get("number"),
      email: formData.get("email") || "",
      minuman: formData.get("minuman"),
      quantity: parseInt(formData.get("quantity"), 10) || 1,
      price: parseInt(formData.get("price"), 10) || 0,
      notes: formData.get("notes") || "",
    };

    if (!payload.name || !payload.number || !payload.minuman) {
      showStatus("Mohon isi nama, WhatsApp, dan pilih minuman.", "error");
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (err) {
            throw new Error(err.error || "Gagal mengirim pesanan.");
          });
        }
        return res.json();
      })
      .then(function (data) {
        showStatus("✅ Pesanan terkirim! ID: " + data.order.id, "success");
        orderForm.reset();
        updatePrice();
      })
      .catch(function (err) {
        showStatus("❌ " + err.message, "error");
      });
  });
}

// ---------- 4. Tombol pesan WhatsApp (menu lama) ----------
const orderButtons = document.querySelectorAll(".menu__order");

orderButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const name = btn.dataset.name || "Kopi";
    const price = btn.dataset.price || "0";
    const text =
      "Halo Kopi Senja, saya ingin memesan:\n\n" +
      `Nama: ${name}\n` +
      `Jumlah: 1\n` +
      `Harga: Rp ${Number(price).toLocaleString("id-ID")}\n` +
      "Mohon info ketersediaan dan waktu pengiriman.";

    const url =
      "https://wa.me/6281234567890?text=" + encodeURIComponent(text);

    window.open(url, "_blank", "noopener,noreferrer");
  });
});

// ---------- 5. Tombol "Kunjungi Kedai" → scroll halus ----------
const visitBtn = document.querySelector(".btn__outline");
if (visitBtn) {
  visitBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const kontakSection = document.querySelector("#kontak");
    if (kontakSection) {
      kontakSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function showStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className =
    "order-form__status" +
    (type === "success" ? " order-form__status--success" : type === "error" ? " order-form__status--error" : "");
}
})();