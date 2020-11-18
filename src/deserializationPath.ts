export class DeserializationPath {
  constructor(private path?: string[]) {}

  append(path: string[]): DeserializationPath {
    return new DeserializationPath((this.path || []).concat(path));
  }

  toString() {
    return this.path?.join('.') || '';
  }
}
