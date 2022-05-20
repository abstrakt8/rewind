import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UpdateStatus {
  newVersion: string | null;
  modalOpen: boolean;

  //
  downloadedBytes: number;
  totalBytes: number;
  bytesPerSecond: number;

  isDownloading: boolean;
  downloadFinished: boolean;
  error: boolean;
}

const initialState: UpdateStatus = {
  // TODO: This is for testing
  // modalOpen: true,
  // newVersion: "3.4.1",
  // bytesPerSecond: 20,
  // totalBytes: 3333,
  // downloadedBytes: 3333,
  //
  // downloadFinished: true,
  // isDownloading: true,
  // error: false,

  newVersion: null,
  modalOpen: false,
  bytesPerSecond: 0,
  totalBytes: 0,
  downloadedBytes: 0,

  downloadFinished: false,
  isDownloading: false,
  error: false,
};

const updateSlice = createSlice({
  name: "update",
  initialState,
  reducers: {
    newVersionAvailable(draft, action: PayloadAction<string>) {
      draft.newVersion = action.payload;
      draft.modalOpen = true;
    },
    setUpdateModalOpen(draft, action: PayloadAction<boolean>) {
      draft.modalOpen = action.payload;
    },
    downloadProgressed(
      draft,
      action: PayloadAction<{ totalBytes: number; bytesPerSecond: number; downloadedBytes: number }>,
    ) {
      const { downloadedBytes, totalBytes, bytesPerSecond } = action.payload;
      draft.isDownloading = true;
      draft.bytesPerSecond = bytesPerSecond;
      draft.totalBytes = totalBytes;
      draft.downloadedBytes = downloadedBytes;
    },
    downloadFinished(draft) {
      draft.downloadFinished = true;
    },
    downloadErrorHappened(draft) {
      draft.error = true;
    },
  },
});

export const { newVersionAvailable, setUpdateModalOpen, downloadFinished, downloadProgressed } = updateSlice.actions;

export default updateSlice.reducer;
