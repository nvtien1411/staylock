import streamlit as st
import datetime
import math
import hashlib

# Cấu hình giao diện Streamlit
st.set_page_config(
    page_title="StayLock — Giao thức ký quỹ du lịch thông minh",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── HẰNG SỐ & DỮ LIỆU GỐC ─────────────────────────────────────────────────────────────

SOROBAN_CONTRACT_ID = "CDMSD7ZXERDCSRA5ENB2FDPI45FW4EMC4J6LAEM4BWSKMZFZ7SGLJ3RO"
DEMO_HOST_WALLET = "GCFIRY65OQE7DFP5KLNS2PF2LVZMUZYJX4OZIEQ36N2IQANUB5XVYOJR"
STELLAR_EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx/"

SAMPLE_STAY_IMAGES = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",  # Biệt thự hồ bơi vô cực mặt biển
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",  # Dinh thự sân vườn thiền phong cách Á Đông
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",  # Nhà phố kiến trúc Pháp cổ kính
    "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",  # Chalet gỗ sườn núi săn mây
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",  # Biệt thự sinh thái rừng nhiệt đới biển
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",  # Caldera suite vách đá biển
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",  # Dinh thự hồ bơi đương đại tối giản
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",  # Biệt thự kính ven hồ sang trọng
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",  # Bungalow trên mặt nước hoàng hôn
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",  # Khu nghỉ dưỡng villa tre nhiệt đới
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",  # Resort biển dừa cao cấp
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",  # Khách sạn boutique sườn đồi hiện đại
]

DEFAULT_FALLBACK_IMAGE = SAMPLE_STAY_IMAGES[0]

def get_stable_sample_image(identifier: str, offset: int = 0) -> str:
    """Thuật toán băm xác định gán ảnh mẫu lưu trú ổn định trên mọi thiết bị và mọi lần tải lại."""
    if not identifier:
        return DEFAULT_FALLBACK_IMAGE
    hash_int = int(hashlib.md5(identifier.encode("utf-8")).hexdigest(), 16)
    idx = (hash_int + offset) % len(SAMPLE_STAY_IMAGES)
    return SAMPLE_STAY_IMAGES[idx]

INITIAL_MOCK_LISTINGS = [
    {
        "id": "listing-1",
        "roomId": "1001",
        "ownerWallet": DEMO_HOST_WALLET,
        "escrowAmount": 12.5,
        "nightlyPriceXlm": 12.5,
        "title": "Biệt thự biển Mỹ Khê",
        "location": "Sơn Trà, Đà Nẵng, Việt Nam",
        "description": "Biệt thự mặt biển thượng lưu với hồ bơi vô cực riêng, tầm nhìn toàn cảnh vịnh biển Đà Nẵng. Đặt phòng bảo chứng bằng hợp đồng ký quỹ thông minh Soroban.",
        "amenities": ["Hồ bơi vô cực", "Tầm nhìn biển trực diện", "Bãi tắm riêng", "Bếp cao cấp", "Quản gia riêng"],
        "hostName": "Casa Danang Luxury",
        "hostSince": "2024",
        "maxGuests": 6,
        "bedrooms": 3,
        "bathrooms": 2,
        "availability": "Available",
        "imageUrl": SAMPLE_STAY_IMAGES[0],
        "rating": 4.98,
        "reviewCount": 38,
    },
    {
        "id": "listing-2",
        "roomId": "1002",
        "ownerWallet": DEMO_HOST_WALLET,
        "escrowAmount": 8.75,
        "nightlyPriceXlm": 8.75,
        "title": "Dinh thự vườn thiền phố cổ",
        "location": "Phố cổ Hội An, Quảng Nam",
        "description": "Nhà vườn truyền thống phong cách Đông Dương với sân vườn nhiệt đới thanh tịnh, phòng thưởng trà đạo, cách trung tâm phố cổ Hội An vài bước chân.",
        "amenities": ["Vườn thiền", "Phòng thưởng trà", "Xe đạp dạo phố", "Bồn tắm sục", "Bếp mở"],
        "hostName": "Hội An Heritage Stays",
        "hostSince": "2023",
        "maxGuests": 4,
        "bedrooms": 2,
        "bathrooms": 1,
        "availability": "Available",
        "imageUrl": SAMPLE_STAY_IMAGES[1],
        "rating": 4.95,
        "reviewCount": 29,
    },
    {
        "id": "listing-3",
        "roomId": "1003",
        "ownerWallet": DEMO_HOST_WALLET,
        "escrowAmount": 7.0,
        "nightlyPriceXlm": 7.0,
        "title": "Nhà phố cổ điển Hoàn Kiếm",
        "location": "Hoàn Kiếm, Hà Nội, Việt Nam",
        "description": "Nhà phố kiến trúc Pháp cổ kính được phục chế cao cấp giữa lòng phố cổ Hà Nội. Ban công ngắm phố đi bộ, phòng đọc sách và gần hồ Hoàn Kiếm.",
        "amenities": ["Ban công ngắm phố", "Gần Hồ Gươm", "Hầm rượu", "Góc làm việc tiện nghi", "Đỗ xe an toàn"],
        "hostName": "Hanoi Old Quarter Estates",
        "hostSince": "2024",
        "maxGuests": 5,
        "bedrooms": 2,
        "bathrooms": 2,
        "availability": "Available",
        "imageUrl": SAMPLE_STAY_IMAGES[2],
        "rating": 4.92,
        "reviewCount": 44,
    },
    {
        "id": "listing-4",
        "roomId": "1004",
        "ownerWallet": DEMO_HOST_WALLET,
        "escrowAmount": 20.0,
        "nightlyPriceXlm": 20.0,
        "title": "Chalet gỗ mây núi Sa Pa",
        "location": "Mường Hoa, Sa Pa, Lào Cai",
        "description": "Chalet gỗ sang trọng trên sườn núi săn mây với tầm nhìn trọn vẹn đỉnh Fansipan. Phòng xông hơi riêng, lò sưởi ấm cúng và quản gia riêng chu đáo.",
        "amenities": ["Săn mây đỉnh núi", "Phòng xông hơi riêng", "Lò sưởi ấm", "Ban công toàn cảnh", "Bữa sáng đặc sản"],
        "hostName": "Sa Pa Cloud Villas",
        "hostSince": "2023",
        "maxGuests": 8,
        "bedrooms": 4,
        "bathrooms": 3,
        "availability": "Available",
        "imageUrl": SAMPLE_STAY_IMAGES[3],
        "rating": 5.0,
        "reviewCount": 52,
    },
    {
        "id": "listing-5",
        "roomId": "1005",
        "ownerWallet": DEMO_HOST_WALLET,
        "escrowAmount": 10.5,
        "nightlyPriceXlm": 10.5,
        "title": "Biệt thự rừng nhiệt đới Phú Quốc",
        "location": "Gành Dầu, Phú Quốc, Kiên Giang",
        "description": "Biệt thự sinh thái cao cấp nằm ẩn mình cạnh bãi biển cát trắng hoang sơ, hồ bơi riêng giữa tán rừng nhiệt đới. Hợp đồng Soroban đảm bảo 100% minh bạch.",
        "amenities": ["Bãi biển riêng", "Hồ bơi nhiệt đới", "Sàn tập yoga", "Võng thư giãn", "Đầu bếp hải sản"],
        "hostName": "Phu Quoc Sanctuary",
        "hostSince": "2024",
        "maxGuests": 4,
        "bedrooms": 2,
        "bathrooms": 1,
        "availability": "Available",
        "imageUrl": SAMPLE_STAY_IMAGES[4],
        "rating": 4.89,
        "reviewCount": 21,
    },
    {
        "id": "listing-6",
        "roomId": "1006",
        "ownerWallet": DEMO_HOST_WALLET,
        "escrowAmount": 15.75,
        "nightlyPriceXlm": 15.75,
        "title": "Caldera Suite vách đá Nha Trang",
        "location": "Bãi Tiên, Nha Trang, Khánh Hòa",
        "description": "Suite vách đá kiến trúc hang vòm nhìn thẳng ra biển xanh ngọc bích. Bể ngâm vô cực ngoài trời ngắm hoàng hôn tuyệt đẹp, không qua bất kỳ khâu trung gian nào.",
        "amenities": ["Bể ngâm vô cực", "Tầm nhìn vịnh 360°", "Kiến trúc vách đá", "Ban công hoàng hôn", "Quản gia 24/7"],
        "hostName": "Nha Trang Bay Escapes",
        "hostSince": "2023",
        "maxGuests": 2,
        "bedrooms": 1,
        "bathrooms": 1,
        "availability": "Available",
        "imageUrl": SAMPLE_STAY_IMAGES[5],
        "rating": 4.97,
        "reviewCount": 65,
    },
]

