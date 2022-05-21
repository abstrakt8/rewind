// Will store the settings after a couple seconds
import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";

const storage = window.localStorage;
const ajv = new Ajv({ useDefaults: true });

const DEBOUNCE_TIME = 500;

interface LocalStorageSubscriber<T> {
  key: string;
  subject: BehaviorSubject<T>;
  schema: JSONSchemaType<T>;
  defaultValue: T;
}

/**
 * This helper makes sure that the settings that we observe here will be stored into the LocalStorage with a specific debounce time.
 */
export class LocalStorageHelper {
  subscribers: LocalStorageSubscriber<unknown>[] = [];

  register<T>(subscriber: LocalStorageSubscriber<T>) {
    this.registerStorage(subscriber.key, subscriber.subject);
    this.subscribers.push(subscriber as LocalStorageSubscriber<unknown>);
  }

  loadAll() {
    this.subscribers.forEach((s) => {
      // TODO: Optimize by storing
      const loader = new LocalStorageLoader(s.key, s.schema, s.defaultValue);
      s.subject.next(loader.loadFromLocalStorage());
    });
  }

  private registerStorage<T>(localStorageKey: string, observable: Observable<T>) {
    observable.pipe(debounceTime(DEBOUNCE_TIME)).subscribe((s) => {
      // Store the serialized version into
      storage.setItem(localStorageKey, JSON.stringify(s));
    });
  }
}

export class LocalStorageLoader<T> {
  validate: ValidateFunction<T>;

  constructor(private readonly localStorageKey: string, schema: JSONSchemaType<T>, private readonly defaultValue: T) {
    this.validate = ajv.compile<T>(schema);
  }

  loadFromLocalStorage(): T {
    const { validate, localStorageKey, defaultValue } = this;
    const str = storage.getItem(localStorageKey);
    if (str === null) {
      // This is very expected on first time start up
      return defaultValue;
    }
    let json;
    try {
      json = JSON.parse(str);
    } catch (e) {
      console.warn(`Could not parse '${localStorageKey}' as a JSON properly: ${str}`);
      return defaultValue;
    }

    if (!validate(json)) {
      console.warn(`JSON '${localStorageKey}' was not validated properly: ${JSON.stringify(validate.errors)}`);
      return defaultValue;
    } else {
      return json;
    }
  }
}
