import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getAllMovies } from "../../../service/landingpage";
import {
  FaClock, FaLanguage, FaClosedCaptioning, FaTag, FaInfoCircle, FaPlayCircle,
  FaArrowLeft, FaUserTie, FaCalendarAlt, FaBuilding, FaUsers,
  FaCalendarCheck, FaCalendarTimes, FaSignal
} from "react-icons/fa";
import Snackbar from "../BookMovieTickets/Snackbar";
import BookingSection from "../BookMovieTickets/BookingSection";

import CommentManagement from "../Evaluate/CommentManagement";
import React from "react";

// Component lấy số sao trung bình từ CommentManagement
const MovieAvgRating = ({ movieId }) => {
  const [avg, setAvg] = React.useState(null);
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    const fetch = async () => {
      try {
        const res = await import("../../../service/evaluate");
        const data = await res.getCommentsByMovie(movieId);
        if (Array.isArray(data) && data.length) {
          const avgRating = (data.reduce((sum, c) => sum + Number(c.rating), 0) / data.length).toFixed(1);
          setAvg(avgRating);
          setCount(data.length);
        } else {
          setAvg(null);
          setCount(0);
        }
      } catch {
        setAvg(null);
        setCount(0);
      }
    };
    if (movieId) fetch();
  }, [movieId]);
  return (
    <>
      <span>★</span>
      <span>{avg || '-'} </span>
      
    </>
  );
};

const MovieDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentShowtime, setCurrentShowtime] = useState(null); // Thêm state cho showtime hiện tại
  const [bookingInfo, setBookingInfo] = useState({
    movieTitle: "",
    cityName: "",
    cinemaName: "",
    date: "",
    time: "",
    selectedSeats: [],
    totalPrice: 0,
  });
  const [selectedFoods, setSelectedFoods] = useState([]);
  const isComingSoon = movie?.status === "Coming Soon";

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      const res = await getAllMovies();
      if (!res.error && Array.isArray(res.result)) {
        const normalize = str => str
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_");
        const found = res.result.find(
          (m) => normalize(m.title) === slug
        );
        setMovie(found || null);
      } else {
        setMovie(null);
      }
      setLoading(false);
    };
    fetchMovie();
  }, [slug]);

  // Hàm xử lý khi showtime thay đổi
  const handleShowtimeChange = (showtime) => {
    setCurrentShowtime(showtime);
  };

  if (loading) return <div className="text-center py-10 text-lg">Đang tải...</div>;
  if (!movie) return <div className="text-center py-10 text-red-500">Không tìm thấy phim hoặc phim không hợp lệ!</div>;

  return (
    <div className="relative min-h-screen w-full">
      {/* Lớp phủ background poster */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: movie?.poster
            ? `linear-gradient(rgba(44,44,55,0.7), rgba(44,44,55,0.7)), url(${movie.poster})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "background-image 0.5s"
        }}
      />
      {/* Main content */}
      <div className="relative z-20 min-h-screen w-full flex flex-col items-center justify-start">
        {/* Nút Quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="hidden md:flex md:absolute top-20 left-6 md:top-4 md:left-6 items-center gap-2 px-3 py-1 md:px-4 md:py-2 bg-orange-600 text-black rounded-full shadow-lg hover:bg-orange-500 hover:text-white font-semibold transition-all duration-200 z-50 border border-orange-200 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <FaArrowLeft className="text-lg" />
          <span className="hidden md:inline">Quay lại</span>
        </button>
        {/* Movie detail với overlay riêng */}
        <div
          className="movie-detail relative -mt-6 pt-0 mb-0 z-20 w-full max-w-3xl mx-auto flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20"
          style={{ transform: "scale(0.9)", fontSize: "90%" }}
        >
          {/* Overlay chỉ phủ phần chi tiết phim */}
          <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-sm pointer-events-none"></div>
          <div className="relative z-20 w-full flex flex-col md:flex-row">
            {/* Poster + Đánh giá trung bình */}
            <div className="hidden md:flex md:w-[270px] flex-shrink-0 items-center justify-center bg-transparent p-0 relative">
              {/* Đánh giá trung bình */}
              <div className="absolute left-3 top-40 z-20 flex items-center gap-1 bg-black px-3 py-1 rounded-full text-yellow-400 font-bold text-lg shadow">
                <MovieAvgRating movieId={movie.movieID} />
              </div>
              <img
                src={movie.poster}
                alt={movie.title}
                className="rounded-lg shadow-lg w-[270px] h-[580px] object-cover border-4 border-white/20 mt-8 mb-8"
                style={{ boxShadow: "0 8px 32px 0 rgba(255, 87, 34, 0.25)" }}
              />
              {/* Age badge */}
              <div className="absolute top-40 left-48 bg-black text-white font-bold rounded px-2 py-1 text-xl shadow">
                {movie.ageRating}
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 px-6 py-8 flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide leading-tight drop-shadow-lg text-white">
                    {movie.title}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-3 items-center mb-4">
                  <span className="flex items-center gap-2 text-orange-400 text-base font-semibold">
                    <FaTag /> {movie.genre}
                  </span>
                  <span className="flex items-center gap-2 text-orange-400 text-base font-semibold">
                    <FaClock /> {movie.runningTime}’
                  </span>
                  <span className="flex items-center gap-2 text-orange-400 text-base font-semibold">
                    <FaInfoCircle /> {movie.version}
                  </span>
                  <span className="flex items-center gap-2 text-orange-400 text-base font-semibold">
                    <FaClosedCaptioning /> Phụ Đề
                  </span>
                  <span className="flex items-center gap-2 text-orange-400 text-base font-semibold">
                    <FaLanguage /> {movie.language}
                  </span>
                </div>
                {/* Age rating highlight */}
                <div className="mb-4">
                  <span className="bg-orange-400 text-[#181a1f] font-bold px-3 py-1 rounded">
                    {movie.ageRating ? `${movie.ageRating}: Phim dành cho khán giả từ đủ ${movie.ageRating.replace(/\D/g, "") || "?"} tuổi trở lên (${movie.ageRating})` : ""}
                  </span>
                </div>
                {/* Director, Release, Company */}
                <div className="mb-2 flex flex-wrap gap-6 items-center">
                  <span className="flex items-center gap-2 text-gray-300 font-bold">
                    <FaUserTie className="text-lg" />
                    Đạo diễn:
                    <span className="text-white font-normal ml-1">{movie.director}</span>
                  </span>
                  <span className="flex items-center gap-2 text-gray-300 font-bold">
                    <FaCalendarAlt className="text-lg" />
                    Khởi chiếu:
                    <span className="text-white font-normal ml-1">{movie.releaseDate}</span>
                  </span>
                </div>
                <div className="mb-2 flex flex-wrap gap-6 items-center">
                  <span className="flex items-center gap-2 text-gray-300 font-bold">
                    <FaBuilding className="text-lg" />
                    Hãng sản xuất:
                    <span className="text-white font-normal ml-1">{movie.productionCompany}</span>
                  </span>
                </div>
                <div className="mb-2 flex flex-wrap gap-6 items-center">
                  <span className="flex items-center gap-2 text-gray-300 font-bold">
                    <FaUsers className="text-lg" />
                    Diễn viên:
                    <span className="text-white font-normal ml-1">{movie.actors}</span>
                  </span>
                </div>
                <div className="mb-2 flex flex-wrap gap-6 items-center">
                  <span className="flex items-center gap-2 text-gray-400 font-bold">
                    <FaCalendarCheck className="text-lg" />
                    Từ ngày:
                    <span className="text-white font-normal ml-1">{movie.fromDate || "Chưa có"}</span>
                  </span>
                  <span className="flex items-center gap-2 text-gray-400 font-bold">
                    <FaCalendarTimes className="text-lg" />
                    Đến ngày:
                    <span className="text-white font-normal ml-1">{movie.toDate || "Chưa có"}</span>
                  </span>
                </div>
                <div className="mb-2 flex flex-wrap gap-6 items-center">
                  <span className="flex items-center gap-2 text-orange-300 font-bold">
                    <FaSignal className="text-lg" />
                    Trạng thái:
                    <span className="text-white font-normal ml-1">{movie.status || "Chưa có"}</span>
                  </span>
                </div>
                {/* Description */}
                <div className="mt-6">
                  <div className="font-bold text-base mb-1 text-orange-400">MÔ TẢ</div>
                  <div className="text-gray-200">{movie.content}</div>
                </div>
              </div>
              {/* Trailer */}
              {movie.trailer && (
                <div className="mt-8">
                  <div className="font-semibold text-lg mb-2 flex items-center gap-2 text-orange-300">
                    <FaPlayCircle className="text-2xl" />
                    Trailer
                    <a
                      href={movie.trailer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 underline text-orange-200 hover:text-orange-400 transition"
                    >
                      Xem trên YouTube
                    </a>
                  </div>
                  {movie.trailer.includes("youtube.com") || movie.trailer.includes("youtu.be") ? (
                    <div className="aspect-video w-full max-w-xl rounded-lg overflow-hidden border border-gray-700 bg-black">
                      <iframe
                        src={
                          movie.trailer.includes("embed")
                            ? movie.trailer
                            : `https://www.youtube.com/embed/${movie.trailer.split("v=")[1]?.split("&")[0] || movie.trailer.split("/").pop()}`
                        }
                        title="Trailer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  ) : (
                    <a
                      href={movie.trailer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-500 font-semibold text-lg transition flex items-center gap-2 mt-2"
                    >
                      <FaPlayCircle className="text-2xl" />
                      Xem Trailer
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Booking Section + CommentManagement */}
        <div className="w-full max-w-4xl mx-auto mt-0">
          <BookingSection
            movie={movie}
            isComingSoon={isComingSoon}
            quickBooking={location.state?.quickBooking}
            bookingInfo={bookingInfo}
            setBookingInfo={setBookingInfo}
            onShowtimeChange={handleShowtimeChange}
            selectedFoods={selectedFoods}
            setSelectedFoods={setSelectedFoods}
          />
          {movie?.movieID && <CommentManagement movieId={movie.movieID} />}
        </div>
        {/* Chỉ hiển thị Snackbar khi đã chọn giờ */}
        {bookingInfo.time && (
          <Snackbar
            movieId={movie.movieID}
            movieTitle={bookingInfo.movieTitle}
            cinemaName={bookingInfo.cinemaName}
            cityName={bookingInfo.cityName}
            selectedSeats={bookingInfo.selectedSeats}
            totalPrice={bookingInfo.totalPrice}
            date={bookingInfo.date}
            time={bookingInfo.time}
            showtime={currentShowtime}
            onError={(errorMsg) => {
              console.error(errorMsg);
            }}
            disabled={
              isComingSoon ||
              !bookingInfo.cityName ||
              !bookingInfo.cinemaName ||
              !bookingInfo.date ||
              !bookingInfo.time ||
              bookingInfo.selectedSeats.length === 0
            }
            selectedFoods={selectedFoods}
          />
        )}
      </div>
    </div>
  );
};

export default MovieDetail;