# ─── KHỞI TẠO SESSION STATE ─────────────────────────────────────────────────────────────

if "listings" not in st.session_state:
    st.session_state.listings = [dict(x) for x in INITIAL_MOCK_LISTINGS]

if "page_number" not in st.session_state:
    st.session_state.page_number = 1

if "selected_booking_room" not in st.session_state:
    st.session_state.selected_booking_room = "1001"

if "bookings" not in st.session_state:
    st.session_state.bookings = {
        "1001": {
            "roomId": "1001",
            "title": "Biệt thự biển Mỹ Khê",
            "guest": "GBUQ...72N4",
            "host": DEMO_HOST_WALLET,
            "deposit": "12.5 XLM",
            "stage": "Đã hoàn tất & giải ngân",
            "status": "Completed",
            "txHash": "a1c7f9382b0e4d7a8c3d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
        },
        "1002": {
            "roomId": "1002",
            "title": "Dinh thự vườn thiền phố cổ",
            "guest": "GCLK...49X1",
            "host": DEMO_HOST_WALLET,
            "deposit": "8.75 XLM",
            "stage": "Đã nhận phòng",
            "status": "CheckedIn",
            "txHash": "b2d8e0493c1f5e8b9d4e6f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
        },
        "1003": {
            "roomId": "1003",
            "title": "Nhà phố cổ điển Hoàn Kiếm",
            "guest": "GDMP...88K9",
            "host": DEMO_HOST_WALLET,
            "deposit": "7.0 XLM",
            "stage": "Đã khóa ký quỹ",
            "status": "Reserved",
            "txHash": "c3e9f1504d2a6f9c0e5f7a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
        },
    }

