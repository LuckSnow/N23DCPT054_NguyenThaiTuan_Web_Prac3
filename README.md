# BÁO CÁO THỰC HÀNH LAB 3 — FULLSTACK INTEGRATION (NEXT.JS + EXPRESS)

## 1. Thông tin cá nhân

- **Họ và tên:** Nguyễn Thái Tuấn
- **Mã số sinh viên:** N23DCPT054
- **Lớp:** D23CQPTUD01-N
- **Học phần:** Lập Trình Web

---

## 2. Mô tả tổng quan dự án

Dự án là ứng dụng web thương mại điện tử hoàn chỉnh theo kiến trúc **Fullstack Decoupled**, tích hợp chặt chẽ giữa **Frontend Next.js (App Router, React 19, TypeScript)** và **Backend Express (Node.js)** theo đúng chuẩn yêu cầu bài thực hành **Lab 3: Fullstack Integration — NextJS + Express**.

### Các tính năng và công nghệ nổi bật:
- **Tiết 1 — Thiết lập môi trường & Xử lý CORS:**
  - Dựng server Express chạy độc lập tại cổng `5000` với middleware `cors` chỉ định origin `http://localhost:3000`.
  - Cấu hình proxy rewrite trong `next.config.ts` để định tuyến toàn bộ request `/api/:path*` từ Frontend sang Backend tự động, giúp giải quyết triệt để lỗi CORS khi chạy thực tế.
- **Tiết 2 — Kết nối Form & API Backend:**
  - Route `POST /api/products` xác thực dữ liệu đầu vào (`name`, `price`).
  - Cấu hình Axios instance tập trung tại `frontend/lib/api.ts` kết hợp form nhập liệu trực quan.
- **Tiết 3 — Thông báo tương tác (Toast Messages) & Debug:**
  - Tích hợp thư viện `react-hot-toast` với component `<Toaster />` đặt tại Root Layout.
  - Hiển thị thông báo phản hồi thời gian thực khi thêm, cập nhật, xoá thành công hoặc khi xảy ra sự cố mạng/lỗi hệ thống.
- **Tiết 4-5 — Xóa sản phẩm End-to-End:**
  - Route `DELETE /api/products/:id` xử lý xóa trên server và trả về status `404` nếu không tìm thấy.
  - Áp dụng kỹ thuật **Cập nhật lạc quan (Optimistic Update)** trên Frontend kết hợp hộp thoại xác nhận trước khi xoá và cơ chế tự động rollback nếu server phát sinh lỗi.
- **Nâng cao 1 — Cập nhật sản phẩm (PUT):**
  - Route `PUT /api/products/:id` cho phép cập nhật tên và đơn giá sản phẩm.
  - Giao diện cung cấp nút Sửa và modal chỉnh sửa trực tiếp, tự động điền thông tin hiện tại và đồng bộ sau khi lưu.
- **Nâng cao 2 — TanStack Query (React Query):**
  - Quản lý Server State, cơ chế Caching thông minh (`staleTime: 2 phút`), tự động refetch và tối ưu hóa vòng đời dữ liệu.
  - Sử dụng `useQuery` để tải danh mục sản phẩm / giỏ hàng và `useMutation` kết hợp `queryClient.invalidateQueries` để đồng bộ dữ liệu tức thì.
- **Nâng cao 3 — Lưu trữ dữ liệu bền vững (JSON Persistence):**
  - Thay thế việc lưu trữ tạm thời trong RAM bằng việc đọc/ghi trực tiếp vào tệp `backend/data.json` thông qua `fs.promises`. Dữ liệu sản phẩm và giỏ hàng không bị mất khi restart server.
- **Nâng cao 4 — Module Giỏ hàng (Cart) hoàn chỉnh:**
  - Backend cung cấp các endpoint: `POST /api/cart` (thêm vào giỏ), `GET /api/cart` (lấy danh sách sản phẩm, số lượng, tạm tính và tổng tiền), `DELETE /api/cart/:productId` (xoá khỏi giỏ).
  - Frontend hỗ trợ thêm nhanh sản phẩm vào giỏ, hiển thị huy hiệu (badge) số lượng món đồ trên icon giỏ hàng ở thanh điều hướng cập nhật thời gian thực.
  - Trang `/cart` thiết kế theo phong cách e-commerce hiện đại: bảng danh mục sản phẩm, tính toán phí vận chuyển (miễn phí từ 500.000₫), nút điều chỉnh số lượng, xoá từng mục và nút tiến hành đặt hàng.
- **Thiết kế giao diện (UI/UX):**
  - Phong cách thương mại điện tử hiện đại, tối giản, thanh lịch mang thương hiệu **MỘC Studio**.
  - Hiệu ứng chuyển động mượt mà (smooth micro-animations, glassmorphism modal, hover zoom trên ảnh sản phẩm, thẻ thông tin đánh giá sao).

