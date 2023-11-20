/// <reference types="react-scripts" />

// eslint-disable-next-line react/no-typos
import 'react';

declare module 'react' {
  export type F<P = object> = FunctionComponent<PropsWithChildren<P>>;
}
