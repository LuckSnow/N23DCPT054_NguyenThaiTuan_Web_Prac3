# LAB 3 — Quản lý sản phẩm với Next.js và Express

## Thông tin cá nhân

- Họ và tên: Nguyễn Thái Tuấn
- Mã Số sinh viên: N23DCPT054
- Lớp: D23CQPTUD01-N

## Mô tả tổng quan dự án

Dự án thực hành tích hợp giao diện Next.js với API Express để quản lý danh sách sản phẩm. Backend cung cấp các API lấy danh sách, thêm và xoá sản phẩm. Frontend sử dụng Axios gọi API qua rewrite proxy của Next.js, hiển thị phản hồi bằng toast và cập nhật danh sách ngay sau khi xoá.

Giao diện được trình bày theo phong cách cửa hàng thời trang hiện đại, co giãn theo kích thước màn hình. Dữ liệu sản phẩm hiện được lưu trong bộ nhớ của backend và sẽ trở về dữ liệu mẫu khi khởi động lại server.

## Sơ đồ cấu trúc của dự án

```text
fullstack-shop/
├── backend/
│   ├── server.js          # Express API: GET, POST, DELETE /api/products
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── app/
│   │   ├── globals.css    # Giao diện cửa hàng responsive
│   │   ├── layout.tsx     # Root layout, metadata, toast
│   │   └── page.tsx       # Danh sách, tìm kiếm, thêm và xoá sản phẩm
│   ├── lib/
│   │   └── api.ts         # Axios client
│   ├── next.config.ts     # Proxy /api sang Express
│   └── package.json
├── Lab3.pdf
└── README.md
```

## Hướng dẫn cài đặt và khởi chạy code

### Yêu cầu

- Node.js 18 trở lên và npm.
- Cài dependencies một lần cho từng ứng dụng:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Khởi chạy backend

Mở terminal thứ nhất tại thư mục gốc:

```bash
cd backend
npm run dev
```

Express chạy tại `http://localhost:5000`.

### Khởi chạy frontend

Mở terminal thứ hai tại thư mục gốc:

```bash
cd frontend
npm run dev
```

Mở `http://localhost:3000` trong trình duyệt. Next.js chuyển tiếp các request `/api/*` đến backend ở cổng 5000.

### API trong bài thực hành

- `GET /api/products`: lấy danh sách sản phẩm.
- `POST /api/products`: thêm sản phẩm với `{ "name": "Áo thun basic", "price": 150000 }`.
- `DELETE /api/products/:id`: xoá sản phẩm theo mã.
