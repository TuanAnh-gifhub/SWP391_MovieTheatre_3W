import axios from "axios";

export const getRandomCouponForGame = async (customerId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/coupon/random-coupon-for-game/${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting random coupon for game:", error.response || error);
    throw error;
  }
};
