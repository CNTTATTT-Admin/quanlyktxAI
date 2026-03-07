package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.LockedStatus;
import com.cntt.rentalmanagement.domain.models.Maintenance;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.response.MaintenanceResponse;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.MaintenanceRepository;
import com.cntt.rentalmanagement.repository.RoomRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.services.BaseService;
import com.cntt.rentalmanagement.services.FileStorageService;
import com.cntt.rentalmanagement.services.MaintenanceService;
import com.cntt.rentalmanagement.utils.MapperUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl extends BaseService implements MaintenanceService {
    private final MaintenanceRepository maintenanceRepository;
    private final MapperUtils mapperUtils;
    private final RoomRepository roomRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    @Override
    public Page<MaintenanceResponse> getAllMaintenance(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(maintenanceRepository.searchingMaintenance(keyword, getUserId(), pageable), MaintenanceResponse.class, pageable);
    }

    @Override
    public MessageResponse addNewMaintenance(String maintenanceDate, BigDecimal price, Long roomId, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));

        String fileUrl = null;
        if (files != null && !files.isEmpty() && !files.get(0).isEmpty()) {
            fileUrl = "http://localhost:8080/document/"+fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
        }

        Maintenance maintenance = new Maintenance(parseDateTime(maintenanceDate),price,fileUrl,getUsername(), getUsername(), room);
        maintenance.setStatus("RESOLVED");
        maintenanceRepository.save(maintenance);
        return MessageResponse.builder().message("Thêm phiếu bảo trì thành công").build();
    }

    @Override
    public MessageResponse editMaintenance(Long id, String maintenanceDate, BigDecimal price, Long roomId, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));

        Maintenance maintenance = maintenanceRepository.findById(id).orElseThrow(() -> new BadRequestException("Phiếu bảo trì không tồn tại"));
        maintenance.setMaintenanceDate(parseDateTime(maintenanceDate));
        maintenance.setPrice(price);
        if (files != null && !files.isEmpty() && !files.get(0).isEmpty()) {
            String file = fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
            maintenance.setFiles("http://localhost:8080/document/" + file);
        }
        maintenance.setRoom(room);
        maintenanceRepository.save(maintenance);
        return MessageResponse.builder().message("Cập nhật thành công").build();
    }

    @Override
    public MessageResponse deleteMaintenance(Long id) {
        maintenanceRepository.deleteById(id);
        return MessageResponse.builder().message("Xóa phiếu bảo trì thành công").build();
    }

    @Override
    public MaintenanceResponse getMaintenance(Long id) {
        return mapperUtils.convertToResponse(maintenanceRepository.findById(id).orElseThrow(() -> new BadRequestException("Không tồn tại")), MaintenanceResponse.class);
    }

    @Override
    public MessageResponse userRequestMaintenance(Long roomId, String description, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng không tồn tại"));
        User user = userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("Người dùng không tồn tại"));

        Maintenance maintenance = new Maintenance();
        maintenance.setRoom(room);
        maintenance.setDescription(description);
        maintenance.setReportedBy(user);
        maintenance.setStatus("PENDING");
        maintenance.setCreatedBy(getUsername());
        maintenance.setUpdatedBy(getUsername());

        if (files != null && !files.isEmpty() && !files.get(0).isEmpty()) {
            maintenance.setFiles("http://localhost:8080/document/"+fileStorageService.storeFile(files.get(0)).replace("photographer/files/", ""));
        }

        maintenanceRepository.save(maintenance);
        return MessageResponse.builder().message("Gửi yêu cầu bảo trì thành công").build();
    }

    @Override
    public MessageResponse updateMaintenanceStatus(Long id, String status, BigDecimal price, String maintenanceDate, List<MultipartFile> files) {
        Maintenance maintenance = maintenanceRepository.findById(id).orElseThrow(() -> new BadRequestException("Phiếu bảo trì không tồn tại"));
        maintenance.setStatus(status);
        maintenance.setUpdatedBy(getUsername());

        if (price != null) {
            maintenance.setPrice(price);
        }

        if (maintenanceDate != null && !maintenanceDate.isEmpty()) {
            maintenance.setMaintenanceDate(parseDateTime(maintenanceDate));
        }

        if (files != null && !files.isEmpty() && !files.get(0).isEmpty()) {
            maintenance.setFiles("http://localhost:8080/document/"+fileStorageService.storeFile(files.get(0)).replace("photographer/files/", ""));
        }

        maintenanceRepository.save(maintenance);
        return MessageResponse.builder().message("Cập nhật trạng thái bảo trì thành công").build();
    }

    @Override
    public Page<MaintenanceResponse> getMaintenanceHistoryForUser(Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(maintenanceRepository.getMaintenanceHistoryForUser(getUserId(), pageable), MaintenanceResponse.class, pageable);
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) return null;
        if (!dateTimeStr.contains("T")) {
            return LocalDateTime.parse(dateTimeStr + "T00:00:00");
        }
        return LocalDateTime.parse(dateTimeStr);
    }
}
