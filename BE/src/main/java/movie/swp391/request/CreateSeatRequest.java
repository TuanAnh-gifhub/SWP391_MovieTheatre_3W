package movie.swp391.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class CreateSeatRequest {
 Integer cinemaRoomId;
 List<SeatDTO> seats;

 @Data
 @NoArgsConstructor
 @AllArgsConstructor
 @Builder
 @FieldDefaults(level = AccessLevel.PRIVATE)
 public static class SeatDTO {
  String seatName;
  String seatType;
  Double price;
 }
}