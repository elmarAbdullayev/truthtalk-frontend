import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchRooms, createRoom } from "../store/slices/roomSlice";
import { logout, initializeAuth } from "../store/slices/authSlice";
import type { RoomCreate } from "../types";

function RoomList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { rooms, loading, error } = useAppSelector((state) => state.room);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<RoomCreate>({
    title: "",
    topic: "",
    language: "English",
    max_participants: 10,
    is_public: true,
  });

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // ✅ Auto-refresh room list every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    dispatch(fetchRooms());
  }, 5000); // 5 seconds

  return () => clearInterval(interval);
}, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value) : value,
    });
  };

const handleCreateRoom = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const result = await dispatch(createRoom(formData)).unwrap();
    console.log("Room created:", result); // ← Debug log
    
    setShowCreateModal(false);
    setFormData({
      title: "",
      topic: "",
      language: "English",
      max_participants: 10,
      is_public: true,
    });
    
    // Navigate to room
    navigate(`/room/${result.id}`);
  } catch (err) {
    console.error("Failed to create room:", err);
    alert("Failed to create room: " + err); // ← Show error
  }
};

const handleJoinRoom = (roomId: number) => {


  if (!isAuthenticated) {
    navigate("/login");
    return;
  }
  console.log(roomId)
  navigate(`/room/${roomId}`);
};

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TruthTalk
          </h1>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  Create Room
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-dark-bg hover:bg-gray-800 text-gray-300 font-medium rounded-lg border border-dark-border transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 bg-dark-bg hover:bg-gray-800 text-gray-300 font-medium rounded-lg border border-dark-border transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Active Rooms</h2>
          <p className="text-gray-400">
            {isAuthenticated
              ? "Join a room to start discussing"
              : "Login to join discussions"}
          </p>
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-12">Loading rooms...</div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 mb-4">
            {error}
          </div>
        )}

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {room.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">{room.topic}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {room.language}
                  </span>
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">
                    {room.participant_count}/{room.max_participants} 👥
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleJoinRoom(room.id)}
                disabled={!isAuthenticated && room.participant_count >= room.max_participants}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  isAuthenticated
                    ? "bg-primary hover:bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isAuthenticated ? "Join Room" : "Login to Join"}
              </button>
            </div>
          ))}
        </div>

        {rooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No active rooms</p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Create First Room
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create Room</h2>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Room Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., Is Islam the Truth?"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Topic/Description
                </label>
                <textarea
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Describe the discussion topic..."
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Language
                </label>
                <select
                  title="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="English">English</option>
                  <option value="German">Deutsch</option>
                  <option value="Turkish">Türkçe</option>
                  <option value="Arabic">العربية</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Max Participants
                </label>
                <input
                  title="number"
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  min={2}
                  max={50}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-dark-bg hover:bg-gray-800 text-gray-300 font-medium rounded-lg border border-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomList;