package movie.swp391.mapper;


import movie.swp391.entity.Account;
import movie.swp391.entity.ScoreHistory;
import movie.swp391.response.AccountResponse;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface AccountMapper {
    @Mapping(target = "role", source = "role.roleName")
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "dob", ignore = true)
    @Mapping(target = "sex", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "identityCard", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "score", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "image", ignore = true)
    @Mapping(target = "active", source = "active")
    AccountResponse toAccountResponse(Account account);

    @AfterMapping
    default void enrichAccountResponse(Account account, @MappingTarget AccountResponse response) {
        if (account.getCustomer() != null) {
            var c = account.getCustomer();
            response.setFullName(c.getFullName());
            response.setDob(c.getDob());
            response.setSex(c.getSex());
            response.setEmail(c.getEmail());
            response.setIdentityCard(c.getIdentityCard());
            response.setPhone(c.getPhone());
            response.setAddress(c.getAddress());
            response.setScore(c.getScore());
            response.setUpdatedDate(c.getUpdatedDate());
            if (c.getLoyaltyTier() != null) response.setRank(c.getLoyaltyTier().getName());
            else response.setRank("No rank");
            response.setRankImage(c.getLoyaltyTier() != null ? c.getLoyaltyTier().getRankLink() : "No rank image");
            response.setPlusScore(c.getScoreHistories().stream()
                    .filter(sh -> sh.getActionType().equalsIgnoreCase("plus"))
                    .mapToInt(ScoreHistory::getAmount).sum());
            response.setMinusScore(c.getScoreHistories().stream()
                    .filter(sh -> sh.getActionType().equalsIgnoreCase("minus"))
                    .mapToInt(ScoreHistory::getAmount).sum());
        } else if (account.getAdmin() != null) {
            var a = account.getAdmin();
            response.setFullName(a.getFullName());
            response.setEmail(a.getEmail());

        } else if (account.getEmployee() != null) {
            var e = account.getEmployee();
            response.setFullName(e.getFullName());
            response.setDob(e.getDob());
            response.setSex(e.getSex());
            response.setEmail(e.getEmail());
            response.setIdentityCard(e.getIdentityCard());
            response.setPhone(e.getPhone());
            response.setAddress(e.getAddress());
            response.setUpdatedDate(e.getUpdatedDate());
            response.setDepartment(e.getDepartment());
            response.setImage(e.getImage());
        }
    }
}