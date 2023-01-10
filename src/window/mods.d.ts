declare module '@matthewp/skatejs/dist/esnext/with-update' {
  export function withUpdate(a: any): any;
}

declare module '@matthewp/skatejs/dist/esnext/with-renderer' {
  export function withRenderer(a: any): typeof HTMLElement;
}

declare module 'incremental-dom' {
  export const symbols: {
    default: any;
  }
  export const attributes: {
    [a in any]: any;
  };
  export function elementOpen(a: any, b: any, c: any): any;
  export function elementClose(a: any): any;
  
  export function text(a: any): any;
  export function patch(a: any, b: any): any;
}