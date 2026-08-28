# pawcrawl — bản web tĩnh

Bản chạy **trong trình duyệt** của pawcrawl: dán link creator → xem danh sách file
→ chọn → **tải về thư mục bạn tự chọn**. Có lưu **creator yêu thích** ngay trong
trình duyệt (localStorage).

Đưa lên GitHub Pages chỉ cần **`index.html`**. Để phần liệt kê/tìm chạy được, cài
thêm **userscript** `pawcrawl-bridge.user.js` (một lần).

---

## Vì sao cần userscript?

| Thành phần | Web tĩnh gọi thẳng được không? |
|---|---|
| **File thật** `file.pawchive.pw` | ✅ Có (CDN mở CORS) → tải trực tiếp |
| **API** `pawchive.pw/api/...` (danh sách, hồ sơ, tìm) | ❌ Không: chặn CORS **và** chặn IP máy chủ (challenge DDoS-Guard) |

Vì pawchive chặn cả CORS lẫn IP của proxy đám mây (Cloudflare Worker bị trả 404 +
trang challenge), cách chạy được và ổn định nhất là gọi API **bằng chính trình
duyệt bạn** qua một userscript: nó dùng IP + cookie thật của bạn nên pawchive
không challenge. File vẫn tải thẳng CDN, không qua đâu cả.

> Bản Python (`pawcrawl_ui.py` / `.exe`) chạy được vì cũng dùng IP máy bạn.

---

## Bước 1 — Cài userscript (một lần)

1. Cài tiện ích **Tampermonkey** (Chrome/Edge/Firefox — từ cửa hàng tiện ích).
2. Mở Tampermonkey → **Create a new script…** → xoá hết → **dán toàn bộ**
   `pawcrawl-bridge.user.js` → **Ctrl+S** để lưu.
   *(Hoặc kéo-thả file `.user.js` vào trình duyệt, Tampermonkey sẽ hỏi cài.)*
3. Script chỉ chạy trên trang GitHub Pages của bạn (`*.github.io`) và localhost, và
   chỉ được phép gọi `pawchive.pw` / `pawchive.st`.

> **Mẹo:** vào `https://pawchive.pw` một lần bằng trình duyệt (để qua trang chặn
> bot, lấy cookie). Sau đó userscript gọi API sẽ trơn tru.

---

## Bước 2 — Đưa web lên GitHub Pages

Đưa `index.html` vào **thư mục gốc** của repo (kèm 2 file kia để tải/tham khảo):

```bash
git init
git add index.html pawcrawl-bridge.user.js worker.js README.md
git commit -m "pawcrawl web (static)"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

GitHub → **Settings → Pages** → Source **Deploy from a branch** → Branch **main /
(root)** → **Save**. Sau ~1 phút: `https://<user>.github.io/<repo>/`

Để người khác cài userscript dễ, có thể trỏ họ tới link raw của file, ví dụ:
`https://<user>.github.io/<repo>/pawcrawl-bridge.user.js` (Tampermonkey nhận link
`.user.js` là mở hộp thoại cài).

---

## Bước 3 — Dùng

1. Mở trang. Nếu userscript đã cài, sẽ thấy chip xanh **“● userscript đã kết nối”**.
   *(Vừa cài xong thì tải lại trang.)*
2. Ba chế độ (ô chọn bên trái):
   - **Dán link creator/post** — vd `pawchive.pw/patreon/user/66371728` *(ổn định nhất)*
   - **Tìm creator theo tên**
   - **Tìm post (toàn site)** theo từ khoá
3. Trong trang creator: dùng **Hiển thị** (Tất cả/Ảnh/GIF/Video/Audio) để lọc lưới,
   **Chọn hiển thị / Bỏ chọn**, chỉnh **Số post nạp** và **số luồng** tải. Bấm **≈ Dung
   lượng** để ước lượng tổng trước khi tải. Click ảnh/video để **xem trước**.
4. **⬇ Tải các mục đã chọn**: trên **Chrome/Edge (desktop)** trang hỏi thư mục rồi ghi
   thẳng vào đúng thư mục đó, tự **bỏ qua file đã có**. Trình duyệt/thiết bị không hỗ trợ
   (mobile, Firefox, Safari) thì file về thư mục **Downloads** mặc định.

### Yêu thích
Vào creator → **★ Lưu yêu thích**. Danh sách ở tab **★ Yêu thích** (lưu trong trình
duyệt này). Có **Xuất/Nhập JSON** để sao lưu / chuyển máy.

---

## Dùng trên điện thoại (Android / iOS)

Trang web responsive: lưới 2 cột, ô chạm to, **vuốt trái/phải** để chuyển ảnh, chạm nền
để đóng xem trước. Vẫn cần userscript để gọi API — chọn trình duyệt hỗ trợ tiện ích:

**Android** (chạy tốt)
1. Cài **Firefox cho Android** *(khuyến nghị)* → vào addons.mozilla.org cài **Tampermonkey**.
   *(Hoặc **Kiwi Browser** rồi cài Tampermonkey từ Chrome Web Store.)*
2. Thêm `pawcrawl-bridge.user.js` vào Tampermonkey (mở link `.../pawcrawl-bridge.user.js`).
3. Vào thẳng `https://pawchive.pw` một lần (lấy cookie qua trang chặn bot).
4. Mở trang Pages của bạn → thấy chip xanh → dùng như trên máy tính.

**iOS** (được, nhưng vướng hơn)
- **Safari** + app **Userscripts** (App Store): bật extension trong Cài đặt → Safari →
  Tiện ích, thêm file `.user.js`. Hỗ trợ `GM_xmlhttpRequest` đôi khi thất thường.
- Hoặc **Orion browser** (App Store) — cài được tiện ích Firefox/Chrome như **Tampermonkey**,
  mượt hơn.

**Lưu ý tải trên điện thoại**
- **Không chọn được thư mục** (mobile không có File System Access API) → file về **Downloads
  / Files** mặc định.
- Nên để **số luồng thấp (2–3)**. iOS tải nhiều file rời rạc rất kém — tải **từng ít một**,
  hoặc dùng nút **⬇ Tải file này** trong khung xem trước cho từng file.

---

## Cách khác (không khuyến nghị): Cloudflare Worker

Nếu không muốn cài userscript, có thể deploy `worker.js` làm proxy rồi dán URL vào
**⚙ Cấu hình → Proxy URL**. **Lưu ý:** pawchive thường chặn IP Cloudflare Worker
(trả 404 + trang challenge), nên cách này hay lỗi. Userscript đáng tin hơn nhiều.

---

## Hạn chế đã biết

- **Chọn thư mục lưu** cần Chrome/Edge (File System Access API). Trình duyệt khác vẫn
  tải được nhưng về Downloads.
- **Tìm creator theo tên** tải cả chỉ mục (`/api/v1/creators`, ~12MB) — hơi nặng.
- pawchive có **chống spam / rate-limit**: quét/tải quá nhanh có thể bị chặn tạm; đợi
  một lúc rồi thử lại. Vào thẳng `pawchive.pw` một lần để lấy cookie giúp đỡ bị chặn.
- Chỉ tải được **nội dung công khai**.
- Favorites theo **từng trình duyệt/máy**; dùng Xuất/Nhập JSON để mang đi.
