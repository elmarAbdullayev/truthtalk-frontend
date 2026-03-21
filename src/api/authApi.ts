import { apiClient } from "./client";
import type { UserCreate, UserLogin, UserResponse, Token } from "../types";

export const register = async (data: UserCreate) => {
  const response = await apiClient.post<UserResponse>("/auth/register", data);
  return response.data;
};

export const login = async (data: UserLogin) => {
  const response = await apiClient.post<Token>("/auth/login", data);
  return response.data;
};