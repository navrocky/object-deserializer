import { DeserializationPath } from './deserializationPath';

export class DeserializationError extends Error {
  constructor(path: DeserializationPath, message?: string) {
    super(`Deserialization error on path=\'${path.toString()}\': ${message}`);
  }
}
