const {idMatcher} = require("../utils/ids");
const {List} = require("immutable");

// Define the selectors as $ for convenience.
const $ = module.exports;

$.getStyleSheets = function(state) {
  return state.elementRules.get("styleSheets");
};

$.getStyleSheetIndex = function(state, styleSheet) {
  return $.getStyleSheets(state).indexOf(styleSheet);
};

$.getAllRules = function(state) {
  return List(
    $.getStyleSheets(state)
      .map(styleSheet => styleSheet.get("rules"))
      .reduce((a, b) => ([...a, ...b]), [])
  );
};

$.getMatchedRuleIDs = function(state) {
  return state.elementRules.get("matchedRuleIDs");
};

$.getMatchedRules = function(state) {
  return $.getMatchedRuleIDs(state).map(id => $.getRule(state, id));
};

$.getStyleSheet = function(state, styleSheetID) {
  // Bail out early if no styleSheet is being requested
  if (!styleSheetID) {
    return null;
  }

  return $.getStyleSheets(state).find(idMatcher(styleSheetID));
};

$.getRule = function(state, ruleID, styleSheetID) {
  // Bail out early if no rule is being requested
  if (!ruleID) {
    return null;
  }

  if (ruleID && styleSheetID) {
    const styleSheet = $.getStyleSheet(state, styleSheetID);
    return styleSheet.get("rules").find(idMatcher(ruleID));
  }
  for (let styleSheet of $.getStyleSheets(state)) {
    const rule = styleSheet.get("rules").find(idMatcher(ruleID));
    if (rule) {
      return rule;
    }
  }
};

$.getDeclaration = function(state, declarationID, ruleID, styleSheetID) {
  // Bail out early if no declaration is being requested
  if (!declarationID) {
    return null;
  }
  return state.elementRules.getIn($.getDeclarationKeyPath.apply(this, arguments));
};

$.getIsEditingName = function(state) {
  return state.elementRules.get("isEditingName");
};

$.getIsEditingValue = function(state) {
  return state.elementRules.get("isEditingValue");
};

$.getDeclarationHeirarchy = function(state, declarationID) {
  for (let styleSheet of $.getStyleSheets(state)) {
    for (let rule of styleSheet.get("rules")) {
      for (let declaration of rule.get("declarations")) {
        if (declaration.get("id") === declarationID) {
          return {styleSheet, rule, declaration};
        }
      }
    }
  }
};

$.getEditingDeclaration = function(state) {
  const keyPath = $.getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath)
    : null;
};

$.getEditingRule = function(state) {
  const keyPath = $.getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath.slice(0, 4))
    : null;
};

$.getEditingStyleSheet = function(state) {
  const keyPath = $.getEditingDeclarationKeyPath(state);
  return keyPath
    ? state.elementRules.getIn(keyPath.slice(0, 2))
    : null;
};

$.getEditingDeclarationKeyPath = function(state) {
  return state.elementRules.get("editingDeclarationKeyPath");
};

$.getUpdateQueue = function(state) {
  return state.elementRules.get("updateQueue");
};

$.findRuleBySelector = function(state, selector) {
  return $.getAllRules(state).find(rule => rule.get("selector") === selector);
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

$.getDeclarationKeyPath = function(state, declarationID, ruleID, styleSheetID) {
  const keys = [
    "styleSheets", styleSheetID,
    "rules", ruleID,
    "declarations", declarationID
  ];

  return List(getKeyPathByIdOrSearch([], state.elementRules, keys));
};
