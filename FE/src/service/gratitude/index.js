import axios from "axios";

// Get Profile Member
export const getProfileMember = async (customerID) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/member/get-profile-member?customerID=${customerID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data?.result || null;
  } catch (error) {
    console.error("Error fetching profile:", error.response || error);
    return null;
  }
};