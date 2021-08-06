type Creator<T> = () => T;
type CleanUp<T> = (t: T) => unknown;

interface Options {
  initialSize: number;
}

const defaultOptions: Options = {
  initialSize: 10,
};

// Was implemented in 5min, don't know if that's ok
// TODO: ?
export class ObjectPool<T> {
  protected pool: T[];
  protected dict: Map<string, number>;
  protected free: number;

  constructor(
    private readonly creator: Creator<T>,
    private readonly cleanup: CleanUp<T>,
    options: Options = defaultOptions,
  ) {
    this.pool = [];
    for (let i = 0; i < options.initialSize; i++) {
      this.pool.push(creator());
    }
    this.dict = new Map<string, number>();
    this.free = options.initialSize;
  }

  // The boolean tells you if it was taken from cache
  allocate(id: string): [T, boolean] {
    if (this.dict.has(id)) {
      const i = this.dict.get(id);
      if (i !== undefined) {
        return [this.pool[i], true];
      }
    }
    console.log(`Current size : ${this.pool.length}, Free: ${this.free} `);
    if (this.free > 0) {
      this.dict.set(id, --this.free);
      return [this.pool[this.free], false];
    } else {
      // We create a new one and push it on the pool
      this.dict.set(id, this.pool.length);
      this.pool.push(this.creator());
      return [this.pool[this.pool.length - 1], false];
    }
  }

  release(id: string) {
    const i = this.dict.get(id);
    if (i === undefined) return;
    this.cleanup(this.pool[i]);

    const tmp = this.pool[this.free];
    this.pool[this.free] = this.pool[i];
    this.pool[i] = tmp;
    this.free++;
    this.dict.delete(id);
  }
}
