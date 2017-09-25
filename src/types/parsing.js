// @flow
type OffsetBegin = number;
type OffsetEnd = number;
export type TextOffset = [OffsetBegin, OffsetEnd];

type WithOffsets = {
  startOffset: number,
  endOffset: number,
};
type WithText = { text: string };
type WithoutText = { text: void };
type WithNumber = {
  number: number,
  hasSign: boolean,
  isInteger: boolean,
};

export type WhitespaceToken = { tokenType: 'whitespace' } & WithOffsets &
  WithoutText;
export type IdentToken = { tokenType: 'ident' } & WithText & WithOffsets;
export type FunctionToken = { tokenType: 'function' } & WithText & WithOffsets;
export type AtToken = { tokenType: 'at' } & WithText & WithOffsets;
export type IdToken = { tokenType: 'id' } & WithText & WithOffsets;
export type HashToken = { tokenType: 'has' } & WithText & WithOffsets;
export type DimensionToken = { tokenType: 'dimension' } & WithNumber &
  WithText &
  WithOffsets;
export type NumberToken = { tokenType: 'number' } & WithNumber &
  WithOffsets &
  WithoutText;
export type PercentageToken = { tokenType: 'percentage' } & WithNumber &
  WithOffsets &
  WithoutText;
export type StringToken = { tokenType: 'string' } & WithText & WithOffsets;
export type BadStringToken = { tokenType: 'bad_string' } & WithText &
  WithOffsets;
export type UrlToken = { tokenType: 'url' } & WithText & WithOffsets;
export type BadUrlToken = { tokenType: 'bad_url' } & WithText & WithOffsets;
export type SymbolToken = { tokenType: 'symbol' } & WithText & WithOffsets;

export type IncludesToken = { tokenType: 'includes' } & WithOffsets &
  WithoutText;
export type DashMatchToken = { tokenType: 'dashmatch' } & WithOffsets &
  WithoutText;
export type BeginsToken = { tokenType: 'begins' } & WithOffsets & WithoutText;
export type EndsToken = { tokenType: 'ends' } & WithOffsets & WithoutText;
export type ContainsToken = { tokenType: 'contains' } & WithOffsets &
  WithoutText;
export type UrangeToken = { tokenType: 'urange' } & WithOffsets & WithoutText;
export type CommentToken = { tokenType: 'comment' } & WithOffsets & WithoutText;
export type HtmlCommentToken = { tokenType: 'htmlcomment' } & WithOffsets &
  WithoutText;

export type Token =
  | WhitespaceToken
  | IdentToken
  | FunctionToken
  | AtToken
  | IdToken
  | HashToken
  | DimensionToken
  | NumberToken
  | PercentageToken
  | StringToken
  | BadStringToken
  | UrlToken
  | BadUrlToken
  | SymbolToken
  | IncludesToken
  | DashMatchToken
  | BeginsToken
  | EndsToken
  | ContainsToken
  | UrangeToken
  | CommentToken
  | HtmlCommentToken;

export type Lexer = {
  nextToken: () => Token | null,
  // The actual text content of a stylesheet.
  mBuffer: string,
  // There are a lot more functions that aren't used now.
};
