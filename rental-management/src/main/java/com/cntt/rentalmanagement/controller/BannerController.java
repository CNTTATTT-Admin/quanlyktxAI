package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.models.Banner;
import com.cntt.rentalmanagement.services.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/banner")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("/active")
    public ResponseEntity<?> getActiveBanners() {
        return ResponseEntity.ok(bannerService.getActiveBanners());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBanners(@RequestParam Integer pageNo,
                                           @RequestParam Integer pageSize) {
        return ResponseEntity.ok(bannerService.getAllBanners(pageNo, pageSize));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBannerById(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.getBannerById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createBanner(@RequestParam("title") String title,
                                          @RequestParam("subtitle") String subtitle,
                                          @RequestParam("buttonText") String buttonText,
                                          @RequestParam(value = "url", required = false) String url,
                                          @RequestParam("orderIndex") Integer orderIndex,
                                          @RequestParam("isActive") Boolean isActive,
                                          @RequestParam(value = "file", required = false) MultipartFile file) {
        Banner banner = new Banner();
        banner.setTitle(title);
        banner.setSubtitle(subtitle);
        banner.setButtonText(buttonText);
        banner.setUrl(url);
        banner.setOrderIndex(orderIndex);
        banner.setIsActive(isActive);
        return ResponseEntity.ok(bannerService.createBanner(banner, file));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBanner(@PathVariable Long id,
                                          @RequestParam("title") String title,
                                          @RequestParam("subtitle") String subtitle,
                                          @RequestParam("buttonText") String buttonText,
                                          @RequestParam(value = "url", required = false) String url,
                                          @RequestParam("orderIndex") Integer orderIndex,
                                          @RequestParam("isActive") Boolean isActive,
                                          @RequestParam(value = "file", required = false) MultipartFile file) {
        Banner banner = new Banner();
        banner.setTitle(title);
        banner.setSubtitle(subtitle);
        banner.setButtonText(buttonText);
        banner.setUrl(url);
        banner.setOrderIndex(orderIndex);
        banner.setIsActive(isActive);
        return ResponseEntity.ok(bannerService.updateBanner(id, banner, file));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.toggleActive(id));
    }
}
