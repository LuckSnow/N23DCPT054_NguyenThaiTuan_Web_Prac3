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
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { products: parsed, cart: [] };
    }
    return {
      products: parsed.products || [],
      cart: parsed.cart || [],
    };
  } catch (err) {
    const defaultData = {
      products: [
        { id: 1, name: 'Áo thun basic Cotton', price: 150000 },
        { id: 2, name: 'Quần jeans slim-fit Indigo', price: 450000 },
        { id: 3, name: 'Áo sơ mi linen cổ trụ', price: 320000 },
        { id: 4, name: 'Áo khoác bomber thời trang', price: 590000 },
      ],
      cart: [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

// Helper ghi dữ liệu vào data.json (Nâng cao 3)
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==================== PRODUCTS API ====================

// GET: Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi đọc dữ liệu sản phẩm' });
  }
});

// POST: Thêm sản phẩm mới (Tiết 2)
app.post('/api/products', async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }

  try {
    const data = await readData();
    const newProduct = {
      id: Date.now(),
      name: String(name).trim(),
      price: Number(price),
    };
    data.products.push(newProduct);
    await writeData(data);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi lưu sản phẩm' });
  }
});

// PUT: Cập nhật thông tin sản phẩm (Nâng cao 1)
app.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, price } = req.body;

  try {
    const data = await readData();
    const index = data.products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    data.products[index] = {
      ...data.products[index],
      ...(name ? { name: String(name).trim() } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
    };

    await writeData(data);
    res.json(data.products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm' });
  }
});

// DELETE: Xoá sản phẩm (Tiết 4-5)
app.delete('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const data = await readData();
    const index = data.products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    data.products.splice(index, 1);
    // Đồng thời xoá khỏi giỏ hàng nếu có
    data.cart = data.cart.filter((c) => c.productId !== id);

    await writeData(data);
    res.json({ message: 'Đã xoá thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi xoá sản phẩm' });
  }
});

// ==================== CART API (Nâng cao 4) ====================

// GET: Lấy danh sách sản phẩm trong giỏ hàng + tổng tiền
app.get('/api/cart', async (req, res) => {
  try {
    const data = await readData();
    const items = data.cart.map((cartItem) => {
      const product = data.products.find((p) => p.id === cartItem.productId);
      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        name: product ? product.name : 'Sản phẩm không còn bán',
        price: product ? product.price : 0,
        subtotal: (product ? product.price : 0) * cartItem.quantity,
      };
    });

    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + item.subtotal, 0);

    res.json({
      items,
      totalQuantity,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi lấy giỏ hàng' });
  }
});

// POST: Thêm sản phẩm vào giỏ hàng { productId, quantity }
app.post('/api/cart', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const numProductId = Number(productId);
  const numQuantity = Math.max(1, Number(quantity) || 1);

  if (!productId) {
    return res.status(400).json({ error: 'Thiếu productId' });
  }

  try {
    const data = await readData();
    const product = data.products.find((p) => p.id === numProductId);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm để thêm vào giỏ' });
    }

    const cartIndex = data.cart.findIndex((c) => c.productId === numProductId);
    if (cartIndex > -1) {
      data.cart[cartIndex].quantity += numQuantity;
    } else {
      data.cart.push({
        productId: numProductId,
        quantity: numQuantity,
      });
    }

    await writeData(data);
    res.status(201).json({ message: 'Đã thêm vào giỏ hàng', cart: data.cart });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi thêm vào giỏ hàng' });
  }
});

// DELETE: Xoá sản phẩm khỏi giỏ hàng
app.delete('/api/cart/:productId', async (req, res) => {
  const productId = Number(req.params.productId);

  try {
    const data = await readData();
    const index = data.cart.findIndex((c) => c.productId === productId);

    if (index === -1) {
      return res.status(404).json({ error: 'Sản phẩm không có trong giỏ hàng' });
    }

    data.cart.splice(index, 1);
    await writeData(data);
    res.json({ message: 'Đã xoá khỏi giỏ hàng' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi xoá khỏi giỏ hàng' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend chạy tại port :${PORT}`);
});
