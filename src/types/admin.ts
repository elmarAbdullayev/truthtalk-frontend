export interface UserAdmin {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

export interface RoomAdmin {
  id: number;
  title: string;
  topic: string;
  language: string;
  max_participants: number;
  is_public: boolean;
  status: string;
  creator_id: number;
  created_at: string;
  participant_count: number;
}

export interface AdminStats {
  total_users: number;
  total_rooms: number;
  active_rooms: number;
  banned_users: number;
}