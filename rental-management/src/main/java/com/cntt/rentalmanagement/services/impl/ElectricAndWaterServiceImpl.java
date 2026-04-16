package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.models.ElectricAndWater;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.response.ElectricAndWaterResponse;
import com.cntt.rentalmanagement.repository.ContractRepository;
import com.cntt.rentalmanagement.repository.ElectricAndWaterRepository;
import com.cntt.rentalmanagement.repository.RoomRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.services.ElectricAndWaterService;
import com.cntt.rentalmanagement.services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ElectricAndWaterServiceImpl implements ElectricAndWaterService {
    @Autowired
    private ElectricAndWaterRepository electricAndWaterRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private RoomService roomService;
    @Autowired
    private ContractRepository contractRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public ElectricAndWater saveElectric(ElectricAndWater electricAndWater) {
        electricAndWater.setPaid(false);
        if (electricAndWater.getInternetCost() == null) {
            electricAndWater.setInternetCost(BigDecimal.ZERO);
        }
        int deviatedBlock = electricAndWater.getThisMonthBlockOfWater() - electricAndWater.getLastMonthBlockOfWater();
        int deviatedNumber = electricAndWater.getThisMonthNumberOfElectric() - electricAndWater.getLastMonthNumberOfElectric();
        BigDecimal totalMoneyOfWater = deviatedBlock > 0 ? electricAndWater.getMoneyEachBlockOfWater().multiply(BigDecimal.valueOf(deviatedBlock)) : BigDecimal.ZERO;
        BigDecimal totalMoneyOfElectric = deviatedNumber > 0 ? electricAndWater.getMoneyEachNumberOfElectric().multiply(BigDecimal.valueOf(deviatedNumber)) : BigDecimal.ZERO;
        electricAndWater.setTotalMoneyOfWater(totalMoneyOfWater);
        electricAndWater.setTotalMoneyOfElectric(totalMoneyOfElectric);

        Room room = roomRepository.findById(electricAndWater.getRoom().getId())
            .orElseThrow(() -> new RuntimeException("Room not found"));

        int totalUsersToPay = room.getCurrentOccupancy() > 0 ? room.getCurrentOccupancy() : 1;
        electricAndWater.setTotalUsersToPay(totalUsersToPay);
        electricAndWater.setPaidUsersCount(0);
        electricAndWater.setPaidUserIds("");

        electricAndWater.setRoom(room);
        room.setPublicElectricCost(totalMoneyOfElectric);
        room.setWaterCost(totalMoneyOfWater);
        room.setInternetCost(electricAndWater.getInternetCost());
        roomRepository.save(room);
        return electricAndWaterRepository.save(electricAndWater);
    }

    @Override
    @Transactional
    public ElectricAndWater updateElectric(ElectricAndWater electricAndWater, Long id) {
        return electricAndWaterRepository.findById(id)
            .map(electricAndWater1 -> {
                BigDecimal internetCost = electricAndWater.getInternetCost() != null ? electricAndWater.getInternetCost() : BigDecimal.ZERO;
                int deviatedBlock = electricAndWater.getThisMonthBlockOfWater() - electricAndWater.getLastMonthBlockOfWater();
                int deviatedNumber = electricAndWater.getThisMonthNumberOfElectric() - electricAndWater.getLastMonthNumberOfElectric();
                BigDecimal totalMoneyOfWater = deviatedBlock > 0 ? electricAndWater.getMoneyEachBlockOfWater().multiply(BigDecimal.valueOf(deviatedBlock)) : BigDecimal.ZERO;
                BigDecimal totalMoneyOfElectric = deviatedNumber > 0 ? electricAndWater.getMoneyEachNumberOfElectric().multiply(BigDecimal.valueOf(deviatedNumber)) : BigDecimal.ZERO;

                Room room = roomRepository.findById(electricAndWater.getRoom().getId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
                electricAndWater1.setRoom(room);
                electricAndWater1.setMonth(electricAndWater.getMonth());
                electricAndWater1.setName(electricAndWater.getName());

                electricAndWater1.setLastMonthBlockOfWater(electricAndWater.getLastMonthBlockOfWater());
                electricAndWater1.setThisMonthBlockOfWater(electricAndWater.getThisMonthBlockOfWater());
                electricAndWater1.setMoneyEachBlockOfWater(electricAndWater.getMoneyEachBlockOfWater());
                electricAndWater1.setTotalMoneyOfWater(totalMoneyOfWater);

                electricAndWater1.setLastMonthNumberOfElectric(electricAndWater.getLastMonthNumberOfElectric());
                electricAndWater1.setThisMonthNumberOfElectric(electricAndWater.getThisMonthNumberOfElectric());
                electricAndWater1.setMoneyEachNumberOfElectric(electricAndWater.getMoneyEachNumberOfElectric());
                electricAndWater1.setTotalMoneyOfElectric(totalMoneyOfElectric);
                electricAndWater1.setInternetCost(internetCost);
                // Mỗi lần sửa hóa đơn, reset trạng thái thanh toán để đảm bảo không lệch tiền đã chia.
                int totalUsersToPay = room.getCurrentOccupancy() > 0 ? room.getCurrentOccupancy() : 1;
                electricAndWater1.setTotalUsersToPay(totalUsersToPay);
                electricAndWater1.setPaidUsersCount(0);
                electricAndWater1.setPaidUserIds("");
                electricAndWater1.setPaid(false);

                room.setPublicElectricCost(totalMoneyOfElectric);
                room.setWaterCost(totalMoneyOfWater);
                room.setInternetCost(internetCost);
                roomRepository.save(room);
                return electricAndWaterRepository.save(electricAndWater1);
            })
            .orElseThrow(() -> new RuntimeException("Electric not found with id " + id));
    }

    @Override
    public List<ElectricAndWaterResponse> getElectricByRoom(Long id) {
        return electricAndWaterRepository.findByRoomId(id)
            .stream()
            .sorted(Comparator
                .comparing(ElectricAndWater::isPaid)
                .thenComparing(ElectricAndWater::getId, Comparator.reverseOrder()))
            .map(electricAndWater -> toResponse(electricAndWater, null))
            .toList();
    }

    @Override
    public List<ElectricAndWaterResponse> getElectricHistoryByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Long> roomIds = new LinkedHashSet<>();
        if (user.getAllocatedRoom() != null) {
            roomIds.add(user.getAllocatedRoom().getId());
        }

        contractRepository.findByStudentId(userId).forEach(contract -> {
            if (contract.getRoom() != null && contract.getRoom().getId() != null) {
                roomIds.add(contract.getRoom().getId());
            }
        });

        if (roomIds.isEmpty()) {
            return List.of();
        }

        return electricAndWaterRepository.findByRoomIdIn(new ArrayList<>(roomIds))
            .stream()
            .sorted(Comparator
                .comparing(ElectricAndWater::isPaid)
                .thenComparing(ElectricAndWater::getId, Comparator.reverseOrder()))
            .map(electricAndWater -> toResponse(electricAndWater, userId))
            .toList();
    }

    @Override
    public ElectricAndWaterResponse getElectricAndWater(Long id) {
        return electricAndWaterRepository.findById(id)
            .map(electricAndWater -> {
                ElectricAndWaterResponse electricAndWaterResponse = new ElectricAndWaterResponse();
                electricAndWaterResponse.setId(electricAndWater.getId());
                electricAndWaterResponse.setName(electricAndWater.getName());
                electricAndWaterResponse.setMonth(electricAndWater.getMonth());
                electricAndWaterResponse.setLastMonthBlockOfWater(electricAndWater.getLastMonthBlockOfWater());
                electricAndWaterResponse.setThisMonthBlockOfWater(electricAndWater.getThisMonthBlockOfWater());
                electricAndWaterResponse.setMoneyEachBlockOfWater(electricAndWater.getMoneyEachBlockOfWater());
                electricAndWaterResponse.setTotalMoneyOfWater(electricAndWater.getTotalMoneyOfWater());

                electricAndWaterResponse.setLastMonthNumberOfElectric(electricAndWater.getLastMonthNumberOfElectric());
                electricAndWaterResponse.setThisMonthNumberOfElectric(electricAndWater.getThisMonthNumberOfElectric());
                electricAndWaterResponse.setMoneyEachNumberOfElectric(electricAndWater.getMoneyEachNumberOfElectric());
                electricAndWaterResponse.setTotalMoneyOfElectric(electricAndWater.getTotalMoneyOfElectric());
                electricAndWaterResponse.setInternetCost(electricAndWater.getInternetCost());

                electricAndWaterResponse.setRoom(roomService.getRoomById(electricAndWater.getRoom().getId()));
                electricAndWaterResponse.setPaid(electricAndWater.isPaid());
                electricAndWaterResponse.setTotalUsersToPay(normalizeTotalUsersToPay(electricAndWater));
                electricAndWaterResponse.setPaidUsersCount(normalizePaidUsersCount(electricAndWater));
                electricAndWaterResponse.setUserPaid(false);
                
                Room room = electricAndWater.getRoom();
                int occupancy = normalizeTotalUsersToPay(electricAndWater);
                if (occupancy > 0) {
                    electricAndWaterResponse.setPerPersonElectric(electricAndWater.getTotalMoneyOfElectric().divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
                    electricAndWaterResponse.setPerPersonWater(electricAndWater.getTotalMoneyOfWater().divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
                    electricAndWaterResponse.setPerPersonInternet((electricAndWater.getInternetCost() != null ? electricAndWater.getInternetCost() : BigDecimal.ZERO)
                        .divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
                } else {
                    electricAndWaterResponse.setPerPersonElectric(electricAndWater.getTotalMoneyOfElectric());
                    electricAndWaterResponse.setPerPersonWater(electricAndWater.getTotalMoneyOfWater());
                    electricAndWaterResponse.setPerPersonInternet(electricAndWater.getInternetCost() != null ? electricAndWater.getInternetCost() : BigDecimal.ZERO);
                }
                return electricAndWaterResponse;
            })
            .orElseThrow(() -> new RuntimeException("Electric not found with id " + id));
    }

    @Override
    public com.cntt.rentalmanagement.domain.payload.response.MessageResponse payElectric(Long id, Long userId) {
        ElectricAndWater electricAndWater = electricAndWaterRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));

        if (electricAndWater.isPaid()) {
            return com.cntt.rentalmanagement.domain.payload.response.MessageResponse.builder().message("Hóa đơn này đã được thanh toán đủ.").build();
        }

        Set<Long> paidUsers = parsePaidUserIds(electricAndWater.getPaidUserIds());
        if (paidUsers.contains(userId)) {
            throw new RuntimeException("Bạn đã thanh toán phần hóa đơn này rồi.");
        }

        paidUsers.add(userId);
        int paidCount = paidUsers.size();
        int totalUsersToPay = normalizeTotalUsersToPay(electricAndWater);

        electricAndWater.setPaidUsersCount(paidCount);
        electricAndWater.setPaidUserIds(joinPaidUserIds(paidUsers));
        electricAndWater.setPaid(paidCount >= totalUsersToPay);

        electricAndWaterRepository.save(electricAndWater);

        if (electricAndWater.isPaid()) {
            return com.cntt.rentalmanagement.domain.payload.response.MessageResponse.builder().message("Thanh toán thành công. Hóa đơn đã được thanh toán đủ.").build();
        }

        return com.cntt.rentalmanagement.domain.payload.response.MessageResponse.builder()
            .message("Thanh toán thành công phần của bạn. Còn " + (totalUsersToPay - paidCount) + " người chưa thanh toán.")
            .build();
    }

    private ElectricAndWaterResponse toResponse(ElectricAndWater electricAndWater, Long currentUserId) {
        ElectricAndWaterResponse electricAndWaterResponse = new ElectricAndWaterResponse();
        electricAndWaterResponse.setId(electricAndWater.getId());
        electricAndWaterResponse.setName(electricAndWater.getName());
        electricAndWaterResponse.setMonth(electricAndWater.getMonth());
        electricAndWaterResponse.setLastMonthBlockOfWater(electricAndWater.getLastMonthBlockOfWater());
        electricAndWaterResponse.setThisMonthBlockOfWater(electricAndWater.getThisMonthBlockOfWater());
        electricAndWaterResponse.setMoneyEachBlockOfWater(electricAndWater.getMoneyEachBlockOfWater());
        electricAndWaterResponse.setTotalMoneyOfWater(electricAndWater.getTotalMoneyOfWater());

        electricAndWaterResponse.setLastMonthNumberOfElectric(electricAndWater.getLastMonthNumberOfElectric());
        electricAndWaterResponse.setThisMonthNumberOfElectric(electricAndWater.getThisMonthNumberOfElectric());
        electricAndWaterResponse.setMoneyEachNumberOfElectric(electricAndWater.getMoneyEachNumberOfElectric());
        electricAndWaterResponse.setTotalMoneyOfElectric(electricAndWater.getTotalMoneyOfElectric());
        electricAndWaterResponse.setInternetCost(electricAndWater.getInternetCost());

        electricAndWaterResponse.setRoom(roomService.getRoomById(electricAndWater.getRoom().getId()));
        electricAndWaterResponse.setPaid(electricAndWater.isPaid());
        electricAndWaterResponse.setTotalUsersToPay(normalizeTotalUsersToPay(electricAndWater));
        electricAndWaterResponse.setPaidUsersCount(normalizePaidUsersCount(electricAndWater));

        Set<Long> paidUsers = parsePaidUserIds(electricAndWater.getPaidUserIds());
        electricAndWaterResponse.setUserPaid(currentUserId != null && paidUsers.contains(currentUserId));

        int occupancy = normalizeTotalUsersToPay(electricAndWater);
        if (occupancy > 0) {
            electricAndWaterResponse.setPerPersonElectric(electricAndWater.getTotalMoneyOfElectric().divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
            electricAndWaterResponse.setPerPersonWater(electricAndWater.getTotalMoneyOfWater().divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
            electricAndWaterResponse.setPerPersonInternet((electricAndWater.getInternetCost() != null ? electricAndWater.getInternetCost() : BigDecimal.ZERO)
                .divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            electricAndWaterResponse.setPerPersonElectric(electricAndWater.getTotalMoneyOfElectric());
            electricAndWaterResponse.setPerPersonWater(electricAndWater.getTotalMoneyOfWater());
            electricAndWaterResponse.setPerPersonInternet(electricAndWater.getInternetCost() != null ? electricAndWater.getInternetCost() : BigDecimal.ZERO);
        }

        return electricAndWaterResponse;
    }

    private int normalizeTotalUsersToPay(ElectricAndWater electricAndWater) {
        Integer totalUsers = electricAndWater.getTotalUsersToPay();
        if (totalUsers != null && totalUsers > 0) {
            return totalUsers;
        }
        Room room = electricAndWater.getRoom();
        int currentOccupancy = room != null ? room.getCurrentOccupancy() : 0;
        return currentOccupancy > 0 ? currentOccupancy : 1;
    }

    private int normalizePaidUsersCount(ElectricAndWater electricAndWater) {
        Integer paidUsersCount = electricAndWater.getPaidUsersCount();
        if (paidUsersCount != null && paidUsersCount >= 0) {
            return paidUsersCount;
        }
        return parsePaidUserIds(electricAndWater.getPaidUserIds()).size();
    }

    private Set<Long> parsePaidUserIds(String paidUserIds) {
        if (paidUserIds == null || paidUserIds.trim().isEmpty()) {
            return new LinkedHashSet<>();
        }
        return Arrays.stream(paidUserIds.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(Long::valueOf)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String joinPaidUserIds(Set<Long> paidUserIds) {
        return paidUserIds.stream()
            .map(String::valueOf)
            .collect(Collectors.joining(","));
    }
}
