import { render, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import FileShare from "../files/FileShare";
import { fileApi } from "../../services/fileApi";
import { describe, it, expect, beforeEach } from "@jest/globals";
import jest from "jest-mock";

jest.mock("../../services/fileApi");

const mockStore = configureStore([]);

describe("FileShare Component", () => {
  let store;
  const mockFile = {
    id: 1,
    name: "test.txt",
  };

  beforeEach(() => {
    store = mockStore({
      auth: { user: { id: 1 } },
    });
  });

  it("generates share link correctly", async () => {
    fileApi.createShareLink.mockResolvedValue({
      data: {
        token: "test-token",
        expires_at: "2024-01-02T00:00:00Z",
      },
    });

    const { getByText, getByLabelText } = render(
      <Provider store={store}>
        <FileShare file={mockFile} />
      </Provider>
    );

    fireEvent.change(getByLabelText(/expiration/i), {
      target: { value: "24" },
    });
    fireEvent.click(getByText(/generate link/i));

    await waitFor(() => {
      expect(fileApi.createShareLink).toHaveBeenCalledWith(1, 24);
      expect(getByText(/test-token/)).toBeInTheDocument();
    });
  });
});
