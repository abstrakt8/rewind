import { BehaviorSubject } from "rxjs";
import { Draft } from "immer/dist/types/types-external";
import produce from "immer";
import { injectable } from "inversify";

@injectable()
export abstract class AbstractSettingsStore<T> {
  settings$: BehaviorSubject<T>;

  protected constructor(defaultValue: T) {
    this.settings$ = new BehaviorSubject<T>(defaultValue);
  }

  get settings() {
    return this.settings$.getValue();
  }

  set settings(s: T) {
    this.settings$.next(s);
  }

  changeSettings(fn: (draft: Draft<T>) => unknown) {
    this.settings = produce(this.settings, (draft) => {
      fn(draft);
      return;
      // no return done means we can just return something
    });
  }
}
