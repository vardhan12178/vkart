import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000', // Ensure this matches your server's URL
  withCredentials: true, 
});

export default axiosInstance;
