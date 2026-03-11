package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.LockedStatus;
import com.cntt.rentalmanagement.domain.enums.RoomStatus;
import com.cntt.rentalmanagement.domain.models.*;
import com.cntt.rentalmanagement.domain.models.DTO.CommentDTO;
import com.cntt.rentalmanagement.domain.payload.request.AssetRequest;
import com.cntt.rentalmanagement.domain.payload.request.RoomRequest;
import com.cntt.rentalmanagement.domain.payload.request.SendEmailRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.RoomResponse;
import com.cntt.rentalmanagement.domain.payload.response.UserResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.*;
import com.cntt.rentalmanagement.services.AccountService;
import com.cntt.rentalmanagement.services.BaseService;
import com.cntt.rentalmanagement.services.FileStorageService;
import com.cntt.rentalmanagement.services.RoomService;
import com.cntt.rentalmanagement.utils.MapperUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl extends BaseService implements RoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final FileStorageService fileStorageService;
    private final RoomMediaRepository roomMediaRepository;
    private final CategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final CommentRepository commentRepository;
    private final MapperUtils mapperUtils;
    private final AccountService accountService;
    private final ContractRepository contractRepository;

    @Override
    public MessageResponse addNewRoom(RoomRequest roomRequest) {
        Location location = locationRepository.
                findById(roomRequest.getLocationId()).orElseThrow(() -> new BadRequestException("Thành phố chưa tồn tại."));
        Category category = categoryRepository.findById(roomRequest.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Danh mục không tồn tại"));
        Room room = new Room(
                roomRequest.getTitle(),
                roomRequest.getDescription(),
                roomRequest.getPrice(),
                roomRequest.getLatitude(),
                roomRequest.getLongitude(),
                roomRequest.getAddress(),
                getUsername(),
                getUsername(),
                location,
                category,
                getUser(),
                roomRequest.getStatus(),
                roomRequest.getWaterCost(),
                roomRequest.getPublicElectricCost(),
                roomRequest.getInternetCost());
        room.setMaxOccupancy(roomRequest.getMaxOccupancy());
        room.setFloor(roomRequest.getFloor());
        roomRepository.save(room);
        for (MultipartFile file : roomRequest.getFiles()) {
            String fileName = fileStorageService.storeFile(file);
            RoomMedia roomMedia = new RoomMedia();
            roomMedia.setFiles(fileName);
            roomMedia.setRoom(room);
            roomMediaRepository.save(roomMedia);
        }

        for (AssetRequest asset: roomRequest.getAssets()) {
            Asset a = new Asset();
            a.setRoom(room);
            a.setName(asset.getName());
            a.setNumber(asset.getNumber());
            assetRepository.save(a);
        }
        return MessageResponse.builder().message("Thêm tin phòng thành công").build();
    }

    @Override
    public Page<RoomResponse> getRoomByRentaler(String title, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<RoomResponse> result = mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoom(title, getUserId() ,pageable),RoomResponse.class,pageable);
    }

    @Override
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() ->
                new BadRequestException("Phòng trọ này không tồn tại."));
        RoomResponse response = mapperUtils.convertToResponse(room, RoomResponse.class);
        response.setCurrentOccupancy(room.getResidents() != null ? room.getResidents().size() : 0);
        if (response.getMaxOccupancy() == null) {
            response.setMaxOccupancy(1);
        }
        if (room.getResidents() != null && !room.getResidents().isEmpty()) {
            response.setResidents(mapperUtils.convertToResponseList(room.getResidents(), UserResponse.class));
        }
        return response;
    }

    @Override
    public Room getRoom(Long id) {
        return mapperUtils.convertToEntity(roomRepository.findById(id).orElseThrow(() ->
                new BadRequestException("Phòng trọ này không tồn tại.")), Room.class);
    }

    @Override
    public MessageResponse disableRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Thông tin phòng không tồn tại."));
        if (room.getResidents() != null && !room.getResidents().isEmpty()) {
            throw new BadRequestException("Không thể khóa phòng khi đang còn sinh viên ở.");
        }
        room.setIsLocked(LockedStatus.DISABLE);
        roomRepository.save(room);
        return MessageResponse.builder().message("Bài đăng của phòng đã được ẩn đi.").build();
    }

    @Override
    @Transactional
    public MessageResponse updateRoomInfo(Long id, RoomRequest roomRequest) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Thông tin phòng không tồn tại."));
        Location location = locationRepository.
                findById(roomRequest.getLocationId()).orElseThrow(() -> new BadRequestException("Thành phố chưa tồn tại."));
        Category category = categoryRepository.findById(roomRequest.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Danh mục không tồn tại"));
        room.setUpdatedBy(getUsername());
        room.setTitle(roomRequest.getTitle());
        room.setDescription(roomRequest.getDescription());
        room.setPrice(roomRequest.getPrice());
        room.setLatitude(roomRequest.getLatitude());
        room.setLongitude(roomRequest.getLongitude());
        room.setAddress(roomRequest.getAddress());
        room.setUpdatedBy(getUsername());
        room.setLocation(location);
        room.setCategory(category);
        if (Objects.nonNull(roomRequest.getStatus())) {
            room.setStatus(roomRequest.getStatus());
        }
        room.setWaterCost(roomRequest.getWaterCost());
        room.setPublicElectricCost(roomRequest.getPublicElectricCost());
        room.setInternetCost(roomRequest.getInternetCost());
        room.setMaxOccupancy(roomRequest.getMaxOccupancy());
        room.setFloor(roomRequest.getFloor());
        roomRepository.save(room);

        if (Objects.nonNull(roomRequest.getFiles()) && !roomRequest.getFiles().isEmpty()) {
            boolean hasActualFiles = roomRequest.getFiles().stream().anyMatch(file -> !file.isEmpty());
            if (hasActualFiles) {
                roomMediaRepository.deleteAllByRoom(room);
                for (MultipartFile file : roomRequest.getFiles()) {
                    if (!file.isEmpty()) {
                        String fileName = fileStorageService.storeFile(file);
                        RoomMedia roomMedia = new RoomMedia();
                        roomMedia.setFiles(fileName);
                        roomMedia.setRoom(room);
                        roomMediaRepository.save(roomMedia);
                    }
                }
            }
        }

        assetRepository.deleteAllByRoom(room);
        for (AssetRequest asset: roomRequest.getAssets()) {
            Asset a = new Asset();
            a.setRoom(room);
            a.setName(asset.getName());
            a.setNumber(asset.getNumber());
            assetRepository.save(a);
        }
        return MessageResponse.builder().message("Cập nhật thông tin thành công").build();
    }

    @Override
    public Page<RoomResponse> getRentOfHome() {
        Pageable pageable = PageRequest.of(0,100);
        return mapperUtils.convertToResponsePage(roomRepository.getAllRentOfHome( getUserId(), pageable), RoomResponse.class, pageable);
    }
    
    @Override
    public List<CommentDTO> getAllCommentRoom(Long id){
    	Room room = roomRepository.findById(id).get();
    	return mapperUtils.convertToEntityList(room.getComment(), CommentDTO.class);
    }

    @Override
    public Page<RoomResponse> getAllRoomForAdmin(String title,Boolean approve, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoomForAdmin(title, approve ,pageable), RoomResponse.class, pageable);
    }

    @Override
    public Page<RoomResponse> getRoomByUserId(Long userId, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return mapperUtils.convertToResponsePage(roomRepository.searchingRoomForCustomer(null,null,null,userId, pageable), RoomResponse.class, pageable );
    }

    @Override
    public List<RoomResponse> getRoomByUser(User user) {
        return roomRepository.findByUser(user).stream().map(room -> mapperUtils.convertToResponse(room, RoomResponse.class)).toList();
    }

    @Override
    public Room updateRoom(Room room, Long id) {
        return roomRepository.findById(id)
                .map(room1 -> {
                    if (room.getTitle() != null) room1.setTitle(room.getTitle());
                    if (room.getDescription() != null) room1.setDescription(room.getDescription());
                    if (room.getPrice() != null) room1.setPrice(room.getPrice());
                    if (room.getLatitude() != null) room1.setLatitude(room.getLatitude());
                    if (room.getLongitude() != null) room1.setLongitude(room.getLongitude());
                    if (room.getAddress() != null) room1.setAddress(room.getAddress());
                    if (room.getLocation() != null) room1.setLocation(room.getLocation());
                    if (room.getCategory() != null) room1.setCategory(room.getCategory());
                    if (room.getStatus() != null) room1.setStatus(room.getStatus());
                    if (room.getWaterCost() != null) room1.setWaterCost(room.getWaterCost());
                    if (room.getPublicElectricCost() != null) room1.setPublicElectricCost(room.getPublicElectricCost());
                    if (room.getInternetCost() != null) room1.setInternetCost(room.getInternetCost());
                    if (room.getMaxOccupancy() != null) room1.setMaxOccupancy(room.getMaxOccupancy());
                    if (room.getFloor() != null) room1.setFloor(room.getFloor());
                    room1.setUpdatedBy(getUsername());
                    return roomRepository.save(room1);
                })
                .orElseThrow(() -> new BadRequestException("Phòng không tồn tại"));
    }

    private List<RoomResponse> sortRooms(List<RoomResponse> rooms, String typeSort) {
        if ("Thời gian: Mới đến cũ".equals(typeSort)) {
            rooms.sort(Comparator.comparing(RoomResponse::getCreatedAt).reversed());
        } else if ("Thời gian: Cũ đến mới".equals(typeSort)) {
            rooms.sort(Comparator.comparing(RoomResponse::getCreatedAt));
        } else if ("Giá: Thấp đến cao".equals(typeSort)) {
            rooms.sort(Comparator.comparing(RoomResponse::getPrice));
        } else if ("Giá: Cao đến thấp".equals(typeSort)) {
            rooms.sort(Comparator.comparing(RoomResponse::getPrice).reversed());
        }
        
        return rooms;
    }


    @Override
    public MessageResponse checkoutRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Phòng không còn tồn tại"));
        // Đặt về MAINTENANCE khi giải tán cả phòng
        room.setStatus(RoomStatus.MAINTENANCE);
        // Also remove all residents
        if (room.getResidents() != null) {
            for (User resident : room.getResidents()) {
                resident.setAllocatedRoom(null);
                userRepository.save(resident);
            }
        }
        roomRepository.save(room);
        return MessageResponse.builder().message("Trả phòng và xuất hóa đơn thành công.").build();
    }

    @Override
    @Transactional
    public MessageResponse checkoutContract(Long contractId) {
        Contract contract = contractRepository.findById(contractId).orElseThrow(() -> new BadRequestException("Hợp đồng không tồn tại"));
        Room room = contract.getRoom();
        User student = contract.getStudent();

        if (student != null) {
            student.setAllocatedRoom(null);
            userRepository.save(student);
        }

        updateRoomStatus(room);

        return MessageResponse.builder().message("Trả phòng thành công").build();
    }

    @Override
    public MessageResponse isApproveRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Phòng không còn tồn tại"));
        if (room.getIsApprove().equals(Boolean.TRUE)) {
            throw new BadRequestException("Phòng đã được phê duyệt");
        } else {
            room.setIsApprove(Boolean.TRUE);
        }
        roomRepository.save(room);
        return MessageResponse.builder().message("Phê duyệt tin phòng thành công.").build();
    }

    @Override
    public MessageResponse removeRoom(Long id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new BadRequestException("Phòng không còn tồn tại"));
        if (room.getResidents() != null && !room.getResidents().isEmpty()) {
            throw new BadRequestException("Không thể gỡ bài đăng khi phòng đang có sinh viên ở.");
        }
        if(Boolean.TRUE.equals(room.getIsRemove())){
            throw new BadRequestException("Bài đăng đã bị gỡ");
        }
        room.setIsRemove(Boolean.TRUE);
        roomRepository.save(room);
        return MessageResponse.builder().message("Bài đăng đã bị gỡ thành công").build();
    }

	@Override
	public String addComment(Long id, CommentDTO commentDTO) {
		try {
			Room room = roomRepository.findById(commentDTO.getRoom_id()).orElseThrow(() -> new BadRequestException("Phòng không còn tồn tại"));
			User user = userRepository.findById(id).orElseThrow(() -> new BadRequestException("Người dùng không tồn tại"));
			Rate rate = new Rate();
			rate.setRating(commentDTO.getRateRating());
			rate.setUser(user);
			rate.setRoom(room);
			Comment comment = new Comment(commentDTO.getContent(), user, room, rate);
			commentRepository.save(comment);
			return "Thêm bình luận thành công";
		} catch (Exception e) {
			return "Thêm bình luận thất bại";
		}
		
	}
	
	private User getUser() {
        return userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("Người dùng không tồn tại"));
    }

    @Override
    @Transactional
    public MessageResponse removeResident(Long roomId, Long residentId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng không tồn tại"));
        User user = userRepository.findById(residentId).orElseThrow(() -> new BadRequestException("Người dùng không tồn tại"));

        if (user.getAllocatedRoom() == null || !user.getAllocatedRoom().getId().equals(roomId)) {
            throw new BadRequestException("Người dùng không ở trong phòng này");
        }

        user.setAllocatedRoom(null);
        userRepository.save(user);

        // Cập nhật trạng thái phòng sau khi xóa cư dân
        updateRoomStatus(room);

        // Send email (async)
        SendEmailRequest emailRequest = new SendEmailRequest();
        emailRequest.setToEmail(user.getEmail());
        emailRequest.setTitle("Thông báo trả phòng");
        emailRequest.setNameOfRentaler(room.getUser().getName());
        emailRequest.setDescription("Bạn đã được quản lý xác nhận rời khỏi phòng: " + room.getTitle() + ". Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.");
        accountService.sendEmailForRentaler(user.getId(), emailRequest);

        return MessageResponse.builder().message("Xóa người dùng ra khỏi phòng thành công").build();
    }

    private void updateRoomStatus(Room room) {
        int residents = room.getResidents() != null ? room.getResidents().size() : 0;
        int max = room.getMaxOccupancy() != null ? room.getMaxOccupancy() : 1;

        if (residents == 0) {
            room.setStatus(RoomStatus.AVAILABLE);
        } else if (residents >= max) {
            room.setStatus(RoomStatus.FULL);
        } else {
            room.setStatus(RoomStatus.PARTIALLY_FILLED);
        }
        roomRepository.save(room);
    }
}
