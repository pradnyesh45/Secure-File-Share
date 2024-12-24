import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import FileList from "../files/FileList";
import { fileApi } from "../../services/fileApi";

jest.mock("../../services/fileApi");

const mockStore = configureStore([]);

describe("FileList Component", () => {
  let store;
  const mockFiles = [
    {
      id: 1,
      name: "test.txt",
      size: 1024,
      uploaded_at: "2024-01-01T00:00:00Z",
      tags: [],
    },
  ];

  beforeEach(() => {
    store = mockStore({
      auth: { user: { id: 1 } },
    });
  });

  it("renders file list correctly", () => {
    const { getByText } = render(
      <Provider store={store}>
        <FileList files={mockFiles} />
      </Provider>
    );

    expect(getByText("test.txt")).toBeInTheDocument();
  });

  it("handles file deletion", async () => {
    fileApi.deleteFile.mockResolvedValue({});
    const onFileDeleted = jest.fn();

    const { getByTestId } = render(
      <Provider store={store}>
        <FileList files={mockFiles} onFileDeleted={onFileDeleted} />
      </Provider>
    );

    fireEvent.click(getByTestId("delete-file-1"));

    await waitFor(() => {
      expect(fileApi.deleteFile).toHaveBeenCalledWith(1);
      expect(onFileDeleted).toHaveBeenCalled();
    });
  });
});
