import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import { getAllMovies, getAllShowtimes } from "../../../service/landingpage"; // 1. Import hàm
import MovieCard from "./MovieCard";
import HeroSection from "../../../components/HeroSection/HeroSection";
import heroImg from "../../../assets/img/hero-landingPage.png";
import { useNavigate } from "react-router-dom";
import QuickBooking from "./QuickBooking";
import Gratitude from "../Gratitude/Gratitude";
import { getProfileMember } from "../../../service/gratitude";
import { FaRegSadTear } from "react-icons/fa"; // Thêm icon
import Header from "../../../components/Header/Header";
import { useScrollspy } from "../../../context/ScrollspyContext";
import { AboutUsIntroSection, AboutUsFAQSection } from "../AboutUsPage/AboutUsPage";
import ParallaxBackground from "./ParallaxBackground";
import ParallaxCenter3D from "./ParallaxCenter3D";
import { CiSun } from "react-icons/ci";
import { getAllPromotionsForGuest } from "../../../service/voucher";
import { FaGamepad, FaGift, FaStar } from "react-icons/fa";

// ScrambleText: Hiệu ứng giải mã chữ (copy từ Header)
const ScrambleText = ({ text, triggerKey, duration = 400, interval = 30, className = "" }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let mounted = true;
    let frame = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?";
    const textArr = text.split("");
    let revealCount = 0;
    setDisplay(textArr.map(() => "").join(""));
    const totalFrames = Math.ceil(duration / interval);
    const scramble = () => {
      if (!mounted) return;
      if (frame < totalFrames) {
        // Reveal progressively
        revealCount = Math.floor((frame / totalFrames) * textArr.length);
        const scrambled = textArr.map((c, i) => {
          if (i < revealCount) return c;
          if (c === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        });
        setDisplay(scrambled.join(""));
        frame++;
        setTimeout(scramble, interval);
      } else {
        setDisplay(text);
      }
    };
    scramble();
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [triggerKey, text]);
  return <span className={className}>{display}</span>;
};

const LandingPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [showtimes, setShowtimes] = useState([]);
  const [allShowtimes, setAllShowtimes] = useState([]);
  const [nowTick, setNowTick] = useState(Date.now());
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [bookingMode] = useState("showtime");
  const [selected, setSelected] = useState({
    city: "",
    cinema: "",
    date: "",
    time: "",
  });
  const [bookingError, setBookingError] = useState("");
  const [showGratitude, setShowGratitude] = useState(false);
  const [birthdayName, setBirthdayName] = useState("");
  const checkedBirthdayRef = useRef(false);
  const navigate = useNavigate();
  const { setActiveSection } = useScrollspy();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Đọc trạng thái dark mode từ localStorage khi khởi tạo
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // State để trigger hiệu ứng giải mã khi section vào viewport
  const [decodeNowShowing, setDecodeNowShowing] = useState(false);
  const [decodeComingSoon, setDecodeComingSoon] = useState(false);
  const [decodeGamePromotion, setDecodeGamePromotion] = useState(false);
  const [decodePromotion, setDecodePromotion] = useState(false);
  const [decodeAboutUs, setDecodeAboutUs] = useState(false);
  const nowShowingRef = useRef();
  const comingSoonRef = useRef();
  const gamePromotionRef = useRef();
  const promotionRef = useRef();
  const aboutUsRef = useRef();
  const [promotionImages, setPromotionImages] = useState([]);

  // State cho scroll phim đang chiếu và sắp chiếu
  const [nowShowingStart, setNowShowingStart] = useState(0);
  const [comingSoonStart, setComingSoonStart] = useState(0);
  // Thêm state direction cho hiệu ứng slide
  const [nowShowingDirection, setNowShowingDirection] = useState(1); // 1: phải, -1: trái
  const [comingSoonDirection, setComingSoonDirection] = useState(1); // 1: phải, -1: trái

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMovies = async () => {
      setLoading(true);
      const res = await getAllMovies();
      if (!res.error) {
        setMovies(res.result);
      } else {
        setMovies([]);
      }
      setLoading(false);
    };
    fetchMovies();

    // Fetch promotion images for HeroSection
    const fetchPromotions = async () => {
      const res = await getAllPromotionsForGuest();
      if (Array.isArray(res.result)) {
        // Only take promotions with image
        setPromotionImages(res.result.filter(p => !!p.image).map(p => p.image));
      } else {
        setPromotionImages([]);
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    const fetchShowtimes = async () => {
      const res = await getAllShowtimes();
      if (!res.error && Array.isArray(res.result)) {
        setAllShowtimes(res.result);
      } else {
        setAllShowtimes([]);
      }
    };
    fetchShowtimes();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNowTick(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const visibleShowtimes = useMemo(() => {
    return allShowtimes.filter((showtime) => {
      if (!showtime?.active) return false;
      const showtimeDateTime = new Date(`${showtime.showDate}T${showtime.showTime}`);
      if (Number.isNaN(showtimeDateTime.getTime())) return false;
      return showtimeDateTime.getTime() > nowTick - 15 * 60 * 1000;
    });
  }, [allShowtimes, nowTick]);

  useEffect(() => {
    setBookingError("");
    setSelected({ city: "", cinema: "", date: "", time: "" });
    setSelectedMovieId("");
    setCinemas([]);
    setDates([]);
    setTimes([]);
    if (bookingMode === "movie") {
      setShowtimes([]);
      setCities([]);
    }
  }, [bookingMode]);

  useEffect(() => {
    // Intersection Observer cho từng section
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === "now-showing") {
            setDecodeNowShowing(entry.isIntersecting);
          }
          if (entry.target.id === "coming-soon") {
            setDecodeComingSoon(entry.isIntersecting);
          }
          if (entry.target.id === "game-promotion") {
            setDecodeGamePromotion(entry.isIntersecting);
          }
          if (entry.target.id === "promotion") {
            setDecodePromotion(entry.isIntersecting);
          }
          if (entry.target.id === "about-us") {
            setDecodeAboutUs(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (nowShowingRef.current) observer.observe(nowShowingRef.current);
    if (comingSoonRef.current) observer.observe(comingSoonRef.current);
    if (gamePromotionRef.current) observer.observe(gamePromotionRef.current);
    if (promotionRef.current) observer.observe(promotionRef.current);
    if (aboutUsRef.current) observer.observe(aboutUsRef.current);
    return () => {
      if (nowShowingRef.current) observer.unobserve(nowShowingRef.current);
      if (comingSoonRef.current) observer.unobserve(comingSoonRef.current);
      if (gamePromotionRef.current) observer.unobserve(gamePromotionRef.current);
      if (promotionRef.current) observer.unobserve(promotionRef.current);
      if (aboutUsRef.current) observer.unobserve(aboutUsRef.current);
    };
  }, []);

  // 4. Tách phim đang chiếu và sắp chiếu
  const nowShowing = movies.filter((m) => m.status === "Now Showing");
  const comingSoon = movies.filter((m) => m.status === "Coming Soon");
  const movieShowtimes = selectedMovieId
    ? visibleShowtimes.filter((s) => String(s.movieId) === String(selectedMovieId))
    : [];

  // Hàm chuyển đổi dữ liệu sang props cho MovieCard
  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  const mapMovieToCard = (movie) => ({
    tag: movie.status,
    title: movie.title,
    description: movie.content,
    genre: movie.genre,
    duration: movie.runningTime,
    imgSrc: movie.poster,
    slug: normalize(movie.title),
    movieId: movie.movieID, 
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const slideIn = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 1 } },
  };

  // Animation cho từng thẻ phim
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.6,
        type: "spring",
        stiffness: 60,
      },
    }),
  };

  // Khi chọn phim, lấy suất chiếu
  useEffect(() => {
    if (bookingMode !== "movie") return;
    if (!selectedMovieId) {
      setShowtimes([]);
      setCities([]);
      setCinemas([]);
      setDates([]);
      setTimes([]);
      setSelected({ city: "", cinema: "", date: "", time: "" });
      return;
    }
    const movieShowtimes = visibleShowtimes.filter(
      (s) => String(s.movieId) === String(selectedMovieId)
    );

    setShowtimes(movieShowtimes);
    setCities([...new Set(movieShowtimes.map((s) => s.cityName).filter(Boolean))]);
    setSelected({ city: "", cinema: "", date: "", time: "" });
  }, [selectedMovieId, bookingMode, visibleShowtimes]);

  useEffect(() => {
    if (bookingMode !== "showtime") return;
    const filteredShowtimes = selectedMovieId
      ? visibleShowtimes.filter((s) => String(s.movieId) === String(selectedMovieId))
      : visibleShowtimes;
    setShowtimes(filteredShowtimes);
    setCities([...new Set(visibleShowtimes.map(s => s.cityName).filter(Boolean))]);

    // Keep the user's chosen city/cinema even if the newly chosen movie has no
    // matching showtimes in that scope. Only lower-level selections are reset.
    if (!selected.city) {
      setCinemas([]);
      setDates([]);
      setTimes([]);
      return;
    }

    const cinemasForCity = [...new Set(
      filteredShowtimes
        .filter((s) => s.cityName === selected.city)
        .map((s) => s.cinemaName)
        .filter(Boolean)
    )];
    setCinemas(cinemasForCity);

    if (!selected.cinema) {
      setDates([]);
      setTimes([]);
      setSelected(prev => ({ ...prev, date: "", time: "" }));
      return;
    }

    const datesForCinema = [...new Set(
      filteredShowtimes
        .filter((s) => s.cityName === selected.city && s.cinemaName === selected.cinema)
        .map((s) => s.showDate)
        .filter(Boolean)
    )];
    setDates(datesForCinema);

    if (!selected.date) {
      setTimes([]);
      setSelected(prev => ({ ...prev, time: "" }));
      return;
    }

    const timesForDate = [...new Set(
      filteredShowtimes
        .filter(
          (s) =>
            s.cityName === selected.city &&
            s.cinemaName === selected.cinema &&
            s.showDate === selected.date
        )
        .map((s) => s.showTime)
        .filter(Boolean)
    )];
    setTimes(timesForDate);

    if (selected.time && !timesForDate.includes(selected.time)) {
      setSelected(prev => ({ ...prev, time: "" }));
    }
  }, [selectedMovieId, bookingMode, visibleShowtimes]);

  // Khi chọn city
  useEffect(() => {
    if (!selected.city) {
      setCinemas([]);
      setDates([]);
      setTimes([]);
      setSelected(prev => ({ ...prev, cinema: "", date: "", time: "" }));
      return;
    }
    const filtered = showtimes.filter(s => s.cityName === selected.city);
    setCinemas([...new Set(filtered.map(s => s.cinemaName))]);
  }, [selected.city, showtimes]);

  // Khi chọn cinema
  useEffect(() => {
    if (!selected.cinema) {
      setDates([]);
      setTimes([]);
      setSelected(prev => ({ ...prev, date: "", time: "" }));
      return;
    }
    const filtered = showtimes.filter(
      s => s.cityName === selected.city && s.cinemaName === selected.cinema
    );
    setDates([...new Set(filtered.map(s => s.showDate))]);
  }, [selected.cinema, selected.city, showtimes]);

  // Khi chọn date
  useEffect(() => {
    if (!selected.date) {
      setTimes([]);
      setSelected(prev => ({ ...prev, time: "" }));
      return;
    }
    const filtered = showtimes.filter(
      s =>
        s.cityName === selected.city &&
        s.cinemaName === selected.cinema &&
        s.showDate === selected.date
    );
    setTimes([...new Set(filtered.map(s => s.showTime))]);
  }, [selected.date, selected.cinema, selected.city, showtimes]);

  // Xử lý đặt vé ngay
  const handleQuickBooking = () => {
    setBookingError("");
    const normalize = (str) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");

    if (bookingMode === "movie") {
      if (!selectedMovieId || !selected.city || !selected.cinema || !selected.date || !selected.time) {
        setBookingError("Vui lòng chọn đầy đủ thông tin!");
        return;
      }

      const movieObj = movies.find(m => String(m.movieID) === String(selectedMovieId));
      const slug = movieObj ? normalize(movieObj.title) : "";
      const selectedShowtime = showtimes.find(s =>
        s.cityName === selected.city &&
        s.cinemaName === selected.cinema &&
        s.showDate === selected.date &&
        s.showTime === selected.time
      );

      navigate(`/movies/${slug}`, {
        state: {
          quickBooking: {
            movieId: selectedMovieId,
            city: selected.city,
            cinema: selected.cinema,
            date: selected.date,
            time: selected.time,
            showtime: selectedShowtime,
          },
          from: "landing"
        }
      });
      return;
    }

    if (!selectedMovieId) {
      setBookingError("Vui lòng chọn phim!");
      return;
    }

    if (!selected.city || !selected.cinema || !selected.date || !selected.time) {
      setBookingError("Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    const showtimeSource = visibleShowtimes.filter(
      (s) => String(s.movieId) === String(selectedMovieId)
    );

    const selectedShowtime = showtimeSource.find(s =>
      s.cityName === selected.city &&
      s.cinemaName === selected.cinema &&
      s.showDate === selected.date &&
      s.showTime === selected.time
    );

    if (!selectedShowtime) {
      setBookingError("Không tìm thấy suất chiếu phù hợp!");
      return;
    }

    const movieObj = movies.find(m => String(m.movieID) === String(selectedShowtime.movieId));
    const slug = movieObj ? normalize(movieObj.title) : normalize(selectedShowtime.movieTitle || "");

    navigate(`/movies/${slug}`, {
      state: {
        quickBooking: {
          movieId: selectedShowtime.movieId,
          city: selectedShowtime.cityName,
          cinema: selectedShowtime.cinemaName,
          date: selectedShowtime.showDate,
          time: selectedShowtime.showTime,
          showtime: selectedShowtime,
        },
        from: "landing"
      }
    });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.customerID && !checkedBirthdayRef.current) {
      const popupKey = `birthdayPopupShown_${user.customerID}`;
      // Chỉ hiển thị nếu chưa từng hiện popup cho user này trong phiên login này
      if (!localStorage.getItem(popupKey)) {
        getProfileMember(user.customerID).then((profile) => {
          if (profile?.dob) {
            const [year, month, day] = profile.dob.split("-");
            const today = new Date();
            if (
              today.getDate() === Number(day) &&
              today.getMonth() + 1 === Number(month)
            ) {
              setBirthdayName(profile.fullName || "");
              setShowGratitude(true);
              localStorage.setItem(popupKey, "true"); // Đánh dấu đã hiện popup
            }
          }
          checkedBirthdayRef.current = true;
        });
      }
    }
  }, []);

  const topSellerMovie = movies.length
  ? movies.reduce((max, m) => (Number(m.seller || 0) > Number(max.seller || 0) ? m : max), movies[0])
  : null;

  // Khi người dùng chuyển dark mode, lưu vào localStorage
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem('landing_dark_mode', !prev);
      return !prev;
    });
  };

  // Scrollspy: cập nhật activeSection khi scroll
  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector('.HeroSection-root, #hero-section'); // Try both class and id
      const nowShowing = document.getElementById('now-showing');
      const comingSoon = document.getElementById('coming-soon');
      const promotion = document.getElementById('promotion');
      const aboutUs = document.getElementById('about-us');
      const scrollY = window.scrollY + 80; // offset header
      // Get bounding rects
      const heroRect = hero ? hero.getBoundingClientRect() : null;
      const nowShowingRect = nowShowing ? nowShowing.getBoundingClientRect() : null;
      const comingSoonRect = comingSoon ? comingSoon.getBoundingClientRect() : null;
      const promotionRect = promotion ? promotion.getBoundingClientRect() : null;
      const aboutUsRect = aboutUs ? aboutUs.getBoundingClientRect() : null;

      // Helper: check if top of section is above scrollY, and bottom is below
      const isInView = (rect) => rect && rect.top <= 80 && rect.bottom > 80;

      if (heroRect && heroRect.top <= 80 && heroRect.bottom > 80) {
        setActiveSection('hero');
      } else if (nowShowingRect && nowShowingRect.top <= 80 && nowShowingRect.bottom > 80) {
        setActiveSection('now-showing');
      } else if (comingSoonRect && comingSoonRect.top <= 80 && comingSoonRect.bottom > 80) {
        setActiveSection('coming-soon');
      } else if (promotionRect && promotionRect.top <= 80 && promotionRect.bottom > 80) {
        setActiveSection('promotion');
      } else if (aboutUsRect && aboutUsRect.top <= 80 && aboutUsRect.bottom > 80) {
        setActiveSection('about-us');
      } else {
        setActiveSection('now-showing'); // fallback
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  return (
    <div className="relative min-h-screen w-full" style={{ background: isDarkMode ? '#222' : '#d5d5d5' }}>
      {/* Nút chuyển chế độ */}
      <button
        onClick={handleToggleDarkMode}
        className="fixed top-20 right-1 z-50 w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-orange-100 border-gray-600 focus:outline-none"
        aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
        title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
      >
        <CiSun className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-orange-400'}`} />
      </button>
      {/* Parallax Grid Background */}
      <ParallaxBackground isDarkMode={isDarkMode} />
      {/* Parallax 3D Center Video */}
      <ParallaxCenter3D />
      {/* Main content */}
      <div className="relative z-20 bg-transparent pl-8 pr-8 font-mono text-[#0e0e0e] text-base leading-[1.4]">
        {/* Thanh dọc bên trái */}
        <div className="absolute left-8 w-px bg-black opacity-80 z-30 pointer-events-none" style={{top: 0, bottom: 0}} />
        {/* Thanh dọc bên phải */}
        <div className="absolute right-8 w-px bg-black opacity-80 z-30 pointer-events-none" style={{top: 0, bottom: 0}} />
        {showGratitude && (
          <Gratitude fullName={birthdayName} onClose={() => setShowGratitude(false)} />
        )}
        {/* Hero Section */}
        <HeroSection promotionImages={promotionImages} />
        {/* Quick Booking Section */}
        <QuickBooking
          movies={movies}
          showtimes={showtimes}
          allShowtimes={visibleShowtimes}
          movieShowtimes={movieShowtimes}
          bookingMode={bookingMode}
          cities={cities}
          cinemas={cinemas}
          dates={dates}
          times={times}
          selected={selected}
          setSelected={setSelected}
          selectedMovieId={selectedMovieId}
          setSelectedMovieId={setSelectedMovieId}
          bookingError={bookingError}
          setBookingError={setBookingError}
          handleQuickBooking={handleQuickBooking}
        />
        {/* Movie Highlight - Best Seller */}
        {topSellerMovie && (
          <motion.div
            className="relative max-w-6xl mx-auto my-16 flex flex-col md:flex-row items-stretch justify-between bg-transparent gap-6 md:gap-28"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ minHeight: 400 }}
          >
            {/* Poster Card (left) */}
            <div className="w-full md:w-1/2 flex items-center justify-end pr-0 md:pr-6 z-10">
              <div className="bg-white/90 rounded-2xl border-2 border-[#ff7120] shadow-xl p-6 flex flex-col items-center max-w-xs w-full mx-auto md:mx-0 h-[420px] md:h-[480px] min-w-[240px] justify-center">
                <Link to={`/movies/${normalize(topSellerMovie.title)}`} state={{ from: "landing" }}>
                  <img
                    src={topSellerMovie.poster}
                    alt={topSellerMovie.title || 'movie'}
                    className="w-60 h-96 object-cover rounded-xl shadow-lg border-4 border-[#ff7120] hover:shadow-orange-200 hover:scale-105 transition-all duration-300 cursor-pointer"
                    title={`Click để xem chi tiết ${topSellerMovie.title}`}
                  />
                </Link>
                <div className="mt-4 text-base text-[#ff7120] font-semibold">
                  <span>{topSellerMovie.seller ?? 0}</span> lượt mua
                </div>
              </div>
            </div>
            {/* Empty space in the middle for ParallaxCenter3D to show through */}
            <div className="hidden md:block flex-1" />
            {/* Content Card (right) */}
            <div className="w-full md:w-1/2 flex items-center justify-start pl-0 md:pl-6 z-10 mt-8 md:mt-0">
              <div className="bg-white/90 rounded-2xl border-2 border-[#ff7120] shadow-xl p-6 flex flex-col items-center max-w-xs w-full mx-auto md:mx-0 h-[420px] md:h-[480px] min-w-[240px] justify-center">
                <p className="text-sm uppercase tracking-wide mb-1 text-[#ff7120] font-bold">{topSellerMovie.genre}</p>
                <h2 className="text-3xl font-extrabold mt-2 leading-snug mb-2 text-gray-900 text-center">{topSellerMovie.title}</h2>
                <p className="mt-2 mb-4 text-gray-700 line-clamp-5 text-center">{topSellerMovie.content}</p>
                <Link
                  to={`/movies/${normalize(topSellerMovie.title)}`}
                  className="inline-flex items-center"
                >
                  <motion.div
                    className="bg-[#ff7120] hover:bg-orange-600 text-white font-bold px-6 py-3 flex items-center justify-between min-w-[180px] mt-2 rounded-lg shadow-lg transition-all text-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span>Mua vé</span>
                    <FaArrowRight className="ml-3" />
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Promotion Section */}
        <motion.div
          id="game-promotion"
          ref={gamePromotionRef}
          className="relative max-w-5xl mx-auto my-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl shadow-xl overflow-hidden"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-4"
                >
                  <div className="inline-flex items-center justify-center lg:justify-start mb-3">
                    <FaGamepad className="text-3xl text-white mr-2 animate-pulse" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      <ScrambleText text="Chơi Game Hay Nhận Quà Ngay!" triggerKey={decodeGamePromotion} className="inline-block" />
                    </h2>
                  </div>
                  <p className="text-base md:text-lg text-white/90 mb-4 leading-relaxed">
                    Tham gia mini game thú vị và nhận ngay những khuyến mãi hấp dẫn! 
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/game-selection')}
                    className="bg-white text-orange-600 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-base flex items-center justify-center"
                  >
                    
                    Chơi Game Ngay!
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const user = localStorage.getItem('user');
                      if (user) {
                        navigate('/profile', { state: { tab: 'myVoucher' } });
                      } else {
                        navigate('/voucher-home');
                      }
                    }}
                    className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white/10 transition-all duration-300 text-base flex items-center justify-center"
                  >
                    Xem khuyến mãi!
                  </motion.button>
                </motion.div>
              </div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex-1 flex justify-center lg:justify-end"
              >
                <div className="relative">
                  {/* Floating Game Elements */}
                  <motion.div
                    animate={{ 
                      y: [-8, 8, -8],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute -top-3 -left-3 text-3xl"
                  >
                    🎯
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [8, -8, 8],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute -top-2 -right-2 text-2xl"
                  >
                    ⭐
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [-4, 12, -4],
                      rotate: [0, 3, 0]
                    }}
                    transition={{ 
                      duration: 3.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="absolute -bottom-3 -left-2 text-2xl"
                  >
                    🎁
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [12, -4, 12],
                      rotate: [0, -3, 0]
                    }}
                    transition={{ 
                      duration: 2.8, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                    className="absolute -bottom-2 -right-3 text-3xl"
                  >
                    🏆
                  </motion.div>

                  {/* Main Game Icon */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="text-6xl text-center"
                    >
                      🎮
                    </motion.div>
                    <p className="text-white text-center mt-3 font-semibold text-sm">Mini Game</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Now Showing */}
        <div id="now-showing" ref={nowShowingRef} className="max-w-7xl mx-auto p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#ff7120] tracking-tight">
            <ScrambleText text="Phim Đang Chiếu" triggerKey={decodeNowShowing} className="inline-block" />
          </h1>
          <p className="mb-6 text-orange-600">Xem ngay những bộ phim hot nhất đang chiếu tại rạp.</p>
          {loading ? (
            <div>Đang tải...</div>
          ) : nowShowing.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaRegSadTear className="text-5xl text-[#ff7120] mb-3 animate-bounce" />
              <span className="text-xl font-semibold text-orange-700 mb-1">Không có phim đang chiếu</span>
              <span className="text-base text-[#ff7120]">Vui lòng quay lại sau để cập nhật những bộ phim mới nhất!</span>
            </div>
          ) : (
            <>
              <div className="mb-8 w-full relative flex items-center">
                                 {/* Nút trái */}
                 <button
                   className="absolute left-0 z-10 bg-white rounded-full shadow p-2 -ml-6 border border-orange-300 hover:bg-orange-100 disabled:opacity-40"
                   onClick={() => {
                     setNowShowingDirection(-1);
                     setNowShowingStart(s => Math.max(0, s - 1));
                   }}
                   disabled={nowShowingStart === 0}
                   aria-label="Xem phim trước"
                   style={{ top: '50%', transform: 'translateY(-50%)' }}
                 >
                   <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#ff6600" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </button>
                {/* Desktop: 1 hàng 4 card */}
                <div className="hidden md:grid grid-cols-4 gap-8 justify-items-center mx-auto w-full">
                  <AnimatePresence mode="wait" initial={false}>
                    {nowShowing.slice(nowShowingStart, nowShowingStart + 4).map((movie, idx) => (
                      <motion.div
                        key={movie.movieID + "-" + nowShowingStart}
                        variants={cardVariants}
                        initial={{ opacity: 0, x: 0, scale: 1, filter: 'hue-rotate(0deg)' }}
                        animate={{
                          opacity: 1,
                          x: [0, -5, 5, -3, 3, 0],
                          scale: [1, 1.05, 0.98, 1.02, 1],
                          filter: [
                            'hue-rotate(0deg)',
                            'hue-rotate(30deg)',
                            'hue-rotate(-30deg)',
                            'hue-rotate(0deg)'
                          ]
                        }}
                        exit={{
                          opacity: 0,
                          x: [0, 8, -8, 12, -12, 0],
                          scale: [1, 1.08, 0.95, 1.1, 0.9],
                          filter: [
                            'hue-rotate(0deg)',
                            'hue-rotate(-40deg)',
                            'hue-rotate(40deg)',
                            'hue-rotate(0deg)'
                          ]
                        }}
                        transition={{
                          delay: idx * 0.12,
                          duration: 0.5,
                          type: "tween",
                          ease: "easeInOut",
                        }}
                      >
                        <Link
                          to={`/movies/${normalize(movie.title)}`}
                          state={{ from: "landing" }}
                        >
                          <MovieCard {...mapMovieToCard(movie)} />
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {/* Mobile/tablet: giữ grid 1-2 cột như cũ */}
                <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mx-auto w-full">
                  <AnimatePresence mode="wait" initial={false}>
                    {nowShowing.slice(nowShowingStart, nowShowingStart + 4).map((movie, idx) => (
                      <motion.div
                        key={movie.movieID + "-" + nowShowingStart}
                        variants={cardVariants}
                        initial={{ opacity: 0, x: 0, scale: 1, filter: 'hue-rotate(0deg)' }}
                        animate={{
                          opacity: 1,
                          x: [0, -5, 5, -3, 3, 0],
                          scale: [1, 1.05, 0.98, 1.02, 1],
                          filter: [
                            'hue-rotate(0deg)',
                            'hue-rotate(30deg)',
                            'hue-rotate(-30deg)',
                            'hue-rotate(0deg)'
                          ]
                        }}
                        exit={{
                          opacity: 0,
                          x: [0, 8, -8, 12, -12, 0],
                          scale: [1, 1.08, 0.95, 1.1, 0.9],
                          filter: [
                            'hue-rotate(0deg)',
                            'hue-rotate(-40deg)',
                            'hue-rotate(40deg)',
                            'hue-rotate(0deg)'
                          ]
                        }}
                        transition={{
                          delay: idx * 0.12,
                          duration: 0.5,
                          type: "tween",
                          ease: "easeInOut",
                        }}
                      >
                        <Link
                          to={`/movies/${normalize(movie.title)}`}
                          state={{ from: "landing" }}
                        >
                          <MovieCard {...mapMovieToCard(movie)} />
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                                 {/* Nút phải */}
                 <button
                   className="absolute right-0 z-10 bg-white rounded-full shadow p-2 -mr-6 border border-orange-300 hover:bg-orange-100 disabled:opacity-40"
                   onClick={() => {
                     setNowShowingDirection(1);
                     setNowShowingStart(s => Math.min(nowShowing.length - 4, s + 1));
                   }}
                   disabled={nowShowingStart >= nowShowing.length - 4}
                   aria-label="Xem phim tiếp"
                   style={{ top: '50%', transform: 'translateY(-50%)' }}
                 >
                   <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#ff6600" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </button>
              </div>
              <div className="flex justify-center mt-2">
                <Link
                  to="/movies?status=Now%20Showing"
                  className="bg-[#ff7120] hover:bg-orange-600 text-white font-bold text-sm px-6 py-2 rounded-lg shadow transition-all duration-200 tracking-wide"
                  style={{ letterSpacing: 1 }}
                >
                  Xem Tất Cả &rarr;
                </Link>
              </div>
            </>
          )}
        </div>
        {/* Coming Soon */}
        <div id="coming-soon" ref={comingSoonRef} className="max-w-7xl mx-auto p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#ff7120] tracking-tight">
            <ScrambleText text="Phim Sắp Chiếu" triggerKey={decodeComingSoon} className="inline-block" />
          </h1>
          <p className="mb-6 text-orange-600">Xem ngay những bộ phim hot nhất đang chuẩn bị chiếu tại rạp.</p>
          {loading ? (
            <div>Đang tải...</div>
          ) : comingSoon.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaRegSadTear className="text-5xl text-[#ff7120] mb-3 animate-bounce" />
              <span className="text-xl font-semibold text-orange-700 mb-1">Không có phim sắp chiếu</span>
              <span className="text-base text-[#ff7120]">Hãy theo dõi để không bỏ lỡ các siêu phẩm sắp ra mắt!</span>
            </div>
          ) : (
            <>
              <div className="mb-8 w-full relative flex items-center">
                                 {/* Nút trái */}
                 <button
                   className="absolute left-0 z-10 bg-white rounded-full shadow p-2 -ml-6 border border-orange-300 hover:bg-orange-100 disabled:opacity-40"
                   onClick={() => {
                     setComingSoonDirection(-1);
                     setComingSoonStart(s => Math.max(0, s - 1));
                   }}
                   disabled={comingSoonStart === 0}
                   aria-label="Xem phim trước"
                   style={{ top: '50%', transform: 'translateY(-50%)' }}
                 >
                   <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#ff6600" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </button>
                {/* Desktop: 1 hàng 4 card */}
                <div className="hidden md:grid grid-cols-4 gap-8 justify-items-center mx-auto w-full">
                  <AnimatePresence mode="wait" initial={false}>
                    {comingSoon.slice(comingSoonStart, comingSoonStart + 4).map((movie, idx) => (
                      <motion.div
                        key={movie.movieID + "-" + comingSoonStart}
                        variants={cardVariants}
                        initial={{ opacity: 0, x: 0, scale: 1, filter: 'hue-rotate(0deg)' }}
                        animate={{
                          opacity: 1,
                          x: [0, -5, 5, -3, 3, 0],
                          scale: [1, 1.05, 0.98, 1.02, 1],
                          filter: [
                            'hue-rotate(0deg)',
                            'hue-rotate(30deg)',
                            'hue-rotate(-30deg)',
                            'hue-rotate(0deg)'
                          ]
                        }}
                        exit={{
                          opacity: 0,
                          x: [0, 8, -8, 12, -12, 0],
                          scale: [1, 1.08, 0.95, 1.1, 0.9],
                          filter: [
                            'hue-rotate(0deg)',
                            'hue-rotate(-40deg)',
                            'hue-rotate(40deg)',
                            'hue-rotate(0deg)'
                          ]
                        }}
                        transition={{
                          delay: idx * 0.12,
                          duration: 0.5,
                          type: "tween",
                          ease: "easeInOut",
                        }}
                      >
                        <Link
                          to={`/movies/${normalize(movie.title)}`}
                          state={{ from: "landing" }}
                        >
                          <MovieCard {...mapMovieToCard(movie)} />
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {/* Mobile/tablet: giữ grid 1-2 cột như cũ */}
                <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mx-auto w-full">
                  <AnimatePresence mode="wait" initial={false}>
                    {comingSoon.slice(comingSoonStart, comingSoonStart + 4).map((movie, idx) => (
                      <motion.div
                        key={movie.movieID + "-" + comingSoonStart}
                        variants={cardVariants}
                        initial={{ opacity: 0, x: 0, scale: 1, filter: 'hue-rotate(0deg)' }}
                        animate={{
                          opacity: 1,
                          x: [0, -5, 5, -3, 3, 0],
                          scale: [1, 1.05, 0.98, 1.02, 1],
                          filter: [
                            'hue-rotate(0deg)',
                            'hue-rotate(30deg)',
                            'hue-rotate(-30deg)',
                            'hue-rotate(0deg)'
                          ]
                        }}
                        exit={{
                          opacity: 0,
                          x: [0, 8, -8, 12, -12, 0],
                          scale: [1, 1.08, 0.95, 1.1, 0.9],
                          filter: [
                            'hue-rotate(0deg)',
                            'hue-rotate(-40deg)',
                            'hue-rotate(40deg)',
                            'hue-rotate(0deg)'
                          ]
                        }}
                        transition={{
                          delay: idx * 0.12,
                          duration: 0.5,
                          type: "tween",
                          ease: "easeInOut",
                        }}
                      >
                        <Link
                          to={`/movies/${normalize(movie.title)}`}
                          state={{ from: "landing" }}
                        >
                          <MovieCard {...mapMovieToCard(movie)} />
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                                 {/* Nút phải */}
                 <button
                   className="absolute right-0 z-10 bg-white rounded-full shadow p-2 -mr-6 border border-orange-300 hover:bg-orange-100 disabled:opacity-40"
                   onClick={() => {
                     setComingSoonDirection(1);
                     setComingSoonStart(s => Math.min(comingSoon.length - 4, s + 1));
                   }}
                   disabled={comingSoonStart >= comingSoon.length - 4}
                   aria-label="Xem phim tiếp"
                   style={{ top: '50%', transform: 'translateY(-50%)' }}
                 >
                   <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#ff6600" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </button>
              </div>
              <div className="flex justify-center mt-2">
                <Link
                  to="/movies?status=Coming%20Soon"
                  className="bg-[#ff7120] hover:bg-orange-600 text-white font-bold text-sm px-6 py-2 rounded-lg shadow transition-all duration-200 tracking-wide"
                  style={{ letterSpacing: 1 }}
                >
                  Xem Tất Cả &rarr;
                </Link>
              </div>
            </>
          )}
        </div>
        {/* Promotion */}
        <motion.div
          id="promotion"
          ref={promotionRef}
          className="relative max-w-5xl mx-auto my-12 bg-[#ff7120] rounded-2xl shadow-xl overflow-hidden"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${heroImg})` }}></div>
          <div className="relative p-6 md:p-8 text-white z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-4"
                >
                  <div className="inline-flex items-center justify-center lg:justify-start mb-3">
                    <span className="text-3xl mr-2">🎁</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      <ScrambleText text="Khuyến Mãi Hấp Dẫn" triggerKey={decodePromotion} className="inline-block" />
                    </h2>
                  </div>
                  <p className="text-base md:text-lg text-white/90 mb-4 leading-relaxed">
                    Ưu đãi cực hot cho thành viên mới và khách hàng thân thiết! Đừng bỏ lỡ các chương trình khuyến mãi hấp dẫn, tích điểm đổi quà, giảm giá vé, combo bắp nước và nhiều ưu đãi khác dành riêng cho bạn!
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex justify-center lg:justify-start"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const user = localStorage.getItem('user');
                      if (user) {
                        navigate('/profile', { state: { tab: 'myVoucher' } });
                      } else {
                        navigate('/voucher-home');
                      }
                    }}
                    className="bg-white text-[#ff7120] font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-base"
                  >
                    Xem chi tiết khuyến mãi
                  </motion.button>
                </motion.div>
              </div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex-1 flex justify-center lg:justify-end"
              >
                <div className="relative">
                  {/* Floating Promotion Elements */}
                  <motion.div
                    animate={{ 
                      y: [-8, 8, -8],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute -top-3 -left-3 text-3xl"
                  >
                    🎫
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [8, -8, 8],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute -top-2 -right-2 text-2xl"
                  >
                    💰
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [-4, 12, -4],
                      rotate: [0, 3, 0]
                    }}
                    transition={{ 
                      duration: 3.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="absolute -bottom-3 -left-2 text-2xl"
                  >
                    🍿
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [12, -4, 12],
                      rotate: [0, -3, 0]
                    }}
                    transition={{ 
                      duration: 2.8, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                    className="absolute -bottom-2 -right-3 text-3xl"
                  >
                    ⭐
                  </motion.div>

                  {/* Main Promotion Icon */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="text-6xl text-center"
                    >
                      🎁
                    </motion.div>
                    <p className="text-white text-center mt-3 font-semibold text-sm">Khuyến Mãi</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        {/* AboutUs Intro & FAQ reuse */}
        <div id="about-us" ref={aboutUsRef}>
          <AboutUsIntroSection showDetailButton={true} small triggerDecode={decodeAboutUs} />
          <AboutUsFAQSection small />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

