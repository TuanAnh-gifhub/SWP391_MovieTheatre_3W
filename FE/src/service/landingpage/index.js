// lấy all movie trong landing page
export const getAllMovies = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/movie/view-all-movies`);
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      return { error: true, message: "API không trả về JSON hoặc bị lỗi" };
    }
    const data = await response.json();
    if (data.status === 200 && Array.isArray(data.result)) {
      const filteredMovies = data.result.filter(
        (movie) => movie.status === "Now Showing" || movie.status === "Coming Soon"
      );
      return { error: false, result: filteredMovies };
    } else {
      return { error: true, message: data.message || "Lỗi lấy danh sách phim" };
    }
  } catch (error) {

    return { error: true, message: error.message || "Lỗi kết nối server" };
  }
};

// lấy toàn bộ suất chiếu để hỗ trợ tìm theo rạp/ngày/giờ
// eslint-disable-next-line no-unused-vars
export const getAllShowtimes = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/showtime/view-all-showtime`);
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      return { error: true, message: "API không trả về JSON hoặc bị lỗi" };
    }

    const data = await response.json();
    if (data.status !== 200 || !Array.isArray(data.result)) {
      return { error: true, message: data.message || "Lỗi lấy danh sách suất chiếu" };
    }

    const flatShowtimes = [];
    data.result.forEach((city) => {
      city.cinemas?.forEach((cinema) => {
        cinema.cinemaRooms?.forEach((room) => {
          room.showtimes?.forEach((dateObj) => {
            dateObj.times?.forEach((time) => {
              if (!time.active) return;
              flatShowtimes.push({
                cityName: city.cityName,
                cinemaID: cinema.cinemaID,
                cinemaName: cinema.name,
                cinemaRoomID: room.cinemaRoomID,
                cinemaRoomName: room.roomName,
                showDate: dateObj.date,
                showTime: time.time,
                showtimeID: time.showtimeID,
                movieTitle: time.movieTitle,
                movieId: time.movieId,
                active: time.active,
                toTime: time.toTime,
              });
            });
          });
        });
      });
    });

    return { error: false, result: flatShowtimes };
  } catch (error) {
    return { error: true, message: error.message || "Lỗi kết nối server" };
  }
};

