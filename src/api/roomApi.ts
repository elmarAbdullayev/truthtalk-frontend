import { apiClient } from "./client";

import type { 
  RoomCreate, 
  RoomResponse, 
  RoomDetailResponse,
  AgoraTokenResponse 
} from "../types";

export const getRooms = async () => {
  const response = await apiClient.get<RoomResponse[]>("/rooms/");
  return response.data;
};

export const getRoomDetail = async (roomId: number) => {
  const response = await apiClient.get<RoomDetailResponse>(`/rooms/${roomId}`);
  return response.data;
};

export const createRoom = async (data: RoomCreate) => {
  const response = await apiClient.post<RoomResponse>("/rooms/", data);
  return response.data;
};

export const joinRoom = async (roomId: number) => {
  const response = await apiClient.post(`/rooms/${roomId}/join`);
  return response.data;
};

export const leaveRoom = async (roomId: number) => {
  const response = await apiClient.post(`/rooms/${roomId}/leave`);
  return response.data;
};

export const closeRoom = async (roomId: number) => {
  const response = await apiClient.post(`/rooms/${roomId}/close`);
  return response.data;
};

export const kickUser = async (roomId: number, userId: number) => {
  const response = await apiClient.post(`/rooms/${roomId}/kick/${userId}`);
  return response.data;
};

export const muteUser = async (roomId: number, userId: number) => {
  const response = await apiClient.post(`/rooms/${roomId}/mute/${userId}`);
  return response.data;
};

export const getAgoraToken = async (roomId: number) => {
  const response = await apiClient.get<AgoraTokenResponse>(`/rooms/${roomId}/token`);
  return response.data;
};