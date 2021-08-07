type Creator<T> = () => T;
type CleanUp<T> = (t: T) => unknown;

interface Options {
  initialSize: number;
}

const defaultOptions: Options = {
  initialSize: 10,
};

export class ObjectPool<T> {
  protected pool: T[];
  protected dict: Map<string, T>;

  constructor(
    private readonly creator: Creator<T>,
    private readonly cleanup: CleanUp<T>,
    options: Options = defaultOptions,
  ) {
    this.pool = [];
    for (let i = 0; i < options.initialSize; i++) {
      this.pool.push(creator());
    }
    this.dict = new Map<string, T>();
  }

  // The boolean tells you if it was taken from cache
  allocate(id: string): [T, boolean] {
    const cached = this.dict.get(id);
    if (cached !== undefined) {
      return [cached, true];
    }
    let lastElement = this.pool.pop();
    if (!lastElement) {
      lastElement = this.creator();
    }
    this.dict.set(id, lastElement);
    return [lastElement, false];
  }

  release(id: string) {
    const value = this.dict.get(id);
    if (value === undefined) return;
    this.cleanup(value);
    this.pool.push(value);
    this.dict.delete(id);
  }
}
