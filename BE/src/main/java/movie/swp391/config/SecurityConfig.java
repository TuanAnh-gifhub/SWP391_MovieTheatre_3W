package movie.swp391.config;

import lombok.RequiredArgsConstructor;
import movie.swp391.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/api/movie/view-all-movies",
                                "/api/admin/employees/forgot-password",
                                "/api/admin/employees/reset-password-with-otp",
                                "/api/customer/view-all-showtime/{movieId}",
                                "/api/promotions/get-all-for-customer",
                                "/api/food-and-drink",
                                "/getCommentsByMovie/{movieId}",
                                "/api/**",
                                "/**",
                                "/movie/{movieId}/overview",
                                "/showtime/view-all-showtime",
                                "/", "/index.html", "/favicon.ico", "/assets/**", "/manifest.json", "/logo*.png", "/static/**"
                        ).permitAll()
                        .requestMatchers("/api/score-history/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/member/edit-profile").authenticated()
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
