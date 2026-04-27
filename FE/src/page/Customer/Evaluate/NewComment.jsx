
import React, { useState } from 'react';
import { createComment } from '../../../service/evaluate';

const NewComment = ({ movieId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerId = localStorage.getItem('id');
    if (!customerId) {
      setMessage('Bạn cần đăng nhập để bình luận!');
      return;
    }
    if (!content.trim()) {
      setMessage('Vui lòng nhập nội dung bình luận!');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await createComment({ movieId, customerId, content, rating });
    setLoading(false);
    setMessage(res.message || 'Đã gửi bình luận!');
    if (res.status === 200 && typeof onCommentAdded === 'function') {
      setContent('');
      setRating(5);
      onCommentAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-black/20 rounded-lg border border-orange-200">
      <div className="mb-2 font-semibold text-orange-400">Viết bình luận của bạn</div>
      <textarea
        className="w-full p-2 rounded border border-gray-300 mb-2 text-black"
        rows={3}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Nhập nội dung bình luận..."
        disabled={loading}
      />
      <div className="flex items-center gap-3 mb-2">
        <span className="font-semibold text-orange-400">Đánh giá:</span>
        {[1,2,3,4,5].map(star => (
          <button
            type="button"
            key={star}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-400'} focus:outline-none`}
            onClick={() => setRating(star)}
            disabled={loading}
          >★</button>
        ))}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Đang gửi...' : 'Gửi bình luận'}
      </button>
      {message && <div className="mt-2 text-sm text-red-500 font-semibold">{message}</div>}
    </form>
  );
};

export default NewComment;
