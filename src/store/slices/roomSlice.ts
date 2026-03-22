import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRooms, createRoom as createRoomAPI } from "../../api/roomApi";
import type { RoomResponse, RoomCreate } from "../../types";

interface RoomState {
  rooms: RoomResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  loading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk(
    "room/fetchAll",
     async () => {
  const data = await getRooms();
  return data;
});

export const createRoom = createAsyncThunk(
  "room/create",
  async (roomData: RoomCreate): Promise<RoomResponse> => {
    const data = await createRoomAPI(roomData);
    return data;
  }
);

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
     silentRefresh: (state) => {
    // Trigger refresh without loading state
  }
  },
  extraReducers: (builder) => {
    // Fetch Rooms
    builder
      .addCase(fetchRooms.pending, (state) => {
        if (state.rooms.length === 0) {
    state.loading = true;
  }
  state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch rooms";
      });

    // Create Room
    builder
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to create room";
      });
  },
});

export default roomSlice.reducer;