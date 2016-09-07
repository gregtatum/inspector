function styleSheetFromRule(styleSheets, rule) {
  return styleSheets.find(styleSheet => {
    return styleSheet.rules.find(ruleB => ruleB.id === rule.id);
  });
}

function findNextDeclaration(direction, rules, rule, declaration) {
  // The declaration can be undefined if the last searched rule did not have
  // any declarations.
  if (declaration) {
    const nextDeclarationIndex = direction + rule.declarations.indexOf(declaration);

    if (nextDeclarationIndex >= 0 && nextDeclarationIndex < rule.declarations.length) {
      // This rule had more declarations.
      return {rule, declaration: rule.declarations[nextDeclarationIndex]}
    }
  }

  // No more declarations could be found with the current rule, find the next
  // rule and continue searching there.
  const nextRuleIndex = direction + rules.indexOf(rule);

  if (nextRuleIndex >= 0 && nextRuleIndex < rules.length) {
    const nextRule = rules[nextRuleIndex];
    const firstDeclaration = nextRule.declarations[0];

    if (firstDeclaration) {
      return {
        rule: nextRule,
        declaration: firstDeclaration
      }
    }
    // No declarations were found on this rule, start searching the next rule recursively.
    return findNextDeclaration(direction, rules, nextRule);
  }

  // There are no more declarations to be found. Return null.
  return null;
}

module.exports = {
  styleSheetFromRule,
  findNextDeclaration,
}
