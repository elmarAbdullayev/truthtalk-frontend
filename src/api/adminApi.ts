import { apiClient } from "./client";
import type { UserAdmin, RoomAdmin, AdminStats } from "../types/admin";

// Statistics
export const getAdminStats = async () => {
  const response = await apiClient.get<AdminStats>("/admin/stats");
  return response.data;
};

// User Management
export const getAllUsers = async () => {
  const response = await apiClient.get<UserAdmin[]>("/admin/users");
  return response.data;
};

export const banUser = async (userId: number) => {
  const response = await apiClient.post(`/admin/users/${userId}/ban`);
  return response.data;
};

export const unbanUser = async (userId: number) => {
  const response = await apiClient.post(`/admin/users/${userId}/unban`);
  return response.data;
};

// Room Management
export const getAllRooms = async () => {
  const response = await apiClient.get<RoomAdmin[]>("/admin/rooms");
  return response.data;
};

export const adminCloseRoom = async (roomId: number) => {
  const response = await apiClient.post(`/admin/rooms/${roomId}/close`);
  return response.data;
};

export const adminKickUser = async (roomId: number, userId: number) => {
  const response = await apiClient.post(`/admin/rooms/${roomId}/kick/${userId}`);
  return response.data;
};