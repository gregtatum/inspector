const {idMatcher} = require("../utils/ids");
const {List} = require("immutable");

const selectors = module.exports;

selectors.getStyleSheets = function(state) {
  return state.elementRules.get("styleSheets");
};

selectors.getStyleSheetIndex = function(state, styleSheet) {
  return selectors.getStyleSheets(state).indexOf(styleSheet);
};

selectors.getAllRules = function(state) {
  return List(
    selectors.getStyleSheets(state)
      .map(styleSheet => styleSheet.get("rules"))
      .reduce((a, b) => ([...a, ...b]), [])
  );
};

selectors.getMatchedRuleIDs = function(state) {
  return state.elementRules.get("matchedRuleIDs");
};

selectors.getMatchedRules = function(state) {
  return selectors.getMatchedRuleIDs(state).map(id => selectors.getRule(state, id));
};

selectors.getStyleSheet = function(state, styleSheetID) {
  // Bail out early if no styleSheet is being requested
  if (!styleSheetID) {
    return null;
  }

  return selectors.getStyleSheets(state).find(idMatcher(styleSheetID));
};

selectors.getRule = function(state, ruleID, styleSheetID) {
  // Bail out early if no rule is being requested
  if (!ruleID) {
    return null;
  }

  if (ruleID && styleSheetID) {
    const styleSheet = selectors.getStyleSheet(state, styleSheetID);
    return styleSheet.get("rules").find(idMatcher(ruleID));
  }
  for (let styleSheet of selectors.getStyleSheets(state)) {
    const rule = styleSheet.get("rules").find(idMatcher(ruleID));
    if (rule) {
      return rule;
    }
  }
};

selectors.getDeclaration = function(state, declarationID, ruleID, styleSheetID) {
  // Bail out early if no declaration is being requested
  if (!declarationID) {
    return null;
  }
  return state.elementRules.getIn(selectors.getDeclarationKeyPath.apply(this, arguments));
};

selectors.getIsEditingName = function(state) {
  return state.elementRules.get("isEditingName");
};

selectors.getIsEditingValue = function(state) {
  return state.elementRules.get("isEditingValue");
};

selectors.getDeclarationHeirarchy = function(state, declarationID) {
  for (let styleSheet of selectors.getStyleSheets(state)) {
    for (let rule of styleSheet.get("rules")) {
      for (let declaration of rule.get("declarations")) {
        if (declaration.get("id") === declarationID) {
          return {styleSheet, rule, declaration};
        }
      }
    }
  }
};

selectors.getEditingDeclaration = function(state) {
  const keyPath = selectors.getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath)
    : null;
};

selectors.getEditingRule = function(state) {
  const keyPath = selectors.getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath.slice(0, 4))
    : null;
};

selectors.getEditingStyleSheet = function(state) {
  const keyPath = selectors.getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath.slice(0, 2))
    : null;
};

selectors.getEditingDeclarationKeyPath = function(state) {
  return state.elementRules.get("editingDeclarationKeyPath");
};

selectors.getUpdateQueue = function(state) {
  return state.elementRules.get("updateQueue");
};

selectors.findRuleBySelector = function(state, selector) {
  return selectors.getAllRules(state).find(rule => rule.get("selector") === selector);
};

/**
 * Either match an ID, or do a depth first search to find the keypath.
 */
function getKeyPathByIdOrSearch(keyPath, parent, keys) {
  if (keys.length === 0) {
    return keyPath;
  }
  const [key, id] = keys;
  const nextKeys = keys.slice(2, keys.length);
  const children = parent.get(key);

  if (id) {
    const index = children.findIndex(idMatcher(id));
    if (index === -1) {
      return null;
    }
    const child = children.get(index);
    return getKeyPathByIdOrSearch(keyPath.concat([key, index]), child, nextKeys);
  }

  return children.reduce((result, child, index) => {
    return result ||
      getKeyPathByIdOrSearch(keyPath.concat([key, index]), child, nextKeys);
  }, null);
}

selectors.getDeclarationKeyPath = function(state, declarationID, ruleID, styleSheetID) {
  const keys = [
    "styleSheets", styleSheetID,
    "rules", ruleID,
    "declarations", declarationID
  ];

  return List(getKeyPathByIdOrSearch([], state.elementRules, keys));
};
