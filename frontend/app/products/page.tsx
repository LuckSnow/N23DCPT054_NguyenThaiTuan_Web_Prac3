'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Product = {
  id: number;
  name: string;
  price: number;
};

const sampleImages = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=720&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=720&q=80',
];

export default function ProductsCatalogPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Lab 3: Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // 1. Fetch products from Lab 3 API
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/api/products');
      return res.data;
    },
  });

  // 2. Add to Cart mutation
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

  // 3. Edit product mutation (PUT)
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

  // 4. Delete product mutation (DELETE)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xoá sản phẩm', { icon: '🗑️' });
    },
    onError: () => {
      toast.error('Xoá thất bại!');
    },
  });

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (priceFilter === 'under200') {
      list = list.filter((p) => p.price < 200000);
    } else if (priceFilter === '200to400') {
      list = list.filter((p) => p.price >= 200000 && p.price <= 400000);
    } else if (priceFilter === '400to600') {
      list = list.filter((p) => p.price >= 400000 && p.price <= 600000);
    } else if (priceFilter === 'above600') {
      list = list.filter((p) => p.price > 600000);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [products, search, priceFilter, sortBy]);

  const clearFilters = () => {
    setSelectedCat('all');
    setPriceFilter('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setSearch('');
    setSortBy('newest');
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

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim() || Number(editPrice) <= 0) {
      toast.error('Vui lòng nhập tên và giá hợp lệ!');
      return;
    }
    updateMutation.mutate({
      id: editingProduct.id,
      name: editName.trim(),
      price: Number(editPrice),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar onSearch={(q) => setSearch(q)} />

      <main className="site-container flex-grow">
        {/* Header Breadcrumb & Title */}
        <div className="catalog-header">
          <nav className="breadcrumb-nav">
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <span>Sản phẩm</span>
          </nav>
          <h1 className="catalog-title">Tất cả sản phẩm</h1>
          <p className="section-subtitle">Khám phá bộ sưu tập phong cách sống đầy đủ từ MỘC Studio.</p>
        </div>

        {/* 2-Column Catalog Layout */}
        <div className="catalog-layout">
          {/* Left Sidebar Filter */}
          <aside className="catalog-sidebar">
            <div className="filter-group">
              <h4>Danh mục</h4>
              <ul className="filter-list">
                {[
                  { id: 'all', label: 'Tất cả sản phẩm' },
                  { id: 'fashion', label: 'Thời trang' },
                  { id: 'shoes', label: 'Giày dép' },
                  { id: 'bags', label: 'Túi xách' },
                  { id: 'accessories', label: 'Phụ kiện' },
                ].map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      className={`filter-item-btn ${selectedCat === cat.id ? 'active' : ''}`}
                      onClick={() => setSelectedCat(cat.id)}
                    >
                      <span>{cat.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h4>Khoảng giá</h4>
              <ul className="filter-list">
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under200', label: 'Dưới 200.000₫' },
                  { id: '200to400', label: '200.000₫ – 400.000₫' },
                  { id: '400to600', label: '400.000₫ – 600.000₫' },
                  { id: 'above600', label: 'Trên 600.000₫' },
                ].map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`filter-item-btn ${priceFilter === p.id ? 'active' : ''}`}
                      onClick={() => setPriceFilter(p.id)}
                    >
                      <span>{p.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h4>Kích cỡ</h4>
              <ul className="filter-list">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <li key={size}>
                    <button
                      type="button"
                      className={`filter-item-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(selectedSize === size ? 'all' : size)}
                    >
                      <span>Size {size}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h4>Màu sắc</h4>
              <ul className="filter-list">
                {[
                  { id: 'black', label: 'Đen' },
                  { id: 'white', label: 'Trắng' },
                  { id: 'gray', label: 'Xám' },
                  { id: 'blue', label: 'Xanh' },
                  { id: 'brown', label: 'Nâu' },
                ].map((color) => (
                  <li key={color.id}>
                    <button
                      type="button"
                      className={`filter-item-btn ${selectedColor === color.id ? 'active' : ''}`}
                      onClick={() => setSelectedColor(selectedColor === color.id ? 'all' : color.id)}
                    >
                      <span>{color.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" className="clear-filters-btn" onClick={clearFilters}>
              Xoá tất cả bộ lọc
            </button>
          </aside>

          {/* Right Product Grid Area */}
          <div className="catalog-main">
            <div className="catalog-toolbar">
              <span className="catalog-count">{filteredProducts.length} sản phẩm</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6B6B]">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="featured">Nổi bật</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="empty-box-state">
                <p>Đang tải danh mục sản phẩm...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-box-state">
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none" strokeWidth="1.5" className="mx-auto mb-3 text-neutral-400">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
                <h3>Không tìm thấy sản phẩm phù hợp</h3>
                <p>Hãy thử thay đổi tiêu chí lọc hoặc tìm kiếm với từ khoá khác.</p>
                <button type="button" className="btn-primary" onClick={clearFilters}>
                  Xoá bộ lọc
                </button>
              </div>
            ) : (
              <div className="products-grid-4">
                {filteredProducts.map((product, idx) => {
                  const img = sampleImages[idx % sampleImages.length];
                  const isFavorite = wishlist.includes(product.id);
                  return (
                    <article className="modern-product-card" key={product.id}>
                      <div className="product-img-box">
                        <Image
                          src={img}
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
                            onClick={() => toggleWishlist(product.id)}
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
                            onClick={() => {
                              setEditingProduct(product);
                              setEditName(product.name);
                              setEditPrice(String(product.price));
                            }}
                            aria-label="Sửa"
                            title="Sửa sản phẩm"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="icon-action-pill btn-delete"
                            onClick={() => {
                              if (window.confirm(`Bạn chắc chắn muốn xoá sản phẩm "${product.name}"?`)) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                            aria-label="Xoá"
                            title="Xoá sản phẩm"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="product-card-body">
                        <span className="product-card-cat">MỘC STUDIO · BỘ SƯU TẬP</span>
                        <Link href={`/products/${product.id}`} className="product-card-title">
                          {product.name}
                        </Link>
                        <div className="product-price-row">
                          <span className="current-price">{Number(product.price).toLocaleString('vi-VN')}₫</span>
                          <span className="original-price">{Number(product.price * 1.25).toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div className="product-card-actions">
                          <button
                            type="button"
                            className="btn-card-add"
                            onClick={() => addToCartMutation.mutate(product.id)}
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

            {/* Pagination */}
            <div className="pagination-row">
              <button type="button" className="page-num-btn">←</button>
              <button type="button" className="page-num-btn active">1</button>
              <button type="button" className="page-num-btn">2</button>
              <button type="button" className="page-num-btn">3</button>
              <button type="button" className="page-num-btn">→</button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

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
