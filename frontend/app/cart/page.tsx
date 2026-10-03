'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type CartItem = {
  productId: number;
  quantity: number;
  name: string;
  price: number;
  subtotal: number;
};

type CartResponse = {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
};

const imageMap: Record<number, string> = {
  1: 'photo-1521572163474-6864f9cf17ab',
  2: 'photo-1542272604-787c3835535d',
  3: 'photo-1529139574466-a303027c1d8b',
  4: 'photo-1523381210434-271e8be1f52b',
};

// Default variant mapping for realistic e-commerce presentation
const variantMap: Record<number, { color: string; size: string; category: string }> = {
  1: { color: 'Đen (Black)', size: 'Size M', category: 'Áo thun cotton' },
  2: { color: 'Xanh Indigo', size: 'Size 31', category: 'Quần jeans slim' },
  3: { color: 'Trắng tinh khôi', size: 'Size L', category: 'Áo sơ mi linen' },
  4: { color: 'Rêu phong', size: 'Size XL', category: 'Áo khoác bomber' },
};

const FREE_SHIPPING_THRESHOLD = 500000; // 500.000₫
const STANDARD_SHIPPING_FEE = 25000; // 25.000₫

export default function ShoppingCartPage() {
  const queryClient = useQueryClient();

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);

  // 1. Fetch Cart Data
  const { data: cart = { items: [], totalQuantity: 0, totalPrice: 0 }, isLoading } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get<CartResponse>('/api/cart');
      return res.data;
    },
  });

  // 2. Remove Item Mutation
  const removeMutation = useMutation({
    mutationFn: (productId: number) => api.delete(`/api/cart/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xoá sản phẩm khỏi giỏ hàng', { icon: '🗑️' });
    },
    onError: () => {
      toast.error('Xoá sản phẩm thất bại!');
    },
  });

  // 3. Update Quantity Mutation (PUT /api/cart/:productId)
  const updateQtyMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      api.put(`/api/cart/${productId}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      toast.error('Cập nhật số lượng thất bại!');
    },
  });

  const handleStepQty = (productId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      if (window.confirm('Bạn có muốn xoá sản phẩm này khỏi giỏ hàng?')) {
        removeMutation.mutate(productId);
      }
      return;
    }
    updateQtyMutation.mutate({ productId, quantity: newQty });
  };

  const handleToggleWishlist = (productId: number) => {
    if (wishlistItems.includes(productId)) {
      setWishlistItems(wishlistItems.filter((id) => id !== productId));
      toast('Đã gỡ khỏi danh sách yêu thích', { icon: '♡' });
    } else {
      setWishlistItems([...wishlistItems, productId]);
      toast.success('Đã lưu vào danh sách yêu thích!', { icon: '❤️' });
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'MOC20' || clean === 'DISCOUNT20' || clean === 'CHAOMOC') {
      const discount = Math.min(50000, Math.round(cart.totalPrice * 0.15));
      setDiscountAmount(discount);
      setAppliedPromo(clean);
      toast.success(`Áp dụng mã ${clean} thành công! Giảm ${discount.toLocaleString('vi-VN')}₫`, {
        icon: '🎉',
      });
      setPromoCode('');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
    }
  };

  const handleCheckout = () => {
    toast.success('Tiến hành đặt hàng thành công! MỘC Studio sẽ liên hệ xác nhận đơn.', {
      duration: 4000,
      icon: '🔒',
    });
  };

  // Calculations
  const isFreeShipping = cart.totalPrice >= FREE_SHIPPING_THRESHOLD || cart.totalPrice === 0;
  const shippingFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const awayFromFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.totalPrice);
  const freeShippingProgress = Math.min(100, Math.round((cart.totalPrice / FREE_SHIPPING_THRESHOLD) * 100));
  const finalTotal = Math.max(0, cart.totalPrice + shippingFee - discountAmount);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar />

      <main className="site-container flex-grow pb-24">
        {/* HEADER */}
        <div className="cart-page-header">
          <nav className="breadcrumb-nav">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Cart</span>
          </nav>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#171717]">
              Shopping Cart
            </h1>
            <span className="text-sm font-semibold text-[#6B6B6B]">
              {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="empty-box-state">
            <p>Đang tải giỏ hàng...</p>
          </div>
        ) : cart.items.length === 0 ? (
          /* EMPTY CART STATE */
          <div className="empty-cart-container">
            <div className="empty-cart-icon-circle">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h2 className="empty-cart-heading">Your cart is empty</h2>
            <p className="empty-cart-text">
              Looks like you haven&apos;t added anything yet. Explore our latest arrivals and timeless essentials.
            </p>
            <Link href="/products" className="btn-primary inline-flex">
              Start Shopping →
            </Link>
          </div>
        ) : (
          /* 2-COLUMN CART LAYOUT */
          <div className="cart-layout">
            {/* LEFT: Cart Items List */}
            <div className="cart-items-wrapper">
              {cart.items.map((item) => {
                const imgKey = imageMap[item.productId] || 'photo-1521572163474-6864f9cf17ab';
                const variants = variantMap[item.productId] || {
                  color: 'Tiêu chuẩn',
                  size: 'Free size',
                  category: 'Thời trang',
                };
                const isSavedWishlist = wishlistItems.includes(item.productId);

                return (
                  <article className="cart-item-modern" key={item.productId}>
                    {/* Product Image 120x120 */}
                    <div className="cart-item-media">
                      <Image
                        src={`https://images.unsplash.com/${imgKey}?auto=format&fit=crop&w=360&q=80`}
                        alt={item.name}
                        width={120}
                        height={120}
                        unoptimized
                      />
                    </div>

                    {/* Product Details */}
                    <div className="cart-item-center">
                      <span className="cart-item-category">{variants.category}</span>
                      <Link href={`/products/${item.productId}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <div className="cart-item-variants">
                        <span>{variants.color}</span>
                        <span>•</span>
                        <span>{variants.size}</span>
                      </div>
                      <div className="cart-item-unit-price">
                        Đơn giá: <strong>{Number(item.price).toLocaleString('vi-VN')}₫</strong>
                      </div>
                    </div>

                    {/* Right Controls: Quantity & Total & Actions */}
                    <div className="cart-item-right-actions">
                      {/* Quantity Selector [-] 1 [+] */}
                      <div className="cart-qty-selector">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => handleStepQty(item.productId, item.quantity, -1)}
                          aria-label="Giảm số lượng"
                        >
                          －
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => handleStepQty(item.productId, item.quantity, 1)}
                          aria-label="Tăng số lượng"
                        >
                          ＋
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="cart-item-total-col">
                        <span className="cart-item-total-price">
                          {Number(item.subtotal).toLocaleString('vi-VN')}₫
                        </span>
                      </div>

                      {/* Icons: Wishlist & Remove */}
                      <div className="cart-item-icons-group">
                        <button
                          type="button"
                          className="cart-icon-action-btn"
                          onClick={() => handleToggleWishlist(item.productId)}
                          aria-label="Thêm vào yêu thích"
                          title="Lưu vào danh sách yêu thích"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill={isSavedWishlist ? '#E11D48' : 'none'}
                            stroke={isSavedWishlist ? '#E11D48' : 'currentColor'}
                            strokeWidth="1.8"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="cart-icon-action-btn btn-remove"
                          onClick={() => {
                            if (window.confirm(`Bạn muốn xoá "${item.name}" khỏi giỏ hàng?`)) {
                              removeMutation.mutate(item.productId);
                            }
                          }}
                          aria-label="Xoá sản phẩm"
                          title="Xoá khỏi giỏ hàng"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="pt-2">
                <Link href="/products" className="text-sm font-semibold text-[#171717] hover:underline inline-flex items-center gap-2">
                  ← Tiếp tục chọn thêm sản phẩm
                </Link>
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <aside className="order-summary-sidebar">
              {/* FREE SHIPPING PROGRESS BAR */}
              <div className="free-shipping-card">
                <div className="free-shipping-text">
                  {isFreeShipping ? (
                    <span className="text-[#10B981] font-bold">
                      🎉 Bạn đã đủ điều kiện được Miễn phí vận chuyển!
                    </span>
                  ) : (
                    <span>
                      Mua thêm <strong>{awayFromFreeShipping.toLocaleString('vi-VN')}₫</strong> để được Miễn phí vận chuyển.
                    </span>
                  )}
                </div>
                <div className="free-shipping-track">
                  <div
                    className={`free-shipping-fill ${isFreeShipping ? 'reached' : ''}`}
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="order-summary-box">
                <h2 className="order-summary-title">Order Summary</h2>

                <div className="summary-line-row">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#171717]">
                    {Number(cart.totalPrice).toLocaleString('vi-VN')}₫
                  </span>
                </div>

                <div className="summary-line-row">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-[#10B981] font-bold">Free</span>
                    ) : (
                      `${Number(shippingFee).toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="summary-line-row discount-row">
                    <span>Discount ({appliedPromo})</span>
                    <span>-{Number(discountAmount).toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                <div className="summary-divider-line" />

                <div className="summary-total-row">
                  <span>Total</span>
                  <span className="summary-total-price">
                    {Number(finalTotal).toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {/* Promo Code Input & Button */}
                <form onSubmit={handleApplyPromo} className="promo-code-wrap">
                  <input
                    type="text"
                    placeholder="Enter promo code (e.g. MOC20)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="promo-input"
                  />
                  <button type="submit" className="btn-promo-apply">
                    Apply
                  </button>
                </form>

                {/* Primary Button */}
                <button
                  type="button"
                  className="btn-checkout-primary"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout →
                </button>

                {/* Secondary Button */}
                <Link href="/products" className="btn-continue-secondary">
                  Continue Shopping
                </Link>

                {/* Secure Checkout Indicator */}
                <div className="secure-checkout-indicator">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>🔒 Secure checkout</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
