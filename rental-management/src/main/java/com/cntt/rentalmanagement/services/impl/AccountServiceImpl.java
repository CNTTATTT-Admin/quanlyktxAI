package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.RoleName;
import com.cntt.rentalmanagement.domain.models.*;
import com.cntt.rentalmanagement.domain.payload.request.RoleRequest;
import com.cntt.rentalmanagement.domain.payload.request.SendEmailRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.UserResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.CheckInOutLogRepository;
import com.cntt.rentalmanagement.repository.*;
import com.cntt.rentalmanagement.services.AccountService;
import com.cntt.rentalmanagement.services.BaseService;
import com.cntt.rentalmanagement.utils.MapperUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    // --- Hệ thống Tài khoản & Quyền ---
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    // --- Hệ thống Bãi xe (Để dọn dẹp ảnh, hóa đơn, thẻ) ---
    private final ParkingCardRepository parkingCardRepository;
    private final ParkingPackageRepository parkingPackageRepository;
    private final ParkingImageRepository parkingImageRepository;
    private final InvoiceRepository invoiceRepository;

    // --- Hệ thống Phòng trọ & Hợp đồng ---
    private final RoomRepository roomRepository;
    private final RoomMediaRepository roomMediaRepository;
    private final AssetRepository assetRepository;
    private final ContractRepository contractRepository;
    private final ElectricAndWaterRepository electricAndWaterRepository;

    // --- Hệ thống Tương tác & Yêu cầu ---
    private final CommentRepository commentRepository;
    private final RateRepository rateRepository;
    private final RequestRepository requestRepository;
    private final CheckoutRequestRepository checkoutRequestRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final FollowRepository followRepository;
    private final BlogStoreRepository blogStoreRepository;
    private final CheckInOutLogRepository checkInOutLogRepository;
    private final MaintenanceRepository maintenanceRepository;

    // --- Tiện ích & Email ---
    private final MapperUtils mapperUtils;
    private final JavaMailSender mailSender;

    @Override
    public Page<User> getAllAccount(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return userRepository.searchingAccount(keyword,pageable);
    }

    @Override
    public Page<User> getAllAccountByRole(String keyword, List<RoleName> roles, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return userRepository.searchingAccountByRole(keyword, roles, pageable);
    }

    @Override
    public User getAccountById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
    }

    @Override
    @Async
    public void sendEmailForRentaler(Long id, SendEmailRequest sendEmailRequest) {
        try {
            sendEmailFromTemplate(sendEmailRequest);
        } catch (Exception e) {
            System.err.println("Async email failed: " + e.getMessage());
        }
    }

    @Override
    public MessageResponse divideAuthorization(Long id, RoleRequest roleRequest) {
        User user = userRepository.findById(id).orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));

        // Check if the user is already an Admin
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(RoleName.ROLE_ADMIN));
        if (isAdmin) {
            throw new BadRequestException("Không thể thay đổi quyền của Admin");
        }

        userRepository.deleteRoleOfAccount(user.getId());
        if (roleRequest.getRoleName().equals("RENTALER")) {
            Role userRole = roleRepository.findByName(RoleName.ROLE_RENTALER)
                    .orElseThrow(() -> new IllegalArgumentException("User Role not set."));
            Set<Role> roleSet = new HashSet<>();
            roleSet.add(userRole);
            user.setRoles(roleSet);
            userRepository.save(user);
        } else {
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new IllegalArgumentException("User Role not set."));
            Set<Role> roleSet = new HashSet<>();
            roleSet.add(userRole);
            user.setRoles(roleSet);
            userRepository.save(user);
        }

        return MessageResponse.builder().message("Phân quyền thành công.").build();
    }

    @Override
