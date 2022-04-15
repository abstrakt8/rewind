import { BrowserWindow } from "electron";

export interface Windows {
  frontend: null | BrowserWindow;
  backend: null | BrowserWindow;
}

export const windows: Windows = {
  frontend: null,
  backend: null,
};
