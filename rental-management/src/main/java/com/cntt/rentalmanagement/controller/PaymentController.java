package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.config.VNPayConfig;
import com.cntt.rentalmanagement.domain.models.ElectricAndWater;
import com.cntt.rentalmanagement.domain.models.Invoice;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.ElectricAndWaterRepository;
import com.cntt.rentalmanagement.repository.InvoiceRepository;
import com.cntt.rentalmanagement.secruity.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final InvoiceRepository invoiceRepository;
    private final ElectricAndWaterRepository electricAndWaterRepository;
    private final TokenProvider tokenProvider;

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.secretKey}")
    private String secretKey;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    @GetMapping("/create-vnpay-url")
    public ResponseEntity<?> createPaymentUrl(HttpServletRequest request, @RequestParam Long invoiceId) throws Exception {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new BadRequestException("Hóa đơn không tồn tại"));

        //VNPAY yêu cầu số tiền phải nhân lên 100 lần (để tránh số thập phân)
        long amount = invoice.getAmount().longValue() * 100;

        //Mã giao dịch unique
        String vnp_TxnRef = invoiceId + "_" + System.currentTimeMillis(); 

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", tmnCode); 
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB"); // Dùng bank NCB cho môi trường test Sandbox
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan hoa don gui xe #" + invoiceId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

        // Cài đặt thời gian tạo và hết hạn giao dịch (15 phút)
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Thuật toán build chuỗi mã hóa của VNPAY
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        //Tạo chữ ký (Checksum) và gắn vào URL
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;
        //Trả kết quả cho fe
        Map<String, String> response = new HashMap<>();
        response.put("url", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/create-vnpay-url-electric-water")
    public ResponseEntity<?> createElectricWaterPaymentUrl(HttpServletRequest request,
                                                           @RequestParam Long electricWaterId,
                                                           @RequestHeader("Authorization") String token) throws Exception {
        ElectricAndWater bill = electricAndWaterRepository.findById(electricWaterId)
                .orElseThrow(() -> new BadRequestException("Hóa đơn điện nước không tồn tại"));

        token = token.substring(7);
        Long userId = tokenProvider.getUserIdFromToken(token);

        if (bill.isPaid()) {
            throw new BadRequestException("Hóa đơn điện nước này đã được thanh toán");
        }

        String paidUserIds = bill.getPaidUserIds() != null ? bill.getPaidUserIds() : "";
        for (String paidUserId : paidUserIds.split(",")) {
            if (!paidUserId.trim().isEmpty() && Long.valueOf(paidUserId.trim()).equals(userId)) {
                throw new BadRequestException("Bạn đã thanh toán phần hóa đơn này rồi");
            }
        }

        BigDecimal totalElectric = bill.getTotalMoneyOfElectric() != null ? bill.getTotalMoneyOfElectric() : BigDecimal.ZERO;
        BigDecimal totalWater = bill.getTotalMoneyOfWater() != null ? bill.getTotalMoneyOfWater() : BigDecimal.ZERO;
        BigDecimal totalInternet = bill.getInternetCost() != null ? bill.getInternetCost() : BigDecimal.ZERO;

        int occupancy = bill.getTotalUsersToPay() != null ? bill.getTotalUsersToPay() : 0;
        if (occupancy <= 0) {
            occupancy = bill.getRoom() != null ? bill.getRoom().getCurrentOccupancy() : 0;
        }
        BigDecimal amountPerPerson;
        if (occupancy > 0) {
            amountPerPerson = totalElectric.divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP)
                    .add(totalWater.divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP))
                    .add(totalInternet.divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            amountPerPerson = totalElectric.add(totalWater).add(totalInternet);
        }

        long amount = amountPerPerson.longValue() * 100;
        String vnp_TxnRef = "EW_" + electricWaterId + "_" + System.currentTimeMillis();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", tmnCode);
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan hoa don dien nuoc internet #" + electricWaterId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;

        Map<String, String> response = new HashMap<>();
        response.put("url", paymentUrl);
        return ResponseEntity.ok(response);
    }
}