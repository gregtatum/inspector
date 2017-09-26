const { idMatcher } = require('../utils/ids');
const { List } = require('immutable');

// Define the selectors as $ for convenience.
const $ = module.exports;

$.styleSheets = function(state) {
  return state.elementRules.get('styleSheets');
};

$.styleSheetIndex = function(state, styleSheet) {
  return $.styleSheets(state).indexOf(styleSheet);
};

$.allRules = function(state) {
  return List(
    $.styleSheets(state)
      .map(styleSheet => styleSheet.get('rules'))
      .reduce((a, b) => [...a, ...b], [])
  );
};

$.matchedRuleIDs = function(state) {
  return state.elementRules.get('matchedRuleIDs');
};

$.matchedRules = function(state) {
  return $.matchedRuleIDs(state).map(id => $.rule(state, id));
};

$.styleSheet = function(state, styleSheetID) {
  // Bail out early if no styleSheet is being requested
  if (!styleSheetID) {
    return null;
  }

  return $.styleSheets(state).find(idMatcher(styleSheetID));
};

$.rule = function(state, ruleID, styleSheetID) {
  // Bail out early if no rule is being requested
  if (!ruleID) {
    return null;
  }

  if (ruleID && styleSheetID) {
    const styleSheet = $.styleSheet(state, styleSheetID);
    return styleSheet.get('rules').find(idMatcher(ruleID));
  }
  for (const styleSheet of $.styleSheets(state)) {
    const rule = styleSheet.get('rules').find(idMatcher(ruleID));
    if (rule) {
      return rule;
    }
  }
  return null;
};

$.declaration = function(state, declarationID) {
  // Bail out early if no declaration is being requested
  if (!declarationID) {
    return null;
  }
  return state.elementRules.getIn($.declarationKeyPath.apply(this, arguments));
};

$.isEditingName = function(state) {
  return state.elementRules.get('isEditingName');
};

$.isEditingValue = function(state) {
  return state.elementRules.get('isEditingValue');
};

$.declarationHeirarchy = function(state, declarationID) {
  for (const styleSheet of $.styleSheets(state)) {
    for (const rule of styleSheet.get('rules')) {
      for (const declaration of rule.get('declarations')) {
        if (declaration.get('id') === declarationID) {
          return { styleSheet, rule, declaration };
        }
      }
    }
  }
  throw new Error('Could not find declaration by that ID.');
};

$.editingDeclaration = function(state) {
  const keyPath = $.editingDeclarationKeyPath(state);
  return keyPath ? state.elementRules.getIn(keyPath) : null;
};

$.editingRule = function(state) {
  const keyPath = $.editingDeclarationKeyPath(state);
  return keyPath ? state.elementRules.getIn(keyPath.slice(0, 4)) : null;
};

$.editingStyleSheet = function(state) {
  const keyPath = $.editingDeclarationKeyPath(state);
  return keyPath ? state.elementRules.getIn(keyPath.slice(0, 2)) : null;
};

$.editingDeclarationKeyPath = function(state) {
  return state.elementRules.get('editingDeclarationKeyPath');
};

$.updateQueue = function(state) {
  return state.elementRules.get('updateQueue');
};

$.ruleFromSelector = function(state, selector) {
  return $.allRules(state).find(rule => rule.get('selector') === selector);
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
    return getKeyPathByIdOrSearch(
      keyPath.concat([key, index]),
      child,
      nextKeys
    );
  }

  return children.reduce((result, child, index) => {
    return (
      result ||
      getKeyPathByIdOrSearch(keyPath.concat([key, index]), child, nextKeys)
    );
  }, null);
}

$.declarationKeyPath = function(state, declarationID, ruleID, styleSheetID) {
  const keys = [
    'styleSheets',
    styleSheetID,
    'rules',
    ruleID,
    'declarations',
    declarationID,
  ];

  return List(getKeyPathByIdOrSearch([], state.elementRules, keys));
};
