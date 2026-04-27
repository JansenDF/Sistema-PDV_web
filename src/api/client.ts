import axios from "axios";

const api = "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: api, // sua API FastAPI
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Se você tiver refresh token:
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await client.post(api + "/auth/refresh", {
            refresh_token: refreshToken,
          });
          localStorage.setItem("token", data.access_token);

          // Reenvia a requisição original com novo token
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return client.request(error.config);
        } catch (refreshError) {
          // Refresh falhou → encaminha para login
          window.location.href = "/";
        }
      } else {
        // Sem refresh token → encaminha direto para login
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default client;