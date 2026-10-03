'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

type CartResponse = {
  items: Array<{ productId: number; quantity: number }>;
  totalQuantity: number;
  totalPrice: number;
};

export default function Navbar({ onSearch }: { onSearch?: (query: string) => void }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const { data: cart = { items: [], totalQuantity: 0, totalPrice: 0 } } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get<CartResponse>('/api/cart');
      return res.data;
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
  };

  return (
    <>
      <div className="announcement-bar">
        <span>Giao hàng miễn phí cho đơn hàng từ 500.000₫</span>
        <span className="announcement-sub">MỘC Studio — Phong cách tối giản, tinh tế cho ngày thường</span>
      </div>

      <header className="site-header-modern">
        <div className="header-inner">
          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            type="button"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="1.8">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="logo-brand" aria-label="MỘC Studio - Trang chủ">
            <span className="logo-mark">m.</span>
            <span className="logo-text">
              MỘC <small>STUDIO</small>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>
              Trang chủ
            </Link>
            <Link href="/products" className={pathname.startsWith('/products') ? 'active' : ''}>
              Sản phẩm
            </Link>
            <Link href="/#categories">
              Danh mục
            </Link>
            <Link href="/#about">
              Về chúng tôi
            </Link>
          </nav>

          {/* Header Right Actions */}
          <div className="header-actions-group">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="header-search-form">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchVal}
                  autoFocus
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                    if (onSearch) onSearch(e.target.value);
                  }}
                  className="search-input-field"
                />
                <button
                  type="button"
                  className="search-close-btn"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchVal('');
                    if (onSearch) onSearch('');
                  }}
                  aria-label="Đóng tìm kiếm"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="action-icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Tìm kiếm"
                title="Tìm kiếm sản phẩm"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              </button>
            )}

            {/* Wishlist Icon */}
            <Link href="/#products" className="action-icon-btn" title="Danh sách yêu thích">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>

            {/* Cart Icon with real-time Badge */}
            <Link href="/cart" className="cart-badge-link" aria-label={`Giỏ hàng, ${cart.totalQuantity} món`} title="Giỏ hàng">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="cart-count-pill">{cart.totalQuantity}</span>
            </Link>

            {/* User Icon */}
            <button type="button" className="action-icon-btn user-btn" aria-label="Tài khoản" title="Tài khoản cá nhân">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={pathname === '/' ? 'active' : ''}>
              Trang chủ
            </Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className={pathname.startsWith('/products') ? 'active' : ''}>
              Sản phẩm
            </Link>
            <Link href="/#categories" onClick={() => setMobileMenuOpen(false)}>
              Danh mục
            </Link>
            <Link href="/#about" onClick={() => setMobileMenuOpen(false)}>
              Về chúng tôi
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
              Giỏ hàng ({cart.totalQuantity})
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
