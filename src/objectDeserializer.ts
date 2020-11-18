import { parsePath, Path } from './path';
import { DeserializationPath } from './deserializationPath';
import { DeserializationError, ValueWrapper } from '.';

export class ObjectDeserializer {
  private path: DeserializationPath;

  /**
   * Constructs an object deserializer. You should use convenient `deserialize` function instead of calling this
   * constructor directly.
   *
   * @param obj raw POJO to deserialize
   * @param initialPath initial path of this POJO
   */
  constructor(private obj: any, initialPath?: DeserializationPath) {
    this.path = initialPath || new DeserializationPath();
    if (typeof obj !== 'object' || Array.isArray(obj)) throw new DeserializationError(this.path, 'Not an object');
  }

  private followPath(obj: any, path: string[]): any {
    let currentPath = this.path;
    for (const key of path) {
      if (obj === undefined || obj === null) return undefined;
      if (typeof obj !== 'object') throw new DeserializationError(currentPath, `Not an object`);
      obj = obj[key];
      currentPath = currentPath.append([key]);
    }
    return obj;
  }

  /**
   * Try to get optional value by path.
   *
   * @param valuePath path to the value. Can be a string or path string delimited with a dot.
   */
  optional(valuePath: Path): ValueWrapper | undefined {
    const path = parsePath(valuePath);
    const v = this.followPath(this.obj, path);
    if (v === null || v === undefined) return undefined;
    return new ValueWrapper(this.path.append(path), v);
  }

  /**
   * Get value by path. Throws if value is not exists.
   *
   * @param valuePath path to the value. Can be a string or path string delimited with a dot.
   * @throws DeserializationError
   */
  required(valuePath: Path): ValueWrapper {
    const path = parsePath(valuePath);
    const v = this.followPath(this.obj, path);
    if (v === null || v === undefined) throw new DeserializationError(this.path.append(path), 'Value required');
    return new ValueWrapper(this.path.append(path), v);
  }
}

/**
 * Convenient function to create ObjectDeserializer from POJO. POJO is a Plain Old Javascript Object.
 *
 * @param obj POJO to deserialize
 * @param mapper mapper function
 */
export function deserialize<T>(obj: any, mapper: (d: ObjectDeserializer) => T): T {
  const deserializator = new ObjectDeserializer(obj);
  return mapper(deserializator);
}
