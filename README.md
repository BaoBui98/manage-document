npm run migration:generate -- src/database/migrations/CreateDocumentTable
npm run migration:run

---

# 💳 Hướng Dẫn Thiết Lập Thanh Toán Stripe

Để tính năng thanh toán hoạt động, bạn cần cấu hình 2 biến môi trường là `STRIPE_SECRET_KEY` và `STRIPE_WEBHOOK_SECRET` trong file `.env`. Vui lòng làm theo các bước dưới đây:

## 1. Lấy `STRIPE_SECRET_KEY`
Biến này dùng để gọi API của Stripe (Tạo link thanh toán).

1. Truy cập [Stripe Dashboard](https://dashboard.stripe.com/) và tạo hoặc đăng nhập tài khoản.
2. Bật chế độ **Test mode** (Góc trên cùng bên phải màn hình).
3. Vào menu **Developers** -> **API keys**.
4. Ở bảng **Standard keys**, bạn sẽ thấy **Secret key**.
5. Nhấn **Reveal test key**, copy mã (mã này luôn bắt đầu bằng `sk_test_...`).
6. Dán vào file `.env` của bạn:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
   ```

## 2. Lấy `STRIPE_WEBHOOK_SECRET` (Dành cho môi trường Localhost)
Biến này dùng để xác thực chữ ký bảo mật của các request ngầm (Webhook) gửi từ Stripe về máy chủ của bạn (nhằm báo trạng thái đơn hàng đã thanh toán thành công).

Vì máy chủ của Stripe trên Internet không thể tự gọi trực tiếp vào địa chỉ `localhost:5050` trong máy tính của bạn, nên chúng ta cần sử dụng công cụ **Stripe CLI** để giả lập đường ống nhận Webhook.

**Bước 1: Cài đặt Stripe CLI**
* **Windows**: Bạn tải file `.exe` từ [Github Stripe CLI](https://github.com/stripe/stripe-cli/releases/latest) hoặc dùng ứng dụng Scoop.
* **Mac (Homebrew)**: Chạy lệnh `brew install stripe/stripe-cli/stripe`
* **Linux / Ubuntu**: Xem [hướng dẫn cài đặt chi tiết tại đây](https://docs.stripe.com/stripe-cli).

**Bước 2: Đăng nhập Stripe CLI**
Mở terminal/cmd lên và gõ lệnh:
```bash
stripe login
```
*(Bấm Enter để trình duyệt bật lên, sau đó bạn bấm cho phép ứng dụng truy cập tài khoản).*

**Bước 3: Lắng nghe Webhook**
Gõ lệnh sau vào terminal để Stripe bắt đầu chuyển tiếp sự kiện từ Internet về localhost của bạn:
```bash
stripe listen --forward-to localhost:5050/payment/webhook
```
*(Lưu ý: Bạn phải treo Terminal này chạy liên tục thì code mới bắt được webhook).*

**Bước 4: Copy Secret**
Ngay sau khi chạy lệnh trên, terminal sẽ in ra một dòng chữ tương tự như sau:
> *Ready! Your webhook signing secret is **whsec_xxxxxxxxxxxxxxxxxxxxx** (^C to quit)*

Copy đoạn mã bắt đầu bằng chữ `whsec_...` đó và dán vào file `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---
### 💡 Thẻ Tín Dụng Để Test Thanh Toán
Khi trình duyệt chuyển hướng sang giao diện quẹt thẻ của Stripe, bạn hãy nhập thông tin thẻ giả như sau để thanh toán thành công:
* **Số thẻ (Card number)**: `4242 4242 4242 4242`
* **Ngày hết hạn (MM/YY)**: Bất kỳ ngày nào trong tương lai (ví dụ: `12 / 30`)
* **Mã bảo mật (CVC)**: Bất kỳ 3 số nào (ví dụ: `123`)
