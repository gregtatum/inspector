const {actions} = require("../constants");
const {
  getStyleSheetRuleDeclaration,
  idMatcher
} = require("../utils/accessors.js");
const {parseOnlyDeclarations} = require("../parser");
const {List, Map} = require("immutable");

const handlers = {};

const DEFAULT_STATE = Map({
  // DOMNode
  element: null,
  // [ Rule, ... ]
  matchedRuleIDs: List(),
  // [ StyleSheet, ... ]
  styleSheets: List(),
  // { style, rule, declaration }
  editingDeclarationKeyPath: null,
  isEditingName: false,
  isEditingValue: false,
  updateQueue: Promise.resolve()
});

function _idMatcher(id) {
  return item => item.get("id") === id;
}

handlers[actions.EDIT_DECLARATION_NAME] = function(state, action) {
  return state.merge({
    editingDeclarationKeyPath: action.keyPath,
    isEditingName: true,
    isEditingValue: false
  });
};

handlers[actions.EDIT_DECLARATION_VALUE] = function(state, action) {
  return state.merge({
    editingDeclarationKeyPath: action.keyPath,
    isEditingName: false,
    isEditingValue: true
  });
};

handlers[actions.STOP_EDITING_DECLARATION] = function(state, action) {
  return state.merge({
    editingDeclarationKeyPath: null,
    isEditingName: false,
    isEditingValue: false
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

function update(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actions.ADD_STYLE_SHEET:
      return state.updateIn(
        ["styleSheets"],
        styleSheets => styleSheets.push(action.styleSheet)
      );

    case actions.SET_FOCUSED_ELEMENT:
      const {element, matchedRuleIDs} = action;
      return state.merge({element, matchedRuleIDs});

    case actions.TAB_THROUGH_DECLARATIONS:
      return state.merge({
        isEditingName: action.isEditingName,
        isEditingValue: action.isEditingValue,
        editingDeclarationKeyPath: action.keyPath
      });
  }

  let handle = handlers[action.type];
  if (handle) {
    return handle(state, action);
  }
  return state;
}

// --------------------------------------------

function getStyleSheets(state) {
  return state.elementRules.get("styleSheets");
}

function getAllRules(state) {
  return List(
    getStyleSheets(state)
      .map(styleSheet => styleSheet.get("rules"))
      .reduce((a, b) => ([...a, ...b]), [])
  );
}

function getMatchedRuleIds(state) {
  return state.elementRules.get("matchedRuleIDs");
}

function getMatchedRules(state) {
  return getMatchedRuleIds(state).map(id => getRule(state, id));
}

function getStyleSheet(state, styleSheetID) {
  // Bail out early if no styleSheet is being requested
  if (!styleSheetID) {
    return null;
  }

  return getStyleSheets(state).find(_idMatcher(styleSheetID));
}

function getRule(state, ruleID, styleSheetID) {
  // Bail out early if no rule is being requested
  if (!ruleID) {
    return null;
  }

  if (ruleID && styleSheetID) {
    const styleSheet = getStyleSheet(state, styleSheetID);
    return styleSheet.get("rules").find(_idMatcher(ruleID));
  }
  for (let styleSheet of getStyleSheets(state)) {
    const rule = styleSheet.get("rules").find(_idMatcher(ruleID));
    if (rule) {
      return rule;
    }
  }
}

function getDeclaration(state, declarationID, ruleID, styleSheetID) {
  // Bail out early if no declaration is being requested
  if (!declarationID) {
    return null;
  }
  return state.elementRules(getDeclarationKeyPath.apply(this, arguments));
}

function getIsEditingName(state) {
  return state.elementRules.get("isEditingName");
}

function getIsEditingValue(state) {
  return state.elementRules.get("isEditingValue");
}

function getDeclarationHeirarchy(state, declarationID) {
  for (let styleSheet of getStyleSheets(state)) {
    for (let rule of styleSheet.get("rules")) {
      for (let declaration of rule.get("declarations")) {
        if (declaration.get("id") === declarationID) {
          return {styleSheet, rule, declaration};
        }
      }
    }
  }
}

function getEditingDeclaration(state) {
  const keyPath = getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath)
    : null;
}

function getEditingRule(state) {
  const keyPath = getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath.slice(0, 4))
    : null;
}

function getEditingStyleSheet(state) {
  const keyPath = getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath.slice(0, 2))
    : null;
}

function getEditingDeclarationKeyPath(state) {
  return state.elementRules.get("editingDeclarationKeyPath");
}

/**
 * Either match an ID, or do a depth first search to find the keypath.
 */
function _getKeyPathByIdOrSearch(keyPath, parent, keys) {
  if (keys.length === 0) {
    return keyPath;
  }
  const key = keys[0];
  const id = keys[1];
  const nextKeys = keys.slice(2, keys.length);
  const children = parent.get(key);

  if (id) {
    const index = children.findIndex(idMatcher(id));
    const child = children.get(index);
    return _getKeyPathByIdOrSearch(keyPath.concat([key, index]), child, nextKeys);
  } else {
    return children.reduce((result, child, index) => {
      return result ?
        result :
        _getKeyPathByIdOrSearch(keyPath.concat([key, index]), child, nextKeys);
    }, null);
  }
}

function getDeclarationKeyPath(state, declarationID, ruleID, styleSheetID) {
  const keys = [
    "styleSheets", styleSheetID,
    "rules", ruleID,
    "declarations", declarationID
  ];

  return List(_getKeyPathByIdOrSearch([], state.elementRules, keys));
}

module.exports = {
  update,
  getStyleSheets,
  getAllRules,
  getMatchedRuleIds,
  getMatchedRules,
  getStyleSheet,
  getRule,
  getDeclaration,
  getDeclarationHeirarchy,
  getEditingDeclaration,
  getEditingRule,
  getEditingStyleSheet,
  getEditingDeclarationKeyPath,
  getDeclarationKeyPath,
  getIsEditingName,
  getIsEditingValue
};
