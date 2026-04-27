import axios from "axios";

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  // Nếu không cần credentials thì bỏ dòng dưới
  // withCredentials: true,
});
