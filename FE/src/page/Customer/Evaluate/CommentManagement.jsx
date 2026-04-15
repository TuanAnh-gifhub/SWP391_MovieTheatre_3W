
import React, { useEffect, useState } from 'react';
import { getCommentsByMovie, editComment } from "../../../service/evaluate";
import NewComment from "./NewComment";
import { toast } from 'react-toastify';

const COMMENTS_PER_PAGE = 15;

const CommentManagement = ({ movieId }) => {

  const customerIdRaw = localStorage.getItem("id");
  const customerId = Number(customerIdRaw);
  

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(1);
  const [starFilter, setStarFilter] = useState(null); // null: tất cả, 1-5: lọc theo sao



  const fetchComments = async () => {
    setLoading(true);
    const data = await getCommentsByMovie(movieId);
    setComments(data);
    setLoading(false);
    setCurrentPage(1); // Reset page when movieId changes
    setEditingCommentId(null);
  };

  useEffect(() => {
    if (movieId) fetchComments();
    // eslint-disable-next-line
  }, [movieId]);


  if (loading) return <div className="text-center py-6 text-orange-400">Đang tải bình luận...</div>;

  // Pagination logic
  const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);
  const startIdx = (currentPage - 1) * COMMENTS_PER_PAGE;
  const endIdx = startIdx + COMMENTS_PER_PAGE;
  // Bộ lọc theo số sao
  const filteredComments = starFilter
    ? comments.filter(c => Number(c.rating) === starFilter)
    : comments;

  // Sắp xếp comment: comment của tài khoản đăng nhập trên cùng, còn lại mới nhất đến cũ nhất
  const sortedComments = (() => {
    const myComment = filteredComments.find(
      c => c.customerId !== undefined && c.customerId !== null && Number(c.customerId) === Number(customerId)
    );
    const otherComments = filteredComments
      .filter(c => !(c.customerId !== undefined && c.customerId !== null && Number(c.customerId) === Number(customerId)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return myComment ? [myComment, ...otherComments] : otherComments;
  })();

  const commentsToShow = sortedComments.slice(startIdx, endIdx);

  // Scrollable if more than 3 comments on current page
  const isScrollable = commentsToShow.length > 3;



  // Kiểm tra đã comment chưa
  const hasCommented = comments.some(
    c => c.customerId !== undefined && c.customerId !== null && Number(c.customerId) === Number(customerId)
  );

  return (
    <div className="mt-8 mb-8 p-6 bg-white/10 rounded-xl shadow-lg border border-white/20">
      <h2 className="text-xl font-bold text-orange-400 mb-4">Đánh giá & Bình luận của người xem</h2>
      {/* Bộ lọc nhanh theo số sao */}
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <span className="font-semibold text-orange-400">Lọc theo đánh giá:</span>
        {[1,2,3,4,5].map(star => {
          const count = comments.filter(c => Number(c.rating) === star).length;
          return (
            <button
              key={star}
              className={`px-2 py-1 rounded border font-semibold flex items-center gap-1 ${starFilter === star ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-orange-400 border-orange-200'}`}
              onClick={() => setStarFilter(starFilter === star ? null : star)}
            >
              <span>{star} <span className="text-yellow-400">★</span></span>
              <span className="text-xs text-gray-500">({count})</span>
            </button>
          );
        })}
        <button
          className={`px-2 py-1 rounded border font-semibold flex items-center gap-1 ${starFilter === null ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-orange-400 border-orange-200'}`}
          onClick={() => setStarFilter(null)}
        >
          Tất cả
          <span className="text-xs text-gray-500">({comments.length})</span>
        </button>
      </div>

      {/* Chỉ hiển thị form nhập bình luận nếu chưa comment */}
      {!hasCommented && (
        <NewComment movieId={movieId} onCommentAdded={fetchComments} />
      )}
      {/* Nếu chưa có comment thì hiển thị thông báo dưới form nhập */}
      {!comments.length ? (
        <div className="text-center py-6 text-gray-400">Chưa có bình luận nào cho phim này.</div>
      ) : (
        <div className={isScrollable ? "max-h-96 overflow-y-auto pr-2" : ""}>
          <ul className="space-y-6">
            {commentsToShow.map(comment => (
              <li key={comment.id} className="bg-black/30 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white flex items-center gap-1">
                    {comment.displayName}
                    {(comment.customerId !== undefined && comment.customerId !== null && Number(comment.customerId) === Number(customerId)) && (
                      <span title="Bình luận của bạn">
                        {/* Icon giống button profile trong Header */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-400 inline">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25v-1.5A4.5 4.5 0 019 14.25h6a4.5 4.5 0 014.5 4.5v1.5" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span className="text-yellow-400 font-bold">Đánh giá: {comment.rating} ⭐</span>
                </div>
                {/* Nếu đang chỉnh sửa comment này */}
                {editingCommentId === comment.id ? (
                  <form
                    className="mb-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await editComment({
                          commentId: comment.id,
                          customerId,
                          content: editContent,
                          rating: editRating,
                        });
                        fetchComments();
                        toast.success("Bình luận đã được cập nhật thành công!");
                      } catch (error) {
                        toast.error("Có lỗi xảy ra khi cập nhật bình luận.");
                        console.error(error);
                      }
                    }}
                  >
                    <textarea
                      className="w-full p-2 rounded bg-gray-900 text-white border border-orange-300 mb-2"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={2}
                      required
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-orange-300">Đánh giá:</span>
                      {[1,2,3,4,5].map(star => (
                        <button
                          type="button"
                          key={star}
                          className={`text-2xl ${star <= editRating ? 'text-yellow-400' : 'text-gray-400'} focus:outline-none`}
                          onClick={() => setEditRating(star)}
                        >★</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-3 py-1 rounded bg-orange-400 text-white font-semibold">Lưu</button>
                      <button type="button" className="px-3 py-1 rounded bg-gray-600 text-white font-semibold" onClick={() => setEditingCommentId(null)}>Hủy</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="text-gray-200 mb-2">{comment.content}</div>
                    <div className="text-xs text-gray-400 flex gap-2">
                      <span>{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
                      {comment.edited && <span className="italic text-orange-300">(Đã chỉnh sửa)</span>}
                      {comment.hidden && <span className="italic text-red-400">(Đã ẩn)</span>}
                    </div>
                    {/* Hiển thị nút chỉnh sửa nếu là comment của customerId hiện tại */}
                    {(comment.customerId !== undefined && comment.customerId !== null && Number(comment.customerId) === Number(customerId)) && (
                      <button
                        className="mt-2 flex items-center gap-1 text-orange-400 hover:text-orange-600 text-sm"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditContent(comment.content);
                          setEditRating(comment.rating);
                        }}
                        title="Chỉnh sửa bình luận"
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.789l-4 1 1-4 12.362-12.302z" />
                        </svg>
                        <span>Sửa</span>
                      </button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && comments.length > 0 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            className="px-3 py-1 rounded bg-orange-200 text-black font-semibold disabled:opacity-50"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded font-semibold ${currentPage === i + 1 ? 'bg-orange-400 text-white' : 'bg-white text-orange-400'}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-orange-200 text-black font-semibold disabled:opacity-50"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentManagement;
