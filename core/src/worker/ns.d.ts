export as namespace fritz;

import { JSXInternal } from './jsx';
export * from './index';
export { default } from './index';

export import JSX = JSXInternal;

export namespace h {
  export import JSX = JSXInternal;
}