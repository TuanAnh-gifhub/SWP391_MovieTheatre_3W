package movie.swp391.mapper;


import movie.swp391.entity.Cinema;
import movie.swp391.entity.CinemaRoom;
import movie.swp391.entity.City;
import movie.swp391.response.Cityresponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface RoomMapper {

 Cityresponse.CinemaRoomDTO toCinemaRoomDTO(CinemaRoom cinemaRoom);

 Cityresponse.CinemaDTO toCinemaDTO(Cinema cinema);
 @Mapping(target = "name", source = "name")
 Cityresponse toCityResponse(City city);
}