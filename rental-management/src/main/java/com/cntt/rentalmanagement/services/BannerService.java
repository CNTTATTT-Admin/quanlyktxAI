package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.models.Banner;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BannerService {
    List<Banner> getActiveBanners();
    Page<Banner> getAllBanners(Integer pageNo, Integer pageSize);
    Banner getBannerById(Long id);
    Banner createBanner(Banner banner, MultipartFile file);
    Banner updateBanner(Long id, Banner banner, MultipartFile file);
    void deleteBanner(Long id);
    MessageResponse toggleActive(Long id);
}
