import { BehaviorSubject } from "rxjs";
import { Draft } from "immer/dist/types/types-external";
import produce from "immer";
import { injectable, postConstruct } from "inversify";
import { LocalStorageLoader } from "../common/local-storage";
import { JSONSchemaType } from "ajv";
import { debounceTime } from "rxjs/operators";

@injectable()
export abstract class StatefulService<T> {
  settings$: BehaviorSubject<T>;

  constructor() {
    this.settings$ = new BehaviorSubject<T>(this.getDefaultValue());
  }

  abstract getDefaultValue(): T;

  getSettings() {
    return this.settings;
  }

  changeSettings(fn: (draft: Draft<T>) => unknown) {
    this.settings = produce(this.settings, (draft) => {
      fn(draft);
      // We explicitly return here so that `fn` can return anything
      return;
    });
  }

  getSubject() {
    return this.settings$;
  }

  get settings() {
    return this.settings$.getValue();
  }

  set settings(s: T) {
    this.settings$.next(s);
  }
}

const DEBOUNCE_TIME_IN_MS = 500;

@injectable()
export abstract class PersistentService<T> extends StatefulService<T> {
  abstract key: string;
  abstract schema: JSONSchemaType<T>;

  @postConstruct()
  init() {
    const localStorageLoader = new LocalStorageLoader<T>(this.key, this.schema, this.getDefaultValue());
    this.settings$.next(localStorageLoader.loadFromLocalStorage());
    this.settings$.pipe(debounceTime(DEBOUNCE_TIME_IN_MS)).subscribe((s) => {
      // Store the serialized version into the LocalStorage
      window.localStorage.setItem(this.key, JSON.stringify(s));
    });
  }
}
