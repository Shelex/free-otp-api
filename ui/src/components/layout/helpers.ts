import type { PathPattern, Location } from 'react-router-dom';
import { matchPath } from 'react-router-dom';

interface Item {
  readonly path: PathPattern;
  readonly key: string;
}

export const getSelectedKeys = (items: Item[], location: Location): string[] =>
  items.filter((item) => matchPath(item.path, location.pathname)).map((item) => item.key);
