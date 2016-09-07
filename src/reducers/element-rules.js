const {actions} = require('../constants');
const {styleSheetFromRule, findNextDeclaration} = require('../accessors.js');
const parseStyleSheet = require("../parser");

const set = (a, b) => Object.freeze(Object.assign({}, a, b));
const flatten = (a, b) => ([...a, ...b]);

const handlers = {};

const DEFAULT_STATE = {
  // DOMNode
  element: null,
  // [ Rule, ... ]
  matchedRules: [],
  // [ StyleSheet, ... ]
  styleSheets: [],
  // { style, rule, declaration }
  editing: null,
  isEditingName: false,
  isEditingValue: false,
}

handlers[actions.ADD_STYLE_SHEET] = function (state, {styleSheet}) {
  const {styleSheets, matchedRules, element} = state;
  return set(state, {
    styleSheets: [...styleSheets, {
      CSSStyleSheet: styleSheet,
      rules: parseStyleSheet(styleSheet.ownerNode.innerText),
      matchedRules: [...matchedRules, ...matchRules(styleSheet.rules, element)]
    }]
  });
};

handlers[actions.SET_FOCUSED_ELEMENT] = function (state, action) {
  const {element} = action;
  const {styleSheets} = state;
  return set(state, {
    element,
    matchedRules: [
      ...styleSheets
        .map(sheet => matchRules(sheet.rules, element))
        .reduce(flatten, [])
    ]
  })
};

handlers[actions.EDIT_DECLARATION_NAME] = function (state, action) {
  const {rule, declaration} = action;

  return set(state, {
    editing: { rule, declaration },
    isEditingName: true,
    isEditingValue: false
  });
}

handlers[actions.EDIT_DECLARATION_VALUE] = function (state, action) {
  const {rule, declaration} = action;
  return set(state, {
    editing: { rule, declaration },
    isEditingName: false,
    isEditingValue: true
  });
}

handlers[actions.STOP_EDITING_DECLARATION] = function (state, action) {
  return set(state, {
    editing: null,
    isEditingName: false,
    isEditingValue: false
  });
}

handlers[actions.TAB_THROUGH_DECLARATIONS] = function(state, action) {
  const {direction} = action;
  const {isEditingName, isEditingValue, matchedRules} = state;
  const {rule, declaration} = state.editing;

  // Assert that the state is correct for this type of action.
  console.assert(isEditingName !== isEditingValue, "Is editing either name or value.");
  console.assert(Boolean(state.editing), "Is editing something.");

  // The declaration won't change, so flip editing the name and value.
  if ((direction === 1 && isEditingName) || (direction === -1 && isEditingValue)) {
    return set(state, {
      isEditingName: !isEditingName,
      isEditingValue: !isEditingValue,
    });
  }

  // The declaration is different, find the next in the proper direction.
  const next = findNextDeclaration(direction, matchedRules, rule, declaration);
  const hasNext = Boolean(next);

  return set(state, {
    isEditingName: !isEditingName && hasNext,
    isEditingValue: !isEditingValue && hasNext,
    editing: next
  });
};

handlers[actions.UPDATE_DECLARATION] = function(state, action) {
  // const {styleSheet, rule, declaration, value} = action;
  const originalStyleSheet = styleSheetFromRule(state.styleSheets, action.rule);

  const declaration = set(action.declaration, action.update);
  const declarations = updateInArray(action.rule.declarations, declaration);
  const rule = set(action.rule, {declarations});
  const rules = updateInArray(originalStyleSheet.rules, rule);
  const styleSheet = set(originalStyleSheet, {rules});
  const styleSheets = updateInArray(state.styleSheets, styleSheet);

  return set(state, {styleSheets});
}

function updateInArray (array, value) {
  const element = array.find(element => element.id === value.id);
  if (!element) {
    throw new Error("Element was not found in the array.");
  }
  const newArray = [...array];
  newArray[array.indexOf(element)] = value;
  return newArray;
}

function matchRules(rules, element) {
  if (!element) {
    return [];
  }
  return Array.prototype.reduce.call(rules, (matches, rule) => {
    if(rule.condition) {
      return matchMediaQuery(matches, rule);
    } else {
      return matchCSSRule(matches, rule, element);
    }
  }, []);
};

function matchMediaQuery(matches, rule) {
  if (window.matchMedia(rule.condition)) {
    const childRules = matchRules(rule.rules, element)
    if (childRules) {
      return matches.concat(childRules);
    }
  }
  return matches;
}

function matchCSSRule(matches, rule, element) {
  // Walk up the tree, and see if anything above it matches.
  do {
    if (element.matches(rule.selector)) {
      matches.push(rule);
      return matches
    }
    element = element.parentElement;
  } while (element)

  return matches;
}

module.exports = function (state = DEFAULT_STATE, action) {
  let handle = handlers[action.type];
  if (handle) {
    return handle(state, action);
  }
  return state;
};
