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
    declarations: [],
    whitespace: {
      beforeSelector: '',
      afterSelector: '',
    },
    indentation: {
      selector: '',
      declaration: '',
      indentationUnit: '',
    },
  };
}

function createDeclaration(): Declaration {
  return {
    id: getDeclarationID(),
    text: '',
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
