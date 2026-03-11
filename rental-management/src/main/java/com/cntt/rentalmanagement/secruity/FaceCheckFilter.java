package com.cntt.rentalmanagement.secruity;

import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class FaceCheckFilter extends OncePerRequestFilter {

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(FaceCheckFilter.class);
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final List<String> EXCLUDED_URLS = Arrays.asList(
            "/auth/**",
            "/oauth2/**",
            "/api/auth/face-register",
            "/favicon.ico",
            "/**/*.png",
            "/**/*.gif",
            "/**/*.svg",
            "/**/*.jpg",
            "/**/*.html",
            "/**/*.css",
            "/**/*.js",
            "/view-file/**",
            "/image/**",
            "/user/me",
            "/api/user/me",
            "/rentaler/me",
            "/admin/me",
            "/banner/active"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        boolean isExcluded = EXCLUDED_URLS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));

        if (isExcluded) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);

            if (user != null && user.getFaceVector() == null && user.getAllocatedRoom() != null) {
                logger.warn("User {} attempted to access {} without facial registration", user.getEmail(), path);
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"error\": \"FACE_REQUIRED\", \"message\": \"Vui lòng hoàn tất xác thực khuôn mặt để sử dụng chức năng này.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
