import { addFavoriteMovie } from "../../../service/wishlist";
import { toast } from "react-toastify";

export const handleAddFavorite = async (movieId) => {
  const customerId = Number(localStorage.getItem("id"));
  if (!customerId) {
    toast.error("Bạn cần đăng nhập để sử dụng chức năng này!");
    return;
  }
  const res = await addFavoriteMovie({ movieId, customerId });
  if (!res.error) {
    // Luôn thông báo thành công dù phim đã có trong danh sách
    toast.success("Đã thêm vào danh sách yêu thích!");
  } else {
    toast.error(res.message || "Thêm vào danh sách yêu thích thất bại!");
  }
};