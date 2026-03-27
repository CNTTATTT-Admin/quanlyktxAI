package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.RoomStatus;
import com.cntt.rentalmanagement.domain.enums.InvoiceStatus;
import com.cntt.rentalmanagement.domain.models.Contract;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.models.Invoice;
import com.cntt.rentalmanagement.domain.payload.request.TotalNumberRequest;
import com.cntt.rentalmanagement.domain.payload.response.CostResponse;
import com.cntt.rentalmanagement.domain.payload.response.RevenueResponse;
import com.cntt.rentalmanagement.domain.payload.response.TotalNumberResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.ContractRepository;
import com.cntt.rentalmanagement.repository.MaintenanceRepository;
import com.cntt.rentalmanagement.repository.RoomRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.repository.InvoiceRepository;
import com.cntt.rentalmanagement.services.BaseService;
import com.cntt.rentalmanagement.services.StatisticalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Comparator;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@RequiredArgsConstructor
public class StatisticalServiceImpl extends BaseService implements StatisticalService {

    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    public TotalNumberRequest getNumberOfRentalerForStatistical() {
        User user = userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
        int total = 0;
        for (Contract contract : contractRepository.getAllContract(getUserId())) {
            Room room = contract.getRoom();
            Duration duration = Duration.between(contract.getCreatedAt(), contract.getDeadlineContract());
            long months = duration.toMinutes() / (60 * 24 * 30);
            
            BigDecimal monthlyTotal = room.getPrice()
                .add(room.getSplitWaterCost())
                .add(room.getSplitElectricCost())
                .add(room.getSplitInternetCost());
                
            total += months * monthlyTotal.intValue();
        }


        TotalNumberRequest totalNumberRequest = new TotalNumberRequest();
        totalNumberRequest.setNumberOfRoom((int) roomRepository.countAllByUser(user));
        totalNumberRequest.setNumberOfEmptyRoom((int) roomRepository.countAllByStatusAndUser(RoomStatus.AVAILABLE,user));
        totalNumberRequest.setNumberOfPeople((int) contractRepository.sumNumOfPeople());
        totalNumberRequest.setRevenue(BigDecimal.valueOf(total));
        return totalNumberRequest;
    }

    @Override
    public TotalNumberResponse getStatisticalNumberOfAdmin() {
        TotalNumberResponse totalNumberResponse = new TotalNumberResponse();
        totalNumberResponse.setNumberOfAccount((int) userRepository.count());
        totalNumberResponse.setNumberOfApprove((int) roomRepository.countByIsApprove(true));
        totalNumberResponse.setNumberOfApproving((int) roomRepository.countByIsApprove(false));
        totalNumberResponse.setNumberOfAccountLocked((int) roomRepository.count());
        return totalNumberResponse;
    }

    // @Override
    // public Page<RevenueResponse> getByMonth() {
    //     List<RevenueResponse> list = new ArrayList<>();

    //     Map<YearMonth, Integer> monthTotalMap = new HashMap<>(); // Sử dụng Map để theo dõi tổng theo từng tháng

    //     for (Contract contract : contractRepository.getAllContract(getUserId())) {
    //         LocalDateTime endDate = contract.getCreatedAt().withMonth(12).withDayOfMonth(31);

    //         YearMonth currentMonth = YearMonth.from(contract.getCreatedAt());
    //         YearMonth endMonth = YearMonth.from(endDate);

    //         while (currentMonth.isBefore(endMonth) || currentMonth.equals(endMonth)) {
    //             int months = (int) currentMonth.until(endMonth, ChronoUnit.MONTHS);

    //             Integer total = monthTotalMap.get(currentMonth);
    //             if (total == null) {
    //                 total = 0;
    //             }

    //             total += months * contract.getRoom().getPrice().intValue();
    //             monthTotalMap.put(currentMonth, total);

    //             currentMonth = currentMonth.plusMonths(1);
    //         }
    //     }

    //     for (Map.Entry<YearMonth, Integer> entry : monthTotalMap.entrySet()) {
    //         RevenueResponse response = new RevenueResponse();
    //         response.setMonth(entry.getKey().getMonthValue());
    //         response.setRevenue(BigDecimal.valueOf(entry.getValue()));
    //         list.add(response);
    //     }

