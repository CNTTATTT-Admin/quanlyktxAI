package com.cntt.rentalmanagement.config;


import com.cntt.rentalmanagement.secruity.CustomUserDetailsService;
import com.cntt.rentalmanagement.secruity.FaceCheckFilter;
import com.cntt.rentalmanagement.secruity.RestAuthenticationEntryPoint;
import com.cntt.rentalmanagement.secruity.TokenAuthenticationFilter;
import com.cntt.rentalmanagement.secruity.oauth2.CustomOAuth2UserService;
import com.cntt.rentalmanagement.secruity.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.cntt.rentalmanagement.secruity.oauth2.OAuth2AuthenticationFailureHandler;
import com.cntt.rentalmanagement.secruity.oauth2.OAuth2AuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true,
        prePostEnabled = true
)
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Autowired
    private OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    @Autowired
    private HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Bean
    public TokenAuthenticationFilter tokenAuthenticationFilter() {
        return new TokenAuthenticationFilter();
    }

    /*
      By default, Spring OAuth2 uses HttpSessionOAuth2AuthorizationRequestRepository to save
      the authorization request. But, since our service is stateless, we can't save it in
      the session. We'll save the request in a Base64 encoded cookie instead.
    */
    @Bean
    public HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository() {
        return new HttpCookieOAuth2AuthorizationRequestRepository();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public FaceCheckFilter faceCheckFilter() {
        return new FaceCheckFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(new RestAuthenticationEntryPoint()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/send",
                                "/error",
                                "/favicon.ico",
                                "/auth/**",
                                "/electric",
                                "/oauth2/**",
                                "/export-bill/**",
                                "/customer/room/**",
                                "/account/send-mail/contact",
                                "/account/customer/**",
                                "/request/customer",
                                "/view-file/**",
                                "/document/**",
                                "/image/**",
                                "/api/auth/face-register",
                                "/blog-store/**",
                                "/api/ai/**"
                        ).permitAll()
                        // WebSocket
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/ws/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/room/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/banner/**")).permitAll()
                        // Static resources - dùng AntPathRequestMatcher để hỗ trợ /**/*.ext
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/**/*.png")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/**/*.gif")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/**/*.svg")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/**/*.jpg")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/**/*.html")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/**/*.css")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/**/*.js")).permitAll()
                        // Path variable với ** ở giữa
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/room/*/rentaler/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/account/*/*/**")).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .baseUri("/oauth2/authorize")
                                .authorizationRequestRepository(cookieAuthorizationRequestRepository())
                        )
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/oauth2/callback/*")
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler)
                );

        // Add our custom Token based authentication filter
        http.addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(faceCheckFilter(), TokenAuthenticationFilter.class);

        return http.build();
    }
}

