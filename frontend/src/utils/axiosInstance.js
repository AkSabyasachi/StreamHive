import axios from "axios";

const baseURL = import.meta.env.DEV 
  ? "/api/v1" 
  : import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL, // All API routes are prefixed with this
  withCredentials: true, // Includes cookies in requests
});

//* Token refresh logic
axiosInstance.interceptors.response.use(
  (response) => response, // Just return the response if it's fine
  async (error) => {
    const originalRequest = error.config;

    //* If access token expired and this is the first retry attempt
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        //* Refresh access token
        await axiosInstance.post("/users/refresh-token");

        //* Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        //* Refresh token failed — log out or handle error
        console.error("❌ Refresh token failed. Logging out user.");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
