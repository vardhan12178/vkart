import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/"
      : "",
  withCredentials: true,
});

export default axiosInstance;
