package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movie.swp391.entity.TicketBooking;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.SeatRepository;
import movie.swp391.repository.TicketBookingRepository;
import movie.swp391.service.VNpayService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNpayService {



    private final SeatRepository seatRepository;
    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.url}")
    private String vnpUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    private final TicketBookingRepository ticketBookingRepository;
    public String createPaymentUrl(Integer orderId, Double amount, String ipAddress) throws UnsupportedEncodingException {
        TicketBooking booking = ticketBookingRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorHandler.BOOKING_INVALID));
        LocalDateTime now = LocalDateTime.now();
        int minutes = (int) Duration.between(now, booking.getBookingDate().plusMinutes(5)).toMinutes();
        Map<String, String> params = new HashMap<>();
        String returnUrl1 = "https://sixcinema.site/payment-success?orderId=" + orderId;
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amount.longValue() * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", orderId.toString());
        params.put("vnp_OrderInfo", "Thanh toan don hang#" + orderId );
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl1);
        params.put("vnp_IpAddr", ipAddress);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = sdf.format(new Date());
        params.put("vnp_CreateDate", createDate);

        Calendar expireCalendar = Calendar.getInstance();
        expireCalendar.setTime(new Date());
        expireCalendar.add(Calendar.MINUTE, minutes);
        String expireDate = sdf.format(expireCalendar.getTime());
        params.put("vnp_ExpireDate", expireDate);

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString())).append('&');
                query.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString())).append('&');
            }
        }
        hashData.deleteCharAt(hashData.length() - 1); // Xóa ký tự '&' cuối cùng
        query.deleteCharAt(query.length() - 1); // Xóa ký tự '&' cuối cùng
        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(URLEncoder.encode(secureHash, StandardCharsets.UTF_8.toString()));


        return vnpUrl + "?" + query;
    }


    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Lỗi khi tạo chữ ký HMAC SHA512", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }



    public boolean validateCallback(Map<String, String> params) {

        String receivedHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        log.info("VNPay Callback Params: {}", params);

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(fieldValue).append('&'); // Không encode giá trị
            }
        }
        if (hashData.length() > 0) {
            hashData.deleteCharAt(hashData.length() - 1);
        }

        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());
        return calculatedHash.equalsIgnoreCase(receivedHash);
    }

    public String refundPayment(String txnRef, Long amount, String transactionDate, String refundType, String user, String ipAddr) throws IOException {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "refund");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amount * 100)); // amount in VND * 100
        params.put("vnp_TransactionType", refundType); // "02" = Full Refund, "03" = Partial Refund
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Hoan tien giao dich " + txnRef);
        params.put("vnp_TransactionNo", ""); // Bỏ trống trên SANDBOX, production thì truyền mã trả về từ kết quả thanh toán
        params.put("vnp_TransDate", transactionDate); // Định dạng yyyyMMddHHmmss, trùng với giao dịch gốc
        params.put("vnp_CreateBy", user);
        params.put("vnp_IpAddr", ipAddr);

        // Tạo hashData, sort key như thanh toán
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder postData = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)).append('&');
                postData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)).append('&');
            }
        }
        hashData.deleteCharAt(hashData.length() - 1);
        postData.deleteCharAt(postData.length() - 1);

        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        postData.append("&vnp_SecureHash=").append(URLEncoder.encode(secureHash, StandardCharsets.UTF_8));

        URL url = new URL(vnpUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        OutputStream os = conn.getOutputStream();
        os.write(postData.toString().getBytes(StandardCharsets.UTF_8));
        os.flush();
        os.close();

        int responseCode = conn.getResponseCode();
        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        if (responseCode == 200) {
            return response.toString();
        } else {
            throw new RuntimeException("Refund request to VNPay failed, HTTP code: " + responseCode);
        }
    }


}
