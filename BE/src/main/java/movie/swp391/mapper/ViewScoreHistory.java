package movie.swp391.mapper;


import movie.swp391.entity.ScoreHistory;
import movie.swp391.entity.TicketBooking;
import movie.swp391.response.ViewScoreHistoryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Mapper(componentModel = "spring")
public interface ViewScoreHistory {

   @Mapping(target = "scoreID", source = "scoreID")
   @Mapping(target = "dateCreate", source = "date")
   @Mapping(target = "actionType", source = "actionType")
   @Mapping(target = "amount", source = "amount")
   ViewScoreHistoryResponse toBaseViewScoreHistoryResponse(ScoreHistory scoreHistory);

   default ViewScoreHistoryResponse toViewScoreHistoryResponse(ScoreHistory sh) {
      ViewScoreHistoryResponse dto = toBaseViewScoreHistoryResponse(sh);

      if (sh.getCustomer() != null && sh.getCustomer().getBookings() != null) {
         String movieNames = sh.getCustomer().getBookings().stream()
                 .map(TicketBooking::getMovieTitle)
                 .filter(title -> title != null && !title.isEmpty())
                 .distinct()
                 .collect(Collectors.joining(", "));

         dto.setMovieName(movieNames);
      }

      return dto;
   }

   default List<ViewScoreHistoryResponse> toViewScoreHistoryResponses(List<ScoreHistory> scoreHistories) {
      if (scoreHistories == null) return new ArrayList<>();
      return scoreHistories.stream()
              .map(this::toViewScoreHistoryResponse)
              .collect(Collectors.toList());
   }

}
