// Will store the settings after a couple seconds
import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";

const ajv = new Ajv({ useDefaults: true });

export class LocalStorageLoader<T> {
  validate: ValidateFunction<T>;

  constructor(private readonly localStorageKey: string, schema: JSONSchemaType<T>, private readonly defaultValue: T) {
    this.validate = ajv.compile<T>(schema);
  }

  loadFromLocalStorage(): T {
    const { validate, localStorageKey, defaultValue } = this;
    const str = window.localStorage.getItem(localStorageKey);
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
