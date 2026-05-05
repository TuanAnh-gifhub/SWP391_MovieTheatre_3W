package movie.swp391.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorHandler {
    LIST_EMPTY(200, "Danh sách rỗng",HttpStatus.OK),
    UNCATEGORIZED_EXCEPTION(999, "lỗi không xác thức", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_NOT_EXISTED(404, "người dùng không tồn tại", HttpStatus.NOT_FOUND),
    MOVIE_NOT_EXISTED(404, "Phim không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(401, "Lỗi xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "Bạn bị cấm truy cập vào trang này", HttpStatus.FORBIDDEN),
    INVALID_KEY(400, "lỗi key", HttpStatus.BAD_REQUEST),
    MOVIE_EXIST(405, "Không được tạo phim đã tồn tại", HttpStatus.BAD_REQUEST),
    IDENTITY_CARD_EXIST(405, "Chứng minh nhân dân đã tồn tại", HttpStatus.BAD_REQUEST),
    EMAIL_EXIST(405, "Email đã tồn tại", HttpStatus.BAD_REQUEST),
    PHONE_EXIST(405, "Số điện thoại đã tồn tại", HttpStatus.BAD_REQUEST),
    FROM_DATE_INVALID(406, "Từ ngày không được lớn hơn hôm nay", HttpStatus.BAD_REQUEST),
    TO_DATE_INVALID(406, "Đến ngày không được nhỏ hơn từ ngày", HttpStatus.BAD_REQUEST),
    JSON_INVALID(402, "Json không hợp ", HttpStatus.BAD_REQUEST),
    DATE_EXIST(405, "Từ ngày với đến ngày không đã tồn tại", HttpStatus.BAD_REQUEST),
    DATE_NOT_EXIST(404, "Chọn ngày không tồn tại trong dữ liệu", HttpStatus.BAD_REQUEST),
    MOVIE_IN_ACTIVE(407, "Phim này đang hoạt động, phải tắt hoạt động mới được xóa hoặc cập nhật", HttpStatus.BAD_REQUEST),
    MOVIE_IN_SHOWTIME(407, null ,HttpStatus.BAD_REQUEST),
    MOVIE_STATUS_NOT_EXIST(404, "Id ngày chọn không có" ,HttpStatus.BAD_REQUEST),
    TMDB_API_UNAVAILABLE(301,"TMDB Api không tồn tại hoặc sai URL", HttpStatus.SERVICE_UNAVAILABLE),
    INVALID_TMDB_RESPONSE(302,"Chuỗi trả về không đúng định dạng", HttpStatus.BAD_GATEWAY),
    ROLE_NOT_FOUND(404,"ROlE này không tồn tại", HttpStatus.BAD_GATEWAY),
    CUSTOMER_NOT_FOUND(404,"Customer này không tồn tại", HttpStatus.BAD_GATEWAY),
    LIST_CINEMA_ROOM_NOT_FOUND(404," list phòng này có id không tồn tại", HttpStatus.BAD_GATEWAY),
    CINEMA_ROOM_NOT_FOUND(404,"phòng này có không tồn tại", HttpStatus.BAD_GATEWAY),
    CINEMA_NOT_FOUND(404,"Rạp này không tồn tại", HttpStatus.BAD_GATEWAY),
    SHOWTIME_NOT_EXISTED(404,"showtime này có không tồn tại", HttpStatus.BAD_GATEWAY ),
    SHOWTIME_IN_ACTIVE(407,"showtime này đang hoạt động không thể xóa hoặc chỉnh sửa", HttpStatus.BAD_GATEWAY ),
    INVALID_SHOWTIME(406, "showtime không hợp lệ", HttpStatus.BAD_REQUEST),
    PAYMENT_NULL(504, "Bạn cần chọn phương thức trả" ,HttpStatus.BAD_REQUEST),
    PAYMENT_OUT_TIME(505,"thanh toán đã hết hạn" ,HttpStatus.BAD_REQUEST ),
    BOOKING_INVALID(404,"Không có booking này" ,  HttpStatus.BAD_REQUEST),
    SEAT_NOT_FOUND(404,"chố ngồi này có không tồn tại", HttpStatus.BAD_GATEWAY),
    SEAT_NOT_BELONG(408,"chố ngồi này không thuộc phòng này", HttpStatus.BAD_GATEWAY) ,
    SEAT_IN_ACTIVE(407, null ,HttpStatus.BAD_REQUEST),
    SEAT_ALREADY_EXISTS(405, null, HttpStatus.BAD_REQUEST ),
    DUPLICATE_SEAT_IN_REQUEST(409,null,HttpStatus.BAD_REQUEST),
    CINEMA_ROOM_FULL(410, null, HttpStatus.BAD_REQUEST),
    SEAT_TYPE_NOT_FOUND(404, "Loại ghế không tồn tại", HttpStatus.BAD_REQUEST),
    SEAT_TYPE_ALREADY_EXISTS(405, "Loại ghế đã tồn tại", HttpStatus.BAD_REQUEST),
    SEAT_TYPE_IN_USE(409, "Loại ghế đang được sử dụng", HttpStatus.BAD_REQUEST),
    PROMOTION_TITLE_REQUIRED(400, "Tiêu đề khuyến mãi không được để trống", HttpStatus.BAD_REQUEST),
    PROMOTION_DETAIL_REQUIRED(400, "Chi tiết khuyến mãi không được để trống", HttpStatus.BAD_REQUEST),
    PROMOTION_VALUE_INVALID(400, "Giá trị khuyến mãi phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    PROMOTION_IMAGE_REQUIRED(400, "Hình ảnh khuyến mãi không được để trống", HttpStatus.BAD_REQUEST),
    PROMOTION_TYPE_REQUIRED(400, "Loại khuyến mãi không được để trống", HttpStatus.BAD_REQUEST),
    PROMOTION_TYPE_INVALID(400, "Loại khuyến mãi không hợp lệ", HttpStatus.BAD_REQUEST),
    PROMOTION_CONDITION_REQUIRED(400, "Điều kiện khuyến mãi không được để trống", HttpStatus.BAD_REQUEST),
    PROMOTION_END_TIME_INVALID(400, "Thời gian kết thúc phải sau hiện tại", HttpStatus.BAD_REQUEST),
    PROMOTION_TIME_INVALID(400, "Thời gian kết thúc phải sau thời gian bắt đầu", HttpStatus.BAD_REQUEST),
    NOT_FOUND(404,"Không tìm thấy: ",HttpStatus.BAD_REQUEST),
    AUTO_CANNOT_CREATE_FULL_SHOWTIME(411, null, HttpStatus.BAD_REQUEST),
    COUPON_CODE_ALREADY_EXISTS(405,null ,HttpStatus.BAD_REQUEST ),
    COUPON_NOT_FOUND(404, null ,HttpStatus.BAD_REQUEST ),
    COUPON_INACTIVE(407,null ,HttpStatus.BAD_REQUEST ),
    COUPON_EXPIRED(400,null ,HttpStatus.BAD_REQUEST ),
    COUPON_LIMIT_REACHED(410,null ,HttpStatus.BAD_REQUEST ),

    LOYALTY_TIER_NOT_FOUND(404,"Không có bảng xếp hạng độ quân tâm này" , HttpStatus.BAD_REQUEST ),

    DUPLICATE_LOYALTY_TIER_NAME(405, null, HttpStatus.BAD_REQUEST),
    LOYALTY_RULE_IN_ACTIVE(407, null ,HttpStatus.BAD_REQUEST ),
    LOYALTY_RULE_NOT_FOUND(404,null , HttpStatus.BAD_REQUEST),
    COUPON_ALREADY_USED(412,null ,HttpStatus.BAD_REQUEST ),
    FUNCTION_NOT_FOUND(404,null , HttpStatus.BAD_REQUEST),
    ONLY_ONE_RULE_ACTIVE(413, null  , HttpStatus.BAD_REQUEST ),
    PAY_NOT_ENOUGH_POINT(414,null ,HttpStatus.BAD_REQUEST ),
    PERCENTAGE_MUST_100(415,"Phần trăm cộng lại phải 100" , HttpStatus.BAD_REQUEST),
    PROMOTION_NOT_FOUND(404,null , HttpStatus.BAD_REQUEST ),
    INVALID_INPUT(402,"đầu vào không hợp lệ" ,HttpStatus.BAD_REQUEST ),
    VALIDATION_FAILED(402,null, HttpStatus.BAD_REQUEST),
    SORT_BY_INVALID(400, "Giá trị sortBy không hợp lệ. Chỉ chấp nhận 'totalOrders' hoặc 'totalSpent", HttpStatus.BAD_REQUEST),
    DIRECTION_INVALID(400, "Giá trị direction không hợp lệ. Phải là 'asc' hoặc 'desc", HttpStatus.BAD_REQUEST);



    ErrorHandler(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
