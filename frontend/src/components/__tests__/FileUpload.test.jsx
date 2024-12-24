import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import FileUpload from "../files/FileUpload";
import { fileApi } from "../../services/fileApi";

jest.mock("../../services/fileApi");

const mockStore = configureStore([]);

describe("FileUpload Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: { user: { id: 1 } },
    });
  });

  it("handles file upload correctly", async () => {
    const onUploadComplete = jest.fn();
    fileApi.uploadFile.mockResolvedValue({ data: { id: 1 } });

    const { getByTestId } = render(
      <Provider store={store}>
        <FileUpload onUploadComplete={onUploadComplete} />
      </Provider>
    );

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const input = getByTestId("file-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(fileApi.uploadFile).toHaveBeenCalled();
      expect(onUploadComplete).toHaveBeenCalled();
    });
  });

  it("validates file size", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <FileUpload />
      </Provider>
    );

    const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.txt");
    const input = getByTestId("file-input");

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(getByText(/file size too large/i)).toBeInTheDocument();
    });
  });
});
