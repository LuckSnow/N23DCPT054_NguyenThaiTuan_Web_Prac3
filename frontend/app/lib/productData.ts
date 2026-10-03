export type ProductDetails = {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  colors: string[];
  sizes: string[];
  reviewsCount: number;
  rating: number;
  mainImage: string;
};

export const defaultProductData: Record<number, Omit<ProductDetails, 'id' | 'name' | 'price' | 'mainImage'>> = {
  1: {
    category: 'Thời trang',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Áo thun chất liệu 100% cotton chải kỹ thoáng mát, thấm hút mồ hôi tối đa. Phom dáng regular fit thanh lịch, phù hợp cho mọi hoạt động hàng ngày.',
    colors: ['Trắng', 'Đen', 'Xám'],
    sizes: ['S', 'M', 'L', 'XL'],
    reviewsCount: 124,
    rating: 4.8,
  },
  2: {
    category: 'Thời trang',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80', // folded Levi's jeans in Photo 3
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Quần jeans slim-fit màu xanh indigo cổ điển. Chất liệu denim cao cấp pha sợi co giãn nhẹ giúp cử động thoải mái và giữ dáng chuẩn sau nhiều lần giặt.',
    colors: ['Xanh Indigo', 'Đen tuyền', 'Xanh retro'],
    sizes: ['29', '30', '31', '32', '33'],
    reviewsCount: 98,
    rating: 4.9,
  },
  3: {
    category: 'Thời trang',
    images: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Áo sơ mi dệt từ sợi linen tự nhiên mềm mại, thoáng mát và thấm hút tuyệt đối. Thiết kế cổ trụ trẻ trung, thích hợp cho cả công sở và dạo phố cuối tuần.',
    colors: ['Trắng tinh khôi', 'Be nhạt', 'Xanh pastel'],
    sizes: ['M', 'L', 'XL'],
    reviewsCount: 86,
    rating: 4.7,
  },
  4: {
    category: 'Thời trang',
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Áo khoác bomber 2 lớp cản gió nhẹ và giữ ấm tốt. Thiết kế bo gấu năng động, khóa kéo kim loại bền bỉ cùng túi sườn tiện dụng.',
    colors: ['Rêu phong', 'Đen nhám', 'Xanh navy'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    reviewsCount: 112,
    rating: 4.8,
  },
  5: {
    category: 'Giày dép',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', // Photo 2 Giày dép
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Đôi sneaker mang âm hưởng retro thể thao với tông màu da bò ấm áp. Thân giày da lộn kết hợp đế cao su non êm ái, bám đường cực tốt trên mọi địa hình.',
    colors: ['Nâu da bò', 'Trắng kem', 'Đen retro'],
    sizes: ['39', '40', '41', '42', '43'],
    reviewsCount: 145,
    rating: 4.9,
  },
  6: {
    category: 'Túi xách',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', // Photo 2 Túi xách
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Túi xách da dập vân chần quả trám sang trọng. Khóa kim loại mạ vàng sáng bóng, dây đeo xích luồn da tùy chỉnh độ dài linh hoạt.',
    colors: ['Đen huyền bí', 'Be thanh lịch', 'Đỏ Bordeaux'],
    sizes: ['Tiêu chuẩn'],
    reviewsCount: 74,
    rating: 4.8,
  },
  7: {
    category: 'Phụ kiện',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', // Photo 2 Phụ kiện
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Đồng hồ thạch anh thiết kế mặt tròn tối giản, kim thanh mảnh tinh xảo. Kính khoáng chống xước nhẹ kết hợp dây da thật mềm mại thoáng khí.',
    colors: ['Đen tối giản', 'Nâu cổ điển', 'Bạc kim loại'],
    sizes: ['Mặt 40mm', 'Mặt 36mm'],
    reviewsCount: 63,
    rating: 4.7,
  },
  8: {
    category: 'Giày dép',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', // Red running shoe
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Giày chạy bộ với công nghệ đệm khí đàn hồi cao, giảm phản lực khi tiếp đất. Thân dệt sợi Flyknit co giãn và thông thoáng tuyệt đối.',
    colors: ['Đỏ rực rỡ', 'Đen tuyền', 'Xám khói'],
    sizes: ['39', '40', '41', '42', '43'],
    reviewsCount: 180,
    rating: 4.9,
  },
};

export function getProductMeta(product: {
  id: number;
  name?: string;
  price?: number;
  category?: string;
  images?: string[];
  description?: string;
  colors?: string[];
  sizes?: string[];
}): ProductDetails {
  const fallback = defaultProductData[product.id] || {
    category: product.category || 'Thời trang',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Sản phẩm cao cấp từ MỘC Studio, thiết kế tối giản tinh tế mang lại sự thoải mái tối đa.',
    colors: ['Đen', 'Trắng', 'Xám'],
    sizes: ['S', 'M', 'L', 'XL'],
    reviewsCount: 50,
    rating: 4.8,
  };

  const images = product.images && product.images.length > 0 ? product.images : fallback.images;
  const category = product.category || fallback.category;
  const description = product.description || fallback.description;
  const colors = product.colors && product.colors.length > 0 ? product.colors : fallback.colors;
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : fallback.sizes;
  const reviewsCount = fallback.reviewsCount;
  const rating = fallback.rating;

  return {
    id: product.id,
    name: product.name || 'Sản phẩm MỘC Studio',
    price: product.price !== undefined ? product.price : 450000,
    images,
    category,
    description,
    colors,
    sizes,
    reviewsCount,
    rating,
    mainImage: images[0] || 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
  };
}
