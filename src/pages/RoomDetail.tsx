import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { getRoomDetail, joinRoom, leaveRoom, getAgoraToken, kickUser, muteUser } from "../api/roomApi";
import type { RoomDetailResponse } from "../types";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [room, setRoom] = useState<RoomDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<any>(null);

  useEffect(() => {
  if (!id) {
    console.error("No room ID in URL");
    navigate("/");
    return;
  }

  // ✅ CHANGE: Don't redirect immediately if not authenticated
  // Load room data first (guest can see room exists)
  console.log("Loading room:", id);
  loadRoomData();

  return () => {
    const client = clientRef.current;
    if (client) {
      const audioTrack = localAudioTrackRef.current;
      if (audioTrack) audioTrack.close();
      client.leave().catch(console.error);
      clientRef.current = null;
    }
  };
}, [id, navigate]);  // ✅ Remove isAuthenticated from deps

// ✅ ADD: Separate auth check AFTER room loads
useEffect(() => {
  if (room && !isAuthenticated) {
    // Show "Login to Join" message instead of auto-redirect
    console.log("Room loaded, but user not authenticated");
  }
}, [room, isAuthenticated]);

// ✅ AUTO-JOIN - Prevent double join
useEffect(() => {
  if (room && !isInRoom && isAuthenticated && !clientRef.current && !isJoining) {
    // ✅ Check if room is full
    if (room.participants.length >= room.max_participants) {
      const token = localStorage.getItem("token");
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const currentUserId = payload ? parseInt(payload.sub) : null;
      
      // Check if current user is already in room
      const isAlreadyIn = room.participants.some(p => p.id === currentUserId);
      
      if (!isAlreadyIn) {
        setError("This room is full");
        setTimeout(() => navigate("/"), 3000);
        return;
      }
    }
    
    console.log("Auto-joining voice chat...");
    handleJoinRoom();
  }
}, [room, isInRoom, isAuthenticated, isJoining, navigate]);

