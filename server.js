const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // เปิดใช้ index.html, admin.html ได้ตรงๆ

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');

// สร้างโฟลเดอร์และไฟล์เก็บข้อมูล ถ้ายังไม่มี
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');

function readBookings() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeBookings(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// บันทึกข้อมูลจอง (จากฟอร์มในหน้าเว็บ)
app.post('/api/bookings', (req, res) => {
  const { name, phone, car, date, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທ' });
  }

  const bookings = readBookings();
  const newBooking = {
    id: Date.now(),
    name,
    phone,
    car: car || '-',
    date: date || '-',
    message: message || '-',
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking); // อันใหม่ขึ้นบนสุด
  writeBookings(bookings);

  res.json({ success: true, booking: newBooking });
});

// ดึงรายการจองทั้งหมด (ใช้ในหน้า admin)
app.get('/api/bookings', (req, res) => {
  res.json(readBookings());
});

// ลบรายการจอง
app.delete('/api/bookings/:id', (req, res) => {
  const id = Number(req.params.id);
  const bookings = readBookings().filter(b => b.id !== id);
  writeBookings(bookings);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server ກຳລັງເຮັດວຽກຢູ່ http://localhost:${PORT}`);
});