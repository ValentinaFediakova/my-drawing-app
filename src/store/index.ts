import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "./slices/settingsSlice";
import authorizationReducer from "./slices/authorizationSlice";

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    authorization: authorizationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
