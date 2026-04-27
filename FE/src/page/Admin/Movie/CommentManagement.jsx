import React, { useEffect, useState } from 'react';
import { getAllCommentsForAdmin, toggleHiddenComment } from "../../../service/evaluate";
import { Switch } from 'antd';
import { toast } from 'react-toastify';

const CommentManagement = ({ movieId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState(null); // null: tất cả, 1-5: lọc theo sao
  const [toggleLoading, setToggleLoading] = useState({}); // Lưu trạng thái loading cho từng comment

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getAllCommentsForAdmin(movieId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchComments();
    }
  }, [movieId]);

  // Hàm xử lý ẩn/hiện comment
  const handleToggleHidden = async (commentId, currentHidden) => {
    setToggleLoading(prev => ({ ...prev, [commentId]: true }));
    try {
      const response = await toggleHiddenComment(commentId);
      
      // Kiểm tra response và hiển thị message từ API
      if (response && response.message) {
        toast.success(response.message);
      } else {
        toast.success(currentHidden ? 'Đã hiện bình luận' : 'Đã ẩn bình luận');
      }
      
      // Cập nhật trạng thái comment trong state
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, hidden: !currentHidden }
            : comment
        )
      );
    } catch (error) {
      console.error('Error toggling comment hidden status:', error);
      
      // Hiển thị message lỗi từ API nếu có
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra khi thay đổi trạng thái bình luận');
      }
    } finally {
      setToggleLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-blue-400">Đang tải bình luận...</div>;
  }

  // Bộ lọc theo số sao
  const filteredComments = starFilter
    ? comments.filter(c => Number(c.rating) === starFilter)
    : comments;

  // Sắp xếp comment: mới nhất đến cũ nhất
  const sortedComments = filteredComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Đếm số lượng comment theo từng rating
  const getRatingCount = (rating) => {
    return comments.filter(c => Number(c.rating) === rating).length;
  };

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200">
      <h2 className="text-xl font-bold text-blue-600 mb-4">Đánh giá & Bình luận của người xem</h2>
      
      {/* Bộ lọc nhanh theo số sao */}
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <span className="font-semibold text-blue-600">Lọc theo đánh giá:</span>
        {[1,2,3,4,5].map(star => {
          const count = getRatingCount(star);
          return (
            <button
              key={star}
              className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-all duration-200 ${starFilter === star ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
              onClick={() => setStarFilter(starFilter === star ? null : star)}
            >
              <span>{star} <span className="text-yellow-500">★</span></span>
              <span className="text-xs text-gray-500">({count})</span>
            </button>
          );
        })}
        <button
          className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-all duration-200 ${starFilter === null ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
          onClick={() => setStarFilter(null)}
        >
          Tất cả
          <span className="text-xs text-gray-500">({comments.length})</span>
        </button>
      </div>

      {/* Danh sách comment */}
      {!comments.length ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
          <div className="text-4xl mb-2">💬</div>
          <div className="text-lg font-semibold">Chưa có bình luận nào cho phim này.</div>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
          {sortedComments.map(comment => (
            <div key={comment.id} className={`bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow ${comment.hidden ? 'border-red-200 bg-red-50' : 'border-blue-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {comment.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className={`font-semibold ${comment.hidden ? 'text-gray-500' : 'text-gray-800'}`}>
                    {comment.displayName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-500 font-bold text-lg">{comment.rating} ⭐</span>
                  {/* Switch ẩn/hiện comment */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Hiển thị:</span>
                    <Switch
                      checked={!comment.hidden}
                      onChange={() => handleToggleHidden(comment.id, comment.hidden)}
                      loading={toggleLoading[comment.id]}
                      size="small"
                      className="!bg-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className={`mb-3 leading-relaxed ${comment.hidden ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                {comment.content}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
                  {comment.edited && (
                    <span className="italic text-blue-500 bg-blue-100 px-2 py-1 rounded">
                      (Đã chỉnh sửa)
                    </span>
                  )}
                  {comment.hidden && (
                    <span className="italic text-red-500 bg-red-100 px-2 py-1 rounded">
                      (Đã ẩn)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentManagement;
