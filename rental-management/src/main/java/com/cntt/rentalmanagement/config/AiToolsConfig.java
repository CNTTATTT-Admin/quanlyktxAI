package com.cntt.rentalmanagement.config;

import com.cntt.rentalmanagement.domain.models.Policy;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.RoomResponse;
import com.cntt.rentalmanagement.repository.RoomRepository;
import com.cntt.rentalmanagement.services.MaintenanceService;
import com.cntt.rentalmanagement.services.PolicyService;
import com.cntt.rentalmanagement.services.RoomService;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AiToolsConfig {

    private final PolicyService policyService;
    private final RoomService roomService;
    private final MaintenanceService maintenanceService;
    private final RoomRepository roomRepository;

    // ─────────── Tool 1: Lấy nội quy ───────────

    public record GetPoliciesRequest(
            @JsonPropertyDescription("Từ khóa tìm kiếm của người dùng, ví dụ: 'nội quy', 'quy định', có thể để trống.")
            String query
    ) {}

    public record PolicyResult(String title, String content) {}

    @Bean
    @Description("Lấy nội quy / quy định của ký túc xá. "
            + "Gọi tool này khi người dùng hỏi về nội quy, quy định, quy tắc sinh hoạt, điều lệ, nội quy phòng trọ.")
    public Function<GetPoliciesRequest, PolicyResult> getPolicies() {
        return request -> {
            log.info("[AI Tool] getPolicies called");
            Policy policy = policyService.getActivePolicy();
            return new PolicyResult(
                    policy.getTitle() != null ? policy.getTitle() : "Nội quy chung",
                    policy.getContent() != null ? policy.getContent() : "Chưa có nội quy được thiết lập."
            );
        };
    }

    // ─────────── Tool 2: Lấy top 3 phòng rẻ nhất đang trống ───────────

    public record GetBestRoomsRequest(
            @JsonPropertyDescription("Bộ lọc tùy chọn, ví dụ 'giá rẻ', 'còn trống', 'có điều hòa'. Có thể để trống.")
            String query
    ) {}

    public record RoomInfo(Long id, String title, String address, String price) {}

    public record BestRoomsResult(List<RoomInfo> rooms) {}

    @Bean
    @Description("Lấy danh sách top 3 phòng có giá thấp nhất đang còn chỗ (status ROOM_RENT). "
            + "Gọi khi người dùng hỏi: phòng nào còn trống, phòng rẻ nhất, tìm phòng giá thấp, "
            + "xem danh sách phòng, phòng đang có sẵn.")
    public Function<GetBestRoomsRequest, BestRoomsResult> getBestRooms() {
        return request -> {
            log.info("[AI Tool] getBestRooms called");
            List<RoomResponse> rooms = roomService.getTop3CheapestAvailableRooms();
            List<RoomInfo> roomInfos = rooms.stream()
                    .map(r -> new RoomInfo(
                            r.getId(),
                            r.getTitle(),
                            r.getAddress(),
                            r.getPrice() != null ? r.getPrice().toPlainString() + " VNĐ/tháng" : "Liên hệ"
                    ))
                    .collect(Collectors.toList());
            return new BestRoomsResult(roomInfos);
        };
    }

    // ─────────── Tool 3: Tạo phiếu báo hỏng ───────────

    public record CreateMaintenanceTicketRequest(
            @JsonPropertyDescription("Tên hoặc mã phòng người dùng đang ở, ví dụ: '101', 'A102', 'Phòng 203'. "
                    + "Đây là TÊN PHÒNG, không phải ID số. Hỏi lại người dùng nếu chưa biết.")
            String roomName,

            @JsonPropertyDescription("Tên thiết bị bị hỏng. "
                    + "Tự động mở rộng viết tắt: 'đh' → 'điều hòa', 'tl' → 'tủ lạnh', "
                    + "'mq' → 'máy quạt', 'đt' → 'đèn/đèn trần', 'vsvs' → 'vệ sinh', "
                    + "'bh' → 'bình nóng lạnh', 'ck' → 'cửa kính'.")
            String deviceName,

            @JsonPropertyDescription("Mô tả chi tiết lỗi hoặc vấn đề của thiết bị, ví dụ: 'không lạnh', "
                    + "'chập điện', 'rò nước', 'không bật được'. Phải có ít nhất 5 ký tự.")
            String description
    ) {}

    public record MaintenanceTicketResult(boolean success, String message) {}

    @Bean
    @Description("Tạo phiếu yêu cầu bảo trì / báo hỏng thiết bị trong phòng ký túc xá. "
            + "CHỈ gọi tool này khi có ĐỦ 3 thông tin: roomName (tên phòng), deviceName (tên thiết bị đã mở rộng viết tắt), "
            + "description (mô tả lỗi cụ thể). "
            + "Nếu THIẾU bất kỳ thông tin nào, PHẢI hỏi lại người dùng, KHÔNG được tự ý điền.")
    public Function<CreateMaintenanceTicketRequest, MaintenanceTicketResult> createMaintenanceTicket() {
        return request -> {
            log.info("[AI Tool] createMaintenanceTicket: room='{}', device='{}', desc='{}'",
                    request.roomName(), request.deviceName(), request.description());
            try {
                // Tìm room bằng tên / mã phòng thay vì ID số
                String normalizedName = request.roomName().trim();
                Optional<Room> roomOpt = roomRepository.findAll().stream()
                        .filter(r -> r.getTitle() != null
                                && (r.getTitle().equalsIgnoreCase(normalizedName)
                                    || r.getTitle().contains(normalizedName)
                                    || normalizedName.contains(r.getTitle())))
                        .findFirst()
                        // Fallback: tìm theo roomCode
                        .or(() -> roomRepository.findAll().stream()
                                .filter(r -> r.getRoomCode() != null
                                        && r.getRoomCode().equalsIgnoreCase(normalizedName))
                                .findFirst());

                if (roomOpt.isEmpty()) {
                    return new MaintenanceTicketResult(false,
                            "Không tìm thấy phòng có tên '" + request.roomName()
                                    + "'. Bạn thử nhập lại tên phòng chính xác hơn nhé!");
                }

                Room room = roomOpt.get();
                String fullDescription = String.format("[%s] %s", request.deviceName(), request.description());

                MessageResponse response = maintenanceService.userRequestMaintenance(
                        room.getId(),
                        fullDescription,
                        java.util.Collections.emptyList()
                );
                return new MaintenanceTicketResult(true,
                        response.getMessage() + " (phòng: " + room.getTitle() + ")");
            } catch (Exception e) {
                log.error("[AI Tool] createMaintenanceTicket error", e);
                return new MaintenanceTicketResult(false, "Không thể tạo phiếu: " + e.getMessage());
            }
        };
    }
}
