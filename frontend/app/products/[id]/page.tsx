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
        {/* 2. BREADCRUMB */}
        <nav className="breadcrumb-nav py-6" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">{product.category}</Link>
          <span>/</span>
          <span className="text-[#171717] font-medium">{productName}</span>
        </nav>

        {/* 3. MAIN PRODUCT SECTION (Two-column layout với khoảng cách rộng rãi, không bị dính) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">
          {/* LEFT COLUMN: Product image gallery */}
          <div className="flex flex-col gap-5 pb-8">
            {/* Main square image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-[#E5E5E5] flex items-center justify-center p-4 shadow-sm">
              <Image
                src={gallery[activeThumb] || gallery[0]}
                alt={productName}
                width={800}
                height={800}
                priority
                className="w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                unoptimized
              />
            </div>

            {/* 4 small thumbnail images */}
            <div className="grid grid-cols-4 gap-3.5">
              {gallery.map((thumbUrl, idx) => (
                <button
                  key={`${thumbUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveThumb(idx)}
                  className={`aspect-square rounded-xl overflow-hidden bg-white p-1.5 border-2 transition-all cursor-pointer ${
                    activeThumb === idx ? 'border-[#171717] shadow-sm ring-1 ring-[#171717]' : 'border-[#E5E5E5] hover:border-[#8E8E8E]'
                  }`}
                  aria-label={`Ảnh thumbnail ${idx + 1}`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    width={180}
                    height={180}
                    className="w-full h-full object-cover rounded-lg"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Information */}
          <div className="flex flex-col pt-1">
            {/* Small Category Label */}
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-3">
              {product.category}
            </span>

            {/* Large Product Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#171717] leading-tight mb-4">
              {productName}
            </h1>

            {/* Rating Section */}
            <div className="flex items-center gap-2.5 text-sm text-[#6B6B6B] mb-6">
              <span className="text-amber-500 font-bold tracking-widest text-base">★★★★★</span>
              <strong className="text-[#171717] font-semibold">{product.rating}</strong>
              <span className="text-[#6B6B6B]">({product.reviewsCount} reviews)</span>
            </div>

            {/* Price Section */}
            <div className="flex items-baseline gap-4 mb-6 pb-2">
              <span className="text-3xl font-extrabold text-[#171717]">
                {Number(productPrice).toLocaleString('vi-VN')}đ
              </span>
              <span className="text-base text-[#A3A3A3] line-through">
                {Number(originalPrice).toLocaleString('vi-VN')}đ
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626]">
                -20%
              </span>
            </div>

            {/* 4. PRODUCT DESCRIPTION */}
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-7 max-w-xl">
              {product.description}
            </p>

            {/* 5. COLOR SELECTOR */}
            <div className="mb-7">
              <div className="text-sm font-semibold text-[#171717] mb-3">
                Màu sắc: <span className="font-medium text-[#4A4A4A]">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((cName) => {
                  const isSelected = selectedColor === cName;
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setSelectedColor(cName)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#171717] bg-[#171717] text-white shadow-sm'
                          : 'border-[#E5E5E5] bg-white text-[#171717] hover:border-[#171717]'
                      }`}
                    >
                      {cName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. SIZE SELECTOR */}
            <div className="mb-7">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-[#171717]">Kích thước</span>
                <button
                  type="button"
                  className="text-xs text-[#6B6B6B] hover:text-[#171717] underline cursor-pointer"
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
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-12 h-11 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                        : 'bg-white text-[#171717] border-[#E5E5E5] hover:border-[#171717]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. QUANTITY SELECTOR */}
            <div className="mb-6">
              <span className="text-sm font-semibold text-[#171717] block mb-2.5">Số lượng</span>
              <div className="inline-flex items-center border border-[#E5E5E5] rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer text-base font-medium"
                  aria-label="Giảm số lượng"
                >
                  －
                </button>
                <span className="w-12 text-center font-bold text-sm text-[#171717]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer text-base font-medium"
                  aria-label="Tăng số lượng"
                >
                  ＋
                </button>
              </div>
            </div>

            {/* 8. ACTION BUTTONS */}
            <div className="flex items-center gap-3.5 mb-10 pt-1">
              <button
                type="button"
                onClick={() => addToCartMutation.mutate(quantity)}
                disabled={addToCartMutation.isPending}
                className="flex-1 h-13 rounded-xl bg-[#171717] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#2E2E2E] transition-all shadow-sm cursor-pointer"
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
                className={`w-13 h-13 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isWishlist
                    ? 'border-[#E11D48] text-[#E11D48] bg-rose-50'
                    : 'border-[#E5E5E5] bg-white text-[#171717] hover:border-[#171717]'
                }`}
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

            {/* 9. PRODUCT INFORMATION ACCORDIONS */}
            <div className="border-t border-[#E5E5E5] pt-1">
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
                <div key={acc.id} className="border-b border-[#E5E5E5] py-4.5">
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    className="w-full flex justify-between items-center text-left text-sm font-bold text-[#171717] cursor-pointer"
                  >
                    <span>{acc.title}</span>
                    <span className="text-base font-normal text-[#6B6B6B]">
                      {openAccordion === acc.id ? '−' : '+'}
                    </span>
                  </button>
                  {openAccordion === acc.id && (
                    <div className="mt-3 text-xs text-[#6B6B6B] leading-relaxed pr-4">
                      {acc.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 10. REVIEWS SECTION */}
        <section className="mt-20 pt-12 border-t border-[#E5E5E5]">
          <h2 className="text-2xl font-bold text-[#171717] mb-8">Đánh giá sản phẩm</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded-2xl border border-[#E5E5E5] mb-10 shadow-sm">
            {/* Left side: Rating summary */}
            <div className="flex flex-col items-center justify-center md:border-r md:border-[#E5E5E5] md:pr-6">
              <span className="text-5xl font-black text-[#171717]">{product.rating} / 5</span>
              <div className="text-amber-500 text-lg my-1.5 tracking-wider">★★★★★</div>
              <span className="text-xs text-[#6B6B6B]">{product.reviewsCount} đánh giá</span>
            </div>

            {/* Right side: Breakdown */}
            <div className="md:col-span-2 flex flex-col justify-center gap-2.5">
              {[
                { star: 5, pct: '84%' },
                { star: 4, pct: '11%' },
                { star: 3, pct: '3%' },
                { star: 2, pct: '1%' },
                { star: 1, pct: '1%' },
              ].map((r) => (
                <div key={r.star} className="flex items-center gap-3 text-xs">
                  <span className="w-6 font-medium text-[#171717]">{r.star} ★</span>
                  <div className="flex-1 bg-[#F1F1EF] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#171717] h-full rounded-full" style={{ width: r.pct }} />
                  </div>
                  <span className="w-8 text-right text-[#6B6B6B]">{r.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerReviews.map((rev) => (
              <div
                key={rev.name}
                className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex flex-col justify-between"
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

        {/* 11. RELATED PRODUCTS (Click anywhere on card navigates to product detail) */}
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
                style={{ cursor: 'pointer' }}
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
