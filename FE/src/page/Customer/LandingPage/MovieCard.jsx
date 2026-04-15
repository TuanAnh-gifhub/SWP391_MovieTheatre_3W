import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toggleFavoriteMovie, getFavoriteMovies } from "../../../service/wishlist";
import { toast } from "react-toastify";
/* eslint-disable react/prop-types */

const MovieCard = ({ tag, title, description, genre, duration, imgSrc, slug, movieId }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      const res = await getFavoriteMovies();
      if (!res.error && Array.isArray(res.result)) {
        // So sánh bằng slug (normalize title)
        const normalize = (str) =>
          str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_");
        setIsFavorite(
          res.result.some((item) => normalize(item.title || item.movieTitle) === slug)
        );
      }
    };
    fetchWishlist();
  }, [slug]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    e.preventDefault(); // Ngăn chuyển trang khi click icon
    const customerId = Number(localStorage.getItem("id"));
    if (!customerId) {
      toast.error("Bạn cần đăng nhập để sử dụng chức năng này!");
      return;
    }
    // Truyền đúng movieId
    const res = await toggleFavoriteMovie({ movieId, customerId });
    if (!res.error) {
      setIsFavorite((prev) => !prev);
      toast.success(isFavorite ? "Đã xóa khỏi danh sách yêu thích!" : "Đã thêm vào danh sách yêu thích!");
    } else {
      toast.error(res.message || "Cập nhật danh sách yêu thích thất bại!");
    }
  };

  return (
    <div
      className="group cursor-pointer relative flex flex-col items-center text-center bg-white p-2 sm:p-3 md:p-4 rounded-2xl min-h-[280px] w-full max-w-[95vw] sm:max-w-[320px] md:max-w-[260px] lg:max-w-[210px] xl:max-w-xs border-2 border-[#ff7120] shadow-lg hover:shadow-2xl hover:scale-105 hover:border-orange-600 transition-all duration-300 font-mono text-[#0e0e0e] text-base leading-[1.4]"
      style={{ fontSize: "90%" }}
    >
      {/* Tag */}
      {tag && (
        <span className="absolute top-3 left-3 text-[11px] font-bold bg-[#ffefe3] text-[#ff7120] px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider border border-[#ff7120]">
          {tag}
        </span>
      )}

      {/* Image Section */}
      <div className="h-36 w-full flex items-center justify-center rounded-xl overflow-hidden bg-gray-100 shadow group-hover:scale-105 transition-transform duration-300">
        <img
          src={imgSrc}
          alt={title}
          className="max-h-full max-w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Text Section */}
      <div className="flex flex-col items-center mt-4 space-y-1 flex-1 w-full">
        {/* Title */}
        <div className="h-9 flex items-center justify-center">
          <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-[#ff7120] transition-colors line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Description */}
        <div className="h-10 flex items-center justify-center">
          <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
        </div>

        {/* Genre & Duration */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="inline-block bg-[#fff7f0] text-[#ff7120] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#ff7120]">
            {genre}
          </span>
          <span className="inline-block bg-gray-100 text-gray-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">
            {duration} phút
          </span>
        </div>
      </div>

      {/* Button Section */}
      <div className="w-full mt-3">
        <button
          className="w-full bg-[#ff7120] hover:bg-orange-600 text-white py-2 px-3 rounded-xl text-sm font-bold shadow transition duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 -translate-y-2"
        >
          Xem chi tiết
        </button>
      </div>

      {/* Favorite Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          className="text-xl text-[#ff7120] hover:text-red-500 transition"
          title={isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          onClick={handleFavoriteClick}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
