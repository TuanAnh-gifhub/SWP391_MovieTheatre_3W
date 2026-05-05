import React from "react";
import { FiLogIn } from "react-icons/fi";
import { MdEventBusy } from "react-icons/md";

const labelClass = "block text-base font-bold text-gray-700 mb-1 tracking-wide";
const selectClass =
  "w-full border-2 border-[#ff7120] rounded-xl px-3 py-2 text-base font-semibold text-gray-800 focus:ring-2 focus:ring-[#ff7120] bg-white hover:bg-orange-50 transition shadow-sm outline-none";

const QuickBooking = ({
  movies,
  showtimes,
  allShowtimes,
  movieShowtimes,
  dates,
  times,
  selected,
  setSelected,
  selectedMovieId,
  setSelectedMovieId,
  bookingMode,
  bookingError,
  setBookingError,
  handleQuickBooking,
}) => {
  const isShowtimeMode = bookingMode === "showtime";
  // Showtimes used for deriving options. Movie mode uses the parent-provided
  // movieShowtimes so dropdowns update as soon as a movie is chosen.
  const filteredShowtimes = isShowtimeMode
    ? (showtimes && showtimes.length > 0 ? showtimes : allShowtimes)
    : (movieShowtimes && movieShowtimes.length > 0 ? movieShowtimes : []);

  const scopedShowtimes = filteredShowtimes.filter((s) => {
    const cityMatch = !selected.city || s.cityName === selected.city;
    const cinemaMatch = !selected.cinema || s.cinemaName === selected.cinema;
    return cityMatch && cinemaMatch;
  });

  // In showtime mode, also filter by selected movie to get correct dates/times
  const showtimesForDatetime = isShowtimeMode && selectedMovieId
    ? scopedShowtimes.filter(s => String(s.movieId) === String(selectedMovieId))
    : scopedShowtimes;

  // Lấy tất cả các rạp duy nhất từ filteredShowtimes (bao gồm cả city)
  const allCinemas = Array.from(
    new Set(filteredShowtimes.map(s => `${s.cinemaName}__${s.cityName}`))
  ).map(item => {
    const [cinemaName, cityName] = item.split("__");
    return { cinemaName, cityName };
  });

  const allCities = Array.from(new Set(filteredShowtimes.map(s => s.cityName))).filter(Boolean);
  // If parent provided dates/times, prefer them; otherwise derive from filteredShowtimes
  const localDates = (dates && dates.length)
    ? dates
    : Array.from(new Set(showtimesForDatetime.map(s => s.showDate))).sort();

  const localTimes = (times && times.length)
    ? times
    : Array.from(new Set(
        // when computing times, respect the current selected city/cinema/date
        showtimesForDatetime
          .filter(s => (selected.date ? s.showDate === selected.date : true))
          .map(s => s.showTime)
      )).sort();

  const selectedMovie = movies.find(movie => String(movie.movieID) === String(selectedMovieId));
  const isComingSoonMovie = selectedMovie?.status === "Coming Soon";

  // Khi chọn rạp, tự động set city tương ứng
  const handleCinemaChange = (e) => {
    const value = e.target.value;
    if (isShowtimeMode) {
      setSelected(prev => ({
        ...prev,
        cinema: value,
        date: "",
        time: ""
      }));
      return;
    }
    const [cinemaName, cityName] = value.split("__");
    setSelected(prev => ({
      ...prev,
      cinema: cinemaName,
      city: cityName,
      date: "",
      time: ""
    }));
  };


  const handlePrimaryChange = (e) => {
    const value = e.target.value;
    if (isShowtimeMode) {
      setSelected(prev => ({
        ...prev,
        city: value,
        cinema: "",
        date: "",
        time: "",
      }));
      return;
    }

    setSelectedMovieId(value);
  };

  const handleShowtimeMovieChange = (e) => {
    setSelectedMovieId(e.target.value);
    setSelected(prev => ({
      ...prev,
      date: "",
      time: "",
    }));
  };

  const primaryLabel = isShowtimeMode ? "Thành phố" : "Phim";
  const primaryPlaceholder = isShowtimeMode ? "Chọn thành phố" : "Chọn phim";
  return (
    <div className="w-full mt-8">
      <form
        className={`w-full grid grid-cols-1 ${isShowtimeMode ? "md:grid-cols-6" : "md:grid-cols-5"} bg-white/90 border-2 border-[#ff7120] rounded-2xl shadow-xl overflow-hidden`}
        onSubmit={e => {
          e.preventDefault();
          handleQuickBooking();
        }}
        style={{ minHeight: 120 }}
      >
        {/* Phim */}
        <div className="p-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#ff7120]">
          <label className={labelClass}>{primaryLabel}</label>
          <select
            className={selectClass}
            value={isShowtimeMode ? selected.city : selectedMovieId}
            onChange={handlePrimaryChange}
          >
            <option value="">{primaryPlaceholder}</option>
            {isShowtimeMode
              ? allCities.map(cityName => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))
              : movies.map(movie => (
                <option key={movie.movieID} value={movie.movieID}>
                  {movie.title}
                </option>
              ))}
          </select>
        </div>
        {/* Rạp */}
        <div className="p-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#ff7120]">
          <label className={labelClass}>Rạp</label>
          <select
            className={selectClass}
            value={isShowtimeMode
              ? selected.cinema
              : selected.cinema && selected.city
                ? `${selected.cinema}__${selected.city}`
                : ""
            }
            onChange={handleCinemaChange}
            disabled={isShowtimeMode ? !selected.city || !allCinemas.length : !allCinemas.length}
          >
            <option value="">Chọn rạp</option>
            {isShowtimeMode
              ? allCinemas
                .filter(({ cityName }) => cityName === selected.city)
                .map(({ cinemaName }) => (
                  <option key={cinemaName} value={cinemaName}>
                    {cinemaName}
                  </option>
                ))
              : allCinemas.map(({ cinemaName, cityName }) => (
                <option key={`${cinemaName}__${cityName}`} value={`${cinemaName}__${cityName}`}>
                  {cinemaName} ({cityName})
                </option>
              ))}
          </select>
        </div>
        {isShowtimeMode && (
          <div className="p-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#ff7120]">
            <label className={labelClass}>Phim</label>
            <select
              className={selectClass}
              value={selectedMovieId}
              onChange={handleShowtimeMovieChange}
              disabled={!selected.cinema}
            >
              <option value="">Chọn phim</option>
              {movies.map(movie => (
                <option key={movie.movieID} value={movie.movieID}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>
        )}
         {/* Ngày */}
         <div className="p-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#ff7120]">
           <label className={labelClass}>Ngày</label>
           <select
             className={selectClass}
             value={selected.date}
             onChange={e => setSelected(prev => ({ ...prev, date: e.target.value, time: "" }))}
             disabled={isShowtimeMode ? !selectedMovieId || !localDates.length : !localDates.length}
           >
             <option value="">Chọn ngày</option>
             {localDates.map(date => (
               <option key={date}>{date}</option>
             ))}
           </select>
         </div>
         {/* Suất */}
         <div className="p-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#ff7120]">
           <label className={labelClass}>Suất</label>
           <select
             className={selectClass}
             value={selected.time}
             onChange={e => setSelected(prev => ({ ...prev, time: e.target.value }))}
             disabled={isComingSoonMovie || !selected.date || !localTimes.length}
           >
            <option value="">Chọn suất</option>
            {localTimes.map(time => (
              <option key={time}>{time}</option>
            ))}
          </select>
        </div>
        {/* Nút đặt vé */}
        <div className="p-4 flex flex-col justify-center">
          <button
            type="submit"
            disabled={isComingSoonMovie}
            className="w-full bg-[#ff7120] hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all duration-300 uppercase tracking-wide text-base border-2 border-[#ff7120]"
          >
            {isComingSoonMovie ? "Sắp chiếu" : "Đặt ngay"}
          </button>
        </div>
      </form>
      {isComingSoonMovie && (
        <div className="text-orange-500 font-bold mt-3 text-center">
          Phim này đang ở trạng thái Coming Soon, chưa thể chọn suất hoặc đặt vé.
        </div>
      )}
      {/* Thông báo lỗi */}
      {bookingError === "Đăng nhập để đặt vé!" ? (
        <div className="flex items-center justify-center gap-2 text-[#ff7120] font-extrabold text-lg mt-5 text-center drop-shadow-lg animate-pulse">
          <FiLogIn size={26} />
          ĐĂNG NHẬP ĐỂ ĐẶT VÉ!
        </div>
      ) : bookingError && (
        <div className="text-red-500 font-bold mt-3">{bookingError}</div>
      )}
      {/* Nếu đã chọn phim mà không có suất chiếu */}
      {isShowtimeMode && selectedMovieId && selected.cinema && showtimesForDatetime.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-[#ff7120] font-extrabold text-lg mt-5 text-center drop-shadow-lg animate-pulse">
          <MdEventBusy size={26} />
          HIỆN CHƯA CÓ LỊCH CHIẾU
        </div>
      )}
    </div>
  );
};

export default QuickBooking;