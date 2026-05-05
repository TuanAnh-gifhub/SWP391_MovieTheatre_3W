package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roleID;

    @Column(length = 50, nullable = false, unique = true)
    private String roleName;

    @Column(length = 50, nullable = false, unique = true)
    private String roleCode;

    @Column(length = 255,columnDefinition = "NVARCHAR(MAX)")
    private String description;


    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    private List<Account> accounts;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Collection<? extends GrantedAuthority> getAuthorities() {
        String normalizedRoleName = this.roleName == null ? "" : this.roleName.trim();
        if (!normalizedRoleName.startsWith("ROLE_")) {
            normalizedRoleName = "ROLE_" + normalizedRoleName;
        }
        return List.of(new SimpleGrantedAuthority(normalizedRoleName));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return Objects.equals(roleID, role.roleID);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roleID);
    }
}
