'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProductMeta } from '../lib/productData';

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

const SHIPPING_FEE = 30000; // 30.000đ

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
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng', { icon: '🗑️' });
    },
    onError: () => {
      toast.error('Xóa sản phẩm thất bại!');
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
      if (window.confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
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
      const discount = 200000; // 200.000đ per specification
      setDiscountAmount(discount);
      setAppliedPromo(clean);
      toast.success(`Áp dụng mã ${clean} thành công! Giảm ${discount.toLocaleString('vi-VN')}đ`, {
        icon: '🎉',
      });
      setPromoCode('');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
    }
  };

  const handleCheckout = () => {
    toast.success('Tiến hành đặt hàng thành công! Đơn hàng đang được xử lý.', {
      duration: 4000,
      icon: '🔒',
    });
  };

  const shippingCost = cart.items.length > 0 ? SHIPPING_FEE : 0;
  const finalTotal = Math.max(0, cart.totalPrice + shippingCost - discountAmount);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar />

      <main className="site-container flex-grow pb-24">
        {/* 2. BREADCRUMB */}
        <div className="cart-page-header">
          <nav className="breadcrumb-nav">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Shopping Cart</span>
          </nav>

          {/* 3. PAGE TITLE */}
          <div className="mt-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#171717]">
              Giỏ hàng
            </h1>
            <p className="text-sm font-medium text-[#6B6B6B] mt-1">
              {cart.totalQuantity} sản phẩm
            </p>
          </div>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="empty-box-state">
            <p className="text-[#6B6B6B]">Đang tải giỏ hàng...</p>
          </div>
        ) : cart.items.length === 0 ? (
          /* 12. EMPTY CART STATE */
          <div className="empty-cart-container">
            <div className="empty-cart-icon-circle">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#171717" strokeWidth="1.6">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" stroke="#171717" strokeWidth="1.6" />
                <path d="M16 10a4 4 0 0 1-8 0" stroke="#171717" strokeWidth="1.6" />
              </svg>
            </div>
            <h2 className="empty-cart-heading">Giỏ hàng của bạn đang trống</h2>
            <p className="empty-cart-text">
              Hãy khám phá các sản phẩm và thêm những món bạn yêu thích vào giỏ hàng.
            </p>
            <Link href="/products" className="btn-primary inline-flex px-8 py-3.5 rounded-xl font-semibold">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          /* 4. MAIN CART LAYOUT (Two-column layout: 65% / 35%) */
          <div className="cart-layout">
            {/* LEFT: Cart item list (65%) */}
            <div className="cart-items-wrapper">
              {cart.items.map((item) => {
                const meta = getProductMeta({ id: item.productId, name: item.name, price: item.price });
                const itemColor = meta.colors && meta.colors.length > 0 ? meta.colors[0] : 'Tiêu chuẩn';
                const itemSize = meta.sizes && meta.sizes.length > 0 ? meta.sizes[0] : 'M';
                const isSavedWishlist = wishlistItems.includes(item.productId);

                return (
                  <article className="cart-item-modern" key={item.productId}>
                    {/* 5. PRODUCT IMAGE (120x120, square, neutral background, 12px radius) */}
                    <div className="cart-item-media">
                      <Link href={`/products/${item.productId}`} className="block w-full h-full">
                        <Image
                          src={meta.mainImage}
                          alt={item.name}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover rounded-xl"
                          unoptimized
                        />
                      </Link>
                    </div>

                    {/* PRODUCT INFORMATION */}
                    <div className="cart-item-center">
                      <span className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-wider mb-1">
                        {meta.category}
                      </span>
                      <Link href={`/products/${item.productId}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <div className="cart-item-variants">
                        <span>Color: {itemColor}</span>
                        <span>•</span>
                        <span>Size: {itemSize}</span>
                      </div>
                      <div className="cart-item-unit-price">
                        <strong>{Number(item.price).toLocaleString('vi-VN')}đ</strong>
                      </div>
                    </div>

                    {/* RIGHT CONTROLS: Quantity [-] 1 [+] & Total & Remove/Wishlist */}
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

                      {/* Total Item Price */}
                      <div className="cart-item-total-col">
                        <span className="cart-item-total-price">
                          {Number(item.subtotal).toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      {/* Action Icons */}
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
                            if (window.confirm(`Bạn muốn xóa "${item.name}" khỏi giỏ hàng?`)) {
                              removeMutation.mutate(item.productId);
                            }
                          }}
                          aria-label="Xóa sản phẩm"
                          title="Xóa khỏi giỏ hàng"
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

              {/* 11. CONTINUE SHOPPING LINK */}
              <div className="pt-4">
                <Link
                  href="/products"
                  className="text-sm font-semibold text-[#171717] hover:underline inline-flex items-center gap-2"
                >
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* RIGHT: Order summary (35%) - No free shipping banner per user instruction */}
            <aside className="order-summary-sidebar">
              <div className="order-summary-box">
                {/* 7. ORDER SUMMARY */}
                <h2 className="order-summary-title">Đơn hàng</h2>

                <div className="summary-line-row">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#171717]">
                    {Number(cart.totalPrice).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="summary-line-row">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-[#171717]">
                    {shippingCost === 0 ? '0đ' : `${Number(shippingCost).toLocaleString('vi-VN')}đ`}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="summary-line-row discount-row text-[#10B981]">
                    <span>Giảm giá ({appliedPromo})</span>
                    <span>-{Number(discountAmount).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                <div className="summary-divider-line" />

                <div className="summary-total-row">
                  <span className="text-base font-bold text-[#171717]">Tổng cộng</span>
                  <span className="summary-total-price text-2xl font-extrabold text-[#171717]">
                    {Number(finalTotal).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* 8. PROMO CODE */}
                <div className="mt-5">
                  <label htmlFor="cart-promo-input" className="block text-xs font-semibold text-[#171717] mb-2 uppercase tracking-wider">
                    Mã giảm giá
                  </label>
                  <form onSubmit={handleApplyPromo} className="promo-code-wrap">
                    <input
                      id="cart-promo-input"
                      type="text"
                      placeholder="Nhập mã giảm giá (VD: MOC20)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="promo-input"
                    />
                    <button type="submit" className="btn-promo-apply">
                      Áp dụng
                    </button>
                  </form>
                </div>

                {/* 10. CHECKOUT BUTTON */}
                <button
                  type="button"
                  className="btn-checkout-primary w-full mt-6 py-4 bg-[#171717] text-white rounded-xl font-bold hover:bg-[#333333] transition-all"
                  onClick={handleCheckout}
                >
                  Tiến hành thanh toán
                </button>

                {/* SECURE CHECKOUT INDICATOR */}
                <div className="secure-checkout-indicator text-center mt-3 text-xs text-[#6B6B6B] flex items-center justify-center gap-1.5">
                  <span>🔒 Thanh toán an toàn và bảo mật</span>
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
