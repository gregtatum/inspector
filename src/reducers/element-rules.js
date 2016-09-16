const {actions} = require("../constants");
const {
  findNextDeclaration,
  getRuleDeclaration,
  getRule,
  getStyleSheetRuleDeclaration,
  idMatcher
} = require("../utils/accessors.js");
const {parseStyleSheet, parseOnlyDeclarations} = require("../parser");
const {getStyleSheetID} = require("../utils/ids");
const {List, Map, fromJS} = require("immutable");

const handlers = {};

const DEFAULT_STATE = Map({
  // DOMNode
  element: null,
  // [ Rule, ... ]
  matchedRules: List(),
  // [ StyleSheet, ... ]
  styleSheets: List(),
  // { style, rule, declaration }
  editing: null,
  isEditingName: false,
  isEditingValue: false,
  updateQueue: Promise.resolve()
});

handlers[actions.ADD_STYLE_SHEET] = function(state, {cssStyleSheet, text}) {
  const id = getStyleSheetID();
  const rules = fromJS(parseStyleSheet(text));
  return state.updateIn(
    ["styleSheets"],
    styleSheets => styleSheets.push(Map({
      id,
      cssStyleSheet,
      rules,
      text,
    }))
  );
};

handlers[actions.SET_FOCUSED_ELEMENT] = function(state, action) {
  const {element} = action;
  const matchedRules = List([
    ...state.get("styleSheets")
      .map(styleSheet => matchRules(styleSheet.get("rules"), element))
      // Flatten the rules.
      .reduce((a, b) => ([...a, ...b]), [])
      // Hack to make the stylesheet in the correct order
      .reverse()
  ]);

  return state.merge({element, matchedRules});
};

handlers[actions.EDIT_DECLARATION_NAME] = function(state, action) {
  const {rule, declaration} = action;

  return state.merge({
    editing: Map({
      rule: rule.get("id"),
      declaration: declaration.get("id")
    }),
    isEditingName: true,
    isEditingValue: false
  });
};

handlers[actions.EDIT_DECLARATION_VALUE] = function(state, action) {
  const {rule, declaration} = action;
  return state.merge({
    editing: Map({rule: rule.get("id"), declaration: declaration.get("id")}),
    isEditingName: false,
    isEditingValue: true
  });
};

handlers[actions.STOP_EDITING_DECLARATION] = function(state, action) {
  return state.merge({
    editing: null,
    isEditingName: false,
    isEditingValue: false
  });
};

handlers[actions.TAB_THROUGH_DECLARATIONS] = function(state, action) {
  const {direction} = action;
  const styleSheets = state.get("styleSheets");
  const isEditingName = state.get("isEditingName");
  const isEditingValue = state.get("isEditingValue");
  const matchedRuleIDs = state.get("matchedRules");

  // Assert that the state is correct for this type of action.
  console.assert(isEditingName !== isEditingValue, "Is editing either name or value.");
  console.assert(Boolean(state.get("editing")), "Is editing something.");

  const {rule, declaration} = getRuleDeclaration(styleSheets, state.get("editing"));
  const matchedRules = matchedRuleIDs.map(id => getRule(styleSheets, id));

  // The declaration won't change, so flip editing the name and value.
  if ((direction === 1 && isEditingName) || (direction === -1 && isEditingValue)) {
    return state.merge({
      isEditingName: !isEditingName,
      isEditingValue: !isEditingValue,
    });
  }

  // The declaration is different, find the next in the proper direction.
  const next = findNextDeclaration(direction, matchedRules, rule, declaration);
  const hasNext = Boolean(next);

  return state.merge({
    isEditingName: !isEditingName && hasNext,
    isEditingValue: !isEditingValue && hasNext,
    editing: next
  });
};

handlers[actions.UPDATE_DECLARATION] = function(state, action) {
  const {declarationID, key, value} = action;
  const styleSheets = state.get("styleSheets");
  const {styleSheet, rule, declaration} = getStyleSheetRuleDeclaration(styleSheets,
                                                                       declarationID);

  // Update the rules.
  const offset = declaration.get("offsets").get(key);
  const text = replaceTextInOffset(styleSheet.get("text"), value, offset);
  const offsetRules = updateRuleOffsets(styleSheet.get("rules"), offset, value.length);
  const rules = updateDeclarationInRules(offsetRules, rule.get("id"), declarationID, key,
                                         value);

  // Update the stylesheet.
  // TODO - Handle external stylesheets.
  let cssStyleSheet = styleSheet.get("cssStyleSheet");
  const cssStyleSheetIndex = [...document.styleSheets].indexOf(cssStyleSheet);
  cssStyleSheet.ownerNode.innerHTML = text;
  cssStyleSheet = document.styleSheets[cssStyleSheetIndex];

  // Set the new list of stylesheets.
  return state.mergeIn(
    ["styleSheets", styleSheets.indexOf(styleSheet)],
    {text, rules, cssStyleSheet}
  );
};

