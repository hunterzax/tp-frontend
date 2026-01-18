import axios from "axios";
import getCookieValue from "./getCookieValue";

export const axiosInstanceDemo = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DEMO_API,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 600000
});

axiosInstanceDemo.interceptors.request.use((config) => {
  const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const axiosInstance = axios.create({
  // CWE-319 Fix: Changed from HTTP to HTTPS to ensure encrypted transmission
  // If the server doesn't support HTTPS, please configure SSL/TLS on the server
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://10.100.101.15:8010",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 600000
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = getCookieValue("v4r2d9z5m3h0c1p0x7l"); 

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Error retrieving access token
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);