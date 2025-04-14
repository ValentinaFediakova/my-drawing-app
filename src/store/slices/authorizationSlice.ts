import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthorizationState {
  name: string;
  password?: string | undefined;
}

const initialState: AuthorizationState = {
  name: "Anonymous",
  password: undefined,
};

const authorizationSlice = createSlice({
  name: "authorization",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
  },
});

export const { setName, setPassword } = authorizationSlice.actions;
export default authorizationSlice.reducer;