---

## 3. Sơ đồ cấu trúc của dự án

```text
fullstack-shop/
├── backend/                                # Mã nguồn Backend Express
│   ├── data.json                           # Tệp lưu trữ dữ liệu JSON bền vững (Nâng cao 3)
│   ├── package.json                        # Khai báo dependencies của Express, CORS, Nodemon
│   ├── package-lock.json
│   └── server.js                           # Khởi tạo server, cấu hình CORS, CRUD products & cart
│
├── frontend/                               # Mã nguồn Frontend Next.js (App Router)
│   ├── app/
│   │   ├── cart/
│   │   │   └── page.tsx                    # Trang giỏ hàng /cart (Nâng cao 4)
│   │   ├── favicon.ico
│   │   ├── globals.css                     # Hệ thống định kiểu CSS phong cách E-commerce hiện đại
│   │   ├── layout.tsx                      # RootLayout tích hợp Toaster và QueryClientProvider
│   │   ├── page.tsx                        # Trang chủ: Hero banner, danh sách, tìm kiếm, CRUD
│   │   └── providers.tsx                   # TanStack Query Provider bọc toàn bộ ứng dụng
│   ├── lib/
│   │   └── api.ts                          # Cấu hình trung tâm Axios Client
│   ├── public/                             # Tài nguyên hình ảnh, biểu tượng tĩnh
│   ├── eslint.config.mjs
│   ├── next.config.ts                      # Cấu hình Next.js proxy rewrite (/api/:path* -> :5000)
│   ├── package.json                        # Khai báo dependencies Next.js, TanStack Query, Hot Toast
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
├── .gitignore                              # Quy tắc bỏ qua node_modules, build cache, logs
└── README.md                               # Tài liệu hướng dẫn và báo cáo dự án
```

---

## 4. Hướng dẫn cài đặt và khởi chạy code

### 4.1. Yêu cầu môi trường
- **Node.js:** Phiên bản `18.0.0` trở lên (Khuyến nghị `v20.x` hoặc `v22.x`).
- **NPM:** Đi kèm với Node.js.
- **Trình duyệt web:** Google Chrome, Microsoft Edge, Brave hoặc Firefox.

---

### 4.2. Cài đặt Dependencies

Trước khi khởi chạy, cần cài đặt các thư viện phụ thuộc cho cả hai phần `backend` và `frontend`.

Mở terminal tại thư mục gốc của dự án (`fullstack-shop`):

```bash
# 1. Cài đặt dependencies cho Backend
cd backend
npm install

# 2. Cài đặt dependencies cho Frontend
cd ../frontend
npm install
```

---

### 4.3. Khởi chạy dự án

Dự án gồm 2 tiến trình chạy độc lập song song. Bạn cần mở **2 cửa sổ Terminal riêng biệt**:

#### Terminal 1 — Khởi động Backend (Express API)
```bash
cd backend
npm run dev
# hoặc: npm start
```
- Server backend sẽ khởi chạy tại: **`http://localhost:5000`**
- Terminal sẽ hiển thị: `Backend chạy tại port :5000`

#### Terminal 2 — Khởi động Frontend (Next.js)
```bash
cd frontend
npm run dev
```
- Ứng dụng giao diện sẽ sẵn sàng tại: **`http://localhost:3000`**

Sau khi cả 2 server đã hoạt động, mở trình duyệt web và truy cập:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 4.4. Danh sách các API Endpoints (Backend Express :5000)

| Phương thức | Đường dẫn API | Chức năng | Payload mẫu / Ghi chú |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Lấy danh sách toàn bộ sản phẩm | Trả về mảng JSON các sản phẩm |
| **POST** | `/api/products` | Thêm sản phẩm mới vào kho | `{ "name": "Áo polo cổ bẻ", "price": 280000 }` |
| **PUT** | `/api/products/:id` | Cập nhật thông tin sản phẩm | `{ "name": "Áo thun basic v2", "price": 160000 }` |
| **DELETE** | `/api/products/:id` | Xoá sản phẩm khỏi kho & giỏ hàng | Xoá theo `id` (Param) |
| **GET** | `/api/cart` | Lấy danh sách giỏ hàng & tổng tiền | Trả về `{ items, totalQuantity, totalPrice }` |
| **POST** | `/api/cart` | Thêm sản phẩm vào giỏ hàng | `{ "productId": 1, "quantity": 1 }` |
| **DELETE** | `/api/cart/:productId` | Xoá một mục sản phẩm khỏi giỏ | Xoá theo `productId` (Param) |
