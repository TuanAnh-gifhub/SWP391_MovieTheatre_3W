package movie.swp391.config;

import lombok.extern.slf4j.Slf4j;
import movie.swp391.entity.Permission;
import movie.swp391.entity.Role;
import movie.swp391.repository.PermissionRepository;
import movie.swp391.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
@Order(1) // Run first
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PermissionRepository permissionRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting role initialization...");
        List<String> roles = List.of("ADMIN", "EMPLOYEE", "CUSTOMER");

        for (String roleName : roles) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                log.info("Creating role: {}", roleName);
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
            } else {
                log.info("Role {} already exists", roleName);
            }
        }
        log.info("Role initialization completed");


        var adminRoleOpt = roleRepository.findByRoleNameWithPermissions("ADMIN");
        if (adminRoleOpt.isPresent()) {
            var adminRole = adminRoleOpt.get();
            if (adminRole.getPermissions() == null || adminRole.getPermissions().isEmpty()) {
                log.info("Assigning all permissions to ADMIN role...");
                var allPermissions = permissionRepository.findAll();
                adminRole.setPermissions(new java.util.HashSet<>(allPermissions));
                roleRepository.save(adminRole);
                log.info("All permissions assigned to ADMIN role.");
            } else {
                log.info("ADMIN role already has permissions, skipping assignment.");
            }
        } else {
            log.error("ADMIN role not found, cannot assign permissions!");
        }

        // Seed đầy đủ quyền cho tất cả API/controller phổ biến nếu bảng permissions đang rỗng
        if (permissionRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();
            List<Permission> permissions = Arrays.asList(
                    // Account
                    Permission.builder().code("VIEW_ACCOUNT").description("Xem tài khoản").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_ACCOUNT").description("Tạo tài khoản").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_ACCOUNT").description("Sửa tài khoản").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_ACCOUNT").description("Xóa tài khoản").createdAt(now).updatedAt(now).build(),

                    // Admin
                    Permission.builder().code("VIEW_ADMIN").description("Xem admin").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_ADMIN").description("Tạo admin").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_ADMIN").description("Sửa admin").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_ADMIN").description("Xóa admin").createdAt(now).updatedAt(now).build(),

                    // Employee
                    Permission.builder().code("VIEW_EMPLOYEE").description("Xem nhân viên").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_EMPLOYEE").description("Tạo nhân viên").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_EMPLOYEE").description("Sửa nhân viên").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_EMPLOYEE").description("Xóa nhân viên").createdAt(now).updatedAt(now).build(),

                    // Customer
                    Permission.builder().code("VIEW_CUSTOMER").description("Xem khách hàng").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_CUSTOMER").description("Tạo khách hàng").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_CUSTOMER").description("Sửa khách hàng").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_CUSTOMER").description("Xóa khách hàng").createdAt(now).updatedAt(now).build(),

                    // Movie
                    Permission.builder().code("CREATE_MOVIE").description("Tạo phim").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_MOVIE").description("Sửa phim").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_MOVIE").description("Xóa phim").createdAt(now).updatedAt(now).build(),

                    // Movie Date
                    Permission.builder().code("VIEW_MOVIE_DATE").description("Xem ngày chiếu phim").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_MOVIE_DATE").description("Tạo ngày chiếu phim").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_MOVIE_DATE").description("Sửa ngày chiếu phim").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_MOVIE_DATE").description("Xóa ngày chiếu phim").createdAt(now).updatedAt(now).build(),

                    // Ticket Booking
                    Permission.builder().code("VIEW_TICKET").description("Xem vé").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_TICKET").description("Đặt vé").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_TICKET").description("Sửa vé").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_TICKET").description("Xóa vé").createdAt(now).updatedAt(now).build(),

                    // ShowTime
                    Permission.builder().code("VIEW_SHOWTIME").description("Xem lịch chiếu").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_SHOWTIME").description("Tạo lịch chiếu").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_SHOWTIME").description("Sửa lịch chiếu").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_SHOWTIME").description("Xóa lịch chiếu").createdAt(now).updatedAt(now).build(),

                    // Cinema Room
                    Permission.builder().code("VIEW_CINEMA_ROOM").description("Xem phòng chiếu").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_CINEMA_ROOM").description("Tạo phòng chiếu").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_CINEMA_ROOM").description("Sửa phòng chiếu").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_CINEMA_ROOM").description("Xóa phòng chiếu").createdAt(now).updatedAt(now).build(),

                    // Food & Drink
                    Permission.builder().code("VIEW_FOOD").description("Xem đồ ăn/uống").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_FOOD").description("Tạo đồ ăn/uống").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_FOOD").description("Sửa đồ ăn/uống").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_FOOD").description("Xóa đồ ăn/uống").createdAt(now).updatedAt(now).build(),

                    // Coupon
                    Permission.builder().code("VIEW_COUPON").description("Xem mã giảm giá").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_COUPON").description("Tạo mã giảm giá").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_COUPON").description("Sửa mã giảm giá").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_COUPON").description("Xóa mã giảm giá").createdAt(now).updatedAt(now).build(),

                    // Promotion
                    Permission.builder().code("VIEW_PROMOTION").description("Xem khuyến mãi").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_PROMOTION").description("Tạo khuyến mãi").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_PROMOTION").description("Sửa khuyến mãi").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_PROMOTION").description("Xóa khuyến mãi").createdAt(now).updatedAt(now).build(),

                    // Comment
                    Permission.builder().code("VIEW_COMMENT").description("Xem bình luận").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_COMMENT").description("Tạo bình luận").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_COMMENT").description("Sửa bình luận").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_COMMENT").description("Xóa bình luận").createdAt(now).updatedAt(now).build(),

                    // Loyalty Rule
                    Permission.builder().code("VIEW_LOYALTY_RULE").description("Xem quy tắc tích điểm").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_LOYALTY_RULE").description("Tạo quy tắc tích điểm").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_LOYALTY_RULE").description("Sửa quy tắc tích điểm").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_LOYALTY_RULE").description("Xóa quy tắc tích điểm").createdAt(now).updatedAt(now).build(),

                    // Favorite Movie
                    Permission.builder().code("VIEW_FAVORITE_MOVIE").description("Xem phim yêu thích").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_FAVORITE_MOVIE").description("Thêm phim yêu thích").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_FAVORITE_MOVIE").description("Xóa phim yêu thích").createdAt(now).updatedAt(now).build(),

                    // Export Movie Date
                    Permission.builder().code("VIEW_EXPORT_MOVIE_DATE").description("Xem thống kê xuất phim").createdAt(now).updatedAt(now).build(),

                    // Permission, Role
                    Permission.builder().code("VIEW_PERMISSION").description("Xem quyền").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_PERMISSION").description("Tạo quyền").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_PERMISSION").description("Sửa quyền").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_PERMISSION").description("Xóa quyền").createdAt(now).updatedAt(now).build(),

                    Permission.builder().code("VIEW_ROLE").description("Xem vai trò").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("CREATE_ROLE").description("Tạo vai trò").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_ROLE").description("Sửa vai trò").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_ROLE").description("Xóa vai trò").createdAt(now).updatedAt(now).build(),

                    // Loyalty Tier
                    Permission.builder().code("CREATE_LOYALTY_TIER").description("Tạo hạng thành viên").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("EDIT_LOYALTY_TIER").description("Sửa hạng thành viên").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("VIEW_LOYALTY_TIER").description("Xem hạng thành viên").createdAt(now).updatedAt(now).build(),
                    Permission.builder().code("DELETE_LOYALTY_TIER").description("Xóa hạng thành viên").createdAt(now).updatedAt(now).build()

            );
            permissionRepository.saveAll(permissions);
            log.info("Seeded full permissions for all APIs!");
        }

        // Luôn gán lại tất cả permission cho ADMIN sau khi seed xong permission
        var adminRoleOpt2 = roleRepository.findByRoleNameWithPermissions("ADMIN");
        if (adminRoleOpt2.isPresent()) {
            var adminRole = adminRoleOpt2.get();
            var allPermissions = permissionRepository.findAll();
            adminRole.setPermissions(new java.util.HashSet<>(allPermissions));
            roleRepository.save(adminRole);
            log.info("All permissions assigned to ADMIN role (force update).");
        } else {
            log.error("ADMIN role not found, cannot assign permissions!");
        }
    }
}
