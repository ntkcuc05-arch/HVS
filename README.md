# User-Help Portal (HSV Help Portal)

Portal hướng dẫn sử dụng các hệ thống HVS với giao diện cây hệ sinh thái sinh động, trực quan.

## 🚀 Công nghệ sử dụng

### Frontend
- **React 18** + **Vite**: Khởi tạo và build nhanh chóng.
- **Framer Motion**: Thư viện hiệu ứng chuyển dộng cho cây và các icon táo.
- **Lucide React**: Thư viện icon hiện đại.
- **Vanilla CSS**: Giao diện tùy chỉnh chi tiết, hiệu ứng kính (glassmorphism).

### Backend
- **FastAPI**: RESTful API tốc độ cao.
- **SQLite**: Cơ sở dữ liệu nhẹ để lưu trữ thông tin hệ thống và vị trí các node.
- **Uvicorn**: ASGI server để chạy ứng dụng Python.

---

## 🛠️ Hướng dẫn cài đặt

### 1. Chạy với Docker (Khuyên dùng)
Bạn chỉ cần Docker và Docker Compose đã được cài đặt.

```bash
docker-compose up --build
```
- **FE**: [http://localhost:5173](http://localhost:5173)
- **BE**: [http://localhost:8000](http://localhost:8000)

### 2. Chạy Local (Manual)

#### Backend
```bash
cd Source/Backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd Source/FE
npm install
npm run dev
```

---

## 📁 Cấu trúc thư mục

```text
HSV/
├── Source/
│   ├── Backend/            # FastAPI source code
│   │   ├── main.py         # Entry point (API endpoints)
│   │   ├── database.py     # SQLite connection & Models
│   │   ├── data/           # systems.db & systems.json backup
│   │   └── static/         # Chứa videos, docs và logo
│   └── FE/                 # React source code
│       ├── src/
│       │   ├── pages/      # Home.jsx (Giao diện cây hệ sinh thái)
│       │   ├── components/ # Các UI components dùng chung
│       │   └── constants/  # Cấu hình hệ thống mặc định
├── docker/                 # Cấu hình Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🌟 Tính năng nổi bật

- **Giao diện Cây Hệ Sinh Thái**: Các hệ thống được biểu diễn dưới dạng quả táo, nhánh cây và rễ cây.
- **Movable Nodes**: Ở chế độ chỉnh sửa, người dùng có thể kéo thả các node táo để thay đổi vị trí. Vị trí sẽ tự động được lưu vào database.
- **Chế độ Chỉnh sửa (Edit Mode)**: Nhấn nút "+" (yêu cầu mật khẩu) để thêm hệ thống mới hoặc di chuyển các hệ thống hiện có.
- **Xem Video/Tài liệu**: Tích hợp trình xem video pop-up ngay trên trang và link trực tiếp đến tài liệu hướng dẫn.

---

## 🔧 Quản lý dữ liệu

### Cách thêm hệ thống mới
1. Bật **Edit Mode** (Nút "+" ở góc phải).
2. Nhập thông tin: Tên, Link ứng dụng, Tên file Video/Doc.
3. Node mới sẽ xuất hiện trên cây.

### Quản lý file tĩnh
- **Video**: Copy vào `Source/Backend/static/videos/`
- **Tài liệu**: Copy vào `Source/Backend/static/docs/`
- **Logo**: Copy vào `Source/Backend/static/logo/`

---

## 🎯 Danh sách hệ thống hiện tại

| ID | Tên Hệ Thống | Phân Nhóm |
| :--- | :--- | :--- |
| hvs-gate | HVS-GATE | Quả (Fruit) |
| hvs-kios-lite | HVS-KIOS LITE | Quả (Fruit) |
| hvs-food | HVS-FOOD | Nhánh (Branch) |
| hvs-kios | HVS-KIOS | Nhánh (Branch) |
| hvs-umea | HVS-UMEA | Rễ (Root) |

---

## 📝 Ghi chú phát triển
- Ứng dụng hỗ trợ drag & drop bền vững (Persistence) nhờ backend SQLite.
- Giao diện được thiết kế theo phong cách hiện đại với hiệu ứng Glassmorphism.
- Liên kết YouTube trong popup sẽ tự động mở trong modal tập trung.
