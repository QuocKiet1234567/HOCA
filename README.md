# Ban Quản lý dự án phường Bình tân — Hồ cá 3D

Ứng dụng Three.js chạy trên trình duyệt có WebGL, mô phỏng hồ cá thư giãn trong không gian văn phòng. Toàn bộ mô hình được dựng bằng mã. Giao diện hiện chạy chế độ cá nhân và lưu hồ trong trình duyệt; chế độ bạn bè đã tắt theo yêu cầu. Mã máy chủ và kiểm thử bạn bè được giữ lại để phát triển sau.

## Chạy

```sh
npm install
npm run dev
```

Mở http://localhost:5173. Máy chủ lắng nghe trên các giao diện mạng. Thiết bị cùng Wi-Fi truy cập `http://<IP-LAN-máy-chủ>:5173` (có thể cần cho phép Node.js qua tường lửa mạng riêng). Các thiết bị phải dùng cùng địa chỉ máy chủ; gửi link `localhost` cho bạn bè sẽ không hoạt động.

Chạy bản phát hành: `npm run build`, sau đó `npm start`. `npm run preview` chỉ xem giao diện tĩnh, không cung cấp API bạn bè. Có thể đặt biến môi trường `PORT` để đổi cổng.

## Chế độ bạn bè (đã tắt trên giao diện)

Phần dưới ghi lại chức năng máy chủ trước đây; các nút này hiện không xuất hiện trên giao diện.

1. Bấm **Bạn bè & hồ cá**, nhập tên để tạo hồ riêng.
2. Gửi mã kết bạn hoặc sao chép lời mời cho bạn bè trên cùng máy chủ.
3. Người nhận nhập mã, gửi lời mời; người còn lại bấm **Đồng ý**.
4. **Ghé hồ** để xem hồ của bạn; **Về hồ của tôi** để tiếp tục chăm sóc.
5. **Tặng cá** chuyển một cá từ hồ của bạn sang hồ người nhận. Mỗi hồ giữ ít nhất 1 cá và chứa tối đa 24 cá.

Danh sách bạn bè, hồ đang thăm và quà tặng cập nhật khoảng 4 giây một lần khi tab đang mở. Người ghé thăm chỉ được xem hồ; chăm sóc tác động lên hồ riêng. Màu cá được dựng theo thứ tự trong hồ; quà tặng chuyển số lượng cá, chưa chọn từng cá thể.

Máy chủ lưu dữ liệu trong `data/players.json` (không đưa vào Git); cần sao lưu thư mục này. Danh tính khách được giữ bằng khóa riêng trong localStorage. Chưa có đăng nhập hoặc khôi phục tài khoản: xóa dữ liệu trình duyệt sẽ mất quyền truy cập hồ. Chế độ chơi thử trước khi tạo hồ vẫn lưu riêng trong trình duyệt; tạo danh tính mới bắt đầu với 8 cá.

Để bạn bè ở khác mạng cùng chơi, cần triển khai cả máy chủ Node.js và giao diện lên dịch vụ có HTTPS, ổ lưu dữ liệu bền vững và cùng một tiến trình máy chủ. Bản hiện tại phục vụ nhóm nhỏ, chưa có đồng bộ cơ sở dữ liệu giữa nhiều máy chủ hay tài khoản đăng nhập.

Kiểm tra: `npm test` kiểm thử hai người chơi, kết bạn, quyền ghé thăm, chuyển cá, giới hạn, lưu và tải lại sau khởi động.

## Tương tác

- Ánh sáng ban ngày đã giảm độ chói, tách đèn văn phòng khỏi đèn hồ. Dùng thanh **Độ sáng hồ** (50–140%) để chỉnh riêng hồ; mức chọn được lưu trong trình duyệt.
- Ban đêm vẫn thấy văn phòng lờ mờ, đèn màn hình và hồ cá nổi bật. Văn phòng mở rộng 64 × 60 đơn vị, có 8 người đi lại và 12 người ngồi gõ máy tính. **Xem toàn văn phòng** đổi sang góc rộng; nút tạm dừng áp dụng cả người đi lại lẫn người ngồi làm việc.

- **Thêm cá** mở bảng 8 loài: cá vàng, neon, thần tiên, cá đĩa, bảy màu, koi, betta và cá chuột. Chọn loài rồi bấm **Thả vào hồ**. Loài được lưu khi tải lại trang. Đây là hồ mô phỏng tự do, không phải hướng dẫn phối loài nuôi thật.
- **♫** mở bảng nhạc: bấm **Phát nhạc**, chỉnh âm lượng hoặc tắt/bật lớp tiếng nước. Giai điệu ambient được tổng hợp bằng Web Audio ngay trên máy, không tải nhạc và không cần mạng. Cần người dùng bấm phát theo quy định của trình duyệt.
- Nhân vật có khuôn mặt, trang phục công sở và khớp tay/chân chi tiết hơn. Cá có tỷ lệ hình thể, hoa văn, vây và tốc độ theo loài; thân uốn nhẹ khi bơi. Kính dùng truyền sáng và chiết suất. Đây vẫn là mô hình thủ tục; chưa dùng nhân vật quét 3D hoặc mô phỏng nước quang học đầy đủ nên chưa đạt độ chân thực như video.

- Không gian văn phòng 3D có bàn, ghế, cửa sổ, tủ gỗ và bốn nhân viên đi lại ở hành lang phía sau hồ.
- **Ngắm gần hồ / Xem toàn văn phòng** để đổi góc máy; nút hoạt động văn phòng tạm dừng người đi lại; **Ẩn thông tin** để ngắm cảnh thoáng hơn.
- Vật liệu cát, đá, gỗ và vảy cá dựng ngay trên máy; ánh gợn nước chuyển động trên nền cát và đá, kính phản chiếu môi trường. Cảnh dùng mô hình thủ tục, chưa phải chất lượng ảnh chụp thực tế.

- Kéo chuột hoặc vuốt để xoay; cuộn hoặc chụm ngón tay để thu phóng.
- Cho ăn bằng nút hoặc phím F, cách nhau 9 giây.
- Thêm cá (tối đa 24), bật/tắt cây, đổi ngày/đêm.
- Bật âm thanh nước, đặt lại góc nhìn, toàn màn hình, tải ảnh PNG.
- Hồ khách chơi thử lưu trong trình duyệt; hồ đã tạo tên được lưu trên máy chủ.

Âm thanh chỉ phát sau khi bật. Đây là trò chơi thư giãn dạng sandbox, chưa có cơ chế tiền tệ, sinh trưởng hoặc tài khoản. Google Fonts là tùy chọn; khi mất mạng ứng dụng dùng phông hệ thống.
