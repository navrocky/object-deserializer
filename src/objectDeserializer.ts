import { parsePath, Path } from "./path";

export type Mapper<T, R> = (v: T, path: string[]) => R;

export class ObjectDeserializator {
  private path: DeserializationPath;

  constructor(private obj: any, path?: DeserializationPath) {
    this.path = path || new DeserializationPath();
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

  optional(paramPath: Path): ValueWrapper | undefined {
    const path = parsePath(paramPath);
    const v = this.followPath(this.obj, path);
    if (v === null || v === undefined) return undefined;
    return new ValueWrapper(this.path.append(path), v);
  }

  required(paramPath: Path): ValueWrapper {
    const path = parsePath(paramPath);
    const v = this.followPath(this.obj, path);
    if (v === null || v === undefined) throw new DeserializationError(this.path.append(path), 'Value required');
    return new ValueWrapper(this.path.append(path), v);
  }
}

export function deserialize<T>(obj: any, mapper: (obj: ObjectDeserializator) => T): T {
  const deserializator = new ObjectDeserializator(obj);
  return mapper(deserializator);
}
