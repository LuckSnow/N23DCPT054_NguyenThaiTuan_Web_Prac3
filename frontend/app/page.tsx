'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type Product = {
  id: number;
  name: string;
  price: number;
};

type CartResponse = {
  items: Array<{ productId: number; quantity: number; subtotal: number }>;
  totalQuantity: number;
  totalPrice: number;
};

const imageOptions = [
  { src: 'photo-1521572163474-6864f9cf17ab', tone: 'sand', label: 'Áo thun' },
  { src: 'photo-1542272604-787c3835535d', tone: 'sky', label: 'Quần jeans' },
  { src: 'photo-1529139574466-a303027c1d8b', tone: 'rose', label: 'Thời trang' },
  { src: 'photo-1523381210434-271e8be1f52b', tone: 'olive', label: 'Trang phục' },
  { src: 'photo-1515886657613-9f3515b0c78f', tone: 'lilac', label: 'Phong cách' },
  { src: 'photo-1525507119028-ed4c629a60a3', tone: 'peach', label: 'Bộ sưu tập' },
];

function ProductIcon({ type }: { type: 'bag' | 'search' | 'arrow' | 'close' | 'edit' | 'cart' }) {
  if (type === 'bag' || type === 'cart') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 8h14l1 12H4L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </svg>
    );
  }
  if (type === 'search') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4.2 4.2" />
      </svg>
    );
  }
  if (type === 'close') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }
  if (type === 'edit') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4.5 12h14m-5.5-5.5L18.5 12 13 17.5" />
    </svg>
  );
}

