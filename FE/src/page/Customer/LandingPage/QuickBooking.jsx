import React from "react";
import { FiLogIn } from "react-icons/fi";
import { MdEventBusy } from "react-icons/md";

const labelClass = "block text-base font-bold text-gray-700 mb-1 tracking-wide";
const selectClass =
  "w-full border-2 border-[#ff7120] rounded-xl px-3 py-2 text-base font-semibold text-gray-800 focus:ring-2 focus:ring-[#ff7120] bg-white hover:bg-orange-50 transition shadow-sm outline-none";

const QuickBooking = ({
  movies,
  showtimes,
  cinemas,
  dates,
  times,
  selected,
  setSelected,
  selectedMovieId,
  setSelectedMovieId,
  bookingError,
  setBookingError,
  handleQuickBooking,
}) => {
  // Lấy tất cả các rạp duy nhất từ showtimes (bao gồm cả city)
  const allCinemas = Array.from(
    new Set(showtimes.map(s => `${s.cinemaName}__${s.cityName}`))
  ).map(item => {
    const [cinemaName, cityName] = item.split("__");
    return { cinemaName, cityName };
  });

  // Khi chọn rạp, tự động set city tương ứng
  const handleCinemaChange = (e) => {
    const value = e.target.value;
    const [cinemaName, cityName] = value.split("__");
    setSelected(prev => ({
      ...prev,
      cinema: cinemaName,
      city: cityName,
      date: "",
      time: ""
    }));
  };

  return (
    <div className="w-full mt-8">
      <form
        className="w-full grid grid-cols-1 md:grid-cols-5 bg-white/90 border-2 border-[#ff7120] rounded-2xl shadow-xl overflow-hidden"
        onSubmit={e => {
          e.preventDefault();
          handleQuickBooking();
        }}
        style={{ minHeight: 120 }}
      >
        {/* Phim */}
        <div className="p-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#ff7120]">
          <label className={labelClass}>Phim</label>
          <select
            className={selectClass}
            value={selectedMovieId}
            onChange={e => setSelectedMovieId(e.target.value)}
          >
            <option value="">Chọn phim</option>
            {movies.map(movie => (
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
            value={
              selected.cinema && selected.city
                ? `${selected.cinema}__${selected.city}`
                : ""
            }
            onChange={handleCinemaChange}
            disabled={!allCinemas.length}
          >
            <option value="">Chọn rạp</option>
            {allCinemas.map(({ cinemaName, cityName }) => (
              <option key={`${cinemaName}__${cityName}`} value={`${cinemaName}__${cityName}`}>
                {cinemaName} ({cityName})
              </option>
            ))}
          </select>
        </div>
        {/* Ngày */}
        <div className="p-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#ff7120]">
          <label className={labelClass}>Ngày</label>
          <select
            className={selectClass}
            value={selected.date}
            onChange={e => setSelected(prev => ({ ...prev, date: e.target.value, time: "" }))}
            disabled={!dates.length}
          >
            <option value="">Chọn ngày</option>
            {dates.map(date => (
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
            disabled={!times.length}
          >
            <option value="">Chọn suất</option>
            {times.map(time => (
              <option key={time}>{time}</option>
            ))}
          </select>
        </div>
        {/* Nút đặt vé */}
        <div className="p-4 flex flex-col justify-center">
          <button
            type="submit"
            className="w-full bg-[#ff7120] hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all duration-300 uppercase tracking-wide text-base border-2 border-[#ff7120]"
          >
            Đặt ngay
          </button>
        </div>
      </form>
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
      {selectedMovieId && showtimes.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-[#ff7120] font-extrabold text-lg mt-5 text-center drop-shadow-lg animate-pulse">
          <MdEventBusy size={26} />
          HIỆN CHƯA CÓ LỊCH CHIẾU
        </div>
      )}
    </div>
  );
};

export default QuickBooking;