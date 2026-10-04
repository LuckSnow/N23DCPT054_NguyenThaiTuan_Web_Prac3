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
  category?: string;
  images?: string[];
  description?: string;
  colors?: string[];
  sizes?: string[];
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

const ITEMS_PER_PAGE = 4; // 4 sản phẩm mỗi trang như ảnh 4

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Create state
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Thời trang');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Modal Edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('Thời trang');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [email, setEmail] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Helper tải ảnh từ máy tính chuyển đổi sang Base64 Data URL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawData = event.target?.result as string;
      const img = document.createElement('img');
      img.onload = () => {
        try {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          const optimized = canvas.toDataURL('image/jpeg', 0.88);
          setter(optimized);
          toast.success('Đã tải ảnh từ máy thành công!', { icon: '🖼️' });
        } catch {
          setter(rawData);
          toast.success('Đã tải ảnh từ máy thành công!', { icon: '🖼️' });
        }
      };
      img.onerror = () => {
        setter(rawData);
        toast.success('Đã tải ảnh từ máy thành công!', { icon: '🖼️' });
      };
      img.src = rawData;
    };
    reader.onerror = () => {
      toast.error('Không thể đọc file ảnh từ thiết bị!');
    };
    reader.readAsDataURL(file);
  };

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
    mutationFn: (newProd: { name: string; price: number; category: string; image?: string; description?: string }) =>
      api.post<Product>('/api/products', newProd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setName('');
      setPrice('');
      setImageUrl('');
      setDescription('');
      setCategory('Thời trang');
      setFormOpen(false);
      toast.success('Thêm sản phẩm thành công!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.message || 'Thêm sản phẩm thất bại!';
      toast.error(`Lỗi: ${msg}`);
    },
  });

  // 4. Sửa sản phẩm (PUT)
  const updateMutation = useMutation({
    mutationFn: ({ id, name, price, category, image, description }: { id: number; name: string; price: number; category: string; image?: string; description?: string }) =>
      api.put<Product>(`/api/products/${id}`, { name, price, category, image, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      toast.success('Cập nhật sản phẩm thành công!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.message || 'Cập nhật thất bại!';
      toast.error(`Lỗi: ${msg}`);
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

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') {
      list = list.filter((p) => {
        const meta = getProductMeta(p);
        return meta.category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }
    return list;
  }, [products, search, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number(price) <= 0) {
      toast.error('Vui lòng điền đúng thông tin sản phẩm!');
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      price: Number(price),
      category,
      image: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  const handleOpenEdit = (prod: Product) => {
    const meta = getProductMeta(prod);
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(String(prod.price));
    setEditCategory(meta.category);
    setEditImageUrl(meta.mainImage);
    setEditDescription(meta.description);
  };

  const handleUpdateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim() || Number(editPrice) <= 0) {
      toast.error('Vui lòng điền đúng thông tin sản phẩm!');
      return;
    }
    updateMutation.mutate({
      id: editingProduct.id,
      name: editName.trim(),
      price: Number(editPrice),
      category: editCategory,
      image: editImageUrl.trim() || undefined,
      description: editDescription.trim() || undefined,
    });
  };

  const toggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((x) => x !== id));
      toast('Đã gỡ khỏi yêu thích', { icon: '♡' });
    } else {
      setWishlist([...wishlist, id]);
      toast.success('Đã lưu vào yêu thích!', { icon: '❤️' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar onSearch={(query) => { setSearch(query); setCurrentPage(1); }} />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="hero-section-modern site-container">
          <div className="hero-grid">
            <div className="hero-content">
              <span className="hero-badge">BỘ SƯU TẬP MỚI 2026</span>
              <h1 className="hero-headline">
                Vẻ đẹp tinh giản cho nhịp sống thường nhật.
              </h1>
              <p className="hero-subtext">
                Khám phá những thiết kế chỉn chu với đường nét thanh lịch và chất liệu tự nhiên, mang lại sự tự tin trọn vẹn mỗi ngày.
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

        {/* 3. FEATURED CATEGORIES (Click to filter products) */}
        <section className="categories-section site-container" id="categories">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title">Mua sắm theo danh mục</h2>
              <p className="section-subtitle">Khám phá các dòng sản phẩm được yêu thích nhất.</p>
            </div>
          </div>

          <div className="categories-grid">
            {categoryData.map((cat) => (
              <div
                key={cat.slug}
                className="category-card"
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setCurrentPage(1);
                  const prodSection = document.getElementById('products');
                  if (prodSection) prodSection.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ cursor: 'pointer' }}
              >
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
              </div>
            ))}
          </div>
        </section>

        {/* 4. FEATURED PRODUCTS (With Lab 3 CRUD & Pagination) */}
        <section className="products-section-wrap site-container" id="products">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <p className="section-subtitle">Thiết kế được lựa chọn nhiều nhất trong tuần qua.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setFormOpen(true)}
              >
                ＋ Thêm sản phẩm mới
              </button>
            </div>
          </div>

          {/* Category Filter Tags (Ảnh 2: Thiết kế dạng pill hiện đại, khoảng cách thoáng đãng, không bị dính và thô sơ) */}
          <div className="featured-cat-tags-row">
            {[
              { id: 'all', label: 'Tất cả danh mục' },
              { id: 'Thời trang', label: 'Thời trang' },
              { id: 'Giày dép', label: 'Giày dép' },
              { id: 'Túi xách', label: 'Túi xách' },
              { id: 'Phụ kiện', label: 'Phụ kiện' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`featured-cat-tag-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="empty-box-state">
              <p>Đang tải dữ liệu sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-box-state">
              <h3>{search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}</h3>
              <p>{search ? 'Vui lòng thử lại với từ khoá khác.' : 'Nhấn nút "Thêm sản phẩm mới" để bắt đầu.'}</p>
            </div>
          ) : (
            <>
              <div className="products-grid-4">
                {paginatedProducts.map((product, idx) => {
                  const meta = getProductMeta(product);
                  const isFavorite = wishlist.includes(product.id);
                  return (
                    <article
                      className="modern-product-card"
                      key={product.id}
                      onClick={() => router.push(`/products/${product.id}`)}
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
                              handleOpenEdit(product);
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
                        <div className="product-card-title">{product.name}</div>
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

              {/* PAGINATION NAVIGATION BUTTONS (Image 4) */}
              {totalPages > 1 && (
                <div className="pagination-row">
                  <button
                    type="button"
                    className="page-num-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Trang trước"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      className={`page-num-btn ${currentPage === pg ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pg)}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="page-num-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Trang sau"
                  >
                    →
                  </button>
                </div>
              )}
            </>
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
              <p>Hỗ trợ COD và thanh toán chuyển khoản bảo mật 100%.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </div>
              <h4>Đổi trả 7 ngày</h4>
              <p>Đổi size hoặc đổi mẫu nhanh chóng, thuận tiện và chu đáo.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h4>Chất lượng đảm bảo</h4>
              <p>Chất liệu cao cấp được tuyển chọn kỹ lưỡng theo thời gian.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* MODAL THÊM SẢN PHẨM (Có ô thêm ảnh sản phẩm + danh mục + mô tả) */}
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
                <label>Tên sản phẩm *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="modal-form-group">
                  <label>Giá bán (₫) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="180000"
                    className="modal-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Danh mục *</label>
                  <select
                    className="modal-input cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Thời trang">Thời trang</option>
                    <option value="Giày dép">Giày dép</option>
                    <option value="Túi xách">Túi xách</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>
              </div>

              {/* Ô THÊM ẢNH TỪ MÁY TÍNH */}
              <div className="modal-form-group">
                <label>Ảnh sản phẩm (Tải lên từ máy)</label>
                <label className="modal-file-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, setImageUrl)}
                  />
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6B6B6B" strokeWidth="1.6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-xs font-semibold text-[#171717]">
                    Nhấn để chọn ảnh từ máy tính
                  </span>
                  <span className="text-[11px] text-[#8C8C8C]">
                    Hỗ trợ định dạng PNG, JPG, JPEG, WEBP
                  </span>
                </label>

                {imageUrl ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="modal-file-preview-wrap">
                      <Image
                        src={imageUrl}
                        alt="Ảnh xem trước"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        className="modal-file-remove-btn"
                        onClick={() => setImageUrl('')}
                        title="Xoá ảnh này"
                      >
                        ✕
                      </button>
                    </div>
                    <div>
                      <span className="text-xs text-[#10B981] font-semibold block">✓ Đã tải ảnh từ máy tính</span>
                      <span className="text-[11px] text-[#6B6B6B]">Ảnh đã sẵn sàng để lưu cùng sản phẩm</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <input
                      type="url"
                      placeholder="Hoặc dán link ảnh trực tiếp (nếu có)..."
                      className="modal-input text-xs"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="modal-form-group">
                <label>Mô tả ngắn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả chất liệu, phom dáng..."
                  className="modal-input resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

      {/* MODAL SỬA SẢN PHẨM (Có ô sửa ảnh sản phẩm + danh mục + mô tả) */}
      {editingProduct && (
        <>
          <div className="modal-backdrop" onClick={() => setEditingProduct(null)} />
          <div className="modal-dialog-card">
            <div className="modal-header">
              <h3>Chỉnh sửa sản phẩm</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingProduct(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="modal-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="modal-form-group">
                  <label>Giá bán (₫) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    className="modal-input"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Danh mục *</label>
                  <select
                    className="modal-input cursor-pointer"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="Thời trang">Thời trang</option>
                    <option value="Giày dép">Giày dép</option>
                    <option value="Túi xách">Túi xách</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>
              </div>

              {/* Ô CHỈNH SỬA ẢNH SẢN PHẨM TỪ MÁY */}
              <div className="modal-form-group">
                <label>Ảnh sản phẩm (Tải lên từ máy)</label>
                <label className="modal-file-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, setEditImageUrl)}
                  />
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6B6B6B" strokeWidth="1.6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-xs font-semibold text-[#171717]">
                    Nhấn để chọn ảnh mới từ máy tính
                  </span>
                  <span className="text-[11px] text-[#8C8C8C]">
                    Hỗ trợ định dạng PNG, JPG, JPEG, WEBP
                  </span>
                </label>

                {editImageUrl ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="modal-file-preview-wrap">
                      <Image
                        src={editImageUrl}
                        alt="Ảnh xem trước"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        className="modal-file-remove-btn"
                        onClick={() => setEditImageUrl('')}
                        title="Xoá ảnh này"
                      >
                        ✕
                      </button>
                    </div>
                    <div>
                      <span className="text-xs text-[#10B981] font-semibold block">✓ Ảnh hiển thị sẵn sàng</span>
                      <span className="text-[11px] text-[#6B6B6B]">Bấm vào khung trên nếu muốn đổi ảnh khác</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <input
                      type="url"
                      placeholder="Hoặc dán link ảnh trực tiếp (nếu có)..."
                      className="modal-input text-xs"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="modal-form-group">
                <label>Mô tả sản phẩm</label>
                <textarea
                  rows={2}
                  className="modal-input resize-none"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
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
