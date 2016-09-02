(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A CSS Lexer.  This file is a bit unusual -- it is a more or less
// direct translation of layout/style/nsCSSScanner.cpp and
// layout/style/CSSLexer.cpp into JS.  This implements the
// CSSLexer.webidl interface, and the intent is to try to keep it in
// sync with changes to the platform CSS lexer.  Due to this goal,
// this file violates some naming conventions and consequently locally
// disables some eslint rules.

/* eslint-disable camelcase, no-inline-comments, mozilla/no-aArgs */
/* eslint-disable no-else-return */

"use strict";

// White space of any kind.  No value fields are used.  Note that
// comments do *not* count as white space; comments separate tokens
// but are not themselves tokens.
const eCSSToken_Whitespace = "whitespace";     //
// A comment.
const eCSSToken_Comment = "comment";        // /*...*/

// Identifier-like tokens.  mIdent is the text of the identifier.
// The difference between ID and Hash is: if the text after the #
// would have been a valid Ident if the # hadn't been there, the
// scanner produces an ID token.  Otherwise it produces a Hash token.
// (This distinction is required by css3-selectors.)
const eCSSToken_Ident = "ident";          // word
const eCSSToken_Function = "function";       // word(
const eCSSToken_AtKeyword = "at";      // @word
const eCSSToken_ID = "id";             // #word
const eCSSToken_Hash = "hash";           // #0word

// Numeric tokens.  mNumber is the floating-point value of the
// number, and mHasSign indicates whether there was an explicit sign
// (+ or -) in front of the number.  If mIntegerValid is true, the
// number had the lexical form of an integer, and mInteger is its
// integer value.  Lexically integer values outside the range of a
// 32-bit signed number are clamped to the maximum values; mNumber
// will indicate a 'truer' value in that case.  Percentage tokens
// are always considered not to be integers, even if their numeric
// value is integral (100% => mNumber = 1.0).  For Dimension
// tokens, mIdent holds the text of the unit.
const eCSSToken_Number = "number";         // 1 -5 +2e3 3.14159 7.297352e-3
const eCSSToken_Dimension = "dimension";      // 24px 8.5in
const eCSSToken_Percentage = "percentage";     // 85% 1280.4%

// String-like tokens.  In all cases, mIdent holds the text
// belonging to the string, and mSymbol holds the delimiter
// character, which may be ', ", or zero (only for unquoted URLs).
// Bad_String and Bad_URL tokens are emitted when the closing
// delimiter or parenthesis was missing.
const eCSSToken_String = "string";         // 'foo bar' "foo bar"
const eCSSToken_Bad_String = "bad_string";     // 'foo bar
const eCSSToken_URL = "url";            // url(foobar) url("foo bar")
const eCSSToken_Bad_URL = "bad_url";        // url(foo

// Any one-character symbol.  mSymbol holds the character.
const eCSSToken_Symbol = "symbol";         // . ; { } ! *

// Match operators.  These are single tokens rather than pairs of
// Symbol tokens because css3-selectors forbids the presence of
// comments between the two characters.  No value fields are used;
// the token type indicates which operator.
const eCSSToken_Includes = "includes";       // ~=
const eCSSToken_Dashmatch = "dashmatch";      // |=
const eCSSToken_Beginsmatch = "beginsmatch";    // ^=
const eCSSToken_Endsmatch = "endsmatch";      // $=
const eCSSToken_Containsmatch = "containsmatch";  // *=

// Unicode-range token: currently used only in @font-face.
// The lexical rule for this token includes several forms that are
// semantically invalid.  Therefore, mIdent always holds the
// complete original text of the token (so we can print it
// accurately in diagnostics), and mIntegerValid is true iff the
// token is semantically valid.  In that case, mInteger holds the
// lowest value included in the range, and mInteger2 holds the
// highest value included in the range.
const eCSSToken_URange = "urange";         // U+007e U+01?? U+2000-206F

// HTML comment delimiters, ignored as a unit when they appear at
// the top level of a style sheet, for compatibility with websites
// written for compatibility with pre-CSS browsers.  This token type
// subsumes the css2.1 CDO and CDC tokens, which are always treated
// the same by the parser.  mIdent holds the text of the token, for
// diagnostics.
const eCSSToken_HTMLComment = "htmlcomment";    // <!-- -->

const eEOFCharacters_None = 0x0000;

// to handle \<EOF> inside strings
const eEOFCharacters_DropBackslash = 0x0001;

// to handle \<EOF> outside strings
const eEOFCharacters_ReplacementChar = 0x0002;

// to close comments
const eEOFCharacters_Asterisk = 0x0004;
const eEOFCharacters_Slash = 0x0008;

// to close double-quoted strings
const eEOFCharacters_DoubleQuote = 0x0010;

// to close single-quoted strings
const eEOFCharacters_SingleQuote = 0x0020;

// to close URLs
const eEOFCharacters_CloseParen = 0x0040;

// Bridge the char/string divide.
const APOSTROPHE = "'".charCodeAt(0);
const ASTERISK = "*".charCodeAt(0);
const CARRIAGE_RETURN = "\r".charCodeAt(0);
const CIRCUMFLEX_ACCENT = "^".charCodeAt(0);
const COMMERCIAL_AT = "@".charCodeAt(0);
const DIGIT_NINE = "9".charCodeAt(0);
const DIGIT_ZERO = "0".charCodeAt(0);
const DOLLAR_SIGN = "$".charCodeAt(0);
const EQUALS_SIGN = "=".charCodeAt(0);
const EXCLAMATION_MARK = "!".charCodeAt(0);
const FULL_STOP = ".".charCodeAt(0);
const GREATER_THAN_SIGN = ">".charCodeAt(0);
const HYPHEN_MINUS = "-".charCodeAt(0);
const LATIN_CAPITAL_LETTER_E = "E".charCodeAt(0);
const LATIN_CAPITAL_LETTER_U = "U".charCodeAt(0);
const LATIN_SMALL_LETTER_E = "e".charCodeAt(0);
const LATIN_SMALL_LETTER_U = "u".charCodeAt(0);
const LEFT_PARENTHESIS = "(".charCodeAt(0);
const LESS_THAN_SIGN = "<".charCodeAt(0);
const LINE_FEED = "\n".charCodeAt(0);
const NUMBER_SIGN = "#".charCodeAt(0);
const PERCENT_SIGN = "%".charCodeAt(0);
const PLUS_SIGN = "+".charCodeAt(0);
const QUESTION_MARK = "?".charCodeAt(0);
const QUOTATION_MARK = "\"".charCodeAt(0);
const REVERSE_SOLIDUS = "\\".charCodeAt(0);
const RIGHT_PARENTHESIS = ")".charCodeAt(0);
const SOLIDUS = "/".charCodeAt(0);
const TILDE = "~".charCodeAt(0);
const VERTICAL_LINE = "|".charCodeAt(0);

const UCS2_REPLACEMENT_CHAR = 0xFFFD;

const kImpliedEOFCharacters = [
  UCS2_REPLACEMENT_CHAR,
  ASTERISK,
  SOLIDUS,
  QUOTATION_MARK,
  APOSTROPHE,
  RIGHT_PARENTHESIS,
  0
];

/**
 * Ensure that the character is valid.  If it is valid, return it;
 * otherwise, return the replacement character.
 *
 * @param {Number} c the character to check
 * @return {Number} the character or its replacement
 */
function ensureValidChar(c) {
  if (c >= 0x00110000 || (c & 0xFFF800) == 0xD800) {
    // Out of range or a surrogate.
    return UCS2_REPLACEMENT_CHAR;
  }
  return c;
}

/**
 * Turn a string into an array of character codes.
 *
 * @param {String} str the input string
 * @return {Array} an array of character codes, one per character in
 *         the input string.
 */
function stringToCodes(str) {
  return Array.prototype.map.call(str, (c) => c.charCodeAt(0));
}

const IS_HEX_DIGIT = 0x01;
const IS_IDSTART = 0x02;
const IS_IDCHAR = 0x04;
const IS_URL_CHAR = 0x08;
const IS_HSPACE = 0x10;
const IS_VSPACE = 0x20;
const IS_SPACE = IS_HSPACE | IS_VSPACE;
const IS_STRING = 0x40;

const H = IS_HSPACE;
const V = IS_VSPACE;
const I = IS_IDCHAR;
const J = IS_IDSTART;
const U = IS_URL_CHAR;
const S = IS_STRING;
const X = IS_HEX_DIGIT;

const SH = S | H;
const SU = S | U;
const SUI = S | U | I;
const SUIJ = S | U | I | J;
const SUIX = S | U | I | X;
const SUIJX = S | U | I | J | X;

/* eslint-disable indent, no-multi-spaces, comma-spacing, spaced-comment */
const gLexTable = [
// 00    01    02    03    04    05    06    07
    0,    S,    S,    S,    S,    S,    S,    S,
// 08   TAB    LF    0B    FF    CR    0E    0F
    S,   SH,    V,    S,    V,    V,    S,    S,
// 10    11    12    13    14    15    16    17
    S,    S,    S,    S,    S,    S,    S,    S,
// 18    19    1A    1B    1C    1D    1E    1F
    S,    S,    S,    S,    S,    S,    S,    S,
//SPC     !     "     #     $     %     &     '
   SH,   SU,    0,   SU,   SU,   SU,   SU,    0,
//  (     )     *     +     ,     -     .     /
    S,    S,   SU,   SU,   SU,  SUI,   SU,   SU,
//  0     1     2     3     4     5     6     7
 SUIX, SUIX, SUIX, SUIX, SUIX, SUIX, SUIX, SUIX,
//  8     9     :     ;     <     =     >     ?
 SUIX, SUIX,   SU,   SU,   SU,   SU,   SU,   SU,
//  @     A     B     C     D     E     F     G
   SU,SUIJX,SUIJX,SUIJX,SUIJX,SUIJX,SUIJX, SUIJ,
//  H     I     J     K     L     M     N     O
 SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ,
//  P     Q     R     S     T     U     V     W
 SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ,
//  X     Y     Z     [     \     ]     ^     _
 SUIJ, SUIJ, SUIJ,   SU,    J,   SU,   SU, SUIJ,
//  `     a     b     c     d     e     f     g
   SU,SUIJX,SUIJX,SUIJX,SUIJX,SUIJX,SUIJX, SUIJ,
//  h     i     j     k     l     m     n     o
 SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ,
//  p     q     r     s     t     u     v     w
 SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ, SUIJ,
//  x     y     z     {     |     }     ~    7F
 SUIJ, SUIJ, SUIJ,   SU,   SU,   SU,   SU,    S,
];
/* eslint-enable indent, no-multi-spaces, comma-spacing, spaced-comment */

/**
 * True if 'ch' is in character class 'cls', which should be one of
 * the constants above or some combination of them.  All characters
 * above U+007F are considered to be in 'cls'.  EOF is never in 'cls'.
 */
function IsOpenCharClass(ch, cls) {
  return ch >= 0 && (ch >= 128 || (gLexTable[ch] & cls) != 0);
}

/**
 * True if 'ch' is in character class 'cls', which should be one of
 * the constants above or some combination of them.  No characters
 * above U+007F are considered to be in 'cls'. EOF is never in 'cls'.
 */
function IsClosedCharClass(ch, cls) {
  return ch >= 0 && ch < 128 && (gLexTable[ch] & cls) != 0;
}

/**
 * True if 'ch' is CSS whitespace, i.e. any of the ASCII characters
 * TAB, LF, FF, CR, or SPC.
 */
function IsWhitespace(ch) {
  return IsClosedCharClass(ch, IS_SPACE);
}

/**
 * True if 'ch' is horizontal whitespace, i.e. TAB or SPC.
 */
function IsHorzSpace(ch) {
  return IsClosedCharClass(ch, IS_HSPACE);
}

/**
 * True if 'ch' is vertical whitespace, i.e. LF, FF, or CR.  Vertical
 * whitespace requires special handling when consumed, see AdvanceLine.
 */
function IsVertSpace(ch) {
  return IsClosedCharClass(ch, IS_VSPACE);
}

/**
 * True if 'ch' is a character that can appear in the middle of an identifier.
 * This includes U+0000 since it is handled as U+FFFD, but for purposes of
 * GatherText it should not be included in IsOpenCharClass.
 */
function IsIdentChar(ch) {
  return IsOpenCharClass(ch, IS_IDCHAR) || ch == 0;
}

/**
 * True if 'ch' is a character that by itself begins an identifier.
 * This includes U+0000 since it is handled as U+FFFD, but for purposes of
 * GatherText it should not be included in IsOpenCharClass.
 * (This is a subset of IsIdentChar.)
 */
function IsIdentStart(ch) {
  return IsOpenCharClass(ch, IS_IDSTART) || ch == 0;
}

/**
 * True if the two-character sequence aFirstChar+aSecondChar begins an
 * identifier.
 */
function StartsIdent(aFirstChar, aSecondChar) {
  return IsIdentStart(aFirstChar) ||
    (aFirstChar == HYPHEN_MINUS && (aSecondChar == HYPHEN_MINUS ||
                                    IsIdentStart(aSecondChar)));
}

/**
 * True if 'ch' is a decimal digit.
 */
function IsDigit(ch) {
  return (ch >= DIGIT_ZERO) && (ch <= DIGIT_NINE);
}

/**
 * True if 'ch' is a hexadecimal digit.
 */
function IsHexDigit(ch) {
  return IsClosedCharClass(ch, IS_HEX_DIGIT);
}

/**
 * Assuming that 'ch' is a decimal digit, return its numeric value.
 */
function DecimalDigitValue(ch) {
  return ch - DIGIT_ZERO;
}

/**
 * Assuming that 'ch' is a hexadecimal digit, return its numeric value.
 */
function HexDigitValue(ch) {
  if (IsDigit(ch)) {
    return DecimalDigitValue(ch);
  } else {
    // Note: c&7 just keeps the low three bits which causes
    // upper and lower case alphabetics to both yield their
    // "relative to 10" value for computing the hex value.
    return (ch & 0x7) + 9;
  }
}

/**
 * If 'ch' can be the first character of a two-character match operator
 * token, return the token type code for that token, otherwise return
 * eCSSToken_Symbol to indicate that it can't.
 */
function MatchOperatorType(ch) {
  switch (ch) {
    case TILDE: return eCSSToken_Includes;
    case VERTICAL_LINE: return eCSSToken_Dashmatch;
    case CIRCUMFLEX_ACCENT: return eCSSToken_Beginsmatch;
    case DOLLAR_SIGN: return eCSSToken_Endsmatch;
    case ASTERISK: return eCSSToken_Containsmatch;
    default: return eCSSToken_Symbol;
  }
}

function Scanner(buffer) {
  this.mBuffer = buffer || "";
  this.mOffset = 0;
  this.mCount = this.mBuffer.length;
  this.mLineNumber = 1;
  this.mLineOffset = 0;
  this.mTokenLineOffset = 0;
  this.mTokenOffset = 0;
  this.mTokenLineNumber = 1;
  this.mEOFCharacters = eEOFCharacters_None;
}

Scanner.prototype = {
  /**
   * @see CSSLexer.lineNumber
   */
  get lineNumber() {
    return this.mTokenLineNumber - 1;
  },

  /**
   * @see CSSLexer.columnNumber
   */
  get columnNumber() {
    return this.mTokenOffset - this.mTokenLineOffset;
  },

  /**
   * @see CSSLexer.performEOFFixup
   */
  performEOFFixup: function (aInputString, aPreserveBackslash) {
    let result = aInputString;

    let eofChars = this.mEOFCharacters;

    if (aPreserveBackslash &&
        (eofChars & (eEOFCharacters_DropBackslash |
                     eEOFCharacters_ReplacementChar)) != 0) {
      eofChars &= ~(eEOFCharacters_DropBackslash |
                    eEOFCharacters_ReplacementChar);
      result += "\\";
    }

    if ((eofChars & eEOFCharacters_DropBackslash) != 0 &&
        result.length > 0 && result.endsWith("\\")) {
      result = result.slice(0, -1);
    }

    let extra = [];
    this.AppendImpliedEOFCharacters(eofChars, extra);
    let asString = String.fromCharCode.apply(null, extra);

    return result + asString;
  },

  /**
   * @see CSSLexer.nextToken
   */
  nextToken: function () {
    let token = {};
    if (!this.Next(token)) {
      return null;
    }

    let resultToken = {};
    resultToken.tokenType = token.mType;
    resultToken.startOffset = this.mTokenOffset;
    resultToken.endOffset = this.mOffset;

    let constructText = () => {
      return String.fromCharCode.apply(null, token.mIdent);
    };

    switch (token.mType) {
      case eCSSToken_Whitespace:
        break;

      case eCSSToken_Ident:
      case eCSSToken_Function:
      case eCSSToken_AtKeyword:
      case eCSSToken_ID:
      case eCSSToken_Hash:
        resultToken.text = constructText();
        break;

      case eCSSToken_Dimension:
        resultToken.text = constructText();
        /* Fall through.  */
      case eCSSToken_Number:
      case eCSSToken_Percentage:
        resultToken.number = token.mNumber;
        resultToken.hasSign = token.mHasSign;
        resultToken.isInteger = token.mIntegerValid;
        break;

      case eCSSToken_String:
      case eCSSToken_Bad_String:
      case eCSSToken_URL:
      case eCSSToken_Bad_URL:
        resultToken.text = constructText();
        /* Don't bother emitting the delimiter, as it is readily extracted
           from the source string when needed.  */
        break;

      case eCSSToken_Symbol:
        resultToken.text = String.fromCharCode(token.mSymbol);
        break;

      case eCSSToken_Includes:
      case eCSSToken_Dashmatch:
      case eCSSToken_Beginsmatch:
      case eCSSToken_Endsmatch:
      case eCSSToken_Containsmatch:
      case eCSSToken_URange:
        break;

      case eCSSToken_Comment:
      case eCSSToken_HTMLComment:
        /* The comment text is easily extracted from the source string,
           and is rarely useful.  */
        break;
    }

    return resultToken;
  },

  /**
   * Return the raw UTF-16 code unit at position |this.mOffset + n| within
   * the read buffer.  If that is beyond the end of the buffer, returns
   * -1 to indicate end of input.
   */
  Peek: function (n = 0) {
    if (this.mOffset + n >= this.mCount) {
      return -1;
    }
    return this.mBuffer.charCodeAt(this.mOffset + n);
  },

  /**
   * Advance |this.mOffset| over |n| code units.  Advance(0) is a no-op.
   * If |n| is greater than the distance to end of input, will silently
   * stop at the end.  May not be used to advance over a line boundary;
   * AdvanceLine() must be used instead.
   */
  Advance: function (n = 1) {
    if (this.mOffset + n >= this.mCount || this.mOffset + n < this.mOffset) {
      this.mOffset = this.mCount;
    } else {
      this.mOffset += n;
    }
  },

  /**
   * Advance |this.mOffset| over a line boundary.
   */
  AdvanceLine: function () {
    // Advance over \r\n as a unit.
    if (this.mBuffer.charCodeAt(this.mOffset) == CARRIAGE_RETURN &&
        this.mOffset + 1 < this.mCount &&
        this.mBuffer.charCodeAt(this.mOffset + 1) == LINE_FEED) {
      this.mOffset += 2;
    } else {
      this.mOffset += 1;
    }
    // 0 is a magical line number meaning that we don't know (i.e., script)
    if (this.mLineNumber != 0) {
      this.mLineNumber++;
    }
    this.mLineOffset = this.mOffset;
  },

  /**
   * Skip over a sequence of whitespace characters (vertical or
   * horizontal) starting at the current read position.
   */
  SkipWhitespace: function () {
    for (;;) {
      let ch = this.Peek();
      if (!IsWhitespace(ch)) { // EOF counts as non-whitespace
        break;
      }
      if (IsVertSpace(ch)) {
        this.AdvanceLine();
      } else {
        this.Advance();
      }
    }
  },

  /**
   * Skip over one CSS comment starting at the current read position.
   */
  SkipComment: function () {
    this.Advance(2);
    for (;;) {
      let ch = this.Peek();
      if (ch < 0) {
        this.SetEOFCharacters(eEOFCharacters_Asterisk | eEOFCharacters_Slash);
        return;
      }
      if (ch == ASTERISK) {
        this.Advance();
        ch = this.Peek();
        if (ch < 0) {
          this.SetEOFCharacters(eEOFCharacters_Slash);
          return;
        }
        if (ch == SOLIDUS) {
          this.Advance();
          return;
        }
      } else if (IsVertSpace(ch)) {
        this.AdvanceLine();
      } else {
        this.Advance();
      }
    }
  },

  /**
   * If there is a valid escape sequence starting at the current read
   * position, consume it, decode it, append the result to |aOutput|,
   * and return true.  Otherwise, consume nothing, leave |aOutput|
   * unmodified, and return false.  If |aInString| is true, accept the
   * additional form of escape sequence allowed within string-like tokens.
   */
  GatherEscape: function (aOutput, aInString) {
    let ch = this.Peek(1);
    if (ch < 0) {
      // If we are in a string (or a url() containing a string), we want to drop
      // the backslash on the floor.  Otherwise, we want to treat it as a U+FFFD
      // character.
      this.Advance();
      if (aInString) {
        this.SetEOFCharacters(eEOFCharacters_DropBackslash);
      } else {
        aOutput.push(UCS2_REPLACEMENT_CHAR);
        this.SetEOFCharacters(eEOFCharacters_ReplacementChar);
      }
      return true;
    }
    if (IsVertSpace(ch)) {
      if (aInString) {
        // In strings (and in url() containing a string), escaped
        // newlines are completely removed, to allow splitting over
        // multiple lines.
        this.Advance();
        this.AdvanceLine();
        return true;
      }
      // Outside of strings, backslash followed by a newline is not an escape.
      return false;
    }

    if (!IsHexDigit(ch)) {
      // "Any character (except a hexadecimal digit, linefeed, carriage
      // return, or form feed) can be escaped with a backslash to remove
      // its special meaning." -- CSS2.1 section 4.1.3
      this.Advance(2);
      if (ch == 0) {
        aOutput.push(UCS2_REPLACEMENT_CHAR);
      } else {
        aOutput.push(ch);
      }
      return true;
    }

    // "[at most six hexadecimal digits following a backslash] stand
    // for the ISO 10646 character with that number, which must not be
    // zero. (It is undefined in CSS 2.1 what happens if a style sheet
    // does contain a character with Unicode codepoint zero.)"
    //   -- CSS2.1 section 4.1.3

    // At this point we know we have \ followed by at least one
    // hexadecimal digit, therefore the escape sequence is valid and we
    // can go ahead and consume the backslash.
    this.Advance();
    let val = 0;
    let i = 0;
    do {
      val = val * 16 + HexDigitValue(ch);
      i++;
      this.Advance();
      ch = this.Peek();
    } while (i < 6 && IsHexDigit(ch));

    // "Interpret the hex digits as a hexadecimal number. If this
    // number is zero, or is greater than the maximum allowed
    // codepoint, return U+FFFD REPLACEMENT CHARACTER" -- CSS Syntax
    // Level 3
    if (val == 0) {
      aOutput.push(UCS2_REPLACEMENT_CHAR);
    } else {
      aOutput.push(ensureValidChar(val));
    }

    // Consume exactly one whitespace character after a
    // hexadecimal escape sequence.
    if (IsVertSpace(ch)) {
      this.AdvanceLine();
    } else if (IsHorzSpace(ch)) {
      this.Advance();
    }
    return true;
  },

  /**
   * Consume a run of "text" beginning with the current read position,
   * consisting of characters in the class |aClass| (which must be a
   * suitable argument to IsOpenCharClass) plus escape sequences.
   * Append the text to |aText|, after decoding escape sequences.
   *
   * Returns true if at least one character was appended to |aText|,
   * false otherwise.
   */
  GatherText: function (aClass, aText) {
    let start = this.mOffset;
    let inString = aClass == IS_STRING;

    for (;;) {
      // Consume runs of unescaped characters in one go.
      let n = this.mOffset;
      while (n < this.mCount && IsOpenCharClass(this.mBuffer.charCodeAt(n),
                                                aClass)) {
        n++;
      }
      if (n > this.mOffset) {
        let substr = this.mBuffer.slice(this.mOffset, n);
        Array.prototype.push.apply(aText, stringToCodes(substr));
        this.mOffset = n;
      }
      if (n == this.mCount) {
        break;
      }

      let ch = this.Peek();
      if (ch == 0) {
        this.Advance();
        aText.push(UCS2_REPLACEMENT_CHAR);
        continue;
      }

      if (ch != REVERSE_SOLIDUS) {
        break;
      }
      if (!this.GatherEscape(aText, inString)) {
        break;
      }
    }

    return this.mOffset > start;
  },

  /**
   * Scan an Ident token.  This also handles Function and URL tokens,
   * both of which begin indistinguishably from an identifier.  It can
   * produce a Symbol token when an apparent identifier actually led
   * into an invalid escape sequence.
   */
  ScanIdent: function (aToken) {
    if (!this.GatherText(IS_IDCHAR, aToken.mIdent)) {
      aToken.mSymbol = this.Peek();
      this.Advance();
      return true;
    }

    if (this.Peek() != LEFT_PARENTHESIS) {
      aToken.mType = eCSSToken_Ident;
      return true;
    }

    this.Advance();
    aToken.mType = eCSSToken_Function;

    let asString = String.fromCharCode.apply(null, aToken.mIdent);
    if (asString.toLowerCase() === "url") {
      this.NextURL(aToken);
    }
    return true;
  },

  /**
   * Scan an AtKeyword token.  Also handles production of Symbol when
   * an '@' is not followed by an identifier.
   */
  ScanAtKeyword: function (aToken) {
    // Fall back for when '@' isn't followed by an identifier.
    aToken.mSymbol = COMMERCIAL_AT;
    this.Advance();

    let ch = this.Peek();
    if (StartsIdent(ch, this.Peek(1))) {
      if (this.GatherText(IS_IDCHAR, aToken.mIdent)) {
        aToken.mType = eCSSToken_AtKeyword;
      }
    }
    return true;
  },

  /**
   * Scan a Hash token.  Handles the distinction between eCSSToken_ID
   * and eCSSToken_Hash, and handles production of Symbol when a '#'
   * is not followed by identifier characters.
   */
  ScanHash: function (aToken) {
    // Fall back for when '#' isn't followed by identifier characters.
    aToken.mSymbol = NUMBER_SIGN;
    this.Advance();

    let ch = this.Peek();
    if (IsIdentChar(ch) || ch == REVERSE_SOLIDUS) {
      let type =
          StartsIdent(ch, this.Peek(1)) ? eCSSToken_ID : eCSSToken_Hash;
      aToken.mIdent.length = 0;
      if (this.GatherText(IS_IDCHAR, aToken.mIdent)) {
        aToken.mType = type;
      }
    }

    return true;
  },

  /**
   * Scan a Number, Percentage, or Dimension token (all of which begin
   * like a Number).  Can produce a Symbol when a '.' is not followed by
   * digits, or when '+' or '-' are not followed by either a digit or a
   * '.' and then a digit.  Can also produce a HTMLComment when it
   * encounters '-->'.
   */
  ScanNumber: function (aToken) {
    let c = this.Peek();

    // Sign of the mantissa (-1 or 1).
    let sign = c == HYPHEN_MINUS ? -1 : 1;
    // Absolute value of the integer part of the mantissa.  This is a double so
    // we don't run into overflow issues for consumers that only care about our
    // floating-point value while still being able to express the full int32_t
    // range for consumers who want integers.
    let intPart = 0;
    // Fractional part of the mantissa.  This is a double so that when
    // we convert to float at the end we'll end up rounding to nearest
    // float instead of truncating down (as we would if fracPart were
    // a float and we just effectively lost the last several digits).
    let fracPart = 0;
    // Absolute value of the power of 10 that we should multiply by
    // (only relevant for numbers in scientific notation).  Has to be
    // a signed integer, because multiplication of signed by unsigned
    // converts the unsigned to signed, so if we plan to actually
    // multiply by expSign...
    let exponent = 0;
    // Sign of the exponent.
    let expSign = 1;

    aToken.mHasSign = (c == PLUS_SIGN || c == HYPHEN_MINUS);
    if (aToken.mHasSign) {
      this.Advance();
      c = this.Peek();
    }

    let gotDot = (c == FULL_STOP);

    if (!gotDot) {
      // Scan the integer part of the mantissa.
      do {
        intPart = 10 * intPart + DecimalDigitValue(c);
        this.Advance();
        c = this.Peek();
      } while (IsDigit(c));

      gotDot = (c == FULL_STOP) && IsDigit(this.Peek(1));
    }

    if (gotDot) {
      // Scan the fractional part of the mantissa.
      this.Advance();
      c = this.Peek();
      // Power of ten by which we need to divide our next digit
      let divisor = 10;
      do {
        fracPart += DecimalDigitValue(c) / divisor;
        divisor *= 10;
        this.Advance();
        c = this.Peek();
      } while (IsDigit(c));
    }

    let gotE = false;
    if (c == LATIN_SMALL_LETTER_E || c == LATIN_CAPITAL_LETTER_E) {
      let expSignChar = this.Peek(1);
      let nextChar = this.Peek(2);
      if (IsDigit(expSignChar) ||
          ((expSignChar == HYPHEN_MINUS || expSignChar == PLUS_SIGN) &&
           IsDigit(nextChar))) {
        gotE = true;
        if (expSignChar == HYPHEN_MINUS) {
          expSign = -1;
        }
        this.Advance(); // consumes the E
        if (expSignChar == HYPHEN_MINUS || expSignChar == PLUS_SIGN) {
          this.Advance();
          c = nextChar;
        } else {
          c = expSignChar;
        }
        do {
          exponent = 10 * exponent + DecimalDigitValue(c);
          this.Advance();
          c = this.Peek();
        } while (IsDigit(c));
      }
    }

    let type = eCSSToken_Number;

    // Set mIntegerValid for all cases (except %, below) because we need
    // it for the "2n" in :nth-child(2n).
    aToken.mIntegerValid = false;

    // Time to reassemble our number.
    // Do all the math in double precision so it's truncated only once.
    let value = sign * (intPart + fracPart);
    if (gotE) {
      // Explicitly cast expSign*exponent to double to avoid issues with
      // overloaded pow() on Windows.
      value *= Math.pow(10.0, expSign * exponent);
    } else if (!gotDot) {
      // Clamp values outside of integer range.
      if (sign > 0) {
        aToken.mInteger = Math.min(intPart, Number.MAX_SAFE_INTEGER);
      } else {
        aToken.mInteger = Math.max(-intPart, Number.MIN_SAFE_INTEGER);
      }
      aToken.mIntegerValid = true;
    }

    let ident = aToken.mIdent;

    // Check for Dimension and Percentage tokens.
    if (c >= 0) {
      if (StartsIdent(c, this.Peek(1))) {
        if (this.GatherText(IS_IDCHAR, ident)) {
          type = eCSSToken_Dimension;
        }
      } else if (c == PERCENT_SIGN) {
        this.Advance();
        type = eCSSToken_Percentage;
        value = value / 100.0;
        aToken.mIntegerValid = false;
      }
    }
    aToken.mNumber = value;
    aToken.mType = type;
    return true;
  },

  /**
   * Scan a string constant ('foo' or "foo").  Will always produce
   * either a String or a Bad_String token; the latter occurs when the
   * close quote is missing.  Always returns true (for convenience in Next()).
   */
  ScanString: function (aToken) {
    let aStop = this.Peek();
    aToken.mType = eCSSToken_String;
    aToken.mSymbol = aStop; // Remember how it's quoted.
    this.Advance();

    for (;;) {
      this.GatherText(IS_STRING, aToken.mIdent);

      let ch = this.Peek();
      if (ch == -1) {
        this.AddEOFCharacters(aStop == QUOTATION_MARK ?
                              eEOFCharacters_DoubleQuote :
                              eEOFCharacters_SingleQuote);
        break; // EOF ends a string token with no error.
      }
      if (ch == aStop) {
        this.Advance();
        break;
      }
      // Both " and ' are excluded from IS_STRING.
      if (ch == QUOTATION_MARK || ch == APOSTROPHE) {
        aToken.mIdent.push(ch);
        this.Advance();
        continue;
      }

      aToken.mType = eCSSToken_Bad_String;
      break;
    }
    return true;
  },

  /**
   * Scan a unicode-range token.  These match the regular expression
   *
   *     u\+[0-9a-f?]{1,6}(-[0-9a-f]{1,6})?
   *
   * However, some such tokens are "invalid".  There are three valid forms:
   *
   *     u+[0-9a-f]{x}              1 <= x <= 6
   *     u+[0-9a-f]{x}\?{y}         1 <= x+y <= 6
   *     u+[0-9a-f]{x}-[0-9a-f]{y}  1 <= x <= 6, 1 <= y <= 6
   *
   * All unicode-range tokens have their text recorded in mIdent; valid ones
   * are also decoded into mInteger and mInteger2, and mIntegerValid is set.
   * Note that this does not validate the numeric range, only the syntactic
   * form.
   */
  ScanURange: function (aResult) {
    let intro1 = this.Peek();
    let intro2 = this.Peek(1);
    let ch = this.Peek(2);

    aResult.mIdent.push(intro1);
    aResult.mIdent.push(intro2);
    this.Advance(2);

    let valid = true;
    let haveQues = false;
    let low = 0;
    let high = 0;
    let i = 0;

    do {
      aResult.mIdent.push(ch);
      if (IsHexDigit(ch)) {
        if (haveQues) {
          valid = false; // All question marks should be at the end.
        }
        low = low * 16 + HexDigitValue(ch);
        high = high * 16 + HexDigitValue(ch);
      } else {
        haveQues = true;
        low = low * 16 + 0x0;
        high = high * 16 + 0xF;
      }

      i++;
      this.Advance();
      ch = this.Peek();
    } while (i < 6 && (IsHexDigit(ch) || ch == QUESTION_MARK));

    if (ch == HYPHEN_MINUS && IsHexDigit(this.Peek(1))) {
      if (haveQues) {
        valid = false;
      }

      aResult.mIdent.push(ch);
      this.Advance();
      ch = this.Peek();
      high = 0;
      i = 0;
      do {
        aResult.mIdent.push(ch);
        high = high * 16 + HexDigitValue(ch);

        i++;
        this.Advance();
        ch = this.Peek();
      } while (i < 6 && IsHexDigit(ch));
    }

    aResult.mInteger = low;
    aResult.mInteger2 = high;
    aResult.mIntegerValid = valid;
    aResult.mType = eCSSToken_URange;
    return true;
  },

  SetEOFCharacters: function (aEOFCharacters) {
    this.mEOFCharacters = aEOFCharacters;
  },

  AddEOFCharacters: function (aEOFCharacters) {
    this.mEOFCharacters = this.mEOFCharacters | aEOFCharacters;
  },

  AppendImpliedEOFCharacters: function (aEOFCharacters, aResult) {
    // First, ignore eEOFCharacters_DropBackslash.
    let c = aEOFCharacters >> 1;

    // All of the remaining EOFCharacters bits represent appended characters,
    // and the bits are in the order that they need appending.
    for (let p of kImpliedEOFCharacters) {
      if (c & 1) {
        aResult.push(p);
      }
      c >>= 1;
    }
  },

  /**
   * Consume the part of an URL token after the initial 'url('.  Caller
   * is assumed to have consumed 'url(' already.  Will always produce
   * either an URL or a Bad_URL token.
   *
   * Exposed for use by nsCSSParser::ParseMozDocumentRule, which applies
   * the special lexical rules for URL tokens in a nonstandard context.
   */
  NextURL: function (aToken) {
    this.SkipWhitespace();

    // aToken.mIdent may be "url" at this point; clear that out
    aToken.mIdent.length = 0;

    let ch = this.Peek();
    // Do we have a string?
    if (ch == QUOTATION_MARK || ch == APOSTROPHE) {
      this.ScanString(aToken);
      if (aToken.mType == eCSSToken_Bad_String) {
        aToken.mType = eCSSToken_Bad_URL;
        // Flag us as having been a Bad_String.
        aToken.mInteger2 = 1;
        this.ConsumeBadURLRemnants(aToken);
        return;
      }
    } else {
      // Otherwise, this is the start of a non-quoted url (which may be empty).
      aToken.mSymbol = 0;
      this.GatherText(IS_URL_CHAR, aToken.mIdent);
    }

    // Consume trailing whitespace and then look for a close parenthesis.
    this.SkipWhitespace();
    ch = this.Peek();
    // ch can be less than zero indicating EOF
    if (ch < 0 || ch == RIGHT_PARENTHESIS) {
      this.Advance();
      aToken.mType = eCSSToken_URL;
      if (ch < 0) {
        this.AddEOFCharacters(eEOFCharacters_CloseParen);
      }
    } else {
      aToken.mType = eCSSToken_Bad_URL;
      if (aToken.mSymbol != 0) {
        // Flag us as having been a String, not a Bad_String.
        aToken.mInteger2 = 0;
      }
      this.ConsumeBadURLRemnants(aToken);
    }
  },

  ConsumeBadURLRemnants: function (aToken) {
    aToken.mInteger = aToken.mIdent.length;
    let ch = this.Peek();
    do {
      if (ch < 0) {
        this.AddEOFCharacters(eEOFCharacters_CloseParen);
        break;
      }

      if (ch == REVERSE_SOLIDUS && this.GatherEscape(aToken.mIdent, false)) {
        // Nothing else needs to be done here for the moment; we've consumed the
        // backslash and following escape.
      } else {
        // We always want to consume this character.
        if (IsVertSpace(ch)) {
          this.AdvanceLine();
        } else {
          this.Advance();
        }
        if (ch == 0) {
          aToken.mIdent.push(UCS2_REPLACEMENT_CHAR);
        } else {
          aToken.mIdent.push(ch);
        }
      }

      ch = this.Peek();
    } while (ch != RIGHT_PARENTHESIS);
  },

  /**
   * Primary scanner entry point.  Consume one token and fill in
   * |aToken| accordingly.  Will skip over any number of comments first,
   * and will also skip over rather than return whitespace and comment
   * tokens, depending on the value of |aSkip|.
   *
   * Returns true if it successfully consumed a token, false if EOF has
   * been reached.  Will always advance the current read position by at
   * least one character unless called when already at EOF.
   */
  Next: function (aToken, aSkip) {
    let ch;

    // do this here so we don't have to do it in dozens of other places
    aToken.mIdent = [];
    aToken.mType = eCSSToken_Symbol;

    this.mTokenOffset = this.mOffset;
    this.mTokenLineOffset = this.mLineOffset;
    this.mTokenLineNumber = this.mLineNumber;

    ch = this.Peek();
    if (IsWhitespace(ch)) {
      this.SkipWhitespace();
      aToken.mType = eCSSToken_Whitespace;
      return true;
    }
    if (ch == SOLIDUS && // !IsSVGMode() &&
        this.Peek(1) == ASTERISK) {
      this.SkipComment();
      aToken.mType = eCSSToken_Comment;
      return true;
    }

    // EOF
    if (ch < 0) {
      return false;
    }

    // 'u' could be UNICODE-RANGE or an identifier-family token
    if (ch == LATIN_SMALL_LETTER_U || ch == LATIN_CAPITAL_LETTER_U) {
      let c2 = this.Peek(1);
      let c3 = this.Peek(2);
      if (c2 == PLUS_SIGN && (IsHexDigit(c3) || c3 == QUESTION_MARK)) {
        return this.ScanURange(aToken);
      }
      return this.ScanIdent(aToken);
    }

    // identifier family
    if (IsIdentStart(ch)) {
      return this.ScanIdent(aToken);
    }

    // number family
    if (IsDigit(ch)) {
      return this.ScanNumber(aToken);
    }

    if (ch == FULL_STOP && IsDigit(this.Peek(1))) {
      return this.ScanNumber(aToken);
    }

    if (ch == PLUS_SIGN) {
      let c2 = this.Peek(1);
      if (IsDigit(c2) || (c2 == FULL_STOP && IsDigit(this.Peek(2)))) {
        return this.ScanNumber(aToken);
      }
    }

    // HYPHEN_MINUS can start an identifier-family token, a number-family token,
    // or an HTML-comment
    if (ch == HYPHEN_MINUS) {
      let c2 = this.Peek(1);
      let c3 = this.Peek(2);
      if (IsIdentStart(c2) || (c2 == HYPHEN_MINUS && c3 != GREATER_THAN_SIGN)) {
        return this.ScanIdent(aToken);
      }
      if (IsDigit(c2) || (c2 == FULL_STOP && IsDigit(c3))) {
        return this.ScanNumber(aToken);
      }
      if (c2 == HYPHEN_MINUS && c3 == GREATER_THAN_SIGN) {
        this.Advance(3);
        aToken.mType = eCSSToken_HTMLComment;
        aToken.mIdent = stringToCodes("-->");
        return true;
      }
    }

    // the other HTML-comment token
    if (ch == LESS_THAN_SIGN &&
        this.Peek(1) == EXCLAMATION_MARK &&
        this.Peek(2) == HYPHEN_MINUS &&
        this.Peek(3) == HYPHEN_MINUS) {
      this.Advance(4);
      aToken.mType = eCSSToken_HTMLComment;
      aToken.mIdent = stringToCodes("<!--");
      return true;
    }

    // AT_KEYWORD
    if (ch == COMMERCIAL_AT) {
      return this.ScanAtKeyword(aToken);
    }

    // HASH
    if (ch == NUMBER_SIGN) {
      return this.ScanHash(aToken);
    }

    // STRING
    if (ch == QUOTATION_MARK || ch == APOSTROPHE) {
      return this.ScanString(aToken);
    }

    // Match operators: ~= |= ^= $= *=
    let opType = MatchOperatorType(ch);
    if (opType != eCSSToken_Symbol && this.Peek(1) == EQUALS_SIGN) {
      aToken.mType = opType;
      this.Advance(2);
      return true;
    }

    // Otherwise, a symbol (DELIM).
    aToken.mSymbol = ch;
    this.Advance();
    return true;
  },
};

/**
 * Create and return a new CSS lexer, conforming to the @see CSSLexer
 * webidl interface.
 *
 * @param {String} input the CSS text to lex
 * @return {CSSLexer} the new lexer
 */
function getCSSLexer(input) {
  return new Scanner(input);
}

exports.getCSSLexer = getCSSLexer;

},{}],2:[function(require,module,exports){
const {
  normalizeTokenText,
  getSelectorOffset
} = require('./parsing-utils')

/**
 * This file contains a list of objects that contain information that are relevant to
 * model the CSS Object Model (CSSOM) from a target browser.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
 */

/**
 * Holds a information about a CSSMediaRule.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSMediaRule
 *
 * @property {string}  condition - The text of the condition of the rule.
 *                                   e.g. "@media screen and (min-width: 1200px)"
 * @property {array}   rules     - The rules that make up the media query.
 */
function MediaQueryRule() {
  this.condition = null;
  this.rules = null;
}

/**
 * Rule holds information about a CSSStyleRule.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule
 *
 * @property {string} selector         - The selector text for the rule
 *                                         e.g. "ul > li" or "#my-button.selected"
 * @property {object} offsets          - The text offsets of the stylesheet's entire
 *                                         text source.
 * @property {array}  offsets.selector - [begin, end] of the selector text.
 * @property {array}  offsets.text     - [begin, end] of the entire rule text, from the
 *                                         selector to the closing "}".
 * @property {array}  declarations     - The name/value style Declarations objects that
 *                                         make up the rule.
 */
function Rule(token) {
  // The selector text prettified.
  this.selector = normalizeTokenText(token)
  // Start and end text offsets in the stylesheet text.
  this.offsets = {
    selector: getSelectorOffset(token),
    text: getSelectorOffset(token),
  };
  // Array of declaration objects.
  this.declarations = null;
}

/**
 * Declarations holds information about a CSSStyleDeclaration.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
 * @param {object} - The initial token from the CSSLexer.
 *
 * @property {string} name          - The name of the declaration
 *                                      e.g. "margin" or "padding-top"
 * @property {string} value         - The value of the declaration
 *                                      e.g. "0px" or "1px solid red"
 * @property {object} offsets       - The text offsets of the stylesheet's entire
 *                                      text source.
 * @property {array}  offsets.text  - [begin, end] of the entire declaration
 * @property {array}  offsets.name  - [begin, end] of the entire name portion
 * @property {array}  offsets.value - [begin, end] of the entire value portion
 */
function Declaration({text, startOffset, endOffset}) {
  this.name = text;
  this.value = "";
  // this.priority = "";
  // this.terminator = "";
  // this.enabled = true;
  this.offsets = {
    // comment: null,
    text: [startOffset, endOffset],
    name: [startOffset, endOffset],
    value: [0, 0]
  };
}

module.exports = {
  MediaQueryRule,
  Rule,
  Declaration
}

},{"./parsing-utils":6}],3:[function(require,module,exports){
module.exports = `@charset "UTF-8";
/* CSS Document */
body {
  margin:0;
  font-family: 'Roboto', serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: normal;
  color: #444;
  background: #887 url('../images/responsive/back2.png');
}
.clearfix:before,
.clearfix:after {
	content:"";
	display:table;
}
.clearfix:after {
	clear:both;
}
.swiper-container {
	margin:0 auto;
	position:relative;
	overflow:hidden;
	-webkit-backface-visibility:hidden;
	-moz-backface-visibility:hidden;
	-ms-backface-visibility:hidden;
	-o-backface-visibility:hidden;
	backface-visibility:hidden;
	/* Fix of Webkit flickering */
	z-index:1;
}
.swiper-wrapper {
	position:relative;
	width:100%;
	-webkit-transition-property:-webkit-transform, left, top;
	-webkit-transition-duration:0s;
	-webkit-transform:translate3d(0px,0,0);
	-webkit-transition-timing-function:ease;

	-moz-transition-property:-moz-transform, left, top;
	-moz-transition-duration:0s;
	-moz-transform:translate3d(0px,0,0);
	-moz-transition-timing-function:ease;

	-o-transition-property:-o-transform, left, top;
	-o-transition-duration:0s;
	-o-transform:translate3d(0px,0,0);
	-o-transition-timing-function:ease;
	-o-transform:translate(0px,0px);

	-ms-transition-property:-ms-transform, left, top;
	-ms-transition-duration:0s;
	-ms-transform:translate3d(0px,0,0);
	-ms-transition-timing-function:ease;

	transition-property:transform, left, top;
	transition-duration:0s;
	transform:translate3d(0px,0,0);
	transition-timing-function:ease;

	-webkit-box-sizing: content-box;
	-moz-box-sizing: content-box;
	box-sizing: content-box;
}
.swiper-free-mode > .swiper-wrapper {
	-webkit-transition-timing-function: ease-out;
	-moz-transition-timing-function: ease-out;
	-ms-transition-timing-function: ease-out;
	-o-transition-timing-function: ease-out;
	transition-timing-function: ease-out;
	margin: 0 auto;
}
.swiper-slide {
	float: left;
}
.error-404 {
	text-align:center;
    padding: 15% 5%;
}
.error-404-title {
    font-size: 7em;
    margin-bottom: 0.3em;
}

.error-404-p {
    font-size: 2em;
    font-weight: 100;
    margin-top: 0;
}
/* IE10 Windows Phone 8 Fixes */
.swiper-wp8-horizontal {
	-ms-touch-action: pan-y;
}
.swiper-wp8-vertical {
	-ms-touch-action: pan-x;
}

.swiper-container {
	position:relative;
	width:100%;
	height: 700px;
	/* Specify Swiper's Size: */

	/*width:200px;
	height: 100px;*/
	padding: 10px 0;
	padding-bottom: 3em;
}
.swiper-pagination-switch {
  display: inline-block;
  width: 1em;
  height: 0.5em;
  border-radius: 0;
  background: #7C7C7C;
  margin-right: 0.6em;
  opacity: 1;
  cursor: pointer;
  margin-bottom: 0.4em;
  border-top: 0.2em solid #fff;
}
.swiper-visible-switch {
}
@media screen and (max-width:767px) {
	.swiper-pagination-switch {
		width: 0.8em;
		height: 0.8em;
		border-width: 2px;
		box-shadow: 0 0 5px rgba(0,0,0,0.6);
		margin-right: 0.4em;
	}
}
.swiper-pagination-switch:hover {
    background: #FFFFFF !important;
}
.wrapper {
  /* max-width:1200px; */
  background:#fff;
  margin:0 auto;
  position:relative;
  overflow: hidden;
}
#bannerHead {
  background:#000 url('/images/responsive/textured-header.jpg');
}
.shutter-header {
    background: fixed #000;
    background-position:center 0;
    height: 400px;
    overflow: hidden;
    background-repeat: no-repeat;
}
.shutter-title {
    color: #FFFFFF;
    position: relative;
    text-align: center;
    top: 25%;
    max-width: 1200px;
    margin: 0 auto;
}
.shutter-title-image {
    width: 60%;
    position: relative;
    /* max-width: 636px; */
}
.shutter-sprite {
  width:1816px;
  height:800px;
  right:100%;
  top:0;
  position:absolute;
}
.shutter-blocker {
  width:1200px;
  height:800px;
  background:#000;
  position:absolute;
  top:0;
  left:0;
}
.shutter-texture {
  background:url('../images/responsive/shutter.png');
  width:584px;
  height:800px;
  position:absolute;
  top:0;
  left:1200px;
}
a {
  text-decoration: underline;
  color: #009DFF;
}
a:hover {
    text-decoration: none;
    color: #005BFF;
}
h1, h2, h3, h4 {
  font-family: 'Arvo';
  font-weight: bold;
  margin:0;
  padding:0;
  line-height:normal;
}
h1 a, h2 a, h3 a, h4 a {
  color: #333;
}
h1 a:hover, h2 a:hover, h3 a:hover, h4 a:hover {
  color: #000;
  text-shadow: 0 0 5px #fff;
}
#navbar {
    max-width: 100%;
    overflow: hidden;
    position: relative;
    z-index: 100;
}
.leftImage {
    float: left;
    margin: 21px 10px 21px 0;
    width: 50%;
}
h1 {
	font-size: 3em;
	margin: 0.5em 0;
	letter-spacing: -.5px;
	line-height: 1.1;
	color: #555;
	text-shadow: 4px 4px 0 #eee;
	font-weight: bold;
	text-transform: uppercase;
}
.content > div > h1:first-child,
.content > div > h2:first-child,
.content > div > h4:first-child,
.content > div > h3:first-child {
	margin-top:0;
	padding-top:0;
}
h2 {
	margin: .5em 0;
	font-weight: bold;
	color: #888;
	text-shadow: 3px 3px 0px #eee;
	font-size: 1.75em;
}
.entry-full h2, .entry-full h3, .entry-full h4 {
    margin-top: 1.5em;
}
#menu {
    background: #555555;
}

.menu-sublinks-container  a {
    text-decoration: none;
}
#menuList > li {
    font-size: 1.2em;
    line-height: 1;
}
#menuList h1, #menuList h2, #menuList h3, #menuList h4 {
  padding-bottom: 14px;
    padding-top: 31px;
}
@media screen and (min-width:526px) {
	#menuList > li {
		font-size: 1.3em;
		letter-spacing: .05em;
	}
}
#menu > div {
}
.content {
  background: #e8e8e8;
}
.content img {
  max-width:100%;
  height: auto;
}
.entry {
  /* max-width:600px; */
  margin:0 auto;
  padding: 6% 6%;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
}
.entry-aside {
	padding: 5% 8%;
}
.entry-default-aside {
	background-color: #ddd;
}
.button {
    display: inline-block;
    padding: 0.3em 0.8em;
    background: #AAA9A9;
    color: #E9E9E9;
    font-family: 'Arvo';
    font-weight: bold;
    font-size: 1.6em;
    border-radius: 0.2em;
    margin: 0.3em;
    box-shadow: 0.1em 0.2em 0 rgba(0, 0, 0, 0.04);
    text-decoration: none;
    text-transform: uppercase;
}
.button:hover {
    background: #8F8F8F;
    color: #fff;
}
.button:before {
    font-family: 'icomoon'; speak: none;
    display: inline-block;
    padding-right: 0.5em;
    font-size: 1.2em;
    line-height: 1em;
    position: relative;
    top: 0.1em;
    -webkit-font-smoothing: antialiased;
}
.fork:before {
    content: "\e182";
}
.launch:before {
    content: "\e0fd";
}
@media screen and (min-width:768px) {
	.entry {
		width: 63%;
		float:left;
	}
	.entry-aside {
		width: 29%;
		float:right;
		padding: 2.5%;
	}
	.entry-aside-home {
		padding:14% 5% 0 0;
		width:36%;
	}
	.entry-paged:before {
		position: absolute;
		width: 33.1%;
		content: "";
		background: #999999;
		height: 540px;
		z-index: 0;
		top: 0;
		left: 0;
		max-width: 450px;
	}
}
@media screen and (min-width:1100px) {
	.entry-aside {
		padding: 1em 6% 0 6%;
	}
	.entry-aside-home {
		padding: 9% 5% 0 0;
		width:36%
	}
}
.entry-aside-home {
    text-align: center;
    box-sizing: border-box;
	-moz-box-sizing: border-box;
}
.content p {
  /* text-align:justify; */
}
.menu-links a {
    color: #eee;
    display: block;
    text-decoration: none;
    padding: 0.5em 0;
    display: inline-block;
}
#menu a > img {
  margin-right:5px;
}
#menu a:hover, #menu a:active {
  color: #fff;
  text-shadow: 3px 3px 0 rgba(0,0,0,.4);
}
#menu ul {
  margin:0;
  padding:0;
}
#menu li {
  list-style:none;
  margin: 0;
  padding: 0.6em 0;
  float: left;
  width: 33%;
  text-align: center;
  font-family: 'Arvo';
  font-weight: bold;
  text-transform: uppercase;
}
#menu li > div {
    /* border-left: 4px solid #e5e5e5; */
  border-left: 5px dotted #dedeff;
    font-size: 90%;
  margin: 8px 0 18px 6px;
  padding: 0 0 0 16px;
}
#menu li > div > div {
  font-size:100%;
  text-transform:none;
}
#middle {
  position:relative;
  background:#eee;
}
.videoThumb {
  position:relative;
}
.videoThumb h1, .videoThumb h2, .videoThumb h3, .videoThumb p  {
  background: rgba(0, 0, 0, 0.5);
  color: #FFFFFF;
  position: absolute;
  text-align: center;
  text-shadow: 0 0 5px #000000;
  top: 35%;
  width: 100%;
}
.videoThumb a:hover h1, .videoThumb a:hover h2, .videoThumb a:hover h3, .videoThumb a:hover p  {
  background: rgba(255, 255, 255, 0.5);
  color: #000;
  text-shadow: 0 0 5px #fff;
}
.gallery .img {
    height: 25%;
    width: 25%;
  float:left;
}
.gallery .img a img {
    border: 1px solid #000;
    height: auto;
    margin: 5% 0;
    width: 90%;
}
#footer {
  position:relative;
  background:#000;
  padding:30px 10%;
}
#footer p {
  position:relative;
  right:0;
  padding:0;
  margin:0;
  color:#fff;
  text-align:right;
}
#footer p a {
  color:#fff;
}
#footer p a:hover, #footer p a:active  {
  text-shadow:0 0 2px #fff;
}
#footer div {
  float:left;
  color:#666;
  position: relative;
  z-index: 1;
}
#footer div a {
	color: #fff;
}
.sub {
  text-align:right;
  margin-top:25px;
  color:#aaa;
  font-style:italic;
  font-size:10px;
}
.blogDescription {
  width:500px;
  background: rgba(0,0,0,0.9);
  color:#fff;
  top:0;
  left:0;
  display:none;
  position:absolute;
  padding:20px;
  border-radius:10px;
  border:2px solid #fff;
}
.blogDescription h1, .blogDescription h2, .blogDescription h3 {
  text-align:center;
  margin-bottom: 10px;
}
.blogDescription > div {
  overflow:hidden;
  max-height:600px;
}
.blogDescription img, .blogDescription iframe, .blogDescription object {
  max-width:500px;
  max-height:500px;
  height:auto;
  width:auto;
}
@media screen and (max-width: 800px) {
  .gallery .img {
    height: 33%;
    width: 33%;
  }

  .shutter-title {
    font-size:45px;
    padding:32px 50px;
  }

  .videoThumb h1 {
    font-size:24px;
  }

  .videoThumb h2 {
    font-size:18px;
  }


}
@media screen and (max-width: 525px) {
  h1 {font-size:30px;}

  #menu {
    float:none;
    margin-top:0;

    padding: 1em 0;
}

  .shutter-title-img {
    width:90%;
  }

  #largeScreen {
    display:none;
  }

  .content {
    width:100%;
    max-width:none;
  }

  #menu {
    top:0;
    left:0;
    position:relative;
    width:100%;
    max-width:none;
  }

  #footer div {
    width:100%;
    position:relative;
    float:none;
    text-align:center;
  }

  #footer p {
    text-align:center;
  }
}
@media screen and (max-width:350px) {
  .gallery .img {
    height: 50%;
    width: 50%;
  }
  .shutter-title {
    font-size:35px;
  }
}
.separator {
  clear:left !important;
}
#ArchiveList a {
  display:inline;
}
@media screen and (max-width: 800px) {
	.shutter-header {
		height:400px;
		background-image:url('../images/headers/sine-wave-md.jpg');
	}
}
@media screen and (min-width: 801px) {
	.shutter-header {
		height: 647px;
		background-image: url('../images/headers/sine-wave.jpg');
		background-size: cover;
	}
}
.home-sketches-header {
    background: #4d4d4d;
    padding: 3%;
    text-align: center;
    box-shadow: 0 0 50px rgba(0,0,0,0.5) inset;
}
h1.home-sketches-title {
    color: #e8e8e8;
    text-shadow: 2px 2px 0 #000;
    font-size: 3.1em;
    line-height: 1;
    letter-spacing: 0.05em;
}
.home-sketch img {
    width: 100%;
    height: auto;
    opacity: 1;

    -moz-transition: opacity .25s ease-in-out;
    -webkit-transition: opacity .25s ease-in-out;
    -ms-transition: opacity .25s ease-in-out;
	transition: opacity .25s ease-in-out;
}
.home-sketch img:hover {
    opacity: 0.8;
}
@media screen and (max-width:767px) {
	h1.home-sketches-title {
		font-size: 1.4em;
		line-height: 1.3;
	}
}
.home-sketch {
	max-width:450px;
	margin:0 auto;
    text-align: center;
    padding-bottom: 3%;
}
.home-sketch > h2 {
    font-family: 'Arvo';
    font-weight: normal;
    font-size: 1em;
    padding: 1em 0.5em 2%;
    margin: 0;
}
.home-sketch > h2 > a {
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    display: block;
    overflow: hidden;
    color: #4e4e50;
    text-shadow: none;
    text-decoration: none;
}
.home-sketch p {
    color: #a0a0a0;
    margin: 0;
    text-transform: uppercase;
    font-size: 0.8em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.home-sketch p a {
	color: #a0a0a0;
	text-decoration:none;
}
.home-sketch p a:hover {
	color: #000;
	text-decoration:none;
}
@media screen and (min-width:450px) and (max-width:767px) {
	.home-sketch {
		background-color: #fff;
		margin: 3em auto !important;
		border-radius: 0.4em;
		box-shadow: 0 0 1em rgba(0, 0, 0, 0.19);
		overflow: hidden;
	}
}
@media screen and (min-width:768px) {
	.home-sketch {
		width: 25%;
		float: left;
	}
}
.tag-list a {
    display: inline-block;
    color: #EBEBEB;
    background: #B9B9B9;
    margin-right: 0.5em;
    margin-bottom: 0.5em;
    padding: 0.1em 0.5em 0.2em;
    border-radius: 0.25em;
    font-size: 0.9em;
    text-decoration: none;
}
.tag-list a:before {
    content: "\e028";
    font-family: 'icomoon';
    margin-right: 0.4em;
    position: relative;
    top: 0.1em;
}
.tag-list a:hover {
    background: #9E9E9E;
    color: #fff;
}
.tag-list {
    margin: 1em 0;
}
.category-list a {
    color: #CCCCCC;
    font-weight: 800;
    display: inline-block;
    padding-right: 0.4em;
    font-size: 1.4em;
    padding-left: 0.1em;
    /* top: 0.1em; */
    position: relative;
    text-decoration: none;
}
.single-footer {
	border-top: 2px dashed #D3D1D1;
	margin-top: 3em;
}
.category-list {
    font-family: 'Arvo'; font-weight: normal;
    font-size: 1.3em; padding: 0; position: relative;
    font-weight: 100; text-transform: uppercase;
    color: #D3D3D3;
    margin: 0.5em 0 1em;
    letter-spacing: 0.03em;
}
.category-list span {
    font-size: 1.4em;
    position: relative;
    top: 0.2em;
    display: inline-block;
    padding: 0 0.2em;
}
.entry-default {
    margin: 2% auto;
    width: 70%;
    font-size: 1.2em;
    line-height: 1.9;
    padding: 3% 5%;
    max-width: 800px;
}
.posts-listing-title {
    font-size: 2em;
    color: #999;
    text-shadow: none;
    letter-spacing: 0.05em;
    padding-bottom: 1em;
}
a.post-listing-header-link {
	color:#eee;
	font-family: 'Arvo';
	text-transform: uppercase;
	font-weight: bold;
	font-size: 0.9em;
	line-height: 0;
	letter-spacing: 0.015em;
	text-decoration: none;
}
a.post-listing-header-link:hover {
	color:#fff;
	text-shadow:none;
}
.posts-listing {
    text-align: center;
    overflow: visible;
    margin: 2.5%;
}
.post-listing-entry h2 {
    font-family: 'Arvo';
    font-weight: normal;
    font-size: 1.2em;
    margin-bottom: 0;
}
.post-listing-entry p {
    margin: 2em;
    margin-top: 0.3em;
    text-transform: uppercase;
    font-size: 0.75em;
    color: #aaa;
}
.post-listing-entry h2 a {
    color: #888;
    text-shadow: none;
}
.post-listing-entry img {
    opacity: 0.6;
    -moz-transition: opacity .25s ease-in-out;
    -webkit-transition: opacity .25s ease-in-out;
    -ms-transition: opacity .25s ease-in-out;
	transition: opacity .25s ease-in-out;
}
.post-listing-entry img:hover {
    opacity: 1;
}
.post-listing-footer a {
    font-size: 2em; color: #999; text-shadow: none; letter-spacing: 0.05em; padding-bottom: 1em;
    font-weight: 800;
    line-height: 1;
    font-family: 'Arvo'; font-weight: normal;
    text-decoration: none;
    font-weight: bold;
    text-transform: uppercase;
}
.post-listing-footer {
    margin: 3%;
    text-align: center;
}
.post-listing-footer a:hover {
    color: #777;
}
.post-listing-subtitle {
    display: block;
    font-family: 'Arvo';
    font-size: 0.6em;
    padding-bottom: 0.1em;
    letter-spacing: 0;
    text-transform: none;
    font-weight: normal;
}
.post-listing-icon {
    font-size: 1.5em;
    position: relative;
    top: 0.2em;
    padding-right: 0.1em;
    line-height: 0;
}
@media screen and (max-width:767px) {
	.entry-default-aside {
		display:none;
	}
	.entry-full, .entry-default {
		width: 92%;
		float:none;

		padding: 4%;
	}
	a.post-listing-header-link {
		font-size: 0.6em;
	}
	.entry-paged {
		margin: 3%;
		box-shadow: 0 0 0.2em rgba(0, 0, 0, 0.16);
		border-radius: 0.4em;
		overflow: hidden;
		background: #F5F5F5 !important;
		border: 2px solid #9B9B9B;
	}
}
.entry-paged-thumb {
    float: left;
    width: 33%;
    max-width: 450px;
    margin: 0 3% 0 0;
    line-height: 0;
	background-color: #999999;
    position: relative;
    text-align: center;
    z-index: 10;
}
.entry-paged {
    position: relative;
    overflow: hidden;
}
.entry-paged > * {
    position: relative;
}
.entry-paged h2 {
    padding-top: 3%;
    margin: 0;
    font-size: 2.5em;
    margin-right: 6%;
    text-transform: uppercase;
    line-height: 1;
}
.entry-paged h2 a {
    text-decoration: none;
}

.entry-paged:nth-child(even) {
	background:#ddd;
}
@media screen and (max-width:767px) {
	.entry-paged-thumb {
		float: none;
		width:100%;
		margin:0 auto;
		max-width: none;
	}
	.entry-paged h2, .entry-paged p {
		margin-left: 7%;
		margin-right: 7%;
		margin-top: 0.5em;}
	.entry-paged h2 {
		text-align:center;
		font-size:2em;
		margin: 0.2em 7% 0.4em;
	}
}
@media screen and (min-width:768px) {
	.entry-paged > * {
		margin-left:36%;
	}
	.entry-paged > .entry-paged-thumb {
		margin-left:0;
	}
}
@media screen and (min-width:768px) and (max-width:1150px) {
	@media screen and (min-width:768px) and (max-width:1150px) {
	    .entry-paged h2 {
	        font-size:1.8em;
	    }
	}
}
.next-prev {
    background: #4d4d4d;  text-align: center; box-shadow: 0 0 50px rgba(0,0,0,0.5) inset;
}
.next-prev a {
    color: #fff;
    font-family: 'Arvo';
    font-size: 3em;
    padding: 0.6em;
    display: inline-block;
}
.next-prev a:hover {
    text-decoration: underline;
}
@media screen and (max-width:767px) {
	.next-prev a {
		font-size:1.5em;
	}
}
.right {
    float: right;
}
.left {
    float: left;
}
.menu-logo {
    width: 192px;
    position: absolute;
    padding-left: 45px;
    padding-top: 5px;
    left: 0;
    top: 0;
}
.menu-logo img {
    width: 100%;
    height: auto;
}
.menu-links {
    margin-left: 274px;
    background: rgba(255,255,255,0.1);
}

@media screen and (max-width:767px) {
	.menu-logo {
		width: 100%;
		position: relative;
		padding: 9px 20px 7px;
		margin: 0 auto;
		max-width: 215px;
	}
	.menu-links {
		margin: 0;
	}
}
.menu-sublinks {
    list-style-type: none;
    margin: 0 auto;
    padding: 0;
    position: relative;
    transform: translateY(-100px);
    opacity: 0;
    transition: opacity 1000ms, transform 1000ms;
}
#menu-the-works, #menu-animations {
	text-align: center;
    line-height: 1.1;
    font-size: 20px;
	height: 400px;
    letter-spacing: 0.02em;
}
#menu-animations {
    max-width: 1000px;
}
#menu-the-works {
    max-width: 1200px;
}
#menu-the-works a:hover, #menu-animations a:hover {
    color: #333;
}
.menu-sublinks-container {
	height: 0;


	overflow:hidden;
}
.menu-sublinks-container.open {
	height: auto;
}
.menu-sublinks-container.open .menu-sublinks {
    opacity: 1;
    transform: translateY(0);
}
.menu-the-works-submenu-container {
	height:393px;

	border-bottom: #444 7px solid;

    box-shadow: 0 0 100px 15px rgba(0,138,255,0.3) inset;

    background: #ffffff; /* Old browsers */	 /* FF3.6+ */ /* Chrome,Safari4+ */ /* Chrome10+,Safari5.1+ */ /* Opera 11.10+ */ /* IE10+ */
	background: linear-gradient(to bottom, #ffffff 0%,#c2e3ff 100%); /* W3C */ /* IE6-9 */
}
.menu-animations-submenu-container {
	height:393px;

	border-bottom: #444 7px solid;

    box-shadow: 0 0 100px 15px rgba(0,138,255,0.3) inset;

    background: #4eaefa;
	background: -moz-linear-gradient(top,  #4eaefa 0%, #364eca 100%);
	background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#4eaefa), color-stop(100%,#364eca));
	background: -webkit-linear-gradient(top,  #4eaefa 0%,#364eca 100%);
	background: -o-linear-gradient(top,  #4eaefa 0%,#364eca 100%);
	background: -ms-linear-gradient(top,  #4eaefa 0%,#364eca 100%);
	background: linear-gradient(to bottom,  #4eaefa 0%,#364eca 100%);
	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4eaefa', endColorstr='#364eca',GradientType=0 );

}
.menu-links-home {
    margin-left: 0;
}
.menu-sublinks > li {
    position: absolute;
    text-transform: uppercase;
    font-family: 'Arvo';
    font-weight: bold;
    font-size: 1.5em;
	text-shadow: 1px 4px 0 rgba(0,0,0,0.1);

	-webkit-transition: 800ms -webkit-transform ease-in-out;
    -moz-transition: 800ms -moz-transform ease-in-out;
    -ms-transition: 800ms -ms-transform ease-in-out;
	transition: 800ms transform ease-in-out;
}
.close .menu-sublinks li {
	-webkit-transform: rotate(0deg) !important;
	-moz-transform: rotate(0deg) !important;
	-ms-transform: rotate(0deg) !important;
	transform: rotate(0deg) !important;
}
.menu-animations-submenu-container li {
	text-shadow: 4px 5px 0 rgba(0,0,0,0.3);
}
/* The Works Sub-Menu */
#menu-item-808 {
    top: 55%;
    left: 34%;
    width: 12em;

    -moz-transform: rotate(-8deg);
	-webkit-transform: rotate(-8deg);
	-ms-transform: rotate(-8deg);
	transform: rotate(-8deg);

	-moz-transition-duration: 1050ms;
    -webkit-transition-duration: 1050ms;
    -ms-transition-duration: 1050ms;
	transition-duration: 1050ms;
    font-size: 1.3em;
}
#menu-item-811 {
    top: 22%;
    left: 50%;
    width: 7em;

    -webkit-transform: rotate(13deg);
	-moz-transform: rotate(13deg);
	-ms-transform: rotate(13deg);
	transform: rotate(13deg);

	-webkit-transition-duration: 1150ms;
    -moz-transition-duration: 1150ms;
    -ms-transition-duration: 1150ms;
    transition-duration: 1150ms;

    font-size: 1.8em;
}
#menu-item-812 {
    top: 41%;
    left: 7%;

    -webkit-transform: rotate(-8deg);
	-moz-transform: rotate(-8deg);
	-ms-transform: rotate(-8deg);
	transform: rotate(-8deg);

	-webkit-transition-duration: 600ms;
	-moz-transition-duration: 600ms;
	-ms-transition-duration: 600ms;
	transition-duration: 600ms;

    font-size: 1.9em;
}
#menu-item-813 {
    top: 74%;
    left: 19%;
    -webkit-transform: rotate(12deg);
	-moz-transform: rotate(12deg);
	-ms-transform: rotate(12deg);
	transform: rotate(12deg);

	-webkit-transition-duration: 800ms;
    -moz-transition-duration: 800ms;
    -ms-transition-duration: 800ms;
    transition-duration: 800ms;

    font-size: 1.7em;
}
#menu-item-814 {
    top: 24%;
    left: 26%;
    width: 12em;
    -webkit-transform: rotate(16deg);
	-moz-transform: rotate(16deg);
	-ms-transform: rotate(16deg);
	transform: rotate(16deg);

	-webkit-transition-duration: 1200ms;
    -moz-transition-duration: 1200ms;
    -ms-transition-duration: 1200ms;
    transition-duration: 1200ms;

	font-size: 1em;
}
#menu-item-810 {
  top: 63%;
  left: 63%;
  width: 7em;

  -webkit-transform: rotate(-11deg);
  -moz-transform: rotate(-11deg);
  -ms-transform: rotate(-11deg);
  transform: rotate(-11deg);

  -webkit-transition-duration: 1000ms;
  -moz-transition-duration: 1000ms;
  -ms-transition-duration: 1000ms;
  transition-duration: 1000ms;

  font-size: 2.2em;
}
#menu-item-808 a {
    color: #c54041;
}
#menu-item-810 a {
    color: #e97c28;
}
#menu-item-811 a {
    color: #b82e4a;
}
#menu-item-812 a {
    color: #9e005d;
}
#menu-item-813 a {
    color: #c54041;
}
#menu-item-814 a {
    color: #ee9029;
}
/* Animation Sub-Menu */
#menu-item-815 {
    top: 27%;
    -webkit-transform: rotate(8deg);
    -moz-transform: rotate(8deg);
    -ms-transform: rotate(8deg);
    transform: rotate(8deg);
    left: 10%;
}
#menu-item-816 {
    right: 5%;
    bottom: 11%;
    width: 11em;
    -webkit-transform: rotate(7deg);
	-moz-transform: rotate(7deg);
	-ms-transform: rotate(7deg);
	transform: rotate(7deg);
}
#menu-item-817 {
    top: 65%;
    left: 7%;
    width: 8em;
    font-size: 1.8em;
    -webkit-transform: rotate(-9deg);
	-moz-transform: rotate(-9deg);
	-ms-transform: rotate(-9deg);
	transform: rotate(-9deg);
}
#menu-item-818 {
    top: 38%;
    right: 10%;
    font-size: 3em;
    -webkit-transform: rotate(-12deg);
	-moz-transform: rotate(-12deg);
	-ms-transform: rotate(-12deg);
	transform: rotate(-12deg);
}
#menu-item-815 a {
    color: #A0DEFF;
}
#menu-item-816 a {
    color: #c2e3ff;
}
#menu-item-817 a {
    color: #00c3ff;
}
#menu-item-818 a {
    color: #009dff;
}

/* Tag cloud responsive sizing */
@media screen and (max-width:400px) {
	#menu-the-works, #menu-animations {
		font-size: 9px;
	}
	#menu-the-works li, #menu-animations li {
		margin-left: -3%;
	}
}
@media screen and (min-width:401px) and (max-width:550px) {
	#menu-the-works, #menu-animations {
		font-size: 13px;
	}
	#menu-the-works li, #menu-animations li {
		margin-left: -3%;
	}
}
@media screen and (min-width:551px) and (max-width:767px) {
	#menu-the-works, #menu-animations {
		font-size: 17px;
	}
	#menu-the-works li, #menu-animations li {
		margin-left: -3%;
	}
}
/* Menu Arrows */
#menu-item-763 a, #menu-item-803 a {
    padding-left: 1em;
    position: relative;
}
#menu-item-763 a:after, #menu-item-803 a:after {
    content: "";
    position: absolute;
    width: 0px;
    top: 0;
    left: 0;
    margin-top: 0.6em;
    height: 0px; border-style: solid;
    border-width: 0.4em 0 0.4em 0.4em;
    border-color: transparent transparent transparent #fff;
}
#menu-item-763 a.open:after, #menu-item-803 a.open:after {
    margin-top: 0.8em;
    border-width: 0.4em 0.4em 0 0.4em;
    border-color: #fff transparent transparent transparent;
    left: -0.3em;
}
.full-featured-image {
    padding: 5%;
    padding-top: 4%;
    box-shadow: 0 0 1em rgba(0, 0, 0, 0.33) inset;
    overflow: hidden;
    border-top: 0.3em solid #818181;
    text-align: center;
    background: #444;
    background: linear-gradient(45deg,  #353535 0%,#666666 100%);
}
.full-featured-image-img {
    box-shadow: 0 0 1.3em rgba(0, 0, 0, 0.39);
    width: 100%;
}
.full-featured-image-title {
    color: #C2C2C2;
    text-shadow: 4px 4px 0 rgba(255, 255, 255, 0.08);
    font-size: 3.2em;
    margin-top: 0;
    margin-bottom: 0.9em;
}
.featured-video {
    background-color: #333;
    padding: 4% 6%;
    overflow: hidden;
    text-align: center;
    border-top: 0.7em solid #272727;
    border-bottom: 0.7em solid #555;
}
.featured-video-title {
	color: #D1D1D1;
	font-weight: normal;
	text-shadow: 0.13em 0.13em 0 rgba(0, 0, 0, 0.28);
	text-align: center;
	margin-top: 0;
	margin-bottom: 1em;
}
.featured-video video {
    max-width: 100%;
    height: auto;
    box-shadow: 0 0.1em 1em rgba(0, 0, 0, 0.55);
}
@media (min-width:1000px) {
	.featured-video video {
		box-shadow: 0 0.1em 2em rgba(0, 0, 0, 0.79);
	}
}
.vine {
	width: 100%;
	max-width: 600px;
	height: 600px;
	border: none;
}
.big-gallery-selector {
    background-color: #444;
    padding: 0;
    box-shadow: inset 0 0 200px rgba(0, 0, 0, 0.62);
    overflow: hidden;
	padding-bottom: 4%;
}
.big-gallery-thumbs .swiper-visible-switch {
}
.big-gallery-thumbs .swiper-active-switch {
    background: #C8C8C8;
    border-top-width: 0.3em;
}
.big-gallery-slide.swiper-slide-active {
    opacity: 1;
    -webkit-transform: scale(1);
}
.big-gallery-page-left, .big-gallery-page-right {
	background: #B9B9B9;
	width: 3em;
	height: 3em;
	border-radius:1.5em;
	overflow: hidden;
	text-indent: -300px;
	position:absolute;
	top:50%;
	margin-top: -1.5em;
	-webkit-transition:-webkit-transform 200ms;
	   -moz-transition:-moz-transform 200ms;
	    -ms-transition:-ms-transform 200ms;
	     -o-transition:-o-transform 200ms;
	        transition:transform 200ms;
	-webkit-transform:scale(1);
	   -moz-transform:scale(1);
	    -ms-transform:scale(1);
	     -o-transform:scale(1);
	        transform:scale(1);
	-webkit-transition-timing-function:;
	   -moz-transition-timing-function:;
	    -ms-transition-timing-function:;
	     -o-transition-timing-function:;
	        transition-timing-function:;
}
.big-gallery-page-left:hover, .big-gallery-page-right:hover {
	-webkit-transform:scale(1.2);
	   -moz-transform:scale(1.2);
	    -ms-transform:scale(1.2);
	     -o-transform:scale(1.2);
	        transform:scale(1.2);
}
.big-gallery-page-right {
	right: 2%;
}
.big-gallery-page-left {
	left: 2%;
}
.big-gallery-page-left:after, .big-gallery-page-right:after {
	content:"";
	position: absolute;
	top: 0.55em;
	width: 0; height: 0;
	border-style: solid;
}
.big-gallery-page-left:after {
	border-width: 1em 1em 1em 0;
	border-color: transparent #888 transparent transparent;
	left: 0.8em;
}
.big-gallery-page-right:after {
	border-width: 1em 0 1em 1em;
	border-color: transparent transparent transparent #888;
	left: 1.2em;
}
.big-gallery-selector-title {
	color: #D1D1D1;
	font-weight: normal;
	text-shadow: 4px 4px 0 rgba(255, 255, 255, 0.19);
	text-align: center;
}
.big-gallery-slide {
	opacity: 0.3;
	-webkit-transition: opacity 500ms;
	   -moz-transition: opacity 500ms;
	    -ms-transition: opacity 500ms;
	     -o-transition: opacity 500ms;
	        transition: opacity 500ms;

}
.big-gallery-slide.swiper-slide-active {
	opacity: 1;
}
.big-gallery-slide img {
	margin:0 2em;
	box-shadow: 0 0 2em rgba(0, 0, 0, 0.43);
}
.big-gallery-thumbs {
	text-align:center;
	bottom:0;
	width:100%;
	position:absolute;
}
@media screen and (max-width:399px)		{
	.big-gallery-slide img {
		margin: 0 0.5em;
	}
	.big-gallery-page-left, .big-gallery-page-right {
		display:none;
	}
}
@media screen and (max-width:599px)		{ .big-gallery-slide img { max-width:320px; max-height:180px; } .big-gallery-swiper { height:180px;} }
@media screen and (min-width:600px)		{ .big-gallery-slide img { max-width:500px; max-height:281px; } .big-gallery-swiper { height:281px;} }
@media screen and (min-width:800px)		{ .big-gallery-slide img { max-width:700px; max-height:393px; } .big-gallery-swiper { height:393px;} }
@media screen and (min-width:1000px)	{ .big-gallery-slide img { max-width:850px; max-height:478px; } .big-gallery-swiper { height:478px;} }
@media screen and (min-width:1200px)	{ .big-gallery-slide img { max-width:950px; max-height:534px; } .big-gallery-swiper { height:534px;} }

@media screen and (min-width:768px) and (max-width:1000px) {
    .big-gallery-page-right {
        right: 3%;
    }
    .big-gallery-page-left {
        left: 3%;
    }
}
@media screen and (max-width:767px) {
	.big-gallery-swiper {
	    height: 303px;
	}
	.big-gallery-slide {
		height:200px;
	}
	.big-gallery-page-left, .big-gallery-page-right {
		font-size: 0.7em;
	    top: 50%;
	}
}
@media screen and (max-width:599px) {
	.big-gallery-swiper {
		height: 190px;
	}
}
`

},{}],4:[function(require,module,exports){
const parseStylesheet = require('./parse-stylesheet');

;(function main() {
  const stylesheet = require('./data/stylesheet')
  addToDom(stylesheet)

  console.time("parseStylesheet")
  const rules = parseStylesheet(stylesheet)
  console.timeEnd("parseStylesheet")

  debugOutputRules(rules)

  console.log(rules)
  window.rules = rules;
})();

function debugOutputRules (rules) {
  console.log('-------------------------------------')
  rules.forEach(rule => {
    if (rule.declarations) {
      console.log('CSS Rule:', rule.selector)
      console.table(rule.declarations.map(({name, value}) => ([name, value])))
    } else {
      console.log('CSS Media Query Found', rule.condition)
      debugOutputRules(rule.rules)
    }
  })
}

function addToDom(stylesheet) {
  const pre = document.createElement('pre')
  pre.innerText = stylesheet;
  Object.assign(pre.style, {
    position: "absolute",
    top: "5em",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "2em",
    overflow: "scroll",
    backgroundColor: '#222',
    color: '#ddd',
    margin: 0
  });
  document.body.appendChild(pre);
}

},{"./data/stylesheet":3,"./parse-stylesheet":5}],5:[function(require,module,exports){
const {getCSSLexer} = require('./css-lexer')

const {
  skipWhitespace,
  findSemicolon,
  findToken,
  getText,
  normalizeTokenText,
  getSelectorOffset
} = require('./parsing-utils');

const {
  MediaQueryRule,
  Rule,
  Declaration
} = require('./css-structs');

/**
 * This file collects all of the functions that parse a stylesheet's text into a
 * data structure. The data structure is made up of objects from ./css-structs.js.
 */
function parseStylesheet(styleSheetText) {
  const lexer = getCSSLexer(styleSheetText);
  return parseRules(lexer)
}

module.exports = parseStylesheet;

function parseRules(lexer) {
  const rules = []

  while (token = skipWhitespace(lexer)) {
    // This is a media query
    if (token.tokenType === "at") {
      if (token.text == "media") {
        rules.push(parseMediaQuery(token, lexer));
      } else {
        // Skip until the next semi-colon for cases like `@charset "UTF-8";`
        findSemicolon(lexer)
      }
      continue;
    }

    // End of a media query, bail out on this loop.
    if (token.tokenType === "symbol" && token.text === "}") {
      break;
    }

    // A new rule was found
    if (token.tokenType === "ident" ||
        token.tokenType === "id" ||
        token.tokenType === "symbol") {
      rules.push(parseSingleRule(token, lexer));
    }
  }
  return rules;
}

function parseSingleRule(token, lexer) {
  const rule = new Rule(token);
  token = parseSelector(token, lexer, rule);
  rule.declarations = parseDeclarations(token, lexer);
  return rule
}

function parseSelector(token, lexer, rule) {
  let prevToken = token;

  while(token = skipWhitespace(lexer)) {
    const {tokenType, text, endOffset} = token;

    if (tokenType === "symbol") {
      if (text === "{") {
        break;
      }
    }
    if (tokenType === "ident" || tokenType === "id" || tokenType === "symbol") {
      const spacer = (
          token.text === "," ||
          token.text === ":"  ||
          prevToken.text === ":" ||
          prevToken.text === "."
        ) ? "" : " ";
      rule.selector += spacer + normalizeTokenText(token);
      rule.offsets.selector[1] = endOffset;
    }
    prevToken = token;
  }
  // Return the opening bracket token.
  return token
}

function parseDeclarations(token, lexer) {
  const declarations = [];
  // Bail out if the next token isn't "{".
  if (!token || token.text !== "{") {
    return token;
  }
  token = skipWhitespace(lexer)
  while (token.text !== "}" && token.tokenType !== "symbol") {
    if (token.tokenType === "ident") {
      declarations.push(parseSingleDeclaration(token, lexer))
    } else if (token.tokenType === "comment") {
      // TODO
    } else {
      throw new Error("Unable to parse declarations");
    }
    token = skipWhitespace(lexer)
  }
  return declarations;
}

function parseSingleDeclaration(token, lexer) {
  const declaration = new Declaration(token);
  const colon = skipWhitespace(lexer)
  if (colon.tokenType !== "symbol" || colon.text !== ":") {
    throw new Error("Unable to parse a declaration");
  }
  const valueStart = skipWhitespace(lexer)
  const valueEnd = findSemicolon(lexer);
  if (!valueStart || !valueEnd) {
    throw new Error("Unable to parse declaration");
  }
  declaration.offsets.text[1] = valueEnd.endOffset;
  const valueOffset = declaration.offsets.value;
  valueOffset[0] = valueStart.startOffset;
  valueOffset[1] = valueEnd.startOffset;
  declaration.value = getText(lexer, valueOffset)
  return declaration
}

function parseMediaQuery (token, lexer) {
  const mediaQueryRule = new MediaQueryRule();
  mediaQueryRule.condition = parseMediaQueryCondition(token, lexer);
  mediaQueryRule.rules = parseRules(lexer);
  return mediaQueryRule;
}

function parseMediaQueryCondition (token, lexer) {
  let condition = "@media";
  let prevToken = token;
  while(token = skipWhitespace(lexer)) {
    const {tokenType, text, endOffset} = token;

    if (tokenType === "symbol") {
      if (text === "{") {
        break;
      }
    }
    if (tokenType === "ident" || tokenType === "symbol" || tokenType === "dimension") {
      const spacer = (
        token.text === "," ||
        token.text === ":" ||
        token.text === ")" ||
        prevToken.text === "("
      ) ? "" : " ";
      condition += spacer + normalizeTokenText(token);
    }
    prevToken = token;
  }
  return condition
}

},{"./css-lexer":1,"./css-structs":2,"./parsing-utils":6}],6:[function(require,module,exports){
function skipWhitespace(lexer) {
  return findToken(lexer, token => token.tokenType !== "whitespace");
}

function findSemicolon(lexer) {
  return findToken(lexer, token => token.tokenType === "symbol" && token.text === ";")
}

function findToken(lexer, condition) {
  while(token = lexer.nextToken()) {
    if (condition(token)) {
      return token;
    }
  }
  return undefined;
}

function getText(lexer, offset) {
  return lexer.mBuffer.substring(...offset)
}

function normalizeTokenText(token) {
  switch (token.tokenType) {
    case "id":
      return "#" + token.text;
      break;
    case "dimension":
      return token.number + token.text;
    case "number":
      return "" + token.number;
    default:
      return token.text;
  }
}

function getSelectorOffset(token) {
  let offsetTweak = 0;
  switch (token.tokenType) {
    case "id":
      return "#" + token.text;
      break;
  }
  return [offsetTweak + token.startOffset, token.endOffset]
}

module.exports = {
  skipWhitespace,
  findSemicolon,
  findToken,
  getText,
  normalizeTokenText,
  getSelectorOffset
}

},{}]},{},[4]);
