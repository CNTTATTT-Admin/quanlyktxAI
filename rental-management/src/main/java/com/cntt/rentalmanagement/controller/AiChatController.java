package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.models.*;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.RoomResponse;
import com.cntt.rentalmanagement.repository.*;
import com.cntt.rentalmanagement.secruity.UserPrincipal;
import com.cntt.rentalmanagement.services.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiChatController {

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONSTANTS & SCHEMA
    // ═══════════════════════════════════════════════════════════════════════════════

    /** DB schema nhúng cứng từ JPA entities — AI dùng để sinh SQL */
    private static final String DB_SCHEMA = """
            DATABASE: MySQL (rental_home). Dialect: MySQL 8.
            
            TABLE: users
              id BIGINT PK, name VARCHAR, email VARCHAR UNIQUE, image_url VARCHAR,
              email_verified BOOLEAN, password VARCHAR, provider VARCHAR,
              provider_id VARCHAR, is_locked BOOLEAN, is_confirmed BOOLEAN,
              address VARCHAR, phone VARCHAR UNIQUE, zalo_url VARCHAR,
              facebook_url VARCHAR, face_vector TEXT,
              allocated_room_id BIGINT FK→room.id,
              created_at DATETIME, updated_at DATETIME
            
            TABLE: room
              id BIGINT PK, title VARCHAR, description TEXT, price DECIMAL,
              latitude DOUBLE, longitude DOUBLE, address VARCHAR,
              status VARCHAR (AVAILABLE|ROOM_RENT|FULL|PARTIALLY_FILLED),
              is_locked VARCHAR, is_approve BOOLEAN, is_remove BOOLEAN,
              created_by VARCHAR, updated_by VARCHAR,
              location_id BIGINT FK→location.id, user_id BIGINT FK→users.id (chủ phòng),
              category_id BIGINT FK→category.id, room_code VARCHAR UNIQUE,
              max_occupancy INT, floor INT,
              water_cost DECIMAL, public_electric_cost DECIMAL, internet_cost DECIMAL,
              created_at DATETIME, updated_at DATETIME
              Lưu ý: Khi user hỏi phòng "giá rẻ" hoặc "còn chỗ" thì query status IN ('AVAILABLE', 'PARTIALLY_FILLED')
            
            TABLE: contract
              id BIGINT PK, name VARCHAR, files VARCHAR, name_of_rent VARCHAR,
              deadline_contract DATETIME, created_by VARCHAR, updated_by VARCHAR,
              num_of_people BIGINT, phone VARCHAR, start_date DATETIME,
              student_id BIGINT FK→users.id, room_id BIGINT FK→room.id,
              created_at DATETIME, updated_at DATETIME
            
            TABLE: electric_and_water (hóa đơn điện nước)
              id BIGINT PK, name VARCHAR, month INT, 
              last_month_number_of_electric INT, this_month_number_of_electric INT,
              last_month_block_of_water INT, this_month_block_of_water INT,
              money_each_number_of_electric DECIMAL, money_each_block_of_water DECIMAL,
              total_money_of_electric DECIMAL, total_money_of_water DECIMAL,
              paid BOOLEAN, room_id BIGINT FK→room.id
            
            TABLE: maintenance (phiếu bảo trì / báo hỏng)
              id BIGINT PK, maintenance_date DATETIME, price DECIMAL, files VARCHAR,
              created_by VARCHAR, updated_by VARCHAR, status VARCHAR (PENDING|IN_PROGRESS|RESOLVED),
              description VARCHAR, reported_by BIGINT FK→users.id,
              room_id BIGINT FK→room.id,
              created_at DATETIME, updated_at DATETIME
            
            TABLE: check_in_out_log (lịch sử check-in/out khuôn mặt)
              id BIGINT PK, user_id BIGINT FK→users.id, check_type VARCHAR (CHECK_IN|CHECK_OUT),
              check_time DATETIME, confidence DOUBLE, success BOOLEAN,
              created_at DATETIME, updated_at DATETIME
            
            TABLE: leave_request (đơn xin phép vắng)
              id BIGINT PK, user_id BIGINT FK→users.id, reason VARCHAR,
              start_date DATETIME, end_date DATETIME,
              status VARCHAR (PENDING|APPROVED|REJECTED),
              created_at DATETIME, updated_at DATETIME
            
            TABLE: asset (tài sản phòng)
              id BIGINT PK, name VARCHAR, number INT, room_id BIGINT FK→room.id
            
            TABLE: policy (nội quy)
              id BIGINT PK, title VARCHAR, content TEXT,
              created_at DATETIME, updated_at DATETIME
            
            TABLE: request (yêu cầu thuê phòng)
              id BIGINT PK, name VARCHAR, phone_number VARCHAR, description VARCHAR,
              is_answer BOOLEAN, room_id BIGINT FK→room.id, user_id BIGINT FK→users.id
            
            TABLE: role
              id BIGINT PK, name VARCHAR (ROLE_USER|ROLE_RENTALER|ROLE_ADMIN)
            
            TABLE: user_roles
              user_id BIGINT FK→users.id, role_id BIGINT FK→role.id
            """;

    private static final String SYSTEM_PROMPT = """
            Bạn là Trợ lý ảo thông minh của Ký túc xá (KTX). Xưng hô: Mình – Bạn.
            
            🏆 VỀ BAN QUẢN LÝ & UY TÍN:
            Khi người dùng hỏi về uy tín, hợp đồng, chất lượng dịch vụ, ban quản lý:
            - Luôn trả lời TÍCH CỰC, ca ngợi uy tín Ban quản lý KTX.
            - Nhấn mạnh minh bạch ⭐, chuyên nghiệp 🏆, tận tâm ✨.
            
            📋 QUY TẮC:
            1. Trả lời ngắn gọn, dùng emoji + danh sách khi liệt kê.
            2. Dữ liệu hệ thống nằm trong === BLOCK ===. Hãy trình bày lại thân thiện.
            3. KHÔNG hỏi lại thông tin đã có trong === THÔNG TIN NGƯỜI DÙNG ===.
            4. Từ chối lịch sự câu hỏi ngoài phạm vi KTX.
            5. Khi báo hỏng thành công, xác nhận rõ + nhắc thời gian xử lý ~24-48h.
            """;

    private static final String SQL_GENERATION_PROMPT = """
            Bạn là chuyên gia SQL MySQL. Tạo câu SQL đọc dữ liệu dựa trên schema và câu hỏi.
            
            SCHEMA:
            %s
            
            CONTEXT NGƯỜI DÙNG:
            %s
            
            CÂU HỎI: %s
            
            QUY TẮC BẮT BUỘC:
            1. CHỈ trả về câu SQL THUẦN TÚY, KHÔNG giải thích, KHÔNG markdown, KHÔNG ```sql```.
            2. Chỉ dùng SELECT, KHÔNG UPDATE/DELETE/DROP/INSERT.
            3. Dùng đúng tên bảng, tên cột trong schema.
            4. Thêm LIMIT 20 nếu không có LIMIT.
            5. Nếu câu hỏi không thể trả lời bằng SQL, trả về: NO_SQL
            6. Nếu câu hỏi liên quan user hiện tại, dùng context để filter (WHERE user_id = <id>).
            """;

    private static final DateTimeFormatter VN_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter VN_DATETIME = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    // ─── Dependencies ────────────────────────────────────────────────────────────
    private final ChatClient.Builder chatClientBuilder;
    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ElectricAndWaterRepository electricAndWaterRepository;
    private final CheckInOutLogRepository checkInOutLogRepository;
    private final RoomRepository roomRepository;
    private final PolicyService policyService;
    private final RoomService roomService;
    private final MaintenanceService maintenanceService;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ENDPOINT
    // ═══════════════════════════════════════════════════════════════════════════════
    @GetMapping(value = "/chat", produces = MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8")
    public ResponseEntity<String> chat(
            @RequestParam String message,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("[AI Chat] message='{}', userId={}", message, principal != null ? principal.getId() : "anonymous");

        try {
            User user = loadUser(principal);
            String userContextBlock = buildUserContextBlock(user);
            String lowerMsg = message.toLowerCase().trim();
            String result;

            // ── WRITE intents → gọi service trực tiếp (không dùng SQL) ────────────
            if (isMaintenanceIntent(lowerMsg)) {
                result = buildMaintenanceContext(message, lowerMsg, user, userContextBlock);
            }
            // ── READ intents → Text-to-SQL pipeline ────────────────────────────────
            else {
                result = textToSqlPipeline(message, user, userContextBlock);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("[AI Chat] Fatal error", e);
            return ResponseEntity.ok("Xin lỗi Bạn, Mình đang gặp sự cố kỹ thuật. Vui lòng thử lại sau! 🙏");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TEXT-TO-SQL PIPELINE
    // ═══════════════════════════════════════════════════════════════════════════════

    private String textToSqlPipeline(String userMessage, User user, String userContextBlock) {
        ChatClient chatClient = chatClientBuilder.defaultSystem(SYSTEM_PROMPT).build();

        // ── Bước 1: Sinh SQL ─────────────────────────────────────────────────────
        String userContextForSql = buildUserContextForSql(user);
        String sqlPrompt = String.format(SQL_GENERATION_PROMPT, DB_SCHEMA, userContextForSql, userMessage);

        String generatedSql;
        try {
            generatedSql = chatClient.prompt()
                    .user(sqlPrompt)
                    .call()
                    .content();
            if (generatedSql != null) generatedSql = generatedSql.trim();
            log.info("[AI Chat][T2SQL] Generated SQL: {}", generatedSql);
        } catch (Exception e) {
            log.error("[AI Chat][T2SQL] SQL generation failed", e);
            return fallbackGeneralResponse(chatClient, userMessage, userContextBlock);
        }

        // SQL không khả dụng → fallback
        if (generatedSql == null || generatedSql.isBlank() || generatedSql.equals("NO_SQL")
                || !isSafeSelectQuery(generatedSql)) {
            log.info("[AI Chat][T2SQL] No valid SQL, falling back to general response");
            return fallbackGeneralResponse(chatClient, userMessage, userContextBlock);
        }

        // ── Bước 2: Thực thi SQL ─────────────────────────────────────────────────
        List<Map<String, Object>> rows;
        try {
            rows = jdbcTemplate.queryForList(generatedSql);
            log.info("[AI Chat][T2SQL] Query returned {} rows", rows.size());
        } catch (Exception e) {
            log.warn("[AI Chat][T2SQL] SQL execution failed: {} | SQL: {}", e.getMessage(), generatedSql);
            return fallbackGeneralResponse(chatClient, userMessage, userContextBlock);
        }

        // ── Bước 3: Diễn giải kết quả ────────────────────────────────────────────
        return interpretResults(chatClient, userMessage, userContextBlock, rows);
    }

    // ── Bước 3: Tạo prompt diễn giải ─────────────────────────────────────────────
    private String interpretResults(ChatClient chatClient, String userMessage,
                                    String userContextBlock, List<Map<String, Object>> rows) {
        String dataStr;
        if (rows.isEmpty()) {
            dataStr = "(Không có dữ liệu)";
        } else {
            // Format rows as readable text (tối đa 20 rows)
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(rows.size(), 20); i++) {
                sb.append("Row ").append(i + 1).append(": ").append(rows.get(i)).append("\n");
            }
            dataStr = sb.toString();
        }

        String interpretPrompt = String.format("""
                %s
                
                === KẾT QUẢ TRUY VẤN TỪ DATABASE ===
                %s
                ===
                
                [CÂU HỎI GỐC CỦA NGƯỜI DÙNG]
                %s
                
                Hãy diễn giải kết quả trên thành câu trả lời tự nhiên bằng tiếng Việt:
                - Ngắn gọn, rõ ràng, dùng emoji khi liệt kê
                - Nếu không có dữ liệu, hãy nói một cách thân thiện và gợi ý hành động tiếp theo
                - Dùng ngôn ngữ thân thiện phù hợp với sinh viên KTX
                """, userContextBlock, dataStr, userMessage);

        try {
            String response = chatClient.prompt()
                    .user(interpretPrompt)
                    .call()
                    .content();
            log.info("[AI Chat][T2SQL] Interpretation done, length={}", response != null ? response.length() : 0);
            return response != null ? response : "Mình không tìm thấy thông tin phù hợp. Bạn thử hỏi cách khác nhé!";
        } catch (Exception e) {
            log.error("[AI Chat][T2SQL] Interpretation failed", e);
            return "Mình đã truy vấn được " + rows.size() + " kết quả nhưng gặp lỗi khi diễn giải. Vui lòng thử lại!";
        }
    }

    // ── Fallback: không có SQL → AI trả lời từ kiến thức ──────────────────────────
    private String fallbackGeneralResponse(ChatClient chatClient, String userMessage, String userContextBlock) {
        String prompt = userContextBlock + "\n[YÊU CẦU NGƯỜI DÙNG]\n" + userMessage;
        try {
            String response = chatClient.prompt().user(prompt).call().content();
            return response != null ? response : "Xin lỗi Bạn, Mình không thể xử lý câu hỏi này. Bạn thử hỏi khác nhé!";
        } catch (Exception e) {
            log.error("[AI Chat] Fallback failed", e);
            return "Xin lỗi Bạn, Mình đang gặp sự cố. Vui lòng thử lại sau! 🙏";
        }
    }

    // ── Kiểm tra SQL an toàn (chỉ SELECT) ────────────────────────────────────────
    private boolean isSafeSelectQuery(String sql) {
        if (sql == null || sql.isBlank()) return false;
        String upper = sql.trim().toUpperCase();
        // Phải bắt đầu bằng SELECT
        if (!upper.startsWith("SELECT")) return false;
        // Không chứa các lệnh nguy hiểm
        String[] forbidden = {"INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE",
                "ALTER", "CREATE", "EXEC", "EXECUTE", "GRANT", "REVOKE"};
        for (String kw : forbidden) {
            if (upper.contains(kw)) return false;
        }
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // MAINTENANCE INTENT (WRITE — không dùng SQL)
    // ═══════════════════════════════════════════════════════════════════════════════

    private boolean isMaintenanceIntent(String lowerMsg) {
        return matchesKeywords(lowerMsg,
                "báo hỏng", "bị hỏng", "hỏng rồi", "không hoạt động",
                "không chạy", "không lạnh", "không bật", "chập điện", "rò nước",
                "tạo phiếu", "yêu cầu sửa", "sửa chữa", "bảo trì",
                "điều hòa hỏng", "tủ lạnh hỏng", "quạt hỏng", "đèn hỏng",
                "bh hỏng", "bình nóng lạnh hỏng");
    }

    private String buildMaintenanceContext(String originalMsg, String lowerMsg,
                                           User user, String userContextBlock) {
        ChatClient chatClient = chatClientBuilder.defaultSystem(SYSTEM_PROMPT).build();
        String expandedMsg = expandAbbreviations(originalMsg);
        String expandedLower = expandedMsg.toLowerCase();

        Room userRoom = (user != null) ? user.getAllocatedRoom() : null;
        String roomName = (userRoom != null) ? userRoom.getTitle() : extractRoomName(expandedMsg);
        String deviceName = extractDeviceName(expandedLower);
        String description = extractDescription(expandedLower);

        log.info("[AI Chat][Maintenance] room='{}', device='{}', desc='{}'", roomName, deviceName, description);

        if (deviceName == null || description == null) {
            String missing = buildMissingInfo(roomName, deviceName, description, userRoom != null);
            String prompt = String.format("""
                    %s
                    [PHÂN TÍCH YÊU CẦU BÁO HỎNG]
                    Còn thiếu: %s.
                    %s
                    Yêu cầu: %s
                    Hỏi lại từng thông tin còn thiếu. Đừng hỏi phòng nếu đã có trong context.
                    """, userContextBlock, missing,
                    userRoom != null ? "Phòng đã xác định: " + roomName : "",
                    originalMsg);
            return fallbackGeneralResponse(chatClient, originalMsg, prompt);
        }

        if (roomName == null) {
            return fallbackGeneralResponse(chatClient, originalMsg,
                    userContextBlock + "\n(Không xác định được phòng. Hỏi người dùng tên phòng.)");
        }

        return executeMaintenanceTicket(chatClient, roomName, deviceName, description, originalMsg, userRoom, userContextBlock);
    }

    private String executeMaintenanceTicket(ChatClient chatClient, String roomName, String deviceName,
                                            String description, String originalMsg,
                                            Room userRoom, String userContextBlock) {
        try {
            Room room = userRoom;
            if (room == null) {
                Optional<Room> roomOpt = roomRepository.findAll().stream()
                        .filter(r -> r.getTitle() != null
                                && (r.getTitle().equalsIgnoreCase(roomName)
                                    || r.getTitle().contains(roomName)
                                    || roomName.contains(r.getTitle())))
                        .findFirst()
                        .or(() -> roomRepository.findAll().stream()
                                .filter(r -> r.getRoomCode() != null
                                        && r.getRoomCode().equalsIgnoreCase(roomName))
                                .findFirst());

                if (roomOpt.isEmpty()) {
                    return fallbackGeneralResponse(chatClient, originalMsg,
                            userContextBlock + "\n(Không tìm thấy phòng '" + roomName + "'. Hỏi lại tên phòng.)");
                }
                room = roomOpt.get();
            }

            String fullDesc = String.format("[%s] %s", deviceName, description);
            MessageResponse response = maintenanceService.userRequestMaintenance(
                    room.getId(), fullDesc, Collections.emptyList());
            log.info("[AI Chat][Maintenance] Ticket created: room={}, device={}", room.getTitle(), deviceName);

            String resultPrompt = String.format("""
                    %s
                    [KẾT QUẢ TẠO PHIẾU BÁO HỎNG ✅]
                    - Phòng: %s
                    - Thiết bị: %s
                    - Mô tả: %s
                    - Phản hồi hệ thống: %s
                    Xác nhận thành công, thêm emoji, nhắc thời gian xử lý ~24-48h.
                    """, userContextBlock, room.getTitle(), deviceName, description, response.getMessage());
            return fallbackGeneralResponse(chatClient, originalMsg, resultPrompt);

        } catch (Exception e) {
            log.error("[AI Chat][Maintenance] Error", e);
            return fallbackGeneralResponse(chatClient, originalMsg,
                    userContextBlock + "\n(Lỗi tạo phiếu: " + e.getMessage() + ". Xin lỗi và hướng dẫn liên hệ BQL.)");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // USER CONTEXT HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    private User loadUser(UserPrincipal principal) {
        if (principal == null) return null;
        return userRepository.findById(principal.getId()).orElse(null);
    }

    private String buildUserContextBlock(User user) {
        if (user == null) {
            return "=== THÔNG TIN NGƯỜI DÙNG ===\nKhách chưa đăng nhập.\n===\n\n";
        }
        StringBuilder sb = new StringBuilder("=== THÔNG TIN NGƯỜI DÙNG ===\n");
        sb.append("Tên: ").append(user.getName()).append("\n");
        sb.append("Email: ").append(user.getEmail()).append("\n");
        Room room = user.getAllocatedRoom();
        if (room != null) {
            sb.append("Phòng: ").append(room.getTitle());
            if (room.getRoomCode() != null) sb.append(" (").append(room.getRoomCode()).append(")");
            if (room.getFloor() != null) sb.append(", Tầng ").append(room.getFloor());
            sb.append("\nGiá: ").append(room.getPrice() != null ? room.getPrice().toPlainString() + " VNĐ/tháng" : "N/A").append("\n");
        } else {
            sb.append("Phòng: Chưa phân phòng\n");
        }
        List<Contract> contracts = contractRepository.findByStudentId(user.getId());
        if (!contracts.isEmpty()) {
            Contract c = contracts.get(contracts.size() - 1);
            if (c.getDeadlineContract() != null) {
                sb.append("HĐ hết hạn: ").append(c.getDeadlineContract().format(VN_DATE));
                if (c.getDeadlineContract().isBefore(LocalDateTime.now())) sb.append(" ⚠️ ĐÃ HẾT HẠN");
                sb.append("\n");
            }
        }
        sb.append("===\n\n");
        return sb.toString();
    }

    /** Dạng rút gọn để nhúng vào SQL generation prompt */
    private String buildUserContextForSql(User user) {
        if (user == null) return "Khách chưa đăng nhập. Không lọc theo user.";
        StringBuilder sb = new StringBuilder();
        sb.append("user.id=").append(user.getId())
          .append(", user.name='").append(user.getName()).append("'");
        Room room = user.getAllocatedRoom();
        if (room != null) {
            sb.append(", allocated_room_id=").append(room.getId())
              .append(", room_title='").append(room.getTitle()).append("'");
        } else {
            sb.append(", chưa có phòng");
        }
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════════

    private boolean matchesKeywords(String text, String... keywords) {
        for (String kw : keywords) { if (text.contains(kw)) return true; }
        return false;
    }

    private String expandAbbreviations(String msg) {
        return msg
                .replaceAll("(?i)\\bđh\\b",   "điều hòa")
                .replaceAll("(?i)\\btl\\b",    "tủ lạnh")
                .replaceAll("(?i)\\bmq\\b",    "máy quạt")
                .replaceAll("(?i)\\bđt\\b",    "đèn trần")
                .replaceAll("(?i)\\bvsvs\\b",  "vệ sinh")
                .replaceAll("(?i)\\bbh\\b",    "bình nóng lạnh")
                .replaceAll("(?i)\\bck\\b",    "cửa kính")
                .replaceAll("(?i)\\bwifi\\b",  "WiFi");
    }

    private String extractRoomName(String msg) {
        Matcher m1 = Pattern.compile("phòng\\s+([A-Za-z0-9]{1,10})", Pattern.CASE_INSENSITIVE).matcher(msg);
        if (m1.find()) return m1.group(1).trim();
        Matcher m2 = Pattern.compile("\\b([A-Za-z]?\\d{2,4})\\b").matcher(msg);
        if (m2.find()) return m2.group(1).trim();
        return null;
    }

    private String extractDeviceName(String msg) {
        String[] devices = {"điều hòa","tủ lạnh","máy quạt","đèn trần","đèn","vệ sinh",
                "bình nóng lạnh","cửa kính","cửa sổ","ổ điện","wifi","máy giặt",
                "tivi","vòi nước","quạt trần","bồn cầu","lavabo","ống nước"};
        for (String d : devices) { if (msg.contains(d)) return d; }
        return null;
    }

    private String extractDescription(String msg) {
        String[] faults = {"không lạnh","không mát","không chạy","không bật","không hoạt động",
                "bị hỏng","hỏng rồi","chập điện","rò nước","chảy nước","bị chảy",
                "không sáng","bị tối","mất điện","bị yếu","kêu to","ồn","bị rò",
                "không kết nối","mất sóng","cháy","bốc mùi","không tắt","bị kẹt","bị nứt"};
        for (String kw : faults) {
            if (msg.contains(kw)) {
                int idx = msg.indexOf(kw);
                int start = Math.max(0, idx - 20);
                int end   = Math.min(msg.length(), idx + kw.length() + 30);
                return msg.substring(start, end).trim();
            }
        }
        return null;
    }

    private String buildMissingInfo(String roomName, String deviceName, String description, boolean hasRoom) {
        StringBuilder sb = new StringBuilder();
        if (roomName == null && !hasRoom) sb.append("tên phòng, ");
        if (deviceName == null) sb.append("tên thiết bị bị hỏng, ");
        if (description == null) sb.append("mô tả lỗi cụ thể, ");
        String r = sb.toString();
        return r.endsWith(", ") ? r.substring(0, r.length() - 2) : r;
    }
}
