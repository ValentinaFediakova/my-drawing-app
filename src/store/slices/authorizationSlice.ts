import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthorizationState {
  name: string;
}

const initialState: AuthorizationState = {
  name: "Anonymous",
};

const authorizationSlice = createSlice({
  name: "authorization",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
});

export const { setName } = authorizationSlice.actions;
export default authorizationSlice.reducer;
