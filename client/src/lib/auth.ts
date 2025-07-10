import { apiRequest } from "./queryClient";
import { LoginData, ResetPasswordData } from "@shared/schema";

export const authApi = {
  login: async (data: LoginData) => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  signup: async (data: { username: string; password: string }) => {
    const response = await apiRequest("POST", "/api/auth/signup", data);
    return response.json();
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await apiRequest("POST", "/api/auth/reset-password", data);
    return response.json();
  },
};

export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("auth_token");
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
