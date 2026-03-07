package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.models.Banner;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.BannerRepository;
import com.cntt.rentalmanagement.services.BannerService;
import com.cntt.rentalmanagement.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final FileStorageService fileStorageService;

    @Override
    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActiveOrderByOrderIndexAsc(true);
    }

    @Override
    public Page<Banner> getAllBanners(Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize);
        return bannerRepository.findAll(pageable);
    }

    @Override
    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Banner không tồn tại"));
    }

    @Override
    public Banner createBanner(Banner banner, MultipartFile file) {
        if (Boolean.TRUE.equals(banner.getIsActive()) && bannerRepository.countByIsActive(true) >= 5) {
            throw new BadRequestException("Đã đạt giới hạn 5 banner hoạt động. Vui lòng tắt bớt banner cũ.");
        }
        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            banner.setImageUrl(fileName);
        }
        return bannerRepository.save(banner);
    }

    @Override
    public Banner updateBanner(Long id, Banner banner, MultipartFile file) {
        Banner existingBanner = getBannerById(id);
        
        if (Boolean.TRUE.equals(banner.getIsActive()) && 
            !Boolean.TRUE.equals(existingBanner.getIsActive()) && 
            bannerRepository.countByIsActive(true) >= 5) {
            throw new BadRequestException("Đã đạt giới hạn 5 banner hoạt động. Vui lòng tắt bớt banner cũ.");
        }

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            existingBanner.setImageUrl(fileName);
        } else if (banner.getImageUrl() != null) {
            existingBanner.setImageUrl(banner.getImageUrl());
        }

        existingBanner.setTitle(banner.getTitle());
        existingBanner.setSubtitle(banner.getSubtitle());
        existingBanner.setButtonText(banner.getButtonText());
        existingBanner.setUrl(banner.getUrl());
        existingBanner.setIsActive(banner.getIsActive());
        existingBanner.setOrderIndex(banner.getOrderIndex());
        
        return bannerRepository.save(existingBanner);
    }

    @Override
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    @Override
    public MessageResponse toggleActive(Long id) {
        Banner banner = getBannerById(id);
        boolean newStatus = !Boolean.TRUE.equals(banner.getIsActive());
        
        if (newStatus && bannerRepository.countByIsActive(true) >= 5) {
            throw new BadRequestException("Đã đạt giới hạn 5 banner hoạt động. Vui lòng tắt bớt banner cũ.");
        }
        
        banner.setIsActive(newStatus);
        bannerRepository.save(banner);
        return MessageResponse.builder()
                .message(newStatus ? "Kích hoạt banner thành công" : "Hủy kích hoạt banner thành công")
                .build();
    }
}
