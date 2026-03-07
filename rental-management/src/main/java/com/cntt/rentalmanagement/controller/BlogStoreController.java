package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.payload.request.BlogStoreRequest;
import com.cntt.rentalmanagement.services.BlogStoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/blog-store")
@RequiredArgsConstructor
public class BlogStoreController {
    private final BlogStoreService blogStoreService;

    @PostMapping("/save")
    public ResponseEntity<?> saveBlog(@RequestBody BlogStoreRequest storeRequest){
        return ResponseEntity.ok(blogStoreService.saveBlog(storeRequest));
    }

    @DeleteMapping("/unsave/{roomId}")
    public ResponseEntity<?> unsaveBlog(@PathVariable Long roomId) {
        return ResponseEntity.ok(blogStoreService.unsaveBlog(roomId));
    }

    @GetMapping("/check/{roomId}")
    public ResponseEntity<?> isBlogSaved(@PathVariable Long roomId) {
        return ResponseEntity.ok(blogStoreService.isBlogSaved(roomId));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllBlog(@RequestParam Integer pageNo,
                                        @RequestParam Integer pageSize) {
        return ResponseEntity.ok(blogStoreService.getPageOfBlog(pageNo, pageSize));
    }
}
