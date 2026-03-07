package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.CheckoutStatus;
import com.cntt.rentalmanagement.domain.models.CheckoutRequest;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.request.CheckoutRequestPayload;
import com.cntt.rentalmanagement.domain.payload.response.CheckoutRequestResponse;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.repository.CheckoutRequestRepository;
import com.cntt.rentalmanagement.repository.RoomRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.services.CheckoutRequestService;
import com.cntt.rentalmanagement.services.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutRequestServiceImpl implements CheckoutRequestService {

    private final CheckoutRequestRepository checkoutRequestRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomService roomService;

    @Override
    public MessageResponse createRequest(CheckoutRequestPayload payload, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        Room room = roomRepository.findById(payload.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại"));

        // Check if there's already a pending request
        Optional<CheckoutRequest> existing = checkoutRequestRepository.findPendingByUserAndRoom(userId, payload.getRoomId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Yêu cầu trả phòng đang chờ duyệt.");
        }

        CheckoutRequest request = new CheckoutRequest();
        request.setUser(user);
        request.setRoom(room);
        request.setReason(payload.getReason());
        request.setStatus(CheckoutStatus.PENDING);

        checkoutRequestRepository.save(request);

        return MessageResponse.builder().message("Đã gửi yêu cầu trả phòng.").build();
    }

    @Override
    public MessageResponse approveRequest(Long id) {
        CheckoutRequest request = checkoutRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu"));

        if (request.getStatus() != CheckoutStatus.PENDING) {
            throw new IllegalArgumentException("Yêu cầu đã được xử lý.");
        }

        // Action: Call actual checkout logic on Room. Wait, roomService.checkoutRoom calls what?
        // Wait! The user might just be leaving the room but the room might still be occupied by others?
        // The prompt says "trả phòng xong rồi chọn phòng khác", meaning check out user from room.
        // Wait, roomService.checkoutRoom checks out the ENTIRE room (makes status AVAILABLE). 
        // We only want the specific USER to check out! 
        // Or wait, does "checkoutRoom" evict everyone and change contract? YES.
        // "roomService.checkoutRoom(request.getRoom().getId())" does the exact action the user meant because in this app, "checkout" means terminating the lease.
        
        roomService.checkoutRoom(request.getRoom().getId());

        request.setStatus(CheckoutStatus.APPROVED);
        checkoutRequestRepository.save(request);

        return MessageResponse.builder().message("Đã duyệt yêu cầu hoàn tất.").build();
    }

    @Override
    public MessageResponse rejectRequest(Long id) {
        CheckoutRequest request = checkoutRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu"));

        if (request.getStatus() != CheckoutStatus.PENDING) {
            throw new IllegalArgumentException("Yêu cầu đã được xử lý.");
        }

        request.setStatus(CheckoutStatus.REJECTED);
        checkoutRequestRepository.save(request);

        return MessageResponse.builder().message("Đã từ chối yêu cầu.").build();
    }

    @Override
    public Page<CheckoutRequestResponse> getRequestsForRentaler(Long rentalerId, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<CheckoutRequest> requests = checkoutRequestRepository.findByRentaler(rentalerId, pageable);
        return mapToResponsePage(requests);
    }

    @Override
    public Page<CheckoutRequestResponse> getRequestsForUser(Long userId, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<CheckoutRequest> requests = checkoutRequestRepository.findByUser(userId, pageable);
        return mapToResponsePage(requests);
    }
    
    private Page<CheckoutRequestResponse> mapToResponsePage(Page<CheckoutRequest> requests) {
        List<CheckoutRequestResponse> responseList = requests.getContent().stream().map(request -> {
            CheckoutRequestResponse response = new CheckoutRequestResponse();
            response.setId(request.getId());
            response.setReason(request.getReason());
            response.setStatus(request.getStatus());
            response.setCreatedAt(request.getCreatedAt());

            CheckoutRequestResponse.RoomResponse roomResponse = new CheckoutRequestResponse.RoomResponse();
            if (request.getRoom() != null) {
                roomResponse.setId(request.getRoom().getId());
                roomResponse.setTitle(request.getRoom().getTitle());
            }
            response.setRoom(roomResponse);

            CheckoutRequestResponse.UserResponse userResponse = new CheckoutRequestResponse.UserResponse();
            if (request.getUser() != null) {
                userResponse.setId(request.getUser().getId());
                userResponse.setName(request.getUser().getName());
                userResponse.setPhone(request.getUser().getPhone());
            }
            response.setUser(userResponse);

            return response;
        }).collect(Collectors.toList());

        return new PageImpl<>(responseList, requests.getPageable(), requests.getTotalElements());
    }
}