// ✅ REPLACE existing auto-refresh useEffect with this:
useEffect(() => {
  if (!isInRoom || !room) return;

  const interval = setInterval(async () => {
    // ✅ Silent refresh - no loading state
    if (!id) return;
    
    try {
      const data = await getRoomDetail(Number(id));
      
      // Check if kicked
      const token = localStorage.getItem("token");
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const currentUserId = payload ? parseInt(payload.sub) : null;
      const isStillInRoom = data.participants.some(p => p.id === currentUserId);
      
      if (isInRoom && !isStillInRoom) {
        console.log("❌ You were kicked!");
        setError("You were removed from this room");
        
        const client = clientRef.current;
        if (client) {
          const audioTrack = localAudioTrackRef.current;
          if (audioTrack) audioTrack.close();
          await client.leave();
          clientRef.current = null;
        }
        
        setTimeout(() => navigate("/"), 2000);
        return;
      }
      
      // ✅ Only update room state (no setLoading!)
      setRoom(data);
      
    } catch (err) {
      console.error("Silent refresh error:", err);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [isInRoom, room?.id, id, navigate]);

  const loadRoomData = async () => {
  if (!id) return;
  
  try {
    console.log("Fetching room detail for ID:", id);
    const data = await getRoomDetail(Number(id));
    console.log("Room data loaded:", data);
    console.log(data.participants)
    
    // ✅ Check if current user is still in participants
    const token = localStorage.getItem("token");
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const currentUserId = payload ? parseInt(payload.sub) : null;
    
    const isStillInRoom = data.participants.some(p => p.id === currentUserId);
    
    if (isInRoom && !isStillInRoom) {
      // ✅ User was kicked!
      console.log("❌ You were kicked from the room!");
      setError("You were removed from this room");
      
      // Leave Agora
      const client = clientRef.current;
      if (client) {
        const audioTrack = localAudioTrackRef.current;
        if (audioTrack) {
          audioTrack.close();
        }
        await client.leave();
        clientRef.current = null;
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
      return;
    }
    
    setRoom(data);
    setLoading(false);
  } catch (err) {
    console.error("Load room error:", err);
    setError("Failed to load room");
    setLoading(false);
  }
};



  const handleJoinRoom = async () => {
  if (isJoining) {
    console.log("Already joining, skipping...");
    return;
  }

  try {
    setIsJoining(true);
    setError(null);
    
    const token = localStorage.getItem("token");
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const currentUserId = payload ? parseInt(payload.sub) : null;

    // Check if user is ACTUALLY in participants
    const isAlreadyParticipant = room?.participants.some(p => p.id === currentUserId);

    // Join backend if NOT already a participant
    if (!isAlreadyParticipant) {
      console.log("Step 1: Joining room in backend...");
      await joinRoom(Number(id));
      
      // ✅ Refresh immediately after backend join
      await loadRoomData();
      console.log("✅ Refreshed participants after join");
    } else {
      console.log("Already a participant in backend");
    }

    console.log("Step 2: Getting Agora token...");
    const tokenData = await getAgoraToken(Number(id));
    console.log("Token received:", tokenData);

    console.log("Step 3: Creating Agora client...");
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    console.log("Step 4: Joining Agora channel...");
    await client.join(
      import.meta.env.VITE_AGORA_APP_ID,
      tokenData.channel_name,
      tokenData.token,
      tokenData.uid
    );

    console.log("✅ Successfully joined Agora channel!");

    client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      console.log("🔊 User published:", user.uid, mediaType);
      await client.subscribe(user, mediaType);
      if (mediaType === "audio") {
        user.audioTrack?.play();
        console.log("▶️ Playing audio from user:", user.uid);
      }
    });

    client.on("user-unpublished", (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      console.log("🔇 User unpublished:", user.uid, mediaType);
    });

    setIsInRoom(true);
    console.log("✅ Voice chat ready!");

  }  catch (err: any) {
    console.error("❌ Join error:", err);
    
    // ✅ Better error messages
    let errorMessage = "Failed to join room";
    
    if (err.response?.data?.detail) {
      errorMessage = err.response.data.detail;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    
    // ✅ If room is full, redirect after 3 seconds
    if (errorMessage.includes("full") || errorMessage.includes("Full")) {
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  } finally {
    setIsJoining(false);
  }
};


  const handleToggleMic = async () => {
    try {
      const client = clientRef.current;
      if (!client) {
        console.error("No Agora client!");
        return;
      }

      if (!isMicOn) {
        console.log("Turning mic ON...");
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish(audioTrack);
        localAudioTrackRef.current = audioTrack;
        setIsMicOn(true);
        console.log("✅ Mic is ON");
      } else {
        console.log("Turning mic OFF...");
        const audioTrack = localAudioTrackRef.current;
        if (audioTrack) {
          await client.unpublish(audioTrack);
          audioTrack.close();
          localAudioTrackRef.current = null;
        }
        setIsMicOn(false);
        console.log("✅ Mic is OFF");
      }
    } catch (err) {
      console.error("Toggle mic error:", err);
      setError("Failed to toggle microphone");
    }
  };
  
  const handleLeaveRoom = async () => {
    try {
      const client = clientRef.current;
      if (client) {
        const audioTrack = localAudioTrackRef.current;
        if (audioTrack) {
          audioTrack.close();
        }
        await client.leave();
        clientRef.current = null;
      }

      try {
        await leaveRoom(Number(id));
        console.log("Left room in backend");
      } catch (err) {
        console.error("Leave room error:", err);
      }

      navigate("/");
    } catch (err) {
      console.error("Leave error:", err);
      navigate("/");
    }
  };

  const handleKick = async (userId: number) => {
    try {
      await kickUser(Number(id), userId);
      loadRoomData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to kick user");
    }
  };

  const handleMute = async (userId: number) => {
    try {
      await muteUser(Number(id), userId);
      loadRoomData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to mute user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Room not found</div>
      </div>
    );
  }

  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const currentUserId = payload ? parseInt(payload.sub) : null;   
  const isCreator = currentUserId === room.creator_id;

  return (
<div className="min-h-screen bg-dark-bg">
  <header className="bg-dark-card border-b border-dark-border">
    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{room.title}</h1>
        <p className="text-gray-400 text-sm">{room.topic}</p>
      </div>
      <button
        onClick={handleLeaveRoom}
        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
      >
        Leave Room
      </button>
    </div>
  </header>

  <main className="max-w-7xl mx-auto px-4 py-8">
{error && (
  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
    <p className="text-red-500 font-semibold mb-2">⚠️ Error</p>
    <p className="text-red-400">{error}</p>
    {(error.includes("full") || error.includes("Full")) && (
      <p className="text-gray-400 text-sm mt-2">
        Redirecting to room list in 3 seconds...
      </p>
    )}
  </div>
)}

    <div className="grid md:grid-cols-3 gap-6">
      
      <div className="md:col-span-2 space-y-6">
        
        {!isAuthenticated ? (
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              Login Required
            </h2>
            <p className="text-gray-400 mb-6">
              You need to be logged in to join this room
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-dark-card hover:bg-gray-800 text-white font-medium rounded-lg border border-dark-border transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        ) : 
        
        !isInRoom ? (
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
            <div className="text-white">Connecting to voice chat...</div>
          </div>
        ) : 
        
        (
          <div className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              Voice Controls
            </h2>
            <div className="flex justify-center">
              <button
                onClick={handleToggleMic}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isMicOn
                    ? "bg-accent hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isMicOn ? (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-center text-gray-400 mt-4">
              {isMicOn ? "Microphone ON" : "Microphone OFF"}
            </p>
          </div>
        )}
        
      </div>

      {/* Participants */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Participants ({room.participants.length}/{room.max_participants})
        </h3>

        <div className="space-y-3">
          {room.participants.map((participant, index) => (
            <div
              key={`participant-${participant.id}-${index}`}
              className="flex items-center justify-between p-3 bg-dark-bg rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {participant.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {participant.username}
                    {participant.id === room.creator_id && (
                      <span className="ml-2 text-xs text-accent">Host</span>
                    )}
                  </p>
                  {participant.is_muted && (
                    <p className="text-xs text-red-500">Muted</p>
                  )}
                </div>
              </div>

              {isCreator && participant.id !== currentUserId && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMute(participant.id)}
                    className="p-2 hover:bg-dark-card rounded transition-colors"
                    title="Mute/Unmute"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleKick(participant.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                    title="Kick"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </main>
</div>
  );
}

export default RoomDetail;