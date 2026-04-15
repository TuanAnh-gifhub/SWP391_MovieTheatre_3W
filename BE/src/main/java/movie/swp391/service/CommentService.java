package movie.swp391.service;

import movie.swp391.request.comment.CommentRequest;
import movie.swp391.response.comment.CommentResponse;
import movie.swp391.response.comment.RatingOverviewResponse;

import java.util.List;

public interface CommentService {
    CommentResponse createComment(Integer accountId, Integer movieId, CommentRequest request);
    CommentResponse editComment(Integer commentId, Integer accountId, CommentRequest request);
    List<CommentResponse> getCommentsByMovie(Integer movieId, Integer rating);
    String toggleHiddenComment(Integer commentId);
    RatingOverviewResponse getRatingOverviewByMovie(Integer movieId);
    List<CommentResponse> getAllCommentsForAdmin(Integer movieId, Integer rating);

}

