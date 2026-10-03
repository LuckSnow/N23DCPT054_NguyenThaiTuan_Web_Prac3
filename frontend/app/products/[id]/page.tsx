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

const galleryImages = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=85',
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const queryClient = useQueryClient();

  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Đen');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('desc');
  const [isWishlist, setIsWishlist] = useState(false);

  // Fetch product list and find target product
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

  // Mutation thêm vào giỏ hàng
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
        <main className="site-container flex-grow py-20 text-center">
          <p>Đang tải thông tin sản phẩm...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
        <Navbar />
        <main className="site-container flex-grow py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm #{productId}</h2>
          <p className="text-[#6B6B6B] mb-6">Sản phẩm này có thể đã bị gỡ hoặc không tồn tại.</p>
          <Link href="/products" className="btn-primary">
            Quay lại danh mục sản phẩm
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar />

      <main className="site-container flex-grow detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb-nav">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/products">Sản phẩm</Link>
          <span>/</span>
          <span className="text-[#171717] font-medium">{product.name}</span>
        </nav>

        {/* 2-Column Product Detail Layout */}
        <div className="detail-grid">
          {/* Left Column: Image Gallery */}
          <div className="gallery-col">
            <div className="gallery-main-img">
              <Image
                src={galleryImages[activeImg]}
                alt={product.name}
                width={800}
                height={800}
                priority
                unoptimized
              />
            </div>
            <div className="gallery-thumbs-row">
              {galleryImages.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  className={`thumb-btn ${activeImg === index ? 'active' : ''}`}
                  onClick={() => setActiveImg(index)}
                >
                  <Image
                    src={src}
                    alt={`Ảnh chi tiết ${index + 1}`}
                    width={180}
                    height={180}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="detail-info-col">
            <span className="detail-cat-badge">MỘC STUDIO · THỜI TRANG THƯỜNG NGÀY</span>
            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-rating-row">
              <span className="star-gold">★★★★★</span>
              <strong>4.8</strong>
              <span>· (124 đánh giá của khách hàng)</span>
            </div>

            <div className="detail-price-box">
              <span className="detail-price">{Number(product.price).toLocaleString('vi-VN')}₫</span>
              <span className="original-price">{Number(product.price * 1.25).toLocaleString('vi-VN')}₫</span>
              <span className="detail-discount-pill">GIẢM 20%</span>
            </div>

            <p className="detail-desc">
              Được chế tác từ sợi bông tự nhiên đã qua xử lý mềm mại, mang đến phom dáng đứng chuẩn nhưng vẫn giữ được độ êm ái thoáng khí suốt ngày dài năng động.
            </p>

            {/* Colors */}
            <div className="detail-option-group">
              <h5>Màu sắc: <strong>{selectedColor}</strong></h5>
              <div className="flex gap-2">
                {[
                  { name: 'Đen', hex: '#171717' },
                  { name: 'Trắng', hex: '#F9FAFB', border: true },
                  { name: 'Xám', hex: '#6B7280' },
                  { name: 'Be', hex: '#E5D9D2' },
                ].map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className="w-8 h-8 rounded-full border-2 transition-transform"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: selectedColor === color.name ? '#171717' : '#D1D5DB',
                      transform: selectedColor === color.name ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="detail-option-group">
              <div className="flex justify-between items-center mb-2">
                <h5>Kích cỡ: <strong>Size {selectedSize}</strong></h5>
                <button
                  type="button"
                  className="text-xs text-[#6B6B6B] underline cursor-pointer"
                  onClick={() => toast('Bảng size chuẩn: S (45-55kg), M (55-65kg), L (65-75kg), XL (75-85kg)', { icon: '📏' })}
                >
                  Bảng hướng dẫn chọn size
                </button>
              </div>
              <div className="size-btn-group">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`size-pill-btn ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="detail-actions-row">
              <div className="qty-control">
                <button
                  type="button"
                  className="qty-step-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  －
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-step-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  ＋
                </button>
              </div>

              <button
                type="button"
                className="btn-primary detail-add-btn"
                onClick={() => addToCartMutation.mutate(quantity)}
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>

              <button
                type="button"
                className="detail-wishlist-btn"
                onClick={() => {
                  setIsWishlist(!isWishlist);
                  toast(isWishlist ? 'Đã gỡ khỏi yêu thích' : 'Đã thêm vào yêu thích!', { icon: isWishlist ? '♡' : '❤️' });
                }}
                aria-label="Yêu thích"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill={isWishlist ? '#E11D48' : 'none'} stroke={isWishlist ? '#E11D48' : 'currentColor'} strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Accordion Information */}
            <div className="detail-accordion">
              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-title"
                  onClick={() => setActiveAccordion(activeAccordion === 'desc' ? null : 'desc')}
                >
                  <span>Mô tả chi tiết sản phẩm</span>
                  <span>{activeAccordion === 'desc' ? '−' : '＋'}</span>
                </button>
                {activeAccordion === 'desc' && (
                  <div className="accordion-body">
                    Sản phẩm được thiết kế và may tỉ mỉ tại xưởng MỘC Studio. Đường may kép gia cố ở các vị trí chịu lực, giữ form áo quần luôn phẳng phiu sau nhiều lần giặt. Phù hợp cho cả đi làm, dạo phố và gặp gỡ bạn bè.
                  </div>
                )}
              </div>

              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-title"
                  onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                >
                  <span>Chất liệu & Cách bảo quản</span>
                  <span>{activeAccordion === 'care' ? '−' : '＋'}</span>
                </button>
                {activeAccordion === 'care' && (
                  <div className="accordion-body">
                    • 100% Sợi bông hữu cơ chải kỹ (Combed Organic Cotton).<br />
                    • Giặt máy ở chế độ giặt nhẹ nhàng dưới 30°C.<br />
                    • Không dùng chất tẩy trắng có clo.<br />
                    • Phơi trong bóng râm, ủi ở nhiệt độ trung bình.
                  </div>
                )}
              </div>

              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-title"
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                >
                  <span>Giao hàng & Đổi trả dễ dàng</span>
                  <span>{activeAccordion === 'shipping' ? '−' : '＋'}</span>
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="accordion-body">
                    • Giao hàng tiêu chuẩn 2-3 ngày toàn quốc. Miễn phí vận chuyển cho đơn hàng từ 500.000₫.<br />
                    • Đổi trả hàng miễn phí trong vòng 30 ngày đối với sản phẩm còn nguyên tem mác.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-16 pt-12 border-t border-[#E5E5E5]">
          <h2 className="text-2xl font-bold mb-6">Đánh giá từ khách hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-2xl border border-[#E5E5E5]">
            <div className="flex flex-col items-center justify-center p-4 border-r border-[#E5E5E5]">
              <span className="text-5xl font-black text-[#171717]">4.8</span>
              <div className="text-amber-500 text-lg my-1">★★★★★</div>
              <span className="text-xs text-[#6B6B6B]">Dựa trên 124 lượt đánh giá</span>
            </div>
            <div className="col-span-2 flex flex-col justify-center gap-2">
              <div className="flex items-center gap-3 text-xs">
                <span>5 ★</span>
                <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-neutral-800 h-full w-[82%]" />
                </div>
                <span>82%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span>4 ★</span>
                <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-neutral-800 h-full w-[12%]" />
                </div>
                <span>12%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span>3 ★</span>
                <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-neutral-800 h-full w-[4%]" />
                </div>
                <span>4%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 mb-8">
            <h2 className="text-2xl font-bold mb-6">Có thể bạn cũng thích</h2>
            <div className="products-grid-4">
              {relatedProducts.map((rel, idx) => (
                <article className="modern-product-card" key={rel.id}>
                  <div className="product-img-box">
                    <Image
                      src={galleryImages[idx % galleryImages.length]}
                      alt={rel.name}
                      width={600}
                      height={600}
                      unoptimized
                    />
                  </div>
                  <div className="product-card-body">
                    <span className="product-card-cat">MỘC STUDIO</span>
                    <Link href={`/products/${rel.id}`} className="product-card-title">
                      {rel.name}
                    </Link>
                    <div className="product-price-row">
                      <span className="current-price">{Number(rel.price).toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
