import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: [],
  sharedFiles: [],
  isLoading: false,
  error: null,
};

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSharedFiles: (state, action) => {
      state.sharedFiles = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    addFile: (state, action) => {
      state.files.push(action.payload);
    },
    removeFile: (state, action) => {
      state.files = state.files.filter((file) => file.id !== action.payload);
    },
  },
});

export const {
  setFiles,
  setSharedFiles,
  setLoading,
  setError,
  addFile,
  removeFile,
} = fileSlice.actions;

export default fileSlice.reducer;
