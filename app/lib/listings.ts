import type { Listing } from "@/app/types/listing";

// GCFIRY65OQE7DFP5KLNS2PF2LVZMUZYJX4OZIEQ36N2IQANUB5XVYOJR là ví chủ nhà mẫu (demo host wallet).
// Đây là public key Ed25519 hợp lệ trên mạng Stellar.
// Kết nối địa chỉ này trong Freighter để truy cập Cổng quản lý Chủ nhà.
export const DEMO_HOST_WALLET = "GCFIRY65OQE7DFP5KLNS2PF2LVZMUZYJX4OZIEQ36N2IQANUB5XVYOJR";

// Danh sách ảnh mẫu lưu trú cao cấp chuẩn bị sẵn
export const SAMPLE_STAY_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", // Biệt thự hồ bơi vô cực mặt biển
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", // Dinh thự sân vườn thiền phong cách Á Đông
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", // Nhà phố kiến trúc Pháp cổ kính
  "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80", // Chalet gỗ sườn núi săn mây
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", // Biệt thự sinh thái rừng nhiệt đới biển
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80", // Caldera suite vách đá biển
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", // Dinh thự hồ bơi đương đại tối giản
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", // Biệt thự kính ven hồ sang trọng
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", // Bungalow trên mặt nước hoàng hôn
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", // Khu nghỉ dưỡng villa tre nhiệt đới
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", // Resort biển dừa và ghế tắm nắng cao cấp
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", // Khách sạn boutique sườn đồi hiện đại
];

// Ảnh dự phòng mặc định khi tải ảnh thất bại
export const DEFAULT_FALLBACK_IMAGE = SAMPLE_STAY_IMAGES[0];

/**
 * Trả về ảnh mẫu lưu trú ổn định và xác định (deterministic) dựa trên mã phòng hoặc ID.
 * Đảm bảo cùng một phòng luôn hiển thị cùng một ảnh mẫu ổn định khi tải lại trang hoặc mở trên thiết bị khác.
 */
