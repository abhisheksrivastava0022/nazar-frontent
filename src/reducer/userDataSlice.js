import { createSlice } from "@reduxjs/toolkit";

const userDataSlice = createSlice({
  name: "userData",
  initialState: {
    user: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },
    clearUserData: (state) => {
      state.user = null;
    },
  },
});

export const { setUserData, clearUserData } = userDataSlice.actions;
export default userDataSlice.reducer;
