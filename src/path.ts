export type Path = string[] | string;

export function parsePath(path: Path): string[] {
  if (typeof path === 'string') {
    return path.split('.');
  } else {
    return path;
  }
}
