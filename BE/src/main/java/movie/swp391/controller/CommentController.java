package movie.swp391.controller;

import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import movie.swp391.request.comment.CommentRequest;
import movie.swp391.response.comment.CommentResponse;
import movie.swp391.response.comment.RatingOverviewResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // Tạo mới comment
    @PostMapping("/createComment/{movieId}")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Integer movieId,
            @RequestParam Integer accountId,
            @RequestBody CommentRequest request
    ) {
        return ResponseEntity.ok(commentService.createComment(accountId, movieId, request));
    }

    // Chỉnh sửa comment
    @PutMapping("/editComment/{commentId}")
    public ResponseEntity<CommentResponse> editComment(
            @PathVariable Integer commentId,
            @RequestParam Integer accountId,
            @RequestBody CommentRequest request
    ) {
        return ResponseEntity.ok(commentService.editComment(commentId, accountId, request));
    }

    // Lấy danh sách comment theo movie + optional rating filter
    @GetMapping("/getCommentsByMovie/{movieId}")
    @PermitAll
    public ResponseEntity<List<CommentResponse>> getCommentsByMovie(
            @PathVariable Integer movieId,
            @RequestParam(required = false) Integer rating
    ) {
        return ResponseEntity.ok(commentService.getCommentsByMovie(movieId, rating));
    }

    // Admin ẩn comment
    @PutMapping("/{commentId}/toggle-hidden")
    public ResponseEntity<BaseResponse<Void>> toggleHiddenComment(@PathVariable Integer commentId) {
        String message = commentService.toggleHiddenComment(commentId);
        return ResponseEntity.ok(new BaseResponse<>(message, true, null));
    }


    // Tổng quan rating (average, counts, breakdown by star)
    @GetMapping("/movie/{movieId}/overview")
    public ResponseEntity<RatingOverviewResponse> getRatingOverview(@PathVariable Integer movieId) {
        return ResponseEntity.ok(commentService.getRatingOverviewByMovie(movieId));
    }

    // Admin xem tất cả comment của 1 movie
    @GetMapping("/admin/movie/{movieId}/all-comments")
    public ResponseEntity<List<CommentResponse>> getAllCommentsForAdmin(
            @PathVariable Integer movieId,
            @RequestParam(required = false) Integer rating
    ) {
        return ResponseEntity.ok(commentService.getAllCommentsForAdmin(movieId, rating));
    }



}
