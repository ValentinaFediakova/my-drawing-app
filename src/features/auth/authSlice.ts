import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  username: string;
}

interface AuthState {
  user: User | null;
  signIn: {
    status: "idle" | "loading" | "success" | "error";
    error: string | null;
  };
  signUp: {
    status: "idle" | "loading" | "success" | "error";
    error: string | null;
  };
  checkAuth: {
    status: "idle" | "loading" | "success" | "error";
    error: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  signIn: { status: "idle", error: null },
  signUp: { status: "idle", error: null },
  checkAuth: { status: "idle", error: null },
};

export const signUpThunk = createAsyncThunk(
  "auth/signUp",
  async (formData: { username: string; password: string }) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    if (!res.ok) {
      throw new Error("Registration failed");
    }

    return await res.json();
  }
);

export const signInThunk = createAsyncThunk(
  "auth/signIn",
  async (formData: { username: string; password: string }) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );
    if (!res.ok) {
      throw new Error("Login failed");
    }
    return await res.json();
  }
);

export const checkAuthThunk = createAsyncThunk("auth/checkAuth", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Authentication failed");
  }
  const data = await res.json();
  return data.user;
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
    },
    clearError(
      state,
      action: PayloadAction<"signIn" | "signUp" | "checkAuth">
    ) {
      const key = action.payload;
      state[key].error = null;
      state[key].status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpThunk.pending, (state) => {
        state.signUp.status = "loading";
        state.signUp.error = null;
      })
      .addCase(signUpThunk.fulfilled, (state, action) => {
        state.signUp.status = "success";
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.accessToken);
      })
      .addCase(signUpThunk.rejected, (state, action) => {
        state.signUp.status = "error";
        state.signUp.error = action.error.message || "Something went wrong";
        state.user = null;
        localStorage.removeItem("token");
      })
      .addCase(signInThunk.pending, (state) => {
        state.signIn.status = "loading";
        state.signIn.error = null;
      })
      .addCase(signInThunk.fulfilled, (state, action) => {
        state.signIn.status = "success";
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.accessToken);
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.signIn.status = "error";
        state.signIn.error = action.error.message || "Login failed";
        state.user = null;
        localStorage.removeItem("token");
      })
      .addCase(checkAuthThunk.pending, (state) => {
        state.checkAuth.status = "loading";
        state.checkAuth.error = null;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.checkAuth.status = "success";
        state.user = action.payload;
      })
      .addCase(checkAuthThunk.rejected, (state, action) => {
        state.checkAuth.status = "error";
        state.checkAuth.error = action.error.message || "Something went wrong";
        state.user = null;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

//
