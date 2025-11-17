import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: Change this based on your environment
// For Expo Go on Android Emulator: use your computer's IP
// For Expo Go on iOS Simulator: use your computer's IP
// For Expo Go on Physical Device: use your computer's IP on same network

const API_URL = "http://192.168.1.44:8000"; // 👈 CHANGE THIS TO YOUR COMPUTER'S IP

// To find your IP:
// Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
// Windows: ipconfig | findstr IPv4

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add auth token to requests
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => client.post("/auth/login", { email, password }),

  register: (email, password, name) =>
    client.post("/auth/register", { email, password, name }),

  getMe: () => client.get("/auth/me"),
};

// Articles API
export const articlesAPI = {
  getAll: (skip = 0, limit = 50, collectionId = null) => {
    let url = `/articles?skip=${skip}&limit=${limit}`;
    if (collectionId) url += `&collection_id=${collectionId}`;
    return client.get(url);
  },

  getOne: (id) => client.get(`/articles/${id}`),

  update: (id, data) => client.patch(`/articles/${id}`, data),

  delete: (id) => client.delete(`/articles/${id}`),
};

// Collections API
export const collectionsAPI = {
  getAll: () => client.get("/collections"),

  create: (name, description) =>
    client.post("/collections", { name, description }),
};

export { API_URL };
export default client;
