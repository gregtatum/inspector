// @flow
export type TokenType =
  | 'whitespace'
  | 'comment'
  | 'ident'
  | 'function'
  | 'at'
  | 'id'
  | 'hash'
  | 'number'
  | 'dimension'
  | 'percentage'
  | 'string'
  | 'bad_string'
  | 'url'
  | 'bad_url'
  | 'symbol'
  | 'includes'
  | 'dashmatch'
  | 'beginsmatch'
  | 'endsmatch'
  | 'containsmatch'
  | 'urange'
  | 'htmlcomment';

export type Token = {
  tokenType: TokenType,
  startOffset: number,
  endOffset: number,
  text: string,
};
