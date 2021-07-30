export interface HasRenderTime {
  renderStartTime: () => number;
  renderEndTime: () => number;
}

export interface Disposable {
  dispose(): void;
}
