// For each round it will record those that have been accessed and after the .end() it will release all that have

import { ObjectPool } from "./ObjectPool";

// Releases those that have not been touched.
export class TemporaryObjectPool<T> extends ObjectPool<T> {
  touched: Set<string> = new Set<string>();

  allocate(id: string) {
    this.touched.add(id);
    return super.allocate(id);
  }

  releaseUntouched() {
    for (const id of this.dict.keys()) {
      if (!this.touched.has(id)) {
        this.release(id);
      }
    }
    this.touched.clear();
  }
}
