package movie.swp391.repository;

import movie.swp391.entity.*;
import movie.swp391.entity.Account;
import movie.swp391.entity.Comment;
import movie.swp391.entity.Movie;
import movie.swp391.response.comment.RatingSummaryResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    boolean existsByAccountAndMovie(Account account, Movie movie);
    List<Comment> findByMovieAndHiddenFalseAndRatingOrderByCreatedAtDesc(Movie movie, Integer rating);
    List<Comment> findByMovieAndHiddenFalseOrderByCreatedAtDesc(Movie movie);
    List<Comment> findByMovieOrderByCreatedAtDesc(Movie movie);
    List<Comment> findByMovieAndRatingOrderByCreatedAtDesc(Movie movie, Integer rating);

    @Query("SELECT new movie.swp391.response.comment.RatingSummaryResponse(c.rating, COUNT(c)) " +
            "FROM Comment c " +
            "WHERE c.movie = :movie AND c.hidden = false " +
            "GROUP BY c.rating")
    List<RatingSummaryResponse> countCommentsByRating(@Param("movie") Movie movie);

    @Query("SELECT AVG(c.rating) FROM Comment c WHERE c.movie = :movie AND c.hidden = false")
    Double getAverageRating(@Param("movie") Movie movie);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.movie = :movie AND c.hidden = false AND c.rating IS NOT NULL")
    Long countRatings(@Param("movie") Movie movie);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.movie = :movie AND c.hidden = false")
    Long countComments(@Param("movie") Movie movie);

}


