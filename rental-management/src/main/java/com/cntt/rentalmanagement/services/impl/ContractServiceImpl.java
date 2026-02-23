package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.LockedStatus;
import com.cntt.rentalmanagement.domain.enums.RoomStatus;
import com.cntt.rentalmanagement.domain.models.Contract;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.payload.response.ContractResponse;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.ContractRepository;
import com.cntt.rentalmanagement.repository.RoomRepository;
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

    @Override
    public MessageResponse addContract(String name, Long roomId, String nameRentHome,Long numOfPeople,String phone, String deadline, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));
        if (room.getIsLocked().equals(LockedStatus.DISABLE)) {
            throw new BadRequestException("Phòng đã bị khóa");
        }




        String file = fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
        Contract contract = new Contract(name,"http://localhost:8080/document/" +file, nameRentHome, deadline ,getUsername(), getUsername(), room);
        contract.setPhone(phone);
        contract.setNumOfPeople(numOfPeople);
        contractRepository.save(contract);

        room.setStatus(RoomStatus.HIRED);
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
    public MessageResponse editContractInfo(Long id, String name, Long roomId, String nameOfRent,Long numOfPeople,String phone, String deadlineContract, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));
        if (room.getIsLocked().equals(LockedStatus.DISABLE)) {
            throw new BadRequestException("Phòng đã bị khóa");
        }

        Contract contract = contractRepository.findById(id).orElseThrow(() -> new BadRequestException("Hợp đồng không tồn tại!"));
        contract.setDeadlineContract(LocalDateTime.parse(deadlineContract));
        contract.setRoom(room);
        contract.setName(name);
        contract.setPhone(phone);
        contract.setNumOfPeople(numOfPeople);
        if (Objects.nonNull(files.get(0))) {
            String file = fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
            contract.setFiles("http://localhost:8080/document/"+file);
        }
        contract.setNameOfRent(nameOfRent);
        contractRepository.save(contract);
        return MessageResponse.builder().message("Cập nhật hợp đồng thành công.").build();
    }

    @Override
    public Page<ContractResponse> getAllContractOfCustomer(String phone, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(contractRepository.searchingContact(phone,pageable),ContractResponse.class, pageable);
    }


}
