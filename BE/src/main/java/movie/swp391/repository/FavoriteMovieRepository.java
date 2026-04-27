package movie.swp391.repository;

import movie.swp391.entity.Customer;
import movie.swp391.entity.FavoriteMovie;
import movie.swp391.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteMovieRepository extends JpaRepository<FavoriteMovie, Integer> {
    boolean existsByMovieAndCustomer(Movie movie, Customer customer);

    void deleteByMovie(Movie movie);

    FavoriteMovie findByMovie_MovieID(Integer movieMovieID);

    FavoriteMovie findByCustomer_CustomerID(Integer customerCustomerID);

    @Query("SELECT fm.movie FROM FavoriteMovie fm WHERE fm.customer.customerID = :customerId")
    List<Movie> findMovieByCustomer_CustomerID(@Param("customerId") Integer customerId);

    void deleteByMovie_MovieID(Integer movieMovieID);

    FavoriteMovie findFavoriteMovieByMovieAndCustomer(Movie movie, Customer customer);
}