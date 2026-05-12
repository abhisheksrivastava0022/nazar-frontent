import { createSlice } from "@reduxjs/toolkit";

const filmDataSlice = createSlice({
  name: "filmData",
  initialState: {
    film: null,
  },
  reducers: {
    setFilmData: (state, action) => {
      state.film = action.payload;
    },

    clearFilmData: (state) => {
      state.film = null;
    },
  },
});

export const { setFilmData, clearFilmData } = filmDataSlice.actions;

export default filmDataSlice.reducer;
