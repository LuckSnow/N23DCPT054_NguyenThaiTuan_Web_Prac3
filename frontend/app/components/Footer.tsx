import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer-modern">
      <div className="footer-top-grid">
        <div className="footer-col brand-col">
          <Link href="/" className="logo-brand">
            <span className="logo-mark">m.</span>
            <span className="logo-text">
              MỘC <small>STUDIO</small>
            </span>
          </Link>
          <p className="brand-desc">
            Thời trang thường ngày được tuyển chọn bằng sự tinh giản và chỉn chu. Đồng hành cùng bạn trong từng khoảnh khắc giản dị nhất.
          </p>
          <div className="footer-social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              Facebook
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
              TikTok
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3>MUA SẮM</h3>
          <ul>
            <li><Link href="/products">Tất cả sản phẩm</Link></li>
            <li><Link href="/products">Hàng mới về</Link></li>
            <li><Link href="/products">Sản phẩm bán chạy</Link></li>
            <li><Link href="/#categories">Bộ sưu tập thời trang</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>VỀ CHÚNG TÔI</h3>
          <ul>
            <li><Link href="/#about">Câu chuyện thương hiệu</Link></li>
            <li><Link href="/#about">Hành trình chất liệu</Link></li>
            <li><Link href="/#about">Mạng lưới cửa hàng</Link></li>
            <li><Link href="/#about">Cơ hội nghề nghiệp</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>HỖ TRỢ</h3>
          <ul>
            <li><Link href="/cart">Giỏ hàng của bạn</Link></li>
            <li><a href="#about">Chính sách giao hàng</a></li>
            <li><a href="#about">Đổi trả trong 7 ngày</a></li>
            <li><a href="#about">Câu hỏi thường gặp</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© 2026 MỘC STUDIO. All rights reserved.</span>
        <span>Dự án thực hành Lab 3 Fullstack Next.js & Express — Sinh viên: Nguyễn Thái Tuấn (N23DCPT054)</span>
      </div>
    </footer>
  );
}