    //     return new PageImpl<>(list);
    // }
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<RevenueResponse> getByMonth() {
        List<RevenueResponse> list = new ArrayList<>();
        Map<YearMonth, RevenueDetails> monthTotalMap = new HashMap<>();
        
        YearMonth realNowMonth = YearMonth.now(); 
        int currentYear = LocalDate.now().getYear();

        //tiền phòng + net
        for (Contract contract : contractRepository.getAllContract(getUserId())) {
            LocalDateTime defaultEndDate = contract.getCreatedAt().withMonth(12).withDayOfMonth(31);
            YearMonth currentMonth = YearMonth.from(contract.getCreatedAt());
            YearMonth endMonth = YearMonth.from(defaultEndDate);
            
            if (realNowMonth.isBefore(endMonth)) {
                endMonth = realNowMonth;
            }
            
            if (contract.getDeadlineContract() != null) {
                YearMonth contractEndMonth = YearMonth.from(contract.getDeadlineContract());
                if (contractEndMonth.isBefore(endMonth)) {
                    endMonth = contractEndMonth;
                }
            }
    
            while (currentMonth.isBefore(endMonth) || currentMonth.equals(endMonth)) {
                RevenueDetails details = monthTotalMap.getOrDefault(currentMonth, new RevenueDetails());
            
                details.revenue += (contract.getRoom().getPrice() != null) ? contract.getRoom().getPrice().longValue() : 0L;
                details.internetCost += (contract.getRoom().getInternetCost() != null) ? contract.getRoom().getInternetCost().longValue() : 0L;
            
                monthTotalMap.put(currentMonth, details);
                currentMonth = currentMonth.plusMonths(1);
            }
        }

        //Tiền điện + nước
        String sql = "SELECT e.month, SUM(e.total_money_of_electric), SUM(e.total_money_of_water) " +
                     "FROM electric_and_water e " +
                     "JOIN room r ON e.room_id = r.id " +
                     "WHERE r.user_id = :rentalerId AND e.paid = 1 " + // CHỈ LẤY HÓA ĐƠN ĐÃ THU TIỀN
                     "GROUP BY e.month";

        List<Object[]> ewResults = entityManager.createNativeQuery(sql)
                .setParameter("rentalerId", getUserId())
                .getResultList();

        for (Object[] row : ewResults) {
            if (row[0] != null) {
                int month = ((Number) row[0]).intValue();
                
                // Loại bỏ dữ liệu rác và không cho hiển thị vượt quá tháng hiện tại
                if (month >= 1 && month <= 12 && month <= realNowMonth.getMonthValue()) {
                    long electric = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                    long water = row[2] != null ? ((Number) row[2]).longValue() : 0L;

                    YearMonth ym = YearMonth.of(currentYear, month);
                    RevenueDetails details = monthTotalMap.getOrDefault(ym, new RevenueDetails());
                    
                    // CỘNG DOANH THU ĐIỆN NƯỚC THỰC TẾ VÀO BIỂU ĐỒ
                    details.publicElectricCost += electric;
                    details.waterCost += water;
                    monthTotalMap.put(ym, details);
                }
            }
        }

        //tiền gửi xe
        List<Invoice> paidInvoices = invoiceRepository.findPaidInvoicesByRentaler(getUserId(), InvoiceStatus.PAID);
        for (Invoice invoice : paidInvoices) {
            if (invoice.getPaidAt() != null) {
                YearMonth paidMonth = YearMonth.from(invoice.getPaidAt());
                if (!paidMonth.isAfter(realNowMonth)) {
                    RevenueDetails details = monthTotalMap.getOrDefault(paidMonth, new RevenueDetails());
                    details.parkingCost += (invoice.getAmount() != null) ? invoice.getAmount().longValue() : 0L;
                    monthTotalMap.put(paidMonth, details);
                }
            }
        }
    
        // ========================================================
        // PHẦN 4: ĐÓNG GÓI DỮ LIỆU
        // ========================================================
        for (Map.Entry<YearMonth, RevenueDetails> entry : monthTotalMap.entrySet()) {
            if (entry.getKey().getYear() == currentYear) { // Lọc cho gọn gàng, chỉ hiện năm nay
                RevenueResponse response = new RevenueResponse();
                response.setMonth(entry.getKey().getMonthValue());
                RevenueDetails details = entry.getValue();
                
                response.setRevenue(BigDecimal.valueOf(details.revenue));
                response.setWaterCost(BigDecimal.valueOf(details.waterCost));
                response.setPublicElectricCost(BigDecimal.valueOf(details.publicElectricCost));
                response.setInternetCost(BigDecimal.valueOf(details.internetCost));
                response.setParkingCost(BigDecimal.valueOf(details.parkingCost));
                
                list.add(response);
            }
        }

        list.sort(Comparator.comparingInt(RevenueResponse::getMonth));
        return new PageImpl<>(list);
    }
    
    // Class để theo dõi chi tiết doanh thu và chi phí
    class RevenueDetails {
        long revenue = 0;
        long waterCost = 0;
        long publicElectricCost = 0;
        long internetCost = 0;
        long parkingCost = 0;
    }

    @Override
    public Page<CostResponse> getByCost() {
        int total = 0;
        for (Contract contract : contractRepository.getAllContract(getUserId())) {
            Duration duration = Duration.between(contract.getCreatedAt(), contract.getDeadlineContract());
            long months = duration.toMinutes() / (60 * 24 * 30);
            total += months * contract.getRoom().getPrice().intValue();
        }

        List<CostResponse> costResponses = new ArrayList<>();
        CostResponse costResponse1 = new CostResponse();
        costResponse1.setName("Doanh thu");
        costResponse1.setCost(BigDecimal.valueOf(total));

        CostResponse costResponse2 = new CostResponse();
        costResponse2.setCost(maintenanceRepository.sumPriceOfMaintenance(getUserId()));
        costResponse2.setName("Bảo trì");

        costResponses.add(costResponse1);
        costResponses.add(costResponse2);
        return new PageImpl<>(costResponses);
    }
}
