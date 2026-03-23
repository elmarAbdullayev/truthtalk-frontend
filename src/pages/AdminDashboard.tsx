import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import {
  getAdminStats,
  getAllUsers,
  getAllRooms,
  banUser,
  unbanUser,
  adminCloseRoom,
} from "../api/adminApi";
import type { UserAdmin, RoomAdmin, AdminStats } from "../types/admin";

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [rooms, setRooms] = useState<RoomAdmin[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "rooms">("stats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, usersData, roomsData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllRooms(),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setRooms(roomsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load admin data");
      if (err.response?.status === 403) {
        setError("You don't have admin access");
        setTimeout(() => navigate("/"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: number) => {
    try {
      await banUser(userId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: number) => {
    try {
      await unbanUser(userId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to unban user");
    }
  };

  const handleCloseRoom = async (roomId: number) => {
    try {
      await adminCloseRoom(roomId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to close room");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-dark-bg hover:bg-gray-800 text-white rounded-lg border border-dark-border transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "stats"
                ? "bg-primary text-white"
                : "bg-dark-card text-gray-400 hover:text-white"
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "users"
                ? "bg-primary text-white"
                : "bg-dark-card text-gray-400 hover:text-white"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "rooms"
                ? "bg-primary text-white"
                : "bg-dark-card text-gray-400 hover:text-white"
            }`}
          >
            Rooms ({rooms.length})
          </button>
        </div>

        {/* Statistics Tab */}
        {activeTab === "stats" && stats && (
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.total_users}
              </div>
              <div className="text-gray-400">Total Users</div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="text-4xl font-bold text-accent mb-2">
                {stats.active_rooms}
              </div>
              <div className="text-gray-400">Active Rooms</div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="text-4xl font-bold text-secondary mb-2">
                {stats.total_rooms}
              </div>
              <div className="text-gray-400">Total Rooms</div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="text-4xl font-bold text-red-500 mb-2">
                {stats.banned_users}
              </div>
              <div className="text-gray-400">Banned Users</div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-dark-bg/50">
                      <td className="px-6 py-4 text-white">{user.id}</td>
                      <td className="px-6 py-4 text-white">
                        {user.username}
                        {user.is_admin && (
                          <span className="ml-2 text-xs text-primary">Admin</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.email}</td>
                      <td className="px-6 py-4">
                        {user.is_banned ? (
                          <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm">
                            Banned
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!user.is_admin && (
                          <button
                            onClick={() =>
                              user.is_banned
                                ? handleUnbanUser(user.id)
                                : handleBanUser(user.id)
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              user.is_banned
                                ? "bg-accent hover:bg-green-600 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                          >
                            {user.is_banned ? "Unban" : "Ban"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === "rooms" && (
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Language
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Participants
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-dark-bg/50">
                      <td className="px-6 py-4 text-white">{room.id}</td>
                      <td className="px-6 py-4 text-white">{room.title}</td>
                      <td className="px-6 py-4 text-gray-400">{room.language}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {room.participant_count}/{room.max_participants}
                      </td>
                      <td className="px-6 py-4">
                        {room.status === "active" ? (
                          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-500/10 text-gray-500 rounded-full text-sm">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {room.status === "active" && (
                          <button
                            onClick={() => handleCloseRoom(room.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Close Room
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;