@Transactional
public void deleteMultipleAccounts(List<Long> ids) {
    for (Long id : ids) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại với ID: " + id));

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(RoleName.ROLE_ADMIN));
        if (isAdmin) {
            throw new BadRequestException("Không thể xóa tài khoản Admin (ID: " + id + ")");
        }

        // --- GIAI ĐOẠN 1: DỌN DẸP LOGS & YÊU CẦU ---
        checkInOutLogRepository.deleteByUserId(id);
        leaveRequestRepository.deleteByUserId(id);
        requestRepository.deleteByUserId(id);
        checkoutRequestRepository.deleteByUserId(id); // Phải thêm repo này
        followRepository.deleteByCustomerIdOrRentalerId(id); // Phải thêm repo này
        blogStoreRepository.deleteByUserId(id); // Phải thêm repo này
        commentRepository.deleteByUserId(id); 
        rateRepository.deleteByUserId(id);
        invoiceRepository.deleteByUserId(id);

        // --- GIAI ĐOẠN 2: XỬ LÝ HỢP ĐỒNG & PHÒNG (Dành cho Cư dân/Chủ trọ) ---
        // Nếu là cư dân, gỡ họ ra khỏi phòng trước
        if (user.getAllocatedRoom() != null) {
            user.setAllocatedRoom(null);
            userRepository.save(user);
        }
        contractRepository.deleteByStudentId(id);

        // Nếu là Chủ trọ, phải xóa toàn bộ Phòng và các dữ liệu đi kèm phòng
        List<Room> rooms = roomRepository.findByUserId(id);
        for (Room room : rooms) {
            assetRepository.deleteAllByRoom(room);
            roomMediaRepository.deleteAllByRoom(room);
            electricAndWaterRepository.deleteByRoomId(room.getId()); // Phải thêm repo này
            // Gỡ tất cả sinh viên đang ở phòng này ra
            userRepository.clearAllocatedRoomByRoomId(room.getId()); 
            contractRepository.deleteByRoomId(room.getId());

            requestRepository.deleteByRoomId(room.getId());
            commentRepository.deleteByRoomId(room.getId());
            rateRepository.deleteByRoomId(room.getId());
            blogStoreRepository.deleteByRoomId(room.getId());
            checkoutRequestRepository.deleteByRoomId(room.getId());
            maintenanceRepository.deleteByRoomId(room.getId());
            roomRepository.delete(room);
        }

        // --- GIAI ĐOẠN 3: XỬ LÝ BÃI GỬI XE (CỰC KỲ QUAN TRỌNG) ---
        // 1. Xóa ảnh và hóa đơn của các thẻ xe mà User này sở hữu
        List<ParkingCard> myCards = parkingCardRepository.findByUserId(id, Pageable.unpaged()).getContent();
        for (ParkingCard card : myCards) {
            parkingImageRepository.deleteAllByParkingCardId(card.getId());
            parkingCardRepository.delete(card);
        }

        // 2. GIẢI QUYẾT LỖI SQL BẠN GẶP: Xử lý các gói cước của Chủ trọ
        // Tìm tất cả thẻ xe (của bất kỳ ai) đang dùng gói cước của chủ trọ này
        List<ParkingCard> cardsUsingMyPackages = parkingCardRepository.findAllByPackageRentalerId(id);
        for (ParkingCard card : cardsUsingMyPackages) {
            //đưa package_id về null
            //card.setParkingPackage(null); 
            //parkingCardRepository.save(card);

            //xóa thẳng
            parkingImageRepository.deleteAllByParkingCardId(card.getId());
            invoiceRepository.deleteByParkingCardId(card.getId());
            parkingCardRepository.delete(card);
        }
        parkingPackageRepository.deleteByRentalerId(id);

        // --- GIAI ĐOẠN CUỐI: XÓA ROLE VÀ USER ---
        userRepository.deleteRoleOfAccount(id);
        userRepository.delete(user);
    }
}

    @Override
    @Async
    public void sendEmailForRentaler(SendEmailRequest sendEmailRequest) {
        try {
            sendEmailFromTemplateForContact(sendEmailRequest);
        } catch (Exception e) {
            System.err.println("Async email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendEmailOfCustomer(SendEmailRequest sendEmailRequest)  {
        try {
            sendEmailFromTemplateForCustomer(sendEmailRequest);
        } catch (Exception e) {
            System.err.println("Async email failed: " + e.getMessage());
        }
    }


    public void sendEmailFromTemplate(SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();

        message.setFrom(new InternetAddress("trungdang82678@gmail.com"));
        message.setRecipients(MimeMessage.RecipientType.TO, sendEmailRequest.getToEmail());
        message.setSubject(sendEmailRequest.getTitle());

        // Read the HTML template into a String variable
        String htmlTemplate = readFile("send-email.html");

        // Replace placeholders in the HTML template with dynamic values
        htmlTemplate = htmlTemplate.replace("NAM NGHIEM", sendEmailRequest.getNameOfRentaler());
        htmlTemplate = htmlTemplate.replace("DESCRIPTION", sendEmailRequest.getDescription());

        // Set the email's content to be the HTML template
        message.setContent(htmlTemplate, "text/html; charset=utf-8");

        mailSender.send(message);
    }

    public void sendEmailFromTemplateForCustomer(SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();


        message.setRecipients(MimeMessage.RecipientType.TO, sendEmailRequest.getToEmail());
        message.setSubject("Tin thuê phòng");

        // Read the HTML template into a String variable
        String htmlTemplate = readFile("send-email.html");

        // Replace placeholders in the HTML template with dynamic values
        htmlTemplate = htmlTemplate.replace("NAM NGHIEM", sendEmailRequest.getNameOfRentaler());
        htmlTemplate = htmlTemplate.replace("DESCRIPTION", sendEmailRequest.getDescription() + "Email:" + sendEmailRequest.getTitle());

        // Set the email's content to be the HTML template
        message.setContent(htmlTemplate, "text/html; charset=utf-8");

        mailSender.send(message);
    }

    public void sendEmailFromTemplateForContact(SendEmailRequest sendEmailRequest) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();

        message.setFrom(new InternetAddress("trungdang82678@gmail.com"));
        message.setRecipients(MimeMessage.RecipientType.TO, "dinhnam.nghiem.2611@gmail.com");
        message.setSubject(sendEmailRequest.getTitle());

        // Read the HTML template into a String variable
        String htmlTemplate = readFile("send-email.html");

        // Replace placeholders in the HTML template with dynamic values
        htmlTemplate = htmlTemplate.replace("NAM NGHIEM", sendEmailRequest.getNameOfRentaler());
        htmlTemplate = htmlTemplate.replace("DESCRIPTION", sendEmailRequest.getDescription() + ".Email: "+ sendEmailRequest.getToEmail());

        // Set the email's content to be the HTML template
        message.setContent(htmlTemplate, "text/html; charset=utf-8");

        mailSender.send(message);
    }

    public static String readFile(String filename) throws IOException {
        File file = ResourceUtils.getFile("classpath:send-email.html");
        byte[] encoded = Files.readAllBytes(file.toPath());
        return new String(encoded, StandardCharsets.UTF_8);
    }
}
