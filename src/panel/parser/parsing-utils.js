// @flow
/* Assignment in a while condition makes token parsing easier. */
/* eslint-disable no-cond-assign */
import type { Rule, IndentationStrategy } from '../types/css';
import type {
  Lexer,
  WhitespaceToken,
  Token,
  TextOffset,
} from '../types/parsing';

type TokenAndPrevious = { token: Token | null, previousToken: Token | null };
type TokensWithWhitespace = {
  token: Token | null,
  previousToken: Token | null,
  whitespaceToken: WhitespaceToken | null,
};

function skipWhitespace(
  lexer: Lexer,
  previousToken: Token | null
): TokensWithWhitespace {
  return captureWhitespace(
    previousToken,
    findToken(lexer, previousToken, token => token.tokenType !== 'whitespace')
  );
}

function captureWhitespace(
  startingToken: Token | null,
  { token, previousToken }: TokenAndPrevious
): TokensWithWhitespace {
  const whitespaceToken =
    previousToken && previousToken.tokenType === 'whitespace'
      ? previousToken
      : null;
  return {
    token,
    previousToken: whitespaceToken ? startingToken : previousToken,
    whitespaceToken,
  };
}

function findSemicolon(
  lexer: Lexer,
  previousToken: Token | null
): TokenAndPrevious {
  return findToken(lexer, previousToken, token => {
    return token.tokenType === 'symbol' && token.text === ';';
  });
}

function findDeclarationClose(
  lexer: Lexer,
  previousToken: Token | null
): TokensWithWhitespace {
  return findTokenCaptureWhitespace(lexer, previousToken, isDeclarationClose);
}

function isDeclarationClose(token: Token | null): boolean {
  return (
    !token ||
    (token.tokenType === 'symbol' && (token.text === ';' || token.text === '}'))
  );
}

function findTokenCaptureWhitespace(
  lexer: Lexer,
  previousToken: Token | null,
  condition: Token => boolean
): TokensWithWhitespace {
  let whitespaceToken = null;
  while (true) {
    const token = lexer.nextToken();
    if (!token) {
      return { token, previousToken, whitespaceToken };
    }
    if (token.tokenType === 'whitespace') {
      whitespaceToken = token;
      continue;
    }
    if (condition(token)) {
      return { token, previousToken, whitespaceToken };
    }
    previousToken = token;
  }
  // eslint-disable-next-line
  throw new Error('Flow complains about implicitly returned undefined.');
}

function findToken(
  lexer: Lexer,
  previousToken: Token | null,
  condition: Token => boolean
): TokenAndPrevious {
  while (true) {
    const token = lexer.nextToken();
    if (!token) {
      return { token, previousToken };
    }
    if (condition(token)) {
      return { token, previousToken };
    }
    previousToken = token;
  }
  // eslint-disable-next-line
  throw new Error('Flow complains about implicitly returned undefined.');
}

function getOffsetText(lexer: Lexer, offset: TextOffset): string {
  return lexer.mBuffer.substring(...offset);
}

function getTokenText(lexer: Lexer, token: Token | null): string {
  if (!token) {
    return '';
  }
  const { startOffset, endOffset } = token;
  return lexer.mBuffer.substring(startOffset, endOffset);
}

function normalizeTokenText(token: Token): string {
  switch (token.tokenType) {
    case 'id':
      return '#' + token.text;
    case 'dimension':
      return token.number + token.text;
    case 'number':
      return '' + token.number;
    default:
      // Bully past Flow and get any possible text from the object.
      return (token: Object).text || '';
  }
}

function getSelectorOffset(token: Token): TextOffset {
  let offsetTweak = 0;
  if (token.tokenType === 'id') {
    // This token does not include the '#', so move the offset back to capture it.
    offsetTweak = -1;
  }
  return [offsetTweak + token.startOffset, token.endOffset];
}

const matchEndingSpacesOrTabs = /[ \t]*$/;
const matchAllSpaces = /^[ ]+$/;
const matchAllTabs = /^[ ]+$/;
const SPACE = ' ';
const TWO_SPACES = '  ';
const FOUR_SPACES = '    ';
const TAB = '	';

function determineIndentionStrategy(rule: Rule): IndentationStrategy {
  const selectorIndentResult = rule.whitespace.beforeSelector.match(
    matchEndingSpacesOrTabs
  );
  const selectorIndent = selectorIndentResult ? selectorIndentResult[0] : '';
  const firstDeclaration = rule.declarations[0];

  let indentationUnit = TWO_SPACES;
  let declarationIndent = indentationUnit;

  if (firstDeclaration) {
    declarationIndent = firstDeclaration.whitespace.beforeName.match(
      matchEndingSpacesOrTabs
    );
    declarationIndent = declarationIndent ? declarationIndent[0] : '';

    const selectorIsSpaces = matchAllSpaces.test(selectorIndent);
    const selectorIsTabs = matchAllTabs.test(selectorIndent);
    const declarationIsSpaces = matchAllSpaces.test(declarationIndent);
    const declarationIsTabs = matchAllTabs.test(declarationIndent);

    if (selectorIsSpaces && declarationIsSpaces) {
      indentationUnit = indentationDifference(
        selectorIndent,
        declarationIndent,
        SPACE
      );
    } else if (selectorIsTabs && declarationIsTabs) {
      indentationUnit = indentationDifference(
        selectorIndent,
        declarationIndent,
        TAB
      );
    } else {
      const unit =
        declarationIndent[declarationIndent.length - 1] === TAB ? TAB : SPACE;

      const minimum = unit === TAB ? 1 : 2;

      // Figure out the relative indentation level of the declarations.
      indentationUnit = indentationDifference(
        declarationIndent.replace(TAB, FOUR_SPACES),
        selectorIndent.replace(TAB, FOUR_SPACES),
        unit,
        minimum
      );
    }
  }

  return {
    selector: selectorIndent,
    declaration: declarationIndent,
    indentationUnit,
  };
}

function indentationDifference(
  selectorIndent: string,
  declarationIndent: string,
  unit: string,
  minimum: number = 0
): string {
  const number = Math.max(
    minimum,
    declarationIndent.length - selectorIndent.length
  );
  return unit.repeat(number);
}

module.exports = {
  skipWhitespace,
  findSemicolon,
  findToken,
  findDeclarationClose,
  getOffsetText,
  getTokenText,
  normalizeTokenText,
  getSelectorOffset,
  isDeclarationClose,
  determineIndentionStrategy,
};
