const elementRules = require("./reducers/element-rules");

module.exports = {
  getStyleSheets: elementRules.getStyleSheets,
  getAllRules: elementRules.getAllRules,
  getMatchedRuleIds: elementRules.getMatchedRuleIds,
  getMatchedRules: elementRules.getMatchedRules,
  getRule: elementRules.getRule,
  getStyleSheet: elementRules.getStyleSheet,
  getDeclaration: elementRules.getDeclaration,
  getIsEditingName: elementRules.getIsEditingName,
  getIsEditingValue: elementRules.getIsEditingValue,
  getDeclarationHeirarchy: elementRules.getDeclarationHeirarchy,
  getEditingDeclaration: elementRules.getEditingDeclaration,
  getEditingDeclarationID: elementRules.getEditingDeclarationID,
  getDeclarationHeirarchy: elementRules.getDeclarationHeirarchy,
  getEditingDeclaration: elementRules.getEditingDeclaration,
  getEditingDeclarationKeyPath: elementRules.getEditingDeclarationKeyPath,
  getDeclarationKeyPath: elementRules.getDeclarationKeyPath,
  getEditingRule: elementRules.getEditingRule,
  getEditingStyleSheet: elementRules.getEditingStyleSheet,
  getStyleSheetIndex: elementRules.getStyleSheetIndex,
};
