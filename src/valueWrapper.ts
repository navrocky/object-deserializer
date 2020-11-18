import { DeserializationError } from './deserializationError';
import { DeserializationPath } from './deserializationPath';
import { ObjectDeserializer } from './objectDeserializer';

export class ValueWrapper {
  constructor(private path: DeserializationPath, private value: any) {}

  /**
   * Returns value as is.
   */
  get asAny(): any {
    return this.value;
  }

  /**
   * Checks and returns value as boolean.
   * 
   * @throws DeserializationError
   */
  get asBool(): boolean {
    if (typeof this.value !== 'boolean') throw new DeserializationError(this.path, 'Not a boolean');
    return this.value;
  }

  /**
   * Checks and returns value as string.
   * 
   * @throws DeserializationError
   */
  get asString(): string {
    if (typeof this.value !== 'string') throw new DeserializationError(this.path, 'Not a string');
    return this.value;
  }

  /**
   * Checks and returns value as number.
   * 
   * @throws DeserializationError
   */
  get asNumber(): number {
    if (typeof this.value !== 'number') throw new DeserializationError(this.path, 'Not a number');
    return this.value;
  }

  /**
   * Checks and returns value as date.
   * 
   * @throws DeserializationError
   */
  get asDate(): Date {
    if (typeof this.value !== 'string') throw new DeserializationError(this.path, 'Not a string');
    const date = new Date(this.value);
    if (!date.getDate()) throw new DeserializationError(this.path, 'Not a date');
    return new Date(this.value);
  }

  /**
   * Convert raw value to target type with provided mapper function.
   * 
   * @throws DeserializationError
   */
  as<T>(mapper: (value: any, path: DeserializationPath) => T): T {
    return mapper(this.value, this.path);
  }

  /**
   * Converts raw value to array of target type with provided mapper function.
   * 
   * @throws DeserializationError
   */
  asArray<T>(mapper: (value: any, path: DeserializationPath) => T): T[] {
    if (!Array.isArray(this.value)) throw new DeserializationError(this.path, 'Not an array');
    return this.value.map(v => mapper(v, this.path));
  }

  /**
   * Deserialize value to the target type with a provided object mapper.
   * 
   * @param mapper 
   */
  asObject<T>(mapper: (d: ObjectDeserializer) => T): T {
    const obj = new ObjectDeserializer(this.value, this.path);
    return mapper(obj);
  }


  /**
   * Deserialize value to the array of target objects with a provided object mapper.
   * 
   * @param mapper 
   */
  asArrayOfObjects<T>(mapper: (d: ObjectDeserializer) => T): T[] {
    return this.asArray((v, p) => mapper(new ObjectDeserializer(v, p)));
  }

  /**
   * Deserialize value to the array of optional target objects with a provided object mapper.
   * 
   * @param mapper 
   */
  asArrayOfOptionalObjects<T>(mapper: (d: ObjectDeserializer) => T | undefined): (T | undefined)[] {
    return this.asArray<T | undefined>((v, p) => (v ? mapper(new ObjectDeserializer(v, p)) : undefined));
  }
}
