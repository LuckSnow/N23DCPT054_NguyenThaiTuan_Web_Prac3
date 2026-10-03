'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

type Product = {
  id: number;
  name: string;
  price: number;
};

const productGallery = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
];

const customerReviews = [
  {
    name: 'Minh Quân',
    rating: 5,
    date: '15/09/2026',
    comment: 'Giày rất êm, phom đứng chuẩn form, chất liệu hoàn thiện tỉ mỉ hơn mong đợi.',
    avatar: 'MQ',
  },
  {
    name: 'Hoàng Yến',
    rating: 5,
    date: '02/10/2026',
    comment: 'Giao hàng siêu nhanh, đóng gói hộp cứng cáp, đi cả ngày không bị đau gót chân.',
    avatar: 'HY',
  },
  {
    name: 'Trần Đạt',
    rating: 4,
    date: '28/09/2026',
    comment: 'Màu sắc y như hình chụp, thoáng khí tốt. Rất đáng giá trong tầm tiền.',
    avatar: 'TĐ',
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const queryClient = useQueryClient();

  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Đen');
  const [selectedSize, setSelectedSize] = useState('41');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [isWishlist, setIsWishlist] = useState(false);

  // 1. Lấy dữ liệu sản phẩm
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/api/products');
      return res.data;
    },
  });

  const product = useMemo(() => {
    return products.find((p) => p.id === productId) || null;
  }, [products, productId]);

  const relatedProducts = useMemo(() => {
    return products.filter((p) => p.id !== productId).slice(0, 4);
  }, [products, productId]);

  // 2. Thêm vào giỏ hàng
  const addToCartMutation = useMutation({
    mutationFn: (qty: number) => api.post('/api/cart', { productId, quantity: qty }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, { icon: '🛍️' });
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

  const productName = product ? product.name : 'Nike Air Max 270';
  const productPrice = product ? product.price : 2490000;
  const originalPrice = Math.round(productPrice * 1.32);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar />

      <main className="site-container flex-grow pb-24">
        {/* 2. BREADCRUMB */}
        <nav className="breadcrumb-nav py-6">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Shoes</Link>
          <span>/</span>
          <span className="text-[#171717] font-medium">{productName}</span>
        </nav>

        {/* 3. MAIN PRODUCT SECTION (Two-column layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">
          {/* LEFT COLUMN: Product image gallery */}
          <div className="flex flex-col gap-4">
            {/* Main square image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-[#E5E5E5] flex items-center justify-center p-6 shadow-sm">
              <Image
                src={productGallery[activeThumb]}
                alt={productName}
                width={800}
                height={800}
                priority
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                unoptimized
              />
            </div>

            {/* 4 small thumbnail images */}
            <div className="grid grid-cols-4 gap-3">
              {productGallery.map((thumbUrl, idx) => (
                <button
                  key={thumbUrl}
                  type="button"
                  onClick={() => setActiveThumb(idx)}
                  className={`aspect-square rounded-xl overflow-hidden bg-white p-2 border-2 transition-all ${
                    activeThumb === idx ? 'border-[#171717] shadow-sm' : 'border-[#E5E5E5] hover:border-[#A3A3A3]'
                  }`}
                  aria-label={`Ảnh thumbnail ${idx + 1}`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    width={180}
                    height={180}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Information */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">
              Running Shoes
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-[#171717] leading-tight mb-3">
              {productName}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-5">
              <span className="text-amber-500 font-bold">★★★★★</span>
              <strong className="text-[#171717]">4.8</strong>
              <span>· (124 reviews)</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-extrabold text-[#171717]">
                {Number(productPrice).toLocaleString('vi-VN')}đ
              </span>
              <span className="text-base text-[#A3A3A3] line-through">
                {Number(originalPrice).toLocaleString('vi-VN')}đ
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626]">
                -24%
              </span>
            </div>

            {/* 4. PRODUCT DESCRIPTION */}
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-6 max-w-lg">
              Designed for everyday comfort with a clean and modern silhouette. Lightweight construction and responsive cushioning make it suitable for everyday use.
            </p>

            {/* 5. COLOR SELECTOR */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-[#171717] mb-2.5">
                Màu: <span className="font-normal text-[#6B6B6B]">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { name: 'Đen', hex: '#171717' },
                  { name: 'Trắng', hex: '#FFFFFF', border: true },
                  { name: 'Xám', hex: '#9CA3AF' },
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: selectedColor === c.name ? '#171717' : '#E5E5E5',
                      boxShadow: selectedColor === c.name ? '0 0 0 2px #FFFFFF, 0 0 0 4px #171717' : 'none',
                    }}
                    title={c.name}
                    aria-label={`Chọn màu ${c.name}`}
                  />
                ))}
              </div>
            </div>

            {/* 6. SIZE SELECTOR */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-semibold text-[#171717]">Kích thước</span>
                <button
                  type="button"
                  className="text-xs text-[#6B6B6B] hover:text-[#171717] underline cursor-pointer"
                  onClick={() => toast('Bảng chọn size: 39 (24.5cm), 40 (25cm), 41 (26cm), 42 (26.5cm), 43 (27.5cm)', { icon: '📏' })}
                >
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {['39', '40', '41', '42', '43'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-12 h-11 px-4 rounded-xl text-sm font-semibold border transition-all ${
                      selectedSize === sz
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-white text-[#171717] border-[#E5E5E5] hover:border-[#171717]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. QUANTITY */}
            <div className="mb-6">
              <span className="text-sm font-semibold text-[#171717] block mb-2">Số lượng</span>
              <div className="inline-flex items-center border border-[#E5E5E5] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#171717] hover:bg-[#F1F1EF] transition-colors"
                  aria-label="Giảm số lượng"
                >
                  －
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#171717]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#171717] hover:bg-[#F1F1EF] transition-colors"
                  aria-label="Tăng số lượng"
                >
                  ＋
                </button>
              </div>
            </div>

            {/* 8. ACTION BUTTONS */}
            <div className="flex items-center gap-3 mb-10">
              <button
                type="button"
                onClick={() => addToCartMutation.mutate(quantity)}
                disabled={addToCartMutation.isPending}
                className="flex-1 h-12 rounded-xl bg-[#171717] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#2E2E2E] transition-all shadow-sm cursor-pointer"
              >
                {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsWishlist(!isWishlist);
                  toast(isWishlist ? 'Đã gỡ khỏi yêu thích' : 'Đã thêm vào yêu thích!', { icon: isWishlist ? '♡' : '❤️' });
                }}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isWishlist
                    ? 'border-[#E11D48] text-[#E11D48] bg-rose-50'
                    : 'border-[#E5E5E5] bg-white text-[#171717] hover:border-[#171717]'
                }`}
                aria-label="Thêm vào danh sách yêu thích"
                title="Lưu vào yêu thích"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill={isWishlist ? '#E11D48' : 'none'} stroke={isWishlist ? '#E11D48' : 'currentColor'} strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* 9. PRODUCT INFORMATION ACCORDIONS */}
            <div className="border-t border-[#E5E5E5]">
              {[
                {
                  id: 'desc',
                  title: 'Mô tả sản phẩm',
                  content:
                    'Sản phẩm được gia công với đường may tỉ mỉ, chất liệu cao cấp thoáng khí, chống mỏi và nâng đỡ bước chân êm dịu trên mọi cung đường.',
                },
                {
                  id: 'info',
                  title: 'Thông tin sản phẩm',
                  content:
                    'Xuất xứ: Chính hãng. Trọng lượng: 280g (size 41). Đế giày cao su đúc nguyên khối chống trơn trượt hiệu quả.',
                },
                {
                  id: 'shipping',
                  title: 'Vận chuyển & đổi trả',
                  content:
                    'Miễn phí vận chuyển cho đơn hàng từ 500.000₫. Hỗ trợ đổi size hoặc trả hàng trong vòng 30 ngày kể từ ngày nhận.',
                },
              ].map((acc) => (
                <div key={acc.id} className="border-b border-[#E5E5E5] py-4">
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    className="w-full flex justify-between items-center text-left text-sm font-bold text-[#171717]"
                  >
                    <span>{acc.title}</span>
                    <span className="text-base font-normal text-[#6B6B6B]">
                      {openAccordion === acc.id ? '−' : '+'}
                    </span>
                  </button>
                  {openAccordion === acc.id && (
                    <div className="mt-2 text-xs text-[#6B6B6B] leading-relaxed">
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
              <span className="text-5xl font-black text-[#171717]">4.8 / 5</span>
              <div className="text-amber-500 text-lg my-1">★★★★★</div>
              <span className="text-xs text-[#6B6B6B]">124 đánh giá</span>
            </div>

            {/* Right side: Breakdown */}
            <div className="md:col-span-2 flex flex-col justify-center gap-2">
              {[
                { star: 5, pct: '82%' },
                { star: 4, pct: '12%' },
                { star: 3, pct: '3%' },
                { star: 2, pct: '2%' },
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
              <div key={rev.name} className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm flex flex-col justify-between">
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

        {/* 11. RELATED PRODUCTS */}
        <section className="mt-20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-[#171717]">Có thể bạn sẽ thích</h2>
            <Link href="/products" className="text-sm font-semibold text-[#171717] hover:underline">
              Xem tất cả →
            </Link>
          </div>

          <div className="products-grid-4">
            {(relatedProducts.length > 0 ? relatedProducts : products.slice(0, 4)).map((item) => (
              <article className="modern-product-card" key={item.id}>
                <div className="product-img-box">
                  <Image
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                    alt={item.name}
                    width={600}
                    height={600}
                    unoptimized
                  />
                  <div className="card-top-actions">
                    <button
                      type="button"
                      className="icon-action-pill btn-wishlist"
                      onClick={() => toast.success('Đã lưu vào yêu thích!', { icon: '❤️' })}
                      aria-label="Yêu thích"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="product-card-body">
                  <span className="product-card-cat">RUNNING SHOES</span>
                  <Link href={`/products/${item.id}`} className="product-card-title">
                    {item.name}
                  </Link>
                  <div className="product-price-row">
                    <span className="current-price">{Number(item.price).toLocaleString('vi-VN')}đ</span>
                    <span className="original-price">{Number(item.price * 1.3).toLocaleString('vi-VN')}đ</span>
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
