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
  // Set the new list of stylesheets.
  const {styleSheetIndex, text, rules, cssStyleSheet} = action;
  return state.mergeIn(
    ["styleSheets", styleSheetIndex],
    {text, rules, cssStyleSheet}
  );
};

handlers[actions.ADD_TO_UPDATE_QUEUE] = function(state, action) {
  const {updateQueue} = action;
  return state.merge({updateQueue});
};

handlers[actions.REPLACE_STYLESHEET_RULES] = function(state, action) {
  return state.setIn(
    ["styleSheets", action.styleSheetIndex, "rules"],
    action.rules
  );
};

handlers[actions.ADD_STYLE_SHEET] = function(state, action) {
  return state.updateIn(
    ["styleSheets"],
    styleSheets => styleSheets.push(action.styleSheet)
  );
};

handlers[actions.SET_FOCUSED_ELEMENT] = function(state, action) {
  const {element, matchedRuleIDs} = action;
  return state.merge({element, matchedRuleIDs});
};

handlers[actions.TAB_THROUGH_DECLARATIONS] = function(state, action) {
  return state.merge({
    isEditingName: action.isEditingName,
    isEditingValue: action.isEditingValue,
    editingDeclarationKeyPath: action.keyPath
  });
};

function update(state = DEFAULT_STATE, action) {
  const handle = handlers[action.type];
  if (handle) {
    return handle(state, action);
  }
  return state;
}

// --------------------------------------------

function getStyleSheets(state) {
  return state.elementRules.get("styleSheets");
}

function getStyleSheetIndex(state, styleSheet) {
  return getStyleSheets(state).indexOf(styleSheet);
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
  getIsEditingValue,
  getStyleSheetIndex
};
