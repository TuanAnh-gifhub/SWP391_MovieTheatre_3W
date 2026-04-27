import React, { useEffect, useRef } from "react";
import { Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Html5Qrcode } from "html5-qrcode";

const ScanQrCode = ({ onScan, onClose }) => {
  const qrRegionId = "qr-reader-region";
  const html5QrRef = useRef(null);

  // Hàm extract mã vé từ chuỗi QR code
  const extractTicketCode = (qrData) => {
    // Lấy số sau "bookingId":
    const match = qrData.match(/"bookingId"\s*:\s*(\d+)/);
    return match ? match[1] : qrData;
  };

  // Khởi tạo camera scan khi mở modal
  useEffect(() => {
    const qr = new Html5Qrcode(qrRegionId);
    html5QrRef.current = qr;
    qr
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          const ticketCode = extractTicketCode(decodedText);
          onScan(ticketCode);
          qr.stop();
          onClose();
        },
        (err) => {}
      )
      .catch(() => {
        message.error("Không thể truy cập camera hoặc camera bị lỗi!");
      });
    return () => {
      qr.stop().catch(() => {});
    };
    // eslint-disable-next-line
  }, []);

  // Xử lý khi upload ảnh QR
  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      img.onload = async () => {
        const jsQR = (await import("jsqr")).default;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height);
        if (code) {
          const ticketCode = extractTicketCode(code.data);
          onScan(ticketCode);
          onClose();
        } else {
          message.error("Không nhận diện được mã QR trong ảnh!");
        }
      };
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div>
      <div id={qrRegionId} style={{ width: "100%", marginBottom: 16 }}></div>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleUpload}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Quét từ ảnh QR trên máy</Button>
      </Upload>
    </div>
  );
};

export default ScanQrCode;