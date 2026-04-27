package movie.swp391.service;

import java.io.UnsupportedEncodingException;

public interface VNpayService {

      String createPaymentUrl(Integer orderId, Double amount, String ipAddress) throws UnsupportedEncodingException;










}
