import axios from "axios";

const api = axios.create({
  baseURL: "https://inventario-app-snowy-xi.vercel.app/api", // Ahora apunta al puerto 4000
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