# ─── GIAO DIỆN DARK MODE & CSS TÙY BIẾN ───────────────────────────────────────────────

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Nền chính tối cao cấp */
    .stApp {
        background: radial-gradient(circle at 50% 0%, #151824 0%, #090a0f 65%, #050608 100%);
        color: #f3f4f6;
    }
    
    /* Header card */
    .header-hero {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
        border: 1px solid rgba(245, 158, 11, 0.25);
        border-radius: 20px;
        padding: 28px 32px;
        margin-bottom: 24px;
        backdrop-filter: blur(16px);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
    }
    
    /* Card phòng lưu trú */
    .stay-card {
        background: rgba(14, 17, 26, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
        margin-bottom: 20px;
    }
    .stay-card:hover {
        border-color: rgba(245, 158, 11, 0.4);
        transform: translateY(-4px);
        box-shadow: 0 16px 36px rgba(245, 158, 11, 0.12);
    }
    
    /* Huy hiệu trạng thái */
    .badge-available {
        display: inline-flex;
        align-items: center;
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(52, 211, 153, 0.3);
        border-radius: 9999px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
    }
    .badge-reserved {
        display: inline-flex;
        align-items: center;
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 9999px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
    }
    .badge-soroban {
        display: inline-flex;
        align-items: center;
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.25);
        border-radius: 9999px;
        padding: 4px 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    /* Hộp số liệu thống kê */
    .metric-card {
        background: rgba(12, 14, 21, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 18px 20px;
        text-align: left;
    }
    .metric-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #9ca3af;
        margin-bottom: 4px;
    }
    .metric-val {
        font-size: 26px;
        font-weight: 800;
        color: #ffffff;
    }
    
    /* Giao diện nút bấm chính */
    div.stButton > button {
        border-radius: 12px;
        font-weight: 700;
        transition: all 0.2s ease;
    }
    div.stButton > button:hover {
        border-color: #f59e0b;
        box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ─── SIDEBAR & ĐIỀU HƯỚNG ─────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown(
        """
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">
                🛡️
            </div>
            <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">StayLock</h3>
                <span style="font-size: 10px; color: #f59e0b; font-weight: 700; letter-spacing: 0.06em;">SOROBAN ESCROW V1.0</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    
    st.markdown(
        """
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px; margin-bottom: 20px; font-size: 11px; line-height: 1.5; color: #9ca3af;">
            <div style="display: flex; align-items: center; gap: 6px; color: #34d399; font-weight: 600; margin-bottom: 4px;">
                <span style="height: 6px; width: 6px; border-radius: 50%; background: #34d399;"></span>
                Mạng Stellar Testnet & Mainnet
            </div>
            Hợp đồng ký quỹ phi lưu ký: tiền cọc được khóa an toàn on-chain cho tới khi hoàn tất kỳ nghỉ.
        </div>
        """,
        unsafe_allow_html=True,
    )

    menu_option = st.radio(
        "Chuyển khu vực làm việc:",
        [
            "🏨 Khám phá chỗ nghỉ (Guest)",
            "🛎️ Đặt phòng & Ký quỹ Soroban",
            "🔑 Cổng thông tin Chủ nhà (Host)",
            "🔍 Tra cứu vòng đời Ký quỹ",
            "📊 So sánh StayLock vs Truyền thống",
        ],
        index=0,
    )

    st.markdown("---")
    st.markdown(
        f"""
        <div style="font-size: 11px; color: #6b7280;">
            <b>Hợp đồng Soroban:</b><br/>
            <code style="color: #f59e0b; font-size: 9px; word-break: break-all;">{SOROBAN_CONTRACT_ID[:16]}...{SOROBAN_CONTRACT_ID[-8:]}</code><br/><br/>
            <b>Ví Chủ nhà mẫu:</b><br/>
            <code style="color: #9ca3af; font-size: 9px; word-break: break-all;">{DEMO_HOST_WALLET[:16]}...</code>
        </div>
        """,
        unsafe_allow_html=True,
    )

# ═════════════════════════════════════════════════════════════════════════════════════════
# 1. KHÁM PHÁ CHỖ NGHỈ (GUEST MARKETPLACE) & PHÂN TRANG 6 PHÒNG
# ═════════════════════════════════════════════════════════════════════════════════════════

if menu_option == "🏨 Khám phá chỗ nghỉ (Guest)":
    st.markdown(
        """
        <div class="header-hero">
            <span class="badge-soroban">Giao thức ký quỹ du lịch thông minh · Mạng Stellar</span>
            <h1 style="color: #fff; font-size: 32px; font-weight: 800; margin-top: 10px; margin-bottom: 8px;">
                Đặt phòng nghỉ thượng lưu với niềm tin tuyệt đối
            </h1>
            <p style="color: #9ca3af; font-size: 14px; max-width: 820px; margin: 0; line-height: 1.6;">
                Mỗi chỗ nghỉ trên StayLock đều được bảo vệ bằng hợp đồng ký quỹ mật mã. Khách chỉ chuyển tiền phòng khi xác nhận đã đến,
                tiền cọc giữ an toàn on-chain 100% phi lưu ký — hoàn toàn không lo lừa đảo hay bị quỵt cọc.
            </p>
            <div style="display: flex; gap: 20px; margin-top: 18px; font-size: 12px; font-weight: 600;">
                <span style="color: #34d399;">✓ 0% phí hoa hồng nền tảng</span>
                <span style="color: #fbbf24;">✓ Ký quỹ phi lưu ký (Non-custodial)</span>
                <span style="color: #60a5fa;">✓ Chủ nhà xác thực bằng chữ ký ví</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Thanh công cụ tìm kiếm và bộ lọc
    col_search, col_filter, col_sort = st.columns([2.5, 1.5, 1.2])

    with col_search:
        search_kw = st.text_input(
            "Tìm kiếm chỗ nghỉ:",
            placeholder="Tìm theo tên biệt thự, thành phố, tiện ích...",
            label_visibility="collapsed",
        )

    with col_filter:
        avail_filter = st.selectbox(
            "Tình trạng:",
            ["Tất cả chỗ nghỉ", "Còn phòng trống", "Đã đặt cọc"],
            index=0,
            label_visibility="collapsed",
        )

    with col_sort:
        sort_mode = st.selectbox(
            "Sắp xếp:",
            ["Mặc định", "Giá: Thấp đến cao", "Giá: Cao đến thấp"],
            index=0,
            label_visibility="collapsed",
        )

    # Lọc danh sách
    filtered = list(st.session_state.listings)

    if search_kw.strip():
        kw = search_kw.strip().lower()
        filtered = [
            x for x in filtered
            if kw in x["title"].lower()
            or kw in x["location"].lower()
            or kw in x["description"].lower()
            or kw in x.get("hostName", "").lower()
        ]

    if avail_filter == "Còn phòng trống":
        filtered = [x for x in filtered if x.get("availability") == "Available"]
    elif avail_filter == "Đã đặt cọc":
        filtered = [x for x in filtered if x.get("availability") != "Available"]

    if sort_mode == "Giá: Thấp đến cao":
        filtered.sort(key=lambda x: x["nightlyPriceXlm"])
    elif sort_mode == "Giá: Cao đến thấp":
        filtered.sort(key=lambda x: x["nightlyPriceXlm"], reverse=True)

    # CẤU HÌNH PHÂN TRANG: TỐI ĐA 6 PHÒNG MỖI TRANG
    ITEMS_PER_PAGE = 6
    total_items = len(filtered)
    total_pages = max(1, math.ceil(total_items / ITEMS_PER_PAGE))

    # Đảm bảo trang hợp lệ
    if st.session_state.page_number > total_pages:
        st.session_state.page_number = total_pages
    if st.session_state.page_number < 1:
        st.session_state.page_number = 1

    current_page = st.session_state.page_number
    start_idx = (current_page - 1) * ITEMS_PER_PAGE
    end_idx = min(start_idx + ITEMS_PER_PAGE, total_items)
    page_listings = filtered[start_idx:end_idx]

    # Thanh trạng thái
    st.markdown(
        f"""
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; margin-bottom: 20px; font-size: 12px; color: #9ca3af;">
            <div>
                Hiển thị <b style="color: #fff;">{start_idx + 1 if total_items > 0 else 0}–{end_idx}</b> trên tổng số <b style="color: #fff;">{total_items}</b> chỗ nghỉ
                {f'<span style="background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px; margin-left: 8px; font-family: monospace; color: #f59e0b;">Trang {current_page}/{total_pages}</span>' if total_pages > 1 else ''}
            </div>
            <div style="color: #6ee7b7; font-weight: 500;">
                ● Ký quỹ Stellar Soroban đang hoạt động
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Hiển thị danh sách nếu trống
    if total_items == 0:
        st.warning("Không tìm thấy chỗ nghỉ nào phù hợp với bộ lọc. Hãy thử tìm theo thành phố khác!")
    else:
        # Lưới phòng: 3 cột trên Desktop
        for row_start in range(0, len(page_listings), 3):
            cols = st.columns(3)
            for c_idx in range(3):
                item_idx = row_start + c_idx
                if item_idx < len(page_listings):
                    item = page_listings[item_idx]
                    with cols[c_idx]:
                        # Ảnh mẫu tự động gán
                        img_url = item.get("imageUrl") or get_stable_sample_image(item.get("roomId", item.get("id")))
                        is_avail = item.get("availability") == "Available"
                        
                        st.markdown(
                            f"""
                            <div class="stay-card">
                                <div style="position: relative; width: 100%; height: 210px; overflow: hidden; background: #1a1d28;">
                                    <img src="{img_url}" alt="{item['title']}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onerror="this.src='{DEFAULT_FALLBACK_IMAGE}';"/>
                                    <div style="position: absolute; top: 12px; left: 12px;">
                                        <span class="{'badge-available' if is_avail else 'badge-reserved'}">
                                            {'● Còn phòng trống' if is_avail else '● Đã đặt cọc'}
                                        </span>
                                    </div>
                                    <div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.65); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #fbbf24; border: 1px solid rgba(255,255,255,0.1);">
                                        ★ {item.get('rating', 4.95)}
                                    </div>
                                </div>
                                <div style="padding: 16px;">
                                    <div style="color: #f59e0b; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">
                                        📍 {item['location']}
                                    </div>
                                    <h4 style="color: #fff; font-size: 16px; font-weight: 700; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        {item['title']}
                                    </h4>
                                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.4; height: 34px; overflow: hidden; margin-bottom: 12px;">
                                        {item['description']}
                                    </p>
                                    <div style="display: flex; gap: 12px; font-size: 11px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-bottom: 12px;">
                                        <span>👥 {item.get('maxGuests', 4)} khách</span>
                                        <span>🛏️ {item.get('bedrooms', 2)} phòng ngủ</span>
                                        <span>🚿 {item.get('bathrooms', 2)} tắm</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px;">
                                        <div>
                                            <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Giá mỗi đêm</div>
                                            <div style="font-size: 16px; font-weight: 800; color: #fff;">{item['nightlyPriceXlm']} XLM</div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 10px; color: #f59e0b; text-transform: uppercase;">Cọc ký quỹ</div>
                                            <div style="font-size: 14px; font-weight: 700; color: #fbbf24;">{item['escrowAmount']} XLM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )
                        
                        if is_avail:
                            if st.button(f"Đặt phòng ký quỹ #{item['roomId']}", key=f"book_btn_{item['id']}"):
                                st.session_state.selected_booking_room = item["roomId"]
                                st.toast(f"Đã chọn #{item['roomId']}! Hãy chuyển qua mục 'Đặt phòng & Ký quỹ Soroban'.", icon="🛎️")
                        else:
                            st.button(f"Phòng đã được đặt", disabled=True, key=f"disabled_btn_{item['id']}")

        # THANH PHÂN TRANG (PAGINATION BAR)
        if total_pages > 1:
            st.markdown("---")
            p_col_info, p_col_prev, p_col_pages, p_col_next = st.columns([2, 1, 3, 1])
            with p_col_info:
                st.markdown(
                    f"<div style='font-size: 13px; color: #9ca3af; padding-top: 6px;'>Trang <b style='color:#f59e0b'>{current_page}</b> / <b>{total_pages}</b> · Tổng <b>{total_items}</b> phòng (6 phòng/trang)</div>",
                    unsafe_allow_html=True,
                )
            with p_col_prev:
                if st.button("‹ Trang trước", disabled=(current_page == 1)):
                    st.session_state.page_number = max(1, current_page - 1)
                    st.rerun()
            with p_col_pages:
                page_cols = st.columns(min(total_pages, 6))
                for p_idx in range(min(total_pages, 6)):
                    page_num = p_idx + 1
                    with page_cols[p_idx]:
                        if st.button(
                            f"[{page_num}]" if page_num == current_page else f"{page_num}",
                            key=f"page_btn_{page_num}",
                        ):
                            st.session_state.page_number = page_num
                            st.rerun()
            with p_col_next:
                if st.button("Trang tiếp ›", disabled=(current_page == total_pages)):
                    st.session_state.page_number = min(total_pages, current_page + 1)
                    st.rerun()

# ═════════════════════════════════════════════════════════════════════════════════════════
# 2. ĐẶT PHÒNG & KÝ QUỸ SOROBAN
# ═════════════════════════════════════════════════════════════════════════════════════════

elif menu_option == "🛎️ Đặt phòng & Ký quỹ Soroban":
    st.markdown(
        """
        <div class="header-hero">
            <span class="badge-soroban">Ủy thác thanh toán phi tập trung</span>
            <h2 style="color: #fff; font-size: 26px; font-weight: 800; margin-top: 10px;">
                Ủy quyền ký quỹ & Đặt cọc on-chain
            </h2>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                Khoản cọc của bạn được hợp đồng thông minh Soroban khóa an toàn. Chủ nhà không thể rút tiền cọc cho đến khi bạn xác nhận đã nhận phòng.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Tìm thông tin phòng được chọn
    room_options = {item["roomId"]: f"#{item['roomId']} - {item['title']} ({item['nightlyPriceXlm']} XLM/đêm)" for item in st.session_state.listings}
    selected_rid = st.selectbox(
        "Chọn chỗ nghỉ muốn đặt:",
        options=list(room_options.keys()),
        index=list(room_options.keys()).index(st.session_state.selected_booking_room) if st.session_state.selected_booking_room in room_options else 0,
        format_func=lambda x: room_options[x],
    )

    room_data = next((x for x in st.session_state.listings if x["roomId"] == selected_rid), st.session_state.listings[0])

    col_details, col_pricing = st.columns([1.6, 1.4])

    with col_details:
        st.markdown(
            f"""
            <div style="background: rgba(14,17,26,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                <img src="{room_data.get('imageUrl') or get_stable_sample_image(room_data['roomId'])}" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 14px;" onerror="this.src='{DEFAULT_FALLBACK_IMAGE}';"/>
                <h3 style="color: #fff; font-size: 20px; margin: 0 0 6px 0;">{room_data['title']}</h3>
                <p style="color: #f59e0b; font-size: 12px; margin-bottom: 10px;">📍 {room_data['location']}</p>
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">{room_data['description']}</p>
                <div style="margin-top: 12px; font-size: 12px; color: #cbd5e1;">
                    <b>Chủ nhà:</b> {room_data.get('hostName', 'Casa StayLock')} &middot; Ví: <code style="color: #f59e0b;">{room_data['ownerWallet'][:12]}...</code>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_pricing:
        st.markdown(
            """
            <div style="background: rgba(14,17,26,0.9); border: 1px solid rgba(245,158,11,0.25); border-radius: 16px; padding: 22px;">
                <h4 style="color: #fff; margin-top: 0; font-size: 16px; font-weight: 700;">Thời gian lưu trú & Bảng tính ký quỹ</h4>
            """,
            unsafe_allow_html=True,
        )

        d_col1, d_col2 = st.columns(2)
        today = datetime.date.today()
        with d_col1:
            check_in = st.date_input("Ngày nhận phòng (Check-in):", today)
        with d_col2:
            check_out = st.date_input("Ngày trả phòng (Check-out):", today + datetime.timedelta(days=3))

        nights = max(1, (check_out - check_in).days)
        nightly_price = room_data["nightlyPriceXlm"]
        stay_cost = nights * nightly_price
        escrow_deposit = float(room_data["escrowAmount"])
        total_auth = escrow_deposit

        st.markdown(
            f"""
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px; margin-top: 14px; font-size: 13px; color: #9ca3af;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Tiền phòng ({nights} đêm × {nightly_price} XLM)</span>
                    <span style="color: #fff; font-weight: 600;">{stay_cost:.2f} XLM</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>🔒 Tiền cọc ký quỹ khóa on-chain</span>
                    <span style="color: #fbbf24; font-weight: 700;">{escrow_deposit:.2f} XLM</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Ước tính phí mạng Stellar</span>
                    <span style="color: #fff;">&lt; 0.0001 XLM</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Phí hoa hồng nền tảng</span>
                    <span style="color: #34d399; font-weight: 600;">0.00 XLM (0%)</span>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: baseline;">
                    <span style="color: #fff; font-weight: 700; font-size: 14px;">Tổng cọc ký quỹ ủy quyền</span>
                    <span style="color: #f59e0b; font-size: 24px; font-weight: 800;">{total_auth:.2f} XLM</span>
                </div>
            </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown("<br/>", unsafe_allow_html=True)
        guest_wallet = st.text_input("Ví Freighter của bạn (Khách thuê):", "GDMPQ7OQE7DFP5KLNS2PF2LVZMUZYJX4OZIEQ36N2IQANUB5TEST")

        if st.button("🚀 Khóa tiền cọc ký quỹ qua Soroban", type="primary", key="btn_lock_escrow"):
            new_booking_id = f"BK-{int(datetime.datetime.now().timestamp()) % 10000}"
            tx_sim = hashlib.sha256(f"{new_booking_id}{selected_rid}".encode()).hexdigest()
            
            # Cập nhật danh sách đặt cọc
            st.session_state.bookings[new_booking_id] = {
                "roomId": selected_rid,
                "title": room_data["title"],
                "guest": guest_wallet[:8] + "..." + guest_wallet[-4:],
                "host": room_data["ownerWallet"],
                "deposit": f"{escrow_deposit} XLM",
                "stage": "Đã khóa ký quỹ",
                "status": "Reserved",
                "txHash": tx_sim,
            }

            # Cập nhật tình trạng phòng
            for r in st.session_state.listings:
                if r["roomId"] == selected_rid:
                    r["availability"] = "Reserved"

            st.success(f"Khóa cọc ký quỹ thành công! Mã đặt phòng của bạn là #{new_booking_id}")
            st.info(f"Mã giao dịch Stellar: `{tx_sim[:24]}...` — Tiền cọc an toàn trong hợp đồng Soroban.")

# ═════════════════════════════════════════════════════════════════════════════════════════
# 3. CỔNG THÔNG TIN CHỦ NHÀ (HOST PORTAL) & TỰ ĐỘNG GÁN ẢNH MẪU
# ═════════════════════════════════════════════════════════════════════════════════════════

elif menu_option == "🔑 Cổng thông tin Chủ nhà (Host)":
    st.markdown(
        """
        <div class="header-hero">
            <span class="badge-soroban">Cổng quản trị chủ nhà phi lưu ký</span>
            <h2 style="color: #fff; font-size: 26px; font-weight: 800; margin-top: 10px;">
                Quản lý kho phòng & Niêm yết chỗ nghỉ mới
            </h2>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                Tất cả chỗ nghỉ do bạn tạo đều được bảo chứng on-chain. Khi khách hoàn tất chuyến đi, tiền cọc và tiền phòng sẽ tự động giải ngân thẳng về ví của bạn.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # 4 chỉ số chủ nhà
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-title">Phòng đang niêm yết</div>
                <div class="metric-val">{len(st.session_state.listings)}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with m2:
        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-title">Đơn đặt đang xử lý</div>
                <div class="metric-val">{len(st.session_state.bookings)}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with m3:
        st.markdown(
            """
            <div class="metric-card">
                <div class="metric-title">Chứng nhận uy tín</div>
                <div class="metric-val" style="color: #34d399; font-size: 20px;">Xác thực on-chain</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with m4:
        st.markdown(
            """
            <div class="metric-card">
                <div class="metric-title">Hoa hồng nền tảng</div>
                <div class="metric-val" style="color: #f59e0b;">0.00%</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("<br/>", unsafe_allow_html=True)

    # BIỂU MẪU TẠO PHÒNG MỚI: HOÀN TOÀN KHÔNG CÓ TRƯỜNG TẢI ẢNH (TỰ ĐỘNG GÁN ẢNH MẪU)
    st.markdown("### 📝 Đăng ký chỗ nghỉ mới (Hệ thống tự động gán ảnh mẫu lưu trú)")
    st.info("Biểu mẫu được thiết kế tối giản: Chủ nhà không cần tải ảnh, hệ thống tự động gán ảnh biệt thự lưu trú mẫu chất lượng cao và đồng bộ ổn định trên mọi thiết bị.")

    with st.form("create_listing_form", clear_on_submit=True):
        f_col1, f_col2 = st.columns(2)
        with f_col1:
            new_title = st.text_input("Tên biệt thự / chỗ nghỉ *:", placeholder="Ví dụ: Biệt thự đồi thông Đà Lạt")
            new_location = st.text_input("Địa điểm / thành phố *:", placeholder="Ví dụ: Đà Lạt, Lâm Đồng, Việt Nam")
            new_hostname = st.text_input("Tên thương hiệu / chủ nhà:", placeholder="Ví dụ: Dalat Pine Stays")
        with f_col2:
            new_nightly = st.number_input("Giá thuê mỗi đêm (XLM) *:", min_value=1.0, value=14.0, step=0.5)
            new_deposit = st.number_input("Tiền cọc ký quỹ yêu cầu (XLM) *:", min_value=1.0, value=14.0, step=0.5)
            new_guests = st.number_input("Số lượng khách tối đa:", min_value=1, max_value=20, value=4)

        new_desc = st.text_area("Mô tả chỗ nghỉ & tiện ích nổi bật *:", placeholder="Mô tả tầm nhìn, nội thất cao cấp, trải nghiệm kỳ nghỉ...")

        submit_listing = st.form_submit_button("✨ Đăng chỗ nghỉ lên thị trường")

        if submit_listing:
            if not new_title.strip() or not new_location.strip() or not new_desc.strip():
                st.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*).")
            else:
                timestamp_str = str(int(datetime.datetime.now().timestamp()))
                new_room_id = timestamp_str[-5:]
                
                # TỰ ĐỘNG GÁN ẢNH MẪU TỪ DANH SÁCH CÓ SẴN BẰNG HÀM BĂM XÁC ĐỊNH
                assigned_sample_img = get_stable_sample_image(new_room_id, len(st.session_state.listings))

                new_item = {
                    "id": f"listing-{timestamp_str}",
                    "roomId": new_room_id,
                    "ownerWallet": DEMO_HOST_WALLET,
                    "escrowAmount": float(new_deposit),
                    "nightlyPriceXlm": float(new_nightly),
                    "title": new_title.strip(),
                    "location": new_location.strip(),
                    "description": new_desc.strip(),
                    "amenities": ["Bảo chứng ký quỹ Soroban", "Xác thực on-chain", "Khóa ví Freighter", "Quản gia riêng"],
                    "hostName": new_hostname.strip() or "Chủ nhà StayLock",
                    "hostSince": str(datetime.date.today().year),
                    "maxGuests": int(new_guests),
                    "bedrooms": 2,
                    "bathrooms": 2,
                    "availability": "Available",
                    "imageUrl": assigned_sample_img,
                    "rating": 5.0,
                    "reviewCount": 1,
                }

                # Thêm vào danh sách phòng (lên đầu)
                st.session_state.listings.insert(0, new_item)
                st.success(f"Đã đăng chỗ nghỉ '{new_title}' thành công! Hệ thống đã tự động gán ảnh mẫu lưu trú và niêm yết lên Marketplace.")

    # Danh sách phòng của chủ nhà
    st.markdown("### 📋 Chỗ nghỉ thuộc quyền sở hữu của bạn")
    for room in st.session_state.listings:
        if room.get("ownerWallet") == DEMO_HOST_WALLET:
            with st.expander(f"Phòng #{room['roomId']} — {room['title']} ({room['location']})"):
                c_img, c_info = st.columns([1, 2])
                with c_img:
                    st.image(room["imageUrl"], caption=f"Ảnh mẫu tự động: {room['title']}")
                with c_info:
                    st.write(f"**Giá thuê:** {room['nightlyPriceXlm']} XLM/đêm")
                    st.write(f"**Cọc ký quỹ:** {room['escrowAmount']} XLM")
                    st.write(f"**Tình trạng:** {room['availability']}")
                    st.write(f"**Mô tả:** {room['description']}")

# ═════════════════════════════════════════════════════════════════════════════════════════
# 4. TRA CỨU VÒNG ĐỜI KÝ QUỸ (ESCROW TRACKER & LIFECYCLE)
# ═════════════════════════════════════════════════════════════════════════════════════════

elif menu_option == "🔍 Tra cứu vòng đời Ký quỹ":
    st.markdown(
        """
        <div class="header-hero">
            <span class="badge-soroban">Theo dõi trạng thái giao thức on-chain</span>
            <h2 style="color: #fff; font-size: 26px; font-weight: 800; margin-top: 10px;">
                Tra cứu & Quản lý vòng đời ký quỹ (Escrow Lifecycle)
            </h2>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                Kiểm tra minh bạch trạng thái đặt phòng theo thời gian thực trực tiếp từ hợp đồng Soroban trên sổ cái Stellar.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    t_col1, t_col2 = st.columns([2, 1])
    with t_col1:
        lookup_id = st.text_input("Nhập mã đặt phòng:", "1001", placeholder="Ví dụ: 1001, 1002, 1003...")
    with t_col2:
        st.markdown("<div style='height: 28px;'></div>", unsafe_allow_html=True)
        quick_select = st.selectbox("Chọn nhanh:", list(st.session_state.bookings.keys()))
        if quick_select:
            lookup_id = quick_select

    if lookup_id in st.session_state.bookings:
        b_info = st.session_state.bookings[lookup_id]
        
        st.markdown(
            f"""
            <div style="background: rgba(14,17,26,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px; margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; margin-bottom: 16px;">
                    <div>
                        <span style="font-size: 11px; color: #f59e0b; font-weight: 700;">ĐẶT PHÒNG #{lookup_id}</span>
                        <h3 style="color: #fff; margin: 4px 0 0 0;">{b_info['title']}</h3>
                    </div>
                    <span class="badge-available" style="font-size: 13px; padding: 6px 14px;">
                        {b_info['stage']}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; font-size: 13px;">
                    <div>
                        <div style="color: #9ca3af; font-size: 11px;">VÍ KHÁCH THUÊ</div>
                        <div style="color: #fff; font-family: monospace;">{b_info['guest']}</div>
                    </div>
                    <div>
                        <div style="color: #9ca3af; font-size: 11px;">VÍ CHỦ NHÀ</div>
                        <div style="color: #fff; font-family: monospace;">{b_info['host'][:8]}...{b_info['host'][-4:]}</div>
                    </div>
                    <div>
                        <div style="color: #9ca3af; font-size: 11px;">KHOẢN TIỀN CỌC</div>
                        <div style="color: #fbbf24; font-weight: 700;">{b_info['deposit']}</div>
                    </div>
                    <div>
                        <div style="color: #9ca3af; font-size: 11px;">MÃ GIAO DỊCH CHUỖI</div>
                        <div style="color: #34d399; font-family: monospace;">{b_info['txHash'][:10]}...</div>
                    </div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown("#### Tiến trình vòng đời 4 bước của hợp đồng Soroban:")
        steps = [
            ("Bước 01", "Đã khóa ký quỹ", "Tiền cọc được khóa an toàn bên trong smart contract Soroban.", b_info["stage"] in ["Đã khóa ký quỹ", "Đã nhận phòng", "Đã hoàn tất & giải ngân"]),
            ("Bước 02", "Đã nhận phòng", "Khách xác nhận đã đến nơi an toàn, không có khiếu nại về phòng.", b_info["stage"] in ["Đã nhận phòng", "Đã hoàn tất & giải ngân"]),
            ("Bước 03", "Đã hoàn tất & giải ngân", "Kỳ nghỉ kết thúc, tiền cọc và tiền phòng tự động giải ngân về ví.", b_info["stage"] == "Đã hoàn tất & giải ngân"),
            ("Bước 04", "Đã hủy & hoàn cọc", "Trường hợp hủy đặt theo chính sách ký quỹ.", b_info["stage"] == "Đã hủy"),
        ]

        st_cols = st.columns(4)
        for i, (b_name, b_title, b_desc, is_active) in enumerate(steps):
            with st_cols[i]:
                st.markdown(
                    f"""
                    <div style="background: {'rgba(245,158,11,0.1)' if is_active else 'rgba(0,0,0,0.3)'}; border: 1px solid {'#f59e0b' if is_active else 'rgba(255,255,255,0.06)'}; border-radius: 12px; padding: 14px; text-align: left; height: 130px;">
                        <span style="font-size: 10px; font-weight: 700; color: {'#f59e0b' if is_active else '#6b7280'};">{b_name}</span>
                        <div style="font-size: 13px; font-weight: 700; color: {'#fff' if is_active else '#9ca3af'}; margin: 4px 0;">{b_title}</div>
                        <div style="font-size: 11px; color: #9ca3af; line-height: 1.3;">{b_desc}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        st.markdown("<br/>", unsafe_allow_html=True)
        act_col1, act_col2 = st.columns(2)
        with act_col1:
            if st.button("✓ Xác nhận đã đến & nhận phòng", key="btn_checkin"):
                b_info["stage"] = "Đã nhận phòng"
                st.success("Đã kích hoạt trạng thái: Khách đã nhận phòng an toàn!")
                st.rerun()
        with act_col2:
            if st.button("💰 Quyết toán giải ngân cho Chủ nhà", key="btn_payout"):
                b_info["stage"] = "Đã hoàn tất & giải ngân"
                st.success("Hợp đồng thông minh đã giải ngân 100% tiền cọc về ví chủ nhà!")
                st.rerun()
    else:
        st.warning(f"Không tìm thấy mã đặt phòng #{lookup_id}. Vui lòng thử lại với các mã mẫu (1001, 1002, 1003).")

# ═════════════════════════════════════════════════════════════════════════════════════════
# 5. SO SÁNH STAYLOCK VS TRUYỀN THỐNG
# ═════════════════════════════════════════════════════════════════════════════════════════

elif menu_option == "📊 So sánh StayLock vs Truyền thống":
    st.markdown(
        """
        <div class="header-hero">
            <span class="badge-soroban">Minh bạch & Tối ưu kinh tế</span>
            <h2 style="color: #fff; font-size: 26px; font-weight: 800; margin-top: 10px;">
                StayLock vs. Nền tảng đặt phòng truyền thống
            </h2>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                Tại sao hợp đồng thông minh Soroban mang lại lợi ích vượt trội cho cả Chủ nhà và Khách du lịch.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; background: rgba(14,17,26,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
            <thead>
                <tr style="background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <th style="padding: 16px; color: #fff; font-weight: 700;">Tiêu chí so sánh</th>
                    <th style="padding: 16px; color: #f59e0b; font-weight: 700;">🛡️ StayLock (Soroban Escrow)</th>
                    <th style="padding: 16px; color: #ef4444; font-weight: 700;">🏨 Nền tảng truyền thống (OTA)</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                    <td style="padding: 14px 16px; color: #cbd5e1; font-weight: 600;">Phí hoa hồng nền tảng</td>
                    <td style="padding: 14px 16px; color: #34d399; font-weight: 700;">0.00% (Miễn phí hoàn toàn)</td>
                    <td style="padding: 14px 16px; color: #fca5a5;">15% – 25% doanh thu</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                    <td style="padding: 14px 16px; color: #cbd5e1; font-weight: 600;">Cơ chế giữ tiền cọc</td>
                    <td style="padding: 14px 16px; color: #34d399; font-weight: 700;">Hợp đồng thông minh phi lưu ký (Non-custodial)</td>
                    <td style="padding: 14px 16px; color: #fca5a5;">Sàn trung gian giữ tiền tùy ý</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                    <td style="padding: 14px 16px; color: #cbd5e1; font-weight: 600;">Thời gian giải ngân tiền</td>
                    <td style="padding: 14px 16px; color: #34d399; font-weight: 700;">Tức thì on-chain khi khách check-out</td>
                    <td style="padding: 14px 16px; color: #fca5a5;">Chờ 15 đến 30 ngày theo chu kỳ</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                    <td style="padding: 14px 16px; color: #cbd5e1; font-weight: 600;">Định danh & Quyền riêng tư</td>
                    <td style="padding: 14px 16px; color: #34d399; font-weight: 700;">Khóa mật mã ví Freighter (Không cần mật khẩu)</td>
                    <td style="padding: 14px 16px; color: #fca5a5;">Thu thập CCCD, thẻ tín dụng, rò rỉ dữ liệu</td>
                </tr>
                <tr>
                    <td style="padding: 14px 16px; color: #cbd5e1; font-weight: 600;">Phân xử tranh chấp</td>
                    <td style="padding: 14px 16px; color: #34d399; font-weight: 700;">Quy tắc ký quỹ Soroban thực thi tự động</td>
                    <td style="padding: 14px 16px; color: #fca5a5;">Hỗ trợ khách hàng thủ công, chậm trễ</td>
                </tr>
            </tbody>
        </table>
        """,
        unsafe_allow_html=True,
    )

# ─── FOOTER ───────────────────────────────────────────────────────────────────────────

st.markdown(
    """
    <div style="border-top: 1px solid rgba(255,255,255,0.06); padding: 24px 0; margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280;">
        <b>StayLock</b> © 2026 · Giao thức ký quỹ du lịch thông minh trên mạng Stellar Soroban · Mã nguồn mở
    </div>
    """,
    unsafe_allow_html=True,
)
