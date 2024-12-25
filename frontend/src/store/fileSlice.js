import { createSlice } from "@reduxjs/toolkit";

const fileSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    sharedFiles: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
      state.loading = false;
    },
    setSharedFiles: (state, action) => {
      state.sharedFiles = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setFiles, setSharedFiles, setLoading, setError } =
  fileSlice.actions;
export default fileSlice.reducer;
