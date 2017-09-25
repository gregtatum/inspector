// @flow
import type { MediaQueryRule, Rule, Declaration } from '../types/css';
import type { Token } from '../types/parsing';

const { normalizeTokenText, getSelectorOffset } = require('./parsing-utils');

const {
  getMediaQueryRuleID,
  getRuleID,
  getDeclarationID,
} = require('../utils/ids');

/**
 * This file contains a list of objects that contain information that are relevant to
 * model the CSS Object Model (CSSOM) from a target browser.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
 */

function createMediaQueryRule(): MediaQueryRule {
  return {
    id: getMediaQueryRuleID(),
    condition: null,
    rules: null,
  };
}

function createRule(token: Token): Rule {
  return {
    // A unique ID
    id: getRuleID(),

    // The selector text prettified.
    selector: normalizeTokenText(token),
    // Start and end text offsets in the stylesheet text.
    offsets: {
      selector: getSelectorOffset(token),
      text: getSelectorOffset(token),
    },
    // Array of declaration objects.
    declarations: null,
    whitespace: {
      beforeSelector: '',
      afterSelector: '',
    },
  };
}

/**
 * Declarations holds information about a CSSStyleDeclaration.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
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
function createDeclaration(): Declaration {
  return {
    id: getDeclarationID(),
    name: '',
    value: '',
    // priority: "",
    // terminator: "",
    // enabled: true,
    offsets: {
      // comment: null,
      text: [0, 0],
      name: [0, 0],
      value: [0, 0],
    },
    whitespace: {
      beforeName: '',
      afterName: '',
      beforeValue: '',
      afterValue: '',
    },
  };
}

module.exports = {
  createMediaQueryRule,
  createRule,
  createDeclaration,
};
