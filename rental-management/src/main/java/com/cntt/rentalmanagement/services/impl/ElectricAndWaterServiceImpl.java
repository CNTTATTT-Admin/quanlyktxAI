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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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
        int deviatedBlock = electricAndWater.getThisMonthBlockOfWater() - electricAndWater.getLastMonthBlockOfWater();
        int deviatedNumber = electricAndWater.getThisMonthNumberOfElectric() - electricAndWater.getLastMonthNumberOfElectric();
        BigDecimal totalMoneyOfWater = deviatedBlock > 0 ? electricAndWater.getMoneyEachBlockOfWater().multiply(BigDecimal.valueOf(deviatedBlock)) : BigDecimal.ZERO;
        BigDecimal totalMoneyOfElectric = deviatedNumber > 0 ? electricAndWater.getMoneyEachNumberOfElectric().multiply(BigDecimal.valueOf(deviatedNumber)) : BigDecimal.ZERO;
        electricAndWater.setTotalMoneyOfWater(totalMoneyOfWater);
        electricAndWater.setTotalMoneyOfElectric(totalMoneyOfElectric);

        Room room = roomRepository.findById(electricAndWater.getRoom().getId())
            .orElseThrow(() -> new RuntimeException("Room not found"));
        electricAndWater.setRoom(room);
        room.setPublicElectricCost(totalMoneyOfElectric);
        room.setWaterCost(totalMoneyOfWater);
        roomRepository.save(room);
        return electricAndWaterRepository.save(electricAndWater);
    }

    @Override
    @Transactional
    public ElectricAndWater updateElectric(ElectricAndWater electricAndWater, Long id) {
        return electricAndWaterRepository.findById(id)
            .map(electricAndWater1 -> {
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
                electricAndWater1.setPaid(electricAndWater.isPaid());

                room.setPublicElectricCost(totalMoneyOfElectric);
                room.setWaterCost(totalMoneyOfWater);
                roomRepository.save(room);
                return electricAndWaterRepository.save(electricAndWater1);
            })
            .orElseThrow(() -> new RuntimeException("Electric not found with id " + id));
    }

    @Override
    public List<ElectricAndWaterResponse> getElectricByRoom(Long id) {
        return electricAndWaterRepository.findByRoomId(id)
            .stream()
            .map(this::toResponse)
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
            .map(this::toResponse)
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

                electricAndWaterResponse.setRoom(roomService.getRoomById(electricAndWater.getRoom().getId()));
                electricAndWaterResponse.setPaid(electricAndWater.isPaid());
                
                Room room = electricAndWater.getRoom();
                int occupancy = room.getCurrentOccupancy();
                if (occupancy > 0) {
                    electricAndWaterResponse.setPerPersonElectric(electricAndWater.getTotalMoneyOfElectric().divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
                    electricAndWaterResponse.setPerPersonWater(electricAndWater.getTotalMoneyOfWater().divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
                } else {
                    electricAndWaterResponse.setPerPersonElectric(electricAndWater.getTotalMoneyOfElectric());
                    electricAndWaterResponse.setPerPersonWater(electricAndWater.getTotalMoneyOfWater());
                }
                return electricAndWaterResponse;
            })
            .orElseThrow(() -> new RuntimeException("Electric not found with id " + id));
    }

    @Override
    public com.cntt.rentalmanagement.domain.payload.response.MessageResponse payElectric(Long id) {
        ElectricAndWater electricAndWater = electricAndWaterRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        electricAndWater.setPaid(true);
        electricAndWaterRepository.save(electricAndWater);
        return com.cntt.rentalmanagement.domain.payload.response.MessageResponse.builder().message("Thanh toán thành công.").build();
    }

    private ElectricAndWaterResponse toResponse(ElectricAndWater electricAndWater) {
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

        electricAndWaterResponse.setRoom(roomService.getRoomById(electricAndWater.getRoom().getId()));
        electricAndWaterResponse.setPaid(electricAndWater.isPaid());

        Room room = electricAndWater.getRoom();
        int occupancy = room.getCurrentOccupancy();
        if (occupancy > 0) {
            electricAndWaterResponse.setPerPersonElectric(electricAndWater.getTotalMoneyOfElectric().divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
            electricAndWaterResponse.setPerPersonWater(electricAndWater.getTotalMoneyOfWater().divide(BigDecimal.valueOf(occupancy), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            electricAndWaterResponse.setPerPersonElectric(electricAndWater.getTotalMoneyOfElectric());
            electricAndWaterResponse.setPerPersonWater(electricAndWater.getTotalMoneyOfWater());
        }

        return electricAndWaterResponse;
    }
}
