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