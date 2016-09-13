const {DOM: {div}, createClass, createFactory} = require("react");
const Rule = createFactory(require("./rule"));
const OffsetTransitionGroup = createFactory(require("./offset-transition-group"));

const RulesSidebar = createClass({
  displayName: "RulesSidebar",

  render() {
    const {
      rules,
      ruleProps
    } = this.props;

    const transition = {
      transitionName: "rule",
      transitionAppearOffset: 100,
      transitionEnterTimeout: 200,
      transitionLeaveTimeout: 300,
    };

    return div({ className: "rules-sidebar" },
      OffsetTransitionGroup(transition,
        ...rules.map((rule, i) => Rule(
          Object.assign({}, {rule, key: rule.id}, ruleProps)
        ))
      )
    )
  }
});

module.exports = RulesSidebar;
