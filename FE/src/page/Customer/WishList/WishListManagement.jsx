import React, { useEffect, useState } from "react";
import { getFavoriteMovies } from "../../../service/wishlist";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';

const WishListManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dark mode state synced with localStorage (like LandingPage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      const res = await getFavoriteMovies();
      if (!res.error) {
        setMovies(res.result || []);
      } else {
        toast.error(res.message || "Không thể lấy danh sách phim yêu thích");
      }
      setLoading(false);
    };
    fetchFavorites();
  }, []);

  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  if (loading) return (
    <div className="relative min-h-screen w-full pt-16">
      {/* Nút chuyển chế độ sáng/tối giống các trang khác */}
      <button
        onClick={() => {
          setIsDarkMode((prev) => {
            localStorage.setItem('landing_dark_mode', !prev);
            return !prev;
          });
        }}
        className="fixed top-20 right-1 z-[10000] w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-orange-100 border-gray-600 focus:outline-none"
        aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
        title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
      >
        <CiSun className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-orange-400'}`} />
      </button>
      <ParallaxBackground isDarkMode={isDarkMode} />
      <div className="relative z-10 pt-16">Đang tải danh sách phim yêu thích...</div>
    </div>
  );

  if (!movies.length)
    return (
      <div className="relative min-h-screen w-full pt-16">
        {/* Nút chuyển chế độ sáng/tối giống các trang khác */}
        <button
          onClick={() => {
            setIsDarkMode((prev) => {
              localStorage.setItem('landing_dark_mode', !prev);
              return !prev;
            });
          }}
          className="fixed top-20 right-1 z-[10000] w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-orange-100 border-gray-600 focus:outline-none"
          aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
          title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
        >
          <CiSun className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-orange-400'}`} />
        </button>
        <ParallaxBackground isDarkMode={isDarkMode} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-gradient-to-tr from-yellow-300 via-pink-200 to-red-200 rounded-full p-6 shadow-lg mb-6">
            <svg width="56" height="56" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 21s-6.5-4.35-9-7.61C1.17 11.09 1 9.5 2.09 8.09 3.18 6.68 5.09 6 6.5 7.09c1.41 1.09 2.5 2.91 2.5 2.91s1.09-1.82 2.5-2.91C14.91 6 16.82 6.68 17.91 8.09c1.09 1.41.92 3-1 5.3C18.5 16.65 12 21 12 21z"
                fill="#f87171"
                stroke="#f87171"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chưa có phim yêu thích
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-xs">
            Danh sách phim yêu thích của bạn đang trống.
            <br />
            Hãy khám phá và thêm những bộ phim bạn yêu thích!
          </p>
          <Link
            to="/movies"
            className="bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-500 hover:to-pink-500 text-white font-semibold px-6 py-2 rounded-full shadow transition"
          >
            Khám phá phim ngay
          </Link>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen w-full pt-16">
      {/* Nút chuyển chế độ sáng/tối giống các trang khác */}
      <button
        onClick={() => {
          setIsDarkMode((prev) => {
            localStorage.setItem('landing_dark_mode', !prev);
            return !prev;
          });
        }}
        className="fixed top-20 right-1 z-[10000] w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-orange-100 border-gray-600 focus:outline-none"
        aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
        title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
      >
        <CiSun className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-orange-400'}`} />
      </button>
      <ParallaxBackground isDarkMode={isDarkMode} />
      <div className="relative z-10 min-h-screen flex flex-col font-sans pb-16">
        <h2 className="text-4xl text-center font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 drop-shadow-lg tracking-tight">
          Danh sách phim yêu thích
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {movies.map((movie) => (
            <Link
              to={`/movies/${normalize(movie.movieTitle)}`}
              key={movie.movieId}
              className="group bg-gradient-to-br from-white/90 to-yellow-50 rounded-2xl shadow-xl p-5 flex flex-col items-center cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-yellow-100"
              style={{ textDecoration: "none" }}
            >
              <div className="relative w-44 h-64 mb-4 overflow-hidden rounded-xl shadow-lg">
                <img
                  src={movie.poster}
                  alt={movie.movieTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-yellow-400/90 text-xs font-bold px-2 py-1 rounded shadow text-gray-900">
                  Yêu thích
                </div>
              </div>
              <div className="font-bold text-lg text-gray-900 text-center line-clamp-2 mb-1 group-hover:text-yellow-600 transition-colors duration-200">
                {movie.movieTitle}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishListManagement;