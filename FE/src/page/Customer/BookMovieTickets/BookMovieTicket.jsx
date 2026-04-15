import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm dòng này
import { getShowtimesByMovie } from "../../../service/bookmovieticket";
import BookSeat from "./BookSeat";
import ConfirmBooking from "./ConfirmBooking";
import { FiLogIn } from "react-icons/fi";
import { MdEventBusy } from "react-icons/md";
import Snackbar from "./Snackbar"; // Import Snackbar

const BookMovieTicket = ({ movieId, movieTitle, poster, quickBooking, bookingInfo, setBookingInfo, onShowtimeChange, selectedFoods, setSelectedFoods }) => {
  const [showtimes, setShowtimes] = useState([]);
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [selected, setSelected] = useState({
    city: "",
    cinema: "",
    room: "",
    date: "",
    time: "",
    showtime: null,
  });
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState(1);
  const [confirmInfo, setConfirmInfo] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [error, setError] = useState("");
  const [showRoomDropdown, setShowRoomDropdown] = useState(true);
  const [selectedDate, setSelectedDate] = useState(""); // Thêm state này
  const navigate = useNavigate(); // Thêm dòng này

  // Lấy dữ liệu suất chiếu và flatten
  useEffect(() => {
    const fetchShowtimes = async () => {
      setLoading(true);
      try {
        const res = await getShowtimesByMovie(movieId);
        const result = res.data.result;
        let flatShowtimes = [];
        if (result && result.dates) {
          result.dates.forEach(dateObj => {
            const showDate = dateObj.date;
            dateObj.cities.forEach(city => {
              const cityName = city.name;
              city.cinemas.forEach(cinema => {
                const cinemaName = cinema.name;
                cinema.cinemaRooms.forEach(room => {
                  const cinemaRoomName = room.roomName;
                  const cinemaRoomId = room.cinemaRoomID || room.cinemaRoomId;
                  // Lọc chỉ times active
                  room.times
                    .filter(time => time.active)
                    .forEach(time => {
                      flatShowtimes.push({
                        cityName,
                        cinemaName,
                        cinemaRoomName,
                        cinemaRoomId,
                        showDate,
                        showTime: time.time,
                        seats: time.seats,
                      });
                    });
                });
              });
            });
          });
        }
        setShowtimes(flatShowtimes);
        setCities([...new Set(flatShowtimes.map((s) => s.cityName))]);
      } catch {
        setError("Đăng nhập để đặt vé.");
      }
      setLoading(false);
    };
    fetchShowtimes();
  }, [movieId]);

  // Dropdown logic
  useEffect(() => {
    if (!selected.city) {
      setCinemas([]);
      setSelected(prev => ({ ...prev, cinema: "", date: "", time: "", room: "", showtime: null }));
      return;
    }
    const filtered = showtimes.filter(s => s.cityName === selected.city);
    setCinemas([...new Set(filtered.map(s => s.cinemaName))]);
    // Không reset cinema nếu đã chọn
  }, [selected.city, showtimes]);

  // Khi chọn rạp, chỉ reset ngày, giờ, phòng, showtime
  useEffect(() => {
    if (!selected.cinema) {
      setDates([]);
      setSelected(prev => ({ ...prev, date: "", time: "", room: "", showtime: null }));
      return;
    }
    const filtered = showtimes.filter(
      s => s.cityName === selected.city && s.cinemaName === selected.cinema
    );
    setDates([...new Set(filtered.map(s => s.showDate))]);
    // Không reset cinema ở đây nữa
  }, [selected.cinema, selected.city, showtimes]);

  // Khi chọn ngày, chỉ reset giờ, phòng, showtime
  useEffect(() => {
    if (!selected.date) {
      setTimes([]);
      setSelected(prev => ({ ...prev, time: "", room: "", showtime: null }));
      return;
    }
    const filtered = showtimes.filter(
      s =>
        s.cityName === selected.city &&
        s.cinemaName === selected.cinema &&
        s.showDate === selected.date
    );
    setTimes([...new Set(filtered.map(s => s.showTime))]);
    // Không reset date ở đây nữa
  }, [selected.date, selected.cinema, selected.city, showtimes]);

  // Khi chọn giờ, chỉ reset phòng, showtime
  useEffect(() => {
    if (!selected.time) {
      setShowRoomDropdown(true);
      setRooms([]);
      setSelected(prev => ({ ...prev, room: "", showtime: null }));
      return;
    }
    const filtered = showtimes.filter(
      s =>
        s.cityName === selected.city &&
        s.cinemaName === selected.cinema &&
        s.showDate === selected.date &&
        s.showTime === selected.time
    );
    const uniqueRooms = [...new Set(filtered.map(s => s.cinemaRoomName))];
    setRooms(uniqueRooms);

    if (uniqueRooms.length === 1) {
      setShowRoomDropdown(false);
      setSelected(prev => ({
        ...prev,
        room: uniqueRooms[0],
        showtime: filtered.find(s => s.cinemaRoomName === uniqueRooms[0]),
      }));
      setAvailableSeats(filtered[0]?.seats || []);
      setSelectedSeats([]);
    } else {
      setShowRoomDropdown(true);
      setSelected(prev => ({ ...prev, room: "", showtime: null }));
      setAvailableSeats([]);
      setSelectedSeats([]);
    }
  }, [selected.time, selected.date, selected.cinema, selected.city, showtimes]);

  useEffect(() => {
    if (!showRoomDropdown || !selected.room) return;
    const showtime = showtimes.find(
      s =>
        s.cityName === selected.city &&
        s.cinemaName === selected.cinema &&
        s.showDate === selected.date &&
        s.showTime === selected.time &&
        s.cinemaRoomName === selected.room
    );
    setSelected(prev => ({ ...prev, showtime }));
    setAvailableSeats(showtime ? showtime.seats : []);
    setSelectedSeats([]);
  }, [selected.room, showRoomDropdown, selected.city, selected.cinema, selected.date, selected.time, showtimes]);

  // Chọn ghế
  const handleSelectSeat = seat => {
    if (seat.status === "sold" || seat.isAvailable === false) return;
    setSelectedSeats(prev =>
      prev.some(s => s.seatID === seat.seatID)
        ? prev.filter(s => s.seatID !== seat.seatID)
        : [...prev, seat]
    );
    setError("");
  };

  // Khi có quickBooking, tự động set các dropdown
  useEffect(() => {
    if (
      quickBooking &&
      quickBooking.city &&
      quickBooking.cinema &&
      quickBooking.date &&
      quickBooking.time
    ) {
      setSelected(prev => ({
        ...prev,
        city: quickBooking.city,
        cinema: quickBooking.cinema,
        date: quickBooking.date,
        time: quickBooking.time,
      }));
      setSelectedDate(quickBooking.date); // Nếu bạn dùng selectedDate cho UI ngày
      
      // Nếu có showtime từ quickBooking, sử dụng nó
      if (quickBooking.showtime) {
        setSelected(prev => ({
          ...prev,
          showtime: quickBooking.showtime,
          room: quickBooking.showtime.cinemaRoomName,
        }));
        setAvailableSeats(quickBooking.showtime.seats || []);
        setSelectedSeats([]);
      }
    }
  }, [quickBooking, showtimes]);

  // Cập nhật thông tin booking khi chọn thành phố, rạp, ngày, giờ
  useEffect(() => {
    setBookingInfo(prev => ({
      ...prev,
      movieTitle,
      cityName: selected.city,
      cinemaName: selected.cinema,
      date: selected.date,
      time: selected.time,
    }));
  }, [selected.city, selected.cinema, selected.date, selected.time, movieTitle, setBookingInfo]);

  // Cập nhật khi chọn ghế
  useEffect(() => {
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 75000), 0);
    setBookingInfo(prev => ({
      ...prev,
      selectedSeats,
      totalPrice,
    }));
  }, [selectedSeats, setBookingInfo]);

  // Đồng bộ selectedFoods vào bookingInfo
  useEffect(() => {
    setBookingInfo(prev => ({
      ...prev,
      selectedFoods,
    }));
  }, [selectedFoods, setBookingInfo]);

  // Cập nhật khi showtime thay đổi
  useEffect(() => {
    if (onShowtimeChange && selected.showtime) {
      onShowtimeChange(selected.showtime);
    }
  }, [selected.showtime, onShowtimeChange]);

  // UI
  if (loading) return <div className="text-center py-4 text-orange-500 font-semibold">Đang tải...</div>;

  if (error === "Đăng nhập để đặt vé.") {
    return (
      <div className="flex items-center justify-center gap-2 text-orange-500 font-extrabold text-xl text-center drop-shadow-lg animate-pulse">
        <FiLogIn size={38} />
        <span className="drop-shadow">ĐĂNG NHẬP ĐỂ ĐẶT VÉ</span>
      </div>
    );
  }
  if (error === "Vui lòng đăng nhập để đặt vé!") {
    return (
      <div className="flex items-center justify-center gap-2 text-orange-500 font-extrabold text-xl text-center drop-shadow-lg animate-pulse">
        <FiLogIn size={38} />
        <span className="drop-shadow">VUI LÒNG ĐĂNG NHẬP ĐỂ ĐẶT VÉ!</span>
      </div>
    );
  } else if (error) {
    return <div className="text-orange-500 text-center mt-2 font-semibold">{error}</div>;
  }

  // THÊM ĐOẠN NÀY để xử lý trường hợp không có suất chiếu
  if (step === 1 && showtimes.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 text-orange-500 font-extrabold text-xl text-center drop-shadow-lg animate-pulse">
        <MdEventBusy size={38} />
        <span className="drop-shadow">HIỆN CHƯA CÓ LỊCH CHIẾU</span>
      </div>
    );
  }

  if (step === 1)
    return (
      <div className="flex justify-center items-center bg-transparent py-6" style={{ fontSize: "80%" }}>
        <div className="w-full">
          <h2 className="font-bold text-2xl mb-3 text-orange-500 text-center tracking-wide drop-shadow-lg uppercase">LỊCH CHIẾU</h2>
          {/* Thành phố */}
          <div className="mb-4 flex justify-center items-center gap-2">
            <select
              className="px-3 py-1.5 rounded-lg border border-orange-400 focus:border-orange-600 focus:outline-none min-w-[110px] text-gray-900 font-bold bg-white shadow transition text-sm"
              value={selected.city}
              onChange={e => {
                setSelected(prev => ({ ...prev, city: e.target.value, cinema: "", date: "", time: "", room: "", showtime: null }));
                setSelectedDate("");
              }}
            >
              <option value="">-- Chọn thành phố --</option>
              {cities.map(city => (
                <option key={city} className="text-sm">{city}</option>
              ))}
            </select>
          </div>

          {/* Chọn ngày */}
          {selected.city && (() => {
            const showtimesOfCity = showtimes.filter(s => s.cityName === selected.city);
            const allDates = [...new Set(showtimesOfCity.map(s => s.showDate))];
            if (allDates.length === 0) return null;
            return (
              <div className="mb-4 flex gap-2 justify-center">
                {allDates.map(date => (
                  <button
                    key={date}
                    className={`px-4 py-1.5 rounded-lg font-bold border shadow transition-all duration-200 text-sm
                      ${selectedDate === date
                        ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white border-orange-600 scale-105"
                        : "bg-white text-orange-700 border-orange-400 hover:bg-orange-50 hover:scale-105"}`}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelected(prev => ({ ...prev, date, cinema: "", time: "", room: "", showtime: null }));
                    }}
                  >
                    {date}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Danh sách rạp, giờ */}
          {selected.city && selectedDate && (
            <div>
              <h3 className="font-bold text-sm mb-2 text-orange-700 text-center tracking-wide uppercase">
                DANH SÁCH RẠP
              </h3>
              {cinemas.length === 0 && (
                <div className="text-gray-400 italic text-center">Không có rạp nào trong thành phố này.</div>
              )}
              {cinemas.map(cinemaName => {
                const showtimesOfCinema = showtimes.filter(
                  s => s.cityName === selected.city && s.cinemaName === cinemaName && s.showDate === selectedDate
                );
                if (showtimesOfCinema.length === 0) return null;
                const timesOfDate = [...new Set(showtimesOfCinema.map(s => s.showTime))];
                return (
                  <div key={cinemaName} className="mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-3 shadow-inner border border-gray-200">
                    <div className="font-bold text-sm text-orange-700 mb-1 text-center uppercase tracking-wide">{cinemaName}</div>
                    {timesOfDate.length === 0 ? (
                      <div className="text-gray-400 italic text-center">Hiện chưa có lịch chiếu</div>
                    ) : (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {timesOfDate.map(time => {
                          const showtimeObj = showtimesOfCinema.find(s => s.showTime === time);
                          const isSelected = selected.time === time && selected.cinema === cinemaName;
                          return (
                            <button
                              key={time}
                              className={`px-4 py-1.5 rounded-lg font-bold border shadow transition-all duration-200 text-sm
                                ${isSelected
                                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white border-orange-600 scale-105"
                                  : "bg-white text-orange-700 border-orange-400 hover:bg-orange-50 hover:scale-105"}`}
                              onClick={() => {
                                setSelected(prev => ({
                                  ...prev,
                                  city: prev.city,
                                  cinema: cinemaName,
                                  date: selectedDate,
                                  time,
                                  room: showtimeObj.cinemaRoomName,
                                  showtime: showtimeObj,
                                }));
                                setAvailableSeats(showtimeObj.seats || []);
                                setSelectedSeats([]);
                              }}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Hiển thị chọn ghế nếu đã chọn đủ thành phố, ngày, rạp, giờ */}
          {selected.city && selected.cinema && selected.date && selected.time && selected.showtime && (
            <div className="mt-6 transition-all duration-500">
              <BookSeat
                movie={movieTitle}
                availableSeats={availableSeats}
                selectedSeats={selectedSeats}
                handleSelectSeat={handleSelectSeat}
                handleBack={() => {}}
                setBookingInfo={setBookingInfo}
                bookingInfo={bookingInfo}
                selectedFoods={selectedFoods}
                setSelectedFoods={setSelectedFoods}
              />
            </div>
          )}
        </div>
      </div>
    );

  // Bước 2: Chọn ghế
  if (step === 2)
    return (
      <BookSeat
        movie={movieTitle}
        availableSeats={availableSeats}
        selectedSeats={selectedSeats}
        handleSelectSeat={handleSelectSeat}
        handleBack={() => setStep(1)}
        selectedFoods={selectedFoods}
        setSelectedFoods={setSelectedFoods}
      />
    );

  if (step === 3)
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-4 drop-shadow-lg">Đặt vé thành công!</h2>
        <pre className="bg-gray-100 rounded p-4 text-left inline-block text-gray-800">{JSON.stringify(successInfo, null, 2)}</pre>
      </div>
    );

  return (
    <>
      {/* ...UI các bước chọn... */}
      {/* Chỉ hiển thị Snackbar khi đã chọn giờ và có đủ thông tin */}
      {selected.time && (
        <Snackbar
          movieId={movieId}
          movieTitle={bookingInfo.movieTitle}
          cinemaName={bookingInfo.cinemaName}
          cityName={bookingInfo.cityName}
          selectedSeats={bookingInfo.selectedSeats}
          totalPrice={bookingInfo.totalPrice}
          date={bookingInfo.date}
          time={bookingInfo.time}
          showtime={selected.showtime}
          onError={setError}
          disabled={
            !bookingInfo.cityName ||
            !bookingInfo.cinemaName ||
            !bookingInfo.date ||
            !bookingInfo.time ||
            bookingInfo.selectedSeats.length === 0
          }
          selectedFoods={selectedFoods}
        />
      )}
    </>
  );
};

export default BookMovieTicket;