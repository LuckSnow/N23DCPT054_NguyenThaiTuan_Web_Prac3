'use client';

import React from 'react';
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

export default function CartPage() {
  const queryClient = useQueryClient();

  // Nâng cao 2 & 4: Query giỏ hàng
  const { data: cart = { items: [], totalQuantity: 0, totalPrice: 0 }, isLoading } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get<CartResponse>('/api/cart');
      return res.data;
    },
  });

  // Nâng cao 4: Mutation xoá item khỏi giỏ
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

  // Mutation thêm số lượng
  const addMoreMutation = useMutation({
    mutationFn: (productId: number) => api.post('/api/cart', { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const handleCheckout = () => {
    toast.success('Đặt hàng thành công! MỘC Studio sẽ sớm liên hệ xác nhận đơn hàng.', {
      duration: 4000,
      icon: '🎉',
    });
  };

  const shippingFee = cart.totalPrice >= 500000 || cart.totalPrice === 0 ? 0 : 25000;
  const finalTotal = cart.totalPrice + shippingFee;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navbar />

      <main className="site-container flex-grow cart-container">
        <div className="cart-header">
          <nav className="breadcrumb-nav">
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <span>Giỏ hàng</span>
          </nav>
          <h1>Giỏ hàng của bạn</h1>
          <p>
            Hiện có <strong>{cart.totalQuantity}</strong> món đồ trong giỏ hàng
          </p>
        </div>

        {isLoading ? (
          <div className="empty-box-state">
            <p>Đang tải giỏ hàng...</p>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="empty-cart-card">
            <span className="empty-cart-icon">🛍️</span>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá các thiết kế thời trang tinh tế của MỘC Studio để chọn món bạn thương.</p>
            <Link className="btn-primary" href="/products">
              Khám phá sản phẩm ngay →
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              <div className="cart-table-header">
                <span>Sản phẩm</span>
                <span>Đơn giá</span>
                <span>Số lượng</span>
                <span>Tạm tính</span>
                <span></span>
              </div>

              {cart.items.map((item) => {
                const imgPhoto = imageMap[item.productId] || 'photo-1521572163474-6864f9cf17ab';
                return (
                  <div className="cart-item-row" key={item.productId}>
                    <div className="cart-item-info">
                      <div className="cart-item-thumb">
                        <Image
                          src={`https://images.unsplash.com/${imgPhoto}?auto=format&fit=crop&w=240&q=80`}
                          alt={item.name}
                          width={80}
                          height={100}
                          unoptimized
                        />
                      </div>
                      <div>
                        <h3>{item.name}</h3>
                        <span className="cart-item-code">Mã SP: #{item.productId}</span>
                      </div>
                    </div>

                    <div className="cart-item-price">
                      {Number(item.price).toLocaleString('vi-VN')}₫
                    </div>

                    <div className="cart-item-qty">
                      <span className="qty-badge">{item.quantity}</span>
                      <button
                        className="qty-plus-btn"
                        onClick={() => addMoreMutation.mutate(item.productId)}
                        title="Tăng số lượng"
                        type="button"
                      >
                        ＋
                      </button>
                    </div>

                    <div className="cart-item-subtotal">
                      {Number(item.subtotal).toLocaleString('vi-VN')}₫
                    </div>

                    <div className="cart-item-remove">
                      <button
                        className="remove-btn"
                        onClick={() => removeMutation.mutate(item.productId)}
                        title="Xoá khỏi giỏ"
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="cart-bottom-actions">
                <Link className="back-link" href="/products">
                  ← Tiếp tục chọn thêm sản phẩm
                </Link>
              </div>
            </div>

            <aside className="order-summary-card">
              <h2>Tóm tắt đơn hàng</h2>
              <div className="summary-row">
                <span>Tổng tiền hàng:</span>
                <span>{Number(cart.totalPrice).toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="free-shipping">MIỄN PHÍ</strong>
                  ) : (
                    `${Number(shippingFee).toLocaleString('vi-VN')}₫`
                  )}
                </span>
              </div>
              {cart.totalPrice < 500000 && (
                <div className="shipping-hint">
                  Mua thêm {Number(500000 - cart.totalPrice).toLocaleString('vi-VN')}₫ để được <strong>FREESHIP</strong>
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span>Tổng thanh toán:</span>
                <strong>{Number(finalTotal).toLocaleString('vi-VN')}₫</strong>
              </div>
              <button className="checkout-btn" onClick={handleCheckout} type="button">
                Tiến hành đặt hàng
              </button>
              <div className="guarantees">
                <div>✓ Cam kết hàng chính hãng 100%</div>
                <div>✓ Hỗ trợ đổi trả trong 30 ngày</div>
                <div>✓ Thanh toán khi nhận hàng (COD)</div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
