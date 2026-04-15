package movie.swp391.service;

import movie.swp391.request.AutoRequest;

import java.time.LocalDate;

public interface AutomativeService {

     String autoAddMovie(Boolean turn);

      void autoGenerateShowtime(LocalDate date);
     void updateNumberOfShowtimesForCinema(AutoRequest request);




}
