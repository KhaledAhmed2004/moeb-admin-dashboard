import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// প্রতিটি request-এ accessToken যোগ করে
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
// 401 পেলে refresh token দিয়ে নতুন access token নেওয়ার চেষ্টা করে।
// Refresh-ও fail করলে সব cookie মুছে login page-এ redirect করে।

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

/** Refresh চলাকালীন আসা অন্য requests-কে queue করে রাখে */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  Cookies.remove("accessToken");
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken");
  Cookies.remove("refreshToken", { path: "/" });
  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = "/auth/login";
  }
};

api.interceptors.response.use(
  // Success: সরাসরি pass-through
  (response) => response,

  // Error handler
  async (error) => {
    const originalRequest = error.config;

    // 401 এবং এটা retry নয় এমন ক্ষেত্রে
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = Cookies.get("refreshToken");

      // Refresh token না থাকলে সরাসরি logout
      if (!refreshToken) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      // অন্য একটা refresh চলছে → queue-এ রাখো
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Refresh শুরু করো
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken: string = data?.data?.accessToken ?? data?.accessToken;

        if (!newAccessToken) throw new Error("No access token in refresh response");

        // নতুন token save করো
        Cookies.set("accessToken", newAccessToken, { expires: 7 });

        // Queued requests-কে নতুন token দাও
        processQueue(null, newAccessToken);

        // Original failed request retry করো
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh-ও failed → logout
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
