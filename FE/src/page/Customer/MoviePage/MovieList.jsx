import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getAllMovies } from "../../../service/landingpage";
import MovieCard from "../LandingPage/MovieCard";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import ReactDOM from 'react-dom';
import ParallaxBackground from '../LandingPage/ParallaxBackground';
import { CiSun } from 'react-icons/ci';

const genreViToEn = {
  "Hành động": "Action",
  "Phiêu lưu": "Adventure",
  "Hoạt hình": "Animation",
  "Hài": "Comedy",
  "Chính kịch": "Drama",
  "Kinh dị": "Horror",
  "Tâm lý": "Psychological",
  "Tình cảm": "Romance",
  "Khoa học viễn tưởng": "Science Fiction",
  "Thần thoại": "Mythology",
  "Gia đình": "Family",
  "Âm nhạc": "Music",
  "Tài liệu": "Documentary",
  "Chiến tranh": "War",
  "Thể thao": "Sport",
  "Viễn Tây": "Western",
  "Trinh thám": "Detective",
  "Tội phạm": "Crime",
  "Lịch sử": "History",
  "Viễn tưởng": "Fantasy",
  "Kinh điển": "Classic",
  "Học đường": "School",
  "Siêu anh hùng": "Superhero",
  "Phim ngắn": "Short",
  "Phim truyền hình": "TV Series",
  "Phim Việt Nam": "Vietnamese",
};

const genreList = [
  "Kinh dị",
  "Thriller",
  "Hành động",
  "Hoạt hình",
  "Mystery",
  "Viễn tưởng",
  "Chính kịch",
  "Gia đình",
  "Khoa học viễn tưởng",
  "Phiêu lưu",
];

