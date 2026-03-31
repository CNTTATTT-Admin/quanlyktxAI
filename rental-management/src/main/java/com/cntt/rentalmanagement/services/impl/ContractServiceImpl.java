package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.LockedStatus;
import com.cntt.rentalmanagement.domain.enums.RoomStatus;
import com.cntt.rentalmanagement.domain.models.Contract;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.response.ContractResponse;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.ContractRepository;
import com.cntt.rentalmanagement.repository.RoomRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.services.BaseService;
import com.cntt.rentalmanagement.services.ContractService;
import com.cntt.rentalmanagement.services.FileStorageService;
import com.cntt.rentalmanagement.utils.MapperUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl extends BaseService implements ContractService {

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final FileStorageService fileStorageService;
    private final MapperUtils mapperUtils;
    private final UserRepository userRepository;

    @Override
    public MessageResponse addContract(String name, Long roomId, String nameRentHome, Long numOfPeople, String phone, String deadline, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));
        if (room.getIsLocked().equals(LockedStatus.DISABLE)) {
            throw new BadRequestException("Phòng đã bị khóa");
        }

        User student = userRepository.findByPhone(phone).orElseThrow(() -> new BadRequestException("Người dùng với số điện thoại này không tồn tại trong hệ thống"));
        boolean isAlreadyResident = student.getAllocatedRoom() != null && student.getAllocatedRoom().getId().equals(roomId);

        if (!isAlreadyResident && room.isFull()) {
            throw new BadRequestException("Phòng đã hết chỗ (Sức chứa tối đa: " + room.getMaxOccupancy() + ")");
        }
        //kiểm tra lỗi nhầm phòng
        if (student.getAllocatedRoom() != null && !student.getAllocatedRoom().getId().equals(roomId)) {
            throw new BadRequestException("Người dùng này đang được xếp ở một phòng khác (" + student.getAllocatedRoom().getTitle() + ").");
        }

        String file = null;
        if (files != null && !files.isEmpty() && !files.get(0).isEmpty()) {
            file = "http://localhost:8080/document/" + fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
        }

        // Validation: Check if student already has an active contract or is in a room
        if (contractRepository.existsByStudentAndDeadlineContractAfter(student, LocalDateTime.now())) {
            throw new BadRequestException("Người dùng này đã có một hợp đồng đang hoạt động.");
        }

        Contract contract = new Contract(name, file, nameRentHome, deadline, getUsername(), getUsername(), room);
        contract.setPhone(phone);
        contract.setNumOfPeople(1L); // Default to 1 for per-tenant model
        contract.setStudent(student);
        
        // Track residency in User entity
        student.setAllocatedRoom(room);
        userRepository.save(student);

        contractRepository.save(contract);

        // Update room status:
        int currentOccupancy = room.getResidents() != null ? room.getResidents().size() : 0;
        if (room.isFull()) {
            room.setStatus(RoomStatus.FULL);
        } else {
            room.setStatus(RoomStatus.PARTIALLY_FILLED);
        }
        roomRepository.save(room);

        return MessageResponse.builder().message("Thêm hợp đồng mới thành công").build();
    }

    @Override
    public Page<ContractResponse> getAllContractOfRentaler(String name,String phone, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(contractRepository.searchingContact(name,phone,getUserId(),pageable),ContractResponse.class, pageable);
    }

    @Override
    public ContractResponse getContractById(Long id) {
        return mapperUtils.convertToResponse(contractRepository.findById(id).orElseThrow(() -> new BadRequestException("Hợp đồng không tồn tại!")), ContractResponse.class);
    }

    @Override
    public MessageResponse editContractInfo(Long id, String name, Long roomId, String nameOfRent, Long numOfPeople, String phone, String deadlineContract, List<MultipartFile> files) {
        Contract contract = contractRepository.findById(id).orElseThrow(() -> new BadRequestException("Hợp đồng không tồn tại!"));
        Room oldRoom = contract.getRoom();
        Room newRoom = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng mới không tồn tại"));

        if (!oldRoom.getId().equals(newRoom.getId())) {
            if (newRoom.getIsLocked().equals(LockedStatus.DISABLE)) {
                throw new BadRequestException("Phòng mới đã bị khóa");
            }
            if (newRoom.isFull()) {
                throw new BadRequestException("Phòng mới đã hết chỗ");
            }
            
            // If room changed, handle resident transfer
            if (contract.getStudent() != null) {
                User student = contract.getStudent();
                student.setAllocatedRoom(newRoom);
                userRepository.save(student);
            }
            contract.setRoom(newRoom);
        }

        contract.setDeadlineContract(LocalDateTime.parse(deadlineContract));
        contract.setName(name);
        contract.setPhone(phone);
        contract.setNumOfPeople(1L); // Fixed for per-tenant model
        contract.setNameOfRent(nameOfRent);

        if (files != null && !files.isEmpty() && !files.get(0).isEmpty()) {
            String file = fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
            contract.setFiles("http://localhost:8080/document/" + file);
        }

        contractRepository.save(contract);

        // Update room statuses
        if (newRoom.isFull()) {
            newRoom.setStatus(RoomStatus.FULL);
        } else {
            newRoom.setStatus(RoomStatus.PARTIALLY_FILLED);
        }
        roomRepository.save(newRoom);

        if (!oldRoom.getId().equals(newRoom.getId())) {
            int oldResidents = oldRoom.getResidents() != null ? oldRoom.getResidents().size() : 0;
            if (oldResidents == 0) {
                oldRoom.setStatus(RoomStatus.AVAILABLE);
            } else if (oldRoom.isFull()) {
                oldRoom.setStatus(RoomStatus.FULL);
            } else {
                oldRoom.setStatus(RoomStatus.PARTIALLY_FILLED);
            }
            roomRepository.save(oldRoom);
        }

        return MessageResponse.builder().message("Cập nhật hợp đồng thành công.").build();
    }

    @Override
    public Page<ContractResponse> getAllContractOfCustomer(String phone, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(contractRepository.searchingContact(phone,pageable),ContractResponse.class, pageable);
    }


}
