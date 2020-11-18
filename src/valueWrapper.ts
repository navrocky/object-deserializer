import { DeserializationError } from "./deserializationError";
import { DeserializationPath } from "./deserializationPath";
import { ObjectDeserializator } from "./objectDeserializer";

export class ValueWrapper {
  constructor(private path: DeserializationPath, private value: any) {}

  get asAny(): any {
    return this.value;
  }

  get asBool(): boolean {
    if (typeof this.value !== 'boolean') throw new DeserializationError(this.path, 'Not a boolean');
    return this.value;
  }

  get asString(): string {
    if (typeof this.value !== 'string') throw new DeserializationError(this.path, 'Not a string');
    return this.value;
  }

  get asNumber(): number {
    if (typeof this.value !== 'number') throw new DeserializationError(this.path, 'Not a number');
    return this.value;
  }

  get asDate(): Date {
    if (typeof this.value !== 'string') throw new DeserializationError(this.path, 'Not a string');
    const date = new Date(this.value);
    if (!date.getDate()) throw new DeserializationError(this.path, 'Not a date');
    return new Date(this.value);
  }

  as<T>(mapper: (value: any, path: DeserializationPath) => T): T {
    return mapper(this.value, this.path);
  }

  asObject<T>(mapper: (obj: ObjectDeserializator) => T): T {
    const obj = new ObjectDeserializator(this.value, this.path);
    return mapper(obj);
  }

  asArray<T>(mapper: (value: any, path: DeserializationPath) => T): T[] {
    if (!Array.isArray(this.value)) throw new DeserializationError(this.path, 'Not an array');
    return this.value.map((v) => mapper(v, this.path));
  }

  asArrayOfObjects<T>(mapper: (obj: ObjectDeserializator) => T): T[] {
    return this.asArray((v, p) => mapper(new ObjectDeserializator(v, p)));
  }

  asArrayOfOptionalObjects<T>(mapper: (obj: ObjectDeserializator) => T | undefined): (T | undefined)[] {
    return this.asArray<T | undefined>((v, p) => (v ? mapper(new ObjectDeserializator(v, p)) : undefined));
  }
}
