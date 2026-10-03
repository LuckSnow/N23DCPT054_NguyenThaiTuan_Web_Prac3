const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Helper đọc dữ liệu từ data.json (Nâng cao 3)
async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    const defaultData = [
      { id: 1, name: 'Áo thun basic Cotton', price: 150000 },
      { id: 2, name: 'Quần jeans slim-fit Indigo', price: 450000 },
      { id: 3, name: 'Áo sơ mi linen cổ trụ', price: 320000 },
      { id: 4, name: 'Áo khoác bomber thời trang', price: 590000 },
    ];
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

// Helper ghi dữ liệu vào data.json (Nâng cao 3)
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET: Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const products = await readData();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi đọc dữ liệu' });
  }
});

// POST: Thêm sản phẩm mới
app.post('/api/products', async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }

  try {
    const products = await readData();
    const newProduct = {
      id: Date.now(),
      name: String(name).trim(),
      price: Number(price),
    };
    products.push(newProduct);
    await writeData(products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi lưu dữ liệu' });
  }
});

// PUT: Cập nhật thông tin sản phẩm (Nâng cao 1)
app.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, price } = req.body;

  try {
    const products = await readData();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    products[index] = {
      ...products[index],
      ...(name ? { name: String(name).trim() } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
    };

    await writeData(products);
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm' });
  }
});

// DELETE: Xoá sản phẩm
app.delete('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const products = await readData();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    products.splice(index, 1);
    await writeData(products);
    res.json({ message: 'Đã xoá thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi xoá sản phẩm' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend chạy tại port :${PORT}`);
});
