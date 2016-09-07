const {
  normalizeTokenText,
  getSelectorOffset
} = require('./parsing-utils')

let ruleId = 0;
let mediaQueryRuleId = 0;
let declarationId = 0;

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
 * @property {string}  id               - A unique id that increments from 0.
 * @property {string}  condition - The text of the condition of the rule.
 *                                   e.g. "@media screen and (min-width: 1200px)"
 * @property {array}   rules     - The rules that make up the media query.
 */
function MediaQueryRule() {
  this.id = "media-query-rule-" + mediaQueryRuleId++;
  this.condition = null;
  this.rules = null;
}

/**
 * Rule holds information about a CSSStyleRule.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule
 *
 * @property {string} id               - A unique id that increments from 0.
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
  // A unique ID
  this.id = "rule-" + ruleId++;

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
 * @property {string} id            - A unique id that increments from 0.
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
  this.id = "declaration-" + declarationId++;
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
