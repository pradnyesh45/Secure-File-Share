import api from "./api.js";

export const fileApi = {
  getFiles: async () => {
    console.log("Calling getFiles API");
    try {
      // First get the list of files directly
      const response = await api.get("/api/files/files/");
      console.log("Files response:", response.data);
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw error;
    }
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      return await api.post("/api/files/files/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default fileApi;
