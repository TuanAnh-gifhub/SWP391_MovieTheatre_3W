package movie.swp391.mapper;


import movie.swp391.entity.Customer;
import movie.swp391.response.CustomerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface CustomerMapper {
    @Mapping(target = "accountID", source = "account.accountID")
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "scoreHistories", ignore = true)
    @Mapping(target = "favoriteGenres", ignore = true)
    @Mapping(target = "username", source = "account.username")
    @Mapping(target = "password", source = "account.password")
    CustomerResponse toCustomerResponse(Customer customer) ;
}
