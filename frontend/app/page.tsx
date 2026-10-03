'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '@/lib/api';

type Product = {
  id: number;
  name: string;
  price: number;
};

const imageOptions = [
  { src: 'photo-1521572163474-6864f9cf17ab', tone: 'sand', label: 'Áo thun' },
  { src: 'photo-1542272604-787c3835535d', tone: 'sky', label: 'Quần jeans' },
  { src: 'photo-1529139574466-a303027c1d8b', tone: 'rose', label: 'Thời trang' },
  { src: 'photo-1523381210434-271e8be1f52b', tone: 'olive', label: 'Trang phục' },
  { src: 'photo-1515886657613-9f3515b0c78f', tone: 'lilac', label: 'Phong cách' },
  { src: 'photo-1525507119028-ed4c629a60a3', tone: 'peach', label: 'Bộ sưu tập' },
];

function ProductIcon({ type }: { type: 'bag' | 'search' | 'arrow' | 'close' }) {
  if (type === 'bag') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>;
  }
  if (type === 'search') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></svg>;
  }
  if (type === 'close') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h14m-5.5-5.5L18.5 12 13 17.5" /></svg>;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get<Product[]>('/api/products');
      setProducts(data);
    } catch {
      toast.error('Không thể kết nối server!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };
    void loadProducts();
  }, [fetchProducts]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    if (!query) return products;
    return products.filter((product) => product.name.toLocaleLowerCase('vi').includes(query));
  }, [products, search]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const numericPrice = Number(price);

    if (!cleanName || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error('Vui lòng nhập tên và giá hợp lệ.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post<Product>('/api/products', {
        name: cleanName,
        price: numericPrice,
      });
      setProducts((current) => [...current, data]);
      setName('');
      setPrice('');
      setFormOpen(false);
      toast.success('Thêm sản phẩm thành công!');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message || 'Không thể kết nối server!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá?')) return;

    const previousProducts = products;
    setProducts((current) => current.filter((product) => product.id !== id));

    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Đã xoá sản phẩm', { icon: '🗑️' });
    } catch {
      setProducts(previousProducts);
      toast.error('Xoá thất bại, thử lại!');
      void fetchProducts();
    }
  };

  return (
    <main className="store-shell">
      <div className="announcement-bar">
        <span>Giao hàng miễn phí cho đơn từ 500.000₫</span>
        <span className="announcement-right">Một chút dịu dàng, mỗi ngày <span aria-hidden="true">✳</span></span>
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="MỘC Studio — Trang chủ">
          <span className="brand-mark">m.</span>
          <span className="brand-name">MỘC <span>STUDIO</span></span>
        </a>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <a className="nav-active" href="#home">Trang chủ</a>
          <a href="#products">Sản phẩm</a>
          <a href="#story">Câu chuyện</a>
        </nav>
        <div className="header-actions">
          <label className="header-search">
            <ProductIcon type="search" />
            <input aria-label="Tìm sản phẩm" placeholder="Tìm sản phẩm..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <a className="cart-link" href="#products" aria-label={`Giỏ hàng, ${products.length} sản phẩm`}>
            <ProductIcon type="bag" />
            <span>Giỏ hàng</span>
            <b>{products.length}</b>
          </a>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-photo" role="img" aria-label="Bộ sưu tập thời trang MỘC Studio">
          <div className="hero-note"><span className="note-dot" /> Bộ sưu tập mới · Thu 2025</div>
          <div className="hero-caption"><span>CHẠM VÀO</span><br />NHỮNG ĐIỀU<br /><i>giản đơn</i></div>
          <div className="hero-bottom"><span>Trang phục cho những ngày rất bình thường.</span><a href="#products">Khám phá bộ sưu tập <ProductIcon type="arrow" /></a></div>
          <div className="hero-index">01 <span>/</span> 04</div>
        </div>
        <div className="hero-side">
          <span className="side-kicker">MỘC STUDIO — SINCE 2020</span>
          <span className="side-line" />
          <span className="side-vertical">ĐẸP THEO CÁCH CỦA BẠN</span>
          <span className="side-spark">✳</span>
        </div>
      </section>

      <section className="benefits" aria-label="Thông tin cửa hàng">
        <div><span className="benefit-icon">✳</span><span><strong>Chất liệu chọn lọc</strong><small>Êm dịu trên làn da</small></span></div>
        <div><span className="benefit-icon">↗</span><span><strong>Giao hàng toàn quốc</strong><small>Đồng giá chỉ từ 25K</small></span></div>
        <div><span className="benefit-icon">♡</span><span><strong>Đổi trả dễ dàng</strong><small>Trong vòng 7 ngày</small></span></div>
        <div><span className="benefit-icon">♧</span><span><strong>Mặc đẹp mỗi ngày</strong><small>Tự tin theo cách riêng</small></span></div>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div><span className="eyebrow">ĐƯỢC YÊU THÍCH</span><h1>Chọn món bạn <i>thương.</i></h1><p>Những thiết kế thoải mái cho nhịp sống mỗi ngày.</p></div>
          <button className="add-product-button" type="button" onClick={() => setFormOpen(true)}>Thêm sản phẩm <span>＋</span></button>
        </div>

        {formOpen && (
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-heading"><div><span className="eyebrow">MỘC STUDIO</span><h2>Thêm sản phẩm mới</h2></div><button className="close-form" type="button" aria-label="Đóng biểu mẫu" onClick={() => setFormOpen(false)}><ProductIcon type="close" /></button></div>
            <label>Tên sản phẩm<input autoFocus required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Áo thun cotton basic" /></label>
            <label>Giá bán (₫)<input required min="1" type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Ví dụ: 150000" /></label>
            <div className="form-actions"><button className="cancel-button" type="button" onClick={() => setFormOpen(false)}>Huỷ</button><button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu sản phẩm'} <ProductIcon type="arrow" /></button></div>
          </form>
        )}

        <div className="product-grid" aria-live="polite">
          {loading ? (
            <div className="empty-state"><span className="loading-dot" /><p>Đang tải sản phẩm...</p></div>
          ) : visibleProducts.length ? visibleProducts.map((product, index) => {
            const image = imageOptions[index % imageOptions.length];
            return (
              <article className="product-card" key={product.id}>
                <div className={`product-image image-${image.tone}`}>
                  <Image src={`https://images.unsplash.com/${image.src}?auto=format&fit=crop&w=720&q=85`} alt={product.name} width={720} height={880} unoptimized />
                  {index === 0 && <span className="product-tag">BÁN CHẠY</span>}
                  <button className="delete-product" type="button" onClick={() => void handleDelete(product.id)} aria-label={`Xoá ${product.name}`}><ProductIcon type="close" /></button>
                  <button className="quick-add" type="button" onClick={() => toast('Tính năng giỏ hàng sẽ được thực hiện theo phần nâng cao của bài lab.', { icon: '✳' })} aria-label={`Thêm ${product.name} vào giỏ`}>＋</button>
                </div>
                <div className="product-details"><div><span className="product-category">{image.label} · MỘC STUDIO</span><h2>{product.name}</h2></div><span className="product-price">{Number(product.price).toLocaleString('vi-VN')}₫</span></div>
                <div className="product-rating"><span>★★★★★</span><small>4.9 <i>·</i> Mộc mạc, dễ mặc</small></div>
              </article>
            );
          }) : (
            <div className="empty-state"><span className="empty-icon">✳</span><h2>{search ? 'Chưa tìm thấy sản phẩm' : 'Bộ sưu tập đang chờ bạn'}</h2><p>{search ? 'Thử tìm với một tên gọi khác nhé.' : 'Thêm sản phẩm đầu tiên để bắt đầu bộ sưu tập.'}</p></div>
          )}
        </div>
        <div className="section-footer"><span>ĐANG CÓ {products.length} THIẾT KẾ</span><a href="#products">Xem tất cả <ProductIcon type="arrow" /></a></div>
      </section>

      <section className="story-band" id="story"><span className="story-flower">✳</span><p>Mặc đẹp không cần dịp.<br /><i>Chỉ cần là chính mình.</i></p><a href="#products">Tìm phong cách của bạn <ProductIcon type="arrow" /></a><span className="story-stamp">MỘC<br /><small>STUDIO · 2025</small></span></section>

      <footer className="site-footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">m.</span><span className="brand-name">MỘC <span>STUDIO</span></span></a><span>Thời trang thường ngày, chọn lọc bằng cả sự dịu dàng.</span><span>© 2025 MỘC STUDIO</span></footer>
    </main>
  );
}
