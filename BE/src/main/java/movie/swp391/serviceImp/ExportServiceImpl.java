package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.*;
import movie.swp391.entity.ExportMovieDate;
import movie.swp391.entity.Movie;
import movie.swp391.repository.*;
import movie.swp391.repository.ExportMovieDateRepository;
import movie.swp391.response.ExportMovieDateSummaryResponse;
import movie.swp391.response.MovieDayRevenueResponse;
import movie.swp391.service.ExportService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class ExportServiceImpl implements ExportService {

    ExportMovieDateRepository exportMovieDateRepository;
    @Override
    @Transactional
    public void updateExportMovieDate(Movie movie,
                                      LocalDate exportDate,
                                      double totalMoney,
                                      double totalMoneyWithoutFoodAndDiscount,
                                      double totalMoneyDiscount,
                                      double totalMoneyFood,
                                      double buyFromScore) {
        ExportMovieDate exportMovieDate = new ExportMovieDate();
        exportMovieDate.setMovie(movie);
        exportMovieDate.setExportDate(exportDate);
        exportMovieDate.setTotalMoney(exportMovieDate.getTotalMoney() + totalMoney);
        exportMovieDate.setTotalMoneyWithoutFoodAndDiscount(exportMovieDate.getTotalMoneyWithoutFoodAndDiscount() + totalMoneyWithoutFoodAndDiscount);
        exportMovieDate.setTotalMoneyFood(exportMovieDate.getTotalMoneyFood() + totalMoneyFood);
        exportMovieDate.setSeller(exportMovieDate.getSeller() + 1);
        exportMovieDate.setBuyFromScoresToMoney(exportMovieDate.getBuyFromScoresToMoney() + buyFromScore);

        exportMovieDateRepository.save(exportMovieDate);

        exportMovieDate.setTotalMoneyDiscount(exportMovieDate.getTotalMoneyDiscount() + exportMovieDate.getTotalMoneyWithoutFoodAndDiscount()+exportMovieDate.getTotalMoneyFood() - exportMovieDate.getTotalMoney());
        exportMovieDateRepository.save(exportMovieDate);
    }

    @Override
    public List<MovieDayRevenueResponse> getSummaryByExportDate() {
        List<ExportMovieDateSummaryResponse> summaries = exportMovieDateRepository.summarizeByMovieAndDate();

        Map<LocalDate, List<ExportMovieDateSummaryResponse>> grouped = summaries.stream()
                .collect(Collectors.groupingBy(ExportMovieDateSummaryResponse::getExportDate));

        return grouped.entrySet().stream()
                .map(e -> MovieDayRevenueResponse.builder()
                        .exportDate(e.getKey())
                        .movies(e.getValue())
                        .build())
                .sorted(Comparator.comparing(MovieDayRevenueResponse::getExportDate).reversed())
                .collect(Collectors.toList());
    }

}




