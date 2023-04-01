import { BrowserWindow } from "electron";

export interface Windows {
  frontend: null | BrowserWindow;
}

export const windows: Windows = {
  frontend: null,
};
