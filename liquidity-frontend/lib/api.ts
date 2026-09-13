import axios from "axios";

// One shared axios "client". Every request made with this goes to
// "/api/..." which next.config.ts quietly forwards to the real
// backend for us. So we never have to type the backend's address
// anywhere else in this whole app.
const api = axios.create({
  baseURL: "/api",
});

// This runs right before EVERY request goes out. If we saved a
// login token earlier (see lib/auth.ts), we attach it here so the
// backend knows who is asking.
api.interceptors.request.use(function (config) {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("liquidityToken");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
  }
  return config;
});

export default api;
