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
    // Need to copy it because also delete from it at the same time
    const keys = Array.from(this.dict.keys());
    for (const id of keys) {
      if (!this.touched.has(id)) {
        this.release(id);
      }
    }
    this.touched.clear();
  }
}