export function getStableSampleImage(identifier: string, offset = 0): string {
  if (!identifier) return DEFAULT_FALLBACK_IMAGE;
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash + offset) % SAMPLE_STAY_IMAGES.length;
  return SAMPLE_STAY_IMAGES[index];
}

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "listing-1",
    roomId: "1001",
    ownerWallet: DEMO_HOST_WALLET,
    escrowAmount: "125000000",
    nightlyPriceXlm: 12.5,
    title: "Biệt thự biển Mỹ Khê",
    location: "Sơn Trà, Đà Nẵng, Việt Nam",
    description:
      "Biệt thự mặt biển thượng lưu với hồ bơi vô cực riêng, tầm nhìn toàn cảnh vịnh biển Đà Nẵng. Đặt phòng bảo chứng bằng hợp đồng ký quỹ thông minh Soroban.",
    amenities: ["Hồ bơi vô cực", "Tầm nhìn biển trực diện", "Bãi tắm riêng", "Bếp cao cấp", "Quản gia riêng"],
    hostName: "Casa Danang Luxury",
    hostSince: "2024",
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    availability: "Available",
    gradientFrom: "rgba(245,158,11,0.55)",
    gradientTo: "rgba(8,47,73,0.9)",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    rating: 4.98,
    reviewCount: 38,
  },
  {
    id: "listing-2",
    roomId: "1002",
    ownerWallet: DEMO_HOST_WALLET,
    escrowAmount: "87500000",
    nightlyPriceXlm: 8.75,
    title: "Dinh thự vườn thiền phố cổ",
    location: "Phố cổ Hội An, Quảng Nam",
    description:
      "Nhà vườn truyền thống phong cách Đông Dương với sân vườn nhiệt đới thanh tịnh, phòng thưởng trà đạo, cách trung tâm phố cổ Hội An vài bước chân.",
    amenities: ["Vườn thiền", "Phòng thưởng trà", "Xe đạp dạo phố", "Bồn tắm sục", "Bếp mở"],
    hostName: "Hội An Heritage Stays",
    hostSince: "2023",
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    availability: "Available",
    gradientFrom: "rgba(167,139,250,0.5)",
    gradientTo: "rgba(30,27,75,0.9)",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    rating: 4.95,
    reviewCount: 29,
  },
  {
    id: "listing-3",
    roomId: "1003",
    ownerWallet: DEMO_HOST_WALLET,
    escrowAmount: "70000000",
    nightlyPriceXlm: 7.0,
    title: "Nhà phố cổ điển Hoàn Kiếm",
    location: "Hoàn Kiếm, Hà Nội, Việt Nam",
    description:
      "Nhà phố kiến trúc Pháp cổ kính được phục chế cao cấp giữa lòng phố cổ Hà Nội. Ban công ngắm phố đi bộ, phòng đọc sách và gần hồ Hoàn Kiếm.",
    amenities: ["Ban công ngắm phố", "Gần Hồ Gươm", "Hầm rượu", "Góc làm việc tiện nghi", "Đỗ xe an toàn"],
    hostName: "Hanoi Old Quarter Estates",
    hostSince: "2024",
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    availability: "Available",
    gradientFrom: "rgba(251,146,60,0.5)",
    gradientTo: "rgba(67,20,7,0.9)",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    rating: 4.92,
    reviewCount: 44,
  },
  {
    id: "listing-4",
    roomId: "1004",
    ownerWallet: DEMO_HOST_WALLET,
    escrowAmount: "200000000",
    nightlyPriceXlm: 20.0,
    title: "Chalet gỗ mây núi Sa Pa",
    location: "Mường Hoa, Sa Pa, Lào Cai",
    description:
      "Chalet gỗ sang trọng trên sườn núi săn mây với tầm nhìn trọn vẹn đỉnh Fansipan. Phòng xông hơi riêng, lò sưởi ấm cúng và quản gia riêng chu đáo.",
    amenities: ["Săn mây đỉnh núi", "Phòng xông hơi riêng", "Lò sưởi ấm", "Ban công toàn cảnh", "Bữa sáng đặc sản"],
    hostName: "Sa Pa Cloud Villas",
    hostSince: "2023",
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    availability: "Available",
    gradientFrom: "rgba(147,197,253,0.45)",
    gradientTo: "rgba(15,23,42,0.9)",
    imageUrl: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",
    rating: 5.0,
    reviewCount: 52,
  },
  {
    id: "listing-5",
    roomId: "1005",
    ownerWallet: DEMO_HOST_WALLET,
    escrowAmount: "105000000",
    nightlyPriceXlm: 10.5,
    title: "Biệt thự rừng nhiệt đới Phú Quốc",
    location: "Gành Dầu, Phú Quốc, Kiên Giang",
    description:
      "Biệt thự sinh thái cao cấp nằm ẩn mình cạnh bãi biển cát trắng hoang sơ, hồ bơi riêng giữa tán rừng nhiệt đới. Hợp đồng Soroban đảm bảo 100% minh bạch.",
    amenities: ["Bãi biển riêng", "Hồ bơi nhiệt đới", "Sàn tập yoga", "Võng thư giãn", "Đầu bếp hải sản"],
    hostName: "Phu Quoc Sanctuary",
    hostSince: "2024",
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    availability: "Available",
    gradientFrom: "rgba(52,211,153,0.45)",
    gradientTo: "rgba(6,78,59,0.9)",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    rating: 4.89,
    reviewCount: 21,
  },
  {
    id: "listing-6",
    roomId: "1006",
    ownerWallet: DEMO_HOST_WALLET,
    escrowAmount: "157500000",
    nightlyPriceXlm: 15.75,
    title: "Caldera Suite vách đá Nha Trang",
    location: "Bãi Tiên, Nha Trang, Khánh Hòa",
    description:
      "Suite vách đá kiến trúc hang vòm nhìn thẳng ra biển xanh ngọc bích. Bể ngâm vô cực ngoài trời ngắm hoàng hôn tuyệt đẹp, không qua bất kỳ khâu trung gian nào.",
    amenities: ["Bể ngâm vô cực", "Tầm nhìn vịnh 360°", "Kiến trúc vách đá", "Ban công hoàng hôn", "Quản gia 24/7"],
    hostName: "Nha Trang Bay Escapes",
    hostSince: "2023",
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    availability: "Available",
    gradientFrom: "rgba(251,191,36,0.5)",
    gradientTo: "rgba(30,27,75,0.9)",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    rating: 4.97,
    reviewCount: 65,
  },
];
