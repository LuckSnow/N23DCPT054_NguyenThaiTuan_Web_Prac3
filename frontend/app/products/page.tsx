'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProductMeta } from '../lib/productData';

type Product = {
  id: number;
  name: string;
  price: number;
  category?: string;
  images?: string[];
  description?: string;
  colors?: string[];
  sizes?: string[];
};

const ITEMS_PER_PAGE = 8;

export default function ProductsCatalogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Create modal state
  const [formOpen, setFormOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createPrice, setCreatePrice] = useState('');
  const [createCategory, setCreateCategory] = useState('Thời trang');
  const [createImageUrl, setCreateImageUrl] = useState('');
  const [createDescription, setCreateDescription] = useState('');

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('Thời trang');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // 1. Fetch products from Lab 3 API
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/api/products');
      return res.data;
    },
  });

  // 2. Add to Cart Mutation
  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => api.post('/api/cart', { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ hàng!', { icon: '🛍️' });
    },
    onError: () => {
      toast.error('Thêm vào giỏ thất bại!');
    },
  });

  // 3. Create Mutation
  const createMutation = useMutation({
    mutationFn: (newProd: { name: string; price: number; category: string; image?: string; description?: string }) =>
      api.post<Product>('/api/products', newProd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCreateName('');
      setCreatePrice('');
      setCreateImageUrl('');
      setCreateDescription('');
      setFormOpen(false);
      toast.success('Thêm sản phẩm mới thành công!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.message || 'Thêm sản phẩm thất bại!';
      toast.error(`Lỗi: ${msg}`);
    },
  });

  // 4. Update Product Mutation
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

  // 5. Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xoá sản phẩm', { icon: '🗑️' });
    },
    onError: () => {
      toast.error('Xoá sản phẩm thất bại!');
    },
  });

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

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (selectedCat !== 'all') {
      list = list.filter((p) => {
        const meta = getProductMeta(p);
        return meta.category.toLowerCase() === selectedCat.toLowerCase();
      });
    }

    if (priceFilter === 'under300') {
      list = list.filter((p) => p.price < 300000);
    } else if (priceFilter === '300to500') {
      list = list.filter((p) => p.price >= 300000 && p.price <= 500000);
    } else if (priceFilter === '500to700') {
      list = list.filter((p) => p.price >= 500000 && p.price <= 700000);
    } else if (priceFilter === 'above700') {
      list = list.filter((p) => p.price > 700000);
    }

    if (selectedSize !== 'all') {
      list = list.filter((p) => {
        const meta = getProductMeta(p);
        return meta.sizes && meta.sizes.includes(selectedSize);
      });
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [products, search, selectedCat, priceFilter, selectedSize, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const clearFilters = () => {
    setSelectedCat('all');
    setPriceFilter('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setSearch('');
    setSortBy('newest');
    setCurrentPage(1);
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

  const handleOpenEdit = (product: Product) => {
    const meta = getProductMeta(product);
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditCategory(meta.category);
    setEditImageUrl(meta.mainImage);
    setEditDescription(meta.description);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || Number(createPrice) <= 0) {
      toast.error('Vui lòng nhập tên và giá hợp lệ!');
      return;
    }
    createMutation.mutate({
      name: createName.trim(),
      price: Number(createPrice),
      category: createCategory,
      image: createImageUrl.trim() || undefined,
      description: createDescription.trim() || undefined,
    });
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
      category: editCategory,
      image: editImageUrl.trim() || undefined,
      description: editDescription.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar onSearch={(q) => { setSearch(q); setCurrentPage(1); }} />

      <main className="site-container flex-grow pb-24">
        {/* Header Breadcrumb & Title */}
        <div className="catalog-header">
          <nav className="breadcrumb-nav">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Tất cả sản phẩm</span>
          </nav>
          <div className="catalog-title-row">
            <div>
              <h1 className="catalog-title">Bộ sưu tập sản phẩm</h1>
              <p className="catalog-count">Hiển thị {filteredProducts.length} sản phẩm</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setFormOpen(true)}
              >
                ＋ Thêm sản phẩm mới
              </button>

              <div className="sort-dropdown-wrap">
                <label htmlFor="sort-select">Sắp xếp:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Catalog: Filters Sidebar + Grid */}
        <div className="catalog-layout">
          {/* Sidebar Filters with Modern White Card Design */}
          <aside className="catalog-sidebar">
            <div className="filters-header">
              <h3>Bộ lọc tìm kiếm</h3>
              <button type="button" onClick={clearFilters} className="clear-filters-link">
                Xoá tất cả
              </button>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Danh mục</h4>
              <ul className="filter-list">
                {[
                  { id: 'all', label: 'Tất cả sản phẩm' },
                  { id: 'Thời trang', label: 'Thời trang' },
                  { id: 'Giày dép', label: 'Giày dép' },
                  { id: 'Túi xách', label: 'Túi xách' },
                  { id: 'Phụ kiện', label: 'Phụ kiện' },
                ].map((cat) => {
                  const count =
                    cat.id === 'all'
                      ? products.length
                      : products.filter((p) => {
                          const m = getProductMeta(p);
                          return m.category.toLowerCase() === cat.id.toLowerCase();
                        }).length;

                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className={`filter-item-btn ${selectedCat === cat.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCat(cat.id);
                          setCurrentPage(1);
                        }}
                      >
                        <span>{cat.label}</span>
                        <span className="filter-count">({count})</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Khoảng giá</h4>
              <ul className="filter-list">
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under300', label: 'Dưới 300.000₫' },
                  { id: '300to500', label: '300.000₫ – 500.000₫' },
                  { id: '500to700', label: '500.000₫ – 700.000₫' },
                  { id: 'above700', label: 'Trên 700.000₫' },
                ].map((pf) => (
                  <li key={pf.id}>
                    <button
                      type="button"
                      className={`filter-item-btn ${priceFilter === pf.id ? 'active' : ''}`}
                      onClick={() => {
                        setPriceFilter(pf.id);
                        setCurrentPage(1);
                      }}
                    >
                      <span>{pf.label}</span>
                      {priceFilter === pf.id && <span className="filter-check">✓</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Size Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Kích cỡ</h4>
              <div className="filter-size-grid">
                {['S', 'M', 'L', 'XL', '39', '40', '41', '42'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`filter-size-btn ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSize(selectedSize === sz ? 'all' : sz);
                      setCurrentPage(1);
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="clear-filters-btn" onClick={clearFilters}>
              ✕ Xoá tất cả bộ lọc
            </button>
          </aside>

          {/* Product Grid & Functional Pagination */}
          <div className="catalog-products-col">
            {isLoading ? (
              <div className="empty-box-state">
                <p>Đang tải dữ liệu sản phẩm...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-box-state">
                <h3>Không tìm thấy sản phẩm phù hợp</h3>
                <p>Thử đổi danh mục hoặc mức giá khác.</p>
                <button type="button" onClick={clearFilters} className="btn-primary mt-4 inline-flex">
                  Xoá bộ lọc
                </button>
              </div>
            ) : (
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
                            onClick={(e) => {
                              e.stopPropagation();
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
            )}

            {/* REAL FUNCTIONAL PAGINATION NAVIGATION BUTTONS (Image 4) */}
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
          </div>
        </div>
      </main>

      <Footer />

      {/* MODAL THÊM SẢN PHẨM MỚI (Có ô thêm ảnh sản phẩm + danh mục + mô tả) */}
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
                  placeholder="Ví dụ: Giày sneaker thể thao Retro"
                  className="modal-input"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="modal-form-group">
                  <label>Giá bán (₫) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="680000"
                    className="modal-input"
                    value={createPrice}
                    onChange={(e) => setCreatePrice(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Danh mục *</label>
                  <select
                    className="modal-input cursor-pointer"
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value)}
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
                    onChange={(e) => handleImageFileChange(e, setCreateImageUrl)}
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

                {createImageUrl ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="modal-file-preview-wrap">
                      <Image
                        src={createImageUrl}
                        alt="Ảnh xem trước"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        className="modal-file-remove-btn"
                        onClick={() => setCreateImageUrl('')}
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
                      value={createImageUrl}
                      onChange={(e) => setCreateImageUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="modal-form-group">
                <label>Mô tả sản phẩm</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả chất liệu, tính năng..."
                  className="modal-input resize-none"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
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
              <h3>Chỉnh sửa thông tin</h3>
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
