package movie.swp391.service;

import movie.swp391.entity.Movie;
import movie.swp391.response.MovieDayRevenueResponse;

import java.time.LocalDate;
import java.util.List;

public interface ExportService {
    void updateExportMovieDate(Movie movie,
                               LocalDate exportDate,
                               double totalMoney,
                               double totalMoneyWithoutFoodAndDiscount,
                               double totalMoneyDiscount,
                               double totalMoneyFood,
                               double buyFromStoreMoney);
    List<MovieDayRevenueResponse> getSummaryByExportDate();
}