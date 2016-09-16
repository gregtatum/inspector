let styleSheetID = 0;
let ruleID = 0;
let mediaQueryRuleID = 0;
let declarationID = 0;
let revisionID = 0;

module.exports = {
  getMediaQueryRuleID: () => "media-query-rule-" + mediaQueryRuleID++,
  getRuleID: () => "rule-" + ruleID++,
  getDeclarationID: () => "declaration-" + declarationID++,
  getStyleSheetID: () => "stylesheet-" + styleSheetID++,
  getRevisionID: () => "revision-" + revisionID++,
};
