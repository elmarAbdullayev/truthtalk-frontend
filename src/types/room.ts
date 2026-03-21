export interface RoomCreate {
  title: string;
  topic: string;
  language: string;
  max_participants: number;
  is_public: boolean;
}

export interface ParticipantResponse {
  id: number;
  username: string;
  is_muted: boolean;
}

export interface RoomResponse {
  id: number;
  title: string;
  topic: string;
  language: string;
  max_participants: number;
  is_public: boolean;
  status: string;
  agora_channel_name: string;
  creator_id: number;
  created_at: string;
  participant_count: number;
}

export interface RoomDetailResponse {
  id: number;
  title: string;
  topic: string;
  language: string;
  max_participants: number;
  is_public: boolean;
  status: string;
  agora_channel_name: string;
  creator_id: number;
  created_at: string;
  participants: ParticipantResponse[];
}

export interface AgoraTokenResponse {
  token: string;
  channel_name: string;
  uid: number;
}