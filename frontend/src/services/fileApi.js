import api from "./api";

export const fileApi = {
  uploadFile: (formData) =>
    api.post("/api/files/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getFiles: () => api.get("/api/files/"),

  getSharedFiles: () => api.get("/api/files/shared/"),

  shareFile: (fileId, userData) =>
    api.post(`/api/files/${fileId}/share/`, userData),

  deleteFile: (fileId) => api.delete(`/api/files/${fileId}/`),

  downloadFile: (fileId) =>
    api.get(`/api/files/${fileId}/download/`, {
      responseType: "blob",
    }),
};

export default fileApi;
