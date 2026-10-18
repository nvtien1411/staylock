import type { ReservationStage } from "@/app/types/booking";

export const metrics = [
  ["2.8M+ XLM", "Tổng giá trị ký quỹ"],
  ["12.4K", "Lượt đặt phòng an toàn"],
  ["850+", "Biệt thự & chỗ nghỉ cao cấp"],
  ["99.98%", "Tỷ lệ quyết toán chính xác"],
];

export const activity = [
  ["Khóa cọc ký quỹ thành công", "Biệt thự biển Đà Nẵng · 2 phút trước", "+12.5 XLM đã khóa"],
  ["Giải ngân tiền phòng", "Căn hộ Hội An · 8 phút trước", "Đã xác nhận check-in"],
  ["Xác thực ví khách du lịch", "Townhouse Phố Cổ · 14 phút trước", "Chữ ký Freighter hợp lệ"],
  ["Chủ nhà mới gia nhập", "Chalet Mây Sa Pa · 22 phút trước", "Đã sẵn sàng nhận khách"],
];

export const escrowSteps = [
  [
    "01",
    "Khóa tiền cọc an toàn",
    "Tiền cọc của bạn được hợp đồng thông minh Soroban khóa an toàn ngay khi đặt phòng, bảo vệ quyền lợi cả khách và chủ nhà.",
  ],
  [
    "02",
    "Xác nhận nhận phòng tức thì",
    "Điều kiện giải ngân minh bạch tuyệt đối trên sổ cái, loại bỏ hoàn toàn tranh chấp trước khi kỳ nghỉ bắt đầu.",
  ],
  [
    "03",
    "Quyết toán không trung gian",
    "Hệ thống tự động chuyển tiền trực tiếp cho chủ nhà khi hoàn tất kỳ nghỉ, không phí ẩn và không giam tiền.",
  ],
];

export const lifecycleStages: Array<{
  stage: ReservationStage;
  title: string;
  description: string;
}> = [
  {
    stage: "Reserved",
    title: "Tiền cọc đã được bảo vệ",
    description: "Phòng đã được đặt và cơ chế ký quỹ Soroban đang hoạt động an toàn.",
  },
  {
    stage: "Checked In",
    title: "Xác thực nhận phòng thành công",
    description: "Xác nhận khách đã đến nơi an toàn và chuyến đi đang diễn ra.",
  },
  {
    stage: "Completed",
    title: "Quyết toán giải ngân hoàn tất",
    description: "Trả phòng hoàn tất kỳ nghỉ và giải phóng tiền thanh toán cho chủ nhà.",
  },
  {
    stage: "Cancelled",
    title: "Hủy đặt phòng & hoàn cọc",
    description: "Kỳ nghỉ đã đóng và tiền cọc được hoàn trả lại ví theo quy định hợp đồng.",
  },
];
