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
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
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
    category: 'Thời trang',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Quần short chất kaki thun dày dặn co giãn nhẹ, cạp chun thoải mái kết hợp dây rút tiện lợi. Thích hợp dạo phố, thể thao hoặc du lịch.',
    colors: ['Be sáng', 'Đen', 'Xanh rêu'],
    sizes: ['M', 'L', 'XL'],
    reviewsCount: 65,
    rating: 4.8,
  },
  6: {
    category: 'Thời trang',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578768079052-aa76e520036c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Áo hoodie nỉ lót bông mềm mại giữ nhiệt ấm áp. Mũ trùm 2 lớp đứng form kèm túi kangaroo tiện ích phía trước.',
    colors: ['Xám khói', 'Đen', 'Trắng sữa'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    reviewsCount: 88,
    rating: 4.9,
  },
  7: {
    category: 'Giày dép',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
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
  8: {
    category: 'Giày dép',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
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
  9: {
    category: 'Giày dép',
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Giày lười da bò cao cấp dập may thủ công, phom dáng ôm chân lịch sự. Lót đệm da thật êm ái, thích hợp cho quý ông công sở hiện đại.',
    colors: ['Đen', 'Nâu sáp', 'Nâu đậm'],
    sizes: ['39', '40', '41', '42', '43'],
    reviewsCount: 77,
    rating: 4.8,
  },
  10: {
    category: 'Giày dép',
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Sandal phong cách tối giản với quai dù chịu lực và đế đệm EVA đúc liền khối. Bền bỉ, chống trơn trượt hiệu quả trong mọi điều kiện thời tiết.',
    colors: ['Đen', 'Xám rêu'],
    sizes: ['39', '40', '41', '42'],
    reviewsCount: 52,
    rating: 4.7,
  },
  11: {
    category: 'Túi xách',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
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
  12: {
    category: 'Túi xách',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Túi tote vải canvas thô mộc dày dặn, thân thiện với môi trường. Sức chứa lớn đựng vừa laptop 14 inch và tập vở hàng ngày.',
    colors: ['Trắng ngà', 'Đen', 'Xanh rêu'],
    sizes: ['One Size'],
    reviewsCount: 91,
    rating: 4.8,
  },
  13: {
    category: 'Túi xách',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Balo thiết kế gọn gàng, chất vải Oxford kháng nước chuẩn IPX4. Ngăn chống sốc bảo vệ laptop 15.6 inch kèm cổng sạc USB thông minh.',
    colors: ['Đen', 'Xám đậm', 'Xanh navy'],
    sizes: ['Tiêu chuẩn'],
    reviewsCount: 110,
    rating: 4.9,
  },
  14: {
    category: 'Túi xách',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Ví dài cầm tay chất liệu da Saffiano chống xước và kháng nước nhẹ. Nhiều ngăn tiện lợi đựng điện thoại, thẻ ngân hàng và tiền mặt.',
    colors: ['Đen', 'Nâu bò', 'Xanh cổ vịt'],
    sizes: ['Tiêu chuẩn'],
    reviewsCount: 48,
    rating: 4.8,
  },
  15: {
    category: 'Phụ kiện',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
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
  16: {
    category: 'Phụ kiện',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Mũ nón lưỡi trai chất vải cotton 100% dày dặn, khóa cài kim loại tùy chỉnh phía sau. Thiết kế nón phom cứng cáp che nắng tốt.',
    colors: ['Đen', 'Be kem', 'Xanh navy'],
    sizes: ['Freesize'],
    reviewsCount: 82,
    rating: 4.8,
  },
  17: {
    category: 'Phụ kiện',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Thắt lưng da bò thật 100% nguyên miếng, bề mặt xử lý bóng mịn chống nứt gãy. Khóa kim hợp kim đúc nguyên khối chống gỉ sét bền bỉ.',
    colors: ['Nâu sáp', 'Đen tuyền'],
    sizes: ['110cm', '120cm'],
    reviewsCount: 56,
    rating: 4.8,
  },
  18: {
    category: 'Phụ kiện',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Kính mát phi công tròng phân cực Polarized chống lóa và ngăn 100% tia UV400. Khung gọng kim loại siêu nhẹ êm ái khi đeo lâu.',
    colors: ['Đen khói', 'Xanh rêu', 'Trà nâu'],
    sizes: ['Tiêu chuẩn'],
    reviewsCount: 71,
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
    images: product.images && product.images.length > 0 ? product.images : [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
    ],
    description: product.description || 'Sản phẩm cao cấp từ MỘC Studio, thiết kế tối giản tinh tế mang lại sự thoải mái tối đa.',
    colors: product.colors && product.colors.length > 0 ? product.colors : ['Đen', 'Trắng', 'Xám'],
    sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'],
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
