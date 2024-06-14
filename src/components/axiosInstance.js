import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000', // Replace with your backend URL
  withCredentials: true // Send cookies with requests
});

export default instance;
