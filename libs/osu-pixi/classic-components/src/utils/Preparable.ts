export interface Preparable {
  prepareFor(time: number): void;
}

export interface PrepareSetting<T> {
  prepare(setting: Partial<T>): void;
}
