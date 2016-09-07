const {DOM, createClass, createFactory} = require("react");
const {div} = DOM;
const Rule = createFactory(require('./rule'))

const RulesSidebar = createClass({
  displayName: "RulesSidebar",

  render() {
    const {
      rules,
      ruleProps
    } = this.props;

    return div({ className: "rules-sidebar" },
      ...rules.map((rule, i) => Rule(
        Object.assign({}, {rule}, ruleProps)
      ))
    )
  }
});

module.exports = RulesSidebar;
