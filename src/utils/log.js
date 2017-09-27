// @flow
const STYLE = `
  background: #222;
  color: #bd5;
  display: inline-block;
  padding: 0.2em 0.4em;
`;

export function log(...args: any[]) {
  console.log('%cinspector-ext >', STYLE, ...args);
}

export function logContent(...args: any[]) {
  console.log('%cinspector-ext content >', STYLE, ...args);
}

export function logBackground(...args: any[]) {
  console.log('%cinspector-ext background >', STYLE, ...args);
}

export function logPanel(...args: any[]) {
  console.log('%cinspector-ext panel >', STYLE, ...args);
}

export function logDevtools(...args: any[]) {
  console.log('%cinspector-ext devtools >', STYLE, ...args);
}
