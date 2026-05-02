package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.ParkingPackageStatus;
import com.cntt.rentalmanagement.domain.enums.VehicleType;
import com.cntt.rentalmanagement.domain.models.ParkingPackage;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.request.ParkingPackageRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.ParkingPackageResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.ParkingPackageRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.services.ParkingPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingPackageServiceImpl implements ParkingPackageService {

    private final ParkingPackageRepository parkingPackageRepository;
    private final UserRepository userRepository;

    @Override
    public List<ParkingPackageResponse> getPackagesByRentaler(Long rentalerId) {
        List<ParkingPackage> packages = parkingPackageRepository
                .findByRentalerIdAndStatus(rentalerId, ParkingPackageStatus.ACTIVE);

        return packages.stream().map(pkg -> ParkingPackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .durationMonths(pkg.getDurationMonths())
                .price(pkg.getPrice())
                .vehicleType(pkg.getVehicleType())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    public Page<ParkingPackageResponse> getAllParkingPackages(Long rentalerId, Integer pageNo, Integer pageSize, String keyword) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        Page<ParkingPackage> packages = parkingPackageRepository.findByRentalerIdAndKeyword(rentalerId, keyword, pageable);
        
        return packages.map(pkg -> ParkingPackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .durationMonths(pkg.getDurationMonths())
                .price(pkg.getPrice())
                .vehicleType(pkg.getVehicleType())
                .status(pkg.getStatus())
                .build());
    }

    @Override
    @Transactional
    public MessageResponse createParkingPackage(Long rentalerId, ParkingPackageRequest request) {
        User rentaler = userRepository.findById(rentalerId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy chủ trọ"));

        ParkingPackage pkg = new ParkingPackage();
        pkg.setName(request.getName());
        pkg.setDurationMonths(request.getDurationMonths());
        pkg.setPrice(request.getPrice());
        pkg.setVehicleType(VehicleType.valueOf(request.getVehicleType().toUpperCase()));
        pkg.setStatus(ParkingPackageStatus.valueOf(request.getStatus().toUpperCase()));
        pkg.setRentaler(rentaler);
        pkg.setCreatedAt(LocalDateTime.now());
        pkg.setUpdatedAt(LocalDateTime.now());

        parkingPackageRepository.save(pkg);
        return MessageResponse.builder().message("Thêm gói cước thành công!").build();
    }

    @Override
    @Transactional
    public MessageResponse updateParkingPackage(Long rentalerId, Long id, ParkingPackageRequest request) {
        ParkingPackage pkg = parkingPackageRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy gói cước"));

        if (!pkg.getRentaler().getId().equals(rentalerId)) {
            throw new BadRequestException("Bạn không có quyền sửa gói cước này");
        }

        pkg.setName(request.getName());
        //pkg.setDurationMonths(request.getDurationMonths());
        //pkg.setPrice(request.getPrice());
        //pkg.setVehicleType(VehicleType.valueOf(request.getVehicleType().toUpperCase()));
        pkg.setStatus(ParkingPackageStatus.valueOf(request.getStatus().toUpperCase()));
        pkg.setUpdatedAt(LocalDateTime.now());

        parkingPackageRepository.save(pkg);
        return MessageResponse.builder().message("Cập nhật gói cước thành công!").build();
    }
}