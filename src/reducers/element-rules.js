const {actions} = require('../constants');
const parseStyleSheet = require("../parser");
const {
  styleSheetFromRule,
  findNextDeclaration,
  getRuleDeclaration,
  getRule,
  getDeclaration,
  getStyleSheet,
  getStyleSheetRuleDeclaration
} = require('../utils/accessors.js');
const {getStyleSheetID} = require("../utils/ids")

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
  updateQueue: Promise.resolve()
}

handlers[actions.ADD_STYLE_SHEET] = function (state, {styleSheet, text}) {
  const {styleSheets, element} = state;
  return set(state, {
    styleSheets: [...styleSheets, {
      id: getStyleSheetID(),
      cssStyleSheet: styleSheet,
      rules: parseStyleSheet(text),
      text,
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
        // Hack to make the stylesheet in the correct order
        .reverse()
    ]
  })
};

handlers[actions.EDIT_DECLARATION_NAME] = function (state, action) {
  const {rule, declaration} = action;

  return set(state, {
    editing: { rule: rule.id, declaration: declaration.id },
    isEditingName: true,
    isEditingValue: false
  });
}

handlers[actions.EDIT_DECLARATION_VALUE] = function (state, action) {
  const {rule, declaration} = action;
  return set(state, {
    editing: { rule: rule.id, declaration: declaration.id },
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
  const {isEditingName, isEditingValue, matchedRules: matchedRuleIDs} = state;

  // Assert that the state is correct for this type of action.
  console.assert(isEditingName !== isEditingValue, "Is editing either name or value.");
  console.assert(Boolean(state.editing), "Is editing something.");

  const {rule, declaration} = getRuleDeclaration(state.styleSheets, state.editing);
  const matchedRules = matchedRuleIDs.map(id => getRule(state.styleSheets, id));

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
/*
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
*/
handlers[actions.UPDATE_DECLARATION] = function(state, action) {
  const {declarationID, key, value} = action;
  const {styleSheet, rule, declaration} = getStyleSheetRuleDeclaration(state.styleSheets,
                                                                       declarationID);

  // Update the rules.
  const offset = declaration.offsets[key];
  const text = replaceTextInOffset(styleSheet.text, value, offset);
  const offsetRules = updateRuleOffsets(styleSheet.rules, offset, value);
  const rules = updateDeclarationInRules(offsetRules, rule.id, declarationID, key, value);

  // Update the stylesheet.
  // TODO - Handle external stylesheets.
  const cssStyleSheetIndex = [...document.styleSheets].indexOf(styleSheet.cssStyleSheet);
  styleSheet.cssStyleSheet.ownerNode.innerHTML = text;
  const cssStyleSheet = document.styleSheets[cssStyleSheetIndex];

  // Set the new list of stylesheets.
  const newStyleSheet = set(styleSheet, {text, rules, cssStyleSheet});
  const newStyleSheets = updateInArray(state.styleSheets, newStyleSheet, styleSheet.id);
  return set(state, {
    styleSheets: newStyleSheets
  });
}

handlers[actions.ADD_TO_UPDATE_QUEUE] = function(state, action) {
  const {updateQueue} = action;
  return set(state, {updateQueue});
};

function updateInArray(array, value, id = value.id) {
  const element = array.find(element => element.id === id);
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
      matches.push(rule.id);
      return matches
    }
    element = element.parentElement;
  } while (element)

  return matches;
}

function replaceTextInOffset(text, value, [offsetStart, offsetEnd]) {
  return (
    text.substring(0, offsetStart) +
    value +
    text.substring(offsetEnd, text.length - 1)
  );
}

function updateRuleOffsets(rules, [start, end], value) {
  const changeInLength = value.length - (end - start);
  return rules.map(rule => {

    const ruleOffsets = updateOffsets(rule.offsets, start, changeInLength);

    if (ruleOffsets !== rule.offsets) {
      // Update the declaration offsets if needed.
      const declarations = rule.declarations.map(declaration => {
        const offsets = updateOffsets(declaration.offsets, start, changeInLength);
        if (offsets !== declaration.offsets) {
          return set(declaration, {offsets});
        }
        return declaration;
      });

      return set(rule, {declarations, offsets: ruleOffsets});
    }
    return rule;
  });
}

function updateOffsets (oldOffsets, start, changeInLength) {
  let newOffsets;
  for (var key in oldOffsets) {
    if (oldOffsets.hasOwnProperty(key)) {
      const oldOffset = oldOffsets[key];
      const newOffset = updateOffset(oldOffset, start, changeInLength);
      // Check to see if the offsets were updated.
      if (oldOffset !== newOffset) {
        if (!newOffsets) {
          newOffsets = Object.assign({}, oldOffsets);
        }
        newOffsets[key] = newOffset;
      }
    }
  }

  // Only return new offsets if they were updated.
  return newOffsets ? newOffsets : oldOffsets;
}

function updateOffset(offset, start, changeInLength) {
  if (offset[0] > start || offset[1] > start) {
    return [
      offset[0] > start ? offset[0] + changeInLength : offset[0],
      offset[1] > start ? offset[1] + changeInLength : offset[1]
    ];
  }
  return offset;
}

function updateDeclarationInRules(rules, ruleID, declarationID, key, value) {
  const oldRule = rules.find(rule => rule.id === ruleID);
  const oldDeclaration = oldRule.declarations.find(declaration => declaration.id === declarationID);
  const update = {};
  update[key] = value;
  const declaration = set(oldDeclaration, update);
  const declarations = updateInArray(oldRule.declarations, declaration)
  const rule = set(oldRule, {declarations})

  return updateInArray(rules, rule);
}

module.exports = function (state = DEFAULT_STATE, action) {
  let handle = handlers[action.type];
  if (handle) {
    return handle(state, action);
  }
  return state;
};
