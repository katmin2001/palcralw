# pawcrawl — bản web tĩnh

Bản chạy **hoàn toàn trong trình duyệt** của pawcrawl: dán link creator → xem
danh sách file → chọn → **tải về thư mục bạn tự chọn**. Có lưu **creator yêu
thích** ngay trong trình duyệt (localStorage).

Gồm 2 file cần đưa lên GitHub Pages:

- `index.html` — toàn bộ giao diện + logic (không cần build).
- `worker.js` — Cloudflare Worker làm **proxy CORS** cho phần API (deploy riêng, miễn phí).

> `README.md` này chỉ để đọc — không cần đưa lên Pages.

---

## Vì sao cần Worker? (quan trọng)

| Thành phần | Từ web tĩnh gọi thẳng được không? |
|---|---|
| **File thật** `file.pawchive.pw` | ✅ Có (CDN đã mở `Access-Control-Allow-Origin: *`) → tải trực tiếp |
| **API** `pawchive.pw/api/...` (danh sách post, hồ sơ, tìm kiếm) | ❌ Không — API **không gửi header CORS**, trình duyệt chặn |

Bản Python (`pawcrawl_ui.py`) né được vì nó chạy **server proxy cục bộ**. Web
tĩnh trên GitHub Pages không có server đó, nên phần API phải đi qua một proxy
nhỏ của bạn. **File tải vẫn đi thẳng CDN**, không qua proxy — nên proxy rất nhẹ.

---

## Bước 1 — Deploy Cloudflare Worker (proxy API)

Cách nhanh (không cần cài gì):

1. Vào <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Create Worker**.
2. Đặt tên (vd `pawcrawl-proxy`) → **Deploy** → **Edit code**.
3. Xoá code mẫu, **dán toàn bộ `worker.js`** vào → **Deploy**.
4. Copy URL Worker, dạng: `https://pawcrawl-proxy.<tài-khoản>.workers.dev`

Hoặc bằng Wrangler (CLI):
```bash
npx wrangler deploy web/worker.js --name pawcrawl-proxy
```

Worker chỉ cho proxy tới `pawchive.pw` / `pawchive.st`, không phải open proxy.

---

## Bước 2 — Đưa web lên GitHub Pages

Đưa `index.html` (và `worker.js` để tham khảo) vào **thư mục gốc** của một repo:

```bash
git init
git add index.html worker.js README.md
git commit -m "pawcrawl web (static)"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Trên GitHub: **Settings → Pages → Build and deployment**
- Source: **Deploy from a branch**
- Branch: **main** / **/ (root)** → **Save**

Sau ~1 phút, trang ở: `https://<user>.github.io/<repo>/`

---

## Bước 3 — Dùng

1. Mở trang → bấm **⚙ Cấu hình** → dán **Proxy URL** (URL Worker ở Bước 1) → **Lưu**.
2. Ba chế độ tìm:
   - **Dán link creator/post** — vd `pawchive.pw/patreon/user/66371728`
   - **Tìm creator theo tên**
   - **Tìm post (toàn site)** theo từ khoá
3. Trong trang creator: tick chọn file (có nút *Chọn tất cả / Chỉ ảnh / Chỉ video*),
   chỉnh **Số post nạp**, rồi **⬇ Tải các mục đã chọn**.
4. **Chọn nơi lưu**: trên **Chrome/Edge** trang sẽ hỏi thư mục (File System Access
   API) rồi ghi thẳng vào đó, tự tạo thư mục con theo tên creator, tự **bỏ qua file
   đã có**. Trên trình duyệt không hỗ trợ (Firefox/Safari) file rơi vào thư mục
   **Downloads** mặc định.

### Yêu thích
Vào một creator → **★ Lưu yêu thích**. Danh sách nằm ở tab **★ Yêu thích**, lưu
trong trình duyệt này (localStorage). Có **Xuất/Nhập JSON** để chuyển máy/sao lưu.

---

## Hạn chế đã biết

- **Chọn thư mục lưu** cần Chrome/Edge (File System Access API). Trình duyệt khác
  vẫn tải được nhưng về thẳng Downloads.
- **Tìm creator theo tên** tải cả chỉ mục (`/api/v1/creators`, ~12MB). Endpoint
  này nặng và đôi khi bị pawchive giới hạn — nếu lỗi, dùng **dán link** hoặc **tìm
  post** thay thế.
- pawchive có **chống spam**: quét/tải quá nhanh & nhiều có thể bị chặn tạm thời
  (site trả lỗi kết nối). Đợi một lúc rồi thử lại.
- Chỉ tải được **nội dung công khai** trên pawchive (không đăng nhập tài khoản trả phí).
- Favorites theo **từng trình duyệt/máy** (localStorage) — không đồng bộ tự động;
  dùng Xuất/Nhập JSON để mang đi.
