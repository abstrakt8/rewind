export interface PrepareSetting<T> {
  prepare(setting: Partial<T>): void;
}
