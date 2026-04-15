package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.*;
import movie.swp391.entity.*;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.*;
import movie.swp391.repository.AccountRepository;
import movie.swp391.repository.CommentRepository;
import movie.swp391.repository.MovieRepository;
import movie.swp391.repository.TicketBookingRepository;
import movie.swp391.request.comment.CommentRequest;
import movie.swp391.response.comment.CommentResponse;
import movie.swp391.response.comment.RatingOverviewResponse;
import movie.swp391.response.comment.RatingSummaryResponse;
import movie.swp391.service.CommentService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepo;
    private final AccountRepository accountRepo;
    private final MovieRepository movieRepo;
    private final TicketBookingRepository ticketBookingRepo;

    @Override
    public CommentResponse createComment(Integer accountId, Integer movieId, CommentRequest request) {
        Account account = accountRepo.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy tài khoản"));
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy phim"));

        if (!hasWatchedMovie(accountId, movieId)) {
            throw new AppException(ErrorHandler.VALIDATION_FAILED, "Bạn phải xem phim rồi mới được đánh giá");
        }

        if (commentRepo.existsByAccountAndMovie(account, movie)) {
            throw new AppException(ErrorHandler.VALIDATION_FAILED, "Bạn đã đánh giá phim này rồi");
        }

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setRating(request.getRating());
        comment.setEdited(false);
        comment.setHidden(false);
        comment.setMovie(movie);
        comment.setAccount(account);
        comment.setCreatedAt(LocalDateTime.now());

        return toResponse(commentRepo.save(comment));
    }

    @Override
    public CommentResponse editComment(Integer commentId, Integer accountId, CommentRequest request) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy bình luận"));

        if (!comment.getAccount().getAccountID().equals(accountId)) {
            throw new AppException(ErrorHandler.UNAUTHORIZED, "Bạn không có quyền chỉnh sửa bình luận này");
        }

        comment.setContent(request.getContent());
        comment.setRating(request.getRating());
        comment.setEdited(true);
        return toResponse(commentRepo.save(comment));
    }

    @Override
    public List<CommentResponse> getCommentsByMovie(Integer movieId, Integer rating) {
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy phim"));

        List<Comment> comments = (rating == null)
                ? commentRepo.findByMovieAndHiddenFalseOrderByCreatedAtDesc(movie)
                : commentRepo.findByMovieAndHiddenFalseAndRatingOrderByCreatedAtDesc(movie, rating);

        return comments.stream().map(this::toResponse).collect(Collectors.toList());
    }
    @Override
    public List<CommentResponse> getAllCommentsForAdmin(Integer movieId, Integer rating) {
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy phim"));

        List<Comment> comments = (rating == null)
                ? commentRepo.findByMovieOrderByCreatedAtDesc(movie)
                : commentRepo.findByMovieAndRatingOrderByCreatedAtDesc(movie, rating);

        return comments.stream().map(this::toResponse).collect(Collectors.toList());
    }


    @Override
    public String toggleHiddenComment(Integer commentId) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy bình luận"));

        boolean isCurrentlyHidden = comment.getHidden() != null && comment.getHidden();

        comment.setHidden(!isCurrentlyHidden);
        commentRepo.save(comment);

        return isCurrentlyHidden ? "Đã hiện bình luận thành công" : "Đã ẩn bình luận thành công";
    }



    private boolean hasWatchedMovie(Integer accountId, Integer movieId) {
        Customer customer = accountRepo.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy tài khoản"))
                .getCustomer();

        if (customer == null) return false;

        List<TicketBooking> bookings = ticketBookingRepo
                .findByCustomerCustomerIDAndStatusOrderByBookingDateDesc(customer.getCustomerID(), "Success");

        LocalDateTime now = LocalDateTime.now();

        return bookings.stream()
                .filter(b -> b.getShowtime() != null && b.getShowtime().getMovie().getMovieID().equals(movieId))
                .anyMatch(b -> {
                    LocalDateTime startTime = LocalDateTime.of(b.getDateShow(), b.getTimeShow());
                    Integer runningTime = b.getShowtime().getMovie().getRunningTime();
                    if (runningTime == null) return false;
                    LocalDateTime endTime = startTime.plusMinutes(runningTime);
                    return now.isAfter(endTime);
                });
    }

    @Override
    public RatingOverviewResponse getRatingOverviewByMovie(Integer movieId) {
        Movie movie = movieRepo.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy phim"));

        Double avgRating = commentRepo.getAverageRating(movie);
        Long totalRatings = commentRepo.countRatings(movie);
        Long totalComments = commentRepo.countComments(movie);
        List<RatingSummaryResponse> summaries = commentRepo.countCommentsByRating(movie);

        return new RatingOverviewResponse(
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                totalRatings != null ? totalRatings : 0L,
                totalComments != null ? totalComments : 0L,
                summaries
        );
    }


    private CommentResponse toResponse(Comment comment) {
        Account account = comment.getAccount();
        String name;

        int roleId = account.getRole().getRoleID();

        if (roleId == 1 && account.getAdmin() != null) {
            name = account.getAdmin().getFullName() + " (ADMIN)";
        } else if (roleId == 2 && account.getCustomer() != null) {
            name = account.getCustomer().getFullName();
        } else if (roleId == 3 && account.getEmployee() != null) {
            name = account.getEmployee().getFullName() + " (EMPLOYEE)";
        } else {
            name = account.getUsername();
        }

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getRating(),
                name,
                comment.getEdited(),
                comment.getHidden(),
                comment.getCreatedAt(),
                account.getAccountID()
        );
    }
}

