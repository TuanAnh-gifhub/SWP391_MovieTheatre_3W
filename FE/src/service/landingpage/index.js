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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const toDateSafe = (value) => {
        if (!value) return null;
        const parsed = new Date(`${value}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      };

      const normalizedMovies = data.result.map((movie) => {
        if (movie.status === "Now Showing" || movie.status === "Coming Soon") {
          return movie;
        }

        const releaseDate = toDateSafe(movie.releaseDate);
        const fromDate = toDateSafe(movie.fromDate);
        const toDate = toDateSafe(movie.toDate);

        let derivedStatus = "Now Showing";
        if (releaseDate) {
          derivedStatus = releaseDate > today ? "Coming Soon" : "Now Showing";
        } else if (fromDate && today < fromDate) {
          derivedStatus = "Coming Soon";
        } else if (toDate && today > toDate) {
          derivedStatus = "Now Showing";
        }

        return {
          ...movie,
          status: derivedStatus,
        };
      });

      const filteredMovies = normalizedMovies.filter(
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