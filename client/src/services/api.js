import axios from "axios";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
|
| Development:
| http://localhost:5000/api
|
| Production:
| VITE_API_URL from Vercel
|
*/

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| AXIOS INSTANCE
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type": "application/json",
  },

  /*
   * REQUIRED:
   * Allows browser credentials/cookies to be
   * sent between the frontend and backend.
   */
  withCredentials: true,

  timeout: 15000,
});

export default api;