export default function Home() {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Nâng cao 2: React Query - Fetch danh sách sản phẩm với useQuery
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/api/products');
      return res.data;
    },
  });

  // Nâng cao 4: Query giỏ hàng để cập nhật badge số lượng real-time
  const { data: cartData = { items: [], totalQuantity: 0, totalPrice: 0 } } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get<CartResponse>('/api/cart');
      return res.data;
    },
  });

  // Nâng cao 4: Thêm vào giỏ hàng
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: number; quantity?: number }) =>
      api.post('/api/cart', { productId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ hàng!', { icon: '🛍️' });
    },
    onError: () => {
      toast.error('Thêm vào giỏ hàng thất bại!');
    },
  });

  // Nâng cao 2: Mutation thêm sản phẩm
  const createMutation = useMutation({
    mutationFn: (newProd: { name: string; price: number }) => api.post<Product>('/api/products', newProd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setName('');
      setPrice('');
      setFormOpen(false);
      toast.success('Thêm sản phẩm thành công!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi thêm sản phẩm!';
      toast.error(msg);
    },
  });

  // Nâng cao 1 & 2: Mutation cập nhật sản phẩm (PUT)
  const updateMutation = useMutation({
    mutationFn: ({ id, name, price }: { id: number; name: string; price: number }) =>
      api.put<Product>(`/api/products/${id}`, { name, price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      toast.success('Cập nhật sản phẩm thành công!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Cập nhật thất bại!';
      toast.error(msg);
    },
  });

  // Tiết 4-5 & Nâng cao 2: Mutation xoá sản phẩm
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xoá sản phẩm', { icon: '🗑️' });
    },
    onError: () => {
      toast.error('Xoá thất bại, thử lại!');
    },
  });

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    if (!query) return products;
    return products.filter((product) => product.name.toLocaleLowerCase('vi').includes(query));
  }, [products, search]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const numericPrice = Number(price);

    if (!cleanName || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error('Vui lòng nhập tên và giá hợp lệ.');
      return;
    }

    createMutation.mutate({ name: cleanName, price: numericPrice });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá sản phẩm này?')) return;
    deleteMutation.mutate(id);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProduct) return;
    const cleanName = editName.trim();
    const numericPrice = Number(editPrice);

    if (!cleanName || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error('Vui lòng nhập tên và giá hợp lệ.');
      return;
    }

    updateMutation.mutate({
      id: editingProduct.id,
      name: cleanName,
      price: numericPrice,
    });
  };

  return (
    <main className="store-shell">
      <div className="announcement-bar">
        <span>Giao hàng miễn phí cho đơn từ 500.000₫</span>
        <span className="announcement-right">
          MỘC Studio · Thời trang thường ngày <span aria-hidden="true">✳</span>
        </span>
      </div>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="MỘC Studio — Trang chủ">
          <span className="brand-mark">m.</span>
          <span className="brand-name">
            MỘC <span>STUDIO</span>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <Link className="nav-active" href="/">Trang chủ</Link>
          <a href="#products">Sản phẩm</a>
          <a href="#story">Câu chuyện</a>
        </nav>
        <div className="header-actions">
          <label className="header-search">
            <ProductIcon type="search" />
            <input
              aria-label="Tìm sản phẩm"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Link className="cart-link" href="/cart" aria-label={`Giỏ hàng, ${cartData.totalQuantity} sản phẩm`}>
            <ProductIcon type="bag" />
            <span>Giỏ hàng</span>
            <b>{cartData.totalQuantity}</b>
          </Link>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-photo" role="img" aria-label="Bộ sưu tập thời trang MỘC Studio">
          <div className="hero-note">
            <span className="note-dot" /> Bộ sưu tập mới · Fullstack Next.js & Express
          </div>
          <div className="hero-caption">
            <span>CHẠM VÀO</span>
            <br />
            NHỮNG ĐIỀU
            <br />
            <i>giản đơn</i>
          </div>
          <div className="hero-bottom">
            <span>Trang phục cho những ngày rất bình thường.</span>
            <a href="#products">
              Khám phá bộ sưu tập <ProductIcon type="arrow" />
            </a>
          </div>
          <div className="hero-index">
            01 <span>/</span> 04
          </div>
        </div>
        <div className="hero-side">
          <span className="side-kicker">MỘC STUDIO — SINCE 2026</span>
          <span className="side-line" />
          <span className="side-vertical">ĐẸP THEO CÁCH CỦA BẠN</span>
          <span className="side-spark">✳</span>
        </div>
      </section>

      <section className="benefits" aria-label="Thông tin cửa hàng">
        <div>
          <span className="benefit-icon">✳</span>
          <span>
            <strong>Chất liệu chọn lọc</strong>
            <small>Êm dịu trên làn da</small>
          </span>
        </div>
        <div>
          <span className="benefit-icon">↗</span>
          <span>
            <strong>Giao hàng toàn quốc</strong>
            <small>Đồng giá chỉ từ 25K</small>
          </span>
        </div>
        <div>
          <span className="benefit-icon">♡</span>
          <span>
            <strong>Đổi trả dễ dàng</strong>
            <small>Trong vòng 7 ngày</small>
          </span>
        </div>
        <div>
          <span className="benefit-icon">♧</span>
          <span>
            <strong>Mặc đẹp mỗi ngày</strong>
            <small>Tự tin theo cách riêng</small>
          </span>
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ĐƯỢC YÊU THÍCH</span>
            <h1>Chọn món bạn <i>thương.</i></h1>
            <p>Những thiết kế thoải mái cho nhịp sống mỗi ngày.</p>
          </div>
          <button
            className="add-product-button"
            type="button"
            onClick={() => setFormOpen(true)}
          >
            Thêm sản phẩm <span>＋</span>
          </button>
        </div>

        {/* Modal Backdrop */}
        {(formOpen || Boolean(editingProduct)) && (
          <div
            className="modal-backdrop"
            onClick={() => {
              setFormOpen(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* Modal Thêm sản phẩm */}
        {formOpen && (
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-heading">
              <div>
                <span className="eyebrow">MỘC STUDIO</span>
                <h2>Thêm sản phẩm mới</h2>
              </div>
              <button
                className="close-form"
                type="button"
                aria-label="Đóng biểu mẫu"
                onClick={() => setFormOpen(false)}
              >
                <ProductIcon type="close" />
              </button>
            </div>
            <label>
              Tên sản phẩm
              <input
                autoFocus
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Áo thun cotton basic"
              />
            </label>
            <label>
              Giá bán (₫)
              <input
                required
                min="1"
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Ví dụ: 150000"
              />
            </label>
            <div className="form-actions">
              <button
                className="cancel-button"
                type="button"
                onClick={() => setFormOpen(false)}
              >
                Huỷ
              </button>
              <button
                className="submit-button"
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Lưu sản phẩm'}{' '}
                <ProductIcon type="arrow" />
              </button>
            </div>
          </form>
        )}

        {/* Modal Chỉnh sửa sản phẩm (Nâng cao 1) */}
        {editingProduct && (
          <form className="product-form" onSubmit={handleUpdate}>
            <div className="form-heading">
              <div>
                <span className="eyebrow">CHỈNH SỬA SẢN PHẨM</span>
                <h2>Cập nhật thông tin</h2>
              </div>
              <button
                className="close-form"
                type="button"
                aria-label="Đóng biểu mẫu"
                onClick={() => setEditingProduct(null)}
              >
                <ProductIcon type="close" />
              </button>
            </div>
            <label>
              Tên sản phẩm
              <input
                autoFocus
                required
                maxLength={80}
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="Tên sản phẩm..."
              />
            </label>
            <label>
              Giá bán (₫)
              <input
                required
                min="1"
                type="number"
                value={editPrice}
                onChange={(event) => setEditPrice(event.target.value)}
                placeholder="Giá sản phẩm..."
              />
            </label>
            <div className="form-actions">
              <button
                className="cancel-button"
                type="button"
                onClick={() => setEditingProduct(null)}
              >
                Huỷ
              </button>
              <button
                className="submit-button"
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}{' '}
                <ProductIcon type="arrow" />
              </button>
            </div>
          </form>
        )}

        <div className="product-grid" aria-live="polite">
          {isLoading ? (
            <div className="empty-state">
              <span className="loading-dot" />
              <p>Đang tải sản phẩm từ TanStack Query...</p>
            </div>
          ) : visibleProducts.length ? (
            visibleProducts.map((product, index) => {
              const image = imageOptions[index % imageOptions.length];
              return (
                <article className="product-card" key={product.id}>
                  <div className={`product-image image-${image.tone}`}>
                    <Image
                      src={`https://images.unsplash.com/${image.src}?auto=format&fit=crop&w=720&q=85`}
                      alt={product.name}
                      width={720}
                      height={880}
                      unoptimized
                    />
                    {index === 0 && <span className="product-tag">BÁN CHẠY</span>}
                    <div className="card-actions">
                      <button
                        className="action-btn edit-product"
                        type="button"
                        onClick={() => handleStartEdit(product)}
                        aria-label={`Sửa ${product.name}`}
                        title="Chỉnh sửa sản phẩm"
                      >
                        <ProductIcon type="edit" />
                      </button>
                      <button
                        className="action-btn delete-product"
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        aria-label={`Xoá ${product.name}`}
                        title="Xoá sản phẩm"
                      >
                        <ProductIcon type="close" />
                      </button>
                    </div>
                    {/* Nâng cao 4: Nút Thêm vào giỏ nhanh */}
                    <button
                      className="quick-add"
                      type="button"
                      onClick={() => addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
                      aria-label={`Thêm ${product.name} vào giỏ hàng`}
                      title="Thêm vào giỏ hàng"
                    >
                      ＋
                    </button>
                  </div>
                  <div className="product-details">
                    <div>
                      <span className="product-category">
                        {image.label} · MỘC STUDIO
                      </span>
                      <h2>{product.name}</h2>
                    </div>
                    <span className="product-price">
                      {Number(product.price).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="product-card-footer">
                    <div className="product-rating">
                      <span>★★★★★</span>
                      <small>4.9 <i>·</i> Mộc mạc, dễ mặc</small>
                    </div>
                    <button
                      className="add-to-cart-text-btn"
                      type="button"
                      onClick={() => addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
                    >
                      Thêm giỏ hàng
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-state">
              <span className="empty-icon">✳</span>
              <h2>{search ? 'Chưa tìm thấy sản phẩm' : 'Bộ sưu tập đang chờ bạn'}</h2>
              <p>
                {search
                  ? 'Thử tìm với một tên gọi khác nhé.'
                  : 'Thêm sản phẩm đầu tiên để bắt đầu bộ sưu tập.'}
              </p>
            </div>
          )}
        </div>
        <div className="section-footer">
          <span>ĐANG CÓ {products.length} THIẾT KẾ</span>
          <a href="#products">
            Xem tất cả <ProductIcon type="arrow" />
          </a>
        </div>
      </section>

      <section className="story-band" id="story">
        <span className="story-flower">✳</span>
        <p>
          Mặc đẹp không cần dịp.<br />
          <i>Chỉ cần là chính mình.</i>
        </p>
        <a href="#products">
          Tìm phong cách của bạn <ProductIcon type="arrow" />
        </a>
        <span className="story-stamp">
          MỘC<br />
          <small>STUDIO · 2026</small>
        </span>
      </section>

      <footer className="site-footer">
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark">m.</span>
          <span className="brand-name">
            MỘC <span>STUDIO</span>
          </span>
        </Link>
        <span>Thời trang thường ngày, chọn lọc bằng cả sự dịu dàng.</span>
        <span>© 2026 MỘC STUDIO</span>
      </footer>
    </main>
  );
}
