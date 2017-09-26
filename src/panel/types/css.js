// @flow
import type { TextOffset } from './parsing';

/**
 * This file contains a list of types that represent objects and information in the
 * CSS Object Model (CSSOM).
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
 */

// These are indexes that are statically incremented from zero for each instance.
export type MediaQueryRuleId = number;
export type RuleId = number;
export type DeclarationId = number;

/**
 * Represents a CSSMediaRule.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSMediaRule
 */
export type MediaQueryRule = {|
  id: MediaQueryRuleId,
  // The text of the condition of the rule, e.g. "@media screen and (min-width: 1200px)"
  condition: string | null,
  // The rules that make up the media query.
  rules: Rule[] | null,
|};

/**
 * TODO - I think the intent here was to provide information about the indentation
 * of a given rule.
 */
export type IndentationStrategy = {
  selector: string,
  declaration: string,
  indentationUnit: string,
};

/**
 * Represents a CSSStyleRule.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule
 */
export type Rule = {|
  id: RuleId,
  // The selector text for the rule
  selector: string,
  // The text offsets of the stylesheet's entire text source.
  offsets: {
    selector: TextOffset,
    text: TextOffset,
  },
  declarations: Declaration[],
  whitespace: {
    beforeSelector: string,
    afterSelector: string,
  },
  indentation: IndentationStrategy,
|};

/**
 * Represents a CSSStyleDeclaration.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
 */
export type Declaration = {
  // A unique id that increments from 0.
  id: DeclarationId,
  // The name of the declaration, e.g. "margin" or "padding-top".
  name: string,
  // The entire text of the declaration.
  text: string,
  // The value of the declaration, e.g. "0px" or "1px solid red".
  value: string,
  // The text offsets of the stylesheet's entire text source.
  offsets: {
    // The entire declaration.
    text: TextOffset,
    name: TextOffset,
    value: TextOffset,
  },
  // This is a description of the whitespace surrounding the declaration.
  // This is an attempt to preserve the original source structure.
  whitespace: {
    beforeName: string,
    afterName: string,
    beforeValue: string,
    afterValue: string,
  },
};
