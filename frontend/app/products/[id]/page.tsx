'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getProductMeta } from '../../lib/productData';

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

const customerReviews = [
  {
    name: 'Minh Quân',
    rating: 5,
    date: '15/09/2026',
    comment: 'Chất lượng vải và hoàn thiện tỉ mỉ hơn mong đợi, phom dáng chuẩn chỉ từng đường kim mũi chỉ.',
    avatar: 'MQ',
  },
  {
    name: 'Hoàng Yến',
    rating: 5,
    date: '02/10/2026',
    comment: 'Giao hàng siêu nhanh, đóng gói hộp cứng cáp và tinh tế, mặc vừa vặn và rất thoải mái.',
    avatar: 'HY',
  },
  {
    name: 'Trần Đạt',
    rating: 5,
    date: '28/09/2026',
    comment: 'Màu sắc y hệt ảnh chụp trên website, chất liệu cao cấp thoáng mát. Rất hài lòng!',
    avatar: 'TĐ',
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const queryClient = useQueryClient();

  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [isWishlist, setIsWishlist] = useState(false);

  // 1. Lấy dữ liệu sản phẩm từ API
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/api/products');
      return res.data;
    },
  });

  const rawProduct = useMemo(() => {
    return products.find((p) => p.id === productId) || null;
  }, [products, productId]);

  const product = useMemo(() => {
    if (!rawProduct) {
      return getProductMeta({ id: productId, name: 'Sản phẩm MỘC Studio', price: 450000 });
    }
    return getProductMeta(rawProduct);
  }, [rawProduct, productId]);

  // Thiết lập màu và size mặc định khi sản phẩm thay đổi
  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setActiveThumb(0);
  }, [product]);

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.id !== productId)
      .slice(0, 4)
      .map((item) => getProductMeta(item));
  }, [products, productId]);

  // 2. Thêm vào giỏ hàng
  const addToCartMutation = useMutation({
    mutationFn: (qty: number) => api.post('/api/cart', { productId, quantity: qty }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`, { icon: '🛍️' });
    },
    onError: () => {
      toast.error('Thêm vào giỏ hàng thất bại!');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
        <Navbar />
        <main className="site-container flex-grow py-24 text-center">
          <p className="text-[#6B6B6B]">Đang tải dữ liệu sản phẩm...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const productName = product.name;
  const productPrice = product.price;
  const originalPrice = Math.round(productPrice * 1.25);
  const gallery = product.images;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar />

      <main className="site-container flex-grow pb-28">
        {/* BREADCRUMB */}
        <nav className="breadcrumb-nav py-6" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">{product.category}</Link>
          <span>/</span>
          <span className="text-[#171717] font-medium">{productName}</span>
        </nav>

        {/* MAIN PRODUCT SECTION (Two-column layout với khoảng cách rộng rãi, không bị dính) */}
        <div className="pdetail-layout">
          {/* LEFT COLUMN: Gallery */}
          <div className="pdetail-gallery-col">
            <div className="pdetail-main-img-box">
              <Image
                src={gallery[activeThumb] || gallery[0]}
                alt={productName}
                width={800}
                height={800}
                priority
                unoptimized
              />
            </div>

            <div className="pdetail-thumbs-grid">
              {gallery.slice(0, 4).map((thumbUrl, idx) => (
                <button
                  key={`${thumbUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveThumb(idx)}
                  className={`pdetail-thumb-btn ${activeThumb === idx ? 'active' : ''}`}
                  aria-label={`Ảnh thumbnail ${idx + 1}`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    width={180}
                    height={180}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Information */}
          <div className="pdetail-info-col">
            <span className="pdetail-category">{product.category}</span>
            <h1 className="pdetail-title">{productName}</h1>

            <div className="pdetail-rating-row">
              <span className="pdetail-stars">★★★★★</span>
              <strong className="text-[#171717]">{product.rating}</strong>
              <span>({product.reviewsCount} reviews)</span>
            </div>

            <div className="pdetail-price-row">
              <span className="pdetail-price-current">
                {Number(productPrice).toLocaleString('vi-VN')}đ
              </span>
              <span className="pdetail-price-original">
                {Number(originalPrice).toLocaleString('vi-VN')}đ
              </span>
              <span className="pdetail-discount-badge">-20%</span>
            </div>

            <p className="pdetail-description">{product.description}</p>

            {/* COLOR SELECTOR */}
            <div className="pdetail-color-group">
              <label className="pdetail-color-label">
                Màu sắc: <span className="font-medium text-[#4A4A4A]">{selectedColor}</span>
              </label>
              <div className="pdetail-color-options">
                {product.colors.map((cName) => {
                  const isSelected = selectedColor === cName;
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setSelectedColor(cName)}
                      className={`pdetail-color-btn ${isSelected ? 'active' : ''}`}
                    >
                      {cName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            <div className="pdetail-size-group">
              <div className="pdetail-size-header">
                <span className="pdetail-size-title">Kích thước</span>
                <button
                  type="button"
                  className="pdetail-size-guide-btn"
                  onClick={() =>
                    toast(
                      'Bảng chọn size: Quần áo (S: <55kg, M: 55-65kg, L: 65-75kg, XL: >75kg) / Giày (39: 24.5cm, 40: 25cm, 41: 26cm, 42: 26.5cm, 43: 27.5cm)',
                      { icon: '📏' }
                    )
                  }
                >
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="pdetail-size-options">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`pdetail-size-btn ${selectedSize === sz ? 'active' : ''}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY SELECTOR */}
            <div className="pdetail-qty-group">
              <label className="pdetail-qty-label">Số lượng</label>
              <div className="pdetail-qty-box">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="pdetail-qty-btn"
                  aria-label="Giảm số lượng"
                >
                  －
                </button>
                <span className="pdetail-qty-val">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="pdetail-qty-btn"
                  aria-label="Tăng số lượng"
                >
                  ＋
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pdetail-actions-row">
              <button
                type="button"
                onClick={() => addToCartMutation.mutate(quantity)}
                disabled={addToCartMutation.isPending}
                className="pdetail-add-btn"
              >
                {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsWishlist(!isWishlist);
                  toast(isWishlist ? 'Đã gỡ khỏi yêu thích' : 'Đã thêm vào yêu thích!', {
                    icon: isWishlist ? '♡' : '❤️',
                  });
                }}
                className={`pdetail-wishlist-btn ${isWishlist ? 'active' : ''}`}
                aria-label="Thêm vào danh sách yêu thích"
                title="Lưu vào yêu thích"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill={isWishlist ? '#E11D48' : 'none'}
                  stroke={isWishlist ? '#E11D48' : 'currentColor'}
                  strokeWidth="1.8"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* ACCORDIONS */}
            <div className="pdetail-accordions">
              {[
                {
                  id: 'desc',
                  title: 'Mô tả sản phẩm',
                  content: product.description,
                },
                {
                  id: 'info',
                  title: 'Thông tin sản phẩm',
                  content:
                    'Xuất xứ: Gia công chính hãng bởi MỘC Studio. Chất liệu chọn lọc thân thiện với làn da, đường kim mũi chỉ hoàn thiện tỉ mỉ đảm bảo độ bền tối ưu theo thời gian.',
                },
                {
                  id: 'shipping',
                  title: 'Vận chuyển & đổi trả',
                  content:
                    'Giao hàng miễn phí toàn quốc cho đơn hàng từ 500.000₫. Hỗ trợ kiểm tra hàng trước khi thanh toán và đổi size miễn phí trong vòng 7 ngày.',
                },
              ].map((acc) => (
                <div key={acc.id} className="pdetail-accordion-item">
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    className="pdetail-accordion-btn"
                  >
                    <span>{acc.title}</span>
                    <span className="text-base font-normal text-[#6B6B6B]">
                      {openAccordion === acc.id ? '−' : '+'}
                    </span>
                  </button>
                  {openAccordion === acc.id && (
                    <div className="pdetail-accordion-content">
                      {acc.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <section className="mt-20 pt-12 border-t border-[#E5E5E5]">
          <h2 className="text-2xl font-bold text-[#171717] mb-8">Đánh giá sản phẩm</h2>

          <div className="reviews-summary-card">
            <div className="reviews-score-col">
              <span className="reviews-score-num">{product.rating} / 5</span>
              <div className="reviews-score-stars">★★★★★</div>
              <span className="reviews-score-count">{product.reviewsCount} đánh giá</span>
            </div>

            <div className="reviews-bars-col">
              {[
                { star: 5, pct: '84%' },
                { star: 4, pct: '11%' },
                { star: 3, pct: '3%' },
                { star: 2, pct: '1%' },
                { star: 1, pct: '1%' },
              ].map((r) => (
                <div key={r.star} className="reviews-bar-row">
                  <span className="reviews-bar-star">{r.star} ★</span>
                  <div className="reviews-bar-track">
                    <div className="reviews-bar-fill" style={{ width: r.pct }} />
                  </div>
                  <span className="reviews-bar-pct">{r.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerReviews.map((rev) => (
              <div
                key={rev.name}
                className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#171717] text-white flex items-center justify-center text-xs font-bold">
                      {rev.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#171717]">{rev.name}</h4>
                      <div className="text-amber-500 text-xs">★★★★★</div>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed mb-4">{rev.comment}</p>
                </div>
                <span className="text-[11px] text-[#A3A3A3]">{rev.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        <section className="mt-20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-[#171717]">Có thể bạn sẽ thích</h2>
            <Link href="/products" className="text-sm font-semibold text-[#171717] hover:underline">
              Xem tất cả →
            </Link>
          </div>

          <div className="products-grid-4">
            {relatedProducts.map((item) => (
              <article
                className="modern-product-card"
                key={item.id}
                onClick={() => router.push(`/products/${item.id}`)}
              >
                <div className="product-img-box">
                  <Image
                    src={item.mainImage}
                    alt={item.name}
                    width={600}
                    height={600}
                    unoptimized
                  />
                  <div className="card-top-actions">
                    <button
                      type="button"
                      className="icon-action-pill btn-wishlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success('Đã lưu vào yêu thích!', { icon: '❤️' });
                      }}
                      aria-label="Yêu thích"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="product-card-body">
                  <span className="product-card-cat">{item.category.toUpperCase()}</span>
                  <div className="product-card-title">{item.name}</div>
                  <div className="product-price-row">
                    <span className="current-price">{Number(item.price).toLocaleString('vi-VN')}₫</span>
                    <span className="original-price">{Number(item.price * 1.25).toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