const MovieList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterActor, setFilterActor] = useState("");
  const [filterDirector, setFilterDirector] = useState("");
  const [filterAge, setFilterAge] = useState("Tất cả");
  const [customGenre, setCustomGenre] = useState("");

  // Dark mode state synced with localStorage (like LandingPage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  const params = new URLSearchParams(location.search);
  const status = params.get("status");

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      const res = await getAllMovies();
      setMovies(!res.error ? res.result : []);
      setLoading(false);
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const allGenres = [
    "Tất cả",
    ...Array.from(
      new Set(
        movies
          .map((m) => m.genre)
          .flatMap((g) => (g ? g.split(",").map((x) => x.trim()) : []))
      )
    ),
  ];

  const allAges = [
    "Tất cả",
    ...Array.from(new Set(movies.map((m) => m.ageRating).filter(Boolean))),
  ];

  const nowShowing = movies.filter((m) => m.status === "Now Showing");
  const comingSoon = movies.filter((m) => m.status === "Coming Soon");

  const normalizeText = (str) =>
    str
      ? str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "d")
          .trim()
      : "";

  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  const filterMovies = (list) => {
    return list.filter((movie) => {
      const genreMatch =
        selectedGenres.length === 0 ||
        (movie.genre &&
          movie.genre
            .split(",")
            .map((g) => normalizeText(g))
            .some((g) =>
              selectedGenres.some((selected) => {
                const en = genreViToEn[selected] || selected;
                return normalizeText(en) === g;
              })
            ));

      const actorMatch =
        !filterActor ||
        (movie.actors &&
          normalizeText(movie.actors).includes(normalizeText(filterActor)));

      const directorMatch =
        !filterDirector ||
        (movie.director &&
          normalizeText(movie.director).includes(normalizeText(filterDirector)));

      const ageMatch =
        filterAge === "Tất cả" || movie.ageRating === filterAge;

      return genreMatch && actorMatch && directorMatch && ageMatch;
    });
  };

  const BackButton = () => (
    <button
      onClick={() => navigate(-1)}
      className="hidden md:flex absolute top-25 left-6 items-center bg-white/70 hover:bg-orange-500 text-black hover:text-white font-semibold text-sm px-3 py-1 rounded shadow transition-all duration-200 z-20"
    >
      <FaArrowLeft className="mr-2 text-xs" />
      <span className="hidden md:inline">Quay lại</span>
    </button>
  );

  return ( 
    <div className="relative min-h-screen w-full font-mono text-[#e4e4e4] text-base leading-[1.4] overflow-x-hidden">
      {/* Nút chuyển chế độ sáng/tối giống LandingPage */}
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
      {/* Dark grid background like LandingPage */}
      <ParallaxBackground isDarkMode={isDarkMode} />
      {/* Main content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div className="flex items-center">
              <BackButton />
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              className={`flex items-center gap-2 px-3 py-1 rounded font-semibold border shadow-neon-orange transition-all duration-200
                ${isDarkMode
                  ? 'bg-[#23242a] text-[#ff7120] border-[#ff7120] hover:bg-[#ff7120]/20'
                  : 'bg-gray-200 text-orange-600 border-orange-300 hover:bg-orange-100'}
              `}
              onClick={() => setShowFilter(true)}
              style={isDarkMode
                ? { boxShadow: '0 0 8px 1px #ff7120aa' }
                : { boxShadow: '0 0 8px 1px #ffb380aa' }
              }
            >
              <FaFilter className="text-lg" />
              Bộ lọc
            </button>
          </div>

          {loading ? (
            <div className="text-[#ff7120] text-center font-semibold text-xl tracking-widest animate-pulse">
              Đang tải...
            </div>
          ) : movies.length === 0 ? (
            <div className="text-gray-400 text-center font-semibold text-xl">
              Không có phim phù hợp
            </div>
          ) : status === "Now Showing" ? (
            <>
              <h1 className="text-4xl font-extrabold mb-8 text-[#ff7120] text-center uppercase drop-shadow-neon-orange tracking-widest cyber-header">
                <span className="glow-text">Phim đang chiếu</span>
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mx-auto">
                {filterMovies(nowShowing).length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 font-semibold py-8">
                    Không có phim phù hợp với bộ lọc
                  </div>
                ) : (
                  filterMovies(nowShowing).map((movie) => (
                    <Link
                      key={movie.movieID}
                      to={`/movies/${normalize(movie.title)}`}
                      state={{ from: "list" }}
                    >
                      <div className="glass-card hover:scale-105 hover:shadow-neon-orange transition-all duration-300">
                        <MovieCard
                          tag={movie.status}
                          title={movie.title}
                          description={movie.content}
                          genre={movie.genre}
                          duration={movie.runningTime}
                          imgSrc={movie.poster}
                          slug={normalize(movie.title)}
                          movieId={movie.movieID}
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </>
          ) : status === "Coming Soon" ? (
            <>
              <h1 className="text-4xl font-extrabold mb-8 text-[#ff7120] text-center uppercase drop-shadow-neon-orange tracking-widest cyber-header">
                <span className="glow-text">Phim sắp chiếu</span>
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mx-auto">
                {filterMovies(comingSoon).length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 font-semibold py-8">
                    Không có phim phù hợp với bộ lọc
                  </div>
                ) : (
                  filterMovies(comingSoon).map((movie) => (
                    <Link
                      key={movie.movieID}
                      to={`/movies/${normalize(movie.title)}`}
                      state={{ from: "list" }}
                    >
                      <div className="glass-card hover:scale-105 hover:shadow-neon-orange transition-all duration-300">
                        <MovieCard
                          tag={movie.status}
                          title={movie.title}
                          description={movie.content}
                          genre={movie.genre}
                          duration={movie.runningTime}
                          imgSrc={movie.poster}
                          slug={normalize(movie.title)}
                          movieId={movie.movieID}
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold mb-6 text-[#ff7120] text-center uppercase drop-shadow-neon-orange tracking-widest cyber-header">
                <span className="glow-text">Phim đang chiếu</span>
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 justify-items-center mx-auto">
                {filterMovies(nowShowing).length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 font-semibold py-8">
                    Không có phim phù hợp với bộ lọc
                  </div>
                ) : (
                  filterMovies(nowShowing).map((movie) => (
                    <Link
                      key={movie.movieID}
                      to={`/movies/${normalize(movie.title)}`}
                      state={{ from: "list" }}
                    >
                      <div className="glass-card hover:scale-105 hover:shadow-neon-orange transition-all duration-300">
                        <MovieCard
                          tag={movie.status}
                          title={movie.title}
                          description={movie.content}
                          genre={movie.genre}
                          duration={movie.runningTime}
                          imgSrc={movie.poster}
                          slug={normalize(movie.title)}
                          movieId={movie.movieID}
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <h1 className="text-4xl font-extrabold mb-8 text-[#ff7120] text-center uppercase drop-shadow-neon-orange tracking-widest cyber-header">
                <span className="glow-text">Phim sắp chiếu</span>
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mx-auto">
                {filterMovies(comingSoon).length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 font-semibold py-8">
                    Không có phim phù hợp với bộ lọc
                  </div>
                ) : (
                  filterMovies(comingSoon).map((movie) => (
                    <Link
                      key={movie.movieID}
                      to={`/movies/${normalize(movie.title)}`}
                      state={{ from: "list" }}
                    >
                      <div className="glass-card hover:scale-105 hover:shadow-neon-orange transition-all duration-300">
                        <MovieCard
                          tag={movie.status}
                          title={movie.title}
                          description={movie.content}
                          genre={movie.genre}
                          duration={movie.runningTime}
                          imgSrc={movie.poster}
                          slug={normalize(movie.title)}
                          movieId={movie.movieID}
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </>
          )}

          {/* MODAL FILTER -> SIDEBAR FILTER */}
          {showFilter && (
            <>
              {/* Overlay */}
              <div
                className="fixed left-0 right-0 z-[10999] "
                style={{ top: '65px', height: 'calc(100vh - 65px)' }}
                onClick={() => setShowFilter(false)}
                aria-label="Đóng sidebar filter"
              />
              {/* Sidebar filter */}
              <div
                className="fixed right-0 z-[11000] w-full max-w-xs sm:max-w-sm bg-[#23242a] border-l-2 border-[#ff7120] shadow-neon-orange p-6 overflow-y-auto transition-transform duration-300"
                style={{ top: '65px', height: 'calc(100vh - 65px)', transform: showFilter ? 'translateX(0)' : 'translateX(100%)', boxSizing: 'border-box' }}
              >
                <button
                  className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-[#ff7120] transition"
                  onClick={() => setShowFilter(false)}
                  aria-label="Đóng"
                >
                  &times;
                </button>
                <h2 className="text-xl font-extrabold mb-4 text-center text-[#ff7120] tracking-widest cyber-header">
                  <span className="glow-text">Bộ lọc phim</span>
                </h2>
                <form className="grid grid-cols-4 gap-2 text-xs w-full" style={{ boxSizing: 'border-box' }}>
                  {/* Diễn viên */}
                  <div className="flex flex-col col-span-4">
                    <label className="block font-semibold text-[#ff7120] mb-1">
                      Diễn viên
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên diễn viên"
                      value={filterActor}
                      onChange={(e) => setFilterActor(e.target.value)}
                      className="border border-[#ff7120] rounded-lg px-2 py-1 bg-[#23242a] text-[#ff7120] focus:border-[#ff7120] focus:ring-2 focus:ring-[#ff7120]/30 transition font-mono w-full"
                      style={{ fontSize: "12px", boxSizing: 'border-box' }}
                    />
                  </div>
                  {/* Thể loại */}
                  <div className="flex flex-col col-span-4">
                    <label className="block font-semibold text-[#ff7120] mb-1">
                      Thể loại
                    </label>
                    <div className="max-h-32 overflow-y-auto border rounded-lg px-1 py-1 bg-[#23242a] text-xs border-[#ff7120]">
                      {genreList.map((genre) => (
                        <label
                          key={genre}
                          className="flex items-center gap-1 mb-1 cursor-pointer text-[#ff7120]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre)}
                            onChange={() => {
                              if (selectedGenres.includes(genre)) {
                                setSelectedGenres(selectedGenres.filter((g) => g !== genre));
                              } else {
                                setSelectedGenres([...selectedGenres, genre]);
                              }
                            }}
                          />
                          {genre}
                        </label>
                      ))}
                    </div>
                  
                  </div>
                  {/* Đạo diễn */}
                  <div className="flex flex-col col-span-4">
                    <label className="block font-semibold text-[#ff7120] mb-1">
                      Đạo diễn
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên đạo diễn"
                      value={filterDirector}
                      onChange={(e) => setFilterDirector(e.target.value)}
                      className="border border-[#ff7120] rounded-lg px-2 py-1 bg-[#23242a] text-[#ff7120] focus:border-[#ff7120] focus:ring-2 focus:ring-[#ff7120]/30 transition font-mono w-full"
                      style={{ fontSize: "12px", boxSizing: 'border-box' }}
                    />
                  </div>
                  {/* Giới hạn độ tuổi */}
                  <div className="flex flex-col col-span-4">
                    <label className="block font-semibold text-[#ff7120] mb-1">
                      Giới hạn độ tuổi
                    </label>
                    <select
                      value={filterAge}
                      onChange={(e) => setFilterAge(e.target.value)}
                      className="border border-[#ff7120] rounded-lg px-2 py-1 bg-[#23242a] text-[#ff7120] focus:border-[#ff7120] focus:ring-2 focus:ring-[#ff7120]/30 transition font-mono w-full"
                      style={{ fontSize: "12px", boxSizing: 'border-box' }}
                    >
                      {allAges.map((age) => (
                        <option key={age} value={age} className="bg-[#23242a] text-[#ff7120]">
                          {age}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Nút chấp nhận */}
                  <div className="col-span-4">
                    <button
                      type="button"
                      className="mt-2 w-full bg-gradient-to-r from-[#ff7120] to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white font-bold py-2 rounded-xl shadow-neon-orange transition text-base font-mono tracking-widest"
                      style={{ fontSize: "14px", boxShadow: '0 0 8px 1px #ff7120aa', boxSizing: 'border-box' }}
                      onClick={() => setShowFilter(false)}
                    >
                      Chấp nhận
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Custom styles for neon/glass/cyberpunk */}
      <style>{`
        .glass-card {
          background: rgba(36, 37, 42, 0.85);
          border-radius: 1.5rem;
          box-shadow: 0 4px 32px 0 #ff712055, 0 1.5px 8px 0 #ff7120aa;
          border: 2px solid #ff7120;
          backdrop-filter: blur(8px);
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .glass-modal {
          background: rgba(36, 37, 42, 0.95);
          border-radius: 2rem;
          box-shadow: 0 8px 32px 0 #ff712055, 0 2px 16px 0 #ff7120aa;
          backdrop-filter: blur(12px);
        }
        .shadow-neon-orange {
          box-shadow: 0 0 8px 1px #ff7120aa, 0 2px 16px 0 #ff712055;
        }
        .drop-shadow-neon-orange {
          filter: drop-shadow(0 0 8px #ff7120cc);
        }
        .cyber-header {
          font-family: 'VT323', 'Fira Mono', 'monospace', 'Consolas', 'Menlo', 'monospace';
          letter-spacing: 0.15em;
        }
        .glow-text {
          text-shadow: 0 0 8px #ff7120, 0 0 16px #ff7120aa;
        }
      `}</style>
    </div>
  );
};

export default MovieList;