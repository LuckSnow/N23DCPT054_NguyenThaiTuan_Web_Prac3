'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { getProductMeta } from './lib/productData';

export type Product = {
  id: number;
  name: string;
  price: number;
};

const categoryData = [
  {
    name: 'Thời trang',
    slug: 'fashion',
    items: '48 sản phẩm',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=720&q=80',
  },
  {
    name: 'Giày dép',
    slug: 'shoes',
    items: '24 sản phẩm',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=720&q=80',
  },
  {
    name: 'Túi xách',
    slug: 'bags',
    items: '18 sản phẩm',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=720&q=80',
  },
  {
    name: 'Phụ kiện',
    slug: 'accessories',
    items: '32 sản phẩm',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=720&q=80',
  },
];

const sampleImages = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=720&q=80',
];

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const [email, setEmail] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);

  // 1. Fetch danh sách sản phẩm (TanStack Query)
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/api/products');
      return res.data;
    },
  });

  // 2. Thêm vào giỏ hàng (Cart API)
  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => api.post('/api/cart', { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ hàng!', { icon: '🛍️' });
    },
    onError: () => {
      toast.error('Không thể thêm vào giỏ hàng!');
    },
  });

  // 3. Thêm sản phẩm mới (POST)
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
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra!');
    },
  });

  // 4. Sửa sản phẩm (PUT)
  const updateMutation = useMutation({
    mutationFn: ({ id, name, price }: { id: number; name: string; price: number }) =>
      api.put<Product>(`/api/products/${id}`, { name, price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      toast.success('Cập nhật sản phẩm thành công!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Cập nhật thất bại!');
    },
  });

  // 5. Xoá sản phẩm (DELETE)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xoá sản phẩm', { icon: '🗑️' });
    },
    onError: () => {
      toast.error('Xoá thất bại, vui lòng thử lại!');
    },
  });

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number(price) <= 0) {
      toast.error('Vui lòng điền tên và giá hợp lệ!');
      return;
    }
    createMutation.mutate({ name: name.trim(), price: Number(price) });
  };

  const handleUpdateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim() || Number(editPrice) <= 0) {
      toast.error('Vui lòng điền tên và giá hợp lệ!');
      return;
    }
    updateMutation.mutate({
      id: editingProduct.id,
      name: editName.trim(),
      price: Number(editPrice),
    });
  };

  const toggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((x) => x !== id));
      toast('Đã gỡ khỏi danh sách yêu thích', { icon: '♡' });
    } else {
      setWishlist([...wishlist, id]);
      toast.success('Đã thêm vào danh sách yêu thích!', { icon: '❤️' });
    }
  };

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }
    toast.success('Cảm ơn bạn đã đăng ký nhận bản tin từ MỘC Studio!', { icon: '✨' });
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      {/* 1. Header with Cart Badge */}
      <Navbar onSearch={(q) => setSearch(q)} />

      <main className="flex-grow">
        {/* 2. HERO SECTION */}
        <section className="hero-section-modern site-container">
          <div className="hero-grid">
            <div className="hero-content">
              <span className="hero-badge">BỘ SƯU TẬP MỚI · THU ĐÔNG 2026</span>
              <h1 className="hero-headline">
                Tìm Phong Cách Của Riêng Bạn
              </h1>
              <p className="hero-description">
                Khám phá những thiết kế tối giản, tinh tế được may từ chất liệu tự nhiên, mang lại sự êm dịu và tự tin trọn vẹn cho cuộc sống mỗi ngày.
              </p>
              <div className="hero-cta-group">
                <Link href="/products" className="btn-primary">
                  Mua sắm ngay →
                </Link>
                <a href="#products" className="btn-secondary">
                  Khám phá bộ sưu tập
                </a>
              </div>
            </div>

            <div className="hero-image-wrap">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
                alt="Bộ sưu tập MỘC Studio"
                width={1200}
                height={800}
                priority
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* 3. FEATURED CATEGORIES */}
        <section className="categories-section site-container" id="categories">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title">Mua sắm theo danh mục</h2>
              <p className="section-subtitle">Khám phá các dòng sản phẩm được yêu thích nhất.</p>
            </div>
          </div>

          <div className="categories-grid">
            {categoryData.map((cat) => (
              <Link href="/products" key={cat.slug} className="category-card">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={600}
                  height={400}
                  unoptimized
                />
                <div className="category-overlay">
                  <h3>{cat.name}</h3>
                  <span>{cat.items}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. FEATURED PRODUCTS (With Lab 3 Fullstack CRUD Integration) */}
        <section className="products-section-wrap site-container" id="products">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <p className="section-subtitle">Thiết kế được lựa chọn nhiều nhất trong tuần qua.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={() => setFormOpen(true)}
              >
                ＋ Thêm sản phẩm mới
              </button>
              <Link href="/products" className="section-action-link">
                Xem tất cả →
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-box-state">
              <p>Đang tải dữ liệu sản phẩm...</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="empty-box-state">
              <h3>{search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}</h3>
              <p>{search ? 'Vui lòng thử lại với từ khoá khác.' : 'Nhấn nút "Thêm sản phẩm mới" để bắt đầu.'}</p>
            </div>
          ) : (
            <div className="products-grid-4">
              {visibleProducts.map((product, idx) => {
                const meta = getProductMeta(product);
                const isFavorite = wishlist.includes(product.id);
                return (
                  <article
                    className="modern-product-card"
                    key={product.id}
                    onClick={() => router.push(`/products/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-img-box">
                      <Image
                        src={meta.mainImage}
                        alt={product.name}
                        width={600}
                        height={600}
                        unoptimized
                      />
                      {idx === 0 && <span className="product-badge-pill">BÁN CHẠY</span>}

                      <div className="card-top-actions">
                        <button
                          type="button"
                          className="icon-action-pill btn-wishlist"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          aria-label="Yêu thích"
                          title="Lưu vào yêu thích"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill={isFavorite ? '#E11D48' : 'none'} stroke={isFavorite ? '#E11D48' : 'currentColor'} strokeWidth="1.8">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="icon-action-pill btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProduct(product);
                            setEditName(product.name);
                            setEditPrice(String(product.price));
                          }}
                          aria-label="Sửa sản phẩm"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="icon-action-pill btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Bạn chắc chắn muốn xoá sản phẩm "${product.name}"?`)) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          aria-label="Xoá sản phẩm"
                          title="Xoá sản phẩm"
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="product-card-body">
                      <span className="product-card-cat">{meta.category.toUpperCase()}</span>
                      <div className="product-card-title">
                        {product.name}
                      </div>
                      <div className="product-price-row">
                        <span className="current-price">{Number(product.price).toLocaleString('vi-VN')}₫</span>
                        <span className="original-price">{Number(product.price * 1.25).toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="product-card-actions">
                        <button
                          type="button"
                          className="btn-card-add"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCartMutation.mutate(product.id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. PROMOTIONAL BANNER */}
        <section className="promo-banner-section site-container">
          <div className="promo-banner-card">
            <div className="promo-banner-content">
              <h2>Thiết kế tối giản, vẻ đẹp vượt thời gian</h2>
              <p>
                Sản phẩm tinh giản. Chất liệu bền vững được chọn lọc để gắn bó cùng bạn qua nhiều mùa thời trang.
              </p>
              <Link href="/products" className="btn-primary">
                Khám phá bộ sưu tập →
              </Link>
            </div>
            <div className="promo-banner-img">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
                alt="Quảng bá thương hiệu MỘC Studio"
                width={1000}
                height={600}
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* 6. WHY SHOP WITH US */}
        <section className="features-section site-container" id="about">
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2" />
                  <path d="M17 9h4l2 3v4h-6V9z" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
              </div>
              <h4>Miễn phí vận chuyển</h4>
              <p>Giao hàng miễn phí toàn quốc cho tất cả đơn hàng từ 500.000₫.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4>Thanh toán an toàn</h4>
              <p>Thông tin thanh toán và giao dịch được mã hóa và bảo vệ 100%.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </div>
              <h4>Đổi trả trong 30 ngày</h4>
              <p>Hỗ trợ đổi size hoặc trả hàng dễ dàng trong vòng 30 ngày kể từ khi nhận.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h4>Hỗ trợ tận tâm 24/7</h4>
              <p>Đội ngũ chuyên viên tư vấn của MỘC luôn sẵn sàng hỗ trợ bạn bất kỳ lúc nào.</p>
            </div>
          </div>
        </section>

        {/* 7. NEWSLETTER */}
        <section className="newsletter-section site-container">
          <div className="newsletter-box">
            <h2>Đăng ký nhận tin mới</h2>
            <p>
              Nhận thông báo về bộ sưu tập mới nhất, câu chuyện thiết kế và các đặc quyền ưu đãi dành riêng cho bạn.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn..."
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Đăng ký ngay
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <Footer />

      {/* MODAL THÊM SẢN PHẨM (Lab 3 Tiết 2) */}
      {formOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setFormOpen(false)} />
          <div className="modal-dialog-card">
            <div className="modal-header">
              <h3>Thêm sản phẩm mới</h3>
              <button type="button" className="modal-close-btn" onClick={() => setFormOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-form-group">
                <label>Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ví dụ: Áo thun cotton basic"
                  className="modal-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="modal-form-group">
                <label>Giá bán (₫)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  placeholder="Ví dụ: 180000"
                  className="modal-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>
                  Huỷ bỏ
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Đang lưu...' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* MODAL SỬA SẢN PHẨM (Lab 3 Nâng cao 1) */}
      {editingProduct && (
        <>
          <div className="modal-backdrop" onClick={() => setEditingProduct(null)} />
          <div className="modal-dialog-card">
            <div className="modal-header">
              <h3>Chỉnh sửa thông tin</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingProduct(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-form-group">
                <label>Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="modal-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="modal-form-group">
                <label>Giá bán (₫)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  className="modal-input"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingProduct(null)}>
                  Huỷ bỏ
                </button>
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