handlers[actions.ADD_TO_UPDATE_QUEUE] = function(state, action) {
  const {updateQueue} = action;
  return state.merge({updateQueue});
};

handlers[actions.PASTE_DECLARATIONS] = function(state, action) {
  // Select everything first to make the update steps easier to understand.
  const {declaration, text} = action;
  const declarationID = declaration.get("id");
  const textOffset = declaration.getIn(["offsets, text"]);
  const styleSheets = state.get("styleSheets");
  const {styleSheet, rule} = getStyleSheetRuleDeclaration(styleSheets, declarationID);
  const styleSheetID = styleSheet.get("id");
  const rules = styleSheet.get("rules");
  const ruleIndex = rules.indexOf(rule);
  const declarationIndex = rule.indexOf(declaration);

  let newDeclarations;
  let newRules;

  try {
    newDeclarations = parseOnlyDeclarations(text);
  } catch (e) {
    return state;
  }

  if (newDeclarations.length === 0) {
    return state;
  }

  // Adjust the offsets to be at the same place as the targeted declaration.
  // The offsets will be 1 off because a "{" was added to the lexing, so subtract
  // by one when updating them.
  newDeclarations = newDeclarations.map(newDeclaration => {
    return updateOffsets(newDeclaration, 0, textOffset.get(0) - 1);
  });

  // Update the rule offsets.
  newRules = updateRuleOffsets(rules, textOffset, text.length)
    // Splice in the new declarations.
    .updateIn([ruleIndex, declarationIndex], declarations => {
      return declarations.splice(declarationIndex, 1, ...newDeclarations);
    });

  return state.updateIn(
    ["styleSheets", styleSheetID, "rules"],
    newRules
  );
};

function matchRules(rules, element) {
  if (!element) {
    return [];
  }
  return rules.reduce((matches, rule) => {
    if (rule.condition) {
      return matchMediaQuery(matches, rule, element);
    }
    return matchCSSRule(matches, rule, element);
  }, []);
}

function matchMediaQuery(matches, rule, element) {
  if (window.matchMedia(rule.get("condition"))) {
    const childRules = matchRules(rule.get("rules"), element);
    if (childRules) {
      return matches.concat(childRules);
    }
  }
  return matches;
}

function matchCSSRule(matches, rule, element) {
  // Walk up the tree, and see if anything above it matches.
  do {
    if (element.matches(rule.get("selector"))) {
      matches.push(rule.get("id"));
      return matches;
    }
    element = element.parentElement;
  } while (element);

  return matches;
}

function replaceTextInOffset(text, value, offset) {
  return (
    text.substring(0, offset.get(0)) +
    value +
    text.substring(offset.get(1), text.length - 1)
  );
}

function updateRuleOffsets(rules, originalOffset, length) {
  const start = originalOffset.get(0);
  const end = originalOffset.get(1);
  const changeInLength = length - (end - start);

  return rules.map(rule => rule.merge({
    offsets: updateOffsets(rule, start, changeInLength),
    declarations: rule.get("declarations").map(declaration => {
      return declaration.merge({
        offsets: updateOffsets(declaration, start, changeInLength)
      });
    }),
  }));
}

function updateOffsets(object, start, changeInLength) {
  return object.get("offsets").map(offset => updateOffset(offset, start, changeInLength));
}

function updateOffset(offset, start, changeInLength) {
  const offset0 = offset.get(0);
  const offset1 = offset.get(1);
  if (offset0 > start || offset1 > start) {
    return List([
      offset0 > start ? offset0 + changeInLength : offset0,
      offset1 > start ? offset1 + changeInLength : offset1
    ]);
  }
  return offset;
}

function updateDeclarationInRules(rules, ruleID, declarationID, key, value) {
  const ruleIndex = rules.findIndex(idMatcher(ruleID));
  const declarationIndex = rules
    .get(ruleIndex)
    .get("declarations")
    .findIndex(idMatcher(declarationID));

  const keyPath = [ruleIndex, "declarations", declarationIndex, key];

  return rules.setIn(keyPath, value);
}

module.exports = function(state = DEFAULT_STATE, action) {
  let handle = handlers[action.type];
  if (handle) {
    return handle(state, action);
  }
  return state;